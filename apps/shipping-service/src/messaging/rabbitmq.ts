import type { Channel, ChannelModel } from 'amqplib';
import {
  buildInternalServiceHeaders,
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
import { shippingService } from '../services/shipping.service';
import { parsePaidOrderShipments } from './paid-order-shipment';
import { prisma } from '../prisma/client';
import { shippingInbox } from './inbox';
import {
  claimShippingOutboxBatch,
  markShippingOutboxPublished,
  releaseShippingOutboxClaim,
  rescheduleShippingOutbox,
} from './outbox';

const logger = createLogger('shipping-messaging');

let connection: ChannelModel | undefined;
let channel: Channel | undefined;
let publishEvent: ReturnType<typeof createPublisher> | undefined;
let connectPromise: Promise<void> | undefined;
let dispatcherTimer: NodeJS.Timeout | undefined;
let dispatching = false;

export const SHIPPING_ORDER_PAID_CONSUMER = 'shipping-service.order-events';

/**
 * Create every seller's label for a paid order, exactly once per event.
 *
 * The Order Service lookup and courier catalogue read happen before the
 * transaction opens. All labels plus the inbox marker then commit together, so
 * a failure on the second seller no longer leaves the first seller's label
 * committed while the event retries: the order has either all of its labels
 * or none. Per-(order, seller) uniqueness stays as defence in depth against a
 * distinct event restating the same payment.
 */
export async function handleShippingOrderPaid(event: any): Promise<void> {
  if (event.eventName !== 'OrderPaid') return;

  const orderId = event.payload?.orderId;
  if (typeof orderId !== 'string') throw new Error('OrderPaid is missing payload.orderId');
  const response = await fetch(`${config.orderServiceUrl}/orders/internal/orders/${orderId}`, {
    headers: buildInternalServiceHeaders('shipping-service'),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch order ${orderId} details: ${response.statusText}`);
  }

  const resBody = await response.json() as any;
  const order = resBody.data;

  const shipments = parsePaidOrderShipments(order);
  const couriers = await shippingService.getCouriers();

  const destinationAddress = typeof order.shippingAddress === 'string'
    ? JSON.parse(order.shippingAddress)
    : order.shippingAddress;

  const labels = shipments.map((shipment) => {
    const matchedCourier = couriers.find((candidate) => (
      candidate.code.toLowerCase() === shipment.courierCode
    ));
    if (!matchedCourier) {
      throw new Error(`No active courier found for code ${shipment.courierCode}`);
    }
    return {
      orderId: order.id,
      sellerId: shipment.sellerId,
      courierId: matchedCourier.id,
      serviceCode: shipment.serviceCode,
      weight: shipment.weightGrams,
      originCity: shipment.originCity,
      originProvince: shipment.originProvince,
      trustedQuotedCost: shipment.cost,
      destinationAddress,
      notes: order.notes || undefined,
    };
  });

  await processWithInbox(shippingInbox, SHIPPING_ORDER_PAID_CONSUMER, event, async (tx) => {
    for (const label of labels) {
      await shippingService.createShippingOrder(label, tx);
    }
  });
  logger.info('[RabbitMQ] Seller shipments settled', { eventId: event.eventId, orderId, shipments: labels.length });
}

async function setupConsumers(consumerChannel: Channel): Promise<void> {
  await createConsumer(consumerChannel, QUEUES.SHIPPING_ORDER_EVENTS, handleShippingOrderPaid);
}

registerBacklogProvider('outbox', 'shipping-service', async () =>
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
    logger.info('[RabbitMQ] Shipping messaging initialized successfully.');
  })().finally(() => {
    connectPromise = undefined;
  });

  return connectPromise;
}

export async function dispatchShippingOutboxOnce(): Promise<number> {
  if (dispatching) return 0;
  dispatching = true;
  try {
    await ensureMessaging();
    const events = await claimShippingOutboxBatch(config.outboxBatchSize, config.outboxLeaseMs);
    let published = 0;

    for (let index = 0; index < events.length; index += 1) {
      const event = events[index];
      const lockToken = event.lockToken;
      if (!lockToken) continue;

      try {
        await publishEvent!(event.routingKey, event.eventPayload);
        await markShippingOutboxPublished(event.id, lockToken);
        recordOutboxDispatch('shipping-service', 'PUBLISHED');
        published += 1;
      } catch (error) {
        await rescheduleShippingOutbox(event.id, lockToken, event.attempts, error);
        recordOutboxDispatch('shipping-service', 'RESCHEDULED');
        logger.warn('[Outbox] Publish failed; event rescheduled', {
          eventId: event.id,
          eventName: event.eventName,
          aggregateId: event.aggregateId,
          attempt: event.attempts + 1,
          outcome: 'RESCHEDULED',
        });
        await Promise.all(events.slice(index + 1).map((pending) => pending.lockToken
          ? releaseShippingOutboxClaim(pending.id, pending.lockToken)
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
    void dispatchShippingOutboxOnce().catch((error) => {
      logger.error('[Outbox] Dispatch failed; pending events remain durable:', error);
    });
  }, config.outboxPollIntervalMs);
  dispatcherTimer.unref();
}

export async function initRabbitMQ(): Promise<void> {
  startOutboxDispatcher();
  try {
    await dispatchShippingOutboxOnce();
  } catch (error) {
    logger.error('[RabbitMQ] Initial connection failed; messaging will retry:', error);
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
