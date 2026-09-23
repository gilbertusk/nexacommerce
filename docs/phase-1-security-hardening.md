# Phase 1 - Security and Payment Hardening

Date: 2026-09-23  
Status: Complete for local implementation and static acceptance  
Runtime qualification: Pending real PostgreSQL, SMTP, Midtrans sandbox, and deployed-environment tests

## 1. Outcome

Phase 1 closes the production-critical security defects identified in the Phase 0 baseline. Public registration can no longer assign privileged roles, authentication secrets are kept in HttpOnly cookies, recovery tokens are hashed and are no longer returned by public APIs, protected object mutations enforce ownership, and internal HTTP calls require a shared service credential.

The payment path now fails closed when Midtrans is unavailable or misconfigured. Webhooks validate signature, merchant, order, amount, status, fraud state, and a unique event key. Invalid callbacks cannot reserve the deduplication key of a valid callback, and a terminal payment state cannot regress to another terminal state.

This phase does not prove a production deployment. Its result is a locally compiled and tested security baseline for Phase 2.

## 2. Exit-Criteria Assessment

| Criterion | Result | Evidence |
|---|---|---|
| Registration cannot assign a privileged role | Pass | Strict registration schema; backend always assigns `CUSTOMER`; regression test rejects `ADMIN`. |
| Tokens are not persisted in browser-accessible storage | Pass | Access and refresh tokens are HttpOnly cookies; persisted frontend state contains only a non-secret session marker. |
| Recovery and verification tokens are not exposed | Pass | Public responses are generic; database lookups use SHA-256 token hashes; email logs redact URLs/tokens. |
| Recovery and verification email delivery exists | Pass locally | Auth calls a credentialed Notification endpoint; templates and secure action links are present. Real SMTP delivery is not yet proven. |
| Protected object access is authorized | Pass for reviewed routes | Payment, shipping, products, inventory reservations, orders, returns, reviews, vouchers, notifications, and user addresses were reviewed and hardened. Multi-seller whole-order mutations are rejected. |
| Internal service calls are authenticated | Pass | Incoming internal identity headers are stripped at the gateway; explicit internal routes require service name plus a constant-time checked token. |
| Payment mock bypasses are removed | Pass | No mock signature, mock transaction, or mock QRIS fallback remains in runtime payment code. |
| Webhook validation and idempotency | Pass locally | Signature, merchant ID, authoritative payment/order, exact decimal amount, status, fraud state, event uniqueness, poisoning resistance, and terminal-state rules are tested. |
| Production secrets fail closed | Pass statically | Placeholder JWT, missing internal token, and Ethereal SMTP are rejected in production; Compose uses required-variable interpolation. |
| Browser/API perimeter controls | Pass locally | Gateway Helmet headers, credentialed CORS allowlist, payload limits, origin checks, path-only logs, and rate limits are configured. |
| Critical/high dependency vulnerabilities | Pass | Both full and production-only npm audits report zero vulnerabilities at acceptance time. |
| Security regression tests | Pass locally | Auth, Inventory, Order, Payment, Shipping, and Notification security cases pass. |

## 3. Security Changes

### Authentication and browser session

- Public registration uses a strict schema and always creates a `CUSTOMER`.
- Access and refresh tokens are issued only through `HttpOnly` cookies.
- Refresh, reset, and verification tokens are hashed before persistence and lookup.
- Forgot-password and resend-verification responses do not reveal whether an account exists.
- Verification tokens are accepted only in a POST body, not an API query string.
- Logout clears cookies even when token revocation fails.
- Admin and seller proxies use the server-readable cookie only as an optimistic navigation check; backend authorization remains authoritative.

### Authorization and internal trust boundary

- The gateway removes caller-supplied `X-User-*` and `X-Internal-*` headers before proxying.
- Internal routes fail at startup in production when `INTERNAL_SERVICE_TOKEN` is absent.
- Normal role-protected routes no longer allow internal-header bypasses.
- Inventory reserve, confirm, and release routes accept only authenticated Order Service calls.
- Sellers cannot inject another `sellerId`, cancel whole orders, or mutate multi-seller order/shipping state.
- Payment and shipping reads enforce customer ownership or explicit administrative authority.
- Public shipment tracking returns a redacted tracking projection rather than the destination address.

### Payment integrity

- Midtrans transaction creation has no production fallback.
- Webhook signatures use SHA-512 and constant-time comparison.
- `MIDTRANS_MERCHANT_ID` is required and checked.
- Amount comparison uses exact decimal semantics.
- Webhook events have a unique database key and migration.
- Invalid signatures use different event keys, preventing deduplication poisoning.
- `PAID`, `FAILED`, and `EXPIRED` states cannot be overwritten by a later conflicting callback.
- Capture is considered paid only when `fraud_status=accept`; successful paid states require status code `200`.

