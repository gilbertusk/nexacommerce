import { validateEnv } from '@nexacommerce/config';
import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { assertProductionSecret } from '@nexacommerce/common';

// Load variables from root .env if it exists
dotenv.config({ path: path.join(__dirname, '../../../../.env') });
dotenv.config();

const paymentEnvSchema = z.object({
  PORT: z.preprocess((val) => val ? parseInt(val as string, 10) : undefined, z.number().default(3006)),
  DATABASE_URL: z.string(),
  ORDER_SERVICE_URL: z.string().url().default('http://localhost:3005'),
  RABBITMQ_URL: z.string().default('amqp://guest:guest@localhost:5672'),
  MIDTRANS_SERVER_KEY: z.string().default('SB-Mid-server-nexacommerce-stage3-secret'),
  MIDTRANS_CLIENT_KEY: z.string().default('SB-Mid-client-nexacommerce-stage3-pub'),
  MIDTRANS_MERCHANT_ID: z.string().default('MIDTRANS-MERCHANT-ID'),
  MIDTRANS_IS_PRODUCTION: z.preprocess((val) => val === 'true', z.boolean().default(false)),
  PAYMENT_OUTBOX_POLL_INTERVAL_MS: z.coerce.number().int().min(500).default(5000),
  PAYMENT_OUTBOX_BATCH_SIZE: z.coerce.number().int().min(1).max(100).default(50),
  PAYMENT_OUTBOX_LEASE_MS: z.coerce.number().int().min(10000).default(60000),
  JWT_SECRET: z.string().default('supersecretjwtkey123'),
});

const env = validateEnv(paymentEnvSchema);

assertProductionSecret('RABBITMQ_URL', env.RABBITMQ_URL, ['amqp://guest:guest@localhost:5672']);
assertProductionSecret('MIDTRANS_SERVER_KEY', env.MIDTRANS_SERVER_KEY, [
  'SB-Mid-server-nexacommerce-stage3-secret',
  'SB-Mid-server-XXXX',
]);
assertProductionSecret('MIDTRANS_CLIENT_KEY', env.MIDTRANS_CLIENT_KEY, [
  'SB-Mid-client-nexacommerce-stage3-pub',
  'SB-Mid-client-XXXX',
]);
assertProductionSecret('MIDTRANS_MERCHANT_ID', env.MIDTRANS_MERCHANT_ID, ['MIDTRANS-MERCHANT-ID']);
assertProductionSecret('JWT_SECRET', env.JWT_SECRET, ['supersecretjwtkey123']);

export const config = {
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
  orderServiceUrl: env.ORDER_SERVICE_URL,
  rabbitmqUrl: env.RABBITMQ_URL,
  midtransServerKey: env.MIDTRANS_SERVER_KEY,
  midtransClientKey: env.MIDTRANS_CLIENT_KEY,
  midtransMerchantId: env.MIDTRANS_MERCHANT_ID,
  midtransIsProduction: env.MIDTRANS_IS_PRODUCTION,
  outboxPollIntervalMs: env.PAYMENT_OUTBOX_POLL_INTERVAL_MS,
  outboxBatchSize: env.PAYMENT_OUTBOX_BATCH_SIZE,
  outboxLeaseMs: env.PAYMENT_OUTBOX_LEASE_MS,
  jwtSecret: env.JWT_SECRET,
};

export default config;
