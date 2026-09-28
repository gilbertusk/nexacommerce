import type { Channel, ChannelModel } from 'amqplib';
import {
  connectRabbitMQ,
  createConsumer,
  createPublisher,
  OUTBOX_BACKLOG_SQL,
  processWithInbox,
  recordOutboxDispatch,
  registerBacklogProvider,
  setDependencyReady,
  setupExchangeAndQueues,
  toBacklogStats,
} from '@nexacommerce/common';
import { EXCHANGE_NAME, QUEUES } from '@nexacommerce/event-contracts';
import { createLogger } from '@nexacommerce/logger';
import { config } from '../config';
import { orderService } from '../services/order.service';
import { prisma } from '../prisma/client';
import { ORDER_PAYMENT_CONSUMER, ORDER_SHIPPING_CONSUMER, orderInbox } from './inbox';
import {
  claimOrderOutboxBatch,
  markOrderOutboxPublished,
  releaseOrderOutboxClaim,
  rescheduleOrderOutbox,
} from './outbox';

const logger = createLogger('order-messaging');

let connection: ChannelModel | undefined;
let channel: Channel | undefined;
let publishEvent: ReturnType<typeof createPublisher> | undefined;
let connectPromise: Promise<void> | undefined;
let dispatcherTimer: NodeJS.Timeout | undefined;
let dispatching = false;

/**
 * Apply a payment event exactly once per event id. The order transition, its
 * history row, the resulting OrderPaid/OrderCancelled outbox row, and the inbox
 * marker commit together.
 */
export async function handleOrderPaymentEvent(event: any): Promise<void> {
  const { orderId } = event.payload ?? {};
  if (typeof orderId !== 'string') throw new Error('Payment event is missing payload.orderId');

  await processWithInbox(orderInbox, ORDER_PAYMENT_CONSUMER, event, async (tx) => {
    if (event.eventName === 'PaymentSuccess') {
      const { paidAt, amount } = event.payload;
      await orderService.handlePaymentSuccess(orderId, paidAt, amount, tx);
    } else if (event.eventName === 'PaymentFailed') {
      await orderService.handlePaymentFailedOrExpired(orderId, 'FAILED', tx);
    } else if (event.eventName === 'PaymentExpired') {
      await orderService.handlePaymentFailedOrExpired(orderId, 'EXPIRED', tx);
    }
  });

  // The voucher lives in another service and cannot join the transaction.
  // Release runs after commit on every delivery, including duplicates: it is
  // idempotent per order, and a failure rethrows so the broker retries until
  // the release succeeds (the inbox prevents re-applying the transition).
  if (event.eventName === 'PaymentFailed' || event.eventName === 'PaymentExpired') {
    const order = await prisma.order.findUnique({ where: { id: orderId }, select: { status: true, voucherId: true } });
    if (order?.status === 'CANCELLED' && order.voucherId) {
      await orderService.releaseVoucherForOrder(orderId);
    }
  }
}

export async function handleOrderShippingEvent(event: any): Promise<void> {
  const orderId = event.payload?.orderId;
  if (typeof orderId !== 'string') throw new Error('Shipping event is missing payload.orderId');

  await processWithInbox(orderInbox, ORDER_SHIPPING_CONSUMER, event, async (tx) => {
    if (event.eventName === 'OrderShipped') {
      await orderService.handleOrderShipped(orderId, tx);
    } else if (event.eventName === 'OrderDelivered') {
      await orderService.handleOrderDelivered(orderId, tx);
    }
  });
}

async function setupConsumers(consumerChannel: Channel): Promise<void> {
  await createConsumer(consumerChannel, QUEUES.ORDER_PAYMENT_EVENTS, handleOrderPaymentEvent);

  // Stock events are informational for Order Service today: no state changes,
  // so no inbox is needed.
  await createConsumer(consumerChannel, QUEUES.ORDER_STOCK_EVENTS, async (event: any) => {
    logger.info(`[RabbitMQ] Handling stock event: ${event.eventName}`);
  });

  await createConsumer(consumerChannel, QUEUES.ORDER_SHIPPING_EVENTS, handleOrderShippingEvent);
}

