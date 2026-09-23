export const swaggerSpec = {
  openapi: '3.0.3',
  info: { title: 'Notification Service API', version: '1.0.0', description: 'In-app and email notifications' },
  servers: [{ url: '/api/v1' }],
  tags: [{ name: 'Notifications', description: 'User notifications and email logs' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      Notification: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          type: { type: 'string', enum: ['ORDER_CREATED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'ORDER_SHIPPED', 'ORDER_DELIVERED', 'ORDER_COMPLETED', 'LOW_STOCK', 'REVIEW_RECEIVED'] },
          title: { type: 'string' },
          message: { type: 'string' },
          isRead: { type: 'boolean' },
          data: { type: 'object' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/notifications': {
      get: {
        tags: ['Notifications'], summary: 'List notifications for current user', security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'isRead', schema: { type: 'boolean' } },
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
        ],
        responses: { 200: { description: 'Notification list', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Notification' } } } } } } }, 401: { description: 'Unauthorized' } },
      },
    },
    '/notifications/unread-count': {
      get: {
        tags: ['Notifications'], summary: 'Get unread notification count', security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Count', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'object', properties: { count: { type: 'integer' } } } } } } } } },
      },
    },
    '/notifications/{id}': {
      get: {
        tags: ['Notifications'], summary: 'Get notification detail', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Notification detail' }, 404: { description: 'Not found' } },
      },
    },
    '/notifications/{id}/read': {
      patch: {
        tags: ['Notifications'], summary: 'Mark notification as read', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Marked as read' } },
      },
    },
    '/notifications/read-all': {
      post: {
        tags: ['Notifications'], summary: 'Mark all notifications as read', security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'All marked as read' } },
      },
    },
    '/notifications/admin/email-logs': {
      get: {
        tags: ['Notifications'], summary: 'List email logs (ADMIN)', security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'status', schema: { type: 'string', enum: ['SENT', 'FAILED', 'PENDING'] } },
          { in: 'query', name: 'page', schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Email log list' }, 403: { description: 'ADMIN only' } },
      },
    },
  },
};
