import { validateEnv } from '@nexacommerce/config';
import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { assertProductionSecret } from '@nexacommerce/common';

dotenv.config({ path: path.join(__dirname, '../../../../.env') });
dotenv.config();

const reviewEnvSchema = z.object({
  PORT: z.preprocess((val) => val ? parseInt(val as string, 10) : undefined, z.number().default(3010)),
  DATABASE_URL: z.string(),
  RABBITMQ_URL: z.string().default('amqp://guest:guest@localhost:5672'),
  JWT_SECRET: z.string().default('supersecretjwtkey123'),
  ORDER_SERVICE_URL: z.string().default('http://localhost:3005'),
  PRODUCT_SERVICE_URL: z.string().default('http://localhost:3003'),
});

const env = validateEnv(reviewEnvSchema);
assertProductionSecret('RABBITMQ_URL', env.RABBITMQ_URL, ['amqp://guest:guest@localhost:5672']);
assertProductionSecret('JWT_SECRET', env.JWT_SECRET, ['supersecretjwtkey123']);

export const config = {
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
  rabbitmqUrl: env.RABBITMQ_URL,
  jwtSecret: env.JWT_SECRET,
  orderServiceUrl: env.ORDER_SERVICE_URL,
  productServiceUrl: env.PRODUCT_SERVICE_URL,
};

export default config;