registerBacklogProvider('outbox', 'order-service', async () =>
  toBacklogStats(await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(OUTBOX_BACKLOG_SQL)));

async function ensureMessaging(): Promise<void> {
  if (publishEvent) return;
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    const nextConnection = await connectRabbitMQ(config.rabbitmqUrl);
    let nextChannel: Channel | undefined;
    try {
      nextChannel = await nextConnection.createConfirmChannel();
      await setupExchangeAndQueues(nextChannel);
      await setupConsumers(nextChannel);
    } catch (error) {
      if (nextChannel) await nextChannel.close().catch(() => undefined);
      await nextConnection.close().catch(() => undefined);
      throw error;
    }

    const resetMessaging = () => {
      if (channel === nextChannel) {
        channel = undefined;
        connection = undefined;
        publishEvent = undefined;
        setDependencyReady('rabbitmq', false);
      }
    };
    nextConnection.on('close', resetMessaging);
    nextChannel.on('close', resetMessaging);

    connection = nextConnection;
    channel = nextChannel;
    publishEvent = createPublisher(nextChannel, EXCHANGE_NAME);
    setDependencyReady('rabbitmq', true);
    logger.info('[RabbitMQ] Order messaging initialized successfully.');
  })().finally(() => {
    connectPromise = undefined;
  });

  return connectPromise;
}

export async function dispatchOrderOutboxOnce(): Promise<number> {
  if (dispatching) return 0;
  dispatching = true;
  try {
    await ensureMessaging();
    const events = await claimOrderOutboxBatch(config.outboxBatchSize, config.outboxLeaseMs);
    let published = 0;

    for (let index = 0; index < events.length; index += 1) {
      const event = events[index];
      const lockToken = event.lockToken;
      if (!lockToken) continue;

      try {
        await publishEvent!(event.routingKey, event.eventPayload);
        await markOrderOutboxPublished(event.id, lockToken);
        recordOutboxDispatch('order-service', 'PUBLISHED');
        published += 1;
      } catch (error) {
        await rescheduleOrderOutbox(event.id, lockToken, event.attempts, error);
        recordOutboxDispatch('order-service', 'RESCHEDULED');
        logger.warn('[Outbox] Publish failed; event rescheduled', {
          eventId: event.id,
          eventName: event.eventName,
          aggregateId: event.aggregateId,
          attempt: event.attempts + 1,
          outcome: 'RESCHEDULED',
        });
        await Promise.all(events.slice(index + 1).map((pending) => pending.lockToken
          ? releaseOrderOutboxClaim(pending.id, pending.lockToken)
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
    void dispatchOrderOutboxOnce().catch((error) => {
      logger.error('[Outbox] Dispatch failed; pending events remain durable:', error);
    });
  }, config.outboxPollIntervalMs);
  dispatcherTimer.unref();
}

export async function initRabbitMQ(): Promise<void> {
  startOutboxDispatcher();
  try {
    await dispatchOrderOutboxOnce();
  } catch (error) {
    logger.error('[RabbitMQ] Initial connection failed; outbox dispatcher will retry:', error);
  }
}

export async function stopRabbitMQ(): Promise<void> {
  if (dispatcherTimer) clearInterval(dispatcherTimer);
  dispatcherTimer = undefined;
  if (connectPromise) await connectPromise.catch(() => undefined);
  publishEvent = undefined;
  const activeChannel = channel;
  const activeConnection = connection;
  channel = undefined;
  connection = undefined;
  setDependencyReady('rabbitmq', false);
  if (activeChannel) await activeChannel.close().catch(() => undefined);
  if (activeConnection) await activeConnection.close().catch(() => undefined);
}
