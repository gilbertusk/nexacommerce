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
  claimOrderOutboxBatch,
  enqueueOrderCompleted,
  enqueueOrderCreated,
  markOrderOutboxPublished,
  releaseOrderOutboxClaim,
  rescheduleOrderOutbox,
} from '../../src/messaging/outbox';

describe('order outbox', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOutboxEvent.create.mockResolvedValue({});
    mockOutboxEvent.updateMany.mockResolvedValue({ count: 1 });
  });

  it('writes a stable OrderCompleted envelope through the caller transaction', async () => {
    const tx = { outboxEvent: mockOutboxEvent } as any;
    await enqueueOrderCompleted(tx, {
      orderId: 'order-1',
      customerId: 'customer-1',
      completedAt: '2026-09-24T05:00:00.000Z',
      items: [{ productId: 'product-1', quantity: 2, price: 50000 }],
    });

    const data = mockOutboxEvent.create.mock.calls[0][0].data;
    expect(data).toEqual(expect.objectContaining({
      id: expect.any(String),
      aggregateType: 'Order',
      aggregateId: 'order-1',
      eventName: 'OrderCompleted',
      routingKey: 'order.completed',
      eventPayload: expect.objectContaining({ eventName: 'OrderCompleted' }),
    }));
    expect(data.id).toBe(data.eventPayload.eventId);
  });

  it('uses one deterministic outbox identity for OrderCreated finalization', async () => {
    const tx = { outboxEvent: mockOutboxEvent } as any;
    const payload = {
      orderId: 'order-1',
      customerId: 'customer-1',
      items: [{ productId: 'product-1', quantity: 2, price: 50000 }],
      subtotal: 100000,
      discount: 0,
      shippingCost: 15000,
      grandTotal: 115000,
      voucherId: null,
      shippingAddressId: 'address-1',
    };

    await enqueueOrderCreated(tx, payload);

    const data = mockOutboxEvent.create.mock.calls[0][0].data;
    expect(data).toEqual(expect.objectContaining({
      id: 'order-created:order-1',
      aggregateType: 'Order',
      aggregateId: 'order-1',
      eventName: 'OrderCreated',
      routingKey: 'order.created',
      eventPayload: expect.objectContaining({
        eventId: 'order-created:order-1',
        eventName: 'OrderCreated',
        payload,
      }),
    }));
  });

  it('returns only rows owned by this worker lock token', async () => {
    mockOutboxEvent.findMany
      .mockResolvedValueOnce([{ id: 'event-1' }, { id: 'event-2' }])
      .mockImplementationOnce(async ({ where }: any) => [{
        id: 'event-1',
        lockToken: where.lockToken,
        routingKey: 'order.paid',
        eventPayload: {},
        attempts: 0,
      }]);

    const claimed = await claimOrderOutboxBatch(2, 60_000);

    expect(claimed).toHaveLength(1);
    expect(claimed[0].lockToken).toBe(mockOutboxEvent.updateMany.mock.calls[0][0].data.lockToken);
  });

  it('marks success and safely reschedules or releases an owned claim', async () => {
    await markOrderOutboxPublished('event-1', 'lock-1');
    expect(mockOutboxEvent.updateMany).toHaveBeenLastCalledWith(expect.objectContaining({
      where: { id: 'event-1', status: 'PROCESSING', lockToken: 'lock-1' },
      data: expect.objectContaining({ status: 'PUBLISHED', lockToken: null }),
    }));

    await rescheduleOrderOutbox('event-2', 'lock-2', 1, new Error('broker offline'));
    expect(mockOutboxEvent.updateMany).toHaveBeenLastCalledWith(expect.objectContaining({
      where: { id: 'event-2', status: 'PROCESSING', lockToken: 'lock-2' },
      data: expect.objectContaining({ status: 'PENDING', attempts: 2, lastError: 'broker offline' }),
    }));

    await releaseOrderOutboxClaim('event-3', 'lock-3');
    expect(mockOutboxEvent.updateMany).toHaveBeenLastCalledWith({
      where: { id: 'event-3', status: 'PROCESSING', lockToken: 'lock-3' },
      data: { status: 'PENDING', lockedAt: null, lockToken: null },
    });
  });
});
