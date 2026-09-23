import { Channel } from 'amqplib';
import { connectRabbitMQ, setupExchangeAndQueues, createPublisher, createConsumer } from '@nexacommerce/common';
import { config } from '../config';
import { orderService } from '../services/order.service';
import { createLogger } from '@nexacommerce/logger';
import { 
  EXCHANGE_NAME, 
  OrderCreated,
  OrderCancelled,
  OrderPaid,
  OrderCompleted,
  OrderDelivered
} from '@nexacommerce/event-contracts';
import crypto from 'crypto';

const logger = createLogger('order-messaging');
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
    logger.info('[RabbitMQ] Order messaging initialized successfully.');
  } catch (err: any) {
    logger.error('[RabbitMQ] Initializing messaging failed:', err);
    // Don't crash process, but log error
  }
}

export async function publishOrderCreated(order: OrderCreated['payload']) {
  const event: OrderCreated = {
    eventId: crypto.randomUUID(),
    eventName: 'OrderCreated',
    timestamp: new Date().toISOString(),
    payload: order,
  };
  await publishEvent('order.created', event);
}

export async function publishOrderCancelled(orderId: string, customerId: string, reason: string) {
  const event: OrderCancelled = {
    eventId: crypto.randomUUID(),
    eventName: 'OrderCancelled',
    timestamp: new Date().toISOString(),
    payload: {
      orderId,
      customerId,
      reason,
      cancelledAt: new Date().toISOString(),
    },
  };
  await publishEvent('order.cancelled', event);
}

export async function publishOrderPaid(orderId: string, customerId: string, paidAt: string, amount: number) {
  const event: OrderPaid = {
    eventId: crypto.randomUUID(),
    eventName: 'OrderPaid',
    timestamp: new Date().toISOString(),
    payload: {
      orderId,
      customerId,
      paidAt,
      amount,
    },
  };
  await publishEvent('order.paid', event);
}

export async function publishOrderCompleted(orderId: string, customerId: string, items: Array<{ productId: string, quantity: number, price: number }>) {
  const event: OrderCompleted = {
    eventId: crypto.randomUUID(),
    eventName: 'OrderCompleted',
    timestamp: new Date().toISOString(),
    payload: {
      orderId,
      customerId,
      completedAt: new Date().toISOString(),
      items,
    },
  };
  await publishEvent('order.completed', event);
}

async function setupConsumers() {
  // Consumer for payment events
  // Queue: order-service.payment-events
  await createConsumer(channel, 'order-service.payment-events', async (event: any) => {
    logger.info(`[RabbitMQ] Handling payment event: ${event.eventName}`);
    const { orderId } = event.payload;

    if (event.eventName === 'PaymentSuccess') {
      const { paidAt, amount } = event.payload;
      await orderService.handlePaymentSuccess(orderId, paidAt, amount);
    } else if (event.eventName === 'PaymentFailed') {
      await orderService.handlePaymentFailedOrExpired(orderId, 'FAILED');
    } else if (event.eventName === 'PaymentExpired') {
      await orderService.handlePaymentFailedOrExpired(orderId, 'EXPIRED');
    }
  });

  // Consumer for stock events (optional logging/audit)
  // Queue: order-service.stock-events
  await createConsumer(channel, 'order-service.stock-events', async (event: any) => {
    logger.info(`[RabbitMQ] Handling stock event: ${event.eventName}`);
  });

  // Consumer for shipping events (OrderDelivered)
  // Queue: order-service.shipping-events
  await createConsumer(channel, 'order-service.shipping-events', async (event: any) => {
    logger.info(`[RabbitMQ] Handling shipping event: ${event.eventName}`);
    if (event.eventName === 'OrderDelivered') {
      const { orderId } = event.payload;
      await orderService.handleOrderDelivered(orderId);
    }
  });
}
