# Phase 0 Baseline - NexaCommerce

Date: 2026-09-23  
Scope: source inventory, Git baseline, architecture map, validation baseline, risk register, and phase acceptance gates.  
Behavioral code changes: none.

## 1. Executive Conclusion

NexaCommerce has a substantial e-commerce implementation and passes a full TypeScript/Next.js production build. It is suitable for continued development and controlled staging, but it is not ready for public production use.

The largest gaps are not the number of features. They are privileged-role registration, payment mock bypasses, exposed recovery tokens, inconsistent object authorization, frontend mocks, incomplete migration history, unreliable cross-service publishing, insufficient tests, vulnerable dependencies, and missing production operations.

## 2. Git Baseline

| Property | Observed value |
|---|---|
| Branch | `master` |
| HEAD | `dc9706f` |
| HEAD subject | `feat: initial commit of Stage 2 codebase` |
| Tracked modified/deleted entries | 52 |
| Untracked entries | 141 |
| Total status entries before Phase 0 docs | 193 |
| Configured Git remote | None returned by `git remote -v` |

The working tree was already heavily modified before Phase 0. No existing file was reset, deleted, staged, committed, or rewritten by this phase.

The CI workflows target `main` and `develop`, while the local branch is `master`. This must be resolved deliberately instead of renaming or merging implicitly.

## 3. System Inventory

### Backend services

| Service | Port | Declared routes | Prisma models | Test files | Migration directories |
|---|---:|---:|---:|---:|---:|
| API Gateway | 3000 | Gateway/proxy routes | 0 | 0 | 0 |
| Auth Service | 3001 | 14 | 5 | 2 | 1 |
| User Service | 3002 | 16 | 3 | 1 | 0 |
| Product Service | 3003 | 21 | 4 | 2 | 0 |
| Cart Service | 3004 | 7 | 0 | 1 | 0 |
| Order Service | 3005 | 13 | 3 | 2 | 0 |
| Payment Service | 3006 | 5 | 4 | 2 | 0 |
| Inventory Service | 3007 | 12 | 3 | 2 | 0 |
| Voucher Service | 3008 | 14 | 2 | 2 | 0 |
| Shipping Service | 3009 | 11 | 4 | 2 | 0 |
| Review Service | 3010 | 13 | 4 | 1 | 0 |
| Notification Service | 3011 | 6 | 3 | 1 | 0 |
| Analytics Service | 3012 | 9 | 7 | 2 | 0 |
| **Total** |  | **141** | **42** | **20** | **1** |

API Gateway proxy declarations are implemented in `apps/api-gateway/src/app.ts` rather than `*.routes.ts`, so they are not included in the 141 route count.

### Frontends

| Frontend | Page routes | Test files |
|---|---:|---:|
| Admin Dashboard | 15 | 0 |
| Customer Web | 17 | 1 |
| Seller Dashboard | 14 | 0 |
| **Total** | **46** | **1** |

### Data and infrastructure

- PostgreSQL 16 is the intended durable source of truth.
- Eleven services have independent Prisma schemas in one PostgreSQL database.
- Redis is used for cart/cache-oriented behavior.
- RabbitMQ uses the `nexacommerce.events` topic exchange.
- The repository defines 16 routing keys, 16 TypeScript event interfaces, and 9 queues.
- Kafka is not currently present in application code or Compose configuration.
- Docker Compose defines PostgreSQL, Redis, RabbitMQ, the API Gateway, and twelve domain services.

## 4. Current Messaging Map

The existing RabbitMQ contracts cover:

- order created, paid, cancelled, shipped, delivered, and completed;
- payment created, success, failed, and expired;
- stock reserved, reservation failed, confirmed, released, and low-stock detection;
- review created.

The current topology routes messages to Order, Inventory, Analytics, Notification, Shipping, and Product consumers.

Reliability gaps:

- publishers use normal channels without publisher confirms;
- database commits and message publication are separate operations;
- transactional outbox and consumer inbox tables are absent;
- failed consumers requeue indefinitely;
- bounded retry and dead-letter topology are absent;
- most handlers do not have durable deduplication evidence;
- event interfaces lack a consistent schema-version, correlation, and causation envelope.

Planned boundary:

- Redis: session, cart, cache, rate limiting, ephemeral coordination;
- RabbitMQ: commands and immediate work queues;
- Kafka: replayable committed business facts for analytics, audit, indexing, and future stream processing;
- PostgreSQL: authoritative business state.

