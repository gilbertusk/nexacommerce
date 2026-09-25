import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { authRoutes } from './routes/auth.routes';
import { swaggerSpec } from './docs/swagger';
import { errorResponse, requestIdMiddleware } from '@nexacommerce/common';
import { createLogger } from '@nexacommerce/logger';
import { ZodError } from 'zod';

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

const logger = createLogger('auth-service');
const app = express();

// Establish the request correlation id before anything else runs, so every
// log line and every outbound internal call in this request carries it.
app.use(requestIdMiddleware);

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
    service: 'auth-service',
    timestamp: new Date().toISOString(),
  });
});

app.get('/auth/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
  });
});

// Swagger UI
app.get('/auth/docs/spec.json', (req, res) => res.json(swaggerSpec));
app.use('/auth/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/auth', authRoutes);

// Centralized error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err.message, err);

  const statusCode = err instanceof ZodError ? 400 : (err.statusCode || 500);
  const message = err.message || 'Internal server error';
  const errors = err instanceof ZodError ? err.issues : (err.errors || null);

  res.status(statusCode).json(errorResponse(message, statusCode, errors));
});

export default app;
