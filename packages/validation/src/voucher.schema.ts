import { z } from 'zod';

export const createVoucherSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').max(50).toUpperCase(),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  value: z.number().positive('Value must be positive'),
  minPurchase: z.number().nonnegative('Minimum purchase cannot be negative').optional().default(0),
  maxDiscount: z.number().positive('Max discount must be positive').optional().nullable(),
  usageLimit: z.number().int().positive('Usage limit must be positive').optional().nullable(),
  usageLimitPerUser: z.number().int().positive('Usage limit per user must be positive').default(1),
  scope: z.enum(['ALL', 'CATEGORY', 'SELLER']).default('ALL'),
  scopeReferenceId: z.string().optional().nullable(),
  startsAt: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
  }, z.date()),
  endsAt: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
  }, z.date()),
}).refine((data) => {
  if (data.type === 'PERCENTAGE' && data.value > 100) {
    return false;
  }
  return true;
}, {
  message: 'Percentage value cannot exceed 100%',
  path: ['value']
}).refine((data) => {
  return data.startsAt < data.endsAt;
}, {
  message: 'StartsAt must be before EndsAt',
  path: ['endsAt']
});

export const validateVoucherSchema = z.object({
  code: z.string().min(1, 'Voucher code is required').toUpperCase(),
  subtotal: z.number().nonnegative('Subtotal cannot be negative'),
  items: z.array(
    z.object({
      productId: z.string().uuid('Invalid product ID'),
      categoryId: z.string().uuid('Invalid category ID'),
      sellerId: z.string().min(1, 'Seller ID is required'),
      price: z.number().nonnegative('Price cannot be negative'),
      quantity: z.number().int().positive('Quantity must be positive'),
    })
  ),
});
