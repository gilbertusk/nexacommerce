import { redis } from '../redis/client';
import { config } from '../config';
import { NotFoundError, ValidationError, buildInternalServiceHeaders } from '@nexacommerce/common';
import crypto from 'crypto';

const CART_TTL = 2592000; // 30 days in seconds

export class CartService {
  private async makeInternalRequest(url: string, method: string, body?: any) {
    const headers = {
      'Content-Type': 'application/json',
      ...buildInternalServiceHeaders('cart-service'),
    };
    
    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      
      const resBody = await response.json() as any;
      if (!response.ok) {
        return null;
      }
      return resBody.data;
    } catch (err: any) {
      console.error(`[Cart Service] Internal call failed: ${url}`, err);
      return null;
    }
  }

  private getCartKey(userId: string): string {
    return `cart:${userId}`;
  }

  async getCartRaw(userId: string) {
    const key = this.getCartKey(userId);
    const data = await redis.get(key);
    if (!data) {
      return { userId, items: [], updatedAt: new Date().toISOString() };
    }
    return JSON.parse(data);
  }

  async getCart(userId: string) {
    const cart = await this.getCartRaw(userId);
    if (cart.items.length === 0) {
      return {
        userId,
        items: [],
        subtotal: 0,
        totalItems: 0,
        updatedAt: cart.updatedAt,
      };
    }

    const productIds = cart.items.map((item: any) => item.productId);
    
    // Batch fetch product info
    const productsData = await this.makeInternalRequest(
      `${config.productServiceUrl}/internal/products/batch`,
      'POST',
      { ids: productIds }
    );
    
    // Batch fetch inventory info
    const inventoryData = await this.makeInternalRequest(
      `${config.inventoryServiceUrl}/inventory/internal/inventory/batch-check`,
      'POST',
      { productIds }
    );

    const productMap = new Map();
    if (productsData) {
      productsData.forEach((p: any) => productMap.set(p.id, p));
    }

    const inventoryMap = new Map();
    if (inventoryData) {
      inventoryData.forEach((inv: any) => inventoryMap.set(inv.productId, inv));
    }

    let subtotal = 0;
    let totalItems = 0;

    const enrichedItems = cart.items.map((item: any) => {
      const product = productMap.get(item.productId);
      const inventory = inventoryMap.get(item.productId);
      
      const enriched = {
        ...item,
        priceChanged: false,
        outOfStock: false,
        insufficientStock: false,
        stock: inventory ? inventory.availableStock : 0,
      };

      if (!product || product.status !== 'ACTIVE') {
        enriched.outOfStock = true;
        enriched.stock = 0;
      } else {
        const currentPrice = Number(product.price);
        if (currentPrice !== Number(item.price)) {
          enriched.currentPrice = currentPrice;
          enriched.priceChanged = true;
        } else {
          enriched.currentPrice = Number(item.price);
        }

        const availableStock = inventory ? inventory.availableStock : 0;
        if (availableStock === 0) {
          enriched.outOfStock = true;
        } else if (availableStock < item.quantity) {
          enriched.insufficientStock = true;
        }
        
        // Update product images & seller info dynamically
        enriched.productImage = product.images?.[0]?.url || item.productImage || '';
        enriched.productName = product.name;
        
        // Add to totals if not out of stock
        if (!enriched.outOfStock) {
          subtotal += enriched.currentPrice * item.quantity;
          totalItems += item.quantity;
        }
      }

      return enriched;
    });

    return {
      userId,
      items: enrichedItems,
      subtotal,
      totalItems,
      updatedAt: cart.updatedAt,
    };
  }

  async addToCart(userId: string, productId: string, quantity: number) {
    // Validate product from Product Service
    const product = await this.makeInternalRequest(
      `${config.productServiceUrl}/internal/products/${productId}`,
      'GET'
    );
    if (!product || product.status !== 'ACTIVE') {
      throw new NotFoundError('Product not found or inactive');
    }

    // Validate inventory stock
    const inventory = await this.makeInternalRequest(
      `${config.inventoryServiceUrl}/inventory/internal/inventory/${productId}`,
      'GET'
    );
    const availableStock = inventory ? inventory.availableStock : 0;
    if (availableStock < quantity) {
      throw new ValidationError(`Insufficient stock. Available: ${availableStock}`);
    }

    const cart = await this.getCartRaw(userId);
    const existingItem = cart.items.find((item: any) => item.productId === productId);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (availableStock < newQuantity) {
        throw new ValidationError(`Insufficient stock. Available: ${availableStock}`);
      }
      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        id: crypto.randomUUID(),
        productId,
        productName: product.name,
        productImage: product.images?.[0]?.url || '',
        price: Number(product.price),
        currentPrice: Number(product.price),
        quantity,
        stock: availableStock,
        sellerId: product.sellerId,
        sellerName: product.brand?.name || 'Seller', // Use brand name or fallback
        addedAt: new Date().toISOString(),
      });
    }

    cart.updatedAt = new Date().toISOString();
    const key = this.getCartKey(userId);
    await redis.set(key, JSON.stringify(cart), 'EX', CART_TTL);

    return this.getCart(userId);
  }

  async updateCartItem(userId: string, itemId: string, quantity: number) {
    const cart = await this.getCartRaw(userId);
    const item = cart.items.find((item: any) => item.id === itemId || item.productId === itemId);
    if (!item) {
      throw new NotFoundError('Cart item not found');
    }

    // Validate inventory stock
    const inventory = await this.makeInternalRequest(
      `${config.inventoryServiceUrl}/inventory/internal/inventory/${item.productId}`,
      'GET'
    );
    const availableStock = inventory ? inventory.availableStock : 0;
    if (availableStock < quantity) {
      throw new ValidationError(`Insufficient stock. Available: ${availableStock}`);
    }

    item.quantity = quantity;
    cart.updatedAt = new Date().toISOString();
    
    const key = this.getCartKey(userId);
    await redis.set(key, JSON.stringify(cart), 'EX', CART_TTL);

    return this.getCart(userId);
  }

  async deleteCartItem(userId: string, itemId: string) {
    const cart = await this.getCartRaw(userId);
    const index = cart.items.findIndex((item: any) => item.id === itemId || item.productId === itemId);
    if (index === -1) {
      throw new NotFoundError('Cart item not found');
    }

    cart.items.splice(index, 1);
    cart.updatedAt = new Date().toISOString();

    const key = this.getCartKey(userId);
    await redis.set(key, JSON.stringify(cart), 'EX', CART_TTL);

    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const key = this.getCartKey(userId);
    await redis.del(key);
    return {
      userId,
      items: [],
      subtotal: 0,
      totalItems: 0,
      updatedAt: new Date().toISOString(),
    };
  }
}

export const cartService = new CartService();
export default cartService;
