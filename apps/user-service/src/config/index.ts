import { validateEnv } from '@nexacommerce/config';
import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../../.env') });
dotenv.config();

const userEnvSchema = z.object({
  PORT_USER_SERVICE: z.preprocess((val) => val ? parseInt(val as string, 10) : undefined, z.number().default(3002)),
  DATABASE_URL: z.string(),
  AUTH_SERVICE_URL: z.string().default('http://localhost:3001'),
});

const env = validateEnv(userEnvSchema);

export const config = {
  port: env.PORT_USER_SERVICE,
  databaseUrl: env.DATABASE_URL,
  authServiceUrl: env.AUTH_SERVICE_URL,
};
export default config;
