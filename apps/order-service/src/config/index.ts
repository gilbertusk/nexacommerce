import { validateEnv } from '@nexacommerce/config';
import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { assertProductionSecret } from '@nexacommerce/common';

// Load variables from root .env if it exists
dotenv.config({ path: path.join(__dirname, '../../../../.env') });
dotenv.config();

const orderEnvSchema = z.object({
  PORT: z.preprocess((val) => val ? parseInt(val as string, 10) : undefined, z.number().default(3005)),
  DATABASE_URL: z.string(),
  PRODUCT_SERVICE_URL: z.string().default('http://localhost:3003'),
  INVENTORY_SERVICE_URL: z.string().default('http://localhost:3007'),
  USER_SERVICE_URL: z.string().default('http://localhost:3002'),
  CART_SERVICE_URL: z.string().default('http://localhost:3004'),
  VOUCHER_SERVICE_URL: z.string().default('http://localhost:3008'),
  PAYMENT_SERVICE_URL: z.string().default('http://localhost:3006'),
  AUTH_SERVICE_URL: z.string().default('http://localhost:3001'),
  RABBITMQ_URL: z.string().default('amqp://guest:guest@localhost:5672'),
  JWT_SECRET: z.string().default('supersecretjwtkey123'),
});

const env = validateEnv(orderEnvSchema);
assertProductionSecret('RABBITMQ_URL', env.RABBITMQ_URL, ['amqp://guest:guest@localhost:5672']);
assertProductionSecret('JWT_SECRET', env.JWT_SECRET, ['supersecretjwtkey123']);

export const config = {
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
  productServiceUrl: env.PRODUCT_SERVICE_URL,
  inventoryServiceUrl: env.INVENTORY_SERVICE_URL,
  userServiceUrl: env.USER_SERVICE_URL,
  cartServiceUrl: env.CART_SERVICE_URL,
  voucherServiceUrl: env.VOUCHER_SERVICE_URL,
  paymentServiceUrl: env.PAYMENT_SERVICE_URL,
  authServiceUrl: env.AUTH_SERVICE_URL,
  rabbitmqUrl: env.RABBITMQ_URL,
  jwtSecret: env.JWT_SECRET,
};

export default config;
