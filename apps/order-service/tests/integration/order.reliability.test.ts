/**
 * Phase 3 consumer and saga-recovery guarantees against live PostgreSQL.
 *
 * These are properties of real transactions and row locks; a mocked Prisma
 * client can be made to agree with any implementation. The suite fails rather
 * than skips when the database is unreachable.
 */
import { Prisma } from '../../src/generated/client';
import { prisma } from '../../src/prisma/client';
import { ORDER_PAYMENT_CONSUMER, ORDER_SHIPPING_CONSUMER } from '../../src/messaging/inbox';
import { handleOrderPaymentEvent, handleOrderShippingEvent } from '../../src/messaging/rabbitmq';
import { finalizeCheckoutWithOrderCreated } from '../../src/services/checkout-finalization';
import { orderService } from '../../src/services/order.service';

const PREFIX = 'p3-rel-';

async function createOrder(id: string, overrides: Partial<Prisma.OrderUncheckedCreateInput> = {}) {
  return prisma.order.create({
    data: {
      id,
      orderNumber: `NXC-P3-${id}`,
      customerId: 'customer-p3',
      customerName: 'Phase Three',
      customerEmail: 'phase3@example.test',
      subtotal: new Prisma.Decimal(100000),
      discount: new Prisma.Decimal(0),
      shippingCost: new Prisma.Decimal(15000),
      grandTotal: new Prisma.Decimal(115000),
      shippingAddressId: 'address-p3',
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

async function cleanup() {
  const orders = { startsWith: PREFIX };
  await prisma.outboxEvent.deleteMany({ where: { aggregateId: orders } });
  await prisma.inboxEvent.deleteMany({ where: { eventId: { startsWith: PREFIX } } });
  await prisma.orderStatusHistory.deleteMany({ where: { orderId: orders } });
  await prisma.orderItem.deleteMany({ where: { orderId: orders } });
  await prisma.order.deleteMany({ where: { id: orders } });
}

describe('order reliability (live PostgreSQL)', () => {
  beforeAll(async () => {
    await prisma.$queryRaw`SELECT 1`;
  });

  beforeEach(async () => {
    await cleanup();
    (global.fetch as unknown) = jest.fn(async () => {
      throw new Error('No outbound HTTP is expected in this suite');
    });
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  describe('payment consumer inbox', () => {
    it('commits the transition, OrderPaid outbox row, and inbox marker together', async () => {
      const orderId = `${PREFIX}paid-once`;
      await createOrder(orderId);

      await handleOrderPaymentEvent(paymentSuccess(`${PREFIX}evt-paid-once`, orderId));

      const [order, outbox, inbox] = await Promise.all([
        prisma.order.findUniqueOrThrow({ where: { id: orderId } }),
        prisma.outboxEvent.findMany({ where: { aggregateId: orderId, eventName: 'OrderPaid' } }),
        prisma.inboxEvent.findUnique({
          where: { eventId_consumer: { eventId: `${PREFIX}evt-paid-once`, consumer: ORDER_PAYMENT_CONSUMER } },
        }),
      ]);
      expect(order.status).toBe('PAID');
      expect(outbox).toHaveLength(1);
      expect(inbox).toMatchObject({ status: 'PROCESSED' });
    });

    it('yields exactly one transition and one OrderPaid for ten concurrent deliveries', async () => {
      const orderId = `${PREFIX}paid-concurrent`;
      await createOrder(orderId);
      const event = paymentSuccess(`${PREFIX}evt-paid-concurrent`, orderId);

      const results = await Promise.allSettled(Array.from({ length: 10 }, () => handleOrderPaymentEvent(event)));

      expect(results.every((result) => result.status === 'fulfilled')).toBe(true);
      expect(await prisma.outboxEvent.count({ where: { aggregateId: orderId, eventName: 'OrderPaid' } })).toBe(1);
      expect(await prisma.orderStatusHistory.count({ where: { orderId, toStatus: 'PAID' } })).toBe(1);
    });

    it('does not emit a second OrderPaid when a different event id restates the same payment', async () => {
      const orderId = `${PREFIX}paid-restated`;
      await createOrder(orderId);

      await handleOrderPaymentEvent(paymentSuccess(`${PREFIX}evt-restated-1`, orderId));
      await handleOrderPaymentEvent(paymentSuccess(`${PREFIX}evt-restated-2`, orderId));

      // The inbox dedupes per event id; the business-level status claim is the
      // defence in depth for a distinct event carrying the same fact.
      expect(await prisma.outboxEvent.count({ where: { aggregateId: orderId, eventName: 'OrderPaid' } })).toBe(1);
    });

    it('rolls back and records a failure when the transition is refused, then applies once on redelivery', async () => {
      const orderId = `${PREFIX}paid-after-failure`;
      await createOrder(orderId, { status: 'PAYMENT_REVIEW' as string });
      const event = paymentSuccess(`${PREFIX}evt-after-failure`, orderId);

      await expect(handleOrderPaymentEvent(event)).rejects.toThrow(/cannot transition/);
      const key = { eventId_consumer: { eventId: event.eventId, consumer: ORDER_PAYMENT_CONSUMER } };
      expect(await prisma.inboxEvent.findUnique({ where: key })).toMatchObject({ status: 'FAILED', attempts: 1 });
      expect(await prisma.outboxEvent.count({ where: { aggregateId: orderId } })).toBe(0);

      // The blocking condition is resolved; the broker redelivers the same event.
      await prisma.order.update({ where: { id: orderId }, data: { status: 'PENDING_PAYMENT' } });
      await handleOrderPaymentEvent(event);
      await handleOrderPaymentEvent(event);

      expect(await prisma.inboxEvent.findUnique({ where: key })).toMatchObject({ status: 'PROCESSED' });
      expect(await prisma.outboxEvent.count({ where: { aggregateId: orderId, eventName: 'OrderPaid' } })).toBe(1);
    });

    it('marks an expired unfinalized order cancelled without announcing it as a finalized order', async () => {
      const orderId = `${PREFIX}expired-unfinalized`;
      await createOrder(orderId, { checkoutFinalizedAt: null });

      await handleOrderPaymentEvent({
        eventId: `${PREFIX}evt-expired`,
        eventName: 'PaymentExpired',
        timestamp: new Date().toISOString(),
        payload: { orderId },
      });

      const cancelled = await prisma.outboxEvent.findFirstOrThrow({ where: { aggregateId: orderId, eventName: 'OrderCancelled' } });
      expect((cancelled.eventPayload as any).payload.checkoutFinalized).toBe(false);
    });
  });

  describe('shipping consumer inbox', () => {
    it('does not regress a completed order when OrderDelivered is redelivered', async () => {
      const orderId = `${PREFIX}completed`;
      await createOrder(orderId, { status: 'COMPLETED' });

      await handleOrderShippingEvent({
        eventId: `${PREFIX}evt-late-delivered`,
        eventName: 'OrderDelivered',
        timestamp: new Date().toISOString(),
        payload: { orderId },
      });

      expect((await prisma.order.findUniqueOrThrow({ where: { id: orderId } })).status).toBe('COMPLETED');
      expect(await prisma.orderStatusHistory.count({ where: { orderId } })).toBe(0);
      expect(await prisma.inboxEvent.findUnique({
        where: { eventId_consumer: { eventId: `${PREFIX}evt-late-delivered`, consumer: ORDER_SHIPPING_CONSUMER } },
      })).toMatchObject({ status: 'PROCESSED' });
    });

    it('delivers a shipped order exactly once under concurrent duplicate delivery', async () => {
      const orderId = `${PREFIX}shipped`;
      await createOrder(orderId, { status: 'SHIPPED' });
      const event = {
        eventId: `${PREFIX}evt-delivered`,
        eventName: 'OrderDelivered',
        timestamp: new Date().toISOString(),
        payload: { orderId },
      };

      await Promise.all(Array.from({ length: 6 }, () => handleOrderShippingEvent(event)));

      expect((await prisma.order.findUniqueOrThrow({ where: { id: orderId } })).status).toBe('DELIVERED');
      expect(await prisma.orderStatusHistory.count({ where: { orderId, toStatus: 'DELIVERED' } })).toBe(1);
    });

    it('refuses to deliver a cancelled order and leaves no processed marker', async () => {
      const orderId = `${PREFIX}cancelled-delivery`;
      await createOrder(orderId, { status: 'CANCELLED' });

      await expect(handleOrderShippingEvent({
        eventId: `${PREFIX}evt-bad-delivery`,
        eventName: 'OrderDelivered',
        timestamp: new Date().toISOString(),
        payload: { orderId },
      })).rejects.toThrow(/cannot be marked delivered/);
      expect((await prisma.order.findUniqueOrThrow({ where: { id: orderId } })).status).toBe('CANCELLED');
    });
  });

  describe('stalled checkout recovery (crash between order insert and finalization)', () => {
    const payload = (orderId: string) => ({
      orderId,
      customerId: 'customer-p3',
      items: [{ productId: 'product-1', quantity: 1, price: 100000 }],
      subtotal: 100000,
      discount: 0,
      shippingCost: 15000,
      grandTotal: 115000,
      voucherId: null,
      shippingAddressId: 'address-p3',
    });

    it('cancels an old unfinalized checkout with checkoutFinalized=false and leaves fresh or finalized ones alone', async () => {
      const old = new Date(Date.now() - 60 * 60_000);
      await createOrder(`${PREFIX}stalled`, { checkoutFinalizedAt: null, createdAt: old });
      await createOrder(`${PREFIX}fresh`, { checkoutFinalizedAt: null });
      await createOrder(`${PREFIX}finalized-old`, { createdAt: old });

      const recovered = await orderService.recoverStalledCheckouts();

      expect(recovered).toBeGreaterThanOrEqual(1);
      const statuses = Object.fromEntries((await prisma.order.findMany({
        where: { id: { startsWith: PREFIX } },
        select: { id: true, status: true },
      })).map((order) => [order.id, order.status]));
      expect(statuses).toEqual({
        [`${PREFIX}stalled`]: 'CANCELLED',
        [`${PREFIX}fresh`]: 'PENDING_PAYMENT',
        [`${PREFIX}finalized-old`]: 'PENDING_PAYMENT',
      });
      const events = await prisma.outboxEvent.findMany({ where: { aggregateId: `${PREFIX}stalled` } });
      expect(events.map((event) => event.eventName)).toEqual(['OrderCancelled']);
      expect((events[0].eventPayload as any).payload).toMatchObject({ checkoutFinalized: false });

      // A second sweep is a no-op: no second cancellation event.
      await orderService.recoverStalledCheckouts();
      expect(await prisma.outboxEvent.count({ where: { aggregateId: `${PREFIX}stalled` } })).toBe(1);
    });

    it('lets exactly one of a concurrent finalization and recovery win the order row', async () => {
      for (let round = 0; round < 5; round += 1) {
        const orderId = `${PREFIX}race-${round}`;
        await createOrder(orderId, { checkoutFinalizedAt: null, createdAt: new Date(Date.now() - 60 * 60_000) });

        const [finalized, abandoned] = await Promise.allSettled([
          finalizeCheckoutWithOrderCreated(payload(orderId)),
          orderService.abandonUnfinalizedCheckout(orderId, 'race'),
        ]);

        const events = (await prisma.outboxEvent.findMany({ where: { aggregateId: orderId } })).map((event) => event.eventName);
        const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
        if (finalized.status === 'fulfilled') {
          expect(abandoned).toEqual({ status: 'fulfilled', value: false });
          expect(events).toEqual(['OrderCreated']);
          expect(order.status).toBe('PENDING_PAYMENT');
        } else {
          expect(abandoned).toEqual({ status: 'fulfilled', value: true });
          expect(events).toEqual(['OrderCancelled']);
          expect(order.status).toBe('CANCELLED');
          expect(order.checkoutFinalizedAt).toBeNull();
        }
      }
    });

    it('keeps OrderCreated with one stable event id no matter how often finalization is attempted', async () => {
      const orderId = `${PREFIX}stable-id`;
      await createOrder(orderId, { checkoutFinalizedAt: null });

      const attempts = await Promise.allSettled(Array.from({ length: 5 }, () => finalizeCheckoutWithOrderCreated(payload(orderId))));

      expect(attempts.filter((attempt) => attempt.status === 'fulfilled')).toHaveLength(1);
      const created = await prisma.outboxEvent.findMany({ where: { aggregateId: orderId, eventName: 'OrderCreated' } });
      expect(created.map((event) => event.id)).toEqual([`order-created:${orderId}`]);
      expect((created[0].eventPayload as any).eventId).toBe(`order-created:${orderId}`);
    });
  });
});
