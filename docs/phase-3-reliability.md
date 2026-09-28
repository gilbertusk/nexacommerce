# Phase 3 — Redis and RabbitMQ Reliability

Last updated: 2026-09-27
Status: In progress; producer outboxes and atomic consumer inboxes are implemented locally, including checkout-saga finalization; live RabbitMQ/Redis fault acceptance and production HA remain pending

## Exit criteria

- Redis is used only for ephemeral cart/session/cache/rate-limit/coordination state; durable commerce state remains in PostgreSQL.
- RabbitMQ exchanges and queues are durable; quorum queues are used for event delivery where the broker cluster supports them.
- Producers await broker publisher confirms and consumers use manual acknowledgements.
- Failed messages receive bounded retries and ultimately enter a durable dead-letter queue.
- Domain database mutations and outgoing messages are transactionally coordinated through an outbox.
- Consumers persist inbox/deduplication markers and apply idempotent side effects.
- Duplicate delivery, consumer crash, poison message, broker restart, and recovery tests pass against RabbitMQ/Redis runtime.

## Implemented locally

- Common RabbitMQ topology declares durable topic, retry, and dead-letter exchanges. Main, retry, and DLQ queues are durable quorum queues. Main queues have a 20-delivery limit and dead-letter route; retry queues are created per destination queue/routing key with a five-second TTL and dead-letter back to the original event route.
- RabbitMQ publishing uses persistent JSON messages, requires `eventId` and `eventName`, sets the stable event ID as AMQP `messageId`, and awaits the confirm-channel callback before reporting success.
- Consumers set prefetch to 10, manually acknowledge only after handler completion, and attempt at most five delayed retries after handler errors. Exhausted retries or invalid event envelopes are forwarded to DLQ; source messages are acknowledged only after the retry/DLQ publication is confirmed. If forwarding cannot be confirmed, the source delivery is requeued.
- All eight services which create RabbitMQ channels now use confirm channels, enabling publisher confirms on current publishing and consuming paths.
- Focused common RabbitMQ tests pass 6/6 for queue topology, confirmed publishing, manual ack, bounded retry, malformed/exhausted DLQ, and forward-failure redelivery. Root workspace production build passed after the integration.
- Redis is used by Cart Service for ephemeral cart state and by API Gateway for distributed rate limits. Gateway counters use atomic Lua operations, separate namespaces per limiter, bounded client reconnect settings, and fail closed with HTTP 503 if Redis is unavailable. `/health` is excluded from the global limiter. Only tests use express-rate-limit's process-local memory store.
- Focused API Gateway Redis-store tests pass 4/4 for atomic increment/expiry, read/expired-key behavior, decrement/reset, fail-closed errors, and test-mode memory storage. API Gateway TypeScript build passes.
- Payment status webhooks now write `Payment`, `PaymentLog`, webhook completion, and a stable event envelope to `outbox_events` in one PostgreSQL transaction. The dispatcher claims batches with per-worker lease tokens, publishes through RabbitMQ confirms, marks successful rows published, and releases/reschedules failures with bounded exponential backoff. A closed or unavailable broker is retried by the polling lifecycle instead of dropping the committed domain event.
- Order cancellation, payment acceptance, payment failure/expiry cancellation, and completion now write their status/history plus `OrderCancelled`, `OrderPaid`, or `OrderCompleted` envelope in one transaction. Conditional status claims prevent concurrent deliveries from producing duplicate transitions.
- Checkout now defines an explicit finalization boundary after inventory reservation, optional voucher application, and payment invoice creation succeed. Order Service sets `checkout_finalized_at`, writes a status-history marker, and inserts one deterministic `OrderCreated` outbox envelope in a single transaction. The HTTP request no longer connects to RabbitMQ; a broker outage leaves the committed event pending for the existing dispatcher.
- Review creation now commits the review, rating summary, and `ReviewCreated` envelope together. Shipping status updates likewise commit the guarded status transition, history, and `OrderShipped`/`OrderDelivered` envelope together. Shipping emits `OrderShipped` only at `PICKED_UP`; repeated in-transit location updates do not re-emit the milestone.
- Inventory's payment/order consumers now conditionally claim all still-reserved rows for an order and atomically write stock movements plus `StockConfirmed`, `StockReleased`, and any `LowStockDetected` envelopes. A retry after a partial competing delivery only emits events for claims won by that transaction.
- Payment, Order, Inventory, Review, and Shipping dispatchers share durable owner-lease claims, confirmed publication, retry backoff, stale-lease recovery, broker reconnection, and graceful shutdown behavior. Their HTTP servers can start while RabbitMQ is temporarily unavailable because committed outbox rows remain pending.
- Notification records persist a unique source `eventId`; duplicate deliveries return the existing notification without creating another in-app record or scheduling another email. Analytics raw-event records also persist a unique source `eventId` and skip events already marked processed.
- Analytics and Notification consumers now rethrow handler failures. The shared RabbitMQ consumer can therefore retry or dead-letter them instead of acknowledging a failed side effect.
- Order payment-event handling is monotonic: a redelivered success cannot regress a fulfilled order back to `PAID`, and a late failed/expired event cannot cancel an already-paid order. Inventory confirmation/release conditionally claims a `RESERVED` row before mutating stock, preventing concurrent redelivery from applying the stock movement twice.

