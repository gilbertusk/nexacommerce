import { Channel } from 'amqplib';
import { connectRabbitMQ, setupExchangeAndQueues, createPublisher } from '@nexacommerce/common';
import { config } from '../config';
import { createLogger } from '@nexacommerce/logger';
import { 
  EXCHANGE_NAME, 
  PaymentSuccess,
  PaymentExpired,
  PaymentFailed
} from '@nexacommerce/event-contracts';
import crypto from 'crypto';

const logger = createLogger('payment-messaging');
let channel: Channel;
let publishEvent: ReturnType<typeof createPublisher>;

export async function initRabbitMQ() {
  try {
    const connection = await connectRabbitMQ(config.rabbitmqUrl);
    channel = await connection.createChannel();
    await setupExchangeAndQueues(channel);
    publishEvent = createPublisher(channel, EXCHANGE_NAME);
    logger.info('[RabbitMQ] Payment messaging initialized successfully.');
  } catch (err: any) {
    logger.error('[RabbitMQ] Initializing messaging failed:', err);
    // Don't crash process, but log error
  }
}

export async function publishPaymentSuccess(payload: PaymentSuccess['payload']) {
  const event: PaymentSuccess = {
    eventId: crypto.randomUUID(),
    eventName: 'PaymentSuccess',
    timestamp: new Date().toISOString(),
    payload,
  };
  await publishEvent('payment.success', event);
}

export async function publishPaymentExpired(payload: PaymentExpired['payload']) {
  const event: PaymentExpired = {
    eventId: crypto.randomUUID(),
    eventName: 'PaymentExpired',
    timestamp: new Date().toISOString(),
    payload,
  };
  await publishEvent('payment.expired', event);
}

export async function publishPaymentFailed(payload: PaymentFailed['payload']) {
  const event: PaymentFailed = {
    eventId: crypto.randomUUID(),
    eventName: 'PaymentFailed',
    timestamp: new Date().toISOString(),
    payload,
  };
  await publishEvent('payment.failed', event);
}
