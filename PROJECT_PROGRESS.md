# NexaCommerce Project Progress

Last updated: 2026-09-23  
Baseline commit: `dc9706f` (`feat: initial commit of Stage 2 codebase`)  
Active branch: `master`

## Current Status

| Item | Status |
|---|---|
| Phase 0 - Baseline and production-readiness audit | Complete |
| Phase 1 - Security and payment hardening | Complete (local acceptance) |
| Phase 2 - Product completion and real frontend integration | Not started |
| Phase 3 - Redis and RabbitMQ reliability | Not started |
| Phase 4 - Kafka event streaming | Not started |
| Phase 5 - Production infrastructure and operations | Not started |
| Phase 6 - Production acceptance and limited beta | Not started |

Phase 0 completion: **100%**.  
Phase 1 completion: **100% for local implementation and static acceptance**.  
Estimated public-production readiness: **40%**.

The readiness estimate measures production safety, not the number of screens or source files. The repository has broad feature scaffolding, but critical security, payment, migration, integration-test, messaging-reliability, backup, and operational gates remain open.

## Phase 0 Evidence

- 13 backend applications, including the API Gateway.
- 141 declared service routes.
- 42 Prisma models across 11 database-backed services.
- 16 RabbitMQ event contracts, 16 routing keys, and 9 queues.
- 3 Next.js frontends with 46 page routes.
- 20 backend test files and 1 frontend test file.
- Only Auth Service has a checked-in Prisma migration; the other database-backed services have none.
- The full workspace build passes.
- Available backend unit tests pass: 62 tests.
- Customer Web tests pass: 5 tests.
- Workspace lint fails in Customer Web and Seller Dashboard.
- The full test command does not pass and can hang because of open handles.
- Production dependency audit reports 11 vulnerabilities: 1 critical, 5 high, and 5 moderate.
- Docker is available locally, but no NexaCommerce containers were running during the baseline. Database, broker, Midtrans, concurrency, backup, and deployment behavior are therefore not runtime-proven.
- Git working tree contained 52 tracked changes and 141 untracked entries before Phase 0 documentation was added. These pre-existing changes were preserved.

Detailed evidence is recorded in [docs/phase-0-baseline.md](docs/phase-0-baseline.md).

## Phase 1 Evidence

- Public registration cannot select a privileged role; the server assigns `CUSTOMER`.
- Access and refresh tokens are held in HttpOnly cookies rather than browser-readable persistence.
- Refresh, password-reset, and email-verification tokens are hashed at rest and never returned by public APIs.
- Auth-to-Notification email delivery is authenticated internally; stored email-log data redacts action URLs and tokens.
- Gateway caller identity headers are stripped and rebuilt only from a verified JWT cookie/bearer token.
- Internal service endpoints require an authenticated service name and shared secret and fail closed in production.
- Payment, shipping, inventory, product, order, return, review, voucher, notification, and address object authorization was hardened.
- Midtrans runtime mock paths were removed. Webhooks now validate signature, merchant, order, exact amount, status, fraud state, terminal-state transitions, and poisoning-resistant idempotency.
- Production Compose requires database, Redis, RabbitMQ, JWT, internal-service, Midtrans, SMTP, CORS, and customer-web configuration.
- Full workspace build passes.
- Backend unit tests pass: 73 tests.
- Security-focused integration suites pass locally; database-backed success paths remain unproven without PostgreSQL.
- Customer Web tests pass: 5 tests.
- Full and production-only npm audits report 0 vulnerabilities.
- Production Compose configuration renders successfully with required test values.
- Workspace lint still fails on 18 pre-existing React errors: 9 in Customer Web and 9 in Seller Dashboard.
- No live PostgreSQL, Redis, RabbitMQ, SMTP, Midtrans sandbox, container-stack, concurrency, or deployment acceptance was performed.

Detailed evidence is recorded in [docs/phase-1-security-hardening.md](docs/phase-1-security-hardening.md).

## Phase Gates

### Phase 1 - Security and Payment Hardening

Exit criteria:

- Public registration cannot assign privileged roles.
- Authentication tokens are not persisted in browser-accessible storage.
- Password-reset and email-verification tokens are not returned by public APIs and are stored hashed.
- Every ID-based protected endpoint enforces object ownership or explicit administrative authority.
- Midtrans mock signature and production mock fallback are removed.
- Payment webhook validation checks signature, order, amount, merchant, status, fraud status, and idempotency.
- Production services fail to start when required secrets are absent.
- CORS, security headers, payload limits, rate limiting, and audit logging are configured.
- Critical and high production dependency vulnerabilities are resolved or explicitly risk-accepted with evidence.
- Security-focused unit and integration tests pass.

### Phase 2 - Product Completion

Exit criteria:

- Customer Web no longer uses mock catalog, voucher, cart, checkout, or payment data.
- Customer, seller, and admin frontends use versioned backend contracts.
- Registration, verification, login, catalog, cart, checkout, payment, shipping, return/refund, notification, and review flows pass end-to-end tests.
- Backend remains authoritative for price, discount, shipping fee, stock, and payment state.
- Production media storage and upload validation are implemented.
- Product, seller, review, return, and complaint moderation flows are complete.

### Phase 3 - Redis and RabbitMQ Reliability

Exit criteria:

- Redis responsibilities are limited to sessions, cart, cache, distributed rate limiting, and short-lived coordination data.
- RabbitMQ uses durable topology, quorum queues where appropriate, publisher confirms, manual acknowledgements, bounded retries, and dead-letter queues.
- Database changes and published messages are coordinated through transactional outbox records.
- Consumers use inbox/deduplication records and idempotent handlers.
- Poison-message, broker-restart, duplicate-message, and consumer-crash tests pass.

### Phase 4 - Kafka Event Streaming

Exit criteria:

- Kafka has a documented boundary separate from RabbitMQ.
- Kafka carries replayable business facts for analytics, audit, search indexing, and future recommendations.
- Topics, keys, partitions, retention, compaction, schema versions, and consumer groups are documented.
- Producers use the outbox pipeline; consumers are idempotent.
- Replay, duplicate delivery, partition ordering, consumer restart, and broker failure tests pass.
- No business workflow depends on publishing the same message independently to RabbitMQ and Kafka without a durable coordination mechanism.

### Phase 5 - Production Infrastructure

Exit criteria:

- Every Prisma schema has reviewed migration history and deploy automation.
- CI runs real lint, type checking, unit, integration, build, dependency, and container checks.
- Deployments use immutable images, readiness checks, rollback, and a no-data-loss migration sequence.
- TLS, secret management, network isolation, non-root containers, resource limits, and production credentials are configured.
- Centralized logs, correlation IDs, metrics, tracing, dashboards, and actionable alerts are operating.
- PostgreSQL backup, point-in-time recovery, and restore drills are proven.

### Phase 6 - Production Acceptance

Exit criteria:

- Real PostgreSQL, Redis, RabbitMQ, Kafka, and Midtrans sandbox end-to-end tests pass.
- Stock and voucher concurrency tests pass repeatedly without oversell or duplicate redemption.
- Load, soak, recovery, security, and disaster-recovery tests meet agreed targets.
- Privacy, PSE/PMSE, consumer complaint, retention, deletion, and incident-response requirements receive business/legal acceptance.
- A limited beta completes without unresolved severity-1 or severity-2 defects.

## Immediate Next Step

Begin Phase 2 by removing remaining frontend mock data and fallback behavior, aligning versioned frontend/backend contracts, and proving the core customer/seller/admin flows end to end. Do not add Kafka before the Phase 3 RabbitMQ and Redis reliability baseline is accepted.
