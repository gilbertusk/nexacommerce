import { createPrismaInboxPort, InboxPort } from '@nexacommerce/common';
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

/**
 * A previous attempt that did not commit left no notification rows or email
 * jobs behind, so the shared port's conditional takeover is safe here.
 */
export const notificationInbox: InboxPort<NotificationTx> = createPrismaInboxPort<NotificationTx>(prisma, {
  transactionTimeoutMs: INBOX_TRANSACTION_TIMEOUT_MS,
  isUniqueViolation: (err) => err instanceof Prisma.PrismaClientKnownRequestError && err.code === UNIQUE_VIOLATION,
});
