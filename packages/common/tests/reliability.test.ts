import {
  createPrismaInboxPort,
  isInboxKeyConflict,
  processWithInbox,
} from '../src/inbox';
import {
  OUTBOX_BACKLOG_SQL,
  recordConsumerOutcome,
  registerBacklogProvider,
  renderReliabilityPrometheusMetrics,
  resetReliabilityMetrics,
  setDependencyReady,
  toBacklogStats,
} from '../src/reliability-metrics';

class UniqueViolation extends Error {
  code = 'P2002';
  constructor(message: string, public meta: Record<string, unknown> = { modelName: 'InboxEvent', target: ['event_id', 'consumer'] }) {
    super(message);
  }
}

/** In-memory stand-in for a Prisma client's `inboxEvent` delegate. */
function fakeInboxClient() {
  const rows = new Map<string, any>();
  const keyOf = (eventId: string, consumer: string) => `${eventId}|${consumer}`;
  const matches = (row: any, where: any) => {
    if (where.id && row.id !== where.id) return false;
    if (where.eventId && row.eventId !== where.eventId) return false;
    if (where.consumer && row.consumer !== where.consumer) return false;
    if (where.status?.not && row.status === where.status.not) return false;
    return true;
  };
  const inboxEvent = {
    findUnique: jest.fn(async ({ where }: any) => rows.get(keyOf(where.eventId_consumer.eventId, where.eventId_consumer.consumer)) ?? null),
    create: jest.fn(async ({ data }: any) => {
      const key = keyOf(data.eventId, data.consumer);
      if (rows.has(key)) throw new UniqueViolation('duplicate');
      const row = { id: key, attempts: 0, ...data };
      rows.set(key, row);
      return row;
    }),
    updateMany: jest.fn(async ({ where, data }: any) => {
      let count = 0;
      for (const row of rows.values()) {
        if (!matches(row, where)) continue;
        for (const [field, value] of Object.entries<any>(data)) {
          row[field] = value?.increment !== undefined ? row[field] + value.increment : value;
        }
        count += 1;
      }
      return { count };
    }),
    update: jest.fn(async ({ where, data }: any) => {
      const row = rows.get(keyOf(where.eventId_consumer.eventId, where.eventId_consumer.consumer));
      Object.assign(row, data);
      return row;
    }),
  };
  const client: { inboxEvent: typeof inboxEvent; $transaction: jest.Mock } = {
    inboxEvent,
    // Not transactional; enough to exercise the port's decision logic.
    $transaction: jest.fn(async (fn: any): Promise<any> => fn(client)),
  };
  return { client, rows };
}

const isUniqueViolation = (err: unknown) => err instanceof UniqueViolation;
const event = { eventId: 'evt-1', eventName: 'OrderPaid', payload: { orderId: 'o-1' } };

