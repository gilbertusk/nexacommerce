import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  restoreMocks: true,
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: './tsconfig.json' }],
  },
  moduleNameMapper: {
    '^@nexacommerce/common$': '<rootDir>/../../packages/common/src/index.ts',
    '^@nexacommerce/logger$': '<rootDir>/../../packages/logger/src/index.ts',
    '^@nexacommerce/config$': '<rootDir>/../../packages/config/src/index.ts',
    '^@nexacommerce/event-contracts$': '<rootDir>/../../packages/event-contracts/src/index.ts',
  },
};

export default config;
