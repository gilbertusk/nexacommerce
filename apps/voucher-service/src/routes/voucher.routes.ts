import { Router, Request, Response, NextFunction } from 'express';
import { voucherController } from '../controllers/voucher.controller';
import { asyncHandler, createInternalServiceGuard } from '@nexacommerce/common';

const router = Router();

// Middleware to restrict role access
const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.headers['x-user-role'] as string;
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
const checkInternalService = createInternalServiceGuard(['order-service', 'cart-service']);

// Public/Auth routes
router.get('/', asyncHandler((req, res) => voucherController.listVouchers(req, res)));
router.post('/validate', asyncHandler((req, res) => voucherController.validateVoucher(req, res)));

// Seller routes (must be before /:id)
router.post('/seller', restrictTo('SELLER'), asyncHandler((req, res) => voucherController.createSellerVoucher(req, res)));
router.get('/seller/mine', restrictTo('SELLER'), asyncHandler((req, res) => voucherController.listSellerVouchers(req, res)));

router.get('/:id', asyncHandler((req, res) => voucherController.getVoucherById(req, res)));
router.get('/code/:code', asyncHandler((req, res) => voucherController.getVoucherByCode(req, res)));

// Admin routes
router.post('/', restrictTo('ADMIN'), asyncHandler((req, res) => voucherController.createVoucher(req, res)));
router.patch('/:id', restrictTo('ADMIN'), asyncHandler((req, res) => voucherController.updateVoucher(req, res)));
router.delete('/:id', restrictTo('ADMIN'), asyncHandler((req, res) => voucherController.deleteVoucher(req, res)));

// Admin/Seller shared routes
router.patch('/:id/toggle', restrictTo('ADMIN', 'SELLER'), asyncHandler((req, res) => voucherController.toggleVoucher(req, res)));
router.get('/:id/usage-history', restrictTo('ADMIN', 'SELLER'), asyncHandler((req, res) => voucherController.getUsageHistory(req, res)));

// Internal microservice endpoints
router.post('/internal/vouchers/validate', checkInternalService, asyncHandler((req, res) => voucherController.internalValidate(req, res)));
router.post('/internal/vouchers/apply', checkInternalService, asyncHandler((req, res) => voucherController.internalApply(req, res)));
router.post('/internal/vouchers/release', checkInternalService, asyncHandler((req, res) => voucherController.internalRelease(req, res)));

export default router;
export { router as voucherRoutes };
