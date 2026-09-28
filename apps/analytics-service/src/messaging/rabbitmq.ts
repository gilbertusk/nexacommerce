import {
  createConsumer,
  createResilientConsumer,
  processWithInbox,
  runWithRequestId,
} from '@nexacommerce/common';
import { QUEUES } from '@nexacommerce/event-contracts';
import { applyAnalyticsEvent, prepareAnalyticsEvent } from '../services/analytics.service';
import { analyticsInbox } from './inbox';
import { config } from '../config';
import { createLogger } from '@nexacommerce/logger';

const logger = createLogger('analytics-messaging');

/**
 * Inbox identity for this consumer. It is part of the deduplication key, so
 * changing it makes every past event eligible for reprocessing.
 */
export const ANALYTICS_RABBITMQ_CONSUMER = 'analytics.rabbitmq';

/**
 * Consume an event exactly once.
 *
 * Enrichment runs first and outside the transaction because it calls other
 * services. The report mutations and the inbox record that marks the event
 * consumed are then written by one transaction, so a crash at any point either
 * leaves both or neither and a redelivery cannot double-count.
 */
export async function handleAnalyticsEvent(event: {
  eventId: string;
  eventName: string;
  payload: unknown;
}): Promise<void> {
  const prepared = await prepareAnalyticsEvent(event.eventName, event.payload);

  const outcome = await processWithInbox(
    analyticsInbox,
    ANALYTICS_RABBITMQ_CONSUMER,
    event,
    async (tx) => {
      await applyAnalyticsEvent(tx, prepared);
    },
  );

  if (outcome === 'SKIPPED_DUPLICATE') {
    logger.info(`[Analytics] Skipping duplicate event: ${event.eventId}`);
  }
}

const analyticsConsumer = createResilientConsumer({
  url: config.rabbitmqUrl,
  name: QUEUES.ANALYTICS_EVENTS,
  setup: async (channel) => {
    await createConsumer(channel, QUEUES.ANALYTICS_EVENTS, async (event: any) => {
      // A consumer has no HTTP request, so the event id becomes the correlation
      // id: every log line from processing this event is findable together, and
      // so is every internal call it makes.
      await runWithRequestId(String(event?.eventId ?? 'unknown-event'), async () => {
        logger.info(`[Analytics] Received event: ${event?.eventName}`);
        // Errors propagate: the shared consumer owns retry and DLQ routing and
        // only acknowledges once this resolves.
        await handleAnalyticsEvent(event);
      });
    });
  },
});

/**
 * Attach the analytics consumer and keep it attached across broker restarts.
 * Previously a single connect at startup left the consumer silently detached
 * after any later broker restart while the service kept reporting healthy.
 */
export async function initRabbitMQ() {
  await analyticsConsumer.start();
}

export async function stopRabbitMQ() {
  await analyticsConsumer.stop();
}
