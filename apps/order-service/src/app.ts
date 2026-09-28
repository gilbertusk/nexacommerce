import { ZodError } from 'zod';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { orderRoutes } from './routes/order.routes';
import { swaggerSpec } from './docs/swagger';
import {
  createInternalServiceGuard,
  errorResponse,
  httpMetricsMiddleware,
  renderHttpPrometheusMetrics,
  renderReliabilityPrometheusMetrics,
  requestIdMiddleware,
} from '@nexacommerce/common';
import { createLogger } from '@nexacommerce/logger';
import { orderService } from './services/order.service';

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

const logger = createLogger('order-service');
const app = express();

// Establish the request correlation id before anything else runs, so every
// log line and every outbound internal call in this request carries it.
app.use(requestIdMiddleware);
app.use(httpMetricsMiddleware('order-service'));

app.use(cors({ origin: false }));
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '1mb' }));

// Log incoming requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'order-service',
    timestamp: new Date().toISOString(),
  });
});

app.get('/orders/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'order-service',
    timestamp: new Date().toISOString(),
  });
});

app.get('/metrics', createInternalServiceGuard(['prometheus']), async (_req, res) => {
  res.type('text/plain; version=0.0.4; charset=utf-8');
  res.status(200).send(renderHttpPrometheusMetrics() + await renderReliabilityPrometheusMetrics());
});

// Routes
app.get('/orders/docs/spec.json', (req, res) => res.json(swaggerSpec));
app.use('/orders/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/orders', orderRoutes);

if (process.env.NODE_ENV !== 'test') {
  // Cron: every 5 minutes — cancel expired orders + auto-complete delivered orders
  setInterval(() => {
    logger.info('[Order Service] Running cron job...');
    orderService.checkAndCancelExpiredOrders().catch((err) => {
      logger.error('Error in checkAndCancelExpiredOrders:', err);
    });
    orderService.checkAndCompleteDeliveredOrders().catch((err) => {
      logger.error('Error in checkAndCompleteDeliveredOrders:', err);
    });
    orderService.recoverStalledCheckouts().catch((err) => {
      logger.error('Error in recoverStalledCheckouts:', err);
    });
  }, 5 * 60 * 1000);

  // Run once on startup after delay
  setTimeout(() => {
    logger.info('[Order Service] Running startup cron checks...');
    orderService.checkAndCancelExpiredOrders().catch((err) => {
      logger.error('Error in startup expired orders check:', err);
    });
    orderService.checkAndCompleteDeliveredOrders().catch((err) => {
      logger.error('Error in startup delivered orders check:', err);
    });
    orderService.recoverStalledCheckouts().catch((err) => {
      logger.error('Error in startup stalled checkout recovery:', err);
    });
  }, 10000);
}

// Centralized error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err.message, err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors || null;

  // A schema violation is the caller's fault, not a server fault. Without this
  // branch a malformed checkout body surfaced as 500, which both misreports the
  // cause and leaks internal detail to the client.
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.errors.map((issue: any) => ({ field: issue.path.join('.'), message: issue.message }));
  }

  res.status(statusCode).json(errorResponse(message, statusCode, errors));
});

export default app;
