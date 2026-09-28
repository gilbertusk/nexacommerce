jest.mock('../../src/repositories/analytics.repository');

import {
  analyticsService,
  applyAnalyticsEvent,
  prepareAnalyticsEvent,
} from '../../src/services/analytics.service';
import { analyticsRepository } from '../../src/repositories/analytics.repository';
import { dailyDeltaFor } from '../../src/services/kafka-projection';

const mockAnalyticsRepo = analyticsRepository as jest.Mocked<typeof analyticsRepository>;
const CLIENT = { tx: true } as any;

describe('analytics event projection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock) = jest.fn();
    mockAnalyticsRepo.upsertDailyReport.mockResolvedValue({} as any);
    mockAnalyticsRepo.upsertMonthlyReport.mockResolvedValue({} as any);
    mockAnalyticsRepo.upsertProductSalesReport.mockResolvedValue({} as any);
    mockAnalyticsRepo.upsertSellerPerformanceReport.mockResolvedValue({} as any);
    mockAnalyticsRepo.upsertCategoryReport.mockResolvedValue({} as any);
    mockAnalyticsRepo.upsertPaymentReport.mockResolvedValue({} as any);
  });

  describe('prepareAnalyticsEvent', () => {
    it('enriches order items from the catalog without writing anything', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          data: { id: 'prod-1', name: 'Prod', sellerId: 'seller-1', categoryId: 'cat-1' },
        }),
      });

      // Act
      const prepared = await prepareAnalyticsEvent('OrderCreated', {
        orderId: 'order-1',
        items: [{ productId: 'prod-1', quantity: 2, price: 100000 }],
      });

      // Assert
      expect(prepared).toEqual({
        kind: 'OrderCreated',
        items: [
          expect.objectContaining({ productId: 'prod-1', name: 'Prod', sellerId: 'seller-1' }),
        ],
      });
      expect(mockAnalyticsRepo.upsertDailyReport).not.toHaveBeenCalled();
    });

    it('classifies an unknown event as ignored instead of failing', async () => {
      // Act
      const prepared = await prepareAnalyticsEvent('SomethingElse', {});

      // Assert
      expect(prepared).toEqual({ kind: 'Ignored', eventName: 'SomethingElse' });
    });
  });

  describe('applyAnalyticsEvent', () => {
    it('writes order reports through the supplied transaction client', async () => {
      // Act
      await applyAnalyticsEvent(CLIENT, {
        kind: 'OrderCreated',
        items: [
          {
            productId: 'prod-1',
            quantity: 2,
            price: 100000,
            name: 'Prod',
            sellerId: 'seller-1',
            sellerName: 'Seller',
            categoryId: 'cat-1',
            categoryName: 'Cat',
          },
        ],
      });

      // Assert
      expect(mockAnalyticsRepo.upsertDailyReport).toHaveBeenCalledWith(
        expect.any(Date),
        { totalOrders: 1 },
        CLIENT,
      );
      expect(mockAnalyticsRepo.upsertMonthlyReport).toHaveBeenCalledTimes(1);
      expect(mockAnalyticsRepo.upsertProductSalesReport).toHaveBeenCalledTimes(2);
      expect(mockAnalyticsRepo.upsertSellerPerformanceReport).toHaveBeenCalledTimes(2);
    });

    it('records payment revenue for a successful payment', async () => {
      // Act
      await applyAnalyticsEvent(CLIENT, { kind: 'PaymentSuccess', amount: 200000 });

      // Assert
      expect(mockAnalyticsRepo.upsertPaymentReport).toHaveBeenCalledWith(
        expect.any(Date),
        { successCount: 1, amount: 200000 },
        CLIENT,
      );
    });

    it('updates product and seller rating stats for a review', async () => {
      // Act
      await applyAnalyticsEvent(CLIENT, {
        kind: 'ReviewCreated',
        productId: 'prod-1',
        product: { name: 'Prod', sellerId: 'seller-1', sellerName: 'Seller' },
        averageRating: 4.5,
      });

      // Assert
      expect(mockAnalyticsRepo.upsertProductSalesReport).toHaveBeenCalledTimes(2);
      expect(mockAnalyticsRepo.upsertSellerPerformanceReport).toHaveBeenCalledTimes(2);
    });

    it('counts a cancelled announced order but not a compensated checkout that was never announced', async () => {
      const announced = await prepareAnalyticsEvent('OrderCancelled', { orderId: 'o-1', checkoutFinalized: true });
      const legacy = await prepareAnalyticsEvent('OrderCancelled', { orderId: 'o-2' });
      const compensated = await prepareAnalyticsEvent('OrderCancelled', { orderId: 'o-3', checkoutFinalized: false });

      await applyAnalyticsEvent(CLIENT, announced);
      await applyAnalyticsEvent(CLIENT, legacy);
      await applyAnalyticsEvent(CLIENT, compensated);

      expect(mockAnalyticsRepo.upsertDailyReport).toHaveBeenCalledTimes(2);
      expect(mockAnalyticsRepo.upsertDailyReport).toHaveBeenCalledWith(expect.any(Date), { totalCancelledOrders: 1 }, CLIENT);
    });

    it('applies the same cancellation rule in the Kafka daily projection', () => {
      const envelope = (payload: Record<string, unknown>) => ({ eventName: 'OrderCancelled', payload } as any);
      expect(dailyDeltaFor(envelope({ orderId: 'o-1' }))).toEqual({ totalCancelledOrders: 1 });
      expect(dailyDeltaFor(envelope({ orderId: 'o-3', checkoutFinalized: false }))).toBeNull();
    });

    it('writes nothing for an ignored event', async () => {
      // Act
      await applyAnalyticsEvent(CLIENT, { kind: 'Ignored', eventName: 'OrderPaid' });

      // Assert
      expect(mockAnalyticsRepo.upsertDailyReport).not.toHaveBeenCalled();
      expect(mockAnalyticsRepo.upsertPaymentReport).not.toHaveBeenCalled();
    });
  });

  describe('getTopProducts', () => {
    it('returns top products for the monthly period', async () => {
      // Arrange
      mockAnalyticsRepo.findTopProducts.mockResolvedValue([
        { productId: 'prod-1', totalQuantitySold: 50, totalRevenue: 5000000 } as any,
      ]);

      // Act
      const result = await analyticsService.getTopProducts(10, 'monthly', 6, 2026);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].productId).toBe('prod-1');
    });
  });
});
