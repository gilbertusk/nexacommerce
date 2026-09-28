import {
  createConsumer,
  createResilientConsumer,
  processWithInbox,
  registerBacklogProvider,
  runWithRequestId,
  toBacklogStats,
} from '@nexacommerce/common';
import { QUEUES } from '@nexacommerce/event-contracts';
import { createLogger } from '@nexacommerce/logger';
import config from '../config';
import prisma from '../prisma/client';
import { notificationInbox } from './inbox';
import { applyNotificationEvent, prepareNotificationEvent } from './notification-events';
import { startEmailDispatcher } from './email-dispatcher';

const logger = createLogger('notification-messaging');

/**
 * Inbox identity for this consumer. It forms part of the deduplication key, so
 * renaming it makes every past event eligible for reprocessing.
 */
export const NOTIFICATION_RABBITMQ_CONSUMER = 'notification.rabbitmq';

/** Summary of the durable email queue (`email_logs`: PENDING, SENT, FAILED). */
const EMAIL_BACKLOG_SQL = `
  SELECT
    COUNT(*) FILTER (WHERE status = 'PENDING' AND locked_at IS NULL)::int AS pending,
    COUNT(*) FILTER (WHERE status = 'PENDING' AND locked_at IS NOT NULL)::int AS processing,
    COUNT(*) FILTER (WHERE status = 'FAILED')::int AS failed,
    COUNT(*) FILTER (WHERE status = 'PENDING' AND retry_count > 0)::int AS retrying,
    COALESCE(EXTRACT(EPOCH FROM (NOW() - MIN(created_at) FILTER (WHERE status = 'PENDING'))), 0)::float AS oldest_pending_age_seconds
  FROM email_logs
`;

/**
 * Consume one event exactly once.
 *
 * Recipient lookups run first, outside the transaction. The in-app
 * notification rows, the queued emails, and the record marking the event
 * consumed are then written by a single transaction, so there is no window in
 * which an event counts as handled but its email was never queued.
 */
export async function handleNotificationEvent(event: {
  eventId: string;
  eventName: string;
  payload: unknown;
}): Promise<void> {
  const prepared = await prepareNotificationEvent(event.eventName, event.payload);

  const outcome = await processWithInbox(
    notificationInbox,
    NOTIFICATION_RABBITMQ_CONSUMER,
    event,
    async (tx) => {
      await applyNotificationEvent(tx, event.eventId, prepared);
    },
  );

  if (outcome === 'SKIPPED_DUPLICATE') {
    logger.info(`Skipping duplicate event: ${event.eventId}`);
  }
}

const notificationConsumer = createResilientConsumer({
  url: config.rabbitmqUrl,
  name: QUEUES.NOTIFICATION_EVENTS,
  setup: async (channel) => {
    await createConsumer(channel, QUEUES.NOTIFICATION_EVENTS, async (event: any) => {
      // No HTTP request here, so the event id is the correlation id.
      await runWithRequestId(String(event?.eventId ?? 'unknown-event'), async () => {
        logger.info(`[Notification Service] Received event: ${event?.eventName}`);
        // Errors propagate so the shared consumer can apply its bounded retry
        // and dead-letter policy; nothing is acknowledged before the commit.
        await handleNotificationEvent(event);
      });
    });
  },
});

registerBacklogProvider('email', 'notification-service', async () =>
  toBacklogStats(await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(EMAIL_BACKLOG_SQL)));

/**
 * Start the email dispatcher and the event consumer. The email queue is in
 * PostgreSQL and does not depend on the broker, so it starts first. The
 * consumer re-attaches after any broker restart instead of dying silently.
 */
export async function initRabbitMQ() {
  startEmailDispatcher();
  await notificationConsumer.start();
}

export async function stopRabbitMQ() {
  await notificationConsumer.stop();
}
