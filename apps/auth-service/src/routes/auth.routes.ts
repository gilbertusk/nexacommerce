import { Router, Request, Response } from 'express';
import { authController } from '../controllers/auth.controller';
import { asyncHandler, parsePaginationQuery, buildPaginationResponse, successResponse, createInternalServiceGuard } from '@nexacommerce/common';
import { userRepository } from '../repositories/user.repository';
import { Status } from '../generated/client';

const router = Router();

// Internal service authentication check middleware
const checkInternalService = createInternalServiceGuard([
    'user-service',
    'inventory-service',
    'order-service',
    'cart-service',
    'payment-service',
    'product-service',
    'shipping-service',
    'review-service',
    'notification-service',
    'analytics-service',
]);

// Public & Standard Authentication Routes
router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));
router.post('/logout', asyncHandler(authController.logout));
router.post('/refresh-token', asyncHandler(authController.refreshToken));
router.post('/forgot-password', asyncHandler(authController.forgotPassword));
router.post('/reset-password', asyncHandler(authController.resetPassword));
router.post('/verify-email', asyncHandler(authController.verifyEmail));
router.get('/me', asyncHandler(authController.getMe));
router.post('/change-password', asyncHandler(authController.changePassword));
router.post('/resend-verification', asyncHandler(authController.resendVerification));

// Internal microservice endpoints
router.get('/internal/users/count', checkInternalService, asyncHandler(async (req: Request, res: Response) => {
  const role = req.query.role as string | undefined;
  const where: any = {};
  if (role) where.role = role;
  const count = await userRepository.countByFilter(where);
  res.status(200).json(successResponse({ count }, 'User count retrieved'));
}));

router.get('/internal/users', checkInternalService, asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePaginationQuery(req.query);
  const role = req.query.role as string;
  const status = req.query.status as string;

  const { users, total } = await userRepository.findAndCountAll({ skip, take: limit, role, status });

  // Map users to remove passwordHash
  const mappedUsers = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    emailVerified: u.emailVerified,
    lastLoginAt: u.lastLoginAt,
    createdAt: u.createdAt,
  }));

  res.status(200).json(successResponse(buildPaginationResponse(mappedUsers, total, page, limit), 'Internal user list retrieved'));
}));

router.get('/internal/users/:id', checkInternalService, asyncHandler(async (req: Request, res: Response) => {
  const user = await userRepository.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const mappedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    emailVerified: user.emailVerified,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };

  res.status(200).json(successResponse(mappedUser, 'Internal user details retrieved'));
}));

router.patch('/internal/users/:id/status', checkInternalService, asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;
  if (!status || !Object.values(Status).includes(status as any)) {
    return res.status(400).json({ success: false, message: 'Invalid status value' });
  }

  const user = await userRepository.updateStatus(req.params.id, status as Status);
  const mappedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  };

  res.status(200).json(successResponse(mappedUser, 'Internal user status updated'));
}));

export default router;
export { router as authRoutes };
