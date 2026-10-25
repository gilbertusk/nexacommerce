import type { Config } from 'jest';
import live from './jest.live.config';

/** HA staging acceptance (infra/ha). Run with `npm run test:ha`. */
const config: Config = {
  ...live,
  testMatch: ['<rootDir>/tests/ha/**/*.ha.test.ts'],
};

export default config;
