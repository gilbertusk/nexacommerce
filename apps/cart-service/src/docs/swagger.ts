export const swaggerSpec = {
  openapi: '3.0.3',
  info: { title: 'Cart Service API', version: '1.0.0', description: 'Shopping cart management (Redis-backed)' },
  servers: [{ url: '/api/v1' }],
  tags: [{ name: 'Cart', description: 'Shopping cart operations' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      CartItem: {
        type: 'object',
        properties: {
          id: { type: 'string' }, productId: { type: 'string' }, productName: { type: 'string' },
          quantity: { type: 'integer', minimum: 1 }, price: { type: 'number' },
          stock: { type: 'integer' }, isAvailable: { type: 'boolean' },
        },
      },
      Cart: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
          items: { type: 'array', items: { $ref: '#/components/schemas/CartItem' } },
          subtotal: { type: 'number' },
          itemCount: { type: 'integer' },
        },
      },
    },
  },
  paths: {
    '/cart': {
      get: {
        tags: ['Cart'], summary: 'Get current cart with item validation', security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Cart contents', content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/Cart' } } } } } }, 401: { description: 'Unauthorized' } },
      },
    },
    '/cart/items': {
      post: {
        tags: ['Cart'], summary: 'Add item to cart (or increase quantity if exists)', security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['productId', 'quantity'], properties: { productId: { type: 'string' }, quantity: { type: 'integer', minimum: 1, default: 1 } } } } } },
        responses: { 200: { description: 'Item added/updated in cart', content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/Cart' } } } } } }, 400: { description: 'Insufficient stock or product unavailable' } },
      },
    },
    '/cart/items/{itemId}': {
      patch: {
        tags: ['Cart'], summary: 'Update item quantity', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'itemId', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['quantity'], properties: { quantity: { type: 'integer', minimum: 1 } } } } } },
        responses: { 200: { description: 'Quantity updated' }, 404: { description: 'Item not in cart' } },
      },
      delete: {
        tags: ['Cart'], summary: 'Remove item from cart', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'itemId', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Item removed' } },
      },
    },
    '/cart/clear': {
      delete: {
        tags: ['Cart'], summary: 'Clear entire cart', security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Cart cleared' } },
      },
    },
  },
};
