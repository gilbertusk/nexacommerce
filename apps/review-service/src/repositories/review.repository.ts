import { prisma } from '../prisma/client';
import { Prisma } from '../generated/client';

export class ReviewRepository {
  async findReviewById(id: string) {
    return prisma.review.findUnique({
      where: { id },
      include: { images: true },
    });
  }

  async findReviewsByProductId(productId: string, params: {
    skip: number;
    take: number;
    sortBy: 'newest' | 'highest' | 'lowest';
    rating?: number;
  }) {
    const where: any = {
      productId,
      isVisible: true,
      moderationStatus: 'APPROVED',
    };

    if (params.rating) {
      where.rating = params.rating;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (params.sortBy === 'highest') {
      orderBy = { rating: 'desc' };
    } else if (params.sortBy === 'lowest') {
      orderBy = { rating: 'asc' };
    }

    return prisma.review.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy,
      include: { images: true },
    });
  }

  async findRatingSummaryByProductId(productId: string) {
    return prisma.productRatingSummary.findUnique({
      where: { productId },
    });
  }

  async upsertRatingSummary(productId: string, data: {
    averageRating: number;
    totalReviews: number;
    rating5Count: number;
    rating4Count: number;
    rating3Count: number;
    rating2Count: number;
    rating1Count: number;
  }) {
    return prisma.productRatingSummary.upsert({
      where: { productId },
      update: data,
      create: {
        productId,
        ...data,
      },
    });
  }

  async createReview(tx: Prisma.TransactionClient, data: {
    productId: string;
    customerId: string;
    customerName: string;
    orderId: string;
    orderItemId: string;
    rating: number;
    title?: string;
    content: string;
    images?: string[];
  }) {
    const review = await tx.review.create({
      data: {
        productId: data.productId,
        customerId: data.customerId,
        customerName: data.customerName,
        orderId: data.orderId,
        orderItemId: data.orderItemId,
        rating: data.rating,
        title: data.title || null,
        content: data.content,
      },
    });

    if (data.images && data.images.length > 0) {
      const imageCreateData = data.images.map((url, index) => ({
        reviewId: review.id,
        url,
        sortOrder: index,
      }));
      await tx.reviewImage.createMany({
        data: imageCreateData,
      });
    }

    return tx.review.findUnique({
      where: { id: review.id },
      include: { images: true },
    });
  }

  async updateReview(tx: Prisma.TransactionClient, id: string, data: {
    rating?: number;
    title?: string | null;
    content?: string;
    isEdited?: boolean;
    images?: string[];
  }) {
    await tx.review.update({
      where: { id },
      data: {
        rating: data.rating,
        title: data.title,
        content: data.content,
        isEdited: data.isEdited,
      },
    });

    if (data.images !== undefined) {
      // Clear old images
      await tx.reviewImage.deleteMany({
        where: { reviewId: id },
      });

      if (data.images.length > 0) {
        const imageCreateData = data.images.map((url, index) => ({
          reviewId: id,
          url,
          sortOrder: index,
        }));
        await tx.reviewImage.createMany({
          data: imageCreateData,
        });
      }
    }

    return tx.review.findUnique({
      where: { id },
      include: { images: true },
    });
  }

  async softDeleteReview(id: string) {
    return prisma.review.update({
      where: { id },
      data: { isVisible: false },
    });
  }

  async moderateReview(id: string, status: string, note?: string, adminUserId?: string) {
    const isVisible = status === 'APPROVED';
    return prisma.review.update({
      where: { id },
      data: {
        moderationStatus: status,
        moderationNote: note || null,
        isVisible,
        moderatedBy: adminUserId || null,
        moderatedAt: new Date(),
      },
    });
  }

  async createReport(data: {
    reviewId: string;
    reportedBy: string;
    reason: string;
    description?: string;
  }) {
    return prisma.reviewReport.create({
      data: {
        reviewId: data.reviewId,
        reportedBy: data.reportedBy,
        reason: data.reason,
        description: data.description || null,
      },
    });
  }

  async findReviewReportById(id: string) {
    return prisma.reviewReport.findUnique({
      where: { id },
    });
  }

  async updateReviewReport(id: string, data: {
    status: string;
    reviewedBy: string;
    reviewedAt: Date;
  }) {
    return prisma.reviewReport.update({
      where: { id },
      data,
    });
  }

  async findAndCountReports(params: {
    skip: number;
    take: number;
    status?: string;
  }) {
    const where: any = {};
    if (params.status) {
      where.status = params.status;
    }

    const [reports, total] = await Promise.all([
      prisma.reviewReport.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: {
          review: {
            include: { images: true },
          },
        },
      }),
      prisma.reviewReport.count({ where }),
    ]);

    return { reports, total };
  }

  async aggregateReviews(productId: string) {
    const aggregations = await prisma.review.groupBy({
      by: ['rating'],
      where: {
        productId,
        isVisible: true,
        moderationStatus: 'APPROVED',
      },
      _count: {
        id: true,
      },
    });

    const avgAggregate = await prisma.review.aggregate({
      where: {
        productId,
        isVisible: true,
        moderationStatus: 'APPROVED',
      },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    const counts = {
      rating1: 0,
      rating2: 0,
      rating3: 0,
      rating4: 0,
      rating5: 0,
    };

    for (const group of aggregations) {
      if (group.rating === 1) counts.rating1 = group._count.id;
      if (group.rating === 2) counts.rating2 = group._count.id;
      if (group.rating === 3) counts.rating3 = group._count.id;
      if (group.rating === 4) counts.rating4 = group._count.id;
      if (group.rating === 5) counts.rating5 = group._count.id;
    }

    return {
      averageRating: avgAggregate._avg.rating || 0,
      totalReviews: avgAggregate._count.rating || 0,
      ...counts,
    };
  }

  async findRatingSummariesBatch(productIds: string[]) {
    return prisma.productRatingSummary.findMany({
      where: {
        productId: { in: productIds },
      },
    });
  }
}

export const reviewRepository = new ReviewRepository();
export default reviewRepository;
