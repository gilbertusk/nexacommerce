export const EXCHANGE_NAME = 'nexacommerce.events';
export const EXCHANGE_TYPE = 'topic';

export const ROUTING_KEYS = {
  ORDER_CREATED: 'order.created',
  ORDER_PAID: 'order.paid',
  ORDER_CANCELLED: 'order.cancelled',
  PAYMENT_CREATED: 'payment.created',
  PAYMENT_SUCCESS: 'payment.success',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_EXPIRED: 'payment.expired',
  STOCK_RESERVED: 'stock.reserved',
  STOCK_RESERVATION_FAILED: 'stock.reservation_failed',
  STOCK_CONFIRMED: 'stock.confirmed',
  STOCK_RELEASED: 'stock.released',
  STOCK_LOW_DETECTED: 'stock.low_detected',
  ORDER_SHIPPED: 'order.shipped',
  ORDER_DELIVERED: 'order.delivered',
  ORDER_COMPLETED: 'order.completed',
  REVIEW_CREATED: 'review.created',
} as const;
