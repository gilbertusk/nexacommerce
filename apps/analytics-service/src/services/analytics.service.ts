import { analyticsRepository } from '../repositories/analytics.repository';
import { config } from '../config';
import { createLogger } from '@nexacommerce/logger';
import { buildInternalServiceHeaders } from '@nexacommerce/common';

const logger = createLogger('analytics-service');

// ─── Internal HTTP helpers ───────────────────────────────────────────────────

async function internalFetch(url: string, callerService = 'analytics-service') {
  const res = await fetch(url, { headers: buildInternalServiceHeaders(callerService) });
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  const body = (await res.json()) as any;
  return body.data;
}

export async function fetchProductInfo(productId: string): Promise<{
  name: string; sellerId: string; sellerName: string; categoryId: string | null; categoryName: string | null;
}> {
  try {
    const data = await internalFetch(`${config.productServiceUrl}/internal/products/${productId}`);
    return {
      name: data?.name || 'Unknown Product',
      sellerId: data?.sellerId || '',
      sellerName: data?.seller?.username || data?.sellerName || '',
      categoryId: data?.categoryId || null,
      categoryName: data?.category?.name || null,
    };
  } catch (err: any) {
    logger.warn(`fetchProductInfo(${productId}) failed: ${err.message}`);
    return { name: 'Unknown Product', sellerId: '', sellerName: '', categoryId: null, categoryName: null };
  }
}

async function fetchUserInfo(userId: string): Promise<{ name: string; email: string }> {
  try {
    const data = await internalFetch(`${config.authServiceUrl}/auth/internal/users/${userId}`);
    return { name: data?.name || data?.username || 'Unknown', email: data?.email || '' };
  } catch (err: any) {
    logger.warn(`fetchUserInfo(${userId}) failed: ${err.message}`);
    return { name: 'Unknown', email: '' };
  }
}

async function fetchUserCount(role?: string): Promise<number> {
  try {
    const query = role ? `?role=${role}` : '';
    const data = await internalFetch(`${config.authServiceUrl}/auth/internal/users/count${query}`);
    return data?.count ?? 0;
  } catch (err: any) {
    logger.warn(`fetchUserCount failed: ${err.message}`);
    return 0;
  }
}

async function fetchProductCount(sellerId?: string): Promise<number> {
  try {
    const query = sellerId ? `?sellerId=${sellerId}&status=ACTIVE` : '?status=ACTIVE';
    const data = await internalFetch(`${config.productServiceUrl}/internal/products/count${query}`);
    return data?.count ?? 0;
  } catch (err: any) {
    logger.warn(`fetchProductCount failed: ${err.message}`);
    return 0;
  }
}

async function fetchRecentOrders(sellerId: string, limit = 5): Promise<any[]> {
  try {
    const data = await internalFetch(
      `${config.orderServiceUrl}/orders/internal/orders/seller/${sellerId}/recent?limit=${limit}`,
    );
    return Array.isArray(data) ? data : [];
  } catch (err: any) {
    logger.warn(`fetchRecentOrders(${sellerId}) failed: ${err.message}`);
    return [];
  }
}

async function fetchReviewSummary(productId: string): Promise<{ averageRating: number; totalReviews: number }> {
  try {
    const data = await internalFetch(
      `${config.reviewServiceUrl}/reviews/internal/reviews/summary/${productId}`,
    );
    return { averageRating: data?.averageRating ?? 0, totalReviews: data?.totalReviews ?? 0 };
  } catch (err: any) {
    logger.warn(`fetchReviewSummary(${productId}) failed: ${err.message}`);
    return { averageRating: 0, totalReviews: 0 };
  }
}

function todayDate(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function currentYearMonth(): { year: number; month: number } {
  const n = new Date();
  return { year: n.getFullYear(), month: n.getMonth() + 1 };
}

function firstOfCurrentMonth(): Date {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), 1, 0, 0, 0, 0);
}

// ─── Event Handlers ──────────────────────────────────────────────────────────

