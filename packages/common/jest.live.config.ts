import type { Config } from 'jest';
import base from './jest.config';

/** Live broker acceptance suites. Run explicitly with `npm run test:live`. */
const config: Config = {
  ...base,
  testMatch: ['<rootDir>/tests/live/**/*.live.test.ts'],
  testPathIgnorePatterns: ['/node_modules/'],
  moduleNameMapper: {
    ...(base.moduleNameMapper as Record<string, string>),
    '^@nexacommerce/test-utils$': '<rootDir>/../test-utils/src/index.ts',
  },
};

export default config;
