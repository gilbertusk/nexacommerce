import { createPrismaInboxPort, InboxPort } from '@nexacommerce/common';
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

/**
 * The shared port claims with a conditional takeover and never downgrades a
 * PROCESSED row when a losing attempt records its failure. The previous
 * service-local adapter used an unconditional update/upsert for both, which
 * could let two racing redeliveries of a failed event both apply it.
 */
export const analyticsInbox: InboxPort<AnalyticsTx> = createPrismaInboxPort<AnalyticsTx>(prisma, {
  transactionTimeoutMs: INBOX_TRANSACTION_TIMEOUT_MS,
  isUniqueViolation: (err) => err instanceof Prisma.PrismaClientKnownRequestError && err.code === UNIQUE_VIOLATION,
});
