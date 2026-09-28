import { connect, Channel, ChannelModel, ConfirmChannel, ConsumeMessage, Replies } from 'amqplib';
import { EXCHANGE_NAME, EXCHANGE_TYPE, QUEUE_BINDINGS } from '@nexacommerce/event-contracts';
import { createLogger } from '@nexacommerce/logger';
import { ConsumerOutcome, recordConsumerOutcome } from './reliability-metrics';
import {
  expectedQueueSpecs,
  retryRoutingKey,
  TOPOLOGY_DEAD_LETTER_EXCHANGE,
  TOPOLOGY_RETRY_DELAY_MS,
  TOPOLOGY_RETRY_EXCHANGE,
} from './topology';

const consumerLogger = createLogger('rabbitmq-consumer');

export const RETRY_EXCHANGE = TOPOLOGY_RETRY_EXCHANGE;
export const DEAD_LETTER_EXCHANGE = TOPOLOGY_DEAD_LETTER_EXCHANGE;
export const DEFAULT_MAX_RETRIES = 5;
export const DEFAULT_RETRY_DELAY_MS = TOPOLOGY_RETRY_DELAY_MS;

/**
 * A delivery that can never succeed no matter how often it is retried: it is
 * not JSON, lacks the event envelope, or a handler has proven the payload
 * permanently unusable. Such messages go straight to the DLQ instead of
 * spending the retry budget (and 5 s per attempt) on a certain failure.
 */
export class NonRetryableEventError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NonRetryableEventError';
  }
}

type ConsumerOptions = {
  maxRetries?: number;
  retryDelayMs?: number;
  prefetch?: number;
};

export async function connectRabbitMQ(url: string, retries = 5, delay = 1000): Promise<ChannelModel> {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      // Do not print broker URLs: production URLs may embed credentials.
      console.log(`[RabbitMQ] Connecting (attempt ${attempt}/${retries})...`);
      const connection = await connect(url);
      connection.on('error', (err: Error) => console.error('[RabbitMQ] Connection error:', err.message));
      connection.on('close', () => console.warn('[RabbitMQ] Connection closed.'));
      return connection;
    } catch (err: any) {
      console.error(`[RabbitMQ] Connection failed: ${err?.message || 'unknown error'}`);
      if (attempt === retries) throw err;
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * 2, 30_000);
    }
  }
  throw new Error('[RabbitMQ] Failed to connect after retries.');
}

/**
 * Declare the durable exchanges and every queue/binding in
 * `expectedQueueSpecs()`. Idempotent for an existing matching topology. An
 * existing classic queue with a production name makes this fail with
 * PRECONDITION_FAILED: queue types cannot change in place, and nothing here
 * deletes a queue. See the migration procedure in docs/phase-3-reliability.md.
 */
export async function setupExchangeAndQueues(channel: Channel): Promise<void> {
  await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, { durable: true });
  await channel.assertExchange(RETRY_EXCHANGE, 'direct', { durable: true });
  await channel.assertExchange(DEAD_LETTER_EXCHANGE, 'direct', { durable: true });

  for (const spec of expectedQueueSpecs()) {
    await channel.assertQueue(spec.name, { durable: true, arguments: spec.arguments });
    for (const binding of spec.bindings) {
      await channel.bindQueue(spec.name, binding.exchange, binding.routingKey);
    }
  }
}

function asConfirmChannel(channel: Channel): ConfirmChannel {
  const confirmChannel = channel as ConfirmChannel;
  if (typeof confirmChannel.waitForConfirms !== 'function') {
    throw new Error('RabbitMQ publisher/consumer requires a confirm channel');
  }
  return confirmChannel;
}

async function publishConfirmed(
  channel: Channel,
  exchange: string,
  routingKey: string,
  content: Buffer,
  options: Record<string, any>,
): Promise<void> {
  const confirmChannel = asConfirmChannel(channel);
  let drain: Promise<void> | undefined;
  const confirmed = new Promise<void>((resolve, reject) => {
    const writable = confirmChannel.publish(exchange, routingKey, content, options, (error) => {
      if (error) reject(error);
      else resolve();
    });
    if (!writable) {
      drain = new Promise<void>((drainResolve) => confirmChannel.once('drain', drainResolve));
    }
  });
  await Promise.all([confirmed, ...(drain ? [drain] : [])]);
}

export function createPublisher(channel: Channel, exchange = EXCHANGE_NAME) {
  return async (routingKey: string, event: any): Promise<boolean> => {
    if (!event || typeof event.eventName !== 'string' || typeof event.eventId !== 'string') {
      throw new Error('RabbitMQ event requires eventName and eventId');
    }
    const payload = Buffer.from(JSON.stringify(event));
    await publishConfirmed(channel, exchange, routingKey, payload, {
      persistent: true,
      contentType: 'application/json',
      messageId: event.eventId,
      type: event.eventName,
      timestamp: Date.now(),
    });
    return true;
  };
}

