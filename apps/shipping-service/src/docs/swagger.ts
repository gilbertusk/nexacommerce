export const swaggerSpec = {
  openapi: '3.0.3',
  info: { title: 'Shipping Service API', version: '1.0.0', description: 'Courier management, shipping rates, order tracking' },
  servers: [{ url: '/api/v1' }],
  tags: [{ name: 'Shipping', description: 'Shipping and delivery management' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      Courier: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'JNE' },
          code: { type: 'string', example: 'jne' },
          services: { type: 'array', items: { type: 'object', properties: { code: { type: 'string' }, name: { type: 'string' }, estimatedDays: { type: 'string' } } } },
          isActive: { type: 'boolean' },
        },
      },
      ShippingRate: {
        type: 'object',
        properties: {
          courierId: { type: 'string' },
          courierName: { type: 'string' },
          serviceCode: { type: 'string' },
          serviceName: { type: 'string' },
          cost: { type: 'number' },
          estimatedDays: { type: 'string' },
        },
      },
      ShippingOrder: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          orderId: { type: 'string' },
          trackingNumber: { type: 'string' },
          status: { type: 'string', enum: ['WAITING_PICKUP', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'RETURNED'] },
          courier: { $ref: '#/components/schemas/Courier' },
          history: { type: 'array', items: { type: 'object' } },
        },
      },
    },
  },
  paths: {
    '/shipping/couriers': {
      get: {
        tags: ['Shipping'], summary: 'List all active couriers',
        responses: { 200: { description: 'Courier list', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Courier' } } } } } } } },
      },
    },
    '/shipping/rates': {
      get: {
        tags: ['Shipping'], summary: 'Get shipping rate options',
        parameters: [
          { in: 'query', name: 'originCity', required: true, schema: { type: 'string' }, example: 'Jakarta' },
          { in: 'query', name: 'destinationCity', required: true, schema: { type: 'string' }, example: 'Semarang' },
          { in: 'query', name: 'weight', required: true, schema: { type: 'integer' }, description: 'Weight in grams' },
        ],
        responses: { 200: { description: 'Available shipping rates', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/ShippingRate' } } } } } } } },
      },
    },
    '/shipping/{orderId}': {
      get: {
        tags: ['Shipping'], summary: 'Get shipping tracking for an order', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'orderId', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Shipping order with tracking history', content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/ShippingOrder' } } } } } },
          404: { description: 'Shipping order not found' },
        },
      },
    },
    '/shipping/{orderId}/status': {
      patch: {
        tags: ['Shipping'], summary: 'Update shipping status (SELLER/ADMIN)', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'orderId', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object', required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['WAITING_PICKUP', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'RETURNED'] },
                  location: { type: 'string' },
                  note: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Status updated successfully' },
          400: { description: 'Invalid status transition' },
          403: { description: 'Forbidden — SELLER or ADMIN only' },
        },
      },
    },
  },
};
