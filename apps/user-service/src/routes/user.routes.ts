import { Router, Request, Response, NextFunction } from 'express';
import { userController } from '../controllers/user.controller';
import { asyncHandler, ForbiddenError, UnauthorizedError } from '@nexacommerce/common';

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

// --- Seller Profile Endpoints ---
router.post('/seller-profile', asyncHandler(userController.createSellerProfile));
router.get('/seller-profile/me', asyncHandler(userController.getSellerProfile));
router.patch('/seller-profile/me', asyncHandler(userController.updateSellerProfile));

// --- Admin Endpoints (ADMIN only) ---
router.get('/', restrictTo('ADMIN'), asyncHandler(userController.listUsers));
router.get('/:id', restrictTo('ADMIN'), asyncHandler(userController.getUserById));
router.patch('/:id/status', restrictTo('ADMIN'), asyncHandler(userController.updateUserStatus));

export default router;
export { router as userRoutes };