### Email and secrets

- Notification exposes a credentialed Auth-only email endpoint.
- Verification and password-reset templates are seeded at startup.
- SMTP test credentials and plaintext credentials are never logged.
- Production refuses Ethereal/default SMTP configuration.
- Template data stored in email logs redacts token and URL fields.

## 4. Validation Evidence

| Command/check | Result | Limitation |
|---|---|---|
| `npm.cmd run build` | Pass | All backend packages and all three Next.js applications compile and build. |
| `npm.cmd run test:unit --workspaces --if-present -- --runInBand --forceExit` | Pass, 73 tests after the final payment and auth additions | Jest still needs `--forceExit`; open handles remain technical debt. |
| Auth tests | Pass, 28 tests | Integration cases log unavailable PostgreSQL and permit controlled database failure. |
| Inventory tests | Pass, 14 tests | No real concurrent reservation database test. |
| Order tests | Pass, 15 tests | No real cross-service checkout transaction. |
| Payment tests | Pass, 18 tests | No live Midtrans sandbox request or callback. |
| Product tests | Pass, 21 tests | Database-backed integration success path not proven. |
| Review tests | Pass, 7 tests | Database-backed integration success path not proven. |
| Shipping tests | Pass, 13 tests | Order-service ownership checks are mocked in unit tests. |
| Notification tests | Pass, 8 tests | No real SMTP delivery. |
| Customer Web Vitest | Pass, 5 tests | Does not cover an end-to-end browser session. |
| `npm.cmd audit --json` | Pass, 0 vulnerabilities | Registry snapshot as of the acceptance run. |
| `npm.cmd audit --omit=dev --json` | Pass, 0 vulnerabilities | Registry snapshot as of the acceptance run. |
| `docker compose --profile production config --quiet` | Pass | Static interpolation only; no images or containers were started. |
| Production fail-closed probes | Pass | Placeholder JWT, empty internal token, and Ethereal SMTP were rejected. |
| `npm.cmd run lint` | Fail | Pre-existing React lint debt remains: Customer Web 9 errors, Seller Dashboard 9 errors; Admin has warnings only. |

## 5. Remaining Boundaries

- PostgreSQL, Redis, RabbitMQ, SMTP, and Midtrans were not started or exercised as a real stack in this phase.
- Auth email dispatch is best-effort HTTP delivery. Transactional outbox, durable retry, dead-letter handling, and inbox deduplication belong to Phase 3.
- Gateway rate limiting is process-local. Redis-backed distributed rate limiting belongs to Phase 3.
- Internal authentication uses one shared secret, not per-service credentials or mTLS. Network isolation and stronger workload identity belong to Phase 5.
- The application still contains product-level mocks and incomplete frontend/backend flows identified for Phase 2.
- Database migrations remain incomplete across most services; only the new payment webhook migration was added here.
- Lint debt is unchanged as a release blocker even though it is outside the Phase 1 security acceptance scope.

## 6. Recorded Phase 1 Implementation Paths

The repository was already heavily dirty before Phase 1. Existing unrelated edits were preserved. Phase 1 work was confined to the following implementation areas:

- `.env.example`, `docker-compose.yml`, `docker-compose.override.yml`, `package.json`, and `package-lock.json`.
- `packages/common/src/security.ts`, `packages/common/src/index.ts`, and `packages/validation/src/auth.schema.ts`.
- API Gateway application, configuration, and package manifest.
- Auth application, configuration, controller, repository, routes, service, Swagger definition, and tests.
- Payment application, configuration, controller, routes, service, Prisma schema/migration, and tests.
- Shipping application, routes, service, controller, and tests.
- Notification application, configuration, controller, routes, email/notification services, and tests.
- Inventory routes, configuration, service call authentication, and tests.
- Order routes, service call authentication, authorization, and tests.
- Product controller, routes, configuration, service call authentication, and tests.
- Review routes, configuration, service call authentication, and tests.
- Cart, User, Voucher, and Analytics internal-call/configuration hardening.
- All service application entry points for CORS, payload limits, safe path logging, and Swagger spec route ordering.
- Customer, Admin, and Seller API clients, session stores, login contracts, and Next.js proxy files.

## 7. Next Phase

Proceed to Phase 2: remove remaining frontend mock paths, align versioned contracts, complete real product workflows, and add end-to-end acceptance tests. Kafka remains deferred until the RabbitMQ/Redis reliability phase is complete.
