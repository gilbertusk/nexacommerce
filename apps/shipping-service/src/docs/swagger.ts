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
          originCity: { type: 'string' },
          destinationCity: { type: 'string' },
          courierName: { type: 'string' },
          serviceCode: { type: 'string' },
          serviceName: { type: 'string' },
          weight: { type: 'integer' },
          cost: { type: 'number' },
          estimatedDays: { type: 'string' },
        },
      },
      ShippingOrder: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          orderId: { type: 'string' },
          sellerId: { type: 'string', nullable: true, description: 'Seller parcel owner; null only on legacy rows' },
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
    '/shipping/admin/couriers': {
      get: {
        tags: ['Shipping'], summary: 'List managed couriers (ADMIN)', security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'All couriers, including inactive entries' }, 403: { description: 'ADMIN only' } },
      },
      post: {
        tags: ['Shipping'], summary: 'Create a managed courier (ADMIN)', security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['code', 'name', 'services'], properties: { code: { type: 'string' }, name: { type: 'string' }, services: { type: 'array', minItems: 1, maxItems: 20, items: { type: 'object', required: ['code', 'name', 'estimatedDays'], properties: { code: { type: 'string' }, name: { type: 'string' }, estimatedDays: { type: 'string' } } } } } } } } },
        responses: { 201: { description: 'Courier created' }, 400: { description: 'Invalid courier contract' }, 409: { description: 'Courier code already exists' } },
      },
    },
    '/shipping/admin/rates': {
      get: {
        tags: ['Shipping'], summary: 'List authoritative rate rows (ADMIN)', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'query', name: 'page', schema: { type: 'integer', default: 1 } }, { in: 'query', name: 'limit', schema: { type: 'integer', default: 20, maximum: 100 } }, { in: 'query', name: 'courierId', schema: { type: 'string' } }, { in: 'query', name: 'originCity', schema: { type: 'string' } }, { in: 'query', name: 'destinationCity', schema: { type: 'string' } }],
        responses: { 200: { description: 'Paginated authoritative rate rows' }, 403: { description: 'ADMIN only' } },
      },
      post: {
        tags: ['Shipping'], summary: 'Create an authoritative rate row (ADMIN)', security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['courierId', 'originCity', 'destinationCity', 'serviceCode', 'weight', 'cost', 'estimatedDays'], properties: { courierId: { type: 'string' }, originCity: { type: 'string' }, destinationCity: { type: 'string' }, serviceCode: { type: 'string' }, weight: { type: 'integer', minimum: 1 }, cost: { type: 'integer', minimum: 1 }, estimatedDays: { type: 'string' } } } } } },
        responses: { 201: { description: 'Rate created' }, 400: { description: 'Invalid rate or courier service' }, 409: { description: 'Duplicate route/service/weight bracket' } },
      },
    },
    '/shipping/admin/rates/{rateId}': {
      patch: {
        tags: ['Shipping'], summary: 'Replace an authoritative rate row (ADMIN)', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'rateId', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['courierId', 'originCity', 'destinationCity', 'serviceCode', 'weight', 'cost', 'estimatedDays'], properties: { courierId: { type: 'string' }, originCity: { type: 'string' }, destinationCity: { type: 'string' }, serviceCode: { type: 'string' }, weight: { type: 'integer', minimum: 1 }, cost: { type: 'integer', minimum: 1 }, estimatedDays: { type: 'string' } } } } } },
        responses: { 200: { description: 'Rate updated' }, 404: { description: 'Rate not found' }, 409: { description: 'Duplicate bracket' } },
      },
      delete: {
        tags: ['Shipping'], summary: 'Delete an authoritative rate row (ADMIN)', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'rateId', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Rate deleted' }, 404: { description: 'Rate not found' } },
      },
    },
    '/shipping/{orderId}': {
      get: {
        tags: ['Shipping'], summary: 'Get seller shipment or customer/admin split-shipment summary', security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'orderId', required: true, schema: { type: 'string' } },
          { in: 'query', name: 'sellerId', schema: { type: 'string' }, description: 'ADMIN selector when an order has multiple shipments' },
        ],
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
                  sellerId: { type: 'string', description: 'Required for ADMIN when the order has multiple seller shipments; ignored for SELLER' },
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
