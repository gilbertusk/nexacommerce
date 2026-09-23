import { validateEnv } from '@nexacommerce/config';
import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { assertProductionSecret } from '@nexacommerce/common';

dotenv.config({ path: path.join(__dirname, '../../../../.env') });
dotenv.config();

const inventoryEnvSchema = z.object({
  PORT_INVENTORY_SERVICE: z.preprocess((val) => val ? parseInt(val as string, 10) : undefined, z.number().default(3007)),
  DATABASE_URL: z.string(),
  PRODUCT_SERVICE_URL: z.string().default('http://localhost:3003'),
  RABBITMQ_URL: z.string().default('amqp://guest:guest@localhost:5672'),
});

const env = validateEnv(inventoryEnvSchema);
assertProductionSecret('RABBITMQ_URL', env.RABBITMQ_URL, ['amqp://guest:guest@localhost:5672']);

export const config = {
  port: env.PORT_INVENTORY_SERVICE,
  databaseUrl: env.DATABASE_URL,
  productServiceUrl: env.PRODUCT_SERVICE_URL,
  rabbitmqUrl: env.RABBITMQ_URL,
};

export default config;
