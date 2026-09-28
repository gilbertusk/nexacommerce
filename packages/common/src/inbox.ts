/**
 * Database-backed inbox for exactly-once consumption of broker events.
 *
 * The guarantee this module provides is that a consumer's state mutation and
 * the record marking the event consumed are committed by the same transaction.
 * That removes the partial-side-effect window a separate "save event ->
 * mutate -> mark processed" sequence leaves open: with three transactions a
 * crash in the middle republishes the mutation on redelivery, which for
 * counters and aggregates means double counting.
 *
 * Storage is supplied by the caller through {@link InboxPort} because each
 * service generates its own Prisma client and there is no shared client type
 * to depend on here.
 */

import { createLogger } from '@nexacommerce/logger';
import { recordInboxOutcome } from './reliability-metrics';

const logger = createLogger('inbox');

/** Result of attempting to take ownership of an event for one consumer. */
export type InboxClaimOutcome = 'CLAIMED' | 'DUPLICATE';

/** Result of a full inbox-guarded processing attempt. */
export type InboxOutcome = 'PROCESSED' | 'SKIPPED_DUPLICATE';

/** Identity of one event as seen by one named consumer. */
export interface InboxKey {
  readonly eventId: string;
  readonly consumer: string;
}

/** The parts of the incoming message the inbox persists for audit and replay. */
export interface InboxEventMeta {
  readonly eventName: string;
  readonly payload: unknown;
}

/** An event as delivered by the broker. */
export interface InboxEvent extends InboxEventMeta {
  readonly eventId: string;
}

/**
 * Storage operations the inbox needs. `TTx` is the service's own transaction
 * client, which is handed to the business handler so its writes join the same
 * transaction as the processed marker.
 */
export interface InboxPort<TTx> {
  /**
   * Run `fn` in a single database transaction. Every write made through the
   * supplied client — the handler's and the inbox's — must commit or roll back
   * as one unit.
   */
  runInTransaction<T>(fn: (tx: TTx) => Promise<T>): Promise<T>;

  /**
   * Take ownership of `key` inside the given transaction. Returns `DUPLICATE`
   * when the event was already processed by this consumer.
   */
  claim(tx: TTx, key: InboxKey, meta: InboxEventMeta): Promise<InboxClaimOutcome>;

  /** Record the event as processed. Must be called inside the same transaction. */
  markProcessed(tx: TTx, key: InboxKey): Promise<void>;

  /**
   * Record a failed attempt. Runs outside the aborted transaction, so it must
   * not assume any of the rolled-back state exists.
   */
  recordFailure(key: InboxKey, meta: InboxEventMeta, error: Error): Promise<void>;

  /**
   * True when `err` is the storage engine's unique-constraint violation. A
   * claim that loses a concurrent race surfaces as this error rather than as
   * `DUPLICATE`, because the conflicting row is not visible to this
   * transaction's snapshot until the winner commits.
   */
  isUniqueViolation(err: unknown): boolean;
}

/** Raised when an event cannot be admitted to the inbox at all. */
export class InboxTransactionAborted extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InboxTransactionAborted';
  }
}

/**
 * Process `event` at most once for `consumer`.
 *
 * Returns `SKIPPED_DUPLICATE` when the event was already processed or lost a
 * concurrent claim race. Rethrows the handler's error otherwise, leaving no
 * committed state, so the caller can leave the message unacknowledged and let
 * the broker's retry/DLQ policy decide what happens next.
 */
export async function processWithInbox<TTx>(
  port: InboxPort<TTx>,
  consumer: string,
  event: InboxEvent,
  handler: (tx: TTx) => Promise<void>,
): Promise<InboxOutcome> {
  if (!event?.eventId) {
    // Without a stable identity there is nothing to deduplicate on, so the
    // event is refused rather than processed unguarded.
    throw new InboxTransactionAborted(
      `Event for consumer "${consumer}" has no eventId and cannot be deduplicated`,
    );
  }
  if (!consumer) {
    throw new InboxTransactionAborted('Inbox consumer name is required');
  }

  const key: InboxKey = { eventId: event.eventId, consumer };
  const meta: InboxEventMeta = { eventName: event.eventName, payload: event.payload };

  // Only identifiers and a fixed outcome are logged; payloads may carry
  // customer data and are never written to the log stream.
  const logContext = { eventId: key.eventId, consumer, eventName: event.eventName };

  try {
    const outcome = await port.runInTransaction(async (tx) => {
      const claim = await port.claim(tx, key, meta);
      if (claim === 'DUPLICATE') return 'SKIPPED_DUPLICATE' as const;

      await handler(tx);
      await port.markProcessed(tx, key);
      return 'PROCESSED' as const;
    });
    recordInboxOutcome(consumer, outcome);
    logger.info('Inbox event settled', { ...logContext, outcome });
    return outcome;
  } catch (err) {
    if (port.isUniqueViolation(err)) {
      // Another worker committed this same (eventId, consumer) first. Its
      // transaction owns the mutation; ours rolled back, so this is a
      // duplicate delivery and not an error.
      recordInboxOutcome(consumer, 'SKIPPED_DUPLICATE');
      logger.info('Inbox event settled', { ...logContext, outcome: 'SKIPPED_DUPLICATE', reason: 'concurrent-claim' });
      return 'SKIPPED_DUPLICATE';
    }

    const error = err instanceof Error ? err : new Error(String(err));
    recordInboxOutcome(consumer, 'FAILED');
    logger.warn('Inbox event failed; transaction rolled back', {
      ...logContext,
      outcome: 'FAILED',
      error: error.message.slice(0, 300),
    });
    try {
      await port.recordFailure(key, meta, error);
    } catch {
      // Failure bookkeeping is best effort; the original error must surface.
    }
    throw error;
  }
}

