# NexaCommerce Project Progress

- Last updated: 2026-09-28
- Baseline commit: `216a53d` (`first commit`)
- Active branch: `feat/phase-2-5-shipping-quotes-inbox-kafka`

Header correction (2026-09-25): this document previously recorded branch `master` at baseline
`dc9706f`. The actual checkout is branch `main` at `216a53d`, with a clean working tree; the
Phase 0-4 work that was previously uncommitted is contained in `216a53d`. No work was lost.

## Current Status

Updated 2026-09-28.

| Item | Status |
|---|---|
| Phase 0 - Baseline and production-readiness audit | Complete |
| Phase 1 - Security and payment hardening | Complete (local acceptance) |
| Phase 2 - Product completion and real frontend integration | In progress - checkout reopened on a server-issued shipping quote and physical return receipt is enforced before refund; remaining gates are business data, provider acceptance, and E2E |
| Phase 3 - Redis and RabbitMQ reliability | In progress - producer outboxes (including checkout finalization) and atomic inboxes implemented; live broker/Redis fault acceptance outstanding |
| Phase 4 - Kafka event streaming | In progress - database-backed Analytics projection implemented and proven on live Kafka + PostgreSQL; production cluster is external acceptance |
| Phase 5 - Production infrastructure and operations | In progress - migrations, backup/restore drill, request correlation, and CI verified; deployment target undecided |
| Phase 6 - Production acceptance and limited beta | Not started - requires environments and credentials that have not been supplied |

Phase 0 completion: **100%**.
Phase 1 completion: **100% for local implementation and static acceptance**.
Estimated local implementation completeness: **86%**.
Estimated public-production readiness: **59%**, up from 55%.

The readiness estimate measures production safety, not the number of screens or source files. The
increase reflects gates that moved from unproven to proven against live infrastructure: migrations
deploy from empty with no drift, the consumer-side inbox is exactly-once under real concurrency, the
Kafka projection commits offsets only after its transaction, shipping prices are server-authoritative
and single-use, and the database backup restores completely. The increase from 55% to 58% reflected
fleet-wide HTTP RED instrumentation plus the `OrderCreated` transactional-outbox boundary. The latest
increase to 59% reflects the implemented physical-return receipt gate, whose migration, atomic audit
write, authorization, and idempotent retry behavior pass on a clean PostgreSQL 16 database. The local
implementation estimate is now 86% because admins can manage audited courier/rate data and the paid
single-shipment label path uses its immutable quote snapshot. Public readiness stays at 59% because no
real tariffs were supplied, split-shipment label persistence remains unfinished, and RabbitMQ/Redis
fault acceptance, production monitoring delivery, deployment, provider credentials, browser E2E,
Midtrans sandbox, and Phase 6 acceptance remain open.

### What blocks each phase

| Phase | Blocker | Whose call |
|---|---|---|
| 2 | Admin origin/rate management is implemented, but no real seller origins or verified tariff rows were supplied; quoting therefore still fails closed for unconfigured routes | Business - enter and approve origins and tariffs |
| 2 | Paid single-seller labels use the quote snapshot; multi-seller orders are explicitly blocked because `shipping_orders` is still one row per order | Implementation - migrate to one shipment per seller and update fulfillment APIs/UIs |
| 2 | Production media storage acceptance | External - S3-compatible credentials |
| 3 | Live RabbitMQ and Redis fault acceptance (DLQ, broker restart, failover, cross-instance rate limiting) | Runtime acceptance - Docker Engine and broker ports are currently unavailable |
| 4 | Cutover comparison tooling is implemented; representative rebuild/comparison evidence is still required before reads move to Kafka | Runtime acceptance |
| 4 | Production cluster topology, TLS/SASL/ACLs, DR | External - no cluster provided |
| 5 | Deployment target undecided; HTTP RED metrics now cover all services and starter alert rules exist, but domain backlog metrics, tracing, collector/Alertmanager, dashboards, and live alert delivery remain | Decision, implementation, and runtime acceptance |
| 5 | PITR, RTO/RPO, offsite retention | External - needs a real environment |
| 6 | Everything - full-stack E2E, Midtrans sandbox, SMTP, load/soak/DR, legal approval | External |

Nothing above is marked complete on the strength of a passing build.

### 2026-09-28 continuation - verified shipping-rate administration

- Added ADMIN-only courier creation and shipping-rate list/create/update/delete APIs, OpenAPI
  coverage, and an Admin Dashboard `Tarif Pengiriman` screen. Inputs are normalized and audited;
  rates must use an active courier's configured service, positive integer gram/IDR values, and a
  unique courier/origin/destination/service/weight bracket.
- Added Shipping audit columns plus the route/bracket uniqueness migration. All four Shipping
  migrations deployed to a disposable PostgreSQL 16 database. The live integration suite passes
  20/20 and proves authorization, create/read/update/delete, public quote lookup, audit ownership,
  and duplicate rejection. Unit tests pass 41/41; Shipping typecheck/build and changed Admin lint
  and production build pass.
- Removed the legacy Jakarta origin/province fallback from paid-order label creation. Single-seller
  labels now use the consumed quote's immutable origin, weight, courier/service, and cost snapshot,
  so a later rate edit does not re-price a paid order. Missing or malformed snapshots fail closed.
- Multi-seller paid orders also fail closed at label creation because the legacy `shipping_orders`
  model still allows only one shipment per order. This prevents silently dropping a seller's parcel,
  but it is not split-fulfillment completion; the model, APIs, order handoff checks, and UIs still
  need a one-shipment-per-seller migration.
- No real seller origin or tariff was invented or retained. Business data entry, browser E2E, and
  warehouse/provider acceptance remain external gates, so public-production readiness stays 59%.

### 2026-09-26 continuation - Phase 4 cutover gate

- Added an ADMIN-only `GET /analytics/projections/daily/comparison` endpoint with an optional
  `startDate`/`endDate` window. It compares the RabbitMQ-owned daily report and Kafka-owned daily
  projection across the union of their dates.
- The gate checks orders, revenue, items sold, cancelled orders, and completed orders exactly;
  representation-only decimal differences such as `10` versus `10.00` are canonicalized to cents.
- A missing date on either source is a mismatch. Two empty sources return `NO_DATA` and
  `cutoverEligible: false`, preventing an unused projection from being accepted as cutover proof.
- Five focused comparison tests pass. The new authorization and invalid-date route cases pass;
  Analytics typecheck and build pass. The full Analytics run reports 27 passing tests and 24 live
  integration failures because PostgreSQL `localhost:5445` is offline; Kafka `localhost:9092` and
  Docker Engine are also unavailable. This is recorded as an environment blocker, not a code pass.
- Daily reads remain on `daily_sales_reports`. They will not be repointed until a representative
  replay has been compared over an approved window and the endpoint returns `MATCH` with
  `cutoverEligible: true`.
- Added a guarded read-model switch. `ANALYTICS_DAILY_READ_MODEL` defaults to `RABBITMQ`; requesting
  `KAFKA` makes Analytics repeat the comparison at startup and refuse to open its HTTP port on
  `MISMATCH` or `NO_DATA`. The legacy RabbitMQ analytics consumer can be retired independently only
  after cutover; configuration validation prevents disabling it while RabbitMQ remains the reader.
- The guarded-switch unit coverage passes 7/7; Analytics typecheck and build pass. Daily reads have
  not been switched because the local Docker Engine, PostgreSQL, RabbitMQ, and Kafka are offline.
- Workspace revalidation after the guarded switch: all 24 workspace typechecks pass; the first run
  exposed an existing Customer Web API-error test that used an `unknown` catch result without type
  narrowing, which is now fixed and covered 4/4. The full workspace production build passes. Root
  lint passes with 0 errors and the same 6 Google-font warnings. Compose production configuration
  renders with interpolation disabled, and `git diff --check` passes.

### 2026-09-26 continuation - Phase 5 Analytics observability slice

- Added an authenticated Prometheus text exporter at `GET /metrics` on Analytics Service. It exposes
  Kafka projection connectivity, projected/duplicate/rejected/failure counters, last event/error
  timestamps, per-partition lag, active daily read model, and RabbitMQ-consumer state.
- The endpoint requires the `prometheus` internal-service identity and shared token; unauthenticated
  requests receive 403. It does not expose the operations surface publicly.
- Added seven Prometheus-compatible starter rules for missing metrics, projection disconnect,
  transaction failures, sustained lag, schema/message rejection, API Gateway 5xx rate, and p95
  latency. Rejections/latency are warning-level; failures, disconnection, missing metrics, sustained
  lag, and elevated 5xx rate are critical.
- Exporter unit coverage passes 2/2 and focused route coverage passes 2/2. The alert file parses as
  YAML with seven rules. This is not live monitoring acceptance: no scraper, Alertmanager, dashboard,
  notification channel, or `promtool` runtime validation is available in the current environment.

### 2026-09-27 continuation - shared HTTP RED metrics

- Added a dependency-free shared HTTP metrics middleware in `@nexacommerce/common`. It records
  completed requests by service/method/bounded route/status, a cumulative duration histogram, and
  in-flight requests. UUID, numeric, Mongo-style, and long opaque path segments are normalized to
  prevent customer identifiers from creating unbounded Prometheus labels.
- Enabled it on API Gateway and Analytics. Both `GET /metrics` endpoints require the private
  `prometheus` internal identity. Gateway metrics are mounted before Redis-backed public rate
  limiting so a Redis outage does not hide the gateway's operational signal.
- Shared Common tests pass 22/22, including identifier normalization and cumulative buckets. API
  Gateway and Analytics typechecks pass after rebuilding Common first; the initial parallel check
  correctly failed against stale generated declarations and was not counted as validation.
