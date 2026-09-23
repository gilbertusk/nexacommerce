export const swaggerSpec = {
  openapi: '3.0.3',
  info: { title: 'Payment Service API', version: '1.0.0', description: 'Payment processing via Midtrans QRIS sandbox' },
  servers: [{ url: '/api/v1' }],
  tags: [{ name: 'Payments', description: 'Payment operations and webhooks' }],
  components: {
    securitySchemes: { cookieAuth: { type: 'apiKey', in: 'cookie', name: 'nexa_access_token' } },
    schemas: {
      Payment: {
        type: 'object',
        properties: {
          id: { type: 'string' }, orderId: { type: 'string' }, customerId: { type: 'string' },
          amount: { type: 'number' }, status: { type: 'string', enum: ['PENDING', 'PAID', 'FAILED', 'EXPIRED', 'REFUNDED'] },
          midtransToken: { type: 'string' }, qrisUrl: { type: 'string' },
          paidAt: { type: 'string', format: 'date-time', nullable: true },
          expiresAt: { type: 'string', format: 'date-time' },
        },
      },
      MidtransWebhookBody: {
        type: 'object',
        properties: {
          order_id: { type: 'string' }, status_code: { type: 'string' },
          gross_amount: { type: 'string' }, transaction_status: { type: 'string' },
          payment_type: { type: 'string' }, signature_key: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/payments/order/{orderId}': {
      get: {
        tags: ['Payments'], summary: 'Get payment by order ID', security: [{ cookieAuth: [] }],
        parameters: [{ in: 'path', name: 'orderId', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Payment detail' }, 404: { description: 'Not found' } },
      },
    },
    '/payments/webhook/midtrans': {
      post: {
        tags: ['Payments'], summary: 'Midtrans payment webhook (public — no auth required)',
        description: 'Called by Midtrans server when payment status changes. Validates HMAC-SHA512 signature before processing.',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/MidtransWebhookBody' } } } },
        responses: { 200: { description: 'Webhook received and processed' } },
      },
    },
  },
};
