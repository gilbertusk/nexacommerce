jest.mock('../../src/services/review.service', () => ({
  reviewService: { createReview: jest.fn() },
}));

import { ReviewController } from '../../src/controllers/review.controller';
import { reviewService } from '../../src/services/review.service';

describe('ReviewController public attribution', () => {
  const controller = new ReviewController();
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (reviewService.createReview as jest.Mock).mockResolvedValue({ id: 'review-1' });
  });

  it('does not persist the customer email as the publicly returned review name', async () => {
    await controller.createReview({
      headers: { 'x-user-id': 'customer-1', 'x-user-email': 'private@example.test' },
      body: {
        productId: 'product-1',
        orderId: 'order-1',
        orderItemId: 'item-1',
        rating: 5,
        content: 'A detailed product review.',
      },
    } as any, res as any);

    expect(reviewService.createReview).toHaveBeenCalledWith(
      'customer-1',
      'Customer',
      expect.objectContaining({ productId: 'product-1' }),
    );
  });
});