- Final sequential validation passes: Common, API Gateway, and Analytics builds; all 24 workspace
  typechecks; authenticated/unauthenticated Analytics metrics route cases 2/2; seven-rule YAML
  parse; and `git diff --check`. No collector scrape or alert firing was runtime-tested.

### 2026-09-27 continuation - fleet-wide HTTP RED metrics

- Extended the shared HTTP request counter, duration histogram, and in-flight gauge to Auth, User,
  Product, Cart, Order, Payment, Inventory, Voucher, Shipping, Review, Notification, and Event Stream
  services. Together with API Gateway and Analytics this covers all 14 HTTP processes.
- Every `/metrics` route uses the authenticated `prometheus` internal-service identity and the shared
  token. It is not exposed through a public unauthenticated diagnostics route.
- Generalized the HTTP 5xx-rate and p95-latency starter alerts to evaluate independently per service
  label, while retaining the Analytics Kafka-specific alerts.
- Validation: Common package tests 22/22 and Event Stream tests 21/21, including authenticated and
  rejected metrics requests plus emitted service labels. All 24 workspace typechecks and the full
  production build pass; lint exits with 0 errors and the same 6 existing Google-font warnings.
  This is code-level proof only: no collector, scrape discovery, Alertmanager, dashboard, or live
  notification path was available.

### 2026-09-27 continuation - OrderCreated transactional outbox

- Defined the checkout saga boundary after inventory reservation, optional voucher application, and
  payment invoice creation have succeeded. Finalization sets `checkout_finalized_at`, writes a
  status-history marker, and inserts `OrderCreated` into `outbox_events` in one transaction.
- Removed the direct RabbitMQ publish from the checkout request path. A completed checkout can now
  return while RabbitMQ is unavailable; the existing leased dispatcher publishes the durable event
  later with confirms, exponential retry, and stale-claim recovery.
- `OrderCreated` uses the deterministic event/outbox id `order-created:<orderId>`, preventing an
  accidental second finalization from creating a second business fact. The migration backfills old
  rows to `created_at` so previously completed orders are not mistaken for interrupted checkouts.
- Validation: Order Service unit tests 55/55, typecheck and production build pass, Prisma Client
  generation succeeds, and the schema validates. Focused RabbitMQ reliability tests pass 6/6 and
  Redis rate-limit tests pass 4/4. A clean temporary PostgreSQL 16 cluster accepted all six Order
  migrations and the full suite passes 67/67. The new live integration cases prove finalization,
  history, and outbox commit together, and all roll back when the deterministic outbox insert
  conflicts. The temporary cluster was stopped and removed afterward.
- Docker Desktop still crashes before the Engine starts because its Windows `dockerInference`
  runtime socket cannot be accessed or removed. No factory reset was attempted. RabbitMQ/Redis
  restart, DLQ, cross-instance, and failover acceptance therefore remain open rather than inferred.

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

## Phase 2 Evidence

Phase 2 is in progress; the first customer catalog slice is implemented locally, but this phase is not complete.

