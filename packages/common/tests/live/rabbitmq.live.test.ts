/**
 * RabbitMQ delivery guarantees against a live broker.
 *
 * Runs the production topology (same exchange/queue names and arguments) in a
 * disposable vhost. Requires RABBITMQ_LIVE_URL (amqp://user:pass@host:port,
 * no vhost), RABBITMQ_MANAGEMENT_URL (http://user:pass@host:port), and, for
 * the restart case, PHASE3_RABBITMQ_CONTAINER naming a disposable
 * `phase3-test-*` container. Missing configuration fails the suite.
 */
import { connect, ChannelModel, ConfirmChannel, ConsumeMessage, GetMessage } from 'amqplib';
import { EXCHANGE_NAME, QUEUES } from '@nexacommerce/event-contracts';
import {
  createIsolatedVhost,
  dockerContainer,
  IsolatedVhost,
  waitFor,
} from '@nexacommerce/test-utils';
import {
  createConsumer,
  createPublisher,
  DEAD_LETTER_EXCHANGE,
  RETRY_EXCHANGE,
  setupExchangeAndQueues,
} from '../../src/rabbitmq';
import { createResilientConsumer } from '../../src/resilient-consumer';
import { auditQueue, expectedQueueSpecs, moveQueueMessages } from '../../src/topology';
import { isDependencyReady } from '../../src/reliability-metrics';

jest.setTimeout(120_000);

const QUEUE = QUEUES.SHIPPING_ORDER_EVENTS; // bound to order.paid
const DLQ = `${QUEUE}.dead`;
const RETRY_QUEUE = `${QUEUE}.retry.order_paid`;

let vhost: IsolatedVhost;
const openConnections = new Set<ChannelModel>();

async function open(): Promise<{ connection: ChannelModel; channel: ConfirmChannel }> {
  const connection = await connect(vhost.amqpUrl);
  connection.on('error', () => undefined);
  openConnections.add(connection);
  connection.on('close', () => openConnections.delete(connection));
  const channel = await connection.createConfirmChannel();
  channel.on('error', () => undefined);
  return { connection, channel };
}

async function close(connection: ChannelModel): Promise<void> {
  await connection.close().catch(() => undefined);
  openConnections.delete(connection);
}

async function readyCount(queue: string): Promise<number> {
  const { connection, channel } = await open();
  try {
    return (await channel.checkQueue(queue)).messageCount;
  } finally {
    await close(connection);
  }
}

async function drain(queue: string): Promise<GetMessage[]> {
  const { connection, channel } = await open();
  const messages: GetMessage[] = [];
  try {
    for (;;) {
      const message = await channel.get(queue, { noAck: false });
      if (!message) break;
      messages.push(message);
      channel.ack(message);
    }
    return messages;
  } finally {
    await close(connection);
  }
}

function event(eventId: string, extra: Record<string, unknown> = {}) {
  return { eventId, eventName: 'OrderPaid', timestamp: new Date().toISOString(), payload: { orderId: `order-${eventId}`, ...extra } };
}

async function publish(eventId: string): Promise<void> {
  const { connection, channel } = await open();
  try {
    await createPublisher(channel)('order.paid', event(eventId));
  } finally {
    await close(connection);
  }
}

