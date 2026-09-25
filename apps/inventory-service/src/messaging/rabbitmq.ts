import type { Channel, ChannelModel } from 'amqplib';
import {
  connectRabbitMQ,
  createConsumer,
  createPublisher,
  setupExchangeAndQueues,
} from '@nexacommerce/common';
import { EXCHANGE_NAME, QUEUES } from '@nexacommerce/event-contracts';
import { createLogger } from '@nexacommerce/logger';
import { config } from '../config';
import { inventoryService } from '../services/inventory.service';
import {
  claimInventoryOutboxBatch,
  markInventoryOutboxPublished,
  releaseInventoryOutboxClaim,
  rescheduleInventoryOutbox,
} from './outbox';

const logger = createLogger('inventory-messaging');

let connection: ChannelModel | undefined;
let channel: Channel | undefined;
let publishEvent: ReturnType<typeof createPublisher> | undefined;
let connectPromise: Promise<void> | undefined;
let dispatcherTimer: NodeJS.Timeout | undefined;
let dispatching = false;

async function setupConsumers(consumerChannel: Channel): Promise<void> {
  await createConsumer(consumerChannel, QUEUES.INVENTORY_PAYMENT_EVENTS, async (event: any) => {
    logger.info(`[RabbitMQ] Handling payment event: ${event.eventName}`);
    const { orderId } = event.payload;
    if (event.eventName === 'PaymentSuccess') {
      await inventoryService.confirmOrderStock(orderId);
    } else if (event.eventName === 'PaymentExpired') {
      await inventoryService.releaseOrderStock(orderId);
    }
  });

  await createConsumer(consumerChannel, QUEUES.INVENTORY_ORDER_EVENTS, async (event: any) => {
    logger.info(`[RabbitMQ] Handling order event: ${event.eventName}`);
    if (event.eventName === 'OrderCancelled') {
      await inventoryService.releaseOrderStock(event.payload.orderId);
    }
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
    logger.info('[RabbitMQ] Inventory messaging initialized successfully.');
  })().finally(() => {
    connectPromise = undefined;
  });

  return connectPromise;
}

export async function dispatchInventoryOutboxOnce(): Promise<number> {
  if (dispatching) return 0;
  dispatching = true;
  try {
    await ensureMessaging();
    const events = await claimInventoryOutboxBatch(config.outboxBatchSize, config.outboxLeaseMs);
    let published = 0;

    for (let index = 0; index < events.length; index += 1) {
      const event = events[index];
      const lockToken = event.lockToken;
      if (!lockToken) continue;

      try {
        await publishEvent!(event.routingKey, event.eventPayload);
        await markInventoryOutboxPublished(event.id, lockToken);
        published += 1;
      } catch (error) {
        await rescheduleInventoryOutbox(event.id, lockToken, event.attempts, error);
        await Promise.all(events.slice(index + 1).map((pending) => pending.lockToken
          ? releaseInventoryOutboxClaim(pending.id, pending.lockToken)
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
    void dispatchInventoryOutboxOnce().catch((error) => {
      logger.error('[Outbox] Dispatch failed; pending events remain durable:', error);
    });
  }, config.outboxPollIntervalMs);
  dispatcherTimer.unref();
}

export async function initRabbitMQ(): Promise<void> {
  startOutboxDispatcher();
  try {
    await dispatchInventoryOutboxOnce();
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