- Customer homepage product and category data now comes from the existing `useProducts` and `useCategories` API hooks rather than `mockData`.
- Removed the fabricated flash-sale countdown and discount presentation because the current product API contract does not provide active promotion fields.
- Added product loading, API error, empty-catalog, category-error, and missing-image fallbacks.
- Added homepage tests for API-backed catalog rendering, API failure, and empty catalog.
- Customer Web tests pass: 8 tests. Customer Web production build passes. ESLint passes for the changed homepage and its test.
- Added server-cart hooks matching cart-service endpoints and corrected profile/address API hooks to use real service paths and PATCH semantics. After these changes, TypeScript passes, all 9 Customer Web tests pass, and focused lint passes for the changed API files.
- Cart/address UI has since been moved to backend APIs and the order hook targets `/orders/checkout`; submission remains blocked because there is no trusted server-side shipping quote. The Order Service now also rejects direct checkout API calls before side effects. Voucher preview accepts only a code and builds its validation inputs from the authenticated server cart plus current catalog products.
- Continued Phase 2: product detail and wishlist now add to the server cart; cart page/header use user-scoped server cart state; checkout reads server cart and persisted addresses and posts address data using the backend address schema. Cart mutations and account scoping are wired; guest cart is not migrated.
- Checkout order submission is deliberately disabled because no trusted route/weight shipping quote contract is implemented. The Order Service now fails closed instead of accepting browser-supplied shipping prices. Voucher discount preview is server-validated; final order application is also revalidated by Order Service.
- Latest Customer Web checks: TypeScript passes, all 10 tests pass, production build passes, and ESLint passes for the changed customer integration files. No live backend, Redis, browser E2E, or deployment test was run.
- An earlier Customer Web lint run found errors in verify-email and shop; both are now fixed, and the shop URL-sync effect has a narrowly scoped lint rationale.
- The API-backed homepage has not been exercised against a running product service/database, and no browser E2E acceptance was performed.
- Further Phase 2 contract fixes: payment page and order hooks now consume actual payment/order response shapes; they no longer show a fabricated QRIS or countdown. Seller order status/profile and user status use backend PATCH routes; seller analytics uses `/analytics/seller/dashboard`; inventory edits use stock-in/out ledger routes; seller reviews use `/reviews/seller/products` and no longer offer a nonfunctional reply action. Admin seller verification and review-report moderation target existing backend endpoints; admin analytics uses `/analytics/sellers/performance`.
- Seller verification now has a real persisted status field and migration because the previous service wrote a nonexistent database column. Tests cover ACTIVE/REJECTED lifecycle behavior. Seller profile form matches the service DTO and avoids pretending an unsupported bank-account field is persisted. Return approval now stays `RETURN_APPROVED` until a payment-provider refund actually succeeds; the customer detail UI can submit return requests.
- Revalidation after latest contract fixes: full monorepo build passes; full lint passes with 0 errors and 6 Google-font warnings. Removed two unused-router warnings and changed the order timeline payment instruction to avoid assuming QRIS. Customer Web suite passes 10/10; Order Service suite passes 17/17 (Jest reports a lingering startup-timer handle after tests); Analytics integration suite passes 8/8 after correcting its doubled `/analytics/analytics` test URLs. Analytics integration requests that require database-backed data still fall back to 500 because PostgreSQL at localhost:5445 is unavailable; tests currently tolerate that. The full monorepo test run was stopped because Cart Service kept retrying unavailable Redis at localhost:6379 and flooding logs. No DB/Redis runtime proof is claimed.
- Seller voucher creation no longer submits the unsupported `description` field. Backend voucher model supports code/type/value/limits/date/status but has no description column.
- Voucher preview was made server-authoritative: public validation no longer accepts browser-supplied line prices, category IDs, seller IDs, or quantities. Voucher Service loads the caller's Redis cart and current products through authenticated internal Cart/Product Service routes; checkout still revalidates independently. Scoped fixed discounts are capped at the eligible subtotal, not unrelated products. Voucher Service unit tests now cover trusted sourcing, empty carts, and scoped discount caps.
- Test stabilization: Cart integration tests now target `/cart` routes (not doubled `/cart/cart`) and test-mode Redis stops retrying an unavailable server indefinitely. User integration tests now target `/users`; Auth Service dependency failures surface as 502 when unavailable rather than misleading 400 responses.
- Review flow continuation: Customer Web now normalizes Review Service `customerName`/`content` fields to the view model expected by product detail. Authenticated users can report another customer's review with a validated reason and optional 500-character description; unauthenticated users get a login link back to the review tab. UI prevents self-reporting, and Review Service independently rejects self-reports, unsupported reasons, and overlong descriptions.
- Review validation: Customer Web tests pass 13/13, including review-contract normalization and report form submission/own-review guard; Review Service tests pass 10/10 (3 report-validation unit tests plus route tests). Review Service build, Customer Web build, and focused ESLint pass. Database-backed review routes still return tolerated failures when PostgreSQL is unavailable.
- Shipping copy cleanup: removed unsupported customer promises about a Jakarta Barat central warehouse, same-day dispatch, named courier ETAs, packaging, and breakage guarantees. The product shipping tab now states that rates/timelines are not yet confirmed and checkout is gated pending a server-validated route/weight quote. Removed the unused hard-coded customer shipping-rate mock list.
- Checkout security gate: Order Service rejects checkout before any network or database side effect until a trusted shipping quote is implemented and revalidated server-side. This prevents direct API clients from forging/understating browser-supplied `shippingCost`; checkout remains intentionally unavailable. A unit test verifies fail-closed behavior.
- Order complaint workflow: customers can submit one categorized complaint (damaged, missing, wrong, quality, other) for their own delivered/completed order; descriptions are bounded and duplicates are blocked including concurrent inserts, with unique-key races returned as conflicts. Admins have a paginated/filterable queue and can move complaints through `OPEN -> IN_REVIEW -> RESOLVED/REJECTED` with an audit note. Customer order detail displays submission/status, and admin orders links to a moderation page. Added an `order_complaints` migration and OpenAPI routes.
- Complaint UI verification: extracted the customer complaint panel into a component with direct UI tests for API submission/payload, existing complaint plus admin response display, and suppression for undelivered orders. The Customer Web suite is now 16/16; focused ESLint and Customer Web production build pass.
- Refund workflow slice: added an ADMIN-only Payment Service endpoint with UUID Idempotency-Key, positive integer amount/reason validation, paid/partial-paid and approved-return checks through authenticated Order Service calls, serializable refund reservation, cumulative cap against the original payment, and retry-safe Midtrans refund_key. A pending row remains PENDING after provider acceptance; ambiguous provider/network outcomes are not treated as success. Midtrans refund callbacks are verified against payment amount/signature and refund key; only a callback entry carrying `bank_confirmed_at` marks a refund PROCESSED. Confirmed partial/full sums update payment net status/revenue and call internal Order Service transitions to PARTIALLY_REFUNDED/REFUNDED. Admin Payments UI now submits/refetches refund operations and displays pending status/remaining refundable amount; customer order status labels include partial refund.
- Latest workspace validation (2026-09-24): root `npm.cmd test` exits 0; all reported service/frontend suites pass, including Customer Web 13/13 at the time of the root run, Payment 26/26, Order 28/28, Voucher 17/17, and Review 10/10. After adding complaint coverage, Customer Web's focused suite passes 16/16 and the complete Order Service suite passes 29/29 (21 unit tests) with `--forceExit`. Root `npm.cmd run build` exits 0 across services, packages, and all three Next.js apps; Customer Web was rebuilt successfully after the complaint component extraction. Root `npm.cmd run lint` exits 0 with 0 errors and 6 existing Google-font warnings; focused complaint UI ESLint passes. Order Service schema validation passes. DB-backed integration tests tolerate unavailable PostgreSQL/Redis responses, and Order Jest warns that a worker/timer needs forced exit; these are not runtime acceptance. Prisma generation wrote the new model types but failed replacing the Windows query-engine DLL (`EPERM`); TypeScript builds pass, but migrations/runtime remain unverified. `git diff --check` passes.
- Shipping safety follow-up: Shipping Service no longer inserts synthetic couriers/rates at startup. The root seed script skips its invented city/rate matrix unless `ALLOW_DEMO_SHIPPING_RATES=true` is explicitly set, and refuses that flag in production. Shipping order creation now rejects invalid weights/routes/inactive couriers and fails when no configured rate exists instead of inventing a Rp15,000 fee. Public quote requests reject non-integer gram weights. Shipping Service build passes and tests pass 17/17. PostgreSQL-backed route tests still log unavailable localhost:5445 and tolerate that failure; existing database rates could not be audited because DB is offline. Checkout remains closed until the marketplace chooses a fulfillment/origin model and supplies verified live rates/provider integration.
- Seller product creation contract fix: the create form now sends the required slug and category, collects positive integer product weight in grams, validates price/stock and HTTPS image URLs, and saves product images via the existing image API rather than silently including an ignored `images` property in the product-create payload. Product Service now rejects malformed, non-HTTPS, credential-bearing, or overlong image URLs server-side. Product Service tests pass 23/23 and build passes; Seller Dashboard production build passes. Product integration route tests still tolerate unavailable PostgreSQL at localhost:5445, so persistence was not exercised. This does not implement binary upload or permanent media storage; the UI discloses that limitation.
- Seller product edit contract fix: product weight is now displayed/updated; existing image relations are normalized from `{id,url,...}` records, and image add/update/delete operations use the actual image endpoints instead of an ignored product `images` field. Product fields are saved first, then image operations run sequentially; partial image failure is reported as such so the user is told to reload/reconcile rather than being shown a false full success. Seller Dashboard build passes after create/edit changes, and focused ESLint passes for both product forms. No live API/DB persistence or browser interaction was tested.
- Full workspace revalidation (2026-09-24, after seller-product and required-weight changes): root `npm.cmd test` exits 0; 217 tests pass across 13 suites/workspaces (backend service totals 201, Customer Web 16). Product Service is 24/24, including route checks that missing/fractional weight is rejected before DB access. The Order Service Jest worker still requires forced exit and DB-backed route tests tolerate PostgreSQL-unavailable failures; cart tests also tolerate unavailable Redis. Root `npm.cmd run lint` exits 0 with 0 errors and 6 existing Google-font warnings. Root `npm.cmd run build` exits 0 for all workspaces, including the three Next.js dashboards. `git diff --check` passes. No live database, Redis, Docker stack, Midtrans sandbox, or browser E2E was exercised.
- Review purchase binding: Order Service's internal eligibility response now returns the matching completed `orderId`, and Review Service rejects mismatched or missing IDs and persists only the ID returned by Order Service. Eligibility query parameters are built with URLSearchParams to prevent query-string injection. Focused Order eligibility tests pass 2/2; Review creation tests pass 3/3 (forged/missing IDs rejected before DB writes, valid binding persisted). Order and Review Service builds pass. This is a post-workspace slice; it has focused tests but no DB-backed or service-to-service runtime acceptance.
- Review privacy follow-up: public review attribution no longer stores the customer's email from `x-user-email`; it uses a neutral `Customer` label until a public display-name contract is wired. Controller unit test verifies email is not passed into review persistence. Review Service full suite passes 14/14; Order Service full suite passes 31/31 with `--forceExit` (the normal run exposes a lingering startup cron timer). Both service builds pass.
- Shipping hook safety: removed the customer rate-query hook's default guessed 500g weight; callers must now provide actual product/cart weight, and the query remains disabled for missing/invalid weight. Focused ESLint and Customer Web production build pass. The hook is not currently used by an active page, and actual quote/checkout wiring remains gated on the fulfillment model and verified rates.
- Refund validation: Payment Service tests pass 26/26, including admin route authorization, return eligibility, cap/idempotency validation, and bank-confirmed vs pending callback behavior. Payment Service and Order Service TypeScript builds pass; Admin Dashboard build and focused ESLint pass. A refunds-table migration was added. No live Midtrans sandbox or database-backed refund/webhook execution was tested; PostgreSQL is unavailable. Order Service has no baseline migration history, and Payment Service history lacks baseline table-creation migrations, so fresh-database migration deployment remains an infrastructure/schema gate. The platform also does not track physical return receipt; an admin must verify returned goods under the accepted business policy before requesting a refund.
- Full workspace baseline before the review/refund slices: `npm.cmd test` exited 0 with 171 backend tests and 10 Customer Web tests passing; full workspace build passed; full lint passed with 0 errors and 6 Google-font warnings. Latest review, refund, and customer changes have their own targeted test/build/lint results above. Caveat: DB-backed route tests tolerate 500 responses when PostgreSQL at localhost:5445 is unavailable, and Redis/PostgreSQL runtime, Docker, service-to-service runtime, and browser E2E acceptance remain unproven. The configured PostgreSQL endpoint localhost:5445 and Redis localhost:6379 are not listening; other local PostgreSQL instances were not used because they may be unrelated.
- At the 2026-09-24 checkpoint, remaining Phase 2 work included authoritative server-side shipping quotes and multi-seller fulfillment design, production media storage/upload validation, full customer/seller/admin integration/E2E coverage, and live service/payment acceptance. Order-level complaint intake/moderation was implemented locally but still needed database migration/runtime acceptance. Midtrans refund implementation was local-only and still needed sandbox proof and the physical-receipt step described in the newer entry below.
- Physical return receipt gate (2026-09-28): an ADMIN-only `POST /orders/{id}/return-receipt` command now changes `RETURN_APPROVED` to `RETURN_RECEIVED` and atomically records `returnReceivedAt`, `returnReceivedBy`, a bounded note, and `OrderStatusHistory`. The command is idempotent after success and uses a conditional status claim to reject concurrent/stale transitions. Payment Service rejects refund submission until both the receipt marker and an eligible receipt/refund status are present; provider callbacks remain the only path to `PARTIALLY_REFUNDED`/`REFUNDED`. Admin order detail can record and display the receipt, while Admin Payments and Customer Order UI explain the new gate/status. Order unit tests pass 58/58, Payment unit tests pass 23/23, and Order integration tests pass 15/15 on a disposable PostgreSQL 16 cluster after all seven migrations deployed successfully. Order/Payment typechecks and builds pass; Admin typecheck/build pass; Admin lint has 0 errors and 2 existing font warnings. Customer receipt-status UI tests pass 2/2, its typecheck/build pass, and focused lint passes. The temporary database was stopped and removed. Midtrans sandbox and browser E2E are still not proven.

Detailed evidence and next steps: [docs/phase-2-product-completion.md](docs/phase-2-product-completion.md).

Latest Phase 2 follow-up (2026-09-24): checkout UI tests now verify server-cart/address rendering, voucher-code-only server validation (success and failure), and that no order request can occur while trusted shipping validation is absent. Shipping-rate hook request eligibility is also regression tested for blank cities and invalid gram weights. Full Customer Web suite passes 26/26 across 9 files; Customer Web production build passes; focused ESLint passes for the new checkout test and shipping hook; `git diff --check` passes. These tests do not prove live service behavior or a successful checkout; the shipping hook remains unused by active checkout and trusted quote integration is unresolved.

Notification integration follow-up (2026-09-24): customer mark-as-read now uses the service's documented PATCH method. The previously nonfunctional delete action now has an authenticated owner-scoped DELETE endpoint (`deleteMany` filters by both notification ID and user ID), with 404 for missing/non-owned records; the phantom GET detail route was removed from OpenAPI and replaced by DELETE. Customer-store tests verify exact HTTP method/path and state updates (2/2); Notification Service unit/integration suites pass 14/14 and its TypeScript build passes. Full Customer Web suite passes 28/28 across 10 files and production build passes; focused ESLint passes. Notification route integration cases that access PostgreSQL still tolerate 500 because localhost:5445 is unavailable; no persisted delete/read was runtime-proven.

