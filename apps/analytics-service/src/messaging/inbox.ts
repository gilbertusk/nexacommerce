import {
  InboxClaimOutcome,
  InboxEventMeta,
  InboxKey,
  InboxPort,
} from '@nexacommerce/common';
import { Prisma } from '../generated/client';
import { prisma } from '../prisma/client';

export type AnalyticsTx = Prisma.TransactionClient;

/** Prisma unique-constraint violation. */
const UNIQUE_VIOLATION = 'P2002';

/**
 * How long a single event may hold a transaction open. Handlers do their
 * network enrichment before the transaction starts, so this only bounds
 * database work.
 */
const INBOX_TRANSACTION_TIMEOUT_MS = 15_000;

export const analyticsInbox: InboxPort<AnalyticsTx> = {
  async runInTransaction(fn) {
    return prisma.$transaction(fn, { timeout: INBOX_TRANSACTION_TIMEOUT_MS });
  },

  async claim(tx: AnalyticsTx, key: InboxKey, meta: InboxEventMeta): Promise<InboxClaimOutcome> {
    const existing = await tx.inboxEvent.findUnique({
      where: { eventId_consumer: { eventId: key.eventId, consumer: key.consumer } },
    });

    if (existing) {
      if (existing.status === 'PROCESSED') return 'DUPLICATE';

      // A previous attempt left the event unfinished. Taking it over here is
      // safe because that attempt's mutations were rolled back with it.
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

    // A concurrent worker inserting the same key raises P2002 here or at
    // commit; processWithInbox reads that as a duplicate delivery.
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

  async markProcessed(tx: AnalyticsTx, key: InboxKey) {
    await tx.inboxEvent.update({
      where: { eventId_consumer: { eventId: key.eventId, consumer: key.consumer } },
      data: { status: 'PROCESSED', processedAt: new Date(), lastError: null },
    });
  },

  async recordFailure(key: InboxKey, meta: InboxEventMeta, error: Error) {
    // Runs after the transaction rolled back, so the claim row may not exist.
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