## Upgrade and production caveats

- RabbitMQ was unavailable during implementation, so the topology and delivery behavior have only been verified with unit tests. No broker restart, duplicate delivery, consumer crash, or durable recovery integration test has run.
- Existing queues created as classic queues cannot be reasserted as quorum queues with different arguments. A production rollout needs an explicit queue migration/versioning plan and must preserve queued messages; this code does not delete or recreate queues automatically.
- Docker Compose currently defines one RabbitMQ node. A single node can host quorum queues but cannot provide node quorum/high availability. Production HA requires an appropriately sized RabbitMQ cluster and topology policy review.
- Transactional outbox now covers Payment status events, Inventory confirmation/release/low-stock events, Order creation and lifecycle events, Review creation, and Shipping milestones. The checkout boundary deliberately queues `OrderCreated` only after its external setup steps succeed, so failed compensated checkouts are never announced as created.
- Notification and Analytics have event-ID deduplication, but this is not yet a general atomic inbox implementation. Analytics' incremental report mutations are not in the same transaction as its processed marker, and Notification's email log/scheduling is not atomic with notification creation. A crash in those narrow windows can still cause a partial or missing side effect.
- Runtime Redis/RabbitMQ configuration, broker ACLs/TLS, Redis failover behavior, and deployment acceptance remain unverified. Redis limit behavior is unit-tested with a mocked client only; concurrency, expiry, and outage semantics need live Redis acceptance.
- Multi-node gateway rate-limit keys currently include the library's client key plus an explicit limiter namespace. Proxy/trust-proxy configuration must be reviewed against the actual load balancer so client IP identity cannot be spoofed or collapsed before public deployment.

## Atomic inbox implemented (2026-09-25)

The gap recorded above — "not yet a general atomic inbox implementation" — understated the
situation. Nothing named `inbox` existed anywhere in the repository: no module, no Prisma model, no
migration. The outbox covered five producers, and the consumer side had only per-row event-id
checks. Both Analytics and Notification really did have the partial-side-effect window.

### The core

`packages/common/src/inbox.ts` provides `processWithInbox`, a storage-agnostic runtime with an
`InboxPort` seam. The seam exists because every service generates its own Prisma client, so there is
no shared client type to depend on; each service supplies a thin adapter.

The guarantee is a single transaction:

```
runInTransaction(tx => {
  claim(tx, {eventId, consumer})   -> DUPLICATE ? skip
  handler(tx)                      -> the business mutation
  markProcessed(tx, {eventId, consumer})
})
```

Because the claim, the mutation, and the processed marker share one transaction, a crash at any
point leaves either all of it or none of it. There is no lease to expire and no stuck claim to
recover: a failed attempt rolls back its own claim. A concurrent worker that loses the unique race
surfaces as a `P2002` and is read as a duplicate delivery rather than an error.

`(event_id, consumer)` is the unique key, so one event may be applied once per consumer. That is
what lets the RabbitMQ and Kafka paths each project the same domain fact into their own tables.

### Analytics

Was: `saveEvent` -> handler mutations -> `markEventProcessed`, three separate transactions. A crash
between the second and third replayed the mutations on redelivery, double-counting revenue and
order counters.

Now: the projection is split into `prepareAnalyticsEvent` (HTTP catalog/review enrichment) and
`applyAnalyticsEvent` (writes only). Enrichment runs **before** the transaction opens, so the
projection no longer holds row locks while waiting on another service. The six repository upsert
methods accept a write client so their mutations join the inbox transaction.
`analyticsRepository.saveEvent` / `markEventProcessed` were removed as superseded. The
`analytics_events` table was **not** dropped; retiring it is a data-retention decision.

### Notification

Was worse than Analytics. `createNotification` wrote the in-app row, then called
`emailService.sendEmail(...)` as an unawaited promise with in-process `setTimeout` retries. A crash
after the row committed lost the email permanently, and redelivery short-circuited on the existing
`source_event_id`, so the retry never queued it either.

Now:

- `email_logs` is a durable claimed queue (`available_at`, `locked_at`, `lock_token`). Enqueuing
  happens **inside the caller's transaction**; delivery happens later in a dispatcher with
  exponential backoff and a terminal FAILED state.
- `emailService` is split into template resolution, transactional `queueEmail`, and transport-only
  `deliverEmail`. The in-process retry loop is gone.
- The consumer is split into `prepareNotificationEvent` (recipient lookups) and
  `applyNotificationEvent` (writes only).
- Delivery is at-least-once by construction: the transport may accept a message and the process may
  die before the row is marked SENT, so the lease expires and it is sent again. That is the safe
  direction for transactional mail — losing an order confirmation is worse than sending it twice.

