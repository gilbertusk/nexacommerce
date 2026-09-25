import { ReviewService } from '../../src/services/review.service';
import { reviewRepository } from '../../src/repositories/review.repository';

jest.mock('../../src/repositories/review.repository', () => ({
  reviewRepository: {
    findReviewById: jest.fn(),
    createReport: jest.fn(),
  },
}));

describe('Review report validation', () => {
  const service = new ReviewService();

  it('rejects unsupported report reasons before database access', async () => {
    await expect(service.createReport('customer-1', 'review-1', 'NOT_A_REASON')).rejects.toThrow('Invalid review report reason');
    expect(reviewRepository.findReviewById).not.toHaveBeenCalled();
  });

  it('rejects descriptions over the public API limit', async () => {
    await expect(service.createReport('customer-1', 'review-1', 'SPAM', 'x'.repeat(501))).rejects.toThrow('cannot exceed 500');
    expect(reviewRepository.findReviewById).not.toHaveBeenCalled();
  });

  it('rejects a report submitted by the review author', async () => {
    (reviewRepository.findReviewById as jest.Mock).mockResolvedValue({ id: 'review-1', customerId: 'customer-1' });

    await expect(service.createReport('customer-1', 'review-1', 'SPAM')).rejects.toThrow('cannot report your own review');
    expect(reviewRepository.createReport).not.toHaveBeenCalled();
  });
});
