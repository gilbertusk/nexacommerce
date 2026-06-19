import { Router, Request, Response, NextFunction } from 'express';
import { inventoryController } from '../controllers/inventory.controller';
import { asyncHandler, ForbiddenError } from '@nexacommerce/common';

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

// --- Public Endpoints ---
router.get('/:productId', asyncHandler(inventoryController.getStockByProductId));

// --- Authenticated Endpoints (Roles check) ---
router.get('/', restrictTo('SELLER', 'ADMIN'), asyncHandler(inventoryController.getInventory));
router.post('/initialize', restrictTo('SELLER', 'ADMIN'), asyncHandler(inventoryController.initializeInventory));
router.post('/stock-in', restrictTo('SELLER', 'ADMIN'), asyncHandler(inventoryController.stockIn));
router.post('/stock-out', restrictTo('SELLER', 'ADMIN'), asyncHandler(inventoryController.stockOut));

// --- Reservation flow (triggered by Customer checkout or Admin/Seller) ---
router.post('/reserve', restrictTo('CUSTOMER', 'SELLER', 'ADMIN'), asyncHandler(inventoryController.reserveStock));
router.post('/confirm', restrictTo('CUSTOMER', 'SELLER', 'ADMIN'), asyncHandler(inventoryController.confirmStock));
router.post('/release', restrictTo('CUSTOMER', 'SELLER', 'ADMIN'), asyncHandler(inventoryController.releaseStock));

// --- Audit & Reports ---
router.get('/:productId/movements', restrictTo('SELLER', 'ADMIN'), asyncHandler(inventoryController.getMovements));
router.get('/low-stock', restrictTo('SELLER', 'ADMIN'), asyncHandler(inventoryController.getLowStock));

export default router;
export { router as inventoryRoutes };
