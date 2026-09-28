import type { Channel, ChannelModel } from 'amqplib';
import {
  buildInternalServiceHeaders,
  connectRabbitMQ,
  createConsumer,
  createPublisher,
  setupExchangeAndQueues,
} from '@nexacommerce/common';
import { EXCHANGE_NAME, QUEUES } from '@nexacommerce/event-contracts';
import { createLogger } from '@nexacommerce/logger';
import { config } from '../config';
import { shippingService } from '../services/shipping.service';
import { parsePaidOrderShipments } from './paid-order-shipment';
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

async function setupConsumers(consumerChannel: Channel): Promise<void> {
  await createConsumer(consumerChannel, QUEUES.SHIPPING_ORDER_EVENTS, async (event: any) => {
    if (event.eventName !== 'OrderPaid') return;

    const { orderId } = event.payload;
    logger.info(`[RabbitMQ] Processing OrderPaid event for order ${orderId}`);
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

    for (const shipment of shipments) {
      const matchedCourier = couriers.find((candidate) => (
        candidate.code.toLowerCase() === shipment.courierCode
      ));
      if (!matchedCourier) {
        throw new Error(`No active courier found for code ${shipment.courierCode}`);
      }

      await shippingService.createShippingOrder({
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
      });
    }
    logger.info(`[RabbitMQ] ${shipments.length} seller shipment(s) created for order ${orderId}`);
  });
}

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
      }
    };
    nextConnection.on('close', resetMessaging);
    nextChannel.on('close', resetMessaging);

    connection = nextConnection;
    channel = nextChannel;
    publishEvent = createPublisher(nextChannel, EXCHANGE_NAME);
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
        published += 1;
      } catch (error) {
        await rescheduleShippingOutbox(event.id, lockToken, event.attempts, error);
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
  if (activeChannel) await activeChannel.close().catch(() => undefined);
  if (activeConnection) await activeConnection.close().catch(() => undefined);
}
