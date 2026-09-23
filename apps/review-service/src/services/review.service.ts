import { reviewRepository } from '../repositories/review.repository';
import { prisma } from '../prisma/client';
import { NotFoundError, ValidationError, ForbiddenError, buildInternalServiceHeaders } from '@nexacommerce/common';
import { publishReviewCreated } from '../messaging/rabbitmq';
import { config } from '../config';

export class ReviewService {
  async getReviews(productId: string, query: {
    page?: number;
    limit?: number;
    sortBy?: 'newest' | 'highest' | 'lowest';
    rating?: number;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy || 'newest';

    const reviews = await reviewRepository.findReviewsByProductId(productId, {
      skip,
      take: limit,
      sortBy,
      rating: query.rating,
    });

    const summary = await this.getSummary(productId);

    return {
      reviews,
      summary,
      page,
      limit,
    };
  }

  async getSummary(productId: string) {
    const summary = await reviewRepository.findRatingSummaryByProductId(productId);
    if (!summary) {
      return {
        productId,
        averageRating: 0,
        totalReviews: 0,
        rating5Count: 0,
        rating4Count: 0,
        rating3Count: 0,
        rating2Count: 0,
        rating1Count: 0,
      };
    }
    return summary;
  }

  async getSummaryBatch(productIds: string[]) {
    return reviewRepository.findRatingSummariesBatch(productIds);
  }

  async createReview(customerId: string, customerName: string, data: {
    productId: string;
    orderId: string;
    orderItemId: string;
    rating: number;
    title?: string;
    content: string;
    images?: string[];
  }) {
    // 1. Validate inputs
    if (data.rating < 1 || data.rating > 5) {
      throw new ValidationError('Rating must be between 1 and 5');
    }
    if (!data.content || data.content.length < 10 || data.content.length > 2000) {
      throw new ValidationError('Content must be between 10 and 2000 characters');
    }
    if (data.images && data.images.length > 5) {
      throw new ValidationError('Maximum 5 images allowed per review');
    }

    // 2. Call Order Service internal to validate eligibility
    try {
      const eligibilityUrl = `${config.orderServiceUrl}/orders/internal/orders/check-review-eligibility?customerId=${customerId}&productId=${data.productId}&orderItemId=${data.orderItemId}`;
      const response = await fetch(eligibilityUrl, {
        headers: buildInternalServiceHeaders('review-service')
      });
      
      const resBody = await response.json() as any;
      if (!response.ok || !resBody.success || !resBody.data.eligible) {
        throw new ValidationError(resBody.data?.reason || resBody.message || 'You are not eligible to review this item');
      }
    } catch (err: any) {
      if (err instanceof ValidationError) throw err;
      throw new ValidationError(`Failed to verify review eligibility: ${err.message}`);
    }

    const existingReview = await prisma.review.findUnique({
      where: {
        customer_order_item: {
          customerId,
          orderItemId: data.orderItemId,
        },
      },
    });

    if (existingReview) {
      throw new ValidationError('You have already submitted a review for this item');
    }

    // 3. Create review in transaction and recalculate summary
    const result = await prisma.$transaction(async (tx) => {
      const review = await reviewRepository.createReview(tx, {
        productId: data.productId,
        customerId,
        customerName,
        orderId: data.orderId,
        orderItemId: data.orderItemId,
        rating: data.rating,
        title: data.title,
        content: data.content,
        images: data.images,
      });

      await this.recalculateRatingSummary(tx, data.productId);
      return review;
    });

    // 4. Publish Event
    await publishReviewCreated({
      reviewId: result!.id,
      productId: result!.productId,
      customerId: result!.customerId,
      rating: result!.rating,
      orderId: result!.orderId,
    }).catch((err) => console.error('[Review Service] Publish event failed:', err.message));

    return result;
  }

  async updateReview(id: string, customerId: string, data: {
    rating?: number;
    title?: string | null;
    content?: string;
    images?: string[];
  }) {
    const review = await reviewRepository.findReviewById(id);
    if (!review) {
      throw new NotFoundError('Review not found');
    }
    if (review.customerId !== customerId) {
      throw new ForbiddenError('You can only edit your own reviews');
    }

    if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
      throw new ValidationError('Rating must be between 1 and 5');
    }
    if (data.content !== undefined && (data.content.length < 10 || data.content.length > 2000)) {
      throw new ValidationError('Content must be between 10 and 2000 characters');
    }
    if (data.images && data.images.length > 5) {
      throw new ValidationError('Maximum 5 images allowed per review');
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await reviewRepository.updateReview(tx, id, {
        rating: data.rating,
        title: data.title,
        content: data.content,
        isEdited: true,
        images: data.images,
      });

      await this.recalculateRatingSummary(tx, review.productId);
      return updated;
    });