/**
 * Minimal structural view of a generated Prisma client that owns an
 * `inbox_events` table with the shared layout (see Analytics' migration
 * `add_analytics_inbox`). Typed loosely on purpose: each service generates its
 * own client, and there is no common nominal type to import here.
 */
export interface PrismaInboxClient {
  $transaction<T>(fn: (tx: any) => Promise<T>, options?: { timeout?: number; maxWait?: number }): Promise<T>;
  inboxEvent: any;
}

export interface PrismaInboxPortOptions {
  /** Upper bound on one event's transaction; network work happens before it. */
  transactionTimeoutMs?: number;
  /** The service's own P2002 detector (its generated Prisma namespace). */
  isUniqueViolation(err: unknown): boolean;
}

/**
 * Build an {@link InboxPort} over a service's generated Prisma client.
 *
 * Takeover of an unfinished (FAILED/PROCESSING) row is a conditional update
 * guarded by `status <> 'PROCESSED'`. Under PostgreSQL READ COMMITTED a second
 * concurrent transaction blocks on the row lock and then re-evaluates that
 * predicate against the committed version, so exactly one of two racing
 * redeliveries of a previously failed event can claim it.
 */
export function createPrismaInboxPort<TTx = any>(
  client: PrismaInboxClient,
  options: PrismaInboxPortOptions,
): InboxPort<TTx> {
  const timeout = options.transactionTimeoutMs ?? 15_000;
  const whereKey = (key: InboxKey) => ({ eventId_consumer: { eventId: key.eventId, consumer: key.consumer } });

  return {
    runInTransaction(fn) {
      return client.$transaction((tx) => fn(tx as TTx), { timeout });
    },

    async claim(tx: any, key, meta) {
      const existing = await tx.inboxEvent.findUnique({ where: whereKey(key), select: { id: true, status: true } });
      if (!existing) {
        // A concurrent insert of the same key raises P2002 here or at commit;
        // processWithInbox reads that as a duplicate delivery.
        await tx.inboxEvent.create({
          data: {
            eventId: key.eventId,
            consumer: key.consumer,
            eventName: meta.eventName,
            payload: (meta.payload ?? {}) as object,
            status: 'PROCESSING',
          },
        });
        return 'CLAIMED';
      }
      if (existing.status === 'PROCESSED') return 'DUPLICATE';

      // The previous attempt rolled back, so none of its mutations exist.
      const taken = await tx.inboxEvent.updateMany({
        where: { id: existing.id, status: { not: 'PROCESSED' } },
        data: { status: 'PROCESSING', eventName: meta.eventName, payload: (meta.payload ?? {}) as object },
      });
      return taken.count === 1 ? 'CLAIMED' : 'DUPLICATE';
    },

    async markProcessed(tx: any, key) {
      await tx.inboxEvent.update({
        where: whereKey(key),
        data: { status: 'PROCESSED', processedAt: new Date(), lastError: null },
      });
    },

    async recordFailure(key, meta, error) {
      // Runs after the rollback; the claim row may not exist. Never downgrade
      // a row another worker has since committed as PROCESSED.
      const lastError = error.message.slice(0, 1000);
      const updated = await client.inboxEvent.updateMany({
        where: { eventId: key.eventId, consumer: key.consumer, status: { not: 'PROCESSED' } },
        data: { status: 'FAILED', attempts: { increment: 1 }, lastError },
      });
      if (updated.count > 0) return;
      try {
        await client.inboxEvent.create({
          data: {
            eventId: key.eventId,
            consumer: key.consumer,
            eventName: meta.eventName,
            payload: (meta.payload ?? {}) as object,
            status: 'FAILED',
            attempts: 1,
            lastError,
          },
        });
      } catch (createError) {
        // The row appeared concurrently (possibly PROCESSED); leave it alone.
        if (!options.isUniqueViolation(createError)) throw createError;
      }
    },

    // Only a conflict on the inbox key itself means "another worker already
    // owns this event". A unique violation from the handler's own tables (a
    // colliding tracking number, a duplicate business row) must surface as a
    // failure and be retried; reading it as a duplicate would acknowledge an
    // event whose mutation never committed.
    isUniqueViolation: (err) => options.isUniqueViolation(err) && isInboxKeyConflict(err),
  };
}

/** True when a Prisma P2002 names the inbox table or its `(event_id, consumer)` key. */
export function isInboxKeyConflict(err: unknown): boolean {
  const meta = (err as { meta?: { modelName?: unknown; target?: unknown } } | null)?.meta;
  if (!meta) return false;
  if (meta.modelName === 'InboxEvent') return true;
  const target = meta.target;
  if (Array.isArray(target)) {
    return target.some((field) => field === 'event_id' || field === 'eventId');
  }
  return typeof target === 'string' && target.includes('inbox_events');
}
