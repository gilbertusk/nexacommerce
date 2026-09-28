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

Integration tests run against **live** infrastructure. They are written to fail, not skip, when a
dependency is unreachable: a suite that passes with no database proves nothing, and for a while this
repository had several that did exactly that.

### 3.1 What each service expects

Every service's `tests/setup.ts` defaults to one shared database with a **schema per service**:

```
postgresql://postgres:postgres123@localhost:5445/nexacommerce_db?schema=<service>_test
```

Schemas: `auth_test`, `user_test`, `product_test`, `inventory_test`, `order_test`, `payment_test`,
`voucher_test`, `shipping_test`, `review_test`, `notification_test`, `analytics_test`.

Redis is expected at `localhost:6379` **without a password**, and Kafka at `localhost:9092`.
`DATABASE_URL` is only a default (`??=`), so an explicit environment variable always wins.

### 3.2 Start the infrastructure

```bash
docker compose up -d postgres redis rabbitmq kafka
```

The Compose PostgreSQL must use the password above, or every integration suite fails to connect.
CI uses the same values, so nothing needs reconfiguring between the two.

### 3.3 Deploy migrations into every test schema

A schema with no tables is as useless as no database:

```bash
for entry in auth:auth_test user:user_test product:product_test inventory:inventory_test \
             order:order_test payment:payment_test voucher:voucher_test shipping:shipping_test \
             review:review_test notification:notification_test analytics:analytics_test; do
  svc="${entry%%:*}"; schema="${entry##*:}"
  DATABASE_URL="postgresql://postgres:postgres123@localhost:5445/nexacommerce_db?schema=${schema}" \
    npx prisma migrate deploy --schema="apps/${svc}-service/prisma/schema.prisma"
done
```

### 3.4 Run the tests

```bash
npm test                                  # every workspace
npm test --workspace=apps/order-service   # one workspace
```

### 3.5 Why every service runs `jest --runInBand`

Jest's default parallel workers each open their own database pool and broker connection. Against a
single local PostgreSQL that exhausts connections and suites time out — auth-service took over 270
seconds and failed before this was changed, and passes in about 4 seconds serialised. All 14
services therefore run `--runInBand`.

### 3.6 Closing connections

An integration suite that imports the service's Express app opens a Prisma pool, and Cart Service
opens an ioredis connection. Both must be closed or Jest hangs:

```typescript
afterAll(async () => {
  await prisma.$disconnect();
});
```

No suite in this repository relies on `--forceExit`. If one starts hanging, find the open handle;
forcing the exit hides the leak and can truncate in-flight work.

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

## Live broker acceptance (Phase 3)

`npm test` never needs RabbitMQ or Redis. The live suites are separate and **fail instead of
skipping** when their configuration is missing:

| Command | Needs | Covers |
|---|---|---|
| `npm run test:live -w packages/common` | `RABBITMQ_LIVE_URL`, `RABBITMQ_MANAGEMENT_URL`, `PHASE3_RABBITMQ_CONTAINER` | quorum topology, audit, classic-to-quorum migration, poison DLQ, retry budget, failed-forward requeue, crash before ack, broker restart, consumer reconnect |
| `npm run test:live -w apps/order-service` | the above plus `DATABASE_URL` (migrated order schema) | duplicate delivery, crash after commit before ack, backlog after restart, `OrderCreated` through a broker outage |
| `npm run test:live -w apps/api-gateway` | `REDIS_LIVE_URL`, `PHASE3_REDIS_CONTAINER` | atomic cross-replica limits, TTL, namespaces, outage 503, reconnect, restart |

`npm run test:live` at the root runs all three. Each RabbitMQ suite creates and deletes its own
vhost; the Redis suite deletes its own key namespace; container control is restricted to names
starting with `phase3-test-`. Setup commands are in `docs/phase-3-reliability.md`.
