import {
  createConsumer,
  createResilientConsumer,
  buildInternalServiceHeaders,
} from '@nexacommerce/common';
import { QUEUES } from '@nexacommerce/event-contracts';
import { productService } from '../services/product.service';
import { config } from '../config';
import { createLogger } from '@nexacommerce/logger';

const logger = createLogger('product-messaging');

/**
 * Read the authoritative rating summary from Review Service.
 *
 * A failed lookup throws. The previous fallback returned `{0, 0}`, which then
 * overwrote the product's real rating with zero: a fabricated value that
 * looked like data. Throwing sends the event through bounded retry and DLQ.
 */
async function fetchReviewSummary(productId: string): Promise<{ averageRating: number; totalReviews: number }> {
  const url = `${config.reviewServiceUrl}/reviews/internal/reviews/summary/${encodeURIComponent(productId)}`;
  const response = await fetch(url, {
    headers: buildInternalServiceHeaders('product-service'),
  });
  if (!response.ok) {
    throw new Error(`Review Service returned ${response.status} for the rating summary`);
  }
  const body = (await response.json()) as any;
  const averageRating = Number(body?.data?.averageRating);
  const totalReviews = Number(body?.data?.totalReviews);
  if (!Number.isFinite(averageRating) || !Number.isSafeInteger(totalReviews) || totalReviews < 0) {
    throw new Error('Review Service returned an unusable rating summary');
  }
  return { averageRating, totalReviews };
}

/**
 * Project the current rating summary onto the product.
 *
 * Idempotency is by construction rather than by inbox: the write is an
 * absolute value re-read from the owning service on every delivery, so a
 * duplicate, a redelivery after a crash, or an out-of-order older event all
 * converge on the same current summary. There is no increment to double.
 */
export async function handleReviewEvent(event: any): Promise<void> {
  if (event.eventName !== 'ReviewCreated') return;
  const productId = event.payload?.productId;
  if (typeof productId !== 'string' || productId.length === 0) {
    throw new Error('ReviewCreated is missing payload.productId');
  }

  const summary = await fetchReviewSummary(productId);
  await productService.updateProductRating(productId, summary.averageRating, summary.totalReviews);
  logger.info('[Product Service] Rating projection updated', {
    eventId: event.eventId,
    productId,
    totalReviews: summary.totalReviews,
    outcome: 'APPLIED',
  });
}

const reviewConsumer = createResilientConsumer({
  url: config.rabbitmqUrl,
  name: 'product-service.review-events',
  setup: async (channel) => {
    await createConsumer(channel, QUEUES.PRODUCT_REVIEW_EVENTS, handleReviewEvent);
  },
});

/**
 * Start the review consumer. A broker outage at startup or later does not
 * crash the service; the consumer re-attaches when the broker returns, and
 * unacknowledged messages stay queued meanwhile.
 */
export async function initRabbitMQ(): Promise<void> {
  await reviewConsumer.start();
}

export async function stopRabbitMQ(): Promise<void> {
  await reviewConsumer.stop();
}
