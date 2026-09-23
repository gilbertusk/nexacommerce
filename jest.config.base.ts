import type { Config } from 'jest';

const baseConfig: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  restoreMocks: true,
  testTimeout: 30000,
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
  },
};

export default baseConfig;
