import { Channel } from 'amqplib';
import { connectRabbitMQ, setupExchangeAndQueues, createPublisher, createConsumer } from '@nexacommerce/common';
import { config } from '../config';
import { inventoryService } from '../services/inventory.service';
import { createLogger } from '@nexacommerce/logger';
import { 
  EXCHANGE_NAME, 
  StockConfirmed,
  StockReleased,
  LowStockDetected
} from '@nexacommerce/event-contracts';
import crypto from 'crypto';

const logger = createLogger('inventory-messaging');
let channel: Channel;
let publishEvent: ReturnType<typeof createPublisher>;

export async function initRabbitMQ() {
  try {
    const connection = await connectRabbitMQ(config.rabbitmqUrl);
    channel = await connection.createChannel();
    await setupExchangeAndQueues(channel);
    publishEvent = createPublisher(channel, EXCHANGE_NAME);

    // Setup consumers
    await setupConsumers();
    logger.info('[RabbitMQ] Inventory messaging initialized successfully.');
  } catch (err: any) {
    logger.error('[RabbitMQ] Initializing messaging failed:', err);
    // Don't crash process, but log error
  }
}

export async function publishStockConfirmed(orderId: string, reservations: any[]) {
  const event: StockConfirmed = {
    eventId: crypto.randomUUID(),
    eventName: 'StockConfirmed',
    timestamp: new Date().toISOString(),
    payload: {
      orderId,
      reservations,
    },
  };
  await publishEvent('stock.confirmed', event);
}

export async function publishStockReleased(orderId: string, reservations: any[]) {
  const event: StockReleased = {
    eventId: crypto.randomUUID(),
    eventName: 'StockReleased',
    timestamp: new Date().toISOString(),
    payload: {
      orderId,
      reservations,
    },
  };
  await publishEvent('stock.released', event);
}

export async function publishLowStockDetected(productId: string, currentStock: number, threshold: number, sellerId: string) {
  const event: LowStockDetected = {
    eventId: crypto.randomUUID(),
    eventName: 'LowStockDetected',
    timestamp: new Date().toISOString(),
    payload: {
      productId,
      currentStock,
      threshold,
      sellerId,
    },
  };
  await publishEvent('stock.low_detected', event);
}

async function setupConsumers() {
  // Consumer for payment events
  // Queue: inventory-service.payment-events
  await createConsumer(channel, 'inventory-service.payment-events', async (event: any) => {
    logger.info(`[RabbitMQ] Handling payment event: ${event.eventName}`);
    const { orderId } = event.payload;

    if (event.eventName === 'PaymentSuccess') {
      const { confirmedReservations, lowStockAlerts } = await inventoryService.confirmOrderStock(orderId);
      if (confirmedReservations.length > 0) {
        await publishStockConfirmed(orderId, confirmedReservations);
      }
      for (const alert of lowStockAlerts) {
        const product = await inventoryService.getProductDetails(alert.productId);
        const sellerId = product ? product.sellerId : 'SYSTEM';
        await publishLowStockDetected(alert.productId, alert.currentStock, alert.threshold, sellerId);
      }
    } else if (event.eventName === 'PaymentExpired') {
      const released = await inventoryService.releaseOrderStock(orderId);
      if (released.length > 0) {
        await publishStockReleased(orderId, released);
      }
    }
  });

  // Consumer for order events
  // Queue: inventory-service.order-events
  await createConsumer(channel, 'inventory-service.order-events', async (event: any) => {
    logger.info(`[RabbitMQ] Handling order event: ${event.eventName}`);
    const { orderId } = event.payload;

    if (event.eventName === 'OrderCancelled') {
      const released = await inventoryService.releaseOrderStock(orderId);
      if (released.length > 0) {
        await publishStockReleased(orderId, released);
      }
    }
  });
}
