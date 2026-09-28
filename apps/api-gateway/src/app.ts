import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { config } from './config/index';
import { createLogger } from '@nexacommerce/logger';
import {
  createInternalServiceGuard,
  getRequestId,
  httpMetricsMiddleware,
  renderHttpPrometheusMetrics,
  REQUEST_ID_HEADER,
  requestIdMiddleware,
} from '@nexacommerce/common';
import { createRateLimitStore, RateLimitStoreUnavailableError } from './redis/rate-limit-store';

const logger = createLogger('api-gateway');
const app = express();

// Establish the request correlation id before anything else runs, so every
// log line and every outbound internal call in this request carries it.
app.use(requestIdMiddleware);
app.use(httpMetricsMiddleware('api-gateway'));

app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin(origin, callback) {
    callback(null, !origin || config.allowedOrigins.includes(origin));
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
}));

// Keep the operations surface private and outside Redis-backed public rate
// limiting, so monitoring remains available during a Redis incident.
app.get('/metrics', createInternalServiceGuard(['prometheus']), (req, res) => {
  res.type('text/plain; version=0.0.4; charset=utf-8');
  res.status(200).send(renderHttpPrometheusMetrics());
});

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
app.use((req, res, next) => {
  const origin = req.header('origin');
  if (origin && STATE_CHANGING_METHODS.has(req.method) && !config.allowedOrigins.includes(origin)) {
    return res.status(403).json({ success: false, message: 'Request origin is not allowed' });
  }
  next();
});

// ── Rate Limiting ────────────────────────────────────────────────────────────

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  store: createRateLimitStore('global', 15 * 60 * 1000),
  passOnStoreError: false,
  skip: (req) => req.path === '/health',
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  store: createRateLimitStore('auth', 15 * 60 * 1000),
  passOnStoreError: false,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts, please try again in 15 minutes.' },
});

const checkoutLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  store: createRateLimitStore('orders', 60 * 1000),
  passOnStoreError: false,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many checkout requests, please slow down.' },
});

const productMediaUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  store: createRateLimitStore('product-media', 15 * 60 * 1000),
  passOnStoreError: false,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many product image uploads, please try again later.' },
});

app.use(globalLimiter);
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1/auth/forgot-password', authLimiter);
app.use('/api/v1/auth/resend-verification', authLimiter);
app.use('/api/v1/orders', checkoutLimiter);

// ── Extend express Request interface ────────────────────────────────────────
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Gateway health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/v1', (req, res) => {
  res.status(200).json({
    message: 'Welcome to NexaCommerce API Gateway',
    version: '1.0.0',
  });
});

// Helper to determine if a route is public
const isPublicRoute = (method: string, path: string): boolean => {
  if (method === 'GET') {
    if (path.endsWith('/health')) return true;
    if (path.startsWith('/api/v1/products/products')) return true;
    if (path.startsWith('/api/v1/products/categories')) return true;
    if (path.startsWith('/api/v1/brands')) return true;
    const inventoryMatch = path.match(/^\/api\/v1\/inventory\/[a-f0-9-]+$/i);
    if (inventoryMatch) return true;
    // Shipping public endpoints
    if (path === '/api/v1/shipping/couriers') return true;
    if (path.startsWith('/api/v1/shipping/rates')) return true;
    // Review public endpoints
    if (path.match(/^\/api\/v1\/reviews\/products\/.+/)) return true;
    if (path.match(/^\/api\/v1\/reviews\/summary\/.+/)) return true;
    // Swagger docs (public)
    if (path.startsWith('/api/docs')) return true;
  }
  if (method === 'POST') {
    if (path === '/api/v1/auth/register') return true;
    if (path === '/api/v1/auth/login') return true;
    if (path === '/api/v1/auth/forgot-password') return true;
    if (path === '/api/v1/auth/resend-verification') return true;
    if (path === '/api/v1/auth/reset-password') return true;
    if (path === '/api/v1/auth/verify-email') return true;
    if (path === '/api/v1/auth/refresh-token') return true;
    if (path === '/api/v1/auth/logout') return true;
    if (path === '/api/v1/payments/webhook/midtrans') return true;
  }
  return false;
};

// Gateway level JWT verification middleware
const gatewayAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const path = req.path;
  const method = req.method;

  const authHeader = req.headers.authorization;
  let token: string | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!token && req.headers.cookie) {
    const accessCookie = req.headers.cookie
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith('nexa_access_token='));
    if (accessCookie) {
      token = decodeURIComponent(accessCookie.substring('nexa_access_token='.length));
    }
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as any;
      req.user = {
        userId: decoded.id || decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };
    } catch (err) {
      if (!isPublicRoute(method, path)) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
      }
    }
  }

  if (!req.user && !isPublicRoute(method, path)) {
    return res.status(401).json({ success: false, message: 'Authorization token is required' });
  }

  next();
};

app.use(gatewayAuthMiddleware);

// Proxy configuration helper
const createGatewayProxy = (target: string, pathRewrite: Record<string, string>): RequestHandler => {
  const options: Options = {
    target,
    changeOrigin: true,
    pathRewrite,
    onProxyReq: (proxyReq, req: Request) => {
      proxyReq.removeHeader('X-User-Id');
      proxyReq.removeHeader('X-User-Email');
      proxyReq.removeHeader('X-User-Role');
      proxyReq.removeHeader('X-Internal-Service');
      proxyReq.removeHeader('X-Internal-Token');
      if (req.user) {
        proxyReq.setHeader('X-User-Id', req.user.userId);
        proxyReq.setHeader('X-User-Email', req.user.email);
        proxyReq.setHeader('X-User-Role', req.user.role);
      }

      // Forward the gateway's correlation id so the downstream service logs
      // under the same trace. The gateway is where the id is minted or, if the
      // client supplied a valid one, adopted.
      const requestId = getRequestId();
      if (requestId) {
        proxyReq.setHeader(REQUEST_ID_HEADER, requestId);
      }
    },
    onError: (err, req, res) => {
      logger.error(`[Proxy Error] connecting to ${target}: ${err.message}`);
      res.status(502).json({ success: false, message: 'Bad Gateway: Service is temporarily unavailable' });
    },
  };
  return createProxyMiddleware(options);
};

