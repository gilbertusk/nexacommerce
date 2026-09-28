/**
 * OrderPaid consumption against live PostgreSQL: every seller label for an
 * order commits together with the inbox marker, or none of them do.
 */
import { prisma } from '../../src/prisma/client';
import { handleShippingOrderPaid, SHIPPING_ORDER_PAID_CONSUMER } from '../../src/messaging/rabbitmq';

const COURIER_CODE = 'p3inbox';
const ORDER_PREFIX = 'p3-ship-';

function shipment(sellerId: string, serviceCode = 'REG') {
  return {
    sellerId,
    originCity: 'Bandung',
    originProvince: 'Jawa Barat',
    courierCode: COURIER_CODE,
    serviceCode,
    weightGrams: 1200,
    cost: 18000,
  };
}

function stubOrderService(orderId: string, shipmentBreakdown: unknown[]) {
  (global.fetch as unknown) = jest.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      data: {
        id: orderId,
        shippingAddress: { city: 'Jakarta', province: 'DKI Jakarta', postalCode: '10110' },
        shipmentBreakdown,
        notes: null,
      },
    }),
  }));
}

function orderPaid(eventId: string, orderId: string) {
  return { eventId, eventName: 'OrderPaid', timestamp: new Date().toISOString(), payload: { orderId } };
}

async function cleanup() {
  const orders = await prisma.shippingOrder.findMany({ where: { orderId: { startsWith: ORDER_PREFIX } }, select: { id: true } });
  await prisma.shippingStatusHistory.deleteMany({ where: { shippingOrderId: { in: orders.map((o) => o.id) } } });
  await prisma.shippingOrder.deleteMany({ where: { orderId: { startsWith: ORDER_PREFIX } } });
  await prisma.inboxEvent.deleteMany({ where: { eventId: { startsWith: ORDER_PREFIX } } });
}

describe('shipping OrderPaid inbox (live PostgreSQL)', () => {
  beforeAll(async () => {
    await prisma.$queryRaw`SELECT 1`;
    await cleanup();
    await prisma.courier.deleteMany({ where: { code: COURIER_CODE } });
    await prisma.courier.create({
      data: {
        name: 'Phase 3 Inbox Courier',
        code: COURIER_CODE,
        services: [{ code: 'REG', name: 'Regular', estimatedDays: '2-3' }],
      },
    });
  });

  beforeEach(cleanup);

  afterAll(async () => {
    await cleanup();
    await prisma.courier.deleteMany({ where: { code: COURIER_CODE } });
    await prisma.$disconnect();
  });

  it('commits no label at all when a later seller label fails, then all labels once on redelivery', async () => {
    const orderId = `${ORDER_PREFIX}partial`;
    const event = orderPaid(`${ORDER_PREFIX}evt-partial`, orderId);

    // The second seller's service code is not offered by the courier.
    stubOrderService(orderId, [shipment('seller-a'), shipment('seller-b', 'NOPE')]);
    await expect(handleShippingOrderPaid(event)).rejects.toThrow(/Invalid service code/);
    expect(await prisma.shippingOrder.count({ where: { orderId } })).toBe(0);
    expect(await prisma.inboxEvent.findUnique({
      where: { eventId_consumer: { eventId: event.eventId, consumer: SHIPPING_ORDER_PAID_CONSUMER } },
    })).toMatchObject({ status: 'FAILED' });

    // The operator corrects the courier data; the broker redelivers.
    stubOrderService(orderId, [shipment('seller-a'), shipment('seller-b')]);
    await handleShippingOrderPaid(event);
    await handleShippingOrderPaid(event);

    expect(await prisma.shippingOrder.count({ where: { orderId } })).toBe(2);
    expect(await prisma.shippingStatusHistory.count({
      where: { shippingOrder: { orderId } },
    })).toBe(2);
  });

  it('creates each seller label exactly once under concurrent duplicate delivery', async () => {
    const orderId = `${ORDER_PREFIX}concurrent`;
    stubOrderService(orderId, [shipment('seller-a'), shipment('seller-b'), shipment('seller-c')]);
    const event = orderPaid(`${ORDER_PREFIX}evt-concurrent`, orderId);

    const results = await Promise.allSettled(Array.from({ length: 6 }, () => handleShippingOrderPaid(event)));

    expect(results.every((result) => result.status === 'fulfilled')).toBe(true);
    expect(await prisma.shippingOrder.count({ where: { orderId } })).toBe(3);
  });

  it('keeps per-seller uniqueness as defence in depth for a distinct event restating the payment', async () => {
    const orderId = `${ORDER_PREFIX}restated`;
    stubOrderService(orderId, [shipment('seller-a')]);

    await handleShippingOrderPaid(orderPaid(`${ORDER_PREFIX}evt-restated-1`, orderId));
    await handleShippingOrderPaid(orderPaid(`${ORDER_PREFIX}evt-restated-2`, orderId));

    expect(await prisma.shippingOrder.count({ where: { orderId } })).toBe(1);
  });
});
