import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { orderRoutes } from './routes/order.routes';
import { swaggerSpec } from './docs/swagger';
import { errorResponse } from '@nexacommerce/common';
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
  }, 10000);
}

// Centralized error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err.message, err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const errors = err.errors || null;

  res.status(statusCode).json(errorResponse(message, statusCode, errors));
});

export default app;
