import { Request, Response } from 'express';
import { cartService } from '../services/cart.service';
import { successResponse } from '@nexacommerce/common';
import { addCartItemSchema, updateCartItemSchema } from '@nexacommerce/validation';

export class CartController {
  getCart = async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string || req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const cart = await cartService.getCart(userId);
    res.status(200).json(successResponse(cart, 'Cart retrieved successfully'));
  };

  addToCart = async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string || req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    
    const { productId, quantity } = addCartItemSchema.parse(req.body);
    const cart = await cartService.addToCart(userId, productId, quantity);
    res.status(200).json(successResponse(cart, 'Item added to cart successfully'));
  };

  updateCartItem = async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string || req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { itemId } = req.params;
    const { quantity } = updateCartItemSchema.parse(req.body);
    const cart = await cartService.updateCartItem(userId, itemId, quantity);
    res.status(200).json(successResponse(cart, 'Cart item updated successfully'));
  };

  deleteCartItem = async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string || req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { itemId } = req.params;
    const cart = await cartService.deleteCartItem(userId, itemId);
    res.status(200).json(successResponse(cart, 'Cart item deleted successfully'));
  };

  clearCart = async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string || req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const cart = await cartService.clearCart(userId);
    res.status(200).json(successResponse(cart, 'Cart cleared successfully'));
  };

  // --- Internal Microservice Endpoints ---
  getCartInternal = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const cart = await cartService.getCartRaw(userId);
    res.status(200).json(successResponse(cart, 'Raw cart data retrieved'));
  };

  clearCartInternal = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const cart = await cartService.clearCart(userId);
    res.status(200).json(successResponse(cart, 'Cart cleared internally'));
  };
}

export const cartController = new CartController();
export default cartController;
