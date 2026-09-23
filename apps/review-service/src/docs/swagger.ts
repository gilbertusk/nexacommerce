export const swaggerSpec = {
  openapi: '3.0.3',
  info: { title: 'Review Service API', version: '1.0.0', description: 'Product reviews, ratings, and moderation' },
  servers: [{ url: '/api/v1' }],
  tags: [{ name: 'Reviews', description: 'Product review management' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      Review: {
        type: 'object',
        properties: {
          id: { type: 'string' }, productId: { type: 'string' }, customerId: { type: 'string' },
          orderId: { type: 'string' }, orderItemId: { type: 'string' },
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          title: { type: 'string' }, content: { type: 'string' },
          moderationStatus: { type: 'string', enum: ['PENDING', 'APPROVED', 'HIDDEN', 'REJECTED'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateReviewBody: {
        type: 'object', required: ['productId', 'orderId', 'orderItemId', 'rating', 'content'],
        properties: {
          productId: { type: 'string' }, orderId: { type: 'string' }, orderItemId: { type: 'string' },
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          title: { type: 'string', maxLength: 100 },
          content: { type: 'string', maxLength: 2000 },
        },
      },
      RatingSummary: {
        type: 'object',
        properties: {
          productId: { type: 'string' },
          averageRating: { type: 'number' },
          totalReviews: { type: 'integer' },
          distribution: { type: 'object', properties: { 1: { type: 'integer' }, 2: { type: 'integer' }, 3: { type: 'integer' }, 4: { type: 'integer' }, 5: { type: 'integer' } } },
        },
      },
    },
  },
  paths: {
    '/reviews/products/{productId}': {
      get: {
        tags: ['Reviews'], summary: 'Get reviews for a product (public)',
        parameters: [
          { in: 'path', name: 'productId', required: true, schema: { type: 'string' } },
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
          { in: 'query', name: 'sortBy', schema: { type: 'string', enum: ['newest', 'highest', 'lowest'] } },
          { in: 'query', name: 'rating', schema: { type: 'integer', minimum: 1, maximum: 5 } },
        ],
        responses: { 200: { description: 'Review list with summary' } },
      },
    },
    '/reviews/summary/{productId}': {
      get: {
        tags: ['Reviews'], summary: 'Get rating summary for a product (public)',
        parameters: [{ in: 'path', name: 'productId', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Rating summary', content: { 'application/json': { schema: { type: 'object', properties: { data: { $ref: '#/components/schemas/RatingSummary' } } } } } } },
      },
    },
    '/reviews': {
      post: {
        tags: ['Reviews'], summary: 'Create a review (CUSTOMER — must have completed order)', security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateReviewBody' } } } },
        responses: {
          201: { description: 'Review created' },
          400: { description: 'Validation error' },
          403: { description: 'Order not completed or ineligible' },
          409: { description: 'Review already exists for this order item' },
        },
      },
    },
    '/reviews/{id}': {
      patch: {
        tags: ['Reviews'], summary: 'Update own review (CUSTOMER)', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { rating: { type: 'integer' }, title: { type: 'string' }, content: { type: 'string' } } } } } },
        responses: { 200: { description: 'Review updated' }, 403: { description: 'Not owner' }, 404: { description: 'Review not found' } },
      },
      delete: {
        tags: ['Reviews'], summary: 'Delete own review (CUSTOMER or ADMIN)', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Review deleted' }, 403: { description: 'Forbidden' } },
      },
    },
    '/reviews/{id}/report': {
      post: {
        tags: ['Reviews'], summary: 'Report a review', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['reason'], properties: { reason: { type: 'string', enum: ['SPAM', 'INAPPROPRIATE', 'FAKE', 'OTHER'] }, description: { type: 'string' } } } } } },
        responses: { 201: { description: 'Report submitted' } },
      },
    },
    '/reviews/{id}/moderate': {
      patch: {
        tags: ['Reviews'], summary: 'Moderate a review (ADMIN)', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['moderationStatus'], properties: { moderationStatus: { type: 'string', enum: ['APPROVED', 'HIDDEN', 'REJECTED'] }, moderationNote: { type: 'string' } } } } } },
        responses: { 200: { description: 'Review moderation applied' }, 403: { description: 'ADMIN only' } },
      },
    },
    '/reviews/reports': {
      get: {
        tags: ['Reviews'], summary: 'List review reports (ADMIN)', security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'status', schema: { type: 'string', enum: ['PENDING', 'REVIEWED', 'DISMISSED'] } },
          { in: 'query', name: 'page', schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Report list' }, 403: { description: 'ADMIN only' } },
      },
    },
    '/reviews/reports/{id}': {
      patch: {
        tags: ['Reviews'], summary: 'Update report status (ADMIN)', security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', enum: ['REVIEWED', 'DISMISSED'] } } } } } },
        responses: { 200: { description: 'Report updated' }, 403: { description: 'ADMIN only' } },
      },
    },
  },
};
