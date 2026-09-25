/**
 * Kafka projection behaviour against a live Kafka broker and a live
 * PostgreSQL database.
 *
 * The cases here are the ones a mock cannot answer honestly: whether the
 * offset really stays put when a projection transaction rolls back, whether a
 * second consumer group really replays the log from the beginning, and whether
 * per-key ordering really survives a round trip through a partitioned topic.
 *
 * Requires DATABASE_URL to point at a migrated analytics schema and
 * KAFKA_BROKERS to point at a reachable broker. The suite fails rather than
 * skips when either is unavailable.
 */
import { Kafka, logLevel, type Producer } from 'kafkajs';
import { randomUUID } from 'crypto';
import {
  ANALYTICS_KAFKA_CONSUMER,
  kafkaProjectionLag,
  projectMessage,
  resetKafkaProjectionLag,
  updateLag,
  type IncomingMessage,
} from '../../src/messaging/kafka-consumer';
import { checkEnvelope } from '../../src/services/kafka-projection';
import { prisma } from '../../src/prisma/client';

const BROKERS = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
const TOPIC = 'nexacommerce.orders.v1';
const GROUP = `analytics-projection-test-${randomUUID()}`;

/** A fixed past day so the projection row cannot collide with other suites. */
const DAY_ISO = '2018-07-11T00:00:00.000Z';
const DAY = new Date(Date.UTC(2018, 6, 11));

let kafka: Kafka;
let producer: Producer;

function envelope(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    schemaVersion: 1,
    eventId: randomUUID(),
    eventName: 'OrderCreated',
    occurredAt: DAY_ISO,
    streamedAt: new Date().toISOString(),
    partitionKey: 'order-1',
    payload: { orderId: 'order-1', customerId: 'customer-1' },
    ...overrides,
  };
}

function asMessage(body: unknown, offset = '0'): IncomingMessage {
  return {
    topic: TOPIC,
    partition: 0,
    offset,
    value: Buffer.from(JSON.stringify(body)),
  };
}

async function projectionRow() {
  return prisma.dailySalesProjection.findUnique({ where: { date: DAY } });
}

async function cleanup() {
  await prisma.dailySalesProjection.deleteMany({ where: { date: DAY } });
  await prisma.inboxEvent.deleteMany({ where: { consumer: ANALYTICS_KAFKA_CONSUMER } });
  await prisma.kafkaProjectionProgress.deleteMany({ where: { consumerGroup: { contains: 'test' } } });
}

