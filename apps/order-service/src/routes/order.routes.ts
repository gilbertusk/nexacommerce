import { Router, Request, Response, NextFunction } from 'express';
import { orderController } from '../controllers/order.controller';
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

const checkInternalService = createInternalServiceGuard([
  'shipping-service',
  'review-service',
  'notification-service',
  'payment-service',
  'cart-service',
  'analytics-service',
]);

router.use(populateUserContext);

// --- Internal endpoints (must be before /:id to avoid route collision) ---
router.get('/internal/orders/check-review-eligibility', checkInternalService, asyncHandler(orderController.internalCheckReviewEligibility));
router.get('/internal/orders/seller/:sellerId/recent', checkInternalService, asyncHandler(orderController.internalGetRecentSellerOrders));
router.get('/internal/orders/seller/:sellerId', checkInternalService, asyncHandler(orderController.internalGetSellerOrders));
router.get('/internal/orders/:orderId', checkInternalService, asyncHandler(orderController.internalGetOrder));
router.post('/internal/orders/:orderId/refund-completed', checkInternalService, asyncHandler(orderController.internalMarkRefundCompleted));
router.post('/internal/orders/:orderId/refund-partial', checkInternalService, asyncHandler(orderController.internalMarkRefundPartial));

// --- Admin ---
router.get('/admin/all', restrictTo('ADMIN'), asyncHandler(orderController.adminListAllOrders));
router.get('/admin/complaints', restrictTo('ADMIN'), asyncHandler(orderController.adminListComplaints));
router.patch('/admin/complaints/:complaintId', restrictTo('ADMIN'), asyncHandler(orderController.adminUpdateComplaint));

// --- Customer Checkout ---
router.post('/checkout', restrictTo('CUSTOMER'), asyncHandler(orderController.checkout));

// --- Order Actions ---
router.patch('/:id/cancel', restrictTo('CUSTOMER', 'ADMIN'), asyncHandler(orderController.cancelOrder));
router.patch('/:id/complete', restrictTo('CUSTOMER'), asyncHandler(orderController.completeOrder));
router.patch('/:id/status', restrictTo('SELLER', 'ADMIN'), asyncHandler(orderController.updateStatus));
router.post('/:id/return-request', restrictTo('CUSTOMER'), asyncHandler(orderController.requestReturn));
router.patch('/:id/return-request', restrictTo('SELLER', 'ADMIN'), asyncHandler(orderController.updateReturnRequest));
router.post('/:id/complaints', restrictTo('CUSTOMER'), asyncHandler(orderController.createComplaint));
router.get('/:id/complaints', restrictTo('CUSTOMER'), asyncHandler(orderController.getOrderComplaint));

// --- List and detail ---
router.get('/', restrictTo('CUSTOMER', 'SELLER', 'ADMIN'), asyncHandler(orderController.listOrders));
router.get('/:id', restrictTo('CUSTOMER', 'SELLER', 'ADMIN'), asyncHandler(orderController.getOrderById));

export default router;
export { router as orderRoutes };
