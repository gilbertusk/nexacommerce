import { validateEnv } from '@nexacommerce/config';
import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { assertProductionSecret } from '@nexacommerce/common';

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
  COOKIE_SECURE: z.preprocess((val) => val === 'true', z.boolean().default(process.env.NODE_ENV === 'production')),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  COOKIE_DOMAIN: z.string().optional(),
  NOTIFICATION_SERVICE_URL: z.string().url().default('http://localhost:3011'),
});

const env = validateEnv(authEnvSchema);

assertProductionSecret('JWT_SECRET', env.JWT_SECRET, ['super-secret-key-change-in-production', 'supersecretjwtkey123', 'my-super-secret-local-key']);
assertProductionSecret('JWT_REFRESH_SECRET', env.JWT_REFRESH_SECRET, ['super-secret-refresh-key-change-in-production']);
const notificationServiceUrl = assertProductionSecret(
  'NOTIFICATION_SERVICE_URL',
  env.NOTIFICATION_SERVICE_URL,
  ['http://localhost:3011'],
);

export const config = {
  port: env.PORT_AUTH_SERVICE,
  databaseUrl: env.DATABASE_URL,
  jwtSecret: env.JWT_SECRET,
  jwtRefreshSecret: env.JWT_REFRESH_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  jwtRefreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  cookieSecure: env.COOKIE_SECURE,
  cookieSameSite: env.COOKIE_SAME_SITE,
  cookieDomain: env.COOKIE_DOMAIN,
  notificationServiceUrl,
};
export default config;
