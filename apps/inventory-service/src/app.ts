import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { ZodError } from 'zod';
import { inventoryRoutes } from './routes/inventory.routes';
import { errorResponse } from '@nexacommerce/common';
import { createLogger } from '@nexacommerce/logger';

const logger = createLogger('inventory-service');
const app = express();

app.use(cors());
app.use(express.json());

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
  logger.info(`${req.method} ${req.url}`);
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

// Mount Routes
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
