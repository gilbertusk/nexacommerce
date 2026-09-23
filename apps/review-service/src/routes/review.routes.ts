import { Router, Request, Response, NextFunction } from 'express';
import { reviewController } from '../controllers/review.controller';
import { asyncHandler, createInternalServiceGuard } from '@nexacommerce/common';

const router = Router();

const populateUserContext = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'] as string;
  const email = req.headers['x-user-email'] as string;
  const role = req.headers['x-user-role'] as string;

  if (userId) {
    req.user = { userId, email, role };
  }
  next();
};

const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.headers['x-user-role'] as string || req.user?.role;
    if (!userRole) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    if (!roles.includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Access denied' });
    }
    next();
  };
};

const checkInternalService = createInternalServiceGuard(['order-service', 'product-service', 'cart-service', 'notification-service']);

router.use(populateUserContext);

// --- Public Endpoints ---
router.get('/products/:productId', asyncHandler(reviewController.getReviews));
router.get('/summary/:productId', asyncHandler(reviewController.getSummary));

// --- Authenticated & Guarded Endpoints ---
router.post('/', restrictTo('CUSTOMER'), asyncHandler(reviewController.createReview));
router.patch('/:id', restrictTo('CUSTOMER'), asyncHandler(reviewController.updateReview));
router.delete('/:id', restrictTo('CUSTOMER'), asyncHandler(reviewController.deleteReview));
router.post('/:id/report', restrictTo('CUSTOMER', 'SELLER', 'ADMIN'), asyncHandler(reviewController.createReport));

// --- Seller Endpoints ---
router.get('/seller/products', restrictTo('SELLER'), asyncHandler(reviewController.getSellerReviews));

// --- Admin Endpoints ---
router.patch('/:id/moderate', restrictTo('ADMIN'), asyncHandler(reviewController.moderateReview));
router.get('/reports', restrictTo('ADMIN'), asyncHandler(reviewController.getReports));
router.patch('/reports/:id', restrictTo('ADMIN'), asyncHandler(reviewController.updateReportStatus));

// --- Internal microservice endpoints ---
router.get('/internal/reviews/summary/:productId', checkInternalService, asyncHandler(reviewController.internalGetSummary));
router.post('/internal/reviews/summary/batch', checkInternalService, asyncHandler(reviewController.internalGetSummaryBatch));
router.get('/internal/reviews/:id', checkInternalService, asyncHandler(reviewController.internalGetReview));

export default router;
export { router as reviewRoutes };