## 5. Validation Baseline

| Check | Result | Evidence/limitation |
|---|---|---|
| `npm run build` | Pass | All backend packages and three Next.js frontends built successfully. |
| Backend unit tests | Pass for available tests | 62 tests passed. Cart, Notification, Review, and User report no unit tests. Jest required `--forceExit`, indicating possible open handles. |
| Customer Web tests | Pass | 5 Vitest tests passed. |
| Workspace lint | Fail | Admin: 0 errors/3 warnings. Customer: 9 errors/7 warnings. Seller: 9 errors/2 warnings. |
| Workspace typecheck command | Not effective | No workspace defines a `typecheck` script; the root command exits successfully without checking source. Builds currently provide the meaningful TypeScript compile check. |
| Full test command | Fail/incomplete | Analytics integration: 7 failures; Auth integration: 1 failure; Cart integration: 5 failures and an open handle. Remaining workspaces were not reached before the hung runner was terminated. |
| Production dependency audit | Fail | 11 vulnerabilities: 1 critical, 5 high, 5 moderate across 229 production dependencies. |
| Docker availability | Pass | Docker Server 29.7.2 responded. |
| Compose runtime | Not run | No NexaCommerce containers were running. SMTP variables were unset and Compose reported obsolete `version` fields. |
| PostgreSQL/Redis/RabbitMQ integration | Not proven | No live integration acceptance run was performed. |
| Midtrans sandbox | Not proven | No real external payment credentials or callback were exercised. |
| Concurrency/oversell | Not proven | No repeated real PostgreSQL parallel reservation test was performed. |
| Backup/restore | Not proven | No backup artifact or restore drill is present. |

## 6. Production Blockers

### P0 - security and financial integrity

1. Public registration accepts privileged roles, including `ADMIN`.
2. Email verification and password-reset tokens are returned in API responses.
3. Frontends persist bearer tokens in JavaScript-accessible storage/cookies.
4. Payment webhook accepts `mock-signature`.
5. Payment creation falls back to mock data when Midtrans fails.
6. Payment and shipping object-ownership checks are incomplete.
7. Internal service identity is asserted through spoofable headers without authenticated service identity.
8. Services and Compose contain development-secret fallbacks.
9. CORS is permissive and application security headers are absent.
10. Production dependency audit contains critical and high vulnerabilities.

### P1 - correctness and completeness

1. Customer catalog, cart voucher, and fallback payment behavior still contain mock paths.
2. Only one database service has checked-in migration history.
3. Integration tests do not pass and are not a reliable CI gate.
4. Several service health endpoints always return `UP` without dependency checks.
5. RabbitMQ publication is not transactionally coordinated with database changes.
6. Refund, return, dispute, seller verification, real shipping, and production media workflows require end-to-end acceptance.

### P2 - operations and governance

1. Deployment stops the current stack before rebuilding and has no automated rollback.
2. CI can silently ignore Prisma setup failures through `|| true`.
3. Backend lint/typecheck gates are absent.
4. Centralized metrics, tracing, correlation IDs, and alerting are absent.
5. Backup/PITR, restore drills, retention, and disaster-recovery objectives are undefined.
6. Privacy, PSE/PMSE, consumer complaint, and incident-response acceptance are not documented.

## 7. Acceptance Strategy

Each later phase must provide:

- exact changed-file list;
- tests and commands executed;
- successful and failed outcomes;
- unresolved blockers;
- explicit separation between local validation and real runtime/deployment evidence;
- rollback or recovery notes for material data/infrastructure changes;
- an updated `PROJECT_PROGRESS.md` entry.

No phase is complete merely because code compiles. Security, payment, concurrency, broker reliability, migrations, backup, and deployment require their own evidence.

## 8. Phase 1 Entry Point

Phase 1 should start in this order:

1. Remove role selection from public registration.
2. Remove the payment mock-signature bypass and production fallback.
3. Stop returning reset/verification tokens to public clients.
4. Replace browser-accessible token persistence.
5. Enforce object-level authorization in Payment and Shipping.
6. Replace service-identity headers with authenticated internal calls.
7. Fail closed on missing production secrets.
8. Update vulnerable dependencies and add security regression tests.

Kafka work must wait until these P0 gates and the RabbitMQ delivery baseline are accepted.
