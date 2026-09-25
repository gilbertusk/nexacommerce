import { analyticsRepository, AnalyticsWriteClient } from '../repositories/analytics.repository';
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

// --- Event projection -------------------------------------------------------

/**
 * Applying an event happens in two phases. `prepareAnalyticsEvent` performs the
 * catalog/review lookups over HTTP, and `applyAnalyticsEvent` performs only
 * database writes. Keeping the lookups outside means the projection
 * transaction never waits on another service while holding row locks.
 */

type EnrichedItem = {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  sellerId: string;
  sellerName: string;
  categoryId: string | null;
  categoryName: string | null;
};

export type PreparedEvent =
  | { kind: 'OrderCreated'; items: EnrichedItem[] }
  | { kind: 'OrderCompleted'; items: EnrichedItem[] }
  | { kind: 'PaymentSuccess'; amount: number }
  | { kind: 'PaymentFailed' }
  | { kind: 'PaymentExpired' }
  | { kind: 'OrderCancelled' }
  | {
      kind: 'ReviewCreated';
      productId: string;
      product: { name: string; sellerId: string; sellerName: string };
      averageRating: number;
    }
  | { kind: 'Ignored'; eventName: string };

async function enrichItems(
  items: Array<{ productId: string; quantity: number; price: number }>,
): Promise<EnrichedItem[]> {
  return Promise.all(
    items.map(async (item) => ({ ...item, ...(await fetchProductInfo(item.productId)) })),
  );
}

/** Resolve everything an event needs from other services. Performs no writes. */
export async function prepareAnalyticsEvent(
  eventName: string,
  payload: any,
): Promise<PreparedEvent> {
  switch (eventName) {
    case 'OrderCreated':
      return { kind: 'OrderCreated', items: await enrichItems(payload?.items ?? []) };
    case 'OrderCompleted':
      return { kind: 'OrderCompleted', items: await enrichItems(payload?.items ?? []) };
    case 'PaymentSuccess':
      return { kind: 'PaymentSuccess', amount: Number(payload?.amount) || 0 };
    case 'PaymentFailed':
      return { kind: 'PaymentFailed' };
    case 'PaymentExpired':
      return { kind: 'PaymentExpired' };
    case 'OrderCancelled':
      return { kind: 'OrderCancelled' };
    case 'ReviewCreated': {
      const [product, summary] = await Promise.all([
        fetchProductInfo(payload.productId),
        fetchReviewSummary(payload.productId),
      ]);
      return {
        kind: 'ReviewCreated',
        productId: payload.productId,
        product,
        averageRating: summary.averageRating,
      };
    }
    // OrderPaid restates PaymentSuccess revenue, so it is archived only.
    default:
      return { kind: 'Ignored', eventName };
  }
}

/**
 * Write the prepared event into the report tables using `client`. Callers pass
 * the inbox transaction so these mutations and the consumed marker commit
 * together.
 */
