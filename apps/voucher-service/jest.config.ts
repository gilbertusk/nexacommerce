import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  restoreMocks: true,
  testTimeout: 30000,
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: './tsconfig.json' }],
  },
  moduleNameMapper: {
    '^@nexacommerce/common$': '<rootDir>/../../packages/common/src/index.ts',
    '^@nexacommerce/logger$': '<rootDir>/../../packages/logger/src/index.ts',
    '^@nexacommerce/config$': '<rootDir>/../../packages/config/src/index.ts',
    '^@nexacommerce/validation$': '<rootDir>/../../packages/validation/src/index.ts',
    '^@nexacommerce/event-contracts$': '<rootDir>/../../packages/event-contracts/src/index.ts',
    '^@nexacommerce/types$': '<rootDir>/../../packages/types/src/index.ts',
    '^@nexacommerce/test-utils$': '<rootDir>/../../packages/test-utils/src/index.ts',
  },
  setupFiles: ['<rootDir>/tests/setup.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/server.ts', '!src/generated/**'],
  coverageDirectory: 'coverage',
};

export default config;
