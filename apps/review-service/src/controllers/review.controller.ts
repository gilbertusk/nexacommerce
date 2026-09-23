import { Request, Response } from 'express';
import { reviewService } from '../services/review.service';
import { reviewRepository } from '../repositories/review.repository';
import { successResponse, ValidationError } from '@nexacommerce/common';

export class ReviewController {
  getReviews = async (req: Request, res: Response) => {
    const { productId } = req.params;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const sortBy = req.query.sortBy as 'newest' | 'highest' | 'lowest' || 'newest';
    const rating = req.query.rating ? parseInt(req.query.rating as string, 10) : undefined;

    const result = await reviewService.getReviews(productId, { page, limit, sortBy, rating });
    res.status(200).json(successResponse(result, 'Product reviews retrieved successfully'));
  };

  createReview = async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    const userName = req.headers['x-user-email'] as string || 'Verified Purchase'; // fallback or name
    
    // Zod validation should be applied or simple check
    const { productId, orderId, orderItemId, rating, title, content, images } = req.body;
    if (!productId || !orderId || !orderItemId || !rating || !content) {
      throw new ValidationError('Missing required fields for review creation');
    }

    const result = await reviewService.createReview(userId, userName, {
      productId,
      orderId,
      orderItemId,
      rating,
      title,
      content,
      images,
    });

    res.status(201).json(successResponse(result, 'Review submitted successfully'));
  };

  updateReview = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.headers['x-user-id'] as string;
    const { rating, title, content, images } = req.body;

    const result = await reviewService.updateReview(id, userId, {
      rating,
      title,
      content,
      images,
    });

    res.status(200).json(successResponse(result, 'Review updated successfully'));
  };

  deleteReview = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.headers['x-user-id'] as string;

    const result = await reviewService.deleteReview(id, userId);
    res.status(200).json(successResponse(result, 'Review deleted successfully'));
  };

  createReport = async (req: Request, res: Response) => {
    const { id } = req.params; // reviewId
    const userId = req.headers['x-user-id'] as string;
    const { reason, description } = req.body;
    if (!reason) {
      throw new ValidationError('reason is required');
    }

    const result = await reviewService.createReport(userId, id, reason, description);
    res.status(201).json(successResponse(result, 'Review reported successfully'));
  };

  moderateReview = async (req: Request, res: Response) => {
    const { id } = req.params;
    const adminUserId = req.headers['x-user-id'] as string || 'ADMIN';
    const { moderationStatus, moderationNote } = req.body;
    if (!moderationStatus) {
      throw new ValidationError('moderationStatus is required');
    }

    const result = await reviewService.moderateReview(id, adminUserId, {
      moderationStatus,
      moderationNote,
    });

    res.status(200).json(successResponse(result, 'Review moderated successfully'));
  };

  getReports = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const status = req.query.status as string;

    const result = await reviewService.getReports(status, page, limit);
    res.status(200).json(successResponse(result, 'Review reports retrieved successfully'));
  };

  updateReportStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const adminUserId = req.headers['x-user-id'] as string || 'ADMIN';
    const { status } = req.body;
    if (!status) {
      throw new ValidationError('status is required');
    }

    const result = await reviewService.updateReportStatus(id, adminUserId, { status });
    res.status(200).json(successResponse(result, 'Report status updated successfully'));
  };

  getSellerReviews = async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const rating = req.query.rating ? parseInt(req.query.rating as string, 10) : undefined;
    const sortBy = req.query.sortBy as 'newest' | 'highest' | 'lowest' || 'newest';

    const result = await reviewService.getSellerReviews(userId, page, limit, rating, sortBy);
    res.status(200).json(successResponse(result, 'Seller reviews retrieved successfully'));
  };

  getSummary = async (req: Request, res: Response) => {
    const { productId } = req.params;
    const result = await reviewService.getSummary(productId);
    res.status(200).json(successResponse(result, 'Product rating summary retrieved'));
  };

  // --- Internal microservice endpoints ---
  internalGetSummary = async (req: Request, res: Response) => {
    const { productId } = req.params;
    const result = await reviewService.getSummary(productId);
    res.status(200).json(successResponse(result, 'Product summary retrieved'));
  };

  internalGetSummaryBatch = async (req: Request, res: Response) => {
    const { productIds } = req.body;
    if (!productIds || !Array.isArray(productIds)) {
      throw new ValidationError('productIds array is required');
    }
    const result = await reviewService.getSummaryBatch(productIds);
    res.status(200).json(successResponse(result, 'Batch product summaries retrieved'));
  };

  internalGetReview = async (req: Request, res: Response) => {
    const { id } = req.params;
    const review = await reviewRepository.findReviewById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    res.status(200).json(successResponse(review, 'Review retrieved internally'));
  };
}

export const reviewController = new ReviewController();
export default reviewController;
