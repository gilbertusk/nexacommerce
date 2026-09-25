import { Kafka, logLevel, type Consumer } from 'kafkajs';
import { processWithInbox } from '@nexacommerce/common';
import { createLogger } from '@nexacommerce/logger';
import { config } from '../config';
import { analyticsInbox } from './inbox';
import {
  checkEnvelope,
  projectStreamEvent,
  recordProgress,
  type EnvelopeRejection,
} from '../services/kafka-projection';
import { prisma } from '../prisma/client';

const logger = createLogger('analytics-kafka');

/**
 * Inbox identity for the Kafka projection. It is intentionally different from
 * the RabbitMQ consumer's name: the same domain event arrives over both paths,
 * and each path must be allowed to apply it once to its own tables.
 */
export const ANALYTICS_KAFKA_CONSUMER = 'analytics.kafka';

/** Topics this projection reads. Ordering is preserved per partition. */
export function projectionTopics(prefix: string): string[] {
  return [`${prefix}.orders.v1`, `${prefix}.payments.v1`];
}

interface ProjectionMetrics {
  connected: boolean;
  messagesProjected: number;
  duplicatesSkipped: number;
  rejected: number;
  failures: number;
  lastEventAt: string | null;
  lastErrorAt: string | null;
}

const metrics: ProjectionMetrics = {
  connected: false,
  messagesProjected: 0,
  duplicatesSkipped: 0,
  rejected: 0,
  failures: 0,
  lastEventAt: null,
  lastErrorAt: null,
};

export function kafkaProjectionMetrics(): ProjectionMetrics {
  return { ...metrics };
}

export function resetKafkaProjectionMetrics(): void {
  metrics.messagesProjected = 0;
  metrics.duplicatesSkipped = 0;
  metrics.rejected = 0;
  metrics.failures = 0;
  metrics.lastEventAt = null;
  metrics.lastErrorAt = null;
}

/** Per-partition lag, computed from the offsets Kafka reports on each message. */
const partitionLag = new Map<string, number>();

export function kafkaProjectionLag(): Record<string, number> {
  return Object.fromEntries(partitionLag);
}

export interface IncomingMessage {
  topic: string;
  partition: number;
  offset: string;
  highWatermark?: string;
  value: Buffer | null;
}

/**
 * Project one Kafka message.
 *
 * Returns the outcome so the caller can decide about the offset. The offset may
 * only advance for `PROJECTED`, `DUPLICATE`, and `REJECTED`; a `FAILED` result
 * means the projection transaction did not commit and the message must be read
 * again.
 */
export async function projectMessage(
  message: IncomingMessage,
  consumerGroup: string,
): Promise<'PROJECTED' | 'DUPLICATE' | 'REJECTED' | 'FAILED'> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(message.value?.toString() ?? '');
  } catch (err) {
    recordRejection(message, { reason: 'MALFORMED', detail: 'message body is not valid JSON' });
    return 'REJECTED';
  }

  const checked = checkEnvelope(parsed);
  if (!checked.ok) {
    recordRejection(message, checked.rejection);
    return 'REJECTED';
  }

  const { envelope } = checked;

  try {
    const outcome = await processWithInbox(
      analyticsInbox,
      ANALYTICS_KAFKA_CONSUMER,
      { eventId: envelope.eventId, eventName: envelope.eventName, payload: envelope.payload },
      async (tx) => {
        await projectStreamEvent(tx, envelope);
        await recordProgress(tx, {
          consumerGroup,
          topic: message.topic,
          partition: message.partition,
          offset: message.offset,
          eventAt: new Date(envelope.occurredAt),
        });
      },
    );

    metrics.lastEventAt = envelope.occurredAt;
    if (outcome === 'SKIPPED_DUPLICATE') {
      metrics.duplicatesSkipped += 1;
      return 'DUPLICATE';
    }
    metrics.messagesProjected += 1;
    return 'PROJECTED';
  } catch (err: any) {
    // The transaction rolled back, so nothing was projected. Leaving the offset
    // where it is means this message is read again, which is what makes
    // "commit the offset only after the projection commits" true in practice.
    metrics.failures += 1;
    metrics.lastErrorAt = new Date().toISOString();
    logger.error(
      `Projection failed for ${message.topic}/${message.partition}@${message.offset}: ${err.message}`,
    );
    return 'FAILED';
  }
}

