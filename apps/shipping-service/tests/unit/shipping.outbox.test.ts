const mockOutboxEvent = {
  create: jest.fn(),
  findMany: jest.fn(),
  updateMany: jest.fn(),
};

const mockPrisma: any = {
  outboxEvent: mockOutboxEvent,
  $transaction: jest.fn(async (callback) => callback(mockPrisma)),
};

jest.mock('../../src/prisma/client', () => ({ prisma: mockPrisma }));

import {
  claimShippingOutboxBatch,
  enqueueOrderDelivered,
  enqueueOrderShipped,
  markShippingOutboxPublished,
  releaseShippingOutboxClaim,
  rescheduleShippingOutbox,
} from '../../src/messaging/outbox';

describe('shipping outbox', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOutboxEvent.create.mockResolvedValue({});
    mockOutboxEvent.updateMany.mockResolvedValue({ count: 1 });
  });

  it.each([
    ['OrderShipped', 'order.shipped', () => enqueueOrderShipped({ outboxEvent: mockOutboxEvent } as any, {
      orderId: 'order-1',
      customerId: 'customer-1',
      trackingNumber: 'TRACK-1',
      courierName: 'JNE',
      serviceName: 'Regular',
    })],
    ['OrderDelivered', 'order.delivered', () => enqueueOrderDelivered({ outboxEvent: mockOutboxEvent } as any, {
      orderId: 'order-1',
      customerId: 'customer-1',
      deliveredAt: '2026-09-24T05:00:00.000Z',
    })],
  ])('writes a stable %s envelope', async (eventName, routingKey, enqueue) => {
    await enqueue();

    const data = mockOutboxEvent.create.mock.calls[0][0].data;
    expect(data).toEqual(expect.objectContaining({
      id: expect.any(String),
      aggregateType: 'ShippingOrder',
      aggregateId: 'order-1',
      eventName,
      routingKey,
      eventPayload: expect.objectContaining({ eventName }),
    }));
    expect(data.id).toBe(data.eventPayload.eventId);
  });

  it('returns only rows owned by this worker lock token', async () => {
    mockOutboxEvent.findMany
      .mockResolvedValueOnce([{ id: 'event-1' }, { id: 'event-2' }])
      .mockImplementationOnce(async ({ where }: any) => [{
        id: 'event-1',
        lockToken: where.lockToken,
        routingKey: 'order.shipped',
        eventPayload: {},
        attempts: 0,
      }]);

    const claimed = await claimShippingOutboxBatch(2, 60_000);

    expect(claimed).toHaveLength(1);
    expect(claimed[0].lockToken).toBe(mockOutboxEvent.updateMany.mock.calls[0][0].data.lockToken);
  });

  it('marks success and safely reschedules or releases an owned claim', async () => {
    await markShippingOutboxPublished('event-1', 'lock-1');
    expect(mockOutboxEvent.updateMany).toHaveBeenLastCalledWith(expect.objectContaining({
      where: { id: 'event-1', status: 'PROCESSING', lockToken: 'lock-1' },
      data: expect.objectContaining({ status: 'PUBLISHED', lockToken: null }),
    }));

    await rescheduleShippingOutbox('event-2', 'lock-2', 1, new Error('broker offline'));
    expect(mockOutboxEvent.updateMany).toHaveBeenLastCalledWith(expect.objectContaining({
      where: { id: 'event-2', status: 'PROCESSING', lockToken: 'lock-2' },
      data: expect.objectContaining({ status: 'PENDING', attempts: 2, lastError: 'broker offline' }),
    }));

    await releaseShippingOutboxClaim('event-3', 'lock-3');
    expect(mockOutboxEvent.updateMany).toHaveBeenLastCalledWith({
      where: { id: 'event-3', status: 'PROCESSING', lockToken: 'lock-3' },
      data: { status: 'PENDING', lockedAt: null, lockToken: null },
    });
  });
});
