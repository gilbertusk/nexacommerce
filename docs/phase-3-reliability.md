# Phase 3 — Redis and RabbitMQ Reliability

Last updated: 2026-09-24
Status: In progress; Payment, Inventory, selected Order lifecycle, Review, and Shipping outboxes plus partial consumer deduplication implemented locally; checkout-saga finalization, full inbox semantics, and live broker acceptance pending

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
- Order cancellation, payment acceptance, payment failure/expiry cancellation, and completion now write their status/history plus `OrderCancelled`, `OrderPaid`, or `OrderCompleted` envelope in one transaction. Conditional status claims prevent concurrent deliveries from producing duplicate transitions. Initial `OrderCreated` remains a confirmed, fail-closed publish because checkout is a multi-service saga and must not announce an order before stock/payment setup succeeds.
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
- Transactional outbox now covers Payment status events, Inventory confirmation/release/low-stock events, selected Order lifecycle events, Review creation, and Shipping milestones. `OrderCreated` still follows the checkout saga's direct confirmed publish; its finalization boundary needs an explicit saga design before Phase 3 can exit.
- Notification and Analytics have event-ID deduplication, but this is not yet a general atomic inbox implementation. Analytics' incremental report mutations are not in the same transaction as its processed marker, and Notification's email log/scheduling is not atomic with notification creation. A crash in those narrow windows can still cause a partial or missing side effect.
- Runtime Redis/RabbitMQ configuration, broker ACLs/TLS, Redis failover behavior, and deployment acceptance remain unverified. Redis limit behavior is unit-tested with a mocked client only; concurrency, expiry, and outage semantics need live Redis acceptance.
- Multi-node gateway rate-limit keys currently include the library's client key plus an explicit limiter namespace. Proxy/trust-proxy configuration must be reviewed against the actual load balancer so client IP identity cannot be spoofed or collapsed before public deployment.

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
| Order, Review, Shipping outbox/service suites | Pass; Order 56/56, Review 17/17, Shipping 27/27 | Mocked outbox/broker behavior; route tests tolerate offline PostgreSQL |
| Inventory outbox/service suite | Pass, 24/24 | Mocked outbox/broker behavior; route tests tolerate offline PostgreSQL |
| Affected service builds and workspace typecheck | Pass; 4 builds and all 23 workspace typechecks | Compile/type validation only |
| Changed Prisma schemas | Pass, 4/4 | Schema validation only; new migrations not deployed to a live database |
| Outbox/inbox coverage | Partial | Payment, Inventory, selected Order, Review, and Shipping producers covered; `OrderCreated` saga finalization and atomic inbox work remain |
| Broker/runtime fault acceptance | Not run | Docker Engine and broker ports unavailable |

Phase 3 remains open. Do not treat local queue mocks or a successful build as production reliability proof.
