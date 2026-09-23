export const swaggerSpec = {
  openapi: '3.0.3',
  info: { title: 'Inventory Service API', version: '1.0.0', description: 'Stock management, reservations, and movements' },
  servers: [{ url: '/api/v1' }],
  tags: [{ name: 'Inventory', description: 'Inventory and stock management' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      InventoryRecord: {
        type: 'object',
        properties: {
          id: { type: 'string' }, productId: { type: 'string' },
          currentStock: { type: 'integer' }, reservedStock: { type: 'integer' }, availableStock: { type: 'integer' },
          lowStockThreshold: { type: 'integer' }, isLowStock: { type: 'boolean' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      StockMovement: {
        type: 'object',
        properties: {
          id: { type: 'string' }, productId: { type: 'string' },
          type: { type: 'string', enum: ['IN', 'OUT', 'RESERVE', 'CONFIRM', 'RELEASE'] },
          quantity: { type: 'integer' }, note: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/inventory': {
      get: {
        tags: ['Inventory'], summary: 'List all inventory records (ADMIN)', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'query', name: 'page', schema: { type: 'integer' } }, { in: 'query', name: 'limit', schema: { type: 'integer' } }],
        responses: { 200: { description: 'Inventory list', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/InventoryRecord' } } } } } } }, 403: { description: 'ADMIN only' } },
      },
    },
    '/inventory/initialize': {
      post: {
        tags: ['Inventory'], summary: 'Initialize stock for a product', security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['productId', 'initialStock'], properties: { productId: { type: 'string' }, initialStock: { type: 'integer', minimum: 0 }, lowStockThreshold: { type: 'integer', default: 10 } } } } } },
        responses: { 201: { description: 'Inventory initialized' }, 409: { description: 'Already exists' } },
      },
    },
    '/inventory/low-stock': {
      get: {
        tags: ['Inventory'], summary: 'Get products with low stock (ADMIN)', security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Low stock items list' }, 403: { description: 'ADMIN only' } },
      },
    },
    '/inventory/{productId}': {
      get: {
        tags: ['Inventory'], summary: 'Get stock for a specific product',
        parameters: [{ in: 'path', name: 'productId', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Product stock details', content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/InventoryRecord' } } } } } }, 404: { description: 'Not found' } },
      },
    },
    '/inventory/{productId}/movements': {
      get: {
        tags: ['Inventory'], summary: 'Get stock movement history', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'productId', required: true, schema: { type: 'string' } }, { in: 'query', name: 'page', schema: { type: 'integer' } }],
        responses: { 200: { description: 'Movement history', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/StockMovement' } } } } } } } },
      },
    },
    '/inventory/stock-in': {
      post: {
        tags: ['Inventory'], summary: 'Add stock (restock)', security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['productId', 'quantity'], properties: { productId: { type: 'string' }, quantity: { type: 'integer', minimum: 1 }, note: { type: 'string' } } } } } },
        responses: { 200: { description: 'Stock added' } },
      },
    },
    '/inventory/stock-out': {
      post: {
        tags: ['Inventory'], summary: 'Remove stock (shrinkage/damage)', security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['productId', 'quantity'], properties: { productId: { type: 'string' }, quantity: { type: 'integer', minimum: 1 }, note: { type: 'string' } } } } } },
        responses: { 200: { description: 'Stock reduced' }, 400: { description: 'Insufficient stock' } },
      },
    },
    '/inventory/reserve': {
      post: {
        tags: ['Inventory'], summary: 'Reserve stock for an order', security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['orderId', 'items'], properties: { orderId: { type: 'string' }, items: { type: 'array', items: { type: 'object', properties: { productId: { type: 'string' }, quantity: { type: 'integer' } } } } } } } } },
        responses: { 200: { description: 'Stock reserved' }, 400: { description: 'Insufficient available stock' } },
      },
    },
    '/inventory/confirm': {
      post: {
        tags: ['Inventory'], summary: 'Confirm reserved stock (deduct permanently)', security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['orderId'], properties: { orderId: { type: 'string' } } } } } },
        responses: { 200: { description: 'Stock confirmed' } },
      },
    },
    '/inventory/release': {
      post: {
        tags: ['Inventory'], summary: 'Release reserved stock (return to available)', security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['orderId'], properties: { orderId: { type: 'string' } } } } } },
        responses: { 200: { description: 'Stock released' } },
      },
    },
  },
};
