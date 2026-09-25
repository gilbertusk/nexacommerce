import type { Config } from 'jest';

const config: Config = {
  rootDir: '.',
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
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
  },
  setupFiles: ['<rootDir>/tests/setup.ts'],
};

export default config;
