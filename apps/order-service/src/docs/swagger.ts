export const swaggerSpec = {
  openapi: '3.0.3',
  info: { title: 'Order Service API', version: '1.0.0', description: 'Order checkout, management, and lifecycle' },
  servers: [{ url: '/api/v1' }],
  tags: [{ name: 'Orders', description: 'Order management and checkout' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      CheckoutBody: {
        type: 'object', required: ['shippingAddressId', 'courierName', 'courierService', 'shippingCost'],
        properties: {
          shippingAddressId: { type: 'string', description: 'Address ID from User Service' },
          courierName: { type: 'string', example: 'JNE' },
          courierService: { type: 'string', example: 'REG' },
          shippingCost: { type: 'number', example: 18000 },
          voucherCode: { type: 'string', nullable: true },
          notes: { type: 'string', nullable: true },
        },
      },
      OrderItem: {
        type: 'object',
        properties: {
          id: { type: 'string' }, productId: { type: 'string' }, productName: { type: 'string' },
          quantity: { type: 'integer' }, productPrice: { type: 'number' }, subtotal: { type: 'number' }, sellerId: { type: 'string' },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string' }, orderNumber: { type: 'string', example: 'NXC-20260620-0001' },
          customerId: { type: 'string' }, status: { type: 'string', enum: ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED'] },
          subtotal: { type: 'number' }, discount: { type: 'number' }, shippingCost: { type: 'number' }, grandTotal: { type: 'number' },
          items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CheckoutResponse: {
        type: 'object',
        properties: {
          order: { $ref: '#/components/schemas/Order' },
          payment: { type: 'object', properties: { id: { type: 'string' }, midtransToken: { type: 'string' }, qrisUrl: { type: 'string' }, expiresAt: { type: 'string', format: 'date-time' } } },
        },
      },
    },
  },
  paths: {
    '/orders/checkout': {
      post: {
        tags: ['Orders'], summary: 'Checkout cart and create order (CUSTOMER)', security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CheckoutBody' } } } },
        responses: {
          201: { description: 'Order and payment created', content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/CheckoutResponse' } } } } } },
          400: { description: 'Cart empty, stock insufficient, or validation error' },
          403: { description: 'CUSTOMER only' },
        },
      },
    },
    '/orders': {
      get: {
        tags: ['Orders'], summary: 'List orders (filtered by role)', security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'status', schema: { type: 'string' } },
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
        ],
        responses: { 200: { description: 'Paginated order list', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'object', properties: { orders: { type: 'array', items: { $ref: '#/components/schemas/Order' } } } } } } } } } },
      },
    },
    '/orders/{id}': {
      get: {
        tags: ['Orders'], summary: 'Get order detail', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Order detail', content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/Order' } } } } } }, 404: { description: 'Not found' } },
      },
    },
    '/orders/{id}/cancel': {
      patch: {
        tags: ['Orders'], summary: 'Cancel an order', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: { required: false, content: { 'application/json': { schema: { type: 'object', properties: { reason: { type: 'string' } } } } } },
        responses: { 200: { description: 'Order cancelled' }, 400: { description: 'Cannot cancel from current status' } },
      },
    },
    '/orders/{id}/status': {
      patch: {
        tags: ['Orders'], summary: 'Update order status (SELLER/ADMIN)', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['status'], properties: { status: { type: 'string' }, note: { type: 'string' } } } } } },
        responses: { 200: { description: 'Status updated' }, 403: { description: 'SELLER or ADMIN only' } },
      },
    },
    '/orders/{id}/complete': {
      patch: {
        tags: ['Orders'], summary: 'Manually complete a delivered order (CUSTOMER)', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Order completed — triggers OrderCompleted event' }, 400: { description: 'Order must be in DELIVERED status' }, 403: { description: 'CUSTOMER only and must own the order' } },
      },
    },
  },
};