    // Publish event if rating changed? Rencana event-contracts tidak mewajibkan update event untuk review edit.
    return result;
  }

  async deleteReview(id: string, customerId: string) {
    const review = await reviewRepository.findReviewById(id);
    if (!review) {
      throw new NotFoundError('Review not found');
    }
    if (review.customerId !== customerId) {
      throw new ForbiddenError('You can only delete your own reviews');
    }

    await prisma.$transaction(async (tx) => {
      // Soft delete in DB
      await tx.review.update({
        where: { id },
        data: { isVisible: false },
      });

      await this.recalculateRatingSummary(tx, review.productId);
    });

    return { success: true };
  }

  async createReport(customerId: string, reviewId: string, reason: string, description?: string) {
    const review = await reviewRepository.findReviewById(reviewId);
    if (!review) {
      throw new NotFoundError('Review not found');
    }

    return reviewRepository.createReport({
      reviewId,
      reportedBy: customerId,
      reason,
      description,
    });
  }

  async moderateReview(id: string, adminUserId: string, data: { moderationStatus: string; moderationNote?: string }) {
    const review = await reviewRepository.findReviewById(id);
    if (!review) {
      throw new NotFoundError('Review not found');
    }

    if (!['APPROVED', 'HIDDEN'].includes(data.moderationStatus)) {
      throw new ValidationError('Invalid moderation status');
    }

    const result = await prisma.$transaction(async (tx) => {
      const isVisible = data.moderationStatus === 'APPROVED';
      const updated = await tx.review.update({
        where: { id },
        data: {
          moderationStatus: data.moderationStatus,
          moderationNote: data.moderationNote || null,
          isVisible,
          moderatedBy: adminUserId,
          moderatedAt: new Date(),
        },
      });

      await this.recalculateRatingSummary(tx, review.productId);
      return updated;
    });

    return result;
  }

  async getReports(status?: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const { reports, total } = await reviewRepository.findAndCountReports({
      skip,
      take: limit,
      status,
    });

    return {
      reports,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateReportStatus(id: string, adminUserId: string, data: { status: string }) {
    const report = await reviewRepository.findReviewReportById(id);
    if (!report) {
      throw new NotFoundError('Report not found');
    }

    if (!['REVIEWED', 'DISMISSED'].includes(data.status)) {
      throw new ValidationError('Invalid report status');
    }

    return reviewRepository.updateReviewReport(id, {
      status: data.status,
      reviewedBy: adminUserId,
      reviewedAt: new Date(),
    });
  }

  async getSellerReviews(sellerId: string, page = 1, limit = 10, rating?: number, sortBy: 'newest' | 'highest' | 'lowest' = 'newest') {
    const skip = (page - 1) * limit;

    // Get list of productIds owned by seller from product-service
    let productIds: string[] = [];
    try {
      const response = await fetch(`${config.productServiceUrl}/products/internal/products/seller/${sellerId}`, {
        headers: buildInternalServiceHeaders('review-service')
      });
      if (response.ok) {
        const resBody = await response.json() as any;
        productIds = resBody.data || [];
      }
    } catch (err) {
      console.error('[Review Service] Failed to fetch seller products from product service:', err);
    }

    if (productIds.length === 0) {
      return { reviews: [], total: 0, page, limit, totalPages: 0 };
    }

    const where: any = {
      productId: { in: productIds },
      isVisible: true,
      moderationStatus: 'APPROVED',
    };

    if (rating) {
      where.rating = rating;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'highest') orderBy = { rating: 'desc' };
    else if (sortBy === 'lowest') orderBy = { rating: 'asc' };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { images: true },
      }),
      prisma.review.count({ where }),
    ]);

    return {
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // --- Internal recalculation routine ---
  private async recalculateRatingSummary(tx: any, productId: string) {
    // Aggregate reviews using tx client to run inside parent transaction
    const aggregations = await tx.review.groupBy({
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

    const avgAggregate = await tx.review.aggregate({
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

    const averageRating = avgAggregate._avg.rating || 0;
    const totalReviews = avgAggregate._count.rating || 0;

    await tx.productRatingSummary.upsert({
      where: { productId },
      update: {
        averageRating,
        totalReviews,
        rating1Count: counts.rating1,
        rating2Count: counts.rating2,
        rating3Count: counts.rating3,
        rating4Count: counts.rating4,
        rating5Count: counts.rating5,
      },
      create: {
        productId,
        averageRating,
        totalReviews,
        rating1Count: counts.rating1,
        rating2Count: counts.rating2,
        rating3Count: counts.rating3,
        rating4Count: counts.rating4,
        rating5Count: counts.rating5,
      },
    });
  }
}

export const reviewService = new ReviewService();
export default reviewService;
