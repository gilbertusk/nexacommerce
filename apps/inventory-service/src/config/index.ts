import { validateEnv } from '@nexacommerce/config';
import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../../.env') });
dotenv.config();

const inventoryEnvSchema = z.object({
  PORT_INVENTORY_SERVICE: z.preprocess((val) => val ? parseInt(val as string, 10) : undefined, z.number().default(3007)),
  DATABASE_URL: z.string(),
  PRODUCT_SERVICE_URL: z.string().default('http://localhost:3003'),
});

const env = validateEnv(inventoryEnvSchema);

export const config = {
  port: env.PORT_INVENTORY_SERVICE,
  databaseUrl: env.DATABASE_URL,
  productServiceUrl: env.PRODUCT_SERVICE_URL,
};

export default config;
