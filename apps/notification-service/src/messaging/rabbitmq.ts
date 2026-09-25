import { Channel } from 'amqplib';
import {
  connectRabbitMQ,
  setupExchangeAndQueues,
  createConsumer,
  processWithInbox,
  runWithRequestId,
} from '@nexacommerce/common';
import { QUEUES } from '@nexacommerce/event-contracts';
import { createLogger } from '@nexacommerce/logger';
import config from '../config';
import { notificationInbox } from './inbox';
import { applyNotificationEvent, prepareNotificationEvent } from './notification-events';
import { startEmailDispatcher } from './email-dispatcher';

const logger = createLogger('notification-messaging');

/**
 * Inbox identity for this consumer. It forms part of the deduplication key, so
 * renaming it makes every past event eligible for reprocessing.
 */
export const NOTIFICATION_RABBITMQ_CONSUMER = 'notification.rabbitmq';

let channel: Channel;

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

export async function initRabbitMQ() {
  try {
    const connection = await connectRabbitMQ(config.rabbitmqUrl);
    channel = await connection.createConfirmChannel();

    await setupExchangeAndQueues(channel);

    await createConsumer(channel, QUEUES.NOTIFICATION_EVENTS, async (event: any) => {
      // No HTTP request here, so the event id is the correlation id.
      await runWithRequestId(String(event?.eventId ?? 'unknown-event'), async () => {
        logger.info(`[Notification Service] Received event: ${event?.eventName}`);
        // Errors propagate so the shared consumer can apply its bounded retry
        // and dead-letter policy; nothing is acknowledged before the commit.
        await handleNotificationEvent(event);
      });
    });

    startEmailDispatcher();

    logger.info('RabbitMQ Consumers initialized for Notification Service.');
  } catch (err: any) {
    logger.error('Failed to initialize RabbitMQ connection in Notification Service:', err);
    throw err;
  }
}
