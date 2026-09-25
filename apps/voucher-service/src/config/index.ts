import { validateEnv } from '@nexacommerce/config';
import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { assertProductionSecret } from '@nexacommerce/common';

// Load variables from root .env if it exists
dotenv.config({ path: path.join(__dirname, '../../../../.env') });
dotenv.config();

const voucherEnvSchema = z.object({
  PORT: z.preprocess((val) => val ? parseInt(val as string, 10) : undefined, z.number().default(3008)),
  DATABASE_URL: z.string(),
  CART_SERVICE_URL: z.string().default('http://localhost:3004'),
  PRODUCT_SERVICE_URL: z.string().default('http://localhost:3003'),
  JWT_SECRET: z.string().default('supersecretjwtkey123'),
});

const env = validateEnv(voucherEnvSchema);
assertProductionSecret('JWT_SECRET', env.JWT_SECRET, ['supersecretjwtkey123']);

export const config = {
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
  cartServiceUrl: env.CART_SERVICE_URL,
  productServiceUrl: env.PRODUCT_SERVICE_URL,
  jwtSecret: env.JWT_SECRET,
};

export default config;