Notification list contract follow-up (2026-09-24): Notification Service now validates `page`, `limit` (1–100), and exact `isRead=true|false`; it returns the nested paginated envelope already consumed by customer notifications and computes filtered total plus owner-wide unread count. Repository pagination is server-side and unread count uses `count`, not loading every row. Controller unit coverage verifies consumer-compatible envelope/arguments and invalid-query rejection before storage; notification integration tests reject invalid query strings. Latest Notification Service tests pass 17/17 across 3 suites; Customer Web tests pass 29/29 across 10 suites with production build and focused ESLint passing. Notification state is scoped by owner ID; switching users clears the prior list immediately, and late responses/mutations from a prior account cannot overwrite the current account state. DB-backed list persistence/page ordering is still not runtime-verified because PostgreSQL is offline.

Seller/Admin notification follow-up (2026-09-24): Admin notification query cache keys now include admin ID and the badge consumes server-wide `unreadCount` instead of counting only the current page. Seller notifications now request server-side `page`, `limit`, and unread filtering, show navigation based on filtered total, use server-wide unread counts, and refetch after read mutations. They suppress prior-owner data and discard stale async responses/mutations after seller account changes. Focused ESLint and production builds pass for both Seller and Admin dashboards. No browser-based account-switch/pagination test or live notification API/database flow was run.

Fresh local dependency probe (2026-09-24): PostgreSQL `127.0.0.1:5445`, Redis `:6379`, RabbitMQ `:5672`, and Kafka `:9092` are unavailable; Docker Engine named pipe is absent. No unrelated database or alternate runtime was substituted. This confirms environment readiness blockers only; it is not service integration proof.

Order fulfillment transition hardening (2026-09-24): Order Service now enforces `PAID -> PROCESSING -> SHIPPED` or `PAID -> PROCESSING -> PACKED -> SHIPPED` and rejects arbitrary jumps, seller-set `DELIVERED`, and seller-set `COMPLETED`; delivered/completed remain on their dedicated shipping/customer pathways. Added success, skipped-transition, and terminal-state unit coverage. Full Order Service suite passes 35/35 (the database route suite logs expected PostgreSQL-unavailable errors and tolerates 500); TypeScript build passes. Service-level ESLint is unavailable because the service has no ESLint configuration. No live shipping/order runtime validation was performed.

Notification event presentation (2026-09-24): mapped service event types (`ORDER_CREATED/SHIPPED/DELIVERED/COMPLETED`, `PAYMENT_SUCCESS/FAILED`, `REVIEW_RECEIVED`, `LOW_STOCK`) to customer UI categories and registered their icons in Seller/Admin screens; formerly these event strings fell through to generic icons. Customer-store tests cover normalization for every documented notification type and real fetched records. Customer Web suite passes 36/36 across 10 files; all three frontend production builds and focused ESLint checks for changed dashboard files pass. No browser visual/E2E test was run.

Courier handoff integration (2026-09-24): Order Service now verifies the internal Shipping Service record, tracking number, and `PICKED_UP`/later shipment status before accepting `SHIPPED`. Seller order detail fetches shipment data, displays courier/tracking/status, advances `WAITING_PICKUP -> PICKED_UP`, then updates order status; it disables handoff when no registered tracking shipment exists. Added Order Service tests for tracked courier-handoff success, missing tracking rejection, not-yet-handed-off rejection, and kept the skip/terminal-state guards. Order Service tests pass 37/37; TypeScript build passes. Seller orders ESLint and Seller Dashboard production build pass. Added `SHIPPING_SERVICE_URL` to Order Service config and production Compose. DB-backed route tests still tolerate PostgreSQL-unavailable failures; no live Shipping/Order workflow was exercised. A tracking shipment itself can only be created when approved route/service/weight rates exist, so new checkout remains gated.

## 2026-09-25 Session Evidence

### Environment baseline

- Branch `main`, HEAD `216a53d`, working tree clean at session start.
- Node v24.15.0, npm 10.8.0, Docker 29.7.2.
- Pre-existing containers: `nexacommerce-rabbitmq` (healthy), `nexacommerce-kafka` (healthy),
  `nexacommerce-event-stream` (healthy). No NexaCommerce PostgreSQL or Redis container existed.
- Disposable `nexacommerce-postgres` (postgres:16-alpine, port 5445) and `nexacommerce-redis`
  (redis:7-alpine, port 6379) were created from empty volumes through the project's own Compose
  definitions using a scratchpad env file. Containers belonging to unrelated projects
  (`tbe-*`, `kilat-*`, `labelflow-*`) were not used and not modified. No volume was deleted.
- The repository `.env` is a stale 13-variable development file that lacks `POSTGRES_PASSWORD`,
  `INTERNAL_SERVICE_TOKEN`, and the media/Midtrans/SMTP variables that `.env.example` and
  `docker-compose.yml` require. It was left unmodified; live runs pass credentials explicitly.

### Phase 5 - migration gate verified against live PostgreSQL 16

First runtime proof for this gate. All 11 Prisma schemas were deployed from a genuinely empty
database, not from a pre-existing one.

- `prisma migrate deploy` from empty: **11/11 schemas applied, 24 migrations total**
  (auth 2, users 2, products 1, inventory 2, orders 4, payments 4, vouchers 1, shipping 2,
  reviews 2, notifications 2, analytics 2).
- `prisma migrate status`: **11/11 report "Database schema is up to date"**.
- `prisma validate`: **11/11 pass**.
- `prisma migrate diff --exit-code` (datasource vs datamodel): **11/11 report no drift**.
- `db push` was not used.

This closes the previously recorded blocker that Order Service had no baseline migration history
and Payment Service lacked baseline table creation; both now deploy cleanly from empty.

### Phase 3 - general database-backed atomic inbox implemented

The inbox pattern was previously **absent from the entire codebase** (no file, model, or migration
matched `inbox`), while the outbox existed in five services. The consumer-side partial-side-effect
window was therefore real and unmitigated: Analytics ran `saveEvent` -> handler mutations ->
`markEventProcessed` as three separate transactions, so a crash between the second and third
replayed the mutations on redelivery and double-counted revenue and order counters.

- Added `packages/common/src/inbox.ts`: a storage-agnostic `processWithInbox` runtime with an
  `InboxPort` seam, because each service generates its own Prisma client and there is no shared
  client type to depend on. Claim, business mutation, and the processed marker all run inside one
  caller-supplied transaction.
- Added `apps/analytics-service/src/messaging/inbox.ts`: the Prisma-backed adapter. Unique key is
  `(event_id, consumer)`; a lost concurrent claim surfaces as Prisma `P2002` and is read as a
  duplicate delivery rather than an error.
- Added the `InboxEvent` model and migration `20260925090000_add_analytics_inbox`.
- Refactored the Analytics projection into `prepareAnalyticsEvent` (HTTP enrichment, no writes) and
  `applyAnalyticsEvent` (writes only). Enrichment now runs **before** the transaction opens, so the
  projection no longer holds row locks while waiting on Product/Review Service.
- Threaded an `AnalyticsWriteClient` parameter through the six repository upsert methods so report
  mutations can join the inbox transaction.
- Rewrote the Analytics RabbitMQ consumer onto the inbox. Acknowledgement still happens only after
  the handler resolves; retry and DLQ routing remain owned by the shared consumer.
- Removed `analyticsRepository.saveEvent` / `markEventProcessed`, superseded by the inbox. The
  `analytics_events` table was **not** dropped; retiring it is a data-retention decision and is
  recorded as an open item, not silently executed.

Validation:

- `packages/common`: **13/13 pass** (6 pre-existing RabbitMQ, 7 new inbox unit tests).
- `apps/analytics-service`: **27/27 pass across 4 suites**.
- New `tests/integration/analytics.inbox.test.ts` runs against **live PostgreSQL 16**, not mocks,
  and passes **7/7**:
  - mutation and consumed marker commit together;
  - redelivered event is not applied twice;
  - 10 concurrent deliveries of one event yield exactly 1 `PROCESSED` and 9 `SKIPPED_DUPLICATE`,
    with the counter incremented once;
  - handler failure after writing rolls back the mutation and leaves no processed marker
    (row recorded `FAILED`, attempts 1);
  - a previously failed event applies exactly once on redelivery;
  - deduplication is independent per consumer name;
  - a real `applyAnalyticsEvent` projection commits inside the inbox transaction.
  The suite fails rather than skips when the database is unreachable, so it cannot pass vacuously.

Test-run correction: `apps/analytics-service` previously ran Jest with default parallel workers and
its integration suite intermittently exceeded the 30s timeout when three workers each opened a
Prisma pool. Its `test` script now uses `--runInBand`, matching api-gateway, event-stream-service,
and packages/common. The suite passes 27/27 serially with no forced exit and no lingering-handle
warning.

### Honest scope of the above

- Live PostgreSQL and Redis are now available locally, so Analytics no longer tolerates a 500 from
  an unavailable database. Other services' DB-backed suites have **not** yet been re-run against the
  live database and may still tolerate offline responses; that audit is outstanding.
- Notification Service still has the partial-side-effect window; its inbox is not yet implemented.
- No Kafka projection consumer exists yet.
- Nothing here is production acceptance. Single-node local containers are not an HA cluster.

### Business decisions recorded (supplied by the product owner, 2026-09-25)

These unblock Phase 2 checkout design. They are recorded as received; none were invented.

1. **Fulfillment model**: per-seller origin with **split shipment**. A multi-seller cart produces one
   shipment and one shipping fee per seller.
2. **Tariff source**: internal **verified rate table** (`shipping_rates`). Quotes fail closed when no
   matching row exists. No external courier API is to be called and no rate may be invented.
3. **Refund gate**: refund is permitted only after an **admin confirms physical receipt** of returned
   goods. Approval alone is not sufficient.
4. **Credentials available**: Midtrans sandbox only. S3-compatible storage and SMTP remain external
   acceptance blockers.

### Phase 3 continued - Notification inbox and durable email queue