describe('createPrismaInboxPort', () => {
  it('processes once and reports later deliveries as duplicates', async () => {
    const { client, rows } = fakeInboxClient();
    const port = createPrismaInboxPort(client, { isUniqueViolation });
    const handler = jest.fn(async () => undefined);

    await expect(processWithInbox(port, 'order', event, handler)).resolves.toBe('PROCESSED');
    await expect(processWithInbox(port, 'order', event, handler)).resolves.toBe('SKIPPED_DUPLICATE');
    expect(handler).toHaveBeenCalledTimes(1);
    expect(rows.get('evt-1|order').status).toBe('PROCESSED');
  });

  it('records a failure and lets a redelivery take the event over', async () => {
    const { client, rows } = fakeInboxClient();
    const port = createPrismaInboxPort(client, { isUniqueViolation });
    // The fake is not transactional, so simulate the rollback of the claim row
    // that a real database would perform before recordFailure runs.
    const failing = jest.fn(async () => {
      rows.delete('evt-1|order');
      throw new Error('boom');
    });

    await expect(processWithInbox(port, 'order', event, failing)).rejects.toThrow('boom');
    expect(rows.get('evt-1|order')).toMatchObject({ status: 'FAILED', attempts: 1, lastError: 'boom' });

    const handler = jest.fn(async () => undefined);
    await expect(processWithInbox(port, 'order', event, handler)).resolves.toBe('PROCESSED');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('never downgrades a PROCESSED row when a losing attempt records its failure', async () => {
    const { client, rows } = fakeInboxClient();
    const port = createPrismaInboxPort(client, { isUniqueViolation });
    await processWithInbox(port, 'order', event, async () => undefined);

    await port.recordFailure({ eventId: 'evt-1', consumer: 'order' }, event, new Error('late loser'));
    expect(rows.get('evt-1|order').status).toBe('PROCESSED');
  });

  it('surfaces a unique violation from a business table as a failure, not a duplicate', async () => {
    const { client, rows } = fakeInboxClient();
    const port = createPrismaInboxPort(client, { isUniqueViolation });
    const collidingInsert = async () => {
      rows.delete('evt-1|order');
      throw new UniqueViolation('tracking number taken', { modelName: 'ShippingOrder', target: ['tracking_number'] });
    };

    await expect(processWithInbox(port, 'order', event, collidingInsert)).rejects.toThrow('tracking number taken');
    expect(rows.get('evt-1|order')).toMatchObject({ status: 'FAILED' });
  });

  it('only recognizes the inbox key as a concurrent-claim conflict', () => {
    expect(isInboxKeyConflict({ meta: { modelName: 'InboxEvent' } })).toBe(true);
    expect(isInboxKeyConflict({ meta: { target: ['event_id', 'consumer'] } })).toBe(true);
    expect(isInboxKeyConflict({ meta: { target: 'inbox_events_event_id_consumer_key' } })).toBe(true);
    expect(isInboxKeyConflict({ meta: { modelName: 'ShippingOrder', target: ['order_id', 'seller_id'] } })).toBe(false);
    expect(isInboxKeyConflict(new Error('no metadata'))).toBe(false);
  });

  it('treats a takeover that matches no unprocessed row as a duplicate', async () => {
    const { client, rows } = fakeInboxClient();
    const port = createPrismaInboxPort(client, { isUniqueViolation });
    rows.set('evt-1|order', { id: 'evt-1|order', eventId: 'evt-1', consumer: 'order', status: 'FAILED', attempts: 1 });
    // A concurrent winner commits between our read and our conditional update.
    client.inboxEvent.findUnique.mockImplementationOnce(async () => {
      const snapshot = { ...rows.get('evt-1|order') };
      rows.get('evt-1|order').status = 'PROCESSED';
      return snapshot;
    });

    await expect(port.claim(client, { eventId: 'evt-1', consumer: 'order' }, event)).resolves.toBe('DUPLICATE');
  });
});

describe('reliability metrics', () => {
  afterEach(() => resetReliabilityMetrics());

  it('renders consumer counters, readiness, and backlog gauges', async () => {
    recordConsumerOutcome('order-service.payment-events', 'ACKED');
    recordConsumerOutcome('order-service.payment-events', 'ACKED');
    recordConsumerOutcome('order-service.payment-events', 'DEAD_LETTERED');
    setDependencyReady('rabbitmq', false);
    registerBacklogProvider('outbox', 'order-service', async () => toBacklogStats([
      { pending: '3', processing: 1, failed: 0, retrying: 2, oldest_pending_age_seconds: 42.5 },
    ]));
    registerBacklogProvider('email', 'notification-service', async () => {
      throw new Error('database down');
    });

    const text = await renderReliabilityPrometheusMetrics();
    expect(text).toContain('nexacommerce_consumer_messages_total{queue="order-service.payment-events",outcome="ACKED"} 2');
    expect(text).toContain('nexacommerce_consumer_messages_total{queue="order-service.payment-events",outcome="DEAD_LETTERED"} 1');
    expect(text).toContain('nexacommerce_dependency_ready{dependency="rabbitmq"} 0');
    expect(text).toContain('nexacommerce_backlog_rows{kind="outbox",service="order-service",state="pending"} 3');
    expect(text).toContain('nexacommerce_backlog_rows{kind="outbox",service="order-service",state="retrying"} 2');
    expect(text).toContain('nexacommerce_backlog_oldest_pending_age_seconds{kind="outbox",service="order-service"} 42.5');
    expect(text).toContain('nexacommerce_backlog_scrape_success{kind="email",service="notification-service"} 0');
  });

  it('defaults an empty backlog row to zeroes', () => {
    expect(toBacklogStats([])).toEqual({ pending: 0, processing: 0, failed: 0, retrying: 0, oldestPendingAgeSeconds: 0 });
    expect(OUTBOX_BACKLOG_SQL).toContain('FROM outbox_events');
  });
});
