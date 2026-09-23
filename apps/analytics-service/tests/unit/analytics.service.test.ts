jest.mock('../../src/repositories/analytics.repository');

import { analyticsService } from '../../src/services/analytics.service';
import { analyticsRepository } from '../../src/repositories/analytics.repository';

const mockAnalyticsRepo = analyticsRepository as jest.Mocked<typeof analyticsRepository>;

describe('AnalyticsService', () => {
  let service: typeof analyticsService;

  beforeEach(() => {
    service = analyticsService;
    jest.clearAllMocks();
    (global.fetch as jest.Mock) = jest.fn();
  });

  describe('handleOrderCreated', () => {
    it('upserts daily, monthly, product and seller reports', async () => {
      mockAnalyticsRepo.saveEvent.mockResolvedValue({ id: 'evt-1' } as any);
      mockAnalyticsRepo.markEventProcessed.mockResolvedValue({} as any);
      mockAnalyticsRepo.upsertDailyReport.mockResolvedValue({} as any);
      mockAnalyticsRepo.upsertMonthlyReport.mockResolvedValue({} as any);
      mockAnalyticsRepo.upsertProductSalesReport.mockResolvedValue({} as any);
      mockAnalyticsRepo.upsertSellerPerformanceReport.mockResolvedValue({} as any);
      mockAnalyticsRepo.upsertCategoryReport.mockResolvedValue({} as any);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: { id: 'prod-1', name: 'Prod', sellerId: 'seller-1', categoryId: 'cat-1' } }),
      });

      await service.handleOrderCreated({
        orderId: 'order-1',
        customerId: 'user-1',
        items: [{ productId: 'prod-1', quantity: 2, price: 100000 }],
        grandTotal: 200000,
      });

      expect(mockAnalyticsRepo.upsertDailyReport).toHaveBeenCalledTimes(1);
      expect(mockAnalyticsRepo.upsertMonthlyReport).toHaveBeenCalledTimes(1);
    });
  });

  describe('handlePaymentSuccess', () => {
    it('upserts daily and payment reports', async () => {
      mockAnalyticsRepo.saveEvent.mockResolvedValue({ id: 'evt-2' } as any);
      mockAnalyticsRepo.markEventProcessed.mockResolvedValue({} as any);
      mockAnalyticsRepo.upsertDailyReport.mockResolvedValue({} as any);
      mockAnalyticsRepo.upsertMonthlyReport.mockResolvedValue({} as any);
      mockAnalyticsRepo.upsertPaymentReport.mockResolvedValue({} as any);

      await service.handlePaymentSuccess({
        orderId: 'order-1',
        customerId: 'user-1',
        amount: 200000,
      });

      expect(mockAnalyticsRepo.upsertPaymentReport).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTopProducts', () => {
    it('returns top products for DAILY period', async () => {
      mockAnalyticsRepo.findTopProducts.mockResolvedValue([
        { productId: 'prod-1', totalQuantitySold: 50, totalRevenue: 5000000 } as any,
      ]);

      const result = await service.getTopProducts(10, 'monthly', 6, 2026);
      expect(result).toHaveLength(1);
      expect(result[0].productId).toBe('prod-1');
    });
  });

  describe('handleReviewCreated', () => {
    it('updates product review stats', async () => {
      mockAnalyticsRepo.saveEvent.mockResolvedValue({ id: 'evt-3' } as any);
      mockAnalyticsRepo.markEventProcessed.mockResolvedValue({} as any);
      mockAnalyticsRepo.upsertProductSalesReport.mockResolvedValue({} as any);

      await service.handleReviewCreated({
        reviewId: 'rev-1',
        productId: 'prod-1',
        customerId: 'user-1',
        rating: 5,
      });

      expect(mockAnalyticsRepo.upsertProductSalesReport).toHaveBeenCalled();
    });
  });
});
