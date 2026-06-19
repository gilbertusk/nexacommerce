import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { config } from './config/index';
import { createLogger } from '@nexacommerce/logger';

const logger = createLogger('api-gateway');
const app = express();

app.use(cors());

// Extend express Request interface to support user context
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
  logger.info(`${req.method} ${req.url}`);
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
    // Check if path is GET /api/v1/inventory/:productId (UUID format or alphanumeric slug)
    const inventoryMatch = path.match(/^\/api\/v1\/inventory\/[a-f0-9-]+$/i);
    if (inventoryMatch) return true;
  }
  if (method === 'POST') {
    if (path === '/api/v1/auth/register') return true;
    if (path === '/api/v1/auth/login') return true;
    if (path === '/api/v1/auth/forgot-password') return true;
    if (path === '/api/v1/auth/reset-password') return true;
    if (path === '/api/v1/auth/verify-email') return true;
    if (path === '/api/v1/auth/refresh-token') return true;
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
      if (req.user) {
        proxyReq.setHeader('X-User-Id', req.user.userId);
        proxyReq.setHeader('X-User-Email', req.user.email);
        proxyReq.setHeader('X-User-Role', req.user.role);
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

// Proxy routes
app.use('/api/v1/auth', createGatewayProxy(config.authServiceUrl, { '^/api/v1/auth': '/auth' }));
app.use('/api/v1/users', createGatewayProxy(config.userServiceUrl, { '^/api/v1/users': '/users' }));
app.use('/api/v1/inventory', createGatewayProxy(config.inventoryServiceUrl, { '^/api/v1/inventory': '/inventory' }));
app.use('/api/v1/brands', createGatewayProxy(config.productServiceUrl, { '^/api/v1/brands': '/brands' }));
app.use('/api/v1/products', createGatewayProxy(config.productServiceUrl, { '^/api/v1/products': '' }));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

export default app;
