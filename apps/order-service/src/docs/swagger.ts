export const swaggerSpec = {
  openapi: '3.0.3',
  info: { title: 'Order Service API', version: '1.0.0', description: 'Order checkout, management, and lifecycle' },
  servers: [{ url: '/api/v1' }],
  tags: [{ name: 'Orders', description: 'Order management and checkout' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      CheckoutBody: {
        type: 'object', required: ['shippingAddressId', 'shippingQuoteId'], additionalProperties: false,
        properties: {
          shippingAddressId: { type: 'string', format: 'uuid', description: 'Address ID from User Service' },
          shippingQuoteId: {
            type: 'string', format: 'uuid',
            description: 'Opaque quote id from POST /shipping/quotes. The shipping price is read from the stored quote; no client-supplied cost is accepted.',
          },
          voucherCode: { type: 'string', nullable: true },
          notes: { type: 'string', nullable: true, maxLength: 1000 },
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
          201: { description: 'Order created', content: { 'application/json': { schema: { $ref: '#/components/schemas/CheckoutResponse' } } } },
          400: { description: 'Invalid body, expired or already-used shipping quote, or a cart that changed after the quote was issued' },
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
    '/orders/{id}/complaints': {
      post: {
        tags: ['Orders'], summary: 'Open one complaint for a delivered order (CUSTOMER)', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['category', 'description'], properties: { category: { type: 'string', enum: ['DAMAGED', 'MISSING_ITEM', 'WRONG_ITEM', 'QUALITY', 'OTHER'] }, description: { type: 'string', minLength: 5, maxLength: 2000 } } } } } },
        responses: { 201: { description: 'Complaint opened' }, 400: { description: 'Order is not delivered or request is invalid' }, 403: { description: 'Order belongs to another customer' } },
      },
      get: {
        tags: ['Orders'], summary: 'Get this order complaint (CUSTOMER)', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Complaint detail or null' }, 403: { description: 'Order belongs to another customer' } },
      },
    },
    '/orders/admin/complaints': {
      get: {
        tags: ['Orders'], summary: 'List and filter order complaints (ADMIN)', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'query', name: 'status', schema: { type: 'string', enum: ['OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED'] } }, { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } }, { in: 'query', name: 'limit', schema: { type: 'integer', default: 20, maximum: 100 } }],
        responses: { 200: { description: 'Paginated complaint queue' }, 403: { description: 'ADMIN only' } },
      },
    },
    '/orders/admin/complaints/{complaintId}': {
      patch: {
        tags: ['Orders'], summary: 'Moderate an order complaint (ADMIN)', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'complaintId', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['status'], properties: { status: { type: 'string', enum: ['IN_REVIEW', 'RESOLVED', 'REJECTED'] }, adminNote: { type: 'string', maxLength: 1000 } } } } } },
        responses: { 200: { description: 'Complaint updated' }, 400: { description: 'Invalid state transition' }, 403: { description: 'ADMIN only' }, 404: { description: 'Complaint not found' } },
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
