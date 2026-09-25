import { Router } from 'express';
import { cartController } from '../controllers/cart.controller';
import { asyncHandler, createInternalServiceGuard } from '@nexacommerce/common';

const router = Router();

const checkInternalService = createInternalServiceGuard(['order-service', 'payment-service', 'voucher-service']);

// Gateway / User Client Routes
router.get('/', asyncHandler(cartController.getCart));
router.post('/items', asyncHandler(cartController.addToCart));
router.patch('/items/:itemId', asyncHandler(cartController.updateCartItem));
router.delete('/items/:itemId', asyncHandler(cartController.deleteCartItem));
router.delete('/clear', asyncHandler(cartController.clearCart));

// Internal Microservice Routes
router.get('/internal/cart/:userId', checkInternalService, asyncHandler(cartController.getCartInternal));
router.delete('/internal/cart/:userId', checkInternalService, asyncHandler(cartController.clearCartInternal));

export default router;
export { router as cartRoutes };
