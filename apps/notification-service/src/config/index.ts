import { validateEnv } from '@nexacommerce/config';
import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { assertProductionSecret } from '@nexacommerce/common';

dotenv.config({ path: path.join(__dirname, '../../../../.env') });
dotenv.config();

const notificationEnvSchema = z.object({
  PORT: z.preprocess((val) => val ? parseInt(val as string, 10) : undefined, z.number().default(3011)),
  DATABASE_URL: z.string(),
  RABBITMQ_URL: z.string().default('amqp://guest:guest@localhost:5672'),
  JWT_SECRET: z.string().default('supersecretjwtkey123'),
  AUTH_SERVICE_URL: z.string().default('http://localhost:3001'),
  ORDER_SERVICE_URL: z.string().default('http://localhost:3005'),
  PRODUCT_SERVICE_URL: z.string().default('http://localhost:3003'),
  REVIEW_SERVICE_URL: z.string().default('http://localhost:3010'),
  SMTP_HOST: z.string().default('smtp.ethereal.email'),
  SMTP_PORT: z.preprocess((val) => val ? parseInt(val as string, 10) : undefined, z.number().default(587)),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  SMTP_FROM: z.string().default('noreply@nexacommerce.com'),
  CUSTOMER_WEB_URL: z.string().url().default('http://localhost:3020'),
});

const env = validateEnv(notificationEnvSchema);
assertProductionSecret('RABBITMQ_URL', env.RABBITMQ_URL, ['amqp://guest:guest@localhost:5672']);
assertProductionSecret('JWT_SECRET', env.JWT_SECRET, ['supersecretjwtkey123']);
const smtpHost = assertProductionSecret('SMTP_HOST', env.SMTP_HOST, ['smtp.ethereal.email']);
const smtpUser = assertProductionSecret('SMTP_USER', env.SMTP_USER);
const smtpPass = assertProductionSecret('SMTP_PASS', env.SMTP_PASS);
const smtpFrom = assertProductionSecret('SMTP_FROM', env.SMTP_FROM, ['noreply@nexacommerce.com']);
const customerWebUrl = assertProductionSecret(
  'CUSTOMER_WEB_URL',
  env.CUSTOMER_WEB_URL,
  ['http://localhost:3020'],
);

export const config = {
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
  rabbitmqUrl: env.RABBITMQ_URL,
  jwtSecret: env.JWT_SECRET,
  authServiceUrl: env.AUTH_SERVICE_URL,
  orderServiceUrl: env.ORDER_SERVICE_URL,
  productServiceUrl: env.PRODUCT_SERVICE_URL,
  reviewServiceUrl: env.REVIEW_SERVICE_URL,
  customerWebUrl,
  smtp: {
    host: smtpHost,
    port: env.SMTP_PORT,
    user: smtpUser,
    pass: smtpPass,
    from: smtpFrom,
  },
};

export default config;
