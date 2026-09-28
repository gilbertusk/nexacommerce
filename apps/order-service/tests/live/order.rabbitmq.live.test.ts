/**
 * Order Service end to end against live PostgreSQL and live RabbitMQ.
 *
 * Exercises the real consumer, inbox, outbox, and dispatcher code paths — not
 * mocked channels — inside a disposable vhost. The broker outage case stops
 * and starts the disposable container named by PHASE3_RABBITMQ_CONTAINER.
 */
import { connect, ChannelModel, ConfirmChannel, ConsumeMessage } from 'amqplib';
import { createConsumer, createPublisher } from '@nexacommerce/common';
import { QUEUES } from '@nexacommerce/event-contracts';
import { createIsolatedVhost, dockerContainer, IsolatedVhost, waitFor } from '@nexacommerce/test-utils';
import { Prisma } from '../../src/generated/client';
import { prisma } from '../../src/prisma/client';
import { dispatchOrderOutboxOnce, handleOrderPaymentEvent, initRabbitMQ, stopRabbitMQ } from '../../src/messaging/rabbitmq';
import { ORDER_PAYMENT_CONSUMER } from '../../src/messaging/inbox';
import { finalizeCheckoutWithOrderCreated } from '../../src/services/checkout-finalization';

const PREFIX = 'p3-live-';
let vhost: IsolatedVhost;
const connections = new Set<ChannelModel>();

const owners = new WeakMap<ConfirmChannel, ChannelModel>();

async function open(): Promise<ConfirmChannel> {
  const connection = await connect(vhost.amqpUrl);
  connection.on('error', () => undefined);
  connections.add(connection);
  connection.on('close', () => connections.delete(connection));
  const channel = await connection.createConfirmChannel();
  channel.on('error', () => undefined);
  owners.set(channel, connection);
  return channel;
}

async function closeOwner(channel: ConfirmChannel): Promise<void> {
  await owners.get(channel)?.close().catch(() => undefined);
}

async function closeAll(): Promise<void> {
  await Promise.all([...connections].map((connection) => connection.close().catch(() => undefined)));
  connections.clear();
}

async function queueDepth(queue: string): Promise<number> {
  const channel = await open();
  const { messageCount } = await channel.checkQueue(queue);
  await closeOwner(channel);
  return messageCount;
}

async function createOrder(id: string, overrides: Partial<Prisma.OrderUncheckedCreateInput> = {}) {
  return prisma.order.create({
    data: {
      id,
      orderNumber: `NXC-P3L-${id}`,
      customerId: 'customer-live',
      customerName: 'Live Customer',
      customerEmail: 'live@example.test',
      subtotal: new Prisma.Decimal(100000),
      discount: new Prisma.Decimal(0),
      shippingCost: new Prisma.Decimal(15000),
      grandTotal: new Prisma.Decimal(115000),
      shippingAddressId: 'address-live',
      shippingAddress: { city: 'Bandung' },
      status: 'PENDING_PAYMENT',
      expiresAt: new Date(Date.now() + 60 * 60_000),
      checkoutFinalizedAt: new Date(),
      ...overrides,
    },
  });
}

function paymentSuccess(eventId: string, orderId: string) {
  return {
    eventId,
    eventName: 'PaymentSuccess',
    timestamp: new Date().toISOString(),
    payload: { orderId, paidAt: '2026-09-28T10:00:00.000Z', amount: 115000 },
  };
}

async function publishPayment(event: ReturnType<typeof paymentSuccess>): Promise<void> {
  const channel = await open();
  await createPublisher(channel)('payment.success', event);
  await closeOwner(channel);
}

/** Collect every message the given business queue receives. */
async function tap(queue: string): Promise<ConsumeMessage[]> {
  const channel = await open();
  const received: ConsumeMessage[] = [];
  await channel.consume(queue, (message) => {
    if (!message) return;
    received.push(message);
    channel.ack(message);
  });
  return received;
}

