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
  KAFKA_BROKERS: z.string().default('localhost:9092'),
  KAFKA_CLIENT_ID: z.string().default('nexacommerce-analytics'),
  KAFKA_TOPIC_PREFIX: z.string().default('nexacommerce'),
  KAFKA_PROJECTION_GROUP_ID: z.string().default('analytics-daily-projection-v1'),
  ANALYTICS_DAILY_READ_MODEL: z.enum(['RABBITMQ', 'KAFKA']).default('RABBITMQ'),
  ANALYTICS_KAFKA_CUTOVER_WINDOW_DAYS: z.preprocess(
    (v) => (v ? parseInt(v as string, 10) : undefined),
    z.number().int().min(1).max(366).default(30),
  ),
  ANALYTICS_RABBITMQ_CONSUMER_ENABLED: z.enum(['true', 'false']).default('true'),
}).superRefine((value, ctx) => {
  if (value.ANALYTICS_DAILY_READ_MODEL === 'RABBITMQ' && value.ANALYTICS_RABBITMQ_CONSUMER_ENABLED === 'false') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['ANALYTICS_RABBITMQ_CONSUMER_ENABLED'],
      message: 'RabbitMQ consumer cannot be disabled while RabbitMQ is the daily read model',
    });
  }
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
  kafkaBrokers: env.KAFKA_BROKERS.split(',').map((b) => b.trim()).filter(Boolean),
  kafkaClientId: env.KAFKA_CLIENT_ID,
  kafkaTopicPrefix: env.KAFKA_TOPIC_PREFIX,
  kafkaProjectionGroupId: env.KAFKA_PROJECTION_GROUP_ID,
  dailyReadModel: env.ANALYTICS_DAILY_READ_MODEL,
  kafkaCutoverWindowDays: env.ANALYTICS_KAFKA_CUTOVER_WINDOW_DAYS,
  rabbitMqConsumerEnabled: env.ANALYTICS_RABBITMQ_CONSUMER_ENABLED === 'true',
};

export default config;
