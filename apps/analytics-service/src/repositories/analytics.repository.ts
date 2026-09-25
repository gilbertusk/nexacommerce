import { prisma } from '../prisma/client';
import { Prisma } from '../generated/client';

/**
 * Either the ambient client or a transaction client. Write methods accept one
 * so an event handler can commit its report mutations in the same transaction
 * as the inbox record that marks the event consumed.
 */
export type AnalyticsWriteClient = Prisma.TransactionClient | typeof prisma;

function todayDate(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function firstOfMonth(year: number, month: number): Date {
  return new Date(year, month - 1, 1, 0, 0, 0, 0);
}

// ─── Daily Sales ────────────────────────────────────────────────────────────

export const analyticsRepository = {
  // ── Daily ──────────────────────────────────────────────────────────────
  async upsertDailyReport(date: Date, update: Partial<{
    totalOrders: number;
    totalCompletedOrders: number;
    totalCancelledOrders: number;
    totalRevenue: number;
    totalItemsSold: number;
  }>, client: AnalyticsWriteClient = prisma) {
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);

    const existing = await client.dailySalesReport.findUnique({ where: { date: day } });

    if (!existing) {
      const data: any = { date: day, ...update };
      if (data.totalOrders && data.totalRevenue != null) {
        data.averageOrderValue = data.totalOrders > 0 ? data.totalRevenue / data.totalOrders : 0;
      }
      return client.dailySalesReport.create({ data });
    }

    const totalOrders = existing.totalOrders + (update.totalOrders || 0);
    const totalRevenue = Number(existing.totalRevenue) + (update.totalRevenue || 0);
    const totalCompletedOrders = existing.totalCompletedOrders + (update.totalCompletedOrders || 0);
    const totalCancelledOrders = existing.totalCancelledOrders + (update.totalCancelledOrders || 0);
    const totalItemsSold = existing.totalItemsSold + (update.totalItemsSold || 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return client.dailySalesReport.update({
      where: { date: day },
      data: { totalOrders, totalRevenue, totalCompletedOrders, totalCancelledOrders, totalItemsSold, averageOrderValue },
    });
  },

  async findDailyReports(startDate: Date, endDate: Date) {
    return prisma.dailySalesReport.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      orderBy: { date: 'asc' },
    });
  },

  async findRecentDailyReports(days: number) {
    const start = new Date();
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);
    return prisma.dailySalesReport.findMany({
      where: { date: { gte: start } },
      orderBy: { date: 'asc' },
    });
  },

  async sumAllDailyRevenue() {
    return prisma.dailySalesReport.aggregate({
      _sum: { totalRevenue: true, totalOrders: true, totalItemsSold: true, totalCompletedOrders: true, totalCancelledOrders: true },
    });
  },

  // ── Monthly ────────────────────────────────────────────────────────────
  async upsertMonthlyReport(year: number, month: number, update: Partial<{
    totalOrders: number;
    totalCompletedOrders: number;
    totalCancelledOrders: number;
    totalRevenue: number;
    totalItemsSold: number;
  }>, client: AnalyticsWriteClient = prisma) {
    const existing = await client.monthlySalesReport.findUnique({ where: { year_month: { year, month } } });

    if (!existing) {
      const data: any = { year, month, ...update };
      if (data.totalOrders && data.totalRevenue != null) {
        data.averageOrderValue = data.totalOrders > 0 ? data.totalRevenue / data.totalOrders : 0;
      }
      return client.monthlySalesReport.create({ data });
    }

    const totalOrders = existing.totalOrders + (update.totalOrders || 0);
    const totalRevenue = Number(existing.totalRevenue) + (update.totalRevenue || 0);
    const totalCompletedOrders = existing.totalCompletedOrders + (update.totalCompletedOrders || 0);
    const totalCancelledOrders = existing.totalCancelledOrders + (update.totalCancelledOrders || 0);
    const totalItemsSold = existing.totalItemsSold + (update.totalItemsSold || 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return client.monthlySalesReport.update({
      where: { year_month: { year, month } },
      data: { totalOrders, totalRevenue, totalCompletedOrders, totalCancelledOrders, totalItemsSold, averageOrderValue },
    });
  },

  async findMonthlyReports(startYear: number, startMonth: number, endYear: number, endMonth: number) {
    return prisma.monthlySalesReport.findMany({
      where: {
        OR: [
          { year: { gt: startYear } },
          { year: startYear, month: { gte: startMonth } },
        ],
        AND: [
          {
            OR: [
              { year: { lt: endYear } },
              { year: endYear, month: { lte: endMonth } },
            ],
          },
        ],
      },
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
    });
  },

  // ── Product Sales ──────────────────────────────────────────────────────
  async upsertProductSalesReport(productId: string, periodType: string, periodDate: Date | null, update: {
    productName?: string;
    sellerId?: string;
    sellerName?: string;
    categoryId?: string | null;
    categoryName?: string | null;
    totalOrders?: number;
    totalUnitsSold?: number;
    totalRevenue?: number;
    averageRating?: number;
  }, client: AnalyticsWriteClient = prisma) {
    const where = { productId_periodType_periodDate: { productId, periodType, periodDate: periodDate as any } };
    const existing = await client.productSalesReport.findUnique({ where });

    if (!existing) {
      return client.productSalesReport.create({
        data: {
          productId,
          productName: update.productName || '',
          sellerId: update.sellerId || '',
          sellerName: update.sellerName || '',
          categoryId: update.categoryId,
          categoryName: update.categoryName,
          totalOrders: update.totalOrders || 0,
          totalUnitsSold: update.totalUnitsSold || 0,
          totalRevenue: update.totalRevenue || 0,
          averageRating: update.averageRating || 0,
          periodType,
          periodDate,
        },
      });
    }

    return client.productSalesReport.update({
      where,
      data: {
        productName: update.productName || existing.productName,
        sellerId: update.sellerId || existing.sellerId,
        sellerName: update.sellerName || existing.sellerName,
        categoryId: update.categoryId !== undefined ? update.categoryId : existing.categoryId,
        categoryName: update.categoryName !== undefined ? update.categoryName : existing.categoryName,
        totalOrders: existing.totalOrders + (update.totalOrders || 0),
        totalUnitsSold: existing.totalUnitsSold + (update.totalUnitsSold || 0),
        totalRevenue: Number(existing.totalRevenue) + (update.totalRevenue || 0),
        averageRating: update.averageRating !== undefined ? update.averageRating : existing.averageRating,
      },
    });
  },

  async findTopProducts(periodType: string, periodDate: Date | null, sellerId: string | null, limit: number) {
    const where: any = { periodType };
    if (periodDate) where.periodDate = periodDate;
    if (sellerId) where.sellerId = sellerId;
    return prisma.productSalesReport.findMany({
      where,
      orderBy: { totalUnitsSold: 'desc' },
      take: limit,
    });
  },

  // ── Seller Performance ─────────────────────────────────────────────────
  async upsertSellerPerformanceReport(sellerId: string, periodType: string, periodDate: Date | null, update: {
    sellerName?: string;
    totalOrders?: number;
    totalRevenue?: number;
    totalItemsSold?: number;
    totalCancelled?: number;
    totalReviews?: number;
    averageRating?: number;
  }, client: AnalyticsWriteClient = prisma) {
    const where = { sellerId_periodType_periodDate: { sellerId, periodType, periodDate: periodDate as any } };
    const existing = await client.sellerPerformanceReport.findUnique({ where });

    if (!existing) {
      const totalOrders = update.totalOrders || 0;
      const totalCancelled = update.totalCancelled || 0;
      const cancellationRate = totalOrders > 0 ? (totalCancelled / totalOrders) * 100 : 0;
      return client.sellerPerformanceReport.create({
        data: {
          sellerId,
          sellerName: update.sellerName || '',
          totalOrders,
          totalRevenue: update.totalRevenue || 0,
          totalItemsSold: update.totalItemsSold || 0,
          totalCancelled,
          totalReviews: update.totalReviews || 0,
          averageRating: update.averageRating || 0,
          cancellationRate,
          periodType,
          periodDate,
        },
      });
    }

    const totalOrders = existing.totalOrders + (update.totalOrders || 0);
    const totalCancelled = existing.totalCancelled + (update.totalCancelled || 0);
    const cancellationRate = totalOrders > 0 ? (totalCancelled / totalOrders) * 100 : 0;

    return client.sellerPerformanceReport.update({
      where,
      data: {
        sellerName: update.sellerName || existing.sellerName,
        totalOrders,
        totalRevenue: Number(existing.totalRevenue) + (update.totalRevenue || 0),
        totalItemsSold: existing.totalItemsSold + (update.totalItemsSold || 0),
        totalCancelled,
        totalReviews: existing.totalReviews + (update.totalReviews || 0),
        averageRating: update.averageRating !== undefined ? update.averageRating : existing.averageRating,
        cancellationRate,
      },
    });
  },

  async findSellerPerformance(periodType: string, periodDate: Date | null, limit: number, sortBy: string) {
    const where: any = { periodType };
    if (periodDate) where.periodDate = periodDate;
    const orderBy: any = sortBy === 'rating' ? { averageRating: 'desc' }
      : sortBy === 'orders' ? { totalOrders: 'desc' }
        : { totalRevenue: 'desc' };
    return prisma.sellerPerformanceReport.findMany({ where, orderBy, take: limit });
  },

  async findSellerReport(sellerId: string, periodType: string) {
    return prisma.sellerPerformanceReport.findFirst({
      where: { sellerId, periodType },
    });
  },

  // ── Payment Reports ────────────────────────────────────────────────────
  async upsertPaymentReport(date: Date, update: {
    successCount?: number;
    failedCount?: number;
    expiredCount?: number;
    amount?: number;
  }, client: AnalyticsWriteClient = prisma) {
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);

    const existing = await client.paymentReport.findUnique({ where: { date: day } });

    if (!existing) {
      const successCount = update.successCount || 0;
      const failedCount = update.failedCount || 0;
      const expiredCount = update.expiredCount || 0;
      const totalTransactions = successCount + failedCount + expiredCount;
      const totalAmount = update.amount || 0;
      const successRate = totalTransactions > 0 ? (successCount / totalTransactions) * 100 : 0;
      const averageAmount = successCount > 0 ? totalAmount / successCount : 0;
      return client.paymentReport.create({
        data: { date: day, totalTransactions, successCount, failedCount, expiredCount, successRate, totalAmount, averageAmount },
      });
    }

    const successCount = existing.successCount + (update.successCount || 0);
    const failedCount = existing.failedCount + (update.failedCount || 0);
    const expiredCount = existing.expiredCount + (update.expiredCount || 0);
    const totalTransactions = successCount + failedCount + expiredCount;
    const totalAmount = Number(existing.totalAmount) + (update.amount || 0);
    const successRate = totalTransactions > 0 ? (successCount / totalTransactions) * 100 : 0;
    const averageAmount = successCount > 0 ? totalAmount / successCount : 0;

    return client.paymentReport.update({
      where: { date: day },
      data: { successCount, failedCount, expiredCount, totalTransactions, totalAmount, averageAmount, successRate },
    });
  },

  async findPaymentReports(startDate: Date, endDate: Date) {
    return prisma.paymentReport.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      orderBy: { date: 'asc' },
    });
  },

  async aggregatePaymentStats() {
    return prisma.paymentReport.aggregate({
      _sum: { totalTransactions: true, successCount: true, failedCount: true, expiredCount: true, totalAmount: true },
    });
  },

  // ── Category Performance ───────────────────────────────────────────────
  async upsertCategoryReport(categoryId: string, periodType: string, periodDate: Date | null, update: {
    categoryName?: string;
    totalOrders?: number;
    totalRevenue?: number;
    totalUnitsSold?: number;
  }, client: AnalyticsWriteClient = prisma) {
    const where = { categoryId_periodType_periodDate: { categoryId, periodType, periodDate: periodDate as any } };
    const existing = await client.categoryPerformanceReport.findUnique({ where });

    if (!existing) {
      return client.categoryPerformanceReport.create({
        data: {
          categoryId,
          categoryName: update.categoryName || '',
          totalOrders: update.totalOrders || 0,
          totalRevenue: update.totalRevenue || 0,
          totalUnitsSold: update.totalUnitsSold || 0,
          periodType,
          periodDate,
        },
      });
    }

    return client.categoryPerformanceReport.update({
      where,
      data: {
        categoryName: update.categoryName || existing.categoryName,
        totalOrders: existing.totalOrders + (update.totalOrders || 0),
        totalRevenue: Number(existing.totalRevenue) + (update.totalRevenue || 0),
        totalUnitsSold: existing.totalUnitsSold + (update.totalUnitsSold || 0),
      },
    });
  },

  async findTopCategories(periodType: string, periodDate: Date | null, limit: number) {
    const where: any = { periodType };
    if (periodDate) where.periodDate = periodDate;
    return prisma.categoryPerformanceReport.findMany({
      where,
      orderBy: { totalRevenue: 'desc' },
      take: limit,
    });
  },

  // ── Analytics Events ───────────────────────────────────────────────────
};
