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
  claimInventoryOutboxBatch,
  enqueueLowStockDetected,
  enqueueStockConfirmed,
  markInventoryOutboxPublished,
  releaseInventoryOutboxClaim,
  rescheduleInventoryOutbox,
} from '../../src/messaging/outbox';

describe('inventory outbox', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOutboxEvent.create.mockResolvedValue({});
    mockOutboxEvent.updateMany.mockResolvedValue({ count: 1 });
  });

  it('writes stable order-stock and low-stock envelopes', async () => {
    const tx = { outboxEvent: mockOutboxEvent } as any;
    await enqueueStockConfirmed(tx, {
      orderId: 'order-1',
      reservations: [{ reservationId: 'reservation-1', productId: 'product-1', quantity: 2 }],
    });
    await enqueueLowStockDetected(tx, {
      productId: 'product-1', currentStock: 3, threshold: 5, sellerId: 'seller-1',
    });

    const stockEvent = mockOutboxEvent.create.mock.calls[0][0].data;
    expect(stockEvent).toEqual(expect.objectContaining({
      aggregateType: 'OrderStock', aggregateId: 'order-1',
      eventName: 'StockConfirmed', routingKey: 'stock.confirmed',
    }));
    expect(stockEvent.id).toBe(stockEvent.eventPayload.eventId);

    const lowStockEvent = mockOutboxEvent.create.mock.calls[1][0].data;
    expect(lowStockEvent).toEqual(expect.objectContaining({
      aggregateType: 'Inventory', aggregateId: 'product-1',
      eventName: 'LowStockDetected', routingKey: 'stock.low_detected',
    }));
  });

  it('returns only rows owned by this worker lock token', async () => {
    mockOutboxEvent.findMany
      .mockResolvedValueOnce([{ id: 'event-1' }])
      .mockImplementationOnce(async ({ where }: any) => [{
        id: 'event-1', lockToken: where.lockToken, routingKey: 'stock.confirmed', eventPayload: {}, attempts: 0,
      }]);

    const claimed = await claimInventoryOutboxBatch(1, 60_000);
    expect(claimed).toHaveLength(1);
    expect(claimed[0].lockToken).toBe(mockOutboxEvent.updateMany.mock.calls[0][0].data.lockToken);
  });

  it('marks success and safely reschedules or releases an owned claim', async () => {
    await markInventoryOutboxPublished('event-1', 'lock-1');
    expect(mockOutboxEvent.updateMany).toHaveBeenLastCalledWith(expect.objectContaining({
      where: { id: 'event-1', status: 'PROCESSING', lockToken: 'lock-1' },
      data: expect.objectContaining({ status: 'PUBLISHED', lockToken: null }),
    }));

    await rescheduleInventoryOutbox('event-2', 'lock-2', 1, new Error('broker offline'));
    expect(mockOutboxEvent.updateMany).toHaveBeenLastCalledWith(expect.objectContaining({
      where: { id: 'event-2', status: 'PROCESSING', lockToken: 'lock-2' },
      data: expect.objectContaining({ status: 'PENDING', attempts: 2, lastError: 'broker offline' }),
    }));

    await releaseInventoryOutboxClaim('event-3', 'lock-3');
    expect(mockOutboxEvent.updateMany).toHaveBeenLastCalledWith({
      where: { id: 'event-3', status: 'PROCESSING', lockToken: 'lock-3' },
      data: { status: 'PENDING', lockedAt: null, lockToken: null },
    });
  });
});