import { RequestHandler } from 'express';
import swaggerUi from 'swagger-ui-express';

// Proxy routes
app.use('/api/v1/auth', createGatewayProxy(config.authServiceUrl, { '^/api/v1/auth': '/auth' }));
app.use('/api/v1/users', createGatewayProxy(config.userServiceUrl, { '^/api/v1/users': '/users' }));
app.use('/api/v1/inventory', createGatewayProxy(config.inventoryServiceUrl, { '^/api/v1/inventory': '/inventory' }));
app.use('/api/v1/brands', createGatewayProxy(config.productServiceUrl, { '^/api/v1/brands': '/brands' }));
app.use('/api/v1/products/products/:id/images/upload', productMediaUploadLimiter);
app.use('/api/v1/products', createGatewayProxy(config.productServiceUrl, { '^/api/v1/products': '' }));
app.use('/api/v1/cart', createGatewayProxy(config.cartServiceUrl, { '^/api/v1/cart': '/cart' }));
app.use('/api/v1/orders', createGatewayProxy(config.orderServiceUrl, { '^/api/v1/orders': '/orders' }));
app.use('/api/v1/payments', createGatewayProxy(config.paymentServiceUrl, { '^/api/v1/payments': '/payments' }));
app.use('/api/v1/vouchers', createGatewayProxy(config.voucherServiceUrl, { '^/api/v1/vouchers': '/vouchers' }));
app.use('/api/v1/shipping', createGatewayProxy(config.shippingServiceUrl, { '^/api/v1/shipping': '/shipping' }));
app.use('/api/v1/reviews', createGatewayProxy(config.reviewServiceUrl, { '^/api/v1/reviews': '/reviews' }));
app.use('/api/v1/notifications', createGatewayProxy(config.notificationServiceUrl, { '^/api/v1/notifications': '/notifications' }));
app.use('/api/v1/analytics', createGatewayProxy(config.analyticsServiceUrl, { '^/api/v1/analytics': '/analytics' }));

// ── Swagger Aggregation ──────────────────────────────────────────────────────

const SERVICE_SPEC_URLS: Record<string, string> = {
  auth:         'http://localhost:3001/auth/docs/spec.json',
  users:        'http://localhost:3002/users/docs/spec.json',
  products:     'http://localhost:3003/docs/spec.json',
  cart:         'http://localhost:3004/cart/docs/spec.json',
  orders:       'http://localhost:3005/orders/docs/spec.json',
  payments:     'http://localhost:3006/payments/docs/spec.json',
  vouchers:     'http://localhost:3008/vouchers/docs/spec.json',
  inventory:    'http://localhost:3007/inventory/docs/spec.json',
  shipping:     'http://localhost:3009/shipping/docs/spec.json',
  reviews:      'http://localhost:3010/reviews/docs/spec.json',
  notifications:'http://localhost:3011/notifications/docs/spec.json',
  analytics:    'http://localhost:3012/analytics/docs/spec.json',
};

let cachedSpec: any = null;
let cacheExpiry = 0;

async function buildAggregatedSpec(): Promise<any> {
  if (cachedSpec && Date.now() < cacheExpiry) return cachedSpec;

  const combined: any = {
    openapi: '3.0.3',
    info: { title: 'NexaCommerce API', version: '1.0.0', description: 'Unified API documentation for all NexaCommerce microservices' },
    servers: [{ url: '/api/v1', description: 'API Gateway' }],
    tags: [],
    paths: {},
    components: { schemas: {}, securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
  };

  await Promise.allSettled(
    Object.entries(SERVICE_SPEC_URLS).map(async ([name, url]) => {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
        if (!res.ok) return;
        const spec: any = await res.json();
        if (spec.paths) Object.assign(combined.paths, spec.paths);
        if (spec.components?.schemas) Object.assign(combined.components.schemas, spec.components.schemas);
        if (spec.tags) combined.tags.push(...spec.tags);
      } catch {
        logger.warn(`[Gateway] Could not fetch Swagger spec for ${name}`);
      }
    }),
  );

  cachedSpec = combined;
  cacheExpiry = Date.now() + 60_000;
  return combined;
}

app.get('/api/docs/spec.json', async (req, res) => {
  try {
    const spec = await buildAggregatedSpec();
    res.json(spec);
  } catch {
    res.status(500).json({ error: 'Failed to build API spec' });
  }
});

app.use('/api/docs', swaggerUi.serve);
app.get('/api/docs', swaggerUi.setup(null, {
  swaggerOptions: { url: '/api/docs/spec.json' },
  customSiteTitle: 'NexaCommerce API Docs',
}));

// 404 handler
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof RateLimitStoreUnavailableError) {
    logger.error('Distributed rate-limit store unavailable; rejecting request');
    return res.status(503).json({ success: false, message: 'Request protection is temporarily unavailable' });
  }
  logger.error(`Unhandled gateway error: ${error?.message || 'unknown error'}`);
  return res.status(500).json({ success: false, message: 'Internal gateway error' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

export default app;
