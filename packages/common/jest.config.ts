import type { Config } from 'jest';

const config: Config = {
  rootDir: '.',
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '../../tsconfig.base.json' }],
  },
  moduleNameMapper: {
    '^@nexacommerce/event-contracts$': '<rootDir>/../event-contracts/src/index.ts',
  },
};

export default config;
