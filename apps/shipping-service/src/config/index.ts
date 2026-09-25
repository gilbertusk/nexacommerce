import { validateEnv } from '@nexacommerce/config';
import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { assertProductionSecret } from '@nexacommerce/common';

dotenv.config({ path: path.join(__dirname, '../../../../.env') });
dotenv.config();

const shippingEnvSchema = z.object({
  PORT: z.preprocess((val) => val ? parseInt(val as string, 10) : undefined, z.number().default(3009)),
  DATABASE_URL: z.string(),
  RABBITMQ_URL: z.string().default('amqp://guest:guest@localhost:5672'),
  JWT_SECRET: z.string().default('supersecretjwtkey123'),
  ORDER_SERVICE_URL: z.string().default('http://localhost:3005'),
  SHIPPING_OUTBOX_POLL_INTERVAL_MS: z.preprocess((val) => val ? parseInt(val as string, 10) : undefined, z.number().int().positive().default(5000)),
  SHIPPING_OUTBOX_BATCH_SIZE: z.preprocess((val) => val ? parseInt(val as string, 10) : undefined, z.number().int().positive().max(500).default(50)),
  SHIPPING_OUTBOX_LEASE_MS: z.preprocess((val) => val ? parseInt(val as string, 10) : undefined, z.number().int().positive().default(60000)),
});

const env = validateEnv(shippingEnvSchema);
assertProductionSecret('RABBITMQ_URL', env.RABBITMQ_URL, ['amqp://guest:guest@localhost:5672']);
assertProductionSecret('JWT_SECRET', env.JWT_SECRET, ['supersecretjwtkey123']);

export const config = {
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
  rabbitmqUrl: env.RABBITMQ_URL,
  jwtSecret: env.JWT_SECRET,
  orderServiceUrl: env.ORDER_SERVICE_URL,
  outboxPollIntervalMs: env.SHIPPING_OUTBOX_POLL_INTERVAL_MS,
  outboxBatchSize: env.SHIPPING_OUTBOX_BATCH_SIZE,
  outboxLeaseMs: env.SHIPPING_OUTBOX_LEASE_MS,
};

export default config;
