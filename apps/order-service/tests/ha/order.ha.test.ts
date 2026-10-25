/**
 * Order Service over the HA staging cluster with production-style access:
 * TLS to all three nodes, the `order-service` user (publish events, read its
 * own queues, no `configure`), and RABBITMQ_TOPOLOGY_MODE=verify.
 *
 * Proves the real consumer + inbox + outbox + dispatcher keep working when the
 * node Order Service is attached to is killed, and that nothing is duplicated.
 */
import { ChannelModel, ConfirmChannel, ConsumeMessage } from 'amqplib';
import { connectRabbitMQ, createPublisher } from '@nexacommerce/common';
import { QUEUES } from '@nexacommerce/event-contracts';
import { haEnv, haService, waitFor } from '@nexacommerce/test-utils';
import { Prisma } from '../../src/generated/client';
import { prisma } from '../../src/prisma/client';
import { initRabbitMQ, stopRabbitMQ } from '../../src/messaging/rabbitmq';

const PREFIX = `p3-ha-${Date.now()}-`;
const connections: ChannelModel[] = [];

async function adminChannel(): Promise<ConfirmChannel> {
  const connection = await connectRabbitMQ(haEnv('HA_RABBITMQ_ADMIN_URLS'), 30, 500);
  connection.on('error', () => undefined);
  connections.push(connection);
  const channel = await connection.createConfirmChannel();
  channel.on('error', () => undefined);
  return channel;
}

async function createOrder(id: string) {
  return prisma.order.create({
    data: {
      id,
      orderNumber: `NXC-HA-${id}`,
      customerId: 'customer-ha',
      customerName: 'HA Customer',
      customerEmail: 'ha@example.test',
      subtotal: new Prisma.Decimal(100000),
      discount: new Prisma.Decimal(0),
      shippingCost: new Prisma.Decimal(15000),
      grandTotal: new Prisma.Decimal(115000),
      shippingAddressId: 'address-ha',
      shippingAddress: { city: 'Bandung' },
      status: 'PENDING_PAYMENT',
      expiresAt: new Date(Date.now() + 60 * 60_000),
      checkoutFinalizedAt: new Date(),
    },
  });
}

async function connectedNode(): Promise<string | undefined> {
  // The admin connection list is served by any node; the management API shows
  // which node holds the order-service user's connection.
  const url = new URL(haEnv('HA_RABBITMQ_MANAGEMENT_URL'));
  const auth = Buffer.from(`${decodeURIComponent(url.username)}:${decodeURIComponent(url.password)}`).toString('base64');
  const https = await import('https');
  const fs = await import('fs');
  for (const host of ['172.29.10.11', '172.29.10.12', '172.29.10.13']) {
    const body = await new Promise<string>((resolve) => {
      const req = https.request({ host, port: Number(url.port), path: '/api/connections', ca: fs.readFileSync(haEnv('HA_CA_FILE')), headers: { authorization: `Basic ${auth}` }, timeout: 5_000 }, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => resolve(data));
      });
      req.on('error', () => resolve(''));
      req.on('timeout', () => req.destroy());
      req.end();
    });
    if (!body) continue;
    const mine = (JSON.parse(body) as any[]).find((connection) => connection.user === 'order-service');
    return mine ? String(mine.node).replace('rabbit@', '') : undefined;
  }
  return undefined;
}

describe('Order Service on the HA cluster with least privilege', () => {
  jest.setTimeout(300_000);

  beforeAll(async () => {
    await prisma.$queryRaw`SELECT 1`;
    // Only this suite's rows are dispatched.
    await prisma.outboxEvent.updateMany({
      where: { status: { in: ['PENDING', 'PROCESSING'] } },
      data: { status: 'PUBLISHED', publishedAt: new Date(), lockToken: null, lockedAt: null },
    });
  });

  afterAll(async () => {
    await stopRabbitMQ();
    const channel = await adminChannel();
    for (const queue of [QUEUES.ORDER_PAYMENT_EVENTS, QUEUES.SHIPPING_ORDER_EVENTS, QUEUES.ANALYTICS_EVENTS, QUEUES.NOTIFICATION_EVENTS, QUEUES.EVENT_STREAM_BUSINESS_FACTS, QUEUES.INVENTORY_ORDER_EVENTS]) {
      await channel.purgeQueue(queue).catch(() => undefined);
    }
    await Promise.all(connections.map((connection) => connection.close().catch(() => undefined)));
    for (const node of ['rmq-1', 'rmq-2', 'rmq-3']) {
      try { haService(node).start(); } catch { /* running */ }
    }
    await prisma.$disconnect();
  });

  it('processes payments exactly once and publishes OrderPaid while its broker node is killed', async () => {
    const ids = Array.from({ length: 20 }, (_, i) => `${PREFIX}${i}`);
    for (const id of ids) await createOrder(id);

    const admin = await adminChannel();
    await admin.purgeQueue(QUEUES.SHIPPING_ORDER_EVENTS);
    const orderPaid: ConsumeMessage[] = [];
    await admin.consume(QUEUES.SHIPPING_ORDER_EVENTS, (message) => {
      if (!message) return;
      orderPaid.push(message);
      admin.ack(message);
    });
    const publish = createPublisher(admin);

    await initRabbitMQ(); // verify mode + least-privilege user: must not need `configure`
    await waitFor(async () => Boolean(await connectedNode()), { description: 'order-service connected' });
    const victim = (await connectedNode())!;

    // First half, then kill the node Order Service is attached to, then the rest.
    for (const id of ids.slice(0, 10)) {
      await publish('payment.success', { eventId: `${id}-pay`, eventName: 'PaymentSuccess', timestamp: new Date().toISOString(), payload: { orderId: id, paidAt: new Date().toISOString(), amount: 115000 } });
    }
    haService(victim).stop();
    try {
      for (const id of ids.slice(10)) {
        await publish('payment.success', { eventId: `${id}-pay`, eventName: 'PaymentSuccess', timestamp: new Date().toISOString(), payload: { orderId: id, paidAt: new Date().toISOString(), amount: 115000 } })
          .catch(async () => {
            // The admin publisher may itself have been on the victim node.
            const retry = createPublisher(await adminChannel());
            await retry('payment.success', { eventId: `${id}-pay`, eventName: 'PaymentSuccess', timestamp: new Date().toISOString(), payload: { orderId: id, paidAt: new Date().toISOString(), amount: 115000 } });
          });
      }

      await waitFor(async () => (await prisma.order.count({ where: { id: { in: ids }, status: 'PAID' } })) === ids.length, {
        timeoutMs: 180_000,
        intervalMs: 1_000,
        description: 'all orders paid through the surviving nodes',
      });
      await waitFor(async () => (await prisma.outboxEvent.count({ where: { aggregateId: { in: ids }, eventName: 'OrderPaid', status: 'PUBLISHED' } })) === ids.length, {
        timeoutMs: 180_000,
        intervalMs: 1_000,
        description: 'every OrderPaid published',
      });
    } finally {
      haService(victim).start();
    }

    expect(await prisma.orderStatusHistory.count({ where: { orderId: { in: ids }, toStatus: 'PAID' } })).toBe(ids.length);
    expect(await prisma.outboxEvent.count({ where: { aggregateId: { in: ids }, eventName: 'OrderPaid' } })).toBe(ids.length);
    console.log(`[HA] order-service attached to ${victim}, killed mid-stream; ${ids.length}/${ids.length} paid exactly once`);
  });
});