Notification Service had the same three-transaction consumer shape as Analytics, plus a worse
failure mode on the email side: `createNotification` wrote the in-app row, then fired
`emailService.sendEmail(...)` as an unawaited promise with in-process `setTimeout` retries. A crash
after the notification row committed lost the email permanently, and redelivery short-circuited on
the existing `source_event_id` row, so it was never queued on the retry either.

- Added `InboxEvent` to Notification Service with the same `(event_id, consumer)` unique key.
- Added `src/services/email-outbox.ts`: `email_logs` is now a claimed queue with `available_at`,
  `locked_at`, and `lock_token`. Enqueuing happens inside the caller's transaction; delivery happens
  later in `src/messaging/email-dispatcher.ts` with exponential backoff and a terminal FAILED state.
- `emailService` was split into template resolution, transactional `queueEmail`, and transport-only
  `deliverEmail`. The in-process retry loop is gone.
- Split the consumer into `prepareNotificationEvent` (HTTP recipient lookups) and
  `applyNotificationEvent` (writes only), so no network call happens while the transaction holds
  row locks.
- Migration `20260925100000_add_notification_inbox_and_email_dispatch`.

Fabricated data removed. The consumer previously fell back to `${userId}@example.com` on a failed
user lookup, to `Premium Product` and `seller-id-fallback` on a failed product lookup, and reached
Review Service through a hard-coded `http://localhost:3010`. A guessed address sends real mail to
the wrong person, so those lookups now throw and the event goes through bounded retry and DLQ
instead. `REVIEW_SERVICE_URL` was added to Notification Service config.

Two defects found and fixed while testing:

- `EmailService`'s constructor called `initializeTransporter()`, which provisions an Ethereal
  account over the network when no SMTP credentials are set. Importing the module therefore
  performed network I/O. Initialization is now lazy, on first delivery. Notification Service's
  suite went from **204s to 4.9s**.
- Notification Service ran Jest with default parallel workers and its DB-backed suites timed out.
  Its `test` script now uses `--runInBand`, matching the other services that touch shared resources.

Validation:

- `apps/notification-service`: **43/43 pass across 7 suites in 4.9s**.
- New `tests/integration/notification.inbox.test.ts` runs against **live PostgreSQL 16**, **9/9**:
  notification + email job + consumed marker commit together; a failed write leaves neither; a
  redelivery does not duplicate the email; 8 concurrent deliveries queue exactly one email; two
  dispatchers claim one job exactly once; a sent job is not re-claimed; retry budget is honoured
  before a terminal FAILED; an unknown template is refused rather than silently skipped; token and
  URL template values are redacted in the log table.

### Phase 4 - Analytics Kafka projection implemented

The first real Kafka projection now exists. The boundary is unchanged and one-way
(`domain outbox -> RabbitMQ -> event-stream-service -> Kafka -> projection`); no domain service
publishes to both brokers.

- New `daily_sales_projections` table, deliberately **separate** from the RabbitMQ-fed
  `daily_sales_report`. The same domain fact reaches Analytics over both paths, so a shared table
  would double-count every order and payment. Separate inbox consumer names
  (`analytics.rabbitmq`, `analytics.kafka`) let each path apply an event once to its own table.
  The cutover sequence is documented in [docs/phase-4-kafka-streaming.md](docs/phase-4-kafka-streaming.md);
  nothing reads the projection yet.
- `kafka_projection_progress` records per-partition position for lag reporting only. Kafka remains
  the authority for offsets; this table never decides where to resume.
- `autoCommit: false`. A failed projection throws before `commitOffsets`, so the offset advances
  only after the projection transaction commits.
- `partitionsConsumedConcurrently: 1` preserves per-partition ordering.
- `schemaVersion` is validated; only version 1 is accepted. Malformed or unsupported messages are
  counted and stepped over rather than retried forever, because blocking a partition on one bad
  record stalls every well-formed event behind it. The rejection counter is the alert signal.
- `GET /analytics/readiness` reports connected state, projected/duplicate/rejected/failure counts,
  last event time, and per-partition lag. The service now also shuts the consumer down on
  SIGTERM/SIGINT so in-flight projections are not abandoned mid-transaction.
- Migration `20260925110000_add_kafka_projection`; `kafkajs` added to Analytics.

Validation - `tests/integration/kafka-projection.test.ts` against **live Kafka 4.3.1 and live
PostgreSQL 16, 12/12 pass**, failing rather than skipping when either is unreachable:
unsupported schema rejected; non-JSON rejected; missing eventId rejected; order projected with
partition progress in one transaction; replay not double-counted; 8 concurrent deliveries produce
exactly 1 projection; `OrderPaid` not projected so `PaymentSuccess` revenue is not doubled;
transaction failure returns FAILED and projects nothing; redelivery after an uncommitted offset
applies exactly once; a transient failure leaves the event projectable; per-key ordering preserved
through a live partitioned topic; a fresh consumer group replays the log from the beginning.

### Build fix - customer-web Turbopack root

`frontend/customer-web` failed `next build` with `Could not find the Next.js package
(next/package.json)`. Root cause: **`frontend/customer-web/.git` is a nested, empty Git repository**
(`git init` with no commits, branch `master`). Next.js 16 Turbopack stops workspace-root detection
at a Git boundary, so the root resolved to the app folder and the hoisted `next` package became
unreachable. The other two dashboards have no nested `.git` and built normally.

Fixed by setting `turbopack.root` to the monorepo root in `frontend/customer-web/next.config.ts`,
which is the documented remedy and does not depend on the nested repository being removed. The
nested `.git` was **not** deleted; that is the user's to decide. It is also the likely source of the
`master` branch reported in the original task brief.

### Workspace quality gate (2026-09-25)

| Gate | Result |
|---|---|
| `npm.cmd run typecheck` | **exit 0**, 26 workspaces |
| `npm.cmd run lint` | **exit 0**, 0 errors, 6 pre-existing Google-font warnings |
| `npm.cmd audit --audit-level=high` | **exit 0**, 0 vulnerabilities |
| `npm.cmd run build` | user-service and customer-web verified individually after their fixes; a clean full re-run is pending |
| `git diff --check` | clean for hand-written files; pre-existing trailing whitespace remains in Prisma-generated output |
| Prisma schema validate | 11/11 pass |
| Migration deploy/status/drift on disposable PostgreSQL 16 | 11/11 pass, no drift |

Caveat on that build row: the first full `npm.cmd run build` overlapped with `prisma generate`
runs, which is the concurrency hazard the working rules warn about. Its two failures were a stale
TypeScript error since fixed and the Turbopack issue above. A clean sequential re-run is required
before the build gate is claimed green.

### Phase 2 - Checkout reopened on a trusted shipping quote

Checkout had been fail-closed since Phase 2 began. The product owner supplied the two missing
decisions on 2026-09-25, and the contract is now implemented against them. Full detail is in
[docs/phase-2-product-completion.md](docs/phase-2-product-completion.md).

- Fulfillment: **per-seller origin, split shipment**. N sellers produce N shipments and N fees.
- Tariffs: the **internal verified rate table**. No external courier API; no configured row means
  the quote fails closed.
- Refunds: only after an **admin confirms physical receipt**. The receipt step is now implemented;
  warehouse procedure and live payment-provider acceptance remain external gates.

What was added:

- `SellerProfile.originCity` / `originProvince` / `originVerifiedAt`. `storeAddress` was free text
  and cannot key a rate table. All nullable on purpose: a seller without a verified origin blocks
  quoting for their items rather than falling back to an assumed warehouse.
- `shipping_quotes`: opaque id, 30-minute expiry, customer ownership, origin/destination/weight/
  service/cost snapshot, a SHA-256 `cartHash` for revalidation, single use enforced by a partial
  unique index plus a conditional UPDATE, and idempotency per order id.
- The cart-hash function lives in `packages/common` because Shipping and Order Service must produce
  byte-identical output; two implementations would drift and break every checkout.
- `checkoutSchema` now takes `shippingQuoteId` and is `.strict()`. `courierName`, `courierService`,
  and `shippingCost` are gone, and a client still sending `shippingCost` gets a 400 rather than
  having it silently ignored.
- The order id is generated before the order row exists, so the quote is claimed **before** any
  dependent state. A quote can never price two orders.
- `orders.shipping_quote_id` and `orders.shipment_breakdown` record the quote and the full
  per-seller split.
- Seller dashboard: a dispatch-origin form that always saves as unverified. Admin dashboard: a
  verification queue. A seller may propose an origin but not approve it, because the origin decides
  what customers are charged for delivery.
- Customer Web checkout groups the cart by seller, collects a courier per seller, requests a server
  quote, shows the per-seller breakdown, and submits the quote id alone. Changing a courier discards
  the quote; a rejected order clears it.

Migrations: `20260925120000_add_seller_dispatch_origin`, `20260925130000_add_shipping_quotes`,
`20260925140000_add_order_shipping_quote`.

Validation:

| Suite | Result |
|---|---|
| Shipping quote unit tests | **11/11** |
| Shipping quote integration, **live PostgreSQL 16** | **10/10** |
| Shipping Service full suite | **48/48** |
| Order Service full suite | **62/62** |
| Customer Web checkout page | **9/9** |
| User Service dispatch-origin trust boundary | covered by unit tests |

The live suite proves what only a real database can: 10 concurrent checkouts racing for one quote
yield exactly one success; consumed, expired, foreign-owned, and stale-cart quotes are all refused;
a retried checkout for the same order is idempotent.

### Test infrastructure corrected

Three problems were making the workspace test suite unable to prove anything about runtime
behaviour. All three are fixed.

