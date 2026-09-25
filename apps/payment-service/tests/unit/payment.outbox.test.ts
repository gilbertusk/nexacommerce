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
  claimPaymentOutboxBatch,
  enqueuePaymentFailed,
  markPaymentOutboxPublished,
  releasePaymentOutboxClaim,
  reschedulePaymentOutbox,
} from '../../src/messaging/outbox';

describe('payment outbox', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOutboxEvent.create.mockResolvedValue({});
    mockOutboxEvent.updateMany.mockResolvedValue({ count: 1 });
  });

  it('writes a complete event envelope through the caller transaction', async () => {
    const tx = { outboxEvent: mockOutboxEvent } as any;

    await enqueuePaymentFailed(tx, {
      paymentId: 'pay-1',
      orderId: 'order-1',
      customerId: 'customer-1',
      reason: 'deny',
    });

    expect(mockOutboxEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: expect.any(String),
        aggregateType: 'Payment',
        aggregateId: 'pay-1',
        eventName: 'PaymentFailed',
        routingKey: 'payment.failed',
        eventPayload: expect.objectContaining({
          eventId: expect.any(String),
          eventName: 'PaymentFailed',
          timestamp: expect.any(String),
          payload: expect.objectContaining({ paymentId: 'pay-1', reason: 'deny' }),
        }),
      }),
    });
    const data = mockOutboxEvent.create.mock.calls[0][0].data;
    expect(data.id).toBe(data.eventPayload.eventId);
  });

  it('claims only rows updated with this worker lock token', async () => {
    mockOutboxEvent.findMany
      .mockResolvedValueOnce([{ id: 'event-1' }, { id: 'event-2' }])
      .mockImplementationOnce(async ({ where }: any) => [{
        id: 'event-1',
        lockToken: where.lockToken,
        routingKey: 'payment.success',
        eventPayload: {},
        attempts: 0,
      }]);

    const claimed = await claimPaymentOutboxBatch(2, 60_000);

    expect(claimed).toHaveLength(1);
    expect(mockOutboxEvent.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: { in: ['event-1', 'event-2'] } }),
      data: expect.objectContaining({ status: 'PROCESSING', lockToken: expect.any(String) }),
    }));
    expect(claimed[0].lockToken).toBe(mockOutboxEvent.updateMany.mock.calls[0][0].data.lockToken);
  });

  it('publishes, retries with backoff metadata, and releases by lock ownership', async () => {
    await markPaymentOutboxPublished('event-1', 'lock-1');
    expect(mockOutboxEvent.updateMany).toHaveBeenLastCalledWith({
      where: { id: 'event-1', status: 'PROCESSING', lockToken: 'lock-1' },
      data: expect.objectContaining({ status: 'PUBLISHED', lockToken: null, lastError: null }),
    });

    await reschedulePaymentOutbox('event-2', 'lock-2', 2, new Error('broker offline'));
    expect(mockOutboxEvent.updateMany).toHaveBeenLastCalledWith({
      where: { id: 'event-2', status: 'PROCESSING', lockToken: 'lock-2' },
      data: expect.objectContaining({
        status: 'PENDING',
        attempts: 3,
        availableAt: expect.any(Date),
        lockToken: null,
        lastError: 'broker offline',
      }),
    });

    await releasePaymentOutboxClaim('event-3', 'lock-3');
    expect(mockOutboxEvent.updateMany).toHaveBeenLastCalledWith({
      where: { id: 'event-3', status: 'PROCESSING', lockToken: 'lock-3' },
      data: { status: 'PENDING', lockedAt: null, lockToken: null },
    });
  });
});