/**
 * Record a permanently unprocessable message and step over it.
 *
 * Retrying an unsupported schema or malformed body forever would stall the
 * partition and block every well-formed event behind it, so the message is
 * recorded and the offset advances. The counter is what an alert should watch.
 */
function recordRejection(message: IncomingMessage, rejection: EnvelopeRejection): void {
  metrics.rejected += 1;
  metrics.lastErrorAt = new Date().toISOString();
  logger.error(
    `Rejected ${message.topic}/${message.partition}@${message.offset}: ${rejection.reason} - ${rejection.detail}`,
  );
}

/**
 * Record how far behind the log this partition is.
 *
 * `highWatermark` is the offset the next produced record will take, so the
 * number of records still unread after this one is `highWatermark - offset - 1`.
 * Only a batch carries it; a message on its own does not, which is why the
 * consumer reads batches.
 */
export function updateLag(message: IncomingMessage): void {
  if (!message.highWatermark) return;
  const lag = Number(BigInt(message.highWatermark) - BigInt(message.offset) - 1n);
  partitionLag.set(`${message.topic}/${message.partition}`, Math.max(0, lag));
}

/** Clear recorded lag. Exposed for tests. */
export function resetKafkaProjectionLag(): void {
  partitionLag.clear();
}

let consumer: Consumer | undefined;

export async function startKafkaProjection(options?: {
  groupId?: string;
  fromBeginning?: boolean;
}): Promise<void> {
  if (consumer) return;

  const groupId = options?.groupId ?? config.kafkaProjectionGroupId;
  const kafka = new Kafka({
    clientId: `${config.kafkaClientId}-projection`,
    brokers: config.kafkaBrokers,
    logLevel: logLevel.ERROR,
    retry: { initialRetryTime: 300, retries: 8 },
  });

  const next = kafka.consumer({ groupId });
  await next.connect();
  for (const topic of projectionTopics(config.kafkaTopicPrefix)) {
    await next.subscribe({ topic, fromBeginning: options?.fromBeginning ?? true });
  }

  await next.run({
    // One partition at a time keeps per-key ordering, which the projection
    // relies on for any non-commutative future rule.
    partitionsConsumedConcurrently: 1,
    autoCommit: false,
    // `eachBatch` rather than `eachMessage` because only the batch carries
    // `highWatermark`, and without it consumer lag cannot be measured. Messages
    // are still processed strictly in order, one at a time.
    eachBatchAutoResolve: false,
    eachBatch: async ({ batch, resolveOffset, heartbeat, commitOffsetsIfNecessary, isRunning, isStale }) => {
      for (const message of batch.messages) {
        // Stop promptly on shutdown or rebalance instead of projecting messages
        // this consumer no longer owns.
        if (!isRunning() || isStale()) break;

        const incoming: IncomingMessage = {
          topic: batch.topic,
          partition: batch.partition,
          offset: message.offset,
          highWatermark: batch.highWatermark,
          value: message.value,
        };

        const outcome = await projectMessage(incoming, groupId);
        updateLag(incoming);

        if (outcome === 'FAILED') {
          // Do not resolve or commit. The partition is read again from the last
          // committed offset, which is what makes "the offset advances only
          // after the projection commits" true rather than aspirational.
          throw new Error(
            `Projection failed at ${batch.topic}/${batch.partition}@${message.offset}`,
          );
        }

        resolveOffset(message.offset);
        await commitOffsetsIfNecessary();
        await heartbeat();
      }
    },
  });

  consumer = next;
  metrics.connected = true;
  logger.info(`[Kafka] Analytics projection consuming as group "${groupId}"`);
}

export async function stopKafkaProjection(): Promise<void> {
  if (!consumer) return;
  await consumer.disconnect();
  consumer = undefined;
  metrics.connected = false;
}

/** Readiness for the projection: connected and able to reach its database. */
export async function kafkaProjectionReady(): Promise<boolean> {
  if (!metrics.connected) return false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
