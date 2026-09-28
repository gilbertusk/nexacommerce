import { Prisma } from '../../src/generated/client';
import { prisma } from '../../src/prisma/client';
import { finalizeCheckoutWithOrderCreated } from '../../src/services/checkout-finalization';

const payload = (orderId: string) => ({
  orderId,
  customerId: 'customer-1',
  items: [{ productId: 'product-1', quantity: 2, price: 50000 }],
  subtotal: 100000,
  discount: 0,
  shippingCost: 15000,
  grandTotal: 115000,
  voucherId: null,
  shippingAddressId: 'address-1',
});

async function createPendingOrder(id: string) {
  return prisma.order.create({
    data: {
      id,
      orderNumber: `NXC-TEST-${id}`,
      customerId: 'customer-1',
      customerName: 'Test Customer',
      customerEmail: 'customer@example.test',
      subtotal: new Prisma.Decimal(100000),
      discount: new Prisma.Decimal(0),
      shippingCost: new Prisma.Decimal(15000),
      grandTotal: new Prisma.Decimal(115000),
      shippingAddressId: 'address-1',
      shippingAddress: { city: 'Bandung' },
      status: 'PENDING_PAYMENT',
      expiresAt: new Date(Date.now() + 60_000),
    },
  });
}

describe('checkout finalization transaction (live PostgreSQL)', () => {
  beforeEach(async () => {
    await prisma.outboxEvent.deleteMany();
    await prisma.orderStatusHistory.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('commits the finalization marker, history, and OrderCreated outbox row together', async () => {
    await createPendingOrder('order-atomic-commit');
    const finalizedAt = new Date('2026-09-27T11:00:00.000Z');

    await finalizeCheckoutWithOrderCreated(payload('order-atomic-commit'), finalizedAt);

    const [order, histories, outbox] = await Promise.all([
      prisma.order.findUniqueOrThrow({ where: { id: 'order-atomic-commit' } }),
      prisma.orderStatusHistory.findMany({ where: { orderId: 'order-atomic-commit' } }),
      prisma.outboxEvent.findUnique({ where: { id: 'order-created:order-atomic-commit' } }),
    ]);
    expect(order.checkoutFinalizedAt).toEqual(finalizedAt);
    expect(histories).toEqual([
      expect.objectContaining({ note: 'Checkout saga finalized; OrderCreated queued' }),
    ]);
    expect(outbox).toEqual(expect.objectContaining({
      status: 'PENDING',
      eventName: 'OrderCreated',
      routingKey: 'order.created',
    }));
  });

  it('rolls the marker and history back when the deterministic outbox insert conflicts', async () => {
    const orderId = 'order-atomic-rollback';
    await createPendingOrder(orderId);
    await prisma.outboxEvent.create({
      data: {
        id: `order-created:${orderId}`,
        aggregateType: 'Order',
        aggregateId: orderId,
        eventName: 'OrderCreated',
        routingKey: 'order.created',
        eventPayload: { existing: true },
      },
    });

    await expect(finalizeCheckoutWithOrderCreated(payload(orderId))).rejects.toMatchObject({ code: 'P2002' });

    const [order, histories] = await Promise.all([
      prisma.order.findUniqueOrThrow({ where: { id: orderId } }),
      prisma.orderStatusHistory.findMany({ where: { orderId } }),
    ]);
    expect(order.checkoutFinalizedAt).toBeNull();
    expect(histories).toHaveLength(0);
  });
});