1. **Tests could not reach a database at all.** Every service's `tests/setup.ts` defaults to
   `postgres:postgres123@localhost:5445` with a per-service `*_test` schema, but no such database
   existed. Suites therefore accepted `[200, 500]` and `[400, 422, 500]`, which passes whether the
   code works or not. The disposable container's password was aligned to the repository's own
   convention and all 11 test schemas were migrated, so `npm.cmd test` now runs against live
   PostgreSQL 16 with no configuration changes. Redis was recreated without a password to match
   `tests/setup.ts` as well.
2. **Parallel Jest workers exhausted the local database and broker.** Suites intermittently blew the
   30s timeout; auth-service took over 270s and failed, analytics and notification did the same. All
   14 services now run `jest --runInBand`, matching api-gateway, event-stream-service, and
   packages/common. auth-service went from timing out to **29/29 in 4.2s**.
3. **Open handles required forced exits.** Order Service left its Prisma pool open and Cart Service
   left an ioredis connection open, so Jest hung. Both now disconnect in `afterAll`. Order Service
   went from ~86s with a lingering-handle warning to **6.7s clean**; Cart Service no longer hangs.
   No suite in this session relies on `--forceExit`.

Assertions that previously tolerated an unavailable dependency have been tightened where the
dependency is now live: Order Service asserts 200 and 404 exactly instead of `[200, 500]` and
`[404, 500]`, and Cart Service asserts 200 instead of `[200, 500]`.

A defect this uncovered: **Order Service returned 500 for validation errors** because `ZodError` was
not handled in its error middleware, unlike every other service. A malformed checkout body was
reported as a server fault and leaked internal detail. Now handled, asserted as 400.

### Phase 5 - backup/restore drill, request correlation, CI

#### Backup and restore drill

`scripts/backup-restore-drill.sh` (`npm run db:backup-drill`) dumps the running database, restores
it into a **separate, freshly created** scratch database, and compares per-table row counts. It
fails if any count differs, if the dump is implausibly small, or if the restore target is not
distinct from the source. It never writes to the source.

Verified locally on PostgreSQL 16: `pg_dump -Fc` produced 276,569 bytes, restore succeeded, and
**143/143 tables matched exactly**. The scratch database was dropped afterwards.

Documented honestly in [docs/deployment.md](docs/deployment.md): this proves the backup mechanism
works. It does **not** cover point-in-time recovery (no WAL archiving exists), RTO/RPO, offsite
encrypted retention, cross-version restore, roles/grants, or backup-age alerting. Those remain
production acceptance.

#### Request correlation

No correlation or request id existed anywhere in the codebase. One customer action fans out across
a dozen services, and reconstructing a failure meant guessing from timestamps.

- The ambient context lives in `@nexacommerce/logger` next to the logger, because its reason for
  existing is that log lines from one action must be findable together. The HTTP adapter is in
  `@nexacommerce/common`, which depends on logger — not the reverse.
- `AsyncLocalStorage` carries the id rather than threading it through every signature; the
  alternative is editing every call site for a value almost none of them use, where one missed call
  site silently breaks the trace.
- `requestIdMiddleware` is mounted first in **all 14 services**. An id supplied by an upstream caller
  is reused so a trace spans services, but only if it matches `[A-Za-z0-9._-]{8,128}` — an unchecked
  value lands in logs, where a newline forges entries.
- The gateway forwards its id to every proxied service; `buildInternalServiceHeaders()` forwards it
  on every internal call; Analytics and Notification consumers establish context from the event id,
  since they have no HTTP request.
- Every log line now carries the id when one is in scope, and it is echoed on the response so a
  customer can quote it.

`packages/common`: **20/20 pass**, including 7 correlation tests covering generation, reuse,
rejection of malformed ids, survival across `await`, and isolation between concurrent requests.

Also corrected: `docs/architecture.md` claimed `@nexacommerce/logger` wraps Winston. It does not;
it is a small in-house logger writing to stdout.

New: [docs/observability.md](docs/observability.md) records what is logged and what must never be,
which metrics exist versus which a production deployment still needs, the liveness/readiness
distinction, and which signals should page versus merely be visible. It is explicit that no metrics
exporter, tracing, log aggregation, or alert rules are wired yet.

#### CI

`.github/workflows/backend-ci.yml` already ran lint, a 26-workspace typecheck, DB-backed tests
against the same `*_test` schemas used locally, build, and `npm audit`. Added:

- A **Kafka service** and a topic-provisioning step, so the Analytics projection tests run against a
  real broker in CI. Without it those tests would fail there — which is correct, since a projection
  suite that passes with no broker proves nothing.
- `KAFKA_BROKERS` in the job environment.
- `frontend/admin-dashboard`, which was missing from the workspace test list.

#### Kafka production requirements

[docs/kafka-production-requirements.md](docs/kafka-production-requirements.md) states the minimum a
production cluster must meet: 3 brokers and controllers, replication factor 3,
`min.insync.replicas` 2, `unclean.leader.election.enable=false`, TLS plus SASL with default-deny
per-service ACLs, storage sizing, monitoring and alert thresholds, export, and DR. It also records
that partition count is a one-way door for ordering, and the safe sequence for rebuilding a
projection.

**Marked external acceptance.** No production cluster has been provided, so none of it is verified.
The local topology is a single-node KRaft container with plaintext listeners and replication
factor 1 — adequate for proving projection correctness and for nothing else.

#### Schema drift found and fixed

The first migration-drift recheck after the day's new migrations reported drift in Analytics: the
hand-written migration named the unique index `kafka_projection_progress_group_topic_partition_key`
while Prisma's convention would generate a different name, so a fresh deployment would have
reported drift immediately. The index name is now pinned in the schema with `map:`. The partial
unique index on `shipping_quotes.consumed_by` — which is what makes "one quote prices at most one
order" a database guarantee rather than an application convention — is documented in the schema
because Prisma cannot express a partial index and would otherwise propose dropping it.

After the fix: **11/11 schemas validate, 11/11 migrate status up to date, 11/11 no drift.**

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

Next, migrate fulfillment persistence and APIs from one shipment per order to one shipment per seller, then enter real verified seller origins and shipping-rate rows through the implemented admin surfaces. After that, configure and test a real S3-compatible media endpoint/bucket/CDN and run customer/seller/admin browser E2E plus Midtrans and SMTP sandbox acceptance. The physical return-receipt gate is implemented and database-tested locally, but the actual warehouse operating procedure and a real Midtrans refund remain production acceptance items. Redis/RabbitMQ reliability remains Phase 3 and Kafka remains Phase 4.

Admin notifications continuation (2026-09-24): pagination reads backend `total` metadata and displays the current range; category filters are sent to Notification Service and applied before pagination instead of filtering only the loaded page. The endpoint validates bounded, non-empty type filters and OpenAPI documents the query parameter. A repository unit test verifies the filter applies to both row selection and filtered total while unread count remains global. Admin also exposes the existing batch mark-all-read endpoint and refreshes its list on success. Notification Service tests pass 20/20 with `--forceExit`, service TypeScript build passes, Admin Dashboard production build passes, and focused ESLint passes. Route tests still tolerate unavailable PostgreSQL, and Jest reports an existing open handle, so persisted runtime query remains unverified.

Customer cart copy correction (2026-09-24): the cart page incorrectly said vouchers were unavailable until server validation existed, despite server-backed voucher preview already being implemented on checkout. Copy now directs users to enter a voucher in checkout and accurately states server-side validation. Added a focused CartPage test. Customer Web tests pass 37/37 across 11 files; production build and focused ESLint pass. This does not open order checkout, which remains gated on trusted shipping quotes. Fresh read-only port probes again found PostgreSQL 5445, Redis 6379, RabbitMQ 5672, and Kafka 9092 unavailable; no database/broker substitute was used.

Prisma migration baselines (2026-09-24): generated baseline SQL from each service's checked-in Prisma schema for analytics, inventory, notification, product, review, shipping, voucher, order, payment, and user services; auth now has a follow-up migration for token/login-history tables and missing user columns not present in its original `init` migration. Baseline timestamps sort before each existing incremental migration; user status and payment webhook-key migrations now use idempotent column/index creation for fresh installs. All 11 Prisma schemas validate. Auth Service tests pass 28/28. Fresh-database runtime verification succeeded on a disposable PostgreSQL 16 cluster bound only to loopback: `prisma migrate deploy` and `prisma migrate status` passed for all 11 service schemas. `prisma migrate diff --exit-code` initially caught missing refund indexes in the Payment Prisma schema; the schema/baseline were aligned, and the final rerun reported no drift for all 11 migrated schemas. Payment Service build passes. The cluster and its temporary data were stopped and removed. This proves a fresh install, not adoption of a populated/application database. For populated databases, operators must inspect schema parity and explicitly mark each generated baseline as applied before deploy; blindly running deploy may collide with existing objects. No project or production database was touched.

Customer payment status UI coverage (2026-09-24): verified payment polling is limited to `PENDING`, then added PaymentPage tests for provider-issued payment URL, missing URL (no fabricated payment method/success), and backend-confirmed `PAID` only. Customer Web passes 40/40 across 12 test files; production build and focused ESLint pass. This uses mocked API responses and does not represent a Midtrans sandbox or browser-to-live-service test.

