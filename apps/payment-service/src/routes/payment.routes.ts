import { Router, Request, Response, NextFunction } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { asyncHandler, createInternalServiceGuard } from '@nexacommerce/common';

const router = Router();

// Middleware to populate req.user from gateway headers
const populateUserContext = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'] as string;
  const email = req.headers['x-user-email'] as string;
  const role = req.headers['x-user-role'] as string;

  if (userId) {
    req.user = { userId, email, role };
  }
  next();
};

// Middleware to restrict role access
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

// Middleware to verify internal calls
const checkInternalService = createInternalServiceGuard(['order-service']);

// Public endpoint for Midtrans Webhook (does NOT use populateUserContext or role guards!)
router.post('/webhook/midtrans', asyncHandler(paymentController.webhookMidtrans));

// Other routes
router.use(populateUserContext);

router.get('/order/:orderId', restrictTo('CUSTOMER', 'ADMIN'), asyncHandler(paymentController.getPaymentByOrderId));

// Admin endpoints
router.get('/stats', restrictTo('ADMIN'), asyncHandler(paymentController.getPaymentStats));
router.get('/', restrictTo('ADMIN'), asyncHandler(paymentController.listAllPayments));
router.post('/order/:orderId/refunds', restrictTo('ADMIN'), asyncHandler(paymentController.requestRefund));

// Internal endpoint
router.post('/internal/payments/create', checkInternalService, asyncHandler(paymentController.createPaymentInternal));

export default router;
export { router as paymentRoutes };
