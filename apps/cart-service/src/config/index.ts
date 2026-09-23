import { validateEnv } from '@nexacommerce/config';
import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { assertProductionSecret } from '@nexacommerce/common';

dotenv.config({ path: path.join(__dirname, '../../../../.env') });
dotenv.config();

const cartEnvSchema = z.object({
  PORT_CART_SERVICE: z.preprocess((val) => val ? parseInt(val as string, 10) : undefined, z.number().default(3004)),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  PRODUCT_SERVICE_URL: z.string().default('http://localhost:3003'),
  INVENTORY_SERVICE_URL: z.string().default('http://localhost:3007'),
});

const env = validateEnv(cartEnvSchema);
assertProductionSecret('REDIS_URL', env.REDIS_URL, ['redis://localhost:6379']);

export const config = {
  port: env.PORT_CART_SERVICE,
  redisUrl: env.REDIS_URL,
  productServiceUrl: env.PRODUCT_SERVICE_URL,
  inventoryServiceUrl: env.INVENTORY_SERVICE_URL,
};

export default config;
