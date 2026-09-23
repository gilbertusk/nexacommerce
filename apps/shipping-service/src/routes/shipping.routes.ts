import { Router, Request, Response, NextFunction } from 'express';
import { shippingController } from '../controllers/shipping.controller';
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

const checkInternalService = createInternalServiceGuard(['order-service', 'payment-service', 'product-service', 'cart-service']);

router.use(populateUserContext);

// --- Public Endpoints ---
router.get('/couriers', asyncHandler(shippingController.getCouriers));
router.get('/rates', asyncHandler(shippingController.getRates));
router.get('/track/:trackingNumber', asyncHandler(shippingController.trackByTrackingNumber));

// --- Authenticated & Guarded Endpoints ---
router.get('/seller/orders', restrictTo('SELLER'), asyncHandler(shippingController.getSellerShippingOrders));
router.get('/admin/orders', restrictTo('ADMIN'), asyncHandler(shippingController.getAdminShippingOrders));
router.get('/:orderId', restrictTo('CUSTOMER', 'SELLER', 'ADMIN'), asyncHandler(shippingController.getShippingOrder));
router.patch('/:orderId/status', restrictTo('SELLER', 'ADMIN'), asyncHandler(shippingController.updateShippingStatus));
router.patch('/:orderId/tracking', restrictTo('SELLER', 'ADMIN'), asyncHandler(shippingController.updateTrackingNumber));

// --- Internal microservice endpoints ---
router.get('/internal/shipping/:orderId', checkInternalService, asyncHandler(shippingController.internalGetShipping));
router.post('/internal/shipping/create', checkInternalService, asyncHandler(shippingController.internalCreateShipping));

export default router;
export { router as shippingRoutes };
