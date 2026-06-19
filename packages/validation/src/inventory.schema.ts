import { z } from 'zod';

export const stockInSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be positive'),
  note: z.string().optional(),
});

export const stockOutSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be positive'),
  note: z.string().optional(),
});

export const reserveStockSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be positive'),
  orderId: z.string().min(1, 'Order ID is required'),
  expiresAt: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
  }, z.date()),
});

export const initializeInventorySchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  initialStock: z.number().int().nonnegative('Initial stock cannot be negative').optional(),
  lowStockThreshold: z.number().int().nonnegative('Threshold cannot be negative').optional(),
  sku: z.string().optional(),
});
