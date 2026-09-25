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

  try {
    return await port.runInTransaction(async (tx) => {
      const claim = await port.claim(tx, key, meta);
      if (claim === 'DUPLICATE') return 'SKIPPED_DUPLICATE';

      await handler(tx);
      await port.markProcessed(tx, key);
      return 'PROCESSED';
    });
  } catch (err) {
    if (port.isUniqueViolation(err)) {
      // Another worker committed this same (eventId, consumer) first. Its
      // transaction owns the mutation; ours rolled back, so this is a
      // duplicate delivery and not an error.
      return 'SKIPPED_DUPLICATE';
    }

    const error = err instanceof Error ? err : new Error(String(err));
    try {
      await port.recordFailure(key, meta, error);
    } catch {
      // Failure bookkeeping is best effort; the original error must surface.
    }
    throw error;
  }
}
