import { validateEnv } from '@nexacommerce/config';
import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load variables from root .env if it exists
dotenv.config({ path: path.join(__dirname, '../../../../.env') });
dotenv.config();

const authEnvSchema = z.object({
  PORT_AUTH_SERVICE: z.preprocess((val) => val ? parseInt(val as string, 10) : undefined, z.number().default(3001)),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().default('super-secret-key-change-in-production'),
  JWT_REFRESH_SECRET: z.string().default('super-secret-refresh-key-change-in-production'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
});

const env = validateEnv(authEnvSchema);

export const config = {
  port: env.PORT_AUTH_SERVICE,
  databaseUrl: env.DATABASE_URL,
  jwtSecret: env.JWT_SECRET,
  jwtRefreshSecret: env.JWT_REFRESH_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  jwtRefreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
};
export default config;