Database-backed backend test continuation (2026-09-24): found all 11 Prisma test setup files forcibly overwrote `DATABASE_URL` with `localhost:5445`, preventing isolated/CI databases from being used. Changed them to `??=` so explicit environment configuration is honored while retaining the local default. Then ran migrations and each test script against its own schema on disposable PostgreSQL 16: Auth 28, User 10, Product 24, Inventory 14, Order 37, Payment 26, Voucher 17, Shipping 17, Review 14, Notification 20, Analytics 12 tests all passed (219 tests total). Cart has no Prisma schema; its separate integration suite passed 6/6, but Redis was unavailable and the route explicitly tolerates that. Analytics also logged Auth/Product/Order service requests failing because those dependent services were not running. The orchestrator stopped at Cart when it tried Prisma migration for a service without a Prisma schema; all 11 applicable DB suites had already passed. Disposable cluster was stopped and removed, and test port 55459 was released. This is service-level database integration, not a complete running microservice stack or E2E acceptance.

Seller analytics truthfulness (2026-09-24): removed unsupported “Pendapatan Bulan Ini” and conversion-rate KPI (which always defaulted to zero and showed a hard-coded 2.1% industry benchmark). Replaced them with `totalItemsSold`, `averageRating`, and `totalReviews` values supplied by Analytics Service; the existing daily chart remains an explicit API-unavailable disclosure. Seller Dashboard production build and focused ESLint pass. No live Analytics/Auth/Product service stack was running during this check.

Seller home dashboard truthfulness (2026-09-24): removed its fabricated conversion KPI and hard-coded 2.1% industry comparison, and replaced them with API-backed average rating/review count. Corrected all-time analytics labels that claimed to be “hari ini” or “30 hari”, and renamed “Pesanan Baru” because its value is total orders. Seller Dashboard production build and focused ESLint pass; focused scan found no remaining stale KPI/copy strings and `git diff --check` passes. No live Analytics Service/browser acceptance was performed.

Customer email-verification recovery (2026-09-24): the verification error view linked to a missing `/auth/resend-verification` page. Added a Customer Web recovery form wired to Auth Service `POST /auth/resend-verification`, privacy-safe generic success copy, request error handling, and a redirect-preserving login link. Successful registration now takes the customer to verification recovery instead of straight to login. UI tests assert registration delivery-confirmed/unconfirmed copy and resend behavior. Auth now awaits the Notification Service response for registration and adds `verificationEmailAccepted` (true only for an HTTP-success response); on unconfirmed delivery the user sees a resend path and is told not to register again. Forgot-password UI now explains its intentionally generic response rather than claiming email definitely arrived. Auth Service passes 29/29 tests and build; Notification Service build and focused tests pass 9/9 for SMTP acceptance and link construction; Customer Web passes 46/46 tests, focused ESLint, and production build. UI/service boundary tests are mocked; SMTP delivery and actual email-link acceptance remain unverified. Notification email failures retry twice in process after the Auth result, not durably. Password-reset and resend paths retain generic responses to prevent account enumeration.

Customer/Seller frontend placeholder cleanup (2026-09-24): Customer login now links to the existing forgot-password route; Seller login no longer exposes a dead `#` seller-registration action. Removed the footer's local-only newsletter “success” simulation (no subscription API existed) and replaced inactive policy/contact/social links with explicit unavailable/pending copy. Footer test verifies no fake subscribe button or `href="#"`. Customer Web suite passes 44/44 across 14 files; focused Customer ESLint passes; Customer and Seller production builds pass, Seller login focused ESLint passes, and a focused scan finds no remaining `href="#"` or fake newsletter-success strings in those frontends. These are frontend/static tests, not newsletter, contact, or public-policy runtime acceptance; customer support channel and returns policy remain business/product gates.

Product image upload and S3-compatible media (2026-09-24): added an AWS SDK S3 adapter that accepts AWS S3 or a configured S3-compatible endpoint; environment-configured bucket credentials and public/CDN URL are required, and the production service entrypoint fails closed if configuration is absent/invalid. Authenticated product upload checks seller ownership/admin role, accepts one JPEG/PNG/WebP file up to 5 MB and 40 MP, decodes and re-encodes to metadata-stripped WebP (max 2400×2400), then stores it with immutable cache metadata. Added best-effort object cleanup, generic provider errors, a gateway limit of 30 uploads per 15 minutes, OpenAPI docs, production Compose required env, and safe `.env.example` placeholders. Seller product create/edit now sends multipart files; added seller `apiUpload` helper and Vitest v4 test script. Evidence: Product Service build pass; focused Product Service unit/route tests 35/35; API Gateway build pass; Seller multipart helper test 1/1, focused ESLint pass, and Seller Dashboard production build pass. S3 is mocked in tests; other Product route tests still tolerate unavailable PostgreSQL at localhost:5445. Docker and an actual object storage/CDN endpoint are unavailable, so bucket permission/upload/read/delete, deployment, and browser-to-live-storage acceptance remain open. Runtime provider setup is still required; media implementation does not unblock checkout.

Runtime availability recheck (2026-09-24): Docker CLI exists but Docker Engine named pipe `//./pipe/docker_engine` is absent. `docker compose ps` could not render the stack because required `POSTGRES_PASSWORD` is unset (no secret file was inspected). Loopback ports 9000 (object-storage default), 5445 (project PostgreSQL), 6379 (Redis), 5672 (RabbitMQ), and 9092 (Kafka) all refused connections. This is current environment availability evidence only; no service or unrelated database was started or substituted.

Workspace revalidation (2026-09-24): root `npm.cmd test` completed with exit code 0 across the workspace; final suites included Customer Web 36/36, User Service 10/10, and Voucher Service 17/17. Root build and lint passed in this continuation (lint: 0 errors, 6 Google-font warnings); Order Service 37/37, Seller Dashboard production build, and focused seller-order ESLint passed after courier-handoff validation. `git diff --check` passes. Integration route tests still exercise unavailable PostgreSQL/Auth Service responses, Customer Web tests do not exercise a browser against live APIs, and PostgreSQL/Redis/RabbitMQ/Kafka/Docker are unavailable here. This is local code/test acceptance only. Phase 2 remains incomplete: trusted shipping quote/fulfillment and multi-seller origin model, production media provider, live DB/migration acceptance, payment/email sandbox checks, and browser E2E remain open; business decisions must not be guessed.

Full workspace build/lint recheck (2026-09-24): reran root `npm run build` against the current checkout; all backend services, shared packages, Admin Dashboard, Customer Web, and Seller Dashboard completed TypeScript/Next.js production builds successfully. Root `npm run lint` also completes with 0 errors and 6 warnings, all Google-font configuration warnings in the three dashboard/customer layout files. `git diff --check` remains clean. These are local build/lint checks and do not replace tests, runtime/database/migration validation, or browser E2E. Docker Engine and the project service ports remain unavailable per the runtime probe above; shipping/return/storage decisions and live provider acceptance are still required before Phase 2 can exit.

Shipping rate bracket pricing correction (2026-09-24): removed a second, inconsistent weight-based multiplication from Shipping Service. `ShippingRate.cost` is now returned as the configured total for the smallest sufficient bracket selected by the repository. Added regression coverage for a 1.5 kg request selecting a 2 kg bracket at its stored price. Shipping Service build passes and its suites pass 18/18; route integration cases still log tolerated PostgreSQL `localhost:5445` connection failures, so live rate lookup is unverified. `git diff --check` passes. This does not select the fulfillment-origin model or enable checkout.

Shipping fulfillment audit (2026-09-24): current Shipping Service `OrderPaid` consumer hard-codes origin city Jakarta and substitutes 1 kg when order item weight is absent. These are not authoritative data. Checkout remains fail-closed, but automatic shipment creation must not be accepted as production-valid until origin and weight are snapshotted from the selected fulfillment/quote model. This is an additional Phase 2 blocker; no origin model was inferred or configured.

Order item weight snapshots (2026-09-24): Order Service now stores validated Product Service weight (grams) on each order item; added fresh baseline column and additive migration for existing DBs; Prisma Client regenerated and schema validation passes. Shipping's OrderPaid consumer computes package weight from these immutable item snapshots and fails on absent/invalid weight or quantity instead of defaulting to 1 kg. Added tested weight aggregation helper. Order Service build passes; all 37 tests pass and Jest exits cleanly after background expiry/completion cron timers were disabled in test environment. Shipping Service build passes and all 21 tests pass. Database route tests tolerate unavailable PostgreSQL at localhost:5445, so migration application and real persistence remain unverified. Hard-coded Jakarta origin remains unresolved pending fulfillment decision; checkout stays disabled.

Prisma schema audit (2026-09-24): ran `npx prisma validate` sequentially on all 22 service and generated-client `schema.prisma` files under `apps/`; all 22 validated successfully, including the updated Order Item weight snapshot. This proves Prisma schema validity only, not SQL migration application, schema drift against a running database, or persisted data correctness. `git diff --check` passes.

Runtime recheck (2026-09-24): queried Docker Engine availability and loopback TCP ports 5445 (PostgreSQL), 6379 (Redis), 5672 (RabbitMQ), 9092 (Kafka), and 9000 (conventional object storage). Engine was unavailable and all ports remained closed. Did not start services, inspect secrets, or substitute other local database instances. Live migration, broker, media, and browser-to-service E2E gates remain open.

Phase 3 RabbitMQ reliability foundation (2026-09-24): `packages/common/src/rabbitmq.ts` now declares durable topic/retry/dead-letter exchanges, quorum main/retry/DLQ queues, per-routing-key 5-second retry queues, and a 20-delivery queue limit with DLX. All eight RabbitMQ-integrated services use confirm channels; event publishing is persistent, carries stable eventId as messageId, and awaits publisher confirms. Consumers prefetch 10, manually ack after handler completion, retry handler failures up to 5 times, dead-letter malformed/exhausted messages, and only ack after retry/DLQ publish confirmation; failed forwarding preserves the original delivery for redelivery. Common RabbitMQ unit suite passes 6/6; root workspace build passes. No live broker/restart/duplicate/crash acceptance was possible because RabbitMQ and Docker Engine are unavailable. Existing classic queues cannot be redeclared as quorum without an intentional migration; Compose still has a single RabbitMQ node and does not provide quorum HA. Transactional outbox/inbox, consumer dedupe/idempotency proof, distributed gateway rate limits, and broker fault tests remain open; Phase 3 is not complete.