describe('RabbitMQ reliability (live broker)', () => {
  beforeAll(async () => {
    vhost = await createIsolatedVhost('phase3-rmq-live');
    const { connection, channel } = await open();
    await setupExchangeAndQueues(channel);
    await close(connection);
  });

  afterEach(async () => {
    await Promise.all([...openConnections].map((connection) => close(connection)));
    const { connection, channel } = await open();
    for (const queue of [QUEUE, DLQ, RETRY_QUEUE]) await channel.purgeQueue(queue);
    await close(connection);
  });

  afterAll(async () => {
    await Promise.all([...openConnections].map((connection) => close(connection)));
    await vhost?.cleanup();
  });

  it('declares durable quorum main, retry, and dead-letter queues with bounded delivery', async () => {
    const [main, retry, dead] = await Promise.all([vhost.queue(QUEUE), vhost.queue(RETRY_QUEUE), vhost.queue(DLQ)]);

    expect(main).toMatchObject({
      durable: true,
      type: 'quorum',
      arguments: expect.objectContaining({
        'x-queue-type': 'quorum',
        'x-delivery-limit': 20,
        'x-dead-letter-exchange': DEAD_LETTER_EXCHANGE,
        'x-dead-letter-routing-key': QUEUE,
      }),
    });
    expect(retry).toMatchObject({
      durable: true,
      type: 'quorum',
      arguments: expect.objectContaining({ 'x-message-ttl': 5000, 'x-dead-letter-exchange': EXCHANGE_NAME }),
    });
    expect(dead).toMatchObject({ durable: true, type: 'quorum' });

    // Re-declaring the same topology is idempotent (every service does it on connect).
    const { connection, channel } = await open();
    await expect(setupExchangeAndQueues(channel)).resolves.toBeUndefined();
    await close(connection);
  });

  it('refuses to redeclare an existing classic queue as quorum, so migration goes through a temporary queue', async () => {
    const legacy = await createIsolatedVhost('phase3-rmq-legacy');
    try {
      const connection = await connect(legacy.amqpUrl);
      connection.on('error', () => undefined);
      const setupChannel = await connection.createConfirmChannel();
      await setupChannel.assertQueue(QUEUE, { durable: true }); // a pre-Phase-3 classic queue
      await setupChannel.sendToQueue(QUEUE, Buffer.from('{"legacy":true}'), { persistent: true });
      await setupChannel.waitForConfirms();
      const channel = await connection.createConfirmChannel();
      channel.on('error', () => undefined);

      await expect(setupExchangeAndQueues(channel)).rejects.toThrow(/PRECONDITION_FAILED|inequivalent arg/);

      // Nothing was deleted: the legacy backlog is intact for a drain/cutover.
      const inspect = await connection.createChannel();
      expect((await inspect.checkQueue(QUEUE)).messageCount).toBe(1);
      expect((await legacy.queue(QUEUE)).type).toBe('classic');
      await connection.close();
    } finally {
      await legacy.cleanup();
    }
  });

  it('audits the declared topology as fully matching the production spec', async () => {
    const results = [];
    for (const spec of expectedQueueSpecs()) {
      const [queue, bindings] = await Promise.all([vhost.queue(spec.name), vhost.queueBindings(spec.name)]);
      results.push(auditQueue(spec, queue, bindings));
    }
    expect(results.filter((result) => !result.ok)).toEqual([]);
    expect(results.length).toBeGreaterThan(30);
  });

  it('migrates a classic queue with backlog to quorum without losing a message', async () => {
    const legacy = await createIsolatedVhost('phase3-rmq-migrate');
    const connection = await connect(legacy.amqpUrl);
    connection.on('error', () => undefined);
    try {
      const channel = await connection.createConfirmChannel();
      const spec = expectedQueueSpecs().find((candidate) => candidate.name === QUEUE)!;
      const temp = `${QUEUE}.migration`;
      const publishFact = (id: string) => createPublisher(channel)('order.paid', event(id));

      // Pre-Phase-3 state: classic queue, bound, with a backlog.
      await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });
      await channel.assertQueue(QUEUE, { durable: true });
      for (const binding of spec.bindings) await channel.bindQueue(QUEUE, binding.exchange, binding.routingKey);
      for (const id of ['m-1', 'm-2', 'm-3']) await publishFact(id);

      // 1. Temporary quorum queue takes over the bindings before the old ones go.
      await channel.assertQueue(temp, { durable: true, arguments: { 'x-queue-type': 'quorum' } });
      for (const binding of spec.bindings) await channel.bindQueue(temp, binding.exchange, binding.routingKey);
      await publishFact('m-4'); // overlap: routed to both queues (inbox dedupes the duplicate)
      for (const binding of spec.bindings) await channel.unbindQueue(QUEUE, binding.exchange, binding.routingKey);
      await publishFact('m-5'); // only the temporary queue receives this

      // 2. Drain the classic queue into the temporary quorum queue.
      expect(await moveQueueMessages(channel, QUEUE, temp)).toBe(4);
      expect((await channel.checkQueue(QUEUE)).messageCount).toBe(0);

      // 3. Operator step (not automated): delete the now-empty classic queue.
      await channel.deleteQueue(QUEUE, { ifEmpty: true });

      // 4. New service version declares the quorum topology under the same name.
      await setupExchangeAndQueues(channel);
      await publishFact('m-6'); // overlap again: both queues bound
      for (const binding of spec.bindings) await channel.unbindQueue(temp, binding.exchange, binding.routingKey);

      // 5. Move everything back, then the temporary queue can be removed by the operator.
      await moveQueueMessages(channel, temp, QUEUE);
      expect((await channel.checkQueue(temp)).messageCount).toBe(0);

      const ids: string[] = [];
      for (;;) {
        const message = await channel.get(QUEUE, { noAck: false });
        if (!message) break;
        ids.push(String(message.properties.messageId));
        channel.ack(message);
      }
      expect([...new Set(ids)].sort()).toEqual(['m-1', 'm-2', 'm-3', 'm-4', 'm-5', 'm-6']);
      expect(ids.length).toBeGreaterThanOrEqual(6); // duplicates only, never loss
      expect((await legacy.queue(QUEUE)).type).toBe('quorum');
    } finally {
      await connection.close().catch(() => undefined);
      await legacy.cleanup();
    }
  });

  it('publishes persistent messages whose AMQP messageId is the stable event id', async () => {
    await publish('evt-persist');

    const [message] = await drain(QUEUE);
    expect(message.properties).toMatchObject({ messageId: 'evt-persist', deliveryMode: 2, type: 'OrderPaid' });
  });

  it('dead-letters a malformed message exactly once without invoking the handler', async () => {
    const { connection, channel } = await open();
    const handler = jest.fn(async () => undefined);
    await createConsumer(channel, QUEUE, handler);

    const producer = await open();
    producer.channel.publish(EXCHANGE_NAME, 'order.paid', Buffer.from('{not json'), { persistent: true, messageId: 'poison-1' });
    await producer.channel.waitForConfirms();

    await waitFor(async () => (await readyCount(DLQ)) === 1, { description: 'poison message in DLQ' });
    expect(handler).not.toHaveBeenCalled();
    expect(await readyCount(QUEUE)).toBe(0);
    const [dead] = await drain(DLQ);
    expect(dead.properties.headers?.['x-dead-letter-reason']).toMatch(/JSON|Unexpected/);
    await close(connection);
  });

  it('retries a failing handler within budget with a stable id, then leaves exactly one DLQ copy', async () => {
    const { connection, channel } = await open();
    const seen: Array<{ messageId: string; retryCount: number }> = [];
    await createConsumer(channel, QUEUE, async (_payload, message) => {
      seen.push({
        messageId: String(message.properties.messageId),
        retryCount: Number(message.properties.headers?.['x-retry-count'] ?? 0),
      });
      throw new Error('handler always fails');
    }, { maxRetries: 2 });

    await publish('evt-retry-budget');

    // Two 5s delayed retries, then dead-letter.
    await waitFor(async () => (await readyCount(DLQ)) === 1, { timeoutMs: 40_000, description: 'exhausted message in DLQ' });
    await new Promise((resolve) => setTimeout(resolve, 1_000));

    expect(seen).toEqual([
      { messageId: 'evt-retry-budget', retryCount: 0 },
      { messageId: 'evt-retry-budget', retryCount: 1 },
      { messageId: 'evt-retry-budget', retryCount: 2 },
    ]);
    const dead = await drain(DLQ);
    expect(dead).toHaveLength(1);
    expect(dead[0].properties.messageId).toBe('evt-retry-budget');
    expect(dead[0].properties.headers?.['x-dead-letter-reason']).toBe('handler always fails');
    expect(await readyCount(QUEUE)).toBe(0);
    expect(await readyCount(RETRY_QUEUE)).toBe(0);
    await close(connection);
  });

  it('requeues the source delivery when the retry copy cannot be published, and loses nothing', async () => {
    // Make the retry publish fail at the broker: the retry exchange is gone.
    await vhost.deleteExchange(RETRY_EXCHANGE);

    const failing = await open();
    const firstAttempt: Array<{ messageId: string }> = [];
    const unhandled: unknown[] = [];
    const onUnhandled = (reason: unknown) => unhandled.push(reason);
    process.on('unhandledRejection', onUnhandled);
    try {
      await createConsumer(failing.channel, QUEUE, async (_payload, message) => {
        firstAttempt.push({ messageId: String(message.properties.messageId) });
        throw new Error('transient failure');
      });
      await publish('evt-forward-fails');

      // The failed publish closes the consumer channel (404 NOT_FOUND). The
      // original was never acknowledged, so the broker returns it to the queue.
      await waitFor(async () => firstAttempt.length >= 1 && (await readyCount(QUEUE)) === 1, {
        description: 'source message back in the main queue',
      });
      expect(firstAttempt[0].messageId).toBe('evt-forward-fails');
      expect(await readyCount(DLQ)).toBe(0);
      expect(unhandled).toEqual([]);
    } finally {
      process.off('unhandledRejection', onUnhandled);
      await close(failing.connection);
    }

    // Recovery: topology restored on reconnect, a healthy consumer processes it once.
    const recovered = await open();
    await setupExchangeAndQueues(recovered.channel);
    const processed: Array<{ messageId: string; redelivered: boolean }> = [];
    await createConsumer(recovered.channel, QUEUE, async (_payload, message) => {
      processed.push({ messageId: String(message.properties.messageId), redelivered: message.fields.redelivered });
    });
    await waitFor(async () => processed.length === 1, { description: 'requeued message processed after recovery' });
    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(processed).toEqual([{ messageId: 'evt-forward-fails', redelivered: true }]);
    expect(await readyCount(QUEUE)).toBe(0);
    expect(await readyCount(RETRY_QUEUE)).toBe(0);
    expect(await readyCount(DLQ)).toBe(0);
    await close(recovered.connection);
  });

  it('returns an unacknowledged delivery to the queue when the consumer dies before ack', async () => {
    const { connection, channel } = await open();
    let entered!: () => void;
    const handlerEntered = new Promise<void>((resolve) => { entered = resolve; });
    await createConsumer(channel, QUEUE, async () => {
      entered();
      await new Promise(() => undefined); // never finishes: the process "crashes" first
    });

    await publish('evt-crash-before-ack');
    await handlerEntered;
    await connection.close().catch(() => undefined); // abrupt consumer loss

    const replacement = await open();
    const redelivered = await new Promise<ConsumeMessage>((resolve) => {
      void replacement.channel.consume(QUEUE, (message) => {
        if (message) {
          replacement.channel.ack(message);
          resolve(message);
        }
      });
    });
    expect(redelivered.properties.messageId).toBe('evt-crash-before-ack');
    expect(redelivered.fields.redelivered).toBe(true);
  });

  it('keeps durable queues and a persistent backlog across a broker restart', async () => {
    const broker = dockerContainer('PHASE3_RABBITMQ_CONTAINER');
    for (const id of ['evt-restart-1', 'evt-restart-2', 'evt-restart-3']) await publish(id);
    expect(await readyCount(QUEUE)).toBe(3);

    broker.restart();
    await waitFor(async () => (await readyCount(QUEUE)) === 3, { timeoutMs: 90_000, intervalMs: 1_000, description: 'broker back with backlog' });

    // Backlog is processed by a consumer attached after the restart.
    const { connection, channel } = await open();
    const processed: string[] = [];
    await createConsumer(channel, QUEUE, async (payload) => { processed.push(payload.eventId); });
    await waitFor(async () => processed.length === 3, { description: 'backlog processed after restart' });
    expect(processed.sort()).toEqual(['evt-restart-1', 'evt-restart-2', 'evt-restart-3']);
    expect((await vhost.queue(QUEUE)).type).toBe('quorum');
    await close(connection);
  });

  it('re-attaches a resilient consumer after a broker restart and resumes consumption', async () => {
    const broker = dockerContainer('PHASE3_RABBITMQ_CONTAINER');
    const processed: string[] = [];
    const consumer = createResilientConsumer({
      url: vhost.amqpUrl,
      name: 'phase3-live-resilient',
      reconnectIntervalMs: 1_000,
      setup: async (channel) => {
        await createConsumer(channel, QUEUE, async (payload) => { processed.push(payload.eventId); });
      },
    });
    try {
      await consumer.start();
      expect(consumer.isReady()).toBe(true);
      await publish('evt-before-restart');
      await waitFor(async () => processed.includes('evt-before-restart'), { description: 'pre-restart delivery' });

      broker.restart();
      await waitFor(async () => !consumer.isReady() || undefined, { timeoutMs: 30_000, description: 'consumer notices the outage' });
      await waitFor(async () => consumer.isReady(), { timeoutMs: 90_000, intervalMs: 500, description: 'consumer re-attached' });
      expect(isDependencyReady('rabbitmq')).toBe(true);

      await publish('evt-after-restart');
      await waitFor(async () => processed.includes('evt-after-restart'), { description: 'post-restart delivery' });
      expect(processed).toEqual(['evt-before-restart', 'evt-after-restart']);
    } finally {
      await consumer.stop();
    }
    expect(isDependencyReady('rabbitmq')).toBe(false);
  });

  it('declares the retry and dead-letter exchanges as durable', async () => {
    const { connection, channel } = await open();
    await expect(channel.checkExchange(RETRY_EXCHANGE)).resolves.toBeDefined();
    await expect(channel.checkExchange(DEAD_LETTER_EXCHANGE)).resolves.toBeDefined();
    await close(connection);
  });
});