Fabricated data removed. The consumer previously fell back to `${userId}@example.com`,
`Premium Product`, and `seller-id-fallback` when a lookup failed, and reached Review Service through
a hard-coded `http://localhost:3010`. A guessed address sends real mail to the wrong person, so
those lookups now throw and the event goes through bounded retry and DLQ.

### Validation against live PostgreSQL 16

Both suites fail rather than skip when the database is unreachable, so neither can pass vacuously.

| Check | Result |
|---|---|
| `packages/common` inbox unit tests | **7/7** (plus 6 pre-existing RabbitMQ = 13/13) |
| `analytics.inbox.test.ts`, live PostgreSQL | **7/7** |
| `notification.inbox.test.ts`, live PostgreSQL | **9/9** |
| Analytics Service full suite | **39/39** |
| Notification Service full suite | **43/43** |

Live cases proven: mutation and consumed marker commit together; a redelivered event is not applied
twice; 10 concurrent deliveries of one event yield exactly 1 PROCESSED and 9 SKIPPED_DUPLICATE with
the counter incremented once; a handler failure after writing rolls back the mutation and leaves no
processed marker; a previously failed event applies exactly once on redelivery; deduplication is
independent per consumer name. For Notification additionally: a failed write leaves neither
notification nor email; two dispatchers claim one email job exactly once; a sent job is not
re-claimed; the retry budget is honoured before a terminal FAILED; an unknown template is refused
rather than silently skipped; token and URL values are redacted in the log table.

### Two defects found while doing this

- `EmailService`'s constructor called `initializeTransporter()`, which provisions an Ethereal
  account over the network when no SMTP credentials are configured. **Importing the module performed
  network I/O.** Initialization is now lazy; Notification's suite went from 204s to 4.9s.
- Order Service returned **500 for validation errors** because `ZodError` was unhandled in its error
  middleware, unlike every other service. Now 400.

### Still open for Phase 3

- Live RabbitMQ fault acceptance: duplicate delivery, poison message, bounded retry, DLQ, consumer
  crash, broker restart, backlog recovery. RabbitMQ is running locally but these scenarios were not
  executed in this session.
- Live Redis acceptance: cross-instance rate limiting, atomic increment/expiry, outage fail-closed,
  restart/failover, trust-proxy client identity. Redis is running locally but untested here.
- Queue migration/versioning documentation for the classic-to-quorum transition.
- HA acceptance for both brokers. A single-node local container is not a cluster.

## Validation record

| Check | Result | Limitation |
|---|---|---|
| Common RabbitMQ helper tests | Pass, 6/6 | Mock broker channel; no live broker semantics |
| API Gateway Redis store tests | Pass, 4/4 | Mock Redis client; no live concurrency/outage test |
| API Gateway TypeScript build | Pass | Compile only |
| Root workspace build | Pass | Compile/build only |
| Docker Engine / RabbitMQ port 5672 | Unavailable | No live broker restart/recovery tests |
| Redis port 6379 | Unavailable | No distributed limit/cart runtime tests |
| Payment outbox unit/service tests | Pass, Payment 30/30 | Mocked DB/broker; migration not exercised in this continuation |
| Consumer dedupe/retry tests | Pass; Notification 29/29, Analytics 14/14, Order 49/49, Inventory 18/18 | Partial inbox/idempotency only; DB-backed route tests tolerate offline PostgreSQL |
| Order, Review, Shipping outbox/service suites | Pass; Order 67/67 on live PostgreSQL 16, Review 17/17, Shipping 27/27 | Review/Shipping broker behavior remains mocked in these suites |
| Inventory outbox/service suite | Pass, 24/24 | Mocked outbox/broker behavior; route tests tolerate offline PostgreSQL |
| Affected service builds and workspace typecheck | Pass; 4 builds and all 23 workspace typechecks | Compile/type validation only |
| Changed Prisma schemas | Pass, 4/4 | Schema validation only; new migrations not deployed to a live database |
| Outbox/inbox coverage | Code complete for current producers/consumers | Live migration, crash/recovery, broker, and HA acceptance remain |
| Broker/runtime fault acceptance | Not run | Docker Engine and broker ports unavailable |

## OrderCreated finalization acceptance (2026-09-27)

- A clean temporary PostgreSQL 16 cluster accepted the complete six-migration Order Service chain,
  including `20260927120000_add_checkout_finalization`.
- Live transaction tests prove `checkout_finalized_at`, the order-history marker, and deterministic
  `OrderCreated` outbox row commit together. A forced outbox primary-key conflict rolls all marker
  and history writes back.
- Full Order Service suite: **67/67** against the live database. Unit subset: **55/55**. Typecheck,
  production build, Prisma Client generation, and schema validation pass.
- The temporary PostgreSQL cluster was stopped and removed after the run. Docker Desktop still
  crashes on an inaccessible Windows `dockerInference` runtime socket, so live RabbitMQ/Redis fault
  acceptance remains blocked without resetting Docker state.

Phase 3 remains open. Do not treat local queue mocks or a successful build as production reliability proof.
