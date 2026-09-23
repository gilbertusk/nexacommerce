import { Channel } from 'amqplib';
import { connectRabbitMQ, setupExchangeAndQueues, createPublisher } from '@nexacommerce/common';
import { config } from '../config';
import { ROUTING_KEYS } from '@nexacommerce/event-contracts';
import crypto from 'crypto';

let channel: Channel;
let publish: ReturnType<typeof createPublisher>;

export async function initRabbitMQ() {
  try {
    const connection = await connectRabbitMQ(config.rabbitmqUrl);
    channel = await connection.createChannel();
    
    // Ensure topology
    await setupExchangeAndQueues(channel);
    
    publish = createPublisher(channel);
  } catch (err: any) {
    console.error('[Review Service] Failed to initialize RabbitMQ:', err.message);
    throw err;
  }
}

export async function publishReviewCreated(payload: {
  reviewId: string;
  productId: string;
  customerId: string;
  rating: number;
  orderId: string;
}) {
  if (!publish) {
    console.warn('[Review Service] Publisher not initialized. Queue message skipped.');
    return;
  }

  const event = {
    eventId: crypto.randomUUID(),
    eventName: 'ReviewCreated' as const,
    timestamp: new Date().toISOString(),
    payload,
  };

  await publish(ROUTING_KEYS.REVIEW_CREATED, event);
}
