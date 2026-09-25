export const QUEUES = {
  ORDER_PAYMENT_EVENTS: 'order-service.payment-events',
  ORDER_STOCK_EVENTS: 'order-service.stock-events',
  INVENTORY_PAYMENT_EVENTS: 'inventory-service.payment-events',
  INVENTORY_ORDER_EVENTS: 'inventory-service.order-events',
  ANALYTICS_EVENTS: 'analytics-service.events',
  NOTIFICATION_EVENTS: 'notification-service.events',
  SHIPPING_ORDER_EVENTS: 'shipping-service.order-events',
  ORDER_SHIPPING_EVENTS: 'order-service.shipping-events',
  PRODUCT_REVIEW_EVENTS: 'product-service.review-events',
  EVENT_STREAM_BUSINESS_FACTS: 'event-stream-service.business-facts',
} as const;

export const QUEUE_BINDINGS = [
  {
    queue: QUEUES.ORDER_PAYMENT_EVENTS,
    routingKeys: ['payment.success', 'payment.failed', 'payment.expired']
  },
  {
    queue: QUEUES.ORDER_STOCK_EVENTS,
    routingKeys: ['stock.reserved', 'stock.reservation_failed']
  },
  {
    queue: QUEUES.INVENTORY_PAYMENT_EVENTS,
    routingKeys: ['payment.success', 'payment.expired']
  },
  {
    queue: QUEUES.INVENTORY_ORDER_EVENTS,
    routingKeys: ['order.cancelled']
  },
  {
    queue: QUEUES.ANALYTICS_EVENTS,
    routingKeys: ['order.created', 'order.paid', 'order.cancelled', 'payment.success', 'payment.failed', 'payment.expired', 'review.created', 'order.completed']
  },
  {
    queue: QUEUES.NOTIFICATION_EVENTS,
    routingKeys: [
      'order.created',
      'payment.success',
      'payment.failed',
      'stock.low_detected',
      'order.shipped',
      'order.delivered',
      'review.created',
      'order.completed'
    ]
  },
  {
    queue: QUEUES.SHIPPING_ORDER_EVENTS,
    routingKeys: ['order.paid']
  },
  {
    queue: QUEUES.ORDER_SHIPPING_EVENTS,
    routingKeys: ['order.delivered']
  },
  {
    queue: QUEUES.PRODUCT_REVIEW_EVENTS,
    routingKeys: ['review.created']
  },
  {
    queue: QUEUES.EVENT_STREAM_BUSINESS_FACTS,
    routingKeys: [
      'order.created',
      'order.paid',
      'order.cancelled',
      'order.completed',
      'payment.created',
      'payment.success',
      'payment.failed',
      'payment.expired',
      'stock.reserved',
      'stock.reservation_failed',
      'stock.confirmed',
      'stock.released',
      'stock.low_detected',
      'order.shipped',
      'order.delivered',
      'review.created'
    ]
  }
];
