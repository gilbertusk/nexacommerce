import type { Channel, ChannelModel } from 'amqplib';
import {
  connectRabbitMQ,
  createPublisher,
  OUTBOX_BACKLOG_SQL,
  recordOutboxDispatch,
  registerBacklogProvider,
  setDependencyReady,
  setupExchangeAndQueues,
  toBacklogStats,
} from '@nexacommerce/common';
import { EXCHANGE_NAME } from '@nexacommerce/event-contracts';
import { createLogger } from '@nexacommerce/logger';
import { config } from '../config';
import { prisma } from '../prisma/client';
import {
  claimPaymentOutboxBatch,
  markPaymentOutboxPublished,
  releasePaymentOutboxClaim,
  reschedulePaymentOutbox,
} from './outbox';

const logger = createLogger('payment-messaging');

let connection: ChannelModel | undefined;
let channel: Channel | undefined;
let publishEvent: ReturnType<typeof createPublisher> | undefined;
let connectPromise: Promise<void> | undefined;
let dispatcherTimer: NodeJS.Timeout | undefined;
let dispatching = false;

async function ensurePublisher(): Promise<void> {
  if (publishEvent) return;
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    const nextConnection = await connectRabbitMQ(config.rabbitmqUrl);
    let nextChannel: Channel | undefined;
    try {
      nextChannel = await nextConnection.createConfirmChannel();
      await setupExchangeAndQueues(nextChannel);
    } catch (error) {
      if (nextChannel) await nextChannel.close().catch(() => undefined);
      await nextConnection.close().catch(() => undefined);
      throw error;
    }

    const resetPublisher = () => {
      if (channel === nextChannel) {
        channel = undefined;
        connection = undefined;
        publishEvent = undefined;
        setDependencyReady('rabbitmq', false);
      }
    };
    nextConnection.on('close', resetPublisher);
    nextChannel.on('close', resetPublisher);

    connection = nextConnection;
    channel = nextChannel;
    publishEvent = createPublisher(nextChannel, EXCHANGE_NAME);
    setDependencyReady('rabbitmq', true);
    logger.info('[RabbitMQ] Payment publisher initialized successfully.');
  })().finally(() => {
    connectPromise = undefined;
  });

  return connectPromise;
}

registerBacklogProvider('outbox', 'payment-service', async () =>
  toBacklogStats(await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(OUTBOX_BACKLOG_SQL)));

export async function dispatchPaymentOutboxOnce(): Promise<number> {
  if (dispatching) return 0;
  dispatching = true;
  try {
    await ensurePublisher();
    const events = await claimPaymentOutboxBatch(config.outboxBatchSize, config.outboxLeaseMs);
    let published = 0;

    for (let index = 0; index < events.length; index += 1) {
      const event = events[index];
      const lockToken = event.lockToken;
      if (!lockToken) continue;

      try {
        await publishEvent!(event.routingKey, event.eventPayload);
        await markPaymentOutboxPublished(event.id, lockToken);
        recordOutboxDispatch('payment-service', 'PUBLISHED');
        published += 1;
      } catch (error) {
        await reschedulePaymentOutbox(event.id, lockToken, event.attempts, error);
        recordOutboxDispatch('payment-service', 'RESCHEDULED');
        logger.warn('[Outbox] Publish failed; event rescheduled', {
          eventId: event.id,
          eventName: event.eventName,
          aggregateId: event.aggregateId,
          attempt: event.attempts + 1,
          outcome: 'RESCHEDULED',
        });
        await Promise.all(events.slice(index + 1).map((pending) => pending.lockToken
          ? releasePaymentOutboxClaim(pending.id, pending.lockToken)
          : Promise.resolve()));
        throw error;
      }
    }

    return published;
  } finally {
    dispatching = false;
  }
}

function startOutboxDispatcher(): void {
  if (dispatcherTimer) return;
  dispatcherTimer = setInterval(() => {
    void dispatchPaymentOutboxOnce().catch((error) => {
      logger.error('[Outbox] Dispatch failed; pending events remain durable:', error);
    });
  }, config.outboxPollIntervalMs);
  dispatcherTimer.unref();
}

export async function initRabbitMQ(): Promise<void> {
  startOutboxDispatcher();
  try {
    await dispatchPaymentOutboxOnce();
  } catch (error) {
    logger.error('[RabbitMQ] Initial connection failed; outbox dispatcher will retry:', error);
  }
}

export async function stopRabbitMQ(): Promise<void> {
  if (dispatcherTimer) clearInterval(dispatcherTimer);
  dispatcherTimer = undefined;
  if (connectPromise) await connectPromise.catch(() => undefined);
  publishEvent = undefined;
  setDependencyReady('rabbitmq', false);
  const activeChannel = channel;
  const activeConnection = connection;
  channel = undefined;
  connection = undefined;
  if (activeChannel) await activeChannel.close().catch(() => undefined);
  if (activeConnection) await activeConnection.close().catch(() => undefined);
}
