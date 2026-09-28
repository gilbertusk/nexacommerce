import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { ZodError } from 'zod';
import { analyticsRoutes } from './routes/analytics.routes';
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
import {
  kafkaProjectionLag,
  kafkaProjectionMetrics,
  kafkaProjectionReady,
} from './messaging/kafka-consumer';
import { config } from './config';
import { renderAnalyticsPrometheusMetrics } from './metrics/prometheus';

const logger = createLogger('analytics-service');
const app = express();

// Establish the request correlation id before anything else runs, so every
// log line and every outbound internal call in this request carries it.
app.use(requestIdMiddleware);
app.use(httpMetricsMiddleware('analytics-service'));

app.use(cors({ origin: false }));
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '1mb' }));

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; email: string; role: string };
    }
  }
}

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'analytics-service', timestamp: new Date().toISOString() });
});

app.get('/analytics/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'analytics-service', timestamp: new Date().toISOString() });
});

// Metrics expose operational topology and counters, so they are available to
// the private scraper identity only, never as an unauthenticated public route.
app.get('/metrics', createInternalServiceGuard(['prometheus']), async (req, res) => {
  res.type('text/plain; version=0.0.4; charset=utf-8');
  res.status(200).send(renderHttpPrometheusMetrics() + await renderReliabilityPrometheusMetrics() + renderAnalyticsPrometheusMetrics());
});

/**
 * Readiness, not liveness. It reports whether the Kafka projection is actually
 * consuming and how far behind it is, so a deploy can be held back and an
 * alert can fire on lag, rejected messages, or repeated failures.
 */
app.get('/analytics/readiness', async (req, res) => {
  const [ready, metrics, lag] = await Promise.all([
    kafkaProjectionReady(),
    Promise.resolve(kafkaProjectionMetrics()),
    Promise.resolve(kafkaProjectionLag()),
  ]);
  res.status(ready ? 200 : 503).json({
    status: ready ? 'READY' : 'NOT_READY',
    service: 'analytics-service',
    dailyReadModel: config.dailyReadModel,
    rabbitMqConsumerEnabled: config.rabbitMqConsumerEnabled,
    kafkaProjection: { ...metrics, lag },
    timestamp: new Date().toISOString(),
  });
});

// Swagger UI
app.get('/analytics/docs/spec.json', (req, res) => res.json(swaggerSpec));
app.use('/analytics/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/analytics', analyticsRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message || 'Error occurred', err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors || null;

  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.errors.map((issue: any) => ({ field: issue.path.join('.'), message: issue.message }));
  }

  res.status(statusCode).json(errorResponse(message, statusCode, errors));
});

export default app;
export { app };
