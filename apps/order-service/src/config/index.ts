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
  SHIPPING_SERVICE_URL: z.string().default('http://localhost:3009'),
  AUTH_SERVICE_URL: z.string().default('http://localhost:3001'),
  RABBITMQ_URL: z.string().default('amqp://guest:guest@localhost:5672'),
  ORDER_OUTBOX_POLL_INTERVAL_MS: z.coerce.number().int().min(500).default(5000),
  ORDER_OUTBOX_BATCH_SIZE: z.coerce.number().int().min(1).max(100).default(50),
  ORDER_OUTBOX_LEASE_MS: z.coerce.number().int().min(10000).default(60000),
  // An unfinalized checkout older than this is treated as interrupted and
  // cancelled by the recovery sweep. Must exceed the slowest successful
  // checkout, including the payment provider round trip.
  CHECKOUT_FINALIZATION_TIMEOUT_MS: z.coerce.number().int().min(60000).default(15 * 60 * 1000),
  CHECKOUT_RECOVERY_BATCH_SIZE: z.coerce.number().int().min(1).max(500).default(100),
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
  shippingServiceUrl: env.SHIPPING_SERVICE_URL,
  authServiceUrl: env.AUTH_SERVICE_URL,
  rabbitmqUrl: env.RABBITMQ_URL,
  outboxPollIntervalMs: env.ORDER_OUTBOX_POLL_INTERVAL_MS,
  outboxBatchSize: env.ORDER_OUTBOX_BATCH_SIZE,
  outboxLeaseMs: env.ORDER_OUTBOX_LEASE_MS,
  checkoutFinalizationTimeoutMs: env.CHECKOUT_FINALIZATION_TIMEOUT_MS,
  checkoutRecoveryBatchSize: env.CHECKOUT_RECOVERY_BATCH_SIZE,
  jwtSecret: env.JWT_SECRET,
};

export default config;
