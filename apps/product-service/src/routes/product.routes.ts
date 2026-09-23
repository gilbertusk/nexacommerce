import { Router, Request, Response, NextFunction } from 'express';
import { productController } from '../controllers/product.controller';
import { asyncHandler, createInternalServiceGuard } from '@nexacommerce/common';

const router = Router();

// Middleware to enforce role restrictions
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

// Middleware to check if internal service
const checkInternalService = createInternalServiceGuard([
    'user-service',
    'inventory-service',
    'order-service',
    'cart-service',
    'shipping-service',
    'review-service',
    'notification-service',
    'analytics-service',
]);

// --- Category Routes ---
router.get('/categories', asyncHandler((req, res) => productController.getCategories(req, res)));
router.post('/categories', restrictTo('ADMIN'), asyncHandler((req, res) => productController.createCategory(req, res)));
router.patch('/categories/:id', restrictTo('ADMIN'), asyncHandler((req, res) => productController.updateCategory(req, res)));
router.delete('/categories/:id', restrictTo('ADMIN'), asyncHandler((req, res) => productController.deleteCategory(req, res)));

// --- Brand Routes ---
router.get('/brands', asyncHandler((req, res) => productController.getBrands(req, res)));
router.post('/brands', restrictTo('ADMIN'), asyncHandler((req, res) => productController.createBrand(req, res)));
router.patch('/brands/:id', restrictTo('ADMIN'), asyncHandler((req, res) => productController.updateBrand(req, res)));
router.delete('/brands/:id', restrictTo('ADMIN'), asyncHandler((req, res) => productController.deleteBrand(req, res)));

// --- Product Routes ---
router.get('/products', asyncHandler((req, res) => productController.getProducts(req, res)));
router.post('/products', restrictTo('SELLER', 'ADMIN'), asyncHandler((req, res) => productController.createProduct(req, res)));
router.get('/products/seller/:sellerId', asyncHandler((req, res) => productController.getSellerProducts(req, res)));
router.get('/products/:id', asyncHandler((req, res) => productController.getProductById(req, res)));
router.patch('/products/:id', restrictTo('SELLER', 'ADMIN'), asyncHandler((req, res) => productController.updateProduct(req, res)));
router.delete('/products/:id', restrictTo('SELLER', 'ADMIN'), asyncHandler((req, res) => productController.deleteProduct(req, res)));

// --- Product Image Routes ---
router.post('/products/:id/images', restrictTo('SELLER', 'ADMIN'), asyncHandler((req, res) => productController.addProductImage(req, res)));
router.patch('/products/:id/images/:imageId', restrictTo('SELLER', 'ADMIN'), asyncHandler((req, res) => productController.updateProductImage(req, res)));
router.delete('/products/:id/images/:imageId', restrictTo('SELLER', 'ADMIN'), asyncHandler((req, res) => productController.deleteProductImage(req, res)));

// --- Internal microservice endpoints ---
router.get('/internal/products/count', checkInternalService, asyncHandler((req, res) => productController.countProducts(req, res)));
router.get('/internal/products/seller/:sellerId', checkInternalService, asyncHandler((req, res) => productController.getSellerProductIds(req, res)));
router.get('/internal/products/:id', checkInternalService, asyncHandler((req, res) => productController.getProductById(req, res)));
router.post('/internal/products/batch', checkInternalService, asyncHandler((req, res) => productController.getProductsBatch(req, res)));

export default router;
export { router as productRoutes };
