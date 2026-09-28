export interface OrderCreated {
  eventId: string;
  eventName: "OrderCreated";
  timestamp: string;
  payload: {
    orderId: string;
    customerId: string;
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
    subtotal: number;
    discount: number;
    shippingCost: number;
    grandTotal: number;
    voucherId: string | null;
    shippingAddressId: string;
  };
}

export interface PaymentCreated {
  eventId: string;
  eventName: "PaymentCreated";
  timestamp: string;
  payload: {
    paymentId: string;
    orderId: string;
    customerId: string;
    amount: number;
    provider: string;
    method: string;
    expiresAt: string;
  };
}

export interface PaymentSuccess {
  eventId: string;
  eventName: "PaymentSuccess";
  timestamp: string;
  payload: {
    paymentId: string;
    orderId: string;
    customerId: string;
    amount: number;
    paidAt: string;
  };
}

export interface PaymentFailed {
  eventId: string;
  eventName: "PaymentFailed";
  timestamp: string;
  payload: {
    paymentId: string;
    orderId: string;
    customerId: string;
    reason: string;
  };
}

export interface PaymentExpired {
  eventId: string;
  eventName: "PaymentExpired";
  timestamp: string;
  payload: {
    paymentId: string;
    orderId: string;
    customerId: string;
  };
}

export interface StockReserved {
  eventId: string;
  eventName: "StockReserved";
  timestamp: string;
  payload: {
    orderId: string;
    reservations: Array<{
      productId: string;
      quantity: number;
      reservationId: string;
    }>;
  };
}

export interface StockReservationFailed {
  eventId: string;
  eventName: "StockReservationFailed";
  timestamp: string;
  payload: {
    orderId: string;
    productId: string;
    requestedQuantity: number;
    availableQuantity: number;
    reason: string;
  };
}

export interface StockConfirmed {
  eventId: string;
  eventName: "StockConfirmed";
  timestamp: string;
  payload: {
    orderId: string;
    reservations: Array<{
      reservationId: string;
      productId: string;
      quantity: number;
    }>;
  };
}

export interface StockReleased {
  eventId: string;
  eventName: "StockReleased";
  timestamp: string;
  payload: {
    orderId: string;
    reservations: Array<{
      reservationId: string;
      productId: string;
      quantity: number;
    }>;
  };
}

export interface OrderPaid {
  eventId: string;
  eventName: "OrderPaid";
  timestamp: string;
  payload: {
    orderId: string;
    customerId: string;
    paidAt: string;
    amount: number;
  };
}

export interface OrderCancelled {
  eventId: string;
  eventName: "OrderCancelled";
  timestamp: string;
  payload: {
    orderId: string;
    customerId: string;
    reason: string;
    cancelledAt: string;
  };
}

export interface LowStockDetected {
  eventId: string;
  eventName: "LowStockDetected";
  timestamp: string;
  payload: {
    productId: string;
    currentStock: number;
    threshold: number;
    sellerId: string;
  };
}

export interface OrderShipped {
  eventId: string;
  eventName: "OrderShipped";
  timestamp: string;
  payload: {
    orderId: string;
    customerId: string;
    trackingNumber: string;
    courierName: string;
    serviceName: string;
    estimatedDelivery?: string;
    /** Present for split orders; legacy scalar fields describe the final parcel that completed handoff. */
    shipments?: Array<{
      sellerId: string;
      trackingNumber: string;
      courierName: string;
      serviceName: string;
    }>;
  };
}

export interface OrderDelivered {
  eventId: string;
  eventName: "OrderDelivered";
  timestamp: string;
  payload: {
    orderId: string;
    customerId: string;
    deliveredAt: string;
  };
}

export interface OrderCompleted {
  eventId: string;
  eventName: "OrderCompleted";
  timestamp: string;
  payload: {
    orderId: string;
    customerId: string;
    completedAt: string;
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
  };
}

export interface ReviewCreated {
  eventId: string;
  eventName: "ReviewCreated";
  timestamp: string;
  payload: {
    reviewId: string;
    productId: string;
    customerId: string;
    rating: number;
    orderId: string;
  };
}
