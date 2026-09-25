import {
  InboxPort,
  InboxTransactionAborted,
  processWithInbox,
} from '../src/inbox';

/**
 * In-memory double of a database-backed inbox. It models the two properties the
 * real store must provide: a unique (eventId, consumer) key, and a transaction
 * whose effects are discarded as a unit when the handler throws.
 */
type Row = { status: 'PROCESSED'; processedAt: Date };
type Tx = { writes: string[]; rows: Map<string, Row> };

class FakeStore implements InboxPort<Tx> {
  committed = new Map<string, Row>();
  sideEffects: string[] = [];
  failures: Array<{ key: string; error: string }> = [];
  transactions = 0;

  private keyOf(key: { eventId: string; consumer: string }) {
    return `${key.consumer}:${key.eventId}`;
  }

  async runInTransaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
    this.transactions += 1;
    const tx: Tx = { writes: [], rows: new Map() };
    const result = await fn(tx);
    // Commit: staged rows and staged side effects become visible together.
    // A throw from `fn` propagates before this line, so both are discarded.
    for (const [k, v] of tx.rows) this.committed.set(k, v);
    this.sideEffects.push(...tx.writes);
    return result;
  }

  async claim(_tx: Tx, key: { eventId: string; consumer: string }) {
    const existing = this.committed.get(this.keyOf(key));
    if (existing?.status === 'PROCESSED') return 'DUPLICATE' as const;
    return 'CLAIMED' as const;
  }

  async markProcessed(tx: Tx, key: { eventId: string; consumer: string }) {
    tx.writes.push(`mark:${this.keyOf(key)}`);
    tx.rows.set(this.keyOf(key), { status: 'PROCESSED', processedAt: new Date() });
  }

  async recordFailure(key: { eventId: string; consumer: string }, _meta: unknown, error: Error) {
    this.failures.push({ key: this.keyOf(key), error: error.message });
  }

  isUniqueViolation(err: unknown) {
    return err instanceof Error && err.message === 'UNIQUE_VIOLATION';
  }
}

const event = { eventId: 'evt-1', eventName: 'OrderCreated', payload: { orderId: 'o-1' } };
const CONSUMER = 'analytics';

describe('processWithInbox', () => {
  test('runs the handler and marks the event processed in one transaction', async () => {
    // Arrange
    const store = new FakeStore();

    // Act
    const outcome = await processWithInbox(store, CONSUMER, event, async (tx) => {
      tx.writes.push('revenue+100');
    });

    // Assert
    expect(outcome).toBe('PROCESSED');
    expect(store.transactions).toBe(1);
    expect(store.sideEffects).toEqual(['revenue+100', 'mark:analytics:evt-1']);
  });

  test('skips a duplicate redelivery without running the handler again', async () => {
    // Arrange
    const store = new FakeStore();
    await processWithInbox(store, CONSUMER, event, async (tx) => {
      tx.writes.push('revenue+100');
    });

    // Act
    const handler = jest.fn();
    const outcome = await processWithInbox(store, CONSUMER, event, handler);

    // Assert
    expect(outcome).toBe('SKIPPED_DUPLICATE');
    expect(handler).not.toHaveBeenCalled();
    expect(store.sideEffects).toEqual(['revenue+100', 'mark:analytics:evt-1']);
  });

  test('the same event is still processed once per distinct consumer', async () => {
    // Arrange
    const store = new FakeStore();

    // Act
    await processWithInbox(store, 'analytics', event, async (tx) => { tx.writes.push('a'); });
    await processWithInbox(store, 'notification', event, async (tx) => { tx.writes.push('n'); });

    // Assert
    expect(store.sideEffects).toEqual([
      'a',
      'mark:analytics:evt-1',
      'n',
      'mark:notification:evt-1',
    ]);
  });

  test('discards the mutation and the processed marker together when the handler throws', async () => {
    // Arrange
    const store = new FakeStore();

    // Act
    const run = processWithInbox(store, CONSUMER, event, async (tx) => {
      tx.writes.push('revenue+100');
      throw new Error('boom');
    });

    // Assert
    await expect(run).rejects.toThrow('boom');
    expect(store.sideEffects).toEqual([]);
    expect(store.committed.size).toBe(0);
    expect(store.failures).toEqual([{ key: 'analytics:evt-1', error: 'boom' }]);
  });

  test('a failed event can be claimed and processed again on redelivery', async () => {
    // Arrange
    const store = new FakeStore();
    await expect(
      processWithInbox(store, CONSUMER, event, async () => {
        throw new Error('transient');
      }),
    ).rejects.toThrow('transient');

    // Act
    const outcome = await processWithInbox(store, CONSUMER, event, async (tx) => {
      tx.writes.push('revenue+100');
    });

    // Assert
    expect(outcome).toBe('PROCESSED');
    expect(store.sideEffects).toEqual(['revenue+100', 'mark:analytics:evt-1']);
  });

  test('treats a concurrent claim losing the unique race as a duplicate, not a failure', async () => {
    // Arrange
    const store = new FakeStore();
    const handler = jest.fn(async () => {
      throw new Error('UNIQUE_VIOLATION');
    });

    // Act
    const outcome = await processWithInbox(store, CONSUMER, event, handler);

    // Assert
    expect(outcome).toBe('SKIPPED_DUPLICATE');
    expect(store.sideEffects).toEqual([]);
  });

  test('rejects an event that carries no eventId instead of processing it unguarded', async () => {
    // Arrange
    const store = new FakeStore();

    // Act
    const run = processWithInbox(
      store,
      CONSUMER,
      { eventId: '', eventName: 'OrderCreated', payload: {} },
      async (tx) => { tx.writes.push('revenue+100'); },
    );

    // Assert
    await expect(run).rejects.toBeInstanceOf(InboxTransactionAborted);
    expect(store.sideEffects).toEqual([]);
    expect(store.transactions).toBe(0);
  });
});
