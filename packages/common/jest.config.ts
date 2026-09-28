import type { Config } from 'jest';

const config: Config = {
  rootDir: '.',
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  // Live broker suites need RabbitMQ/Redis and run via `npm run test:live`.
  testPathIgnorePatterns: ['/node_modules/', '/tests/live/'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '../../tsconfig.base.json' }],
  },
  moduleNameMapper: {
    '^@nexacommerce/event-contracts$': '<rootDir>/../event-contracts/src/index.ts',
    '^@nexacommerce/logger$': '<rootDir>/../logger/src/index.ts',
  },
};

export default config;
