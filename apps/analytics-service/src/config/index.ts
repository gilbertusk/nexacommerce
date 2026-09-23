import { validateEnv } from '@nexacommerce/config';
import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { assertProductionSecret } from '@nexacommerce/common';

dotenv.config({ path: path.join(__dirname, '../../../../.env') });
dotenv.config();

const analyticsEnvSchema = z.object({
  PORT: z.preprocess((v) => (v ? parseInt(v as string, 10) : undefined), z.number().default(3012)),
  DATABASE_URL: z.string(),
  RABBITMQ_URL: z.string().default('amqp://guest:guest@localhost:5672'),
  JWT_SECRET: z.string().default('my-super-secret-local-key'),
  AUTH_SERVICE_URL: z.string().default('http://localhost:3001'),
  PRODUCT_SERVICE_URL: z.string().default('http://localhost:3003'),
  ORDER_SERVICE_URL: z.string().default('http://localhost:3005'),
  REVIEW_SERVICE_URL: z.string().default('http://localhost:3010'),
});

const env = validateEnv(analyticsEnvSchema);
assertProductionSecret('RABBITMQ_URL', env.RABBITMQ_URL, ['amqp://guest:guest@localhost:5672']);
assertProductionSecret('JWT_SECRET', env.JWT_SECRET, ['my-super-secret-local-key']);

export const config = {
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
  rabbitmqUrl: env.RABBITMQ_URL,
  jwtSecret: env.JWT_SECRET,
  authServiceUrl: env.AUTH_SERVICE_URL,
  productServiceUrl: env.PRODUCT_SERVICE_URL,
  orderServiceUrl: env.ORDER_SERVICE_URL,
  reviewServiceUrl: env.REVIEW_SERVICE_URL,
};

export default config;
