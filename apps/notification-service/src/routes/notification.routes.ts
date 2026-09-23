import { Router, Request, Response, NextFunction } from 'express';
import { notificationController } from '../controllers/notification.controller';
import {
  asyncHandler,
  createInternalServiceGuard,
} from '@nexacommerce/common';

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

router.use(populateUserContext);

// --- Authenticated internal routes ---
router.post(
  '/internal/auth-email',
  createInternalServiceGuard(['auth-service']),
  asyncHandler(notificationController.sendAuthEmail),
);

// --- Authenticated routes ---
router.get('/', restrictTo('CUSTOMER', 'SELLER', 'ADMIN'), asyncHandler(notificationController.getNotifications));
router.get('/unread-count', restrictTo('CUSTOMER', 'SELLER', 'ADMIN'), asyncHandler(notificationController.getUnreadCount));
router.patch('/:id/read', restrictTo('CUSTOMER', 'SELLER', 'ADMIN'), asyncHandler(notificationController.markAsRead));
router.post('/read-all', restrictTo('CUSTOMER', 'SELLER', 'ADMIN'), asyncHandler(notificationController.markAllAsRead));

// --- Admin routes ---
router.get('/admin/email-logs', restrictTo('ADMIN'), asyncHandler(notificationController.getEmailLogs));

// --- Seed templates manually (useful for controlled initialization) ---
router.post('/seed-templates', restrictTo('ADMIN'), asyncHandler(notificationController.seedTemplates));

export default router;
export { router as notificationRoutes };
