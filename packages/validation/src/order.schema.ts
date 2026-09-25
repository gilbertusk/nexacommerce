import { z } from 'zod';

/**
 * Checkout input.
 *
 * `shippingQuoteId` replaces the former `courierName`/`courierService`/
 * `shippingCost` fields. The browser no longer states what shipping costs; it
 * presents a quote the server issued, and the server resolves the price from
 * its own record. `.strict()` makes a client that still sends `shippingCost`
 * fail loudly rather than have it silently ignored.
 */
export const checkoutSchema = z
  .object({
    shippingAddressId: z.string().uuid('Invalid shipping address ID'),
    shippingQuoteId: z.string().uuid('Invalid shipping quote ID'),
    voucherCode: z.string().optional().nullable(),
    notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional().nullable(),
  })
  .strict();

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
