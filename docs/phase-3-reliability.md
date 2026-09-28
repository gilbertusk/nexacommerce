# Phase 3 — Redis and RabbitMQ Reliability

Last updated: 2026-09-28
Status: **Local implementation and single-node runtime acceptance complete.** Live RabbitMQ,
Redis, and PostgreSQL fault suites pass against disposable containers (see "Phase 3 completion
pass" below). **Production HA acceptance is not done**: every broker test ran against a single
RabbitMQ node and a single Redis instance, which prove delivery semantics, not high availability.

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

> Superseded 2026-09-28 where marked. The bullets below are the original record; the
> "Phase 3 completion pass" section states what is now true.

- (Superseded: live broker suites now run.) RabbitMQ was unavailable during implementation, so the topology and delivery behavior have only been verified with unit tests. No broker restart, duplicate delivery, consumer crash, or durable recovery integration test has run.
- (Addressed: procedure, audit tool, and live proof below.) Existing queues created as classic queues cannot be reasserted as quorum queues with different arguments. A production rollout needs an explicit queue migration/versioning plan and must preserve queued messages; this code does not delete or recreate queues automatically.
- Docker Compose currently defines one RabbitMQ node. A single node can host quorum queues but cannot provide node quorum/high availability. Production HA requires an appropriately sized RabbitMQ cluster and topology policy review.
- Transactional outbox now covers Payment status events, Inventory confirmation/release/low-stock events, Order creation and lifecycle events, Review creation, and Shipping milestones. The checkout boundary deliberately queues `OrderCreated` only after its external setup steps succeed, so failed compensated checkouts are never announced as created.
- (Superseded 2026-09-25 by the atomic inbox; its adapters were further hardened 2026-09-28.) Notification and Analytics have event-ID deduplication, but this is not yet a general atomic inbox implementation. Analytics' incremental report mutations are not in the same transaction as its processed marker, and Notification's email log/scheduling is not atomic with notification creation. A crash in those narrow windows can still cause a partial or missing side effect.
- (Partly superseded: live Redis suite now passes; ACL/TLS/failover remain production gates.) Runtime Redis/RabbitMQ configuration, broker ACLs/TLS, Redis failover behavior, and deployment acceptance remain unverified. Redis limit behavior is unit-tested with a mocked client only; concurrency, expiry, and outage semantics need live Redis acceptance.
- (Addressed: `TRUST_PROXY`, see below.) Multi-node gateway rate-limit keys currently include the library's client key plus an explicit limiter namespace. Proxy/trust-proxy configuration must be reviewed against the actual load balancer so client IP identity cannot be spoofed or collapsed before public deployment.

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
(2026-09-27 statement; see the completion pass below for the current state.)

## Phase 3 completion pass (2026-09-28)

This pass verified the implementation against live brokers instead of the tracker, fixed what the
live runs and the code audit exposed, and closed the remaining local Phase 3 items. Environment:
Linux cloud container, Docker Engine 29.3.1, disposable containers `phase3-test-pg`
(PostgreSQL 16), `phase3-test-rmq` (RabbitMQ 3.13, single node), `phase3-test-redis` (Redis 7),
and `phase3-test-kafka` (Kafka 4.3.1, only for the Analytics Kafka suite). All were removed
afterwards.

### Defects found and fixed

| Area | Defect | Fix |
|---|---|---|
| Inbox (Analytics, Notification) | Taking over a FAILED inbox row used an unconditional update. Two concurrent redeliveries of a previously failed event could **both** claim it and apply the mutation twice. A new live test reproduced it (1 failure) against the old adapter. | Shared `createPrismaInboxPort` claims with `UPDATE ... WHERE status <> 'PROCESSED'`; under READ COMMITTED the loser re-evaluates the predicate and reads the event as a duplicate. |
| Inbox | `recordFailure` used `upsert`, which could overwrite a row another worker had just committed as PROCESSED with FAILED, making the event eligible to be applied again. | Failure bookkeeping never downgrades a PROCESSED row. |
| Inbox | Any Prisma `P2002` was read as "another worker owns this event". A unique violation from the handler's own tables (e.g. a colliding tracking number) would have acknowledged an event whose mutation never committed. | Only a conflict on the inbox key itself (`InboxEvent` / `event_id`) counts as a duplicate; everything else fails and retries. |
| RabbitMQ consumer | Malformed JSON and envelopes without `eventId`/`eventName` went through the 5-attempt, 5 s-delay retry path before reaching the DLQ (the docs claimed they went straight there). | `NonRetryableEventError`: poison messages are dead-lettered on the first delivery. |
| RabbitMQ consumer | When the retry/DLQ publish failed because the channel closed, `channel.nack()` threw inside the consume callback — an unhandled rejection that can crash the process. | The nack is guarded; the broker requeues unacknowledged deliveries of a closed channel anyway. |
| Analytics, Notification, Product consumers | Consumers attached once at startup and **never re-attached** after a broker restart; the process stayed up and healthy while the queue filled. | `createResilientConsumer` reconnects, re-declares topology, re-registers consumers, and publishes readiness. Proven live across a broker restart. |
| Order `OrderDelivered` consumer | Unconditional `update` could move a COMPLETED/returned/refunded order back to DELIVERED on a redelivered event, and could "deliver" a cancelled order. | Monotonic conditional transition from PAID/PROCESSING/PACKED/SHIPPED only. |
| Product rating consumer | A failed Review Service lookup wrote a fabricated rating of 0 from 0 reviews over the real rating. | The lookup throws; the event retries and dead-letters. |
| Shipping `OrderPaid` consumer | Each seller label committed in its own transaction; a failure on seller 2 left seller 1's label committed while the event retried. | All labels plus the inbox marker commit in one transaction. |
| Checkout saga | A crash between order insert and finalization left an unfinalized order holding reserved stock (and possibly a voucher) until the 24 h payment expiry. | Recovery sweep (below). |
| Checkout | A retried HTTP checkout for an already-used quote failed with a 4xx even when the first attempt had succeeded. | Idempotent replay (below). |
| Analytics | Compensated checkouts emitted `OrderCancelled` for orders never announced by `OrderCreated`, inflating the cancellation rate. | `OrderCancelled.payload.checkoutFinalized=false`; both the RabbitMQ and Kafka projections skip it. Inventory still releases stock. |
| API Gateway | No `trust proxy` configuration: behind a load balancer every customer shares the balancer's rate-limit key. | Validated `TRUST_PROXY` (below). |
| API Gateway | `lazyConnect` + `enableOfflineQueue:false` with no explicit connect: the first requests after boot raced the connection and were rejected with 503. | Explicit connect at startup, readiness tracking, graceful quit. |
| Shipping migrations | A fresh deploy reported drift on `shipping_rates.updated_at` (backfill default left in place). | `20260928161000_align_shipping_rates_updated_at` drops only the default. |

### `OrderCreated` finalization design

The saga boundary is the single database transaction in `finalizeCheckoutWithOrderCreated`:

1. Order row inserted as `PENDING_PAYMENT`, `checkout_finalized_at IS NULL` (own transaction).
2. External steps, each compensated on failure: inventory reservation, voucher application,
   payment invoice creation (idempotent per order id).
3. **Finalization transaction**: conditional `UPDATE orders SET checkout_finalized_at = now()
   WHERE status = 'PENDING_PAYMENT' AND checkout_finalized_at IS NULL`, a status-history marker,
   and the outbox row with the deterministic id `order-created:<orderId>` (also the envelope
   `eventId` and the AMQP `messageId`). Either all three commit or none.
4. Cart cleanup, best effort, after commit.

`OrderCreated` is never published from the request. The dispatcher publishes it later with
confirms; its id never changes across dispatcher retries. Guarantees and their evidence:

| Guarantee | Mechanism | Evidence |
|---|---|---|
| Not visible before stock + payment setup | Outbox row only in the finalization transaction | `checkout-finalization.test.ts`, live |
| One order per quote | Unique `orders.shipping_quote_id` + quote consume bound to one order id | existing |
| Retried HTTP checkout creates nothing new | Replay: finalized → existing order + idempotent payment; unfinalized → 409; cancelled → 409 "request a new quote" | 4 unit tests |
| One `OrderCreated`, stable id | Deterministic outbox primary key; 5 concurrent finalizations → exactly 1 row | `order.reliability.test.ts`, live |
| Broker outage cannot lose it | Finalization never touches the broker; dispatcher leaves the row PENDING (no lease held) and publishes after recovery | `order.rabbitmq.live.test.ts`: broker stopped, finalize, dispatch fails, broker started, exactly one delivery with `messageId = order-created:<id>` |
| Crash between insert and finalization | `recoverStalledCheckouts` cancels unfinalized orders older than `CHECKOUT_FINALIZATION_TIMEOUT_MS` (default 15 min) with `checkoutFinalized:false`; Inventory releases stock from the `OrderCancelled` event; voucher release is idempotent | live: stalled order cancelled once, fresh and finalized orders untouched, second sweep is a no-op |
| Finalization vs recovery race | Both claim the same row with `checkout_finalized_at IS NULL`; exactly one wins | live, 5 rounds of concurrent finalize + abandon |

Known residual: a payment invoice created just before a crash is not cancelled at Midtrans by the
sweep; the order is CANCELLED, so a late `PaymentSuccess` is refused and dead-lettered for manual
refund. The customer never received that invoice's token, so this needs a crash in a
milliseconds-wide window plus a payment against an unseen invoice.

### Consumer inventory (every `createConsumer`)

| Service / queue | Durable side effect | Strategy | Live proof |
|---|---|---|---|
| Order `order-service.payment-events` | Order status, history, `OrderPaid`/`OrderCancelled` outbox | **Atomic inbox** (new) + conditional status claim; voucher release after commit, idempotent, retried via redelivery | duplicate, 10× concurrent, failure-then-redelivery, crash-before-ack over RabbitMQ |
| Order `order-service.shipping-events` | Order status, history | **Atomic inbox** (new) + monotonic conditional transition | late redelivery on COMPLETED, 6× concurrent |
| Order `order-service.stock-events` | none (log only) | no inbox needed | — |
| Inventory `payment-events`, `order-events` | Stock, movements, stock outbox events | Per-reservation conditional claim (`RESERVED → CONFIRMED/RELEASED`) in the same transaction as the movement and outbox rows. Every mutation is keyed by a reservation that can transition once, so an inbox would add no guarantee. Owner lookup happens before the transaction. | existing |
| Shipping `shipping-service.order-events` | Seller labels + history | **Atomic inbox** (new), all labels in one transaction; `(order_id, seller_id)` unique kept as defence in depth | partial failure → none committed, redelivery → all once, 6× concurrent |
| Product `product-service.review-events` | Product rating summary | Absolute value re-read from Review Service on every delivery: duplicates and reordering converge on the current value; lookup failure throws | unit |
| Analytics `analytics-service.events` | Report counters | Atomic inbox (hardened) | race test, 8 cases live |
| Notification `notification-service.events` | Notification rows, email jobs | Atomic inbox (hardened) + durable email queue | 43 tests live |
| Event Stream `event-stream-service.business-facts` | Kafka records | **At-least-once by design.** No database; the RabbitMQ message is acknowledged only after Kafka acknowledges the keyed record, so a crash in between republishes the same `eventId`. Exactly-once is **not** claimed. Downstream Kafka consumers deduplicate: the Analytics projection uses its own inbox consumer name. A persisted bridge inbox would not help — the side effect is in Kafka, which cannot join a PostgreSQL transaction. | existing Phase 4 suites |

Observation: `order-service.shipping-events` is bound only to `order.delivered`; the Order
handler for `OrderShipped` is unreachable from the broker and orders reach SHIPPED through the
seller API. Binding `order.shipped` would mark a multi-seller order shipped at the first seller's
pickup, so this is left unchanged pending a split-shipment decision.

### Live RabbitMQ acceptance

`npm run test:live -w packages/common` (12/12) runs in a disposable vhost with the production
topology names:

| Case | Result |
|---|---|
| Main/retry/DLQ are durable **quorum** queues; `x-delivery-limit=20`, DLX, retry TTL 5000, verified via the management API; re-declaration idempotent | pass |
| Topology audit (`auditQueue` over management data) reports every queue OK | pass |
| An existing **classic** queue with the same name is refused (`PRECONDITION_FAILED`) and its backlog is left intact | pass |
| Classic → quorum migration procedure with messages published during the cutover: all 6 message ids present afterwards, only duplicates possible, never loss | pass |
| Persistent publish, `messageId` = event id, `deliveryMode 2` | pass |
| Malformed message → exactly one DLQ copy, handler never called | pass |
| Handler failure with budget 2 → attempts at retry counts 0,1,2 with the same `messageId`, then exactly one DLQ copy; main/retry queues empty | pass |
| Retry publish refused by the broker (retry exchange deleted) → source not acked, returned to the queue, processed exactly once after recovery, no unhandled rejection | pass |
| Consumer dies before ack → message redelivered with `redelivered=true` | pass |
| Broker container restart → durable queue and 3-message persistent backlog survive and are consumed | pass |
| Resilient consumer re-attaches after a broker restart and resumes consumption; readiness 1 → 0 → 1 | pass |

`npm run test:live -w apps/order-service` (4/4), real PostgreSQL + RabbitMQ through the real
consumers, inbox, outbox, and dispatcher:

- the same `PaymentSuccess` delivered twice → one PAID transition, one `OrderPaid` on the broker
  whose `messageId` is its outbox id;
- consumer commits through the inbox then loses its connection before ack → the redelivery is
  acknowledged without a second transition or second `OrderPaid`;
- 3-event backlog published while the service was stopped → applied after restart;
- broker **stopped** while checkout finalizes → `OrderCreated` stays PENDING, published exactly
  once after the broker is started again.

### Live Redis acceptance and client identity

`npm run test:live -w apps/api-gateway` (8/8), production client factory and store, run with
`--detectOpenHandles` (none reported):

- 200 concurrent increments from two clients yield exactly 1..200;
- the window is set on the first hit and never extended; a counter that lost its TTL is repaired;
- a fresh window starts after expiry; limiter namespaces do not collide;
- two gateway replicas enforce one shared limit (`200×5, 429, 429`);
- Redis stopped → 503 `Request protection is temporarily unavailable`, error counter increases,
  `dependency_ready{redis}` 0; Redis started → client reconnects, readiness 1, requests pass;
- across a Redis restart a counter is either gone or keeps its original absolute expiry — never
  immortal, never larger.

Keys now live under `rate-limit:<limiter>:<client>`; the first deploy starts fresh windows.

`TRUST_PROXY` (validated at startup):

| Value | Meaning |
|---|---|
| empty / `false` | direct exposure; socket address is the client |
| `N` (1–10) | exactly N proxy hops in front of the gateway |
| CIDR/IP list, `loopback`, `linklocal`, `uniquelocal` | the listed proxies are trusted |
| `true`, `all`, `*` | **refused** — would let clients choose their key |

Tests (7/7) prove: a spoofed `X-Forwarded-For` on a direct request is ignored (all forged
addresses count against the one peer); many customers behind a trusted proxy keep separate keys;
a client behind the proxy cannot choose its key by prepending forged hops (both `loopback` and
`1`). Configure it to match the real balancer, e.g. `TRUST_PROXY=1` for one managed load balancer.

Redis holds only ephemeral state: carts (`cart:<userId>`, TTL) and rate-limit counters (TTL).
Checkout re-reads the cart and re-derives prices, stock, and the shipping quote server-side;
orders, payments, stock, and events are in PostgreSQL. Losing Redis resets carts and windows; it
cannot lose a commerce fact.

### Classic-to-quorum migration

Queue types cannot be changed in place, and services never delete queues. A broker created before
the quorum topology (all queues classic) is migrated per queue, one consumer service at a time,
with the service's consumers scaled to zero. Consumers are idempotent (inbox), so the procedure
allows duplicates and forbids loss.

1. **Audit**: `RABBITMQ_MANAGEMENT_URL=... npm run rabbitmq:topology -- audit --vhost /`
   lists `CLASSIC_NEEDS_MIGRATION` queues and their depth.
2. Declare a temporary quorum queue `<queue>.migration` and bind it with the **same** routing
   keys (overlap: both queues receive new messages — no gap).
3. Unbind the classic queue (new messages now reach only the temporary queue).
4. `npm run rabbitmq:topology -- move --from <queue> --to <queue>.migration` (confirmed copy,
   ack after confirm). Verify the classic queue shows 0 ready and 0 unacked.
5. **Operator step, manual**: delete the empty classic queue (`if-empty`). Tooling never deletes.
6. Deploy the new service version; `setupExchangeAndQueues` declares the quorum queue and its
   bindings (overlap again).
7. Unbind the temporary queue, then `move --from <queue>.migration --to <queue>`. Verify depth 0.
8. Start consumers; re-run the audit until it reports all OK. Remove `<queue>.migration` manually.

Retry queues are empty after their 5 s TTL once consumers are stopped; DLQ copies are moved the
same way. **Rollback** before step 5: rebind the classic queue and move messages back. After
step 5 the rollback target is the quorum queue, which older code can use because it declares the
same name (older code asserting classic arguments fails fast instead of deleting anything). The
procedure is proven end to end in the live suite.

### Production topology requirements (not met by Compose)

`docker-compose.yml` stays a single-node development environment and is not HA. Templates without
secrets: `infra/rabbitmq/rabbitmq.production.conf.example`, `infra/redis/redis.production.conf.example`.

- RabbitMQ: 3 or 5 nodes across failure domains, `pause_minority`, quorum default and initial
  cluster size 3, TLS-only AMQP and management, management API on an internal network, per-service
  users with vhost/queue-scoped permissions (no `guest`), disk/memory alarms, and
  `rabbitmq:topology audit` in the deploy pipeline.
- Redis: primary + ≥2 replicas with Sentinel or managed failover, TLS, ACL default-deny with
  per-service key-prefix users (`rate-limit:*`, `cart:*`), `noeviction` for the limiter (the
  current `allkeys-lru` in Compose would silently reset counters under memory pressure — fail
  open), no public ports.
- Readiness: alert on `nexacommerce_dependency_ready{dependency="rabbitmq"|"redis"} == 0`.
- Recovery: outbox rows and email jobs are durable in PostgreSQL; broker loss delays, never loses,
  committed events. PostgreSQL backup/PITR remains the durability boundary (Phase 5 drill).

### Observability signals

Every messaging service appends reliability metrics to its authenticated `GET /metrics`:

| Metric | Meaning |
|---|---|
| `nexacommerce_consumer_messages_total{queue,outcome}` | ACKED / RETRY_SCHEDULED / DEAD_LETTERED / REQUEUED |
| `nexacommerce_inbox_events_total{consumer,outcome}` | PROCESSED / SKIPPED_DUPLICATE / FAILED |
| `nexacommerce_outbox_dispatch_total{service,outcome}` | PUBLISHED / RESCHEDULED |
| `nexacommerce_backlog_rows{kind,service,state}` | outbox (`outbox_events`) and email (`email_logs`) pending/processing/failed/retrying, read from PostgreSQL on scrape |
| `nexacommerce_backlog_oldest_pending_age_seconds{kind,service}` | age of the oldest undelivered row |
| `nexacommerce_backlog_scrape_success{kind,service}` | 0 when the backlog query failed |
| `nexacommerce_dependency_ready{dependency}` | rabbitmq / redis / kafka connection readiness per replica |
| `nexacommerce_rate_limit_store_errors_total` | limiter storage failures (each answered 503) |

Consumer, inbox, and outbox logs carry `eventId`, `eventName`, `queue`/`consumer`,
`aggregateId`, `attempt`, and `outcome` — never payloads, URLs, or credentials. The DLQ depth
per queue is read from RabbitMQ (`<queue>.dead`); a full exporter/dashboard set stays in Phase 5.

### How to run the live suites

```bash
# Disposable containers (names must start with phase3-test-)
docker run -d --name phase3-test-rmq -p 127.0.0.1:56720:5672 -p 127.0.0.1:15673:15672 \
  -e RABBITMQ_DEFAULT_USER=phase3 -e RABBITMQ_DEFAULT_PASS=<local-only> rabbitmq:3.13-management
docker run -d --name phase3-test-redis -p 127.0.0.1:56390:6379 redis:7-alpine
export RABBITMQ_LIVE_URL=amqp://phase3:<local-only>@127.0.0.1:56720
export RABBITMQ_MANAGEMENT_URL=http://phase3:<local-only>@127.0.0.1:15673
export PHASE3_RABBITMQ_CONTAINER=phase3-test-rmq PHASE3_REDIS_CONTAINER=phase3-test-redis
export REDIS_LIVE_URL=redis://127.0.0.1:56390
export DATABASE_URL=<disposable PostgreSQL, order schema migrated>
npm run test:live
```

The suites fail (never skip) when configuration is missing, stop/start only the named
`phase3-test-*` containers, and delete only the vhosts and key namespaces they created.

### Validation record (2026-09-28)

| Check | Result |
|---|---|
| Prisma validate, all 11 schemas | pass |
| `migrate deploy` from an empty database, all 11 services (39 migrations) | pass |
| `migrate status` | up to date, all 11 |
| `migrate diff` database vs schema | no difference, all 11 |
| Live RabbitMQ (common) | 12/12 |
| Live Order PostgreSQL + RabbitMQ | 4/4 |
| Live Redis (gateway) | 8/8, no open handles |
| Common unit | 36/36 |
| Order (unit + live PostgreSQL) | 90/90 |
| Shipping (unit + live PostgreSQL) | 68/68 |
| Analytics (incl. live Kafka + PostgreSQL) | 60/60 |
| Notification (live PostgreSQL) | 43/43 |
| Product | 40/40 |
| API Gateway unit (incl. trust proxy) | 11/11 |
| Payment 31, Inventory 24, Review 17, Auth 29, User 14, Voucher 17, Cart 6 (live Redis), Event Stream 21 | all pass |
| Workspace build, typecheck (24 workspaces), lint | pass; lint 0 errors, 6 pre-existing font warnings |

### Still external

- Production HA acceptance: multi-node RabbitMQ with node loss during publish/consume, Redis
  Sentinel/managed failover, network partitions. None of this can be shown on one node.
- TLS, ACLs, per-service broker/Redis credentials, and secret management in the target platform.
- Running the classic-to-quorum procedure against the real production broker, if one exists with
  classic queues.
- Dashboards and alert routing for the metrics above (Phase 5).