async function forwardForRetry(
  channel: Channel,
  queue: string,
  routingKey: string,
  message: ConsumeMessage,
  error: unknown,
  retryCount: number,
): Promise<void> {
  const headers = {
    ...(message.properties.headers || {}),
    'x-retry-count': retryCount,
    'x-original-routing-key': routingKey,
    'x-last-error': String(error instanceof Error ? error.message : error).slice(0, 500),
  };
  await publishConfirmed(channel, RETRY_EXCHANGE, retryRoutingKey(queue, routingKey), message.content, {
    ...message.properties,
    headers,
    persistent: true,
  });
}

async function forwardToDeadLetter(
  channel: Channel,
  queue: string,
  message: ConsumeMessage,
  error: unknown,
): Promise<void> {
  await publishConfirmed(channel, DEAD_LETTER_EXCHANGE, queue, message.content, {
    ...message.properties,
    headers: {
      ...(message.properties.headers || {}),
      'x-original-routing-key': message.fields.routingKey,
      'x-dead-letter-reason': String(error instanceof Error ? error.message : error).slice(0, 500),
      'x-dead-lettered-at': new Date().toISOString(),
    },
    persistent: true,
  });
}

export async function createConsumer(
  channel: Channel,
  queue: string,
  handler: (payload: any, message: ConsumeMessage) => Promise<void>,
  options: ConsumerOptions = {},
): Promise<Replies.Consume> {
  asConfirmChannel(channel);
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  const prefetch = options.prefetch ?? 10;
  if (!Number.isSafeInteger(maxRetries) || maxRetries < 0) throw new Error('maxRetries must be a non-negative integer');
  if (!Number.isSafeInteger(prefetch) || prefetch <= 0) throw new Error('prefetch must be a positive integer');
  await channel.prefetch(prefetch);

  return channel.consume(queue, async (message) => {
    if (!message) return;

    const retryCount = Number(message.properties.headers?.['x-retry-count'] || 0);
    // Identifiers only. Payloads may contain customer data and are not logged.
    const settle = (outcome: ConsumerOutcome, event: any, detail?: Record<string, unknown>) => {
      recordConsumerOutcome(queue, outcome);
      const fields = {
        queue,
        eventId: typeof event?.eventId === 'string' ? event.eventId : message.properties.messageId,
        eventName: typeof event?.eventName === 'string' ? event.eventName : message.properties.type,
        aggregateId: typeof event?.payload?.orderId === 'string' ? event.payload.orderId : undefined,
        attempt: retryCount + 1,
        redelivered: message.fields.redelivered === true,
        outcome,
        ...detail,
      };
      if (outcome === 'ACKED') consumerLogger.info('Message settled', fields);
      else consumerLogger.warn('Message settled', fields);
    };

    let event: any;
    let error: unknown;
    try {
      try {
        event = JSON.parse(message.content.toString());
      } catch (parseError) {
        throw new NonRetryableEventError(
          `Malformed JSON: ${parseError instanceof Error ? parseError.message : 'unparseable body'}`,
        );
      }
      if (!event || typeof event.eventId !== 'string' || typeof event.eventName !== 'string') {
        throw new NonRetryableEventError('Invalid event envelope');
      }
      await handler(event, message);
      channel.ack(message);
      settle('ACKED', event);
      return;
    } catch (handlerError) {
      error = handlerError;
    }

    const reason = String(error instanceof Error ? error.message : error).slice(0, 300);
    try {
      const binding = QUEUE_BINDINGS.find((candidate) => candidate.queue === queue);
      const routingKey = message.fields.routingKey;
      let outcome: ConsumerOutcome;
      const retryable = !(error instanceof NonRetryableEventError);
      if (retryable && binding?.routingKeys.includes(routingKey) && retryCount < maxRetries) {
        await forwardForRetry(channel, queue, routingKey, message, error, retryCount + 1);
        outcome = 'RETRY_SCHEDULED';
      } else {
        await forwardToDeadLetter(channel, queue, message, error);
        outcome = 'DEAD_LETTERED';
      }
      // Ack only after the retry/DLQ copy has been broker-confirmed.
      channel.ack(message);
      settle(outcome, event, { reason });
    } catch (forwardError) {
      // If broker forwarding cannot be confirmed, preserve the original delivery.
      // A failed publish to a missing exchange closes the channel; nack then
      // throws, but the broker already returns every unacknowledged delivery
      // of a closed channel to the queue. Swallowing that throw keeps it from
      // escaping this callback as an unhandled rejection.
      try {
        channel.nack(message, false, true);
      } catch {
        // Channel already closed; the delivery is requeued by the broker.
      }
      settle('REQUEUED', event, {
        reason,
        forwardError: forwardError instanceof Error ? forwardError.message.slice(0, 300) : 'unknown error',
      });
    }
  });
}