export const analyticsService = {
  // ── OrderCreated ────────────────────────────────────────────────────────
  async handleOrderCreated(payload: {
    orderId: string;
    customerId: string;
    items: Array<{ productId: string; quantity: number; price: number }>;
    grandTotal: number;
  }) {
    const today = todayDate();
    const { year, month } = currentYearMonth();
    const periodDate = firstOfCurrentMonth();

    await Promise.all([
      analyticsRepository.upsertDailyReport(today, { totalOrders: 1 }),
      analyticsRepository.upsertMonthlyReport(year, month, { totalOrders: 1 }),
    ]);

    // Enrich each item with product info
    const enriched = await Promise.all(
      payload.items.map(async (item) => {
        const info = await fetchProductInfo(item.productId);
        return { ...item, ...info };
      }),
    );

    // Upsert ProductSalesReport and SellerPerformanceReport per item
    for (const item of enriched) {
      if (!item.sellerId) continue;

      await Promise.all([
        analyticsRepository.upsertProductSalesReport(item.productId, 'ALL_TIME', null, {
          productName: item.name,
          sellerId: item.sellerId,
          sellerName: item.sellerName,
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          totalOrders: 1,
        }),
        analyticsRepository.upsertProductSalesReport(item.productId, 'MONTHLY', periodDate, {
          productName: item.name,
          sellerId: item.sellerId,
          sellerName: item.sellerName,
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          totalOrders: 1,
        }),
        analyticsRepository.upsertSellerPerformanceReport(item.sellerId, 'ALL_TIME', null, {
          sellerName: item.sellerName,
          totalOrders: 1,
        }),
        analyticsRepository.upsertSellerPerformanceReport(item.sellerId, 'MONTHLY', periodDate, {
          sellerName: item.sellerName,
          totalOrders: 1,
        }),
      ]);

      if (item.categoryId) {
        await Promise.all([
          analyticsRepository.upsertCategoryReport(item.categoryId, 'ALL_TIME', null, {
            categoryName: item.categoryName || '',
            totalOrders: 1,
          }),
          analyticsRepository.upsertCategoryReport(item.categoryId, 'MONTHLY', periodDate, {
            categoryName: item.categoryName || '',
            totalOrders: 1,
          }),
        ]);
      }
    }
  },

  // ── PaymentSuccess ───────────────────────────────────────────────────────
  async handlePaymentSuccess(payload: { orderId: string; customerId: string; amount: number }) {
    const today = todayDate();
    const { year, month } = currentYearMonth();

    await Promise.all([
      analyticsRepository.upsertDailyReport(today, { totalRevenue: payload.amount }),
      analyticsRepository.upsertMonthlyReport(year, month, { totalRevenue: payload.amount }),
      analyticsRepository.upsertPaymentReport(today, { successCount: 1, amount: payload.amount }),
    ]);
  },

  // ── PaymentFailed ────────────────────────────────────────────────────────
  async handlePaymentFailed(payload: any) {
    const today = todayDate();
    await analyticsRepository.upsertPaymentReport(today, { failedCount: 1 });
  },

  // ── PaymentExpired ───────────────────────────────────────────────────────
  async handlePaymentExpired(payload: any) {
    const today = todayDate();
    await analyticsRepository.upsertPaymentReport(today, { expiredCount: 1 });
  },

  // ── OrderCancelled ───────────────────────────────────────────────────────
  async handleOrderCancelled(payload: { orderId: string; customerId: string }) {
    const today = todayDate();
    const { year, month } = currentYearMonth();
    const periodDate = firstOfCurrentMonth();

    await Promise.all([
      analyticsRepository.upsertDailyReport(today, { totalCancelledOrders: 1 }),
      analyticsRepository.upsertMonthlyReport(year, month, { totalCancelledOrders: 1 }),
    ]);
  },

  // ── OrderCompleted ───────────────────────────────────────────────────────
  async handleOrderCompleted(payload: {
    orderId: string;
    customerId: string;
    items: Array<{ productId: string; quantity: number; price: number }>;
  }) {
    const today = todayDate();
    const { year, month } = currentYearMonth();
    const periodDate = firstOfCurrentMonth();
    const totalQty = payload.items.reduce((sum, i) => sum + i.quantity, 0);

    await Promise.all([
      analyticsRepository.upsertDailyReport(today, { totalCompletedOrders: 1, totalItemsSold: totalQty }),
      analyticsRepository.upsertMonthlyReport(year, month, { totalCompletedOrders: 1, totalItemsSold: totalQty }),
    ]);

    const enriched = await Promise.all(
      payload.items.map(async (item) => {
        const info = await fetchProductInfo(item.productId);
        return { ...item, ...info };
      }),
    );

    for (const item of enriched) {
      const revenue = item.quantity * item.price;

      await Promise.all([
        analyticsRepository.upsertProductSalesReport(item.productId, 'ALL_TIME', null, {
          productName: item.name,
          sellerId: item.sellerId,
          sellerName: item.sellerName,
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          totalUnitsSold: item.quantity,
          totalRevenue: revenue,
        }),
        analyticsRepository.upsertProductSalesReport(item.productId, 'MONTHLY', periodDate, {
          productName: item.name,
          sellerId: item.sellerId,
          sellerName: item.sellerName,
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          totalUnitsSold: item.quantity,
          totalRevenue: revenue,
        }),
      ]);

      if (item.sellerId) {
        await Promise.all([
          analyticsRepository.upsertSellerPerformanceReport(item.sellerId, 'ALL_TIME', null, {
            sellerName: item.sellerName,
            totalItemsSold: item.quantity,
            totalRevenue: revenue,
          }),
          analyticsRepository.upsertSellerPerformanceReport(item.sellerId, 'MONTHLY', periodDate, {
            sellerName: item.sellerName,
            totalItemsSold: item.quantity,
            totalRevenue: revenue,
          }),
        ]);
      }

      if (item.categoryId) {
        await Promise.all([
          analyticsRepository.upsertCategoryReport(item.categoryId, 'ALL_TIME', null, {
            categoryName: item.categoryName || '',
            totalUnitsSold: item.quantity,
            totalRevenue: revenue,
          }),
          analyticsRepository.upsertCategoryReport(item.categoryId, 'MONTHLY', periodDate, {
            categoryName: item.categoryName || '',
            totalUnitsSold: item.quantity,
            totalRevenue: revenue,
          }),
        ]);
      }
    }
  },

  // ── ReviewCreated ────────────────────────────────────────────────────────
  async handleReviewCreated(payload: { reviewId: string; productId: string; customerId: string; rating: number }) {
    const periodDate = firstOfCurrentMonth();
    const productInfo = await fetchProductInfo(payload.productId);
    const summary = await fetchReviewSummary(payload.productId);

    await Promise.all([
      analyticsRepository.upsertProductSalesReport(payload.productId, 'ALL_TIME', null, {
        productName: productInfo.name,
        sellerId: productInfo.sellerId,
        sellerName: productInfo.sellerName,
        averageRating: summary.averageRating,
      }),
      analyticsRepository.upsertProductSalesReport(payload.productId, 'MONTHLY', periodDate, {
        productName: productInfo.name,
        sellerId: productInfo.sellerId,
        sellerName: productInfo.sellerName,
        averageRating: summary.averageRating,
      }),
    ]);

    if (productInfo.sellerId) {
      await Promise.all([
        analyticsRepository.upsertSellerPerformanceReport(productInfo.sellerId, 'ALL_TIME', null, {
          sellerName: productInfo.sellerName,
          totalReviews: 1,
          averageRating: summary.averageRating,
        }),
        analyticsRepository.upsertSellerPerformanceReport(productInfo.sellerId, 'MONTHLY', periodDate, {
          sellerName: productInfo.sellerName,
          totalReviews: 1,
          averageRating: summary.averageRating,
        }),
      ]);
    }
  },

  // ── Dashboard ────────────────────────────────────────────────────────────
  async getAdminDashboard() {
    const [totalSums, paymentStats, recentTrend, totalCustomers, totalSellers, totalProducts] = await Promise.all([
      analyticsRepository.sumAllDailyRevenue(),
      analyticsRepository.aggregatePaymentStats(),
      analyticsRepository.findRecentDailyReports(30),
      fetchUserCount('CUSTOMER'),
      fetchUserCount('SELLER'),
      fetchProductCount(),
    ]);

    const totalRevenue = Number(totalSums._sum.totalRevenue || 0);
    const totalOrders = totalSums._sum.totalOrders || 0;
    const totalItemsSold = totalSums._sum.totalItemsSold || 0;
    const totalCompletedOrders = totalSums._sum.totalCompletedOrders || 0;
    const totalCancelledOrders = totalSums._sum.totalCancelledOrders || 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const totalTx = paymentStats._sum.totalTransactions || 0;
    const successCount = paymentStats._sum.successCount || 0;
    const paymentSuccessRate = totalTx > 0 ? (successCount / totalTx) * 100 : 0;
    const orderCancellationRate = totalOrders > 0 ? (totalCancelledOrders / totalOrders) * 100 : 0;

    const today = todayDate();
    const todayReport = recentTrend.find((r: any) => r.date.toDateString() === today.toDateString());
    const revenueToday = Number(todayReport?.totalRevenue || 0);
    const ordersToday = todayReport?.totalOrders || 0;

    return {
      overview: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalSellers,
        totalProducts,
        paymentSuccessRate: Math.round(paymentSuccessRate * 100) / 100,
        orderCancellationRate: Math.round(orderCancellationRate * 100) / 100,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        totalItemsSold,
        totalCompletedOrders,
      },
      revenueToday,
      ordersToday,
      revenueTrend: recentTrend.map((r: any) => ({
        date: r.date.toISOString().split('T')[0],
        revenue: Number(r.totalRevenue),
      })),
      ordersTrend: recentTrend.map((r: any) => ({
        date: r.date.toISOString().split('T')[0],
        orders: r.totalOrders,
      })),
    };
  },

  async getSellerDashboard(sellerId: string) {
    const periodDate = firstOfCurrentMonth();

    const [sellerAllTime, topProducts, recentOrders, productCount] = await Promise.all([
      analyticsRepository.findSellerReport(sellerId, 'ALL_TIME'),
      analyticsRepository.findTopProducts('ALL_TIME', null, sellerId, 5),
      fetchRecentOrders(sellerId, 5),
      fetchProductCount(sellerId),
    ]);

    return {
      overview: {
        totalRevenue: Number(sellerAllTime?.totalRevenue || 0),
        totalOrders: sellerAllTime?.totalOrders || 0,
        totalProducts: productCount,
        totalItemsSold: sellerAllTime?.totalItemsSold || 0,
        averageRating: sellerAllTime?.averageRating || 0,
        totalReviews: sellerAllTime?.totalReviews || 0,
        cancellationRate: sellerAllTime?.cancellationRate || 0,
      },
      topProducts: topProducts.map((p: any) => ({
        productId: p.productId,
        productName: p.productName,
        unitsSold: p.totalUnitsSold,
        revenue: Number(p.totalRevenue),
        averageRating: p.averageRating,
      })),
      recentOrders,
    };
  },

  async getRevenueReport(period: 'daily' | 'monthly', startDate?: Date, endDate?: Date) {
    if (period === 'daily') {
      const start = startDate || (() => { const d = new Date(); d.setDate(d.getDate() - 30); return d; })();
      const end = endDate || new Date();
      const rows = await analyticsRepository.findDailyReports(start, end);
      return rows.map((r: any) => ({
        date: r.date.toISOString().split('T')[0],
        revenue: Number(r.totalRevenue),
        orders: r.totalOrders,
        averageOrderValue: Number(r.averageOrderValue),
      }));
    } else {
      const now = new Date();
      const rows = await analyticsRepository.findMonthlyReports(
        startDate ? startDate.getFullYear() : now.getFullYear() - 1,
        startDate ? startDate.getMonth() + 1 : 1,
        endDate ? endDate.getFullYear() : now.getFullYear(),
        endDate ? endDate.getMonth() + 1 : now.getMonth() + 1,
      );
      return rows.map((r: any) => ({
        month: `${r.year}-${String(r.month).padStart(2, '0')}`,
        revenue: Number(r.totalRevenue),
        orders: r.totalOrders,
        averageOrderValue: Number(r.averageOrderValue),
      }));
    }
  },

  async getOrderReport(period: 'daily' | 'monthly', startDate?: Date, endDate?: Date) {
    if (period === 'daily') {
      const start = startDate || (() => { const d = new Date(); d.setDate(d.getDate() - 30); return d; })();
      const end = endDate || new Date();
      const rows = await analyticsRepository.findDailyReports(start, end);
      return rows.map((r: any) => ({
        date: r.date.toISOString().split('T')[0],
        totalOrders: r.totalOrders,
        completedOrders: r.totalCompletedOrders,
        cancelledOrders: r.totalCancelledOrders,
        cancellationRate: r.totalOrders > 0 ? Math.round((r.totalCancelledOrders / r.totalOrders) * 10000) / 100 : 0,
      }));
    } else {
      const now = new Date();
      const rows = await analyticsRepository.findMonthlyReports(
        startDate ? startDate.getFullYear() : now.getFullYear() - 1,
        startDate ? startDate.getMonth() + 1 : 1,
        endDate ? endDate.getFullYear() : now.getFullYear(),
        endDate ? endDate.getMonth() + 1 : now.getMonth() + 1,
      );
      return rows.map((r: any) => ({
        month: `${r.year}-${String(r.month).padStart(2, '0')}`,
        totalOrders: r.totalOrders,
        completedOrders: r.totalCompletedOrders,
        cancelledOrders: r.totalCancelledOrders,
        cancellationRate: r.totalOrders > 0 ? Math.round((r.totalCancelledOrders / r.totalOrders) * 10000) / 100 : 0,
      }));
    }
  },

  async getTopProducts(limit: number, period: string, month?: number, year?: number, sellerId?: string | null) {
    let periodDate: Date | null = null;
    const periodType = period === 'monthly' ? 'MONTHLY' : 'ALL_TIME';
    if (periodType === 'MONTHLY') {
      const y = year || new Date().getFullYear();
      const m = month || new Date().getMonth() + 1;
      periodDate = new Date(y, m - 1, 1, 0, 0, 0, 0);
    }
    return analyticsRepository.findTopProducts(periodType, periodDate, sellerId || null, limit);
  },

  async getTopCategories(limit: number, period: string) {
    const periodType = period === 'monthly' ? 'MONTHLY' : 'ALL_TIME';
    const periodDate = periodType === 'MONTHLY' ? firstOfCurrentMonth() : null;
    return analyticsRepository.findTopCategories(periodType, periodDate, limit);
  },

  async getSellerPerformance(limit: number, period: string, sortBy: string) {
    const periodType = period === 'monthly' ? 'MONTHLY' : 'ALL_TIME';
    const periodDate = periodType === 'MONTHLY' ? firstOfCurrentMonth() : null;
    return analyticsRepository.findSellerPerformance(periodType, periodDate, limit, sortBy);
  },

  async getPaymentSuccessRate(period: 'daily' | 'monthly', startDate?: Date, endDate?: Date) {
    const start = startDate || (() => { const d = new Date(); d.setDate(d.getDate() - 30); return d; })();
    const end = endDate || new Date();
    const rows = await analyticsRepository.findPaymentReports(start, end);
    return rows.map((r: any) => ({
      date: r.date.toISOString().split('T')[0],
      totalTransactions: r.totalTransactions,
      successCount: r.successCount,
      failedCount: r.failedCount,
      expiredCount: r.expiredCount,
      successRate: Math.round(r.successRate * 100) / 100,
      totalAmount: Number(r.totalAmount),
    }));
  },

  async getCancellationRate(period: 'daily' | 'monthly', startDate?: Date, endDate?: Date) {
    return this.getOrderReport(period, startDate, endDate);
  },
};
