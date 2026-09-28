import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { ZodError } from 'zod';
import { inventoryRoutes } from './routes/inventory.routes';
import { swaggerSpec } from './docs/swagger';
import {
  createInternalServiceGuard,
  errorResponse,
  httpMetricsMiddleware,
  renderHttpPrometheusMetrics,
  requestIdMiddleware,
} from '@nexacommerce/common';
import { createLogger } from '@nexacommerce/logger';

const logger = createLogger('inventory-service');
const app = express();

// Establish the request correlation id before anything else runs, so every
// log line and every outbound internal call in this request carries it.
app.use(requestIdMiddleware);
app.use(httpMetricsMiddleware('inventory-service'));

app.use(cors({ origin: false }));
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '1mb' }));

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

// Log incoming requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'inventory-service',
    timestamp: new Date().toISOString(),
  });
});

app.get('/inventory/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'inventory-service',
    timestamp: new Date().toISOString(),
  });
});

app.get('/metrics', createInternalServiceGuard(['prometheus']), (_req, res) => {
  res.type('text/plain; version=0.0.4; charset=utf-8');
  res.status(200).send(renderHttpPrometheusMetrics());
});

// Mount Routes
app.get('/inventory/docs/spec.json', (req, res) => res.json(swaggerSpec));
app.use('/inventory/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/inventory', inventoryRoutes);

// Centralized error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message || 'Error occurred', err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors || null;

  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.errors.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
  }

  res.status(statusCode).json(errorResponse(message, statusCode, errors));
});

export default app;
export { app };
