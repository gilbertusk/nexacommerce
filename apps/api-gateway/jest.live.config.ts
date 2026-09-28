import type { Config } from 'jest';
import base from './jest.config';

/**
 * Live Redis acceptance (REDIS_LIVE_URL, PHASE3_REDIS_CONTAINER).
 * Run explicitly with `npm run test:live`.
 */
const config: Config = {
  ...base,
  testMatch: ['<rootDir>/tests/live/**/*.live.test.ts'],
  testPathIgnorePatterns: ['/node_modules/'],
  testTimeout: 120_000,
};

export default config;
