export const swaggerSpec = {
  openapi: '3.0.3',
  info: { title: 'User Service API', version: '1.0.0', description: 'User profiles, addresses, and seller profiles' },
  servers: [{ url: '/api/v1' }],
  tags: [{ name: 'Users', description: 'User profile and address management' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      UserProfile: {
        type: 'object',
        properties: {
          id: { type: 'string' }, username: { type: 'string' }, email: { type: 'string' },
          phone: { type: 'string' }, avatarUrl: { type: 'string' }, role: { type: 'string' }, status: { type: 'string' },
        },
      },
      Address: {
        type: 'object',
        properties: {
          id: { type: 'string' }, label: { type: 'string', example: 'Rumah' },
          recipientName: { type: 'string' }, phone: { type: 'string' },
          street: { type: 'string' }, city: { type: 'string' }, province: { type: 'string' },
          postalCode: { type: 'string' }, isDefault: { type: 'boolean' },
        },
      },
      SellerProfile: {
        type: 'object',
        properties: {
          id: { type: 'string' }, userId: { type: 'string' }, storeName: { type: 'string' },
          storeDescription: { type: 'string' }, storeCity: { type: 'string' }, storeProvince: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/users/me': {
      get: {
        tags: ['Users'], summary: 'Get current user profile', security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'User profile', content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/UserProfile' } } } } } }, 401: { description: 'Unauthorized' } },
      },
      patch: {
        tags: ['Users'], summary: 'Update current user profile', security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { username: { type: 'string' }, phone: { type: 'string' }, avatarUrl: { type: 'string' } } } } } },
        responses: { 200: { description: 'Profile updated' }, 401: { description: 'Unauthorized' } },
      },
    },
    '/users': {
      get: {
        tags: ['Users'], summary: 'List all users (ADMIN)', security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'role', schema: { type: 'string', enum: ['CUSTOMER', 'SELLER', 'ADMIN'] } },
          { in: 'query', name: 'status', schema: { type: 'string', enum: ['ACTIVE', 'SUSPENDED', 'BANNED'] } },
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
        ],
        responses: { 200: { description: 'Paginated user list' }, 403: { description: 'ADMIN only' } },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'], summary: 'Get user by ID (ADMIN)', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'User details' }, 403: { description: 'ADMIN only' }, 404: { description: 'Not found' } },
      },
    },
    '/users/{id}/status': {
      patch: {
        tags: ['Users'], summary: 'Update user status (ADMIN)', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['status'], properties: { status: { type: 'string', enum: ['ACTIVE', 'SUSPENDED', 'BANNED'] } } } } } },
        responses: { 200: { description: 'Status updated' }, 403: { description: 'ADMIN only' } },
      },
    },
    '/users/me/addresses': {
      get: {
        tags: ['Users'], summary: 'List user addresses', security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Address list', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Address' } } } } } } } },
      },
      post: {
        tags: ['Users'], summary: 'Add a new address', security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Address' } } } },
        responses: { 201: { description: 'Address created' }, 400: { description: 'Validation error' } },
      },
    },
    '/users/me/addresses/{id}': {
      patch: {
        tags: ['Users'], summary: 'Update an address', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Address' } } } },
        responses: { 200: { description: 'Address updated' }, 404: { description: 'Not found' } },
      },
      delete: {
        tags: ['Users'], summary: 'Delete an address', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Address deleted' } },
      },
    },
    '/users/seller-profile': {
      post: {
        tags: ['Users'], summary: 'Create seller profile (SELLER)', security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['storeName'], properties: { storeName: { type: 'string' }, storeDescription: { type: 'string' }, storeCity: { type: 'string' }, storeProvince: { type: 'string' } } } } } },
        responses: { 201: { description: 'Seller profile created' }, 409: { description: 'Already exists' } },
      },
    },
    '/users/seller-profile/me': {
      get: {
        tags: ['Users'], summary: 'Get own seller profile (SELLER)', security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Seller profile', content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/SellerProfile' } } } } } } },
      },
      patch: {
        tags: ['Users'], summary: 'Update own seller profile (SELLER)', security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SellerProfile' } } } },
        responses: { 200: { description: 'Profile updated' } },
      },
    },
  },
};
