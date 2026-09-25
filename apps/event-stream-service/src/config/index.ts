import path from 'path';
import dotenv from 'dotenv';
import { z } from 'zod';
import { validateEnv } from '@nexacommerce/config';
import { assertProductionSecret } from '@nexacommerce/common';

dotenv.config({ path: path.join(__dirname, '../../../../.env') });
dotenv.config();

const envSchema = z.object({
  PORT: z.preprocess((value) => value ? parseInt(value as string, 10) : undefined, z.number().int().positive().default(3013)),
  RABBITMQ_URL: z.string().default('amqp://guest:guest@localhost:5672'),
  KAFKA_BROKERS: z.string().default('localhost:9092'),
  KAFKA_CLIENT_ID: z.string().default('nexacommerce-event-stream'),
  KAFKA_TOPIC_PREFIX: z.string().regex(/^[a-z0-9._-]+$/).default('nexacommerce'),
  KAFKA_REPLICATION_FACTOR: z.preprocess((value) => value ? parseInt(value as string, 10) : undefined, z.number().int().positive().default(1)),
  KAFKA_BRIDGE_RETRY_INTERVAL_MS: z.preprocess((value) => value ? parseInt(value as string, 10) : undefined, z.number().int().positive().default(10000)),
  KAFKA_BRIDGE_MAX_RETRIES: z.preprocess((value) => value ? parseInt(value as string, 10) : undefined, z.number().int().nonnegative().default(1000)),
});

const env = validateEnv(envSchema);
assertProductionSecret('RABBITMQ_URL', env.RABBITMQ_URL, ['amqp://guest:guest@localhost:5672']);

export const config = {
  port: env.PORT,
  rabbitmqUrl: env.RABBITMQ_URL,
  kafkaBrokers: env.KAFKA_BROKERS.split(',').map((broker) => broker.trim()).filter(Boolean),
  kafkaClientId: env.KAFKA_CLIENT_ID,
  kafkaTopicPrefix: env.KAFKA_TOPIC_PREFIX,
  kafkaReplicationFactor: env.KAFKA_REPLICATION_FACTOR,
  bridgeRetryIntervalMs: env.KAFKA_BRIDGE_RETRY_INTERVAL_MS,
  bridgeMaxRetries: env.KAFKA_BRIDGE_MAX_RETRIES,
};

if (config.kafkaBrokers.length === 0) {
  throw new Error('KAFKA_BROKERS must contain at least one broker');
}

export default config;
