import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { paymentRoutes } from './routes/payment.routes';
import { swaggerSpec } from './docs/swagger';
import { errorResponse } from '@nexacommerce/common';
import { createLogger } from '@nexacommerce/logger';

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

const logger = createLogger('payment-service');
const app = express();

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
    service: 'payment-service',
    timestamp: new Date().toISOString(),
  });
});

app.get('/payments/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'payment-service',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.get('/payments/docs/spec.json', (req, res) => res.json(swaggerSpec));
app.use('/payments/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/payments', paymentRoutes);

// Centralized error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err.message, err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const errors = err.errors || null;

  res.status(statusCode).json(errorResponse(message, statusCode, errors));
});

export default app;
