import { Router, Request, Response, NextFunction } from 'express';
import { userController } from '../controllers/user.controller';
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

// Middleware to check if internal service
const checkInternalService = createInternalServiceGuard(['order-service', 'cart-service', 'product-service', 'shipping-service']);

// Middleware to enforce roles
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

// --- User Profile Endpoints ---
router.get('/me', asyncHandler(userController.getProfile));
router.patch('/me', asyncHandler(userController.updateProfile));

// --- Address Endpoints ---
router.get('/me/addresses', asyncHandler(userController.getAddresses));
router.post('/me/addresses', asyncHandler(userController.createAddress));
router.patch('/me/addresses/:id', asyncHandler(userController.updateAddress));
router.delete('/me/addresses/:id', asyncHandler(userController.deleteAddress));
router.patch('/me/addresses/:id/set-default', asyncHandler(userController.setDefaultAddress));

// --- Seller Profile Endpoints ---
router.post('/seller-profile', asyncHandler(userController.createSellerProfile));
router.get('/seller-profile/me', asyncHandler(userController.getSellerProfile));
router.patch('/seller-profile/me', asyncHandler(userController.updateSellerProfile));
router.put('/seller-profile/me/dispatch-origin', asyncHandler(userController.setSellerDispatchOrigin));

// --- Admin Endpoints (ADMIN only) ---
router.get('/', restrictTo('ADMIN'), asyncHandler(userController.listUsers));
router.get('/seller-profiles', restrictTo('ADMIN'), asyncHandler(userController.listSellerProfiles));
router.patch('/seller-profiles/:id/status', restrictTo('ADMIN'), asyncHandler(userController.updateSellerProfileStatus));
router.patch('/seller-profiles/:id/dispatch-origin', restrictTo('ADMIN'), asyncHandler(userController.verifySellerDispatchOrigin));
router.get('/:id', restrictTo('ADMIN'), asyncHandler(userController.getUserById));
router.patch('/:id/status', restrictTo('ADMIN'), asyncHandler(userController.updateUserStatus));

// --- Internal microservice endpoints ---
router.get('/internal/users/:userId/addresses/:addressId', checkInternalService, asyncHandler(userController.internalGetAddress));
router.post('/internal/sellers/dispatch-origins', checkInternalService, asyncHandler(userController.internalGetSellerOrigins));

export default router;
export { router as userRoutes };
