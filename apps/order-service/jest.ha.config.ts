import type { Config } from 'jest';
import live from './jest.live.config';

/** Order Service on the HA staging cluster (infra/ha). `npm run test:ha`. */
const config: Config = {
  ...live,
  roots: ['<rootDir>/tests/ha'],
  testMatch: ['**/*.ha.test.ts'],
  setupFiles: ['<rootDir>/tests/ha/ha-setup.ts', '<rootDir>/tests/setup.ts'],
  testTimeout: 300_000,
};

export default config;