export async function applyAnalyticsEvent(
  client: AnalyticsWriteClient,
  prepared: PreparedEvent,
): Promise<void> {
  const today = todayDate();
  const { year, month } = currentYearMonth();
  const periodDate = firstOfCurrentMonth();

  switch (prepared.kind) {
    case 'OrderCreated': {
      await analyticsRepository.upsertDailyReport(today, { totalOrders: 1 }, client);
      await analyticsRepository.upsertMonthlyReport(year, month, { totalOrders: 1 }, client);

      for (const item of prepared.items) {
        if (!item.sellerId) continue;
        const productFields = {
          productName: item.name,
          sellerId: item.sellerId,
          sellerName: item.sellerName,
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          totalOrders: 1,
        };
        await analyticsRepository.upsertProductSalesReport(item.productId, 'ALL_TIME', null, productFields, client);
        await analyticsRepository.upsertProductSalesReport(item.productId, 'MONTHLY', periodDate, productFields, client);
        await analyticsRepository.upsertSellerPerformanceReport(item.sellerId, 'ALL_TIME', null, { sellerName: item.sellerName, totalOrders: 1 }, client);
        await analyticsRepository.upsertSellerPerformanceReport(item.sellerId, 'MONTHLY', periodDate, { sellerName: item.sellerName, totalOrders: 1 }, client);

        if (item.categoryId) {
          await analyticsRepository.upsertCategoryReport(item.categoryId, 'ALL_TIME', null, { categoryName: item.categoryName || '', totalOrders: 1 }, client);
          await analyticsRepository.upsertCategoryReport(item.categoryId, 'MONTHLY', periodDate, { categoryName: item.categoryName || '', totalOrders: 1 }, client);
        }
      }
      return;
    }

    case 'OrderCompleted': {
      const totalQty = prepared.items.reduce((sum, i) => sum + i.quantity, 0);
      await analyticsRepository.upsertDailyReport(today, { totalCompletedOrders: 1, totalItemsSold: totalQty }, client);
      await analyticsRepository.upsertMonthlyReport(year, month, { totalCompletedOrders: 1, totalItemsSold: totalQty }, client);

      for (const item of prepared.items) {
        const revenue = item.quantity * item.price;
        const productFields = {
          productName: item.name,
          sellerId: item.sellerId,
          sellerName: item.sellerName,
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          totalUnitsSold: item.quantity,
          totalRevenue: revenue,
        };
        await analyticsRepository.upsertProductSalesReport(item.productId, 'ALL_TIME', null, productFields, client);
        await analyticsRepository.upsertProductSalesReport(item.productId, 'MONTHLY', periodDate, productFields, client);

        if (item.sellerId) {
          const sellerFields = { sellerName: item.sellerName, totalItemsSold: item.quantity, totalRevenue: revenue };
          await analyticsRepository.upsertSellerPerformanceReport(item.sellerId, 'ALL_TIME', null, sellerFields, client);
          await analyticsRepository.upsertSellerPerformanceReport(item.sellerId, 'MONTHLY', periodDate, sellerFields, client);
        }

        if (item.categoryId) {
          const categoryFields = { categoryName: item.categoryName || '', totalUnitsSold: item.quantity, totalRevenue: revenue };
          await analyticsRepository.upsertCategoryReport(item.categoryId, 'ALL_TIME', null, categoryFields, client);
          await analyticsRepository.upsertCategoryReport(item.categoryId, 'MONTHLY', periodDate, categoryFields, client);
        }
      }
      return;
    }

    case 'PaymentSuccess':
      await analyticsRepository.upsertDailyReport(today, { totalRevenue: prepared.amount }, client);
      await analyticsRepository.upsertMonthlyReport(year, month, { totalRevenue: prepared.amount }, client);
      await analyticsRepository.upsertPaymentReport(today, { successCount: 1, amount: prepared.amount }, client);
      return;

    case 'PaymentFailed':
      await analyticsRepository.upsertPaymentReport(today, { failedCount: 1 }, client);
      return;

    case 'PaymentExpired':
      await analyticsRepository.upsertPaymentReport(today, { expiredCount: 1 }, client);
      return;

    case 'OrderCancelled':
      await analyticsRepository.upsertDailyReport(today, { totalCancelledOrders: 1 }, client);
      await analyticsRepository.upsertMonthlyReport(year, month, { totalCancelledOrders: 1 }, client);
      return;

    case 'ReviewCreated': {
      const fields = {
        productName: prepared.product.name,
        sellerId: prepared.product.sellerId,
        sellerName: prepared.product.sellerName,
        averageRating: prepared.averageRating,
      };
      await analyticsRepository.upsertProductSalesReport(prepared.productId, 'ALL_TIME', null, fields, client);
      await analyticsRepository.upsertProductSalesReport(prepared.productId, 'MONTHLY', periodDate, fields, client);

      if (prepared.product.sellerId) {
        const sellerFields = {
          sellerName: prepared.product.sellerName,
          totalReviews: 1,
          averageRating: prepared.averageRating,
        };
        await analyticsRepository.upsertSellerPerformanceReport(prepared.product.sellerId, 'ALL_TIME', null, sellerFields, client);
        await analyticsRepository.upsertSellerPerformanceReport(prepared.product.sellerId, 'MONTHLY', periodDate, sellerFields, client);
      }
      return;
    }

    case 'Ignored':
      logger.warn(`[Analytics] Unhandled event: ${prepared.eventName}`);
  }
}

// --- Query services ---------------------------------------------------------

export const analyticsService = {
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
