import { z } from 'zod';

export const checkoutSchema = z.object({
  shippingAddressId: z.string().uuid('Invalid shipping address ID'),
  courierName: z.string().optional().nullable(),
  courierService: z.string().optional().nullable(),
  shippingCost: z.number().nonnegative('Shipping cost cannot be negative').optional().nullable(),
  voucherCode: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PENDING_PAYMENT',
    'PAID',
    'PROCESSING',
    'PACKED',
    'SHIPPED',
    'DELIVERED',
    'COMPLETED',
    'CANCELLED',
    'REFUNDED',
  ]),
  note: z.string().optional().nullable(),
  trackingNumber: z.string().optional().nullable(),
});
