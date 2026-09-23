import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { ZodError } from 'zod';
import { analyticsRoutes } from './routes/analytics.routes';
import { swaggerSpec } from './docs/swagger';
import { errorResponse } from '@nexacommerce/common';
import { createLogger } from '@nexacommerce/logger';

const logger = createLogger('analytics-service');
const app = express();

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
