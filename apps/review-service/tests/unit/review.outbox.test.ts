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
  claimReviewOutboxBatch,
  enqueueReviewCreated,
  markReviewOutboxPublished,
  releaseReviewOutboxClaim,
  rescheduleReviewOutbox,
} from '../../src/messaging/outbox';

describe('review outbox', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOutboxEvent.create.mockResolvedValue({});
    mockOutboxEvent.updateMany.mockResolvedValue({ count: 1 });
  });

  it('writes a stable ReviewCreated envelope through the caller transaction', async () => {
    const tx = { outboxEvent: mockOutboxEvent } as any;
    await enqueueReviewCreated(tx, {
      reviewId: 'review-1',
      productId: 'product-1',
      customerId: 'customer-1',
      rating: 5,
      orderId: 'order-1',
    });

    const data = mockOutboxEvent.create.mock.calls[0][0].data;
    expect(data).toEqual(expect.objectContaining({
      id: expect.any(String),
      aggregateType: 'Review',
      aggregateId: 'review-1',
      eventName: 'ReviewCreated',
      routingKey: 'review.created',
      eventPayload: expect.objectContaining({ eventName: 'ReviewCreated' }),
    }));
    expect(data.id).toBe(data.eventPayload.eventId);
  });

  it('returns only rows owned by this worker lock token', async () => {
    mockOutboxEvent.findMany
      .mockResolvedValueOnce([{ id: 'event-1' }, { id: 'event-2' }])
      .mockImplementationOnce(async ({ where }: any) => [{
        id: 'event-1',
        lockToken: where.lockToken,
        routingKey: 'review.created',
        eventPayload: {},
        attempts: 0,
      }]);

    const claimed = await claimReviewOutboxBatch(2, 60_000);

    expect(claimed).toHaveLength(1);
    expect(claimed[0].lockToken).toBe(mockOutboxEvent.updateMany.mock.calls[0][0].data.lockToken);
  });

  it('marks success and safely reschedules or releases an owned claim', async () => {
    await markReviewOutboxPublished('event-1', 'lock-1');
    expect(mockOutboxEvent.updateMany).toHaveBeenLastCalledWith(expect.objectContaining({
      where: { id: 'event-1', status: 'PROCESSING', lockToken: 'lock-1' },
      data: expect.objectContaining({ status: 'PUBLISHED', lockToken: null }),
    }));

    await rescheduleReviewOutbox('event-2', 'lock-2', 1, new Error('broker offline'));
    expect(mockOutboxEvent.updateMany).toHaveBeenLastCalledWith(expect.objectContaining({
      where: { id: 'event-2', status: 'PROCESSING', lockToken: 'lock-2' },
      data: expect.objectContaining({ status: 'PENDING', attempts: 2, lastError: 'broker offline' }),
    }));

    await releaseReviewOutboxClaim('event-3', 'lock-3');
    expect(mockOutboxEvent.updateMany).toHaveBeenLastCalledWith({
      where: { id: 'event-3', status: 'PROCESSING', lockToken: 'lock-3' },
      data: { status: 'PENDING', lockedAt: null, lockToken: null },
    });
  });
});