Phase 3 distributed gateway rate limiting (2026-09-24): replaced API Gateway's production in-memory limiters with shared Redis counters using atomic Lua `INCR`/expiry, per-limiter namespaces, and bounded Redis connection retries. Redis storage errors fail closed with HTTP 503; `/health` is skipped by the global limiter. Test mode retains express-rate-limit memory storage. Added focused tests (4/4 pass) for increment/expiry, reads, decrement/reset, storage outage handling, and test mode; API Gateway TypeScript build passes. Lockfile updated offline. No live Redis was available, so cross-replica concurrency, outage behavior, and proxy/client-IP trust configuration remain deployment checks. Phase 3 still cannot exit: transactional outbox, inbox/deduplication and idempotent side effects are not implemented, and broker fault acceptance needs a live RabbitMQ runtime.

CI and typecheck hardening (2026-09-24): added a real `typecheck` script to every TypeScript workspace. Backend/shared packages run `tsc --noEmit`; all three Next.js frontends run `next typegen && tsc --noEmit` for route-type validation. Root `npm.cmd run typecheck` now checks 23 workspaces and exits 0 instead of succeeding as an empty `--if-present` command. Workspace CI now runs on the active `master` branch plus `main`/`develop`, includes frontend/script changes, uses read-only permissions and concurrency cancellation, and enforces lint plus real typechecking. Replaced `prisma db push ... || true` with isolated per-service test schemas, checked-in `prisma migrate deploy`, Linux Prisma Client generation, and complete service tests; migration/generation failures are no longer suppressed. The exact non-database CI group passes locally with 63/63 tests. Container CI now watches root dependency/Compose changes, supplies complete non-production validation values for required Compose variables, and polls gateway health with diagnostics on failure. Both workflow files parse as YAML, `docker compose --profile production config --quiet` exits 0 with the CI values, root typecheck exits 0, root lint exits 0 with six existing Google-font warnings, and `git diff --check` passes. GitHub Actions and live containers were not run because no remote is configured and Docker Engine remains unavailable; this is executable local/static CI acceptance, not remote CI, image-runtime, deployment, or rollback proof.

Container fail-fast follow-up (2026-09-24): removed suppressed `prisma generate` failures from all 11 database-service Dockerfiles so a missing or incompatible generated client now fails image construction. Removed the invalid Prisma generation step from Cart Service, which has no Prisma schema. A live `npm.cmd audit --omit=dev --audit-level=high` registry check reports 0 vulnerabilities. Image builds and container startup remain unverified because Docker Engine is unavailable.

Phase 3 payment outbox and consumer-idempotency slice (2026-09-24): Payment Service now persists the payment status transition, status log, webhook completion, and stable RabbitMQ event envelope in one transaction. Its outbox dispatcher uses owner lease tokens for multi-replica claims, publisher confirms, exponential retry scheduling, stale-lease recovery, and reconnect polling; broker failure no longer loses the already-committed payment event. Added a payment outbox migration and tests for envelopes, ownership claims, publish completion, retry metadata, and claim release. Notification records now have a unique source event ID and suppress duplicate in-app/email scheduling; Analytics raw events have a unique source event ID and skip completed duplicates. Both consumers rethrow failures into the common retry/DLQ path instead of silently acknowledging them. Order payment-event guards prevent redelivered success from regressing fulfilled orders and prevent late failed/expired events from cancelling paid orders. Inventory confirmation/release atomically claims a RESERVED row before stock mutation, preventing concurrent double application. Full affected suites pass: Payment 30/30, Notification 29/29, Analytics 14/14, Order 49/49, Inventory 18/18 (140 total); all five service builds pass; all 23 workspace typechecks pass; root lint passes with 0 errors and the same 6 Google-font warnings; all three changed Prisma schemas validate; `git diff --check` passes. PostgreSQL/RabbitMQ/Docker were unavailable in this continuation, and route tests still tolerate offline database responses, so migrations, dispatcher recovery, and duplicate/crash behavior lack live-runtime acceptance. Phase 3 remains open: outbox coverage is Payment-only; Order/Inventory/Review/Shipping producers still publish after commit, Analytics mutations are not atomic with its processed marker, Notification email logging is not atomic with notification creation, and a general durable inbox plus broker fault tests are still required.

Phase 3 Order, Review, and Shipping outbox continuation (2026-09-24): added checked-in outbox migrations and generated clients for all three services. Order cancellation, payment acceptance/failure, and completion now persist their status/history and stable event envelope atomically; conditional status claims prevent concurrent deliveries from duplicating those transitions. `OrderCreated` intentionally remains a confirmed fail-closed checkout-saga publish because enqueueing it at the initial order insert would expose an order before stock/payment setup succeeds. Review creation now commits its rating summary and `ReviewCreated` event together. Shipping status updates now conditionally claim the prior status and atomically write history plus `OrderShipped` at pickup or `OrderDelivered`; in-transit location updates no longer repeat the shipped milestone. All three dispatchers use owner lease tokens, confirms, exponential retry, stale-lease recovery, reconnect polling, and graceful shutdown, while HTTP startup no longer depends on immediate broker availability. Full suites pass Order 56/56, Review 17/17, Shipping 27/27 (100 total); all three builds pass; all 23 workspace typechecks pass; and all three Prisma schemas validate. PostgreSQL, RabbitMQ, and Docker remain unavailable, so migrations and crash/reconnect semantics are not live-runtime proof. Phase 3 remains open for `OrderCreated` saga finalization, atomic inbox processing, Notification/Analytics partial-side-effect windows, queue migration/HA, and broker fault acceptance.

Phase 3 Inventory outbox continuation (2026-09-24): Inventory's payment/order handlers now process each order's still-reserved rows in a database transaction, use conditional reservation claims, and persist stock movement plus stable `StockConfirmed`, `StockReleased`, and low-stock envelopes before commit. Retried or competing deliveries skip claims already won, so they cannot repeat stock mutation or create a second event for the same reservation transition. The Inventory dispatcher now has the same owner-lease, publisher-confirm, exponential retry, stale recovery, reconnection, and graceful-shutdown behavior as the other outbox services. Inventory's full suite passes 24/24, build and typecheck pass, and its Prisma schema validates. Product-owner lookup precedes the database transaction so the low-stock event can carry the seller ID; if Product Service cannot resolve it, the existing `SYSTEM` fallback remains explicit. PostgreSQL/RabbitMQ/Docker are unavailable, so migration deploy and live crash/recovery behavior remain unverified.

Phase 4 Kafka streaming foundation (2026-09-25): added Event Stream Service and a durable `event-stream-service.business-facts` RabbitMQ queue bound to all 16 business-event routing keys. Domain services still publish once through their existing outbox/RabbitMQ path; the bridge acknowledges only after Kafka accepts a keyed schema-v1 record, avoiding independent dual publishing. Added five explicit delete-retention topics (`orders`, `payments`, `inventory`, `shipping`, `reviews`), aggregate partition keys, retention/config provisioning, KafkaJS idempotent producer settings, health/readiness separation, reconnect lifecycle, and a reusable inbox/idempotency helper. Compose now pins the official Apache Kafka 4.3.1 JVM image in single-node KRaft mode and includes the bridge service; CI includes its unit suite. Event Stream Service tests pass 18/18, typecheck/build pass, Common RabbitMQ tests pass 6/6, and dependency install reports 0 vulnerabilities. Live Kafka/RabbitMQ bridge, partition ordering, replay, restart, outage, and secured multi-node behavior remain unverified because Docker Engine and broker ports are unavailable. Phase 4 stays in progress until a real database-backed projection and live fault/replay acceptance pass.

Phase 4 live-broker continuation (2026-09-25): Docker Engine 29.7.2 became accessible and the Phase 4 minimum topology was exercised with RabbitMQ 3.13, the pinned Apache Kafka 4.3.1 image, and the Event Stream container. Live startup first caught a real Dockerfile defect shared by all 14 backend images: wildcard destinations created a literal `/app/packages/*` directory, leaving workspace symlinks unresolved. Every service Dockerfile now copies the built package tree to `/app/packages`; representative API Gateway and Event Stream images build and resolve all required internal packages. `.dockerignore` excludes locally generated Windows Prisma clients, reducing the Event Stream context from about 384 MB to 93 KB, and the rebuilt non-root bridge container is healthy. `/ready` reports Kafka and RabbitMQ ready; all five topics were provisioned with 6 partitions and the documented retention. Synthetic `OrderPaid` facts crossed RabbitMQ to Kafka with stable event ID, source timestamp, aggregate key, and schema-v1 envelope. Earliest-offset replay, same-key ordering, expected duplicate propagation, durable backlog across bridge restart, Kafka outage/recovery, and RabbitMQ readiness/reconnect all passed locally. Container CI now performs a RabbitMQ-to-Kafka smoke assertion. Event Stream tests pass 20/20, Common RabbitMQ tests pass 6/6, its build passes, Compose config validates, all 24 workspace typechecks pass, and lint exits 0 with the existing 6 Google-font warnings. This proves the local single-node bridge, not a production Kafka design: Phase 4 remains open for a database-backed atomic projection plus its consumer crash/replay tests, and for multi-node replication, security, monitoring, capacity, backup/DR, and privacy-retention acceptance.