describe('Kafka daily projection (live Kafka + PostgreSQL)', () => {
  beforeAll(async () => {
    await prisma.$queryRaw`SELECT 1`;
    kafka = new Kafka({ clientId: 'analytics-projection-test', brokers: BROKERS, logLevel: logLevel.NOTHING });
    producer = kafka.producer();
    await producer.connect();
  }, 30_000);

  beforeEach(cleanup);

  afterAll(async () => {
    await cleanup();
    await producer?.disconnect();
    await prisma.$disconnect();
  });

  describe('envelope validation', () => {
    it('rejects an unsupported schema version instead of projecting it', async () => {
      // Act
      const outcome = await projectMessage(asMessage(envelope({ schemaVersion: 99 })), GROUP);

      // Assert
      expect(outcome).toBe('REJECTED');
      expect(await projectionRow()).toBeNull();
    });

    it('rejects a body that is not valid JSON', async () => {
      // Act
      const outcome = await projectMessage(
        { topic: TOPIC, partition: 0, offset: '0', value: Buffer.from('not json') },
        GROUP,
      );

      // Assert
      expect(outcome).toBe('REJECTED');
    });

    it('rejects an envelope missing its event id', async () => {
      // Act
      const checked = checkEnvelope({ ...envelope(), eventId: undefined });

      // Assert
      expect(checked).toEqual({ ok: false, rejection: { reason: 'MALFORMED', detail: 'eventId is missing' } });
    });
  });

  describe('exactly-once projection', () => {
    it('projects an order and records partition progress in one transaction', async () => {
      // Act
      const outcome = await projectMessage(asMessage(envelope()), GROUP);

      // Assert
      expect(outcome).toBe('PROJECTED');
      expect(await projectionRow()).toMatchObject({ totalOrders: 1 });
      const progress = await prisma.kafkaProjectionProgress.findFirst({ where: { consumerGroup: GROUP } });
      expect(progress).toMatchObject({ topic: TOPIC, partition: 0 });
    });

    it('does not count a replayed event twice', async () => {
      // Arrange
      const body = envelope();
      await projectMessage(asMessage(body), GROUP);

      // Act
      const outcome = await projectMessage(asMessage(body), GROUP);

      // Assert
      expect(outcome).toBe('DUPLICATE');
      expect(await projectionRow()).toMatchObject({ totalOrders: 1 });
    });

    it('counts exactly once when the same event is projected concurrently', async () => {
      // Act
      const body = envelope();
      const outcomes = await Promise.all(
        Array.from({ length: 8 }, () => projectMessage(asMessage(body), GROUP)),
      );

      // Assert
      expect(outcomes.filter((o) => o === 'PROJECTED')).toHaveLength(1);
      expect(await projectionRow()).toMatchObject({ totalOrders: 1 });
    });

    it('does not project OrderPaid, which would double the revenue PaymentSuccess already counted', async () => {
      // Act
      await projectMessage(asMessage(envelope({ eventName: 'PaymentSuccess', payload: { paymentId: 'p1', amount: 5000 } })), GROUP);
      await projectMessage(asMessage(envelope({ eventName: 'OrderPaid', payload: { orderId: 'order-1', amount: 5000 } })), GROUP);

      // Assert
      const row = await projectionRow();
      expect(Number(row!.totalRevenue)).toBe(5000);
    });
  });

  describe('failure and offset safety', () => {
    it('reports FAILED without projecting when the database is unreachable mid-transaction', async () => {
      // Arrange: fail the projection transaction itself, which is what a lost
      // database connection looks like to this code path.
      const spy = jest
        .spyOn(prisma, '$transaction')
        .mockRejectedValue(new Error('connection terminated'));

      // Act
      const outcome = await projectMessage(asMessage(envelope()), GROUP);

      // Assert: a FAILED outcome is what tells the consumer not to commit the
      // offset, so the message is read again.
      expect(outcome).toBe('FAILED');
      expect(await projectionRow()).toBeNull();
      spy.mockRestore();
    });

    it('applies exactly once when the same message is redelivered after an uncommitted offset', async () => {
      // Arrange: simulate a crash after the projection committed but before the
      // offset did, which is the redelivery Kafka guarantees is possible.
      const body = envelope();
      const first = await projectMessage(asMessage(body, '10'), GROUP);

      // Act: the consumer restarts and reads the same offset again.
      const second = await projectMessage(asMessage(body, '10'), GROUP);

      // Assert
      expect(first).toBe('PROJECTED');
      expect(second).toBe('DUPLICATE');
      expect(await projectionRow()).toMatchObject({ totalOrders: 1 });
    });

    it('leaves the event reprojectable after a transient failure', async () => {
      // Arrange
      const body = envelope();
      const spy = jest
        .spyOn(prisma, '$transaction')
        .mockRejectedValueOnce(new Error('connection terminated'));
      expect(await projectMessage(asMessage(body), GROUP)).toBe('FAILED');
      spy.mockRestore();

      // Act
      const outcome = await projectMessage(asMessage(body), GROUP);

      // Assert
      expect(outcome).toBe('PROJECTED');
      expect(await projectionRow()).toMatchObject({ totalOrders: 1 });
    });
  });

  describe('consumer lag reporting', () => {
    beforeEach(() => resetKafkaProjectionLag());

    it('reports how many records remain unread on a partition', () => {
      // Arrange: the next produced record will take offset 100, and this
      // consumer has just read offset 90.
      updateLag({ topic: TOPIC, partition: 3, offset: '90', highWatermark: '100', value: null });

      // Assert: offsets 91..99 are still unread.
      expect(kafkaProjectionLag()[`${TOPIC}/3`]).toBe(9);
    });

    it('reports zero lag when the consumer is at the end of the log', () => {
      // Act
      updateLag({ topic: TOPIC, partition: 0, offset: '99', highWatermark: '100', value: null });

      // Assert
      expect(kafkaProjectionLag()[`${TOPIC}/0`]).toBe(0);
    });

    it('never reports negative lag', () => {
      // Act: a stale watermark must not produce a nonsense negative reading.
      updateLag({ topic: TOPIC, partition: 1, offset: '100', highWatermark: '100', value: null });

      // Assert
      expect(kafkaProjectionLag()[`${TOPIC}/1`]).toBe(0);
    });

    it('records nothing when no high watermark is available', () => {
      // Act
      updateLag({ topic: TOPIC, partition: 2, offset: '10', value: null });

      // Assert: silence is better than a fabricated zero, which would look
      // like a healthy consumer.
      expect(kafkaProjectionLag()[`${TOPIC}/2`]).toBeUndefined();
    });

    it('tracks partitions independently', () => {
      // Act
      updateLag({ topic: TOPIC, partition: 0, offset: '10', highWatermark: '20', value: null });
      updateLag({ topic: TOPIC, partition: 1, offset: '5', highWatermark: '100', value: null });

      // Assert
      expect(kafkaProjectionLag()).toEqual({
        [`${TOPIC}/0`]: 9,
        [`${TOPIC}/1`]: 94,
      });
    });
  });

  describe('live broker round trip', () => {
    it('preserves per-key ordering through a partitioned topic', async () => {
      // Arrange: three events for one aggregate key, produced in order.
      const key = `order-${randomUUID()}`;
      const events = ['OrderCreated', 'OrderCompleted', 'OrderCancelled'].map((eventName) =>
        envelope({ eventName, partitionKey: key, payload: { orderId: key, items: [{ quantity: 2 }] } }),
      );
      await producer.send({
        topic: TOPIC,
        messages: events.map((e) => ({ key, value: JSON.stringify(e) })),
      });

      // Act: read them back from the broker.
      const group = `ordering-test-${randomUUID()}`;
      const received = await consumeUntil(group, events.length, key);

      // Assert: one key means one partition, and the broker returns them in
      // the order they were produced.
      expect(received.map((e) => e.eventName)).toEqual([
        'OrderCreated',
        'OrderCompleted',
        'OrderCancelled',
      ]);
      expect(new Set(received.map((e) => e.partition)).size).toBe(1);
    }, 60_000);

    it('replays the log from the beginning for a fresh consumer group', async () => {
      // Arrange
      const key = `order-${randomUUID()}`;
      const body = envelope({ partitionKey: key, payload: { orderId: key } });
      await producer.send({ topic: TOPIC, messages: [{ key, value: JSON.stringify(body) }] });

      // Act: two independent groups both read the message.
      const firstPass = await consumeUntil(`replay-a-${randomUUID()}`, 1, key);
      const secondPass = await consumeUntil(`replay-b-${randomUUID()}`, 1, key);

      // Assert: a rebuild with a new group sees the same history.
      expect(firstPass).toHaveLength(1);
      expect(secondPass).toHaveLength(1);
      expect(secondPass[0].eventId).toBe(firstPass[0].eventId);
    }, 60_000);
  });
});

/**
 * Read from `topic` with a fresh group until `count` messages carrying `key`
 * have been seen, then disconnect.
 */
async function consumeUntil(
  groupId: string,
  count: number,
  key: string,
): Promise<Array<{ eventId: string; eventName: string; partition: number }>> {
  const consumer = kafka.consumer({ groupId });
  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC, fromBeginning: true });

  const seen: Array<{ eventId: string; eventName: string; partition: number }> = [];
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`timed out waiting for ${count} messages`)), 40_000);
    consumer
      .run({
        partitionsConsumedConcurrently: 1,
        eachMessage: async ({ partition, message }) => {
          if (message.key?.toString() !== key) return;
          const body = JSON.parse(message.value!.toString());
          seen.push({ eventId: body.eventId, eventName: body.eventName, partition });
          if (seen.length >= count) {
            clearTimeout(timeout);
            resolve();
          }
        },
      })
      .catch(reject);
  });

  await consumer.disconnect();
  return seen;
}
