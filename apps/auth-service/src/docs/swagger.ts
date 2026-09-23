export const swaggerSpec = {
  openapi: '3.0.3',
  info: { title: 'Auth Service API', version: '1.0.0', description: 'Authentication and authorization endpoints' },
  servers: [{ url: '/api/v1' }],
  tags: [{ name: 'Auth', description: 'Authentication and user session management' }],
  components: {
    securitySchemes: {
      cookieAuth: { type: 'apiKey', in: 'cookie', name: 'nexa_access_token' },
    },
    schemas: {
      RegisterBody: {
        type: 'object', required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password: { type: 'string', minLength: 8, example: 'Password123!' },
        },
      },
      LoginBody: {
        type: 'object', required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
      UserResponse: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string' },
          emailVerified: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/UserResponse' },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: { type: 'object' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          errors: { type: 'array', items: { type: 'object', properties: { field: { type: 'string' }, message: { type: 'string' } } } },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'], summary: 'Register a new user',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterBody' } } } },
        responses: {
          201: { description: 'User registered successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          409: { description: 'Email already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'], summary: 'Login with email and password',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginBody' } } } },
        responses: {
          200: { description: 'Login successful; HttpOnly session cookies are set', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { properties: { data: { $ref: '#/components/schemas/LoginResponse' } } }] } } } },
          401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'], summary: 'Logout, revoke refresh token, and clear session cookies', security: [{ cookieAuth: [] }],
        responses: { 200: { description: 'Logged out successfully' }, 401: { description: 'Unauthorized' } },
      },
    },
    '/auth/refresh-token': {
      post: {
        tags: ['Auth'], summary: 'Refresh access token',
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'Session cookies rotated successfully' },
          401: { description: 'Invalid or expired refresh token' },
        },
      },
    },
    '/auth/forgot-password': {
      post: {
        tags: ['Auth'], summary: 'Request password reset email',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email'], properties: { email: { type: 'string', format: 'email' } } } } } },
        responses: { 200: { description: 'Password reset email sent (if account exists)' } },
      },
    },
    '/auth/reset-password': {
      post: {
        tags: ['Auth'], summary: 'Reset password with token',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['token', 'newPassword'], properties: { token: { type: 'string' }, newPassword: { type: 'string', minLength: 8 } } } } } },
        responses: { 200: { description: 'Password reset successful' }, 400: { description: 'Invalid or expired token' } },
      },
    },
    '/auth/verify-email': {
      post: {
        tags: ['Auth'], summary: 'Verify email address with token',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['token'], properties: { token: { type: 'string' } } } } } },
        responses: { 200: { description: 'Email verified successfully' }, 400: { description: 'Invalid token' } },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'], summary: 'Get current authenticated user', security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'Current user data', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { properties: { data: { $ref: '#/components/schemas/UserResponse' } } }] } } } },
          401: { description: 'Unauthorized' },
        },
      },
    },
  },
};
