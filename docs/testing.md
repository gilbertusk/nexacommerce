# Testing Guidelines

This document outlines the testing strategy, frameworks, mocking strategies, and local/CI integration procedures in NexaCommerce.

## 1. Testing Strategy

We separate testing into three main categories:
1. **Unit Tests:** Verify individual business functions and utility classes in isolation. Unit tests mock all external databases, HTTP calls, and message broker connections.
2. **Integration Tests:** Test HTTP endpoints and controllers against a live database instance. We use **Supertest** to simulate client HTTP requests.
3. **E2E Orchestration Tests:** Run comprehensive test scenarios (e.g., `test-stage4.js`, `test-stage6.js`) spanning multiple microservices to verify transaction flow, messaging cascades, and gateway routing.

---

## 2. Test File Structure

Each microservice contains a nested `tests/` directory:
```
apps/auth-service/
├── src/
└── tests/
    ├── setup.ts             # Jest database cleanups and hooks
    ├── unit/                # Unit test files (*.test.ts)
    └── integration/         # Integration test files (*.test.ts)
```

Shared test utilities and fixtures (e.g., test tokens, database transaction cleaners) are maintained in the `@nexacommerce/test-utils` package.

---

## 3. Local Test Environment Setup

Integration tests require a running database instance. We use the test database `nexacommerce_test_db` to prevent corrupting development data.

### Step 3.1: Start Test Infrastructure
Run only the database and cache infrastructure in Docker:
```bash
docker compose up -d postgres redis
```

### Step 3.2: Run All Tests
```bash
# Execute unit and integration tests across all workspaces
npm test
```

### Step 3.3: Run Specific Tests
```bash
# Run tests for a specific workspace (e.g. auth-service)
npm run test:auth

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

---

## 4. Mocking Strategy

### 4.1 Mocking RabbitMQ
To prevent tests from hanging on broker connections or publishing unexpected events, we mock `amqplib` connections. We inject a mock channel that stores published messages in memory:

```typescript
export const mockRabbitMQChannel = {
  assertExchange: jest.fn().mockResolvedValue({}),
  assertQueue: jest.fn().mockResolvedValue({ queue: 'test-queue' }),
  bindQueue: jest.fn().mockResolvedValue({}),
  publish: jest.fn().mockReturnValue(true),
  consume: jest.fn().mockResolvedValue({ consumerTag: 'test-tag' }),
  ack: jest.fn(),
  nack: jest.fn(),
};

jest.mock('amqplib', () => ({
  connect: jest.fn().mockResolvedValue({
    createChannel: jest.fn().mockResolvedValue(mockRabbitMQChannel),
    on: jest.fn(),
    close: jest.fn(),
  }),
}));
```

### 4.2 Mocking Prisma Databases
In unit tests, we mock the database client using `jest-mock-extended` to intercept queries:
```typescript
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '../../src/generated/client';

jest.mock('../../src/prisma/client', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));
```

---

## 5. Coverage Reports

Generate Jest test coverage reports across the entire monorepo:
```bash
npm run test:coverage
```
The reports are aggregated and output to the `/coverage` directory.
