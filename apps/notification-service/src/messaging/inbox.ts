import {
  InboxClaimOutcome,
  InboxEventMeta,
  InboxKey,
  InboxPort,
} from '@nexacommerce/common';
import { Prisma } from '../generated/client';
import prisma from '../prisma/client';

export type NotificationTx = Prisma.TransactionClient;

/** Prisma unique-constraint violation. */
const UNIQUE_VIOLATION = 'P2002';

/**
 * Bound on a single event's transaction. Recipient lookups happen before the
 * transaction opens, so this covers database work only.
 */
const INBOX_TRANSACTION_TIMEOUT_MS = 15_000;

export const notificationInbox: InboxPort<NotificationTx> = {
  async runInTransaction(fn) {
    return prisma.$transaction(fn, { timeout: INBOX_TRANSACTION_TIMEOUT_MS });
  },

  async claim(tx: NotificationTx, key: InboxKey, meta: InboxEventMeta): Promise<InboxClaimOutcome> {
    const existing = await tx.inboxEvent.findUnique({
      where: { eventId_consumer: { eventId: key.eventId, consumer: key.consumer } },
    });

    if (existing) {
      if (existing.status === 'PROCESSED') return 'DUPLICATE';

      // A previous attempt did not commit, so its notification rows and email
      // jobs do not exist either. Taking the event over is safe.
      await tx.inboxEvent.update({
        where: { id: existing.id },
        data: {
          status: 'PROCESSING',
          eventName: meta.eventName,
          payload: meta.payload as Prisma.InputJsonValue,
        },
      });
      return 'CLAIMED';
    }

    await tx.inboxEvent.create({
      data: {
        eventId: key.eventId,
        consumer: key.consumer,
        eventName: meta.eventName,
        payload: meta.payload as Prisma.InputJsonValue,
        status: 'PROCESSING',
      },
    });
    return 'CLAIMED';
  },

  async markProcessed(tx: NotificationTx, key: InboxKey) {
    await tx.inboxEvent.update({
      where: { eventId_consumer: { eventId: key.eventId, consumer: key.consumer } },
      data: { status: 'PROCESSED', processedAt: new Date(), lastError: null },
    });
  },

  async recordFailure(key: InboxKey, meta: InboxEventMeta, error: Error) {
    const lastError = error.message.slice(0, 1000);
    await prisma.inboxEvent.upsert({
      where: { eventId_consumer: { eventId: key.eventId, consumer: key.consumer } },
      create: {
        eventId: key.eventId,
        consumer: key.consumer,
        eventName: meta.eventName,
        payload: meta.payload as Prisma.InputJsonValue,
        status: 'FAILED',
        attempts: 1,
        lastError,
      },
      update: {
        status: 'FAILED',
        attempts: { increment: 1 },
        lastError,
      },
    });
  },

  isUniqueViolation(err: unknown) {
    return err instanceof Prisma.PrismaClientKnownRequestError && err.code === UNIQUE_VIOLATION;
  },
};
