export const swaggerSpec = {
  openapi: '3.0.3',
  info: { title: 'Voucher Service API', version: '1.0.0', description: 'Voucher/coupon management and validation' },
  servers: [{ url: '/api/v1' }],
  tags: [{ name: 'Vouchers', description: 'Voucher and discount code management' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      Voucher: {
        type: 'object',
        properties: {
          id: { type: 'string' }, code: { type: 'string', example: 'SAVE10' },
          name: { type: 'string' }, type: { type: 'string', enum: ['PERCENTAGE', 'FIXED_AMOUNT'] },
          value: { type: 'number', description: 'Percentage (1-100) or fixed Rupiah amount' },
          maxDiscount: { type: 'number', nullable: true, description: 'Max discount cap for PERCENTAGE type' },
          minPurchase: { type: 'number', default: 0 },
          usageLimit: { type: 'integer', nullable: true }, usageCount: { type: 'integer' },
          startDate: { type: 'string', format: 'date-time' }, endDate: { type: 'string', format: 'date-time' },
          isActive: { type: 'boolean' }, scope: { type: 'string', enum: ['ALL', 'CATEGORY', 'PRODUCT'] },
        },
      },
      ValidateVoucherBody: {
        type: 'object', required: ['code', 'subtotal'],
        properties: {
          code: { type: 'string' }, subtotal: { type: 'number' },
          items: { type: 'array', items: { type: 'object', properties: { productId: { type: 'string' }, categoryId: { type: 'string' }, quantity: { type: 'integer' }, price: { type: 'number' } } } },
        },
      },
    },
  },
  paths: {
    '/vouchers': {
      get: {
        tags: ['Vouchers'], summary: 'List vouchers', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'query', name: 'isActive', schema: { type: 'boolean' } }, { in: 'query', name: 'page', schema: { type: 'integer' } }],
        responses: { 200: { description: 'Paginated voucher list' } },
      },
      post: {
        tags: ['Vouchers'], summary: 'Create a voucher (ADMIN)', security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Voucher' } } } },
        responses: { 201: { description: 'Voucher created' }, 403: { description: 'ADMIN only' }, 409: { description: 'Code already exists' } },
      },
    },
    '/vouchers/{id}': {
      get: {
        tags: ['Vouchers'], summary: 'Get voucher by ID', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Voucher detail' }, 404: { description: 'Not found' } },
      },
      patch: {
        tags: ['Vouchers'], summary: 'Update voucher (ADMIN)', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Voucher' } } } },
        responses: { 200: { description: 'Voucher updated' }, 403: { description: 'ADMIN only' } },
      },
      delete: {
        tags: ['Vouchers'], summary: 'Deactivate voucher (ADMIN soft delete)', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Voucher deactivated' }, 403: { description: 'ADMIN only' } },
      },
    },
    '/vouchers/validate': {
      post: {
        tags: ['Vouchers'], summary: 'Validate a voucher code (returns discount amount)', security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidateVoucherBody' } } } },
        responses: {
          200: {
            description: 'Validation result',
            content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'object', properties: { valid: { type: 'boolean' }, discountAmount: { type: 'number' }, reason: { type: 'string' } } } } } } },
          },
        },
      },
    },
  },
};
