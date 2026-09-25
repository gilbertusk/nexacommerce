jest.mock('../../src/repositories/review.repository', () => ({
  reviewRepository: {
    createReview: jest.fn(),
  },
}));
jest.mock('../../src/prisma/client', () => ({
  prisma: {
    review: { findUnique: jest.fn() },
    $transaction: jest.fn(),
  },
}));
import { ReviewService } from '../../src/services/review.service';
import { reviewRepository } from '../../src/repositories/review.repository';
import { prisma } from '../../src/prisma/client';

describe('Review creation order binding', () => {
  const service = new ReviewService();
  const tx = {
    review: {
      groupBy: jest.fn().mockResolvedValue([]),
      aggregate: jest.fn().mockResolvedValue({ _avg: { rating: 5 }, _count: { rating: 1 } }),
    },
    productRatingSummary: { upsert: jest.fn().mockResolvedValue({}) },
    outboxEvent: { create: jest.fn().mockResolvedValue({}) },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.review.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.$transaction as jest.Mock).mockImplementation((callback: (client: typeof tx) => unknown) => callback(tx));
    (reviewRepository.createReview as jest.Mock).mockResolvedValue({
      id: 'review-1',
      productId: 'product-1',
      customerId: 'customer-1',
      rating: 5,
      orderId: 'order-real',
    });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { eligible: true, reason: 'OK', orderId: 'order-real' },
      }),
    }) as jest.Mock;
  });

  const reviewData = (orderId: string) => ({
    productId: 'product-1',
    orderId,
    orderItemId: 'order-item-1',
    rating: 5,
    content: 'A detailed product review.',
  });

  it('rejects a client order ID that does not own the eligible item before persistence', async () => {
    await expect(service.createReview('customer-1', 'customer@example.test', reviewData('order-forged')))
      .rejects.toThrow('does not match the verified order item');

    expect(prisma.review.findUnique).not.toHaveBeenCalled();
    expect(reviewRepository.createReview).not.toHaveBeenCalled();
  });

  it('persists only the order ID returned by the Order Service eligibility check', async () => {
    await service.createReview('customer-1', 'customer@example.test', reviewData('order-real'));

    const eligibilityUrl = new URL((global.fetch as jest.Mock).mock.calls[0][0]);
    expect(eligibilityUrl.searchParams.get('customerId')).toBe('customer-1');
    expect(eligibilityUrl.searchParams.get('productId')).toBe('product-1');
    expect(eligibilityUrl.searchParams.get('orderItemId')).toBe('order-item-1');
    expect(reviewRepository.createReview).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      orderId: 'order-real',
      orderItemId: 'order-item-1',
      productId: 'product-1',
    }));
    expect(tx.outboxEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: expect.any(String),
        aggregateType: 'Review',
        aggregateId: 'review-1',
        eventName: 'ReviewCreated',
        routingKey: 'review.created',
        eventPayload: expect.objectContaining({
          eventName: 'ReviewCreated',
          payload: expect.objectContaining({ orderId: 'order-real' }),
        }),
      }),
    });
  });

  it('fails closed when the eligibility response omits its authoritative order ID', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { eligible: true, reason: 'OK' } }),
    });

    await expect(service.createReview('customer-1', 'customer@example.test', reviewData('order-real')))
      .rejects.toThrow('did not return the eligible order ID');
    expect(reviewRepository.createReview).not.toHaveBeenCalled();
  });
});
