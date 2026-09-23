export const swaggerSpec = {
  openapi: '3.0.3',
  info: { title: 'Analytics Service API', version: '1.0.0', description: 'Sales analytics, performance reports, and dashboards' },
  servers: [{ url: '/api/v1' }],
  tags: [{ name: 'Analytics', description: 'Business intelligence and reporting' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      DailyRevenue: {
        type: 'object',
        properties: {
          date: { type: 'string', format: 'date', example: '2026-06-20' },
          revenue: { type: 'number', example: 1500000 },
          orders: { type: 'integer', example: 10 },
          averageOrderValue: { type: 'number', example: 150000 },
        },
      },
      DashboardOverview: {
        type: 'object',
        properties: {
          totalRevenue: { type: 'number' }, totalOrders: { type: 'integer' },
          totalCustomers: { type: 'integer' }, totalSellers: { type: 'integer' },
          totalProducts: { type: 'integer' }, paymentSuccessRate: { type: 'number' },
          orderCancellationRate: { type: 'number' }, averageOrderValue: { type: 'number' },
        },
      },
    },
  },
  paths: {
    '/analytics/dashboard': {
      get: {
        tags: ['Analytics'], summary: 'Admin dashboard overview (ADMIN)', security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Dashboard data', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'object', properties: { overview: { $ref: '#/components/schemas/DashboardOverview' }, revenueToday: { type: 'number' }, ordersToday: { type: 'integer' }, revenueTrend: { type: 'array', items: { $ref: '#/components/schemas/DailyRevenue' } }, ordersTrend: { type: 'array', items: { type: 'object' } } } } } } } } },
          401: { description: 'Unauthorized' }, 403: { description: 'ADMIN only' },
        },
      },
    },
    '/analytics/seller/dashboard': {
      get: {
        tags: ['Analytics'], summary: 'Seller dashboard (SELLER)', security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Seller metrics and recent orders' }, 403: { description: 'SELLER only' } },
      },
    },
    '/analytics/revenue': {
      get: {
        tags: ['Analytics'], summary: 'Revenue report (ADMIN)', security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'period', schema: { type: 'string', enum: ['daily', 'monthly'], default: 'daily' } },
          { in: 'query', name: 'startDate', schema: { type: 'string', format: 'date' } },
          { in: 'query', name: 'endDate', schema: { type: 'string', format: 'date' } },
        ],
        responses: { 200: { description: 'Revenue time series', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/DailyRevenue' } } } } } } }, 403: { description: 'ADMIN only' } },
      },
    },
    '/analytics/orders': {
      get: {
        tags: ['Analytics'], summary: 'Order volume report (ADMIN)', security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'period', schema: { type: 'string', enum: ['daily', 'monthly'] } },
          { in: 'query', name: 'startDate', schema: { type: 'string', format: 'date' } },
          { in: 'query', name: 'endDate', schema: { type: 'string', format: 'date' } },
        ],
        responses: { 200: { description: 'Order count time series' }, 403: { description: 'ADMIN only' } },
      },
    },
    '/analytics/products/top-selling': {
      get: {
        tags: ['Analytics'], summary: 'Top selling products (ADMIN or SELLER)', security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
          { in: 'query', name: 'period', schema: { type: 'string', enum: ['monthly', 'all_time'], default: 'all_time' } },
          { in: 'query', name: 'month', schema: { type: 'integer', minimum: 1, maximum: 12 } },
          { in: 'query', name: 'year', schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Ranked product list' }, 403: { description: 'ADMIN or SELLER only' } },
      },
    },
    '/analytics/categories/top-selling': {
      get: {
        tags: ['Analytics'], summary: 'Top performing categories (ADMIN)', security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
          { in: 'query', name: 'period', schema: { type: 'string', enum: ['monthly', 'all_time'] } },
        ],
        responses: { 200: { description: 'Ranked category list' }, 403: { description: 'ADMIN only' } },
      },
    },
    '/analytics/sellers/performance': {
      get: {
        tags: ['Analytics'], summary: 'Seller performance ranking (ADMIN)', security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
          { in: 'query', name: 'period', schema: { type: 'string', enum: ['monthly', 'all_time'] } },
          { in: 'query', name: 'sortBy', schema: { type: 'string', enum: ['revenue', 'orders', 'rating'] } },
        ],
        responses: { 200: { description: 'Ranked seller list' }, 403: { description: 'ADMIN only' } },
      },
    },
    '/analytics/payments/success-rate': {
      get: {
        tags: ['Analytics'], summary: 'Payment success rate report (ADMIN)', security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'period', schema: { type: 'string', enum: ['daily', 'monthly'] } },
          { in: 'query', name: 'startDate', schema: { type: 'string', format: 'date' } },
          { in: 'query', name: 'endDate', schema: { type: 'string', format: 'date' } },
        ],
        responses: { 200: { description: 'Payment stats time series' }, 403: { description: 'ADMIN only' } },
      },
    },
    '/analytics/orders/cancellation-rate': {
      get: {
        tags: ['Analytics'], summary: 'Order cancellation rate report (ADMIN)', security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'period', schema: { type: 'string', enum: ['daily', 'monthly'] } },
          { in: 'query', name: 'startDate', schema: { type: 'string', format: 'date' } },
          { in: 'query', name: 'endDate', schema: { type: 'string', format: 'date' } },
        ],
        responses: { 200: { description: 'Cancellation stats time series' }, 403: { description: 'ADMIN only' } },
      },
    },
  },
};
