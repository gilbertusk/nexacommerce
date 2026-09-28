import { Router, Request, Response, NextFunction } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { asyncHandler } from '@nexacommerce/common';

const router = Router();

const populateUserContext = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'] as string;
  const email = req.headers['x-user-email'] as string;
  const role = req.headers['x-user-role'] as string;
  if (userId) req.user = { userId, email, role };
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

router.use(populateUserContext);

// Admin endpoints
router.get('/dashboard', restrictTo('ADMIN'), asyncHandler(analyticsController.adminDashboard));
router.get('/revenue', restrictTo('ADMIN'), asyncHandler(analyticsController.revenueReport));
router.get('/orders', restrictTo('ADMIN'), asyncHandler(analyticsController.orderReport));
router.get('/products/top-selling', restrictTo('ADMIN', 'SELLER'), asyncHandler(analyticsController.topProducts));
router.get('/categories/top-selling', restrictTo('ADMIN'), asyncHandler(analyticsController.topCategories));
router.get('/sellers/performance', restrictTo('ADMIN'), asyncHandler(analyticsController.sellerPerformance));
router.get('/payments/success-rate', restrictTo('ADMIN'), asyncHandler(analyticsController.paymentSuccessRate));
router.get('/orders/cancellation-rate', restrictTo('ADMIN'), asyncHandler(analyticsController.cancellationRate));
router.get('/projections/daily/comparison', restrictTo('ADMIN'), asyncHandler(analyticsController.dailyProjectionComparison));

// Seller endpoint
router.get('/seller/dashboard', restrictTo('SELLER'), asyncHandler(analyticsController.sellerDashboard));

export default router;
export { router as analyticsRoutes };
