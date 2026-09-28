import type { Config } from 'jest';
import base from './jest.config';

/**
 * Live acceptance: real PostgreSQL (DATABASE_URL) and real RabbitMQ
 * (RABBITMQ_LIVE_URL, RABBITMQ_MANAGEMENT_URL, PHASE3_RABBITMQ_CONTAINER).
 * Run explicitly with `npm run test:live`.
 */
const config: Config = {
  ...base,
  roots: ['<rootDir>/tests/live'],
  testMatch: ['**/*.live.test.ts'],
  testPathIgnorePatterns: ['/node_modules/'],
  setupFiles: ['<rootDir>/tests/live/live-setup.ts', ...((base.setupFiles as string[]) ?? [])],
  testTimeout: 180_000,
};

export default config;