async function cleanupRows(): Promise<void> {
  const orders = { startsWith: PREFIX };
  await prisma.outboxEvent.deleteMany({ where: { aggregateId: orders } });
  await prisma.inboxEvent.deleteMany({ where: { eventId: { startsWith: PREFIX } } });
  await prisma.orderStatusHistory.deleteMany({ where: { orderId: orders } });
  await prisma.order.deleteMany({ where: { id: orders } });
}

/**
 * Other suites share this schema; park their leftover pending rows so the
 * dispatcher in this suite only publishes rows it created.
 */
async function parkForeignOutboxRows(): Promise<void> {
  await prisma.outboxEvent.updateMany({
    where: { status: { in: ['PENDING', 'PROCESSING'] }, NOT: { aggregateId: { startsWith: PREFIX } } },
    data: { status: 'PUBLISHED', publishedAt: new Date(), lockToken: null, lockedAt: null },
  });
}

describe('Order Service over live PostgreSQL + RabbitMQ', () => {
  beforeAll(async () => {
    await prisma.$queryRaw`SELECT 1`;
    vhost = await createIsolatedVhost('phase3-order-live', process.env.PHASE3_ORDER_VHOST);
    await cleanupRows();
    await parkForeignOutboxRows();
  });

  afterEach(async () => {
    await stopRabbitMQ();
    await closeAll();
  });

  afterAll(async () => {
    await stopRabbitMQ();
    await closeAll();
    await cleanupRows();
    await vhost?.cleanup();
    await prisma.$disconnect();
  });

  it('applies a PaymentSuccess delivered twice exactly once and publishes one OrderPaid', async () => {
    const orderId = `${PREFIX}dup`;
    await createOrder(orderId);
    await initRabbitMQ(); // real topology, consumers, and dispatcher
    const orderPaid = await tap(QUEUES.SHIPPING_ORDER_EVENTS);

    const event = paymentSuccess(`${PREFIX}evt-dup`, orderId);
    await publishPayment(event);
    await publishPayment(event); // the same fact delivered twice

    await waitFor(async () => orderPaid.length >= 1, { description: 'OrderPaid on the broker' });
    await waitFor(async () => (await queueDepth(QUEUES.ORDER_PAYMENT_EVENTS)) === 0, { description: 'payment queue drained' });
    await new Promise((resolve) => setTimeout(resolve, 1_500)); // allow a would-be second OrderPaid to appear

    expect((await prisma.order.findUniqueOrThrow({ where: { id: orderId } })).status).toBe('PAID');
    expect(await prisma.orderStatusHistory.count({ where: { orderId, toStatus: 'PAID' } })).toBe(1);
    expect(orderPaid).toHaveLength(1);
    const outboxRow = await prisma.outboxEvent.findFirstOrThrow({ where: { aggregateId: orderId, eventName: 'OrderPaid' } });
    expect(orderPaid[0].properties.messageId).toBe(outboxRow.id);
    expect(outboxRow.status).toBe('PUBLISHED');
  });

  it('does not duplicate the mutation when the consumer dies after commit but before ack', async () => {
    const orderId = `${PREFIX}crash`;
    await createOrder(orderId);
    const event = paymentSuccess(`${PREFIX}evt-crash`, orderId);

    // A consumer that commits through the real inbox path, then loses its
    // connection before the ack is sent.
    const doomed = await open();
    let committed!: () => void;
    const didCommit = new Promise<void>((resolve) => { committed = resolve; });
    await createConsumer(doomed, QUEUES.ORDER_PAYMENT_EVENTS, async (payload) => {
      await handleOrderPaymentEvent(payload);
      committed();
      await closeOwner(doomed); // crash before ack
      await new Promise(() => undefined);
    });
    await publishPayment(event);
    await didCommit;

    // The broker still holds the unacknowledged delivery.
    await waitFor(async () => (await queueDepth(QUEUES.ORDER_PAYMENT_EVENTS)) === 1, { description: 'delivery returned to queue' });

    // Service restarts; the real consumer receives the redelivery.
    await initRabbitMQ();
    await waitFor(async () => (await queueDepth(QUEUES.ORDER_PAYMENT_EVENTS)) === 0, { description: 'redelivery acknowledged' });

    expect(await prisma.orderStatusHistory.count({ where: { orderId, toStatus: 'PAID' } })).toBe(1);
    expect(await prisma.outboxEvent.count({ where: { aggregateId: orderId, eventName: 'OrderPaid' } })).toBe(1);
    expect(await prisma.inboxEvent.findUnique({
      where: { eventId_consumer: { eventId: event.eventId, consumer: ORDER_PAYMENT_CONSUMER } },
    })).toMatchObject({ status: 'PROCESSED' });
  });

  it('processes a backlog that accumulated while the service was down', async () => {
    const ids = [1, 2, 3].map((n) => `${PREFIX}backlog-${n}`);
    for (const id of ids) await createOrder(id);
    await initRabbitMQ(); // declare topology
    await stopRabbitMQ(); // service goes away

    for (const id of ids) await publishPayment(paymentSuccess(`${PREFIX}evt-${id}`, id));
    expect(await queueDepth(QUEUES.ORDER_PAYMENT_EVENTS)).toBe(3);

    await initRabbitMQ(); // service returns
    await waitFor(async () => (await prisma.order.count({ where: { id: { in: ids }, status: 'PAID' } })) === 3, {
      description: 'backlog applied',
    });
    expect(await queueDepth(QUEUES.ORDER_PAYMENT_EVENTS)).toBe(0);
  });

  it('keeps a committed OrderCreated through a broker outage and publishes it once with a stable id afterwards', async () => {
    const broker = dockerContainer('PHASE3_RABBITMQ_CONTAINER');
    const orderId = `${PREFIX}outage`;
    await createOrder(orderId, { checkoutFinalizedAt: null });
    await initRabbitMQ(); // topology exists before the outage
    await stopRabbitMQ();

    broker.stop();
    try {
      // Checkout finalization does not touch the broker, so it commits.
      await finalizeCheckoutWithOrderCreated({
        orderId,
        customerId: 'customer-live',
        items: [{ productId: 'product-live', quantity: 1, price: 100000 }],
        subtotal: 100000,
        discount: 0,
        shippingCost: 15000,
        grandTotal: 115000,
        voucherId: null,
        shippingAddressId: 'address-live',
      });
      await expect(dispatchOrderOutboxOnce()).rejects.toThrow();
      // The dispatcher could not reach the broker, so it claimed nothing: the
      // row is still PENDING with no lease held by a dead attempt.
      const pending = await prisma.outboxEvent.findUniqueOrThrow({ where: { id: `order-created:${orderId}` } });
      expect(pending).toMatchObject({ status: 'PENDING', lockToken: null, publishedAt: null });
    } finally {
      broker.start();
    }

    await waitFor(async () => {
      const probe = await connect(vhost.amqpUrl).catch(() => undefined);
      if (!probe) return false;
      await probe.close();
      return true;
    }, { timeoutMs: 90_000, intervalMs: 1_000, description: 'broker accepting connections' });

    const orderCreated = await tap(QUEUES.ANALYTICS_EVENTS); // bound to order.created
    // Skip the reconnect backoff so the test does not wait out the schedule.
    await prisma.outboxEvent.update({ where: { id: `order-created:${orderId}` }, data: { availableAt: new Date() } });
    await initRabbitMQ();

    const received = await waitFor(async () => orderCreated.find((message) => (
      message.properties.messageId === `order-created:${orderId}`
    )), { timeoutMs: 30_000, description: 'OrderCreated delivered after recovery' });
    await new Promise((resolve) => setTimeout(resolve, 1_000));

    const row = await prisma.outboxEvent.findUniqueOrThrow({ where: { id: `order-created:${orderId}` } });
    expect(row.status).toBe('PUBLISHED');
    expect(JSON.parse(received.content.toString()).eventId).toBe(`order-created:${orderId}`);
    expect(orderCreated.filter((message) => message.properties.messageId === `order-created:${orderId}`)).toHaveLength(1);
  });
});
