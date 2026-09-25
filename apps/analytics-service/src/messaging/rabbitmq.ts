import { Channel } from 'amqplib';
import { connectRabbitMQ, setupExchangeAndQueues, createConsumer } from '@nexacommerce/common';
import { QUEUES } from '@nexacommerce/event-contracts';
import { analyticsService } from '../services/analytics.service';
import { analyticsRepository } from '../repositories/analytics.repository';
import { config } from '../config';
import { createLogger } from '@nexacommerce/logger';

const logger = createLogger('analytics-messaging');
let channel: Channel;

export async function initRabbitMQ() {
  try {
    const connection = await connectRabbitMQ(config.rabbitmqUrl);
    channel = await connection.createConfirmChannel();
    await setupExchangeAndQueues(channel);

    await createConsumer(channel, QUEUES.ANALYTICS_EVENTS, async (event: any) => {
      const { eventId, eventName, payload } = event;
      logger.info(`[Analytics] Received event: ${eventName}`);

      // Always save raw event for audit/replay
      const saved = await analyticsRepository.saveEvent(eventId, eventName, payload);
      if (saved.isProcessed) {
        logger.info(`[Analytics] Skipping duplicate event: ${eventId}`);
        return;
      }

      try {
        switch (eventName) {
          case 'OrderCreated':
            await analyticsService.handleOrderCreated(payload);
            break;
          case 'PaymentSuccess':
            await analyticsService.handlePaymentSuccess(payload);
            break;
          case 'PaymentFailed':
            await analyticsService.handlePaymentFailed(payload);
            break;
          case 'PaymentExpired':
            await analyticsService.handlePaymentExpired(payload);
            break;
          case 'OrderCancelled':
            await analyticsService.handleOrderCancelled(payload);
            break;
          case 'OrderCompleted':
            await analyticsService.handleOrderCompleted(payload);
            break;
          case 'ReviewCreated':
            await analyticsService.handleReviewCreated(payload);
            break;
          case 'OrderPaid':
            // Covered by PaymentSuccess — just archive
            break;
          default:
            logger.warn(`[Analytics] Unhandled event: ${eventName}`);
        }

        await analyticsRepository.markEventProcessed(saved.id);
      } catch (err: any) {
        logger.error(`[Analytics] Error processing ${eventName}: ${err.message}`);
        // Do not acknowledge failed analytics updates. The shared consumer
        // owns retry/DLQ routing and only ACKs after the handler resolves.
        throw err;
      }
    });

    logger.info('[Analytics] RabbitMQ consumer initialized');
  } catch (err: any) {
    logger.error('[Analytics] Failed to initialize RabbitMQ:', err.message);
    throw err;
  }
}
