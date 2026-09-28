import type { Config } from 'jest';

const config: Config = {
  rootDir: '.',
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  // Live Redis acceptance runs separately via `npm run test:live`.
  testPathIgnorePatterns: ['/node_modules/', '/tests/live/'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      isolatedModules: true,
      diagnostics: false,
      tsconfig: { target: 'ES2022', module: 'CommonJS', esModuleInterop: true },
    }],
  },
  moduleNameMapper: {
    '^@nexacommerce/common$': '<rootDir>/../../packages/common/src/index.ts',
    '^@nexacommerce/config$': '<rootDir>/../../packages/config/src/index.ts',
    '^@nexacommerce/logger$': '<rootDir>/../../packages/logger/src/index.ts',
    '^@nexacommerce/event-contracts$': '<rootDir>/../../packages/event-contracts/src/index.ts',
    '^@nexacommerce/test-utils$': '<rootDir>/../../packages/test-utils/src/index.ts',
  },
  setupFiles: ['<rootDir>/tests/setup.ts'],
};

export default config;
