import { Channel } from 'amqplib';
import { connectRabbitMQ, setupExchangeAndQueues, createConsumer, buildInternalServiceHeaders } from '@nexacommerce/common';
import { QUEUES } from '@nexacommerce/event-contracts';
import { productService } from '../services/product.service';
import { config } from '../config';
import { createLogger } from '@nexacommerce/logger';

const logger = createLogger('product-messaging');

let channel: Channel;

async function fetchReviewSummary(productId: string): Promise<{ averageRating: number; totalReviews: number }> {
  try {
    const url = `${config.reviewServiceUrl}/reviews/internal/reviews/summary/${productId}`;
    const response = await fetch(url, {
      headers: buildInternalServiceHeaders('product-service'),
    });
    if (!response.ok) {
      throw new Error(`Review Service returned ${response.status}`);
    }
    const body = (await response.json()) as any;
    return {
      averageRating: body.data?.averageRating ?? 0,
      totalReviews: body.data?.totalReviews ?? 0,
    };
  } catch (err: any) {
    logger.warn(`Failed to fetch review summary for product ${productId}: ${err.message}`);
    return { averageRating: 0, totalReviews: 0 };
  }
}

export async function initRabbitMQ() {
  try {
    const connection = await connectRabbitMQ(config.rabbitmqUrl);
    channel = await connection.createConfirmChannel();

    await setupExchangeAndQueues(channel);

    await createConsumer(channel, QUEUES.PRODUCT_REVIEW_EVENTS, async (event: any) => {
      if (event.eventName === 'ReviewCreated') {
        const { productId } = event.payload;
        logger.info(`[Product Service] ReviewCreated received for product ${productId}`);

        const summary = await fetchReviewSummary(productId);
        await productService.updateProductRating(productId, summary.averageRating, summary.totalReviews);
        logger.info(`[Product Service] Updated rating for product ${productId}: avg=${summary.averageRating}, total=${summary.totalReviews}`);
      }
    });

    logger.info('[Product Service] RabbitMQ consumer initialized for product-service.review-events');
  } catch (err: any) {
    logger.error('[Product Service] Failed to initialize RabbitMQ:', err.message);
    // Don't crash the service if RabbitMQ is unavailable
  }
}
