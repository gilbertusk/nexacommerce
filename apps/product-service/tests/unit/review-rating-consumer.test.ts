jest.mock('../../src/services/product.service', () => ({
  productService: { updateProductRating: jest.fn() },
}));

import { handleReviewEvent } from '../../src/messaging/rabbitmq';
import { productService } from '../../src/services/product.service';

const updateProductRating = productService.updateProductRating as jest.Mock;

const reviewCreated = {
  eventId: 'evt-review-1',
  eventName: 'ReviewCreated',
  payload: { reviewId: 'review-1', productId: 'product-1', rating: 5 },
};

function stubSummary(response: { ok: boolean; status?: number; data?: unknown }) {
  (global.fetch as unknown) = jest.fn(async () => ({
    ok: response.ok,
    status: response.status ?? 200,
    json: async () => ({ data: response.data }),
  }));
}

describe('ReviewCreated rating projection', () => {
  beforeEach(() => updateProductRating.mockReset());

  it('writes the absolute summary read from Review Service', async () => {
    stubSummary({ ok: true, data: { averageRating: 4.5, totalReviews: 12 } });

    await handleReviewEvent(reviewCreated);

    expect(updateProductRating).toHaveBeenCalledWith('product-1', 4.5, 12);
  });

  it('converges on the same value when the event is redelivered', async () => {
    stubSummary({ ok: true, data: { averageRating: 4.5, totalReviews: 12 } });

    await handleReviewEvent(reviewCreated);
    await handleReviewEvent(reviewCreated);

    expect(updateProductRating.mock.calls).toEqual([
      ['product-1', 4.5, 12],
      ['product-1', 4.5, 12],
    ]);
  });

  it('throws instead of overwriting the rating with zero when Review Service fails', async () => {
    stubSummary({ ok: false, status: 503 });

    await expect(handleReviewEvent(reviewCreated)).rejects.toThrow(/503/);
    expect(updateProductRating).not.toHaveBeenCalled();
  });

  it('refuses an unusable summary rather than guessing', async () => {
    stubSummary({ ok: true, data: { averageRating: 'n/a', totalReviews: -1 } });

    await expect(handleReviewEvent(reviewCreated)).rejects.toThrow(/unusable/);
    expect(updateProductRating).not.toHaveBeenCalled();
  });

  it('rejects an envelope without a product id so it can be dead-lettered', async () => {
    await expect(handleReviewEvent({ ...reviewCreated, payload: {} })).rejects.toThrow(/productId/);
  });
});
