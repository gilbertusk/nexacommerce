# Phase 4 — Kafka Event Streaming

Last updated: 2026-09-26
Status: In progress; local live bridge, database-backed projection, replay, ordering, restart, and single-broker outage checks passed; live cutover comparison and production cluster acceptance remain pending

## System boundary

| Component | Responsibility | Must not be used for |
|---|---|---|
| PostgreSQL | Authoritative commerce state and transactional outbox | Replay fan-out or ephemeral cache |
| RabbitMQ | Operational workflow delivery, retries, and commands/events that drive order/payment/inventory actions | Long-term analytics replay |
| Kafka | Retained, replayable business facts for analytics, audit, indexing, and future recommendations | Blocking checkout or other synchronous business decisions |
| Redis | Ephemeral cart, cache, session, rate-limit, and coordination state | Durable business facts |

Services do not publish independently to RabbitMQ and Kafka. A domain transaction writes one stable event to its outbox. The existing outbox dispatcher publishes it to RabbitMQ. RabbitMQ fans replayable facts into the durable `event-stream-service.business-facts` queue, and Event Stream Service acknowledges that delivery only after Kafka acknowledges the record.

This design is deliberately at-least-once across the RabbitMQ/Kafka boundary. A process crash after Kafka acknowledgement but before RabbitMQ acknowledgement can create a Kafka duplicate with the same `eventId`. Every Kafka projection must therefore persist an inbox claim keyed by `eventId` and apply the projection mutation atomically with that claim.

## Topic catalog

All topics carry immutable facts and use `cleanup.policy=delete`. Compaction is intentionally disabled: compacting facts by aggregate key would erase history needed for audit/replay. A future latest-state projection must use a separately named compacted topic such as `nexacommerce.product-state.v1`, never change a fact topic in place.

| Topic | Key | Partitions | Retention | Intended consumer groups |
|---|---|---:|---:|---|
| `nexacommerce.orders.v1` | `orderId` | 6 | 180 days | `analytics-projection-v1`, `audit-archive-v1`, `search-index-v1` |
| `nexacommerce.payments.v1` | `paymentId` | 6 | 365 days | `analytics-projection-v1`, `audit-archive-v1` |
| `nexacommerce.inventory.v1` | `orderId`; low-stock uses `productId` | 6 | 90 days | `analytics-projection-v1`, `recommendations-v1` |
| `nexacommerce.shipping.v1` | `orderId` | 6 | 180 days | `analytics-projection-v1`, `audit-archive-v1` |
| `nexacommerce.reviews.v1` | `productId` | 6 | 365 days | `analytics-projection-v1`, `search-index-v1`, `recommendations-v1` |

The key guarantees ordering only for records with the same key inside one topic/partition. It does not create a global order across topics.

## Schema contract

Kafka values use a JSON envelope:

```json
{
  "schemaVersion": 1,
  "eventId": "stable-source-event-id",
  "eventName": "OrderPaid",
  "occurredAt": "2026-09-25T00:00:00.000Z",
  "streamedAt": "2026-09-25T00:00:01.000Z",
  "partitionKey": "order-id",
  "payload": {}
}
```

Compatibility rules:

- Additive optional payload fields are allowed within version 1.
- Existing field meaning, type, and partition-key semantics cannot change in place.
- Breaking changes require a new topic suffix and schema version, for example `orders.v2`.
- Consumers must reject unsupported schema versions rather than silently interpreting them.
- `eventId`, `eventName`, and `schemaVersion` are repeated in Kafka headers for inspection; the JSON value remains authoritative.

## Replay and consumer rules

1. Pause the affected projection group and record its current offsets.
2. Prefer a new, explicitly named replay group (for example `analytics-rebuild-20260925`) to build a side-by-side projection.
3. Consume from the required earliest timestamp/offset with the same inbox deduplication rules used in normal processing.
4. Validate counts, aggregates, and lag before switching reads to the rebuilt projection.
5. Keep the original group/offset record until rollback is no longer required.

Resetting an existing production group in place requires an approved rollback window. Replays must never invoke RabbitMQ workflow commands or mutate authoritative order/payment/inventory state.

## Implemented locally

- `event-stream-service.business-facts` is a durable quorum queue bound to all 16 versioned business-event routing keys.
- Event Stream Service provisions five explicit topics; automatic topic creation is disabled.
- Kafka records use aggregate keys, schema envelope version 1, source timestamps, stable event IDs, and all-in-sync-replica acknowledgement.
- Producer settings enable KafkaJS idempotence and one in-flight request. This reduces producer-session duplicates but does not replace consumer inbox deduplication across bridge restarts.
- Liveness (`/health`) is separate from dependency readiness (`/ready`). The bridge reconnects without making Kafka part of a commerce workflow's availability path.
- A reusable inbox contract and `processIdempotently` helper cover claim, completion, duplicate skip, and failed-claim release behavior.
- The official Apache Kafka 4.3.1 JVM image is pinned in Compose in single-node KRaft mode for local validation.

## Validation record

| Check | Result | Limitation |
|---|---|---|
| Event Stream Service unit tests | Pass, 20/20 | Includes publish failure/readiness recovery and failed-connect cleanup; broker behavior is covered separately below |
| Event Stream Service typecheck/build | Pass | Compile only |
| Shared RabbitMQ reliability tests | Pass, 6/6 | Mock channel |
| Dependency audit after KafkaJS install | Pass, 0 vulnerabilities | Registry audit only |
| Compose config and container packaging | Pass | Single-node local topology; Event Stream and representative API Gateway images build and resolve every required internal package after a live startup failure exposed invalid wildcard copy paths |
| Kafka/RabbitMQ live bridge | Pass | RabbitMQ event reached Kafka with the same `eventId`, aggregate key, source timestamp, payload, and schema-v1 envelope |
| Topic provisioning | Pass | Five topics, 6 partitions each, replication factor 1, delete retention 90/180/365 days as catalogued |
| Replay from earliest | Pass | Fresh console consumer read the retained records from the beginning |
| Same-key ordering | Pass | Two sequential `OrderPaid` facts with one `orderId` were observed in source order |
| Duplicate delivery | Pass as at-least-once evidence | Publishing the same `eventId` twice produced two Kafka records; real projections must deduplicate atomically |
| Bridge restart/backlog recovery | Pass | Event remained ready in the durable RabbitMQ queue with zero consumers and was forwarded after bridge restart |
| Kafka outage/recovery | Pass | Delivery remained unacknowledged while Kafka was stopped and the queue drained only after Kafka recovered and accepted the record |
| RabbitMQ outage/recovery | Pass | `/ready` returned 503 during outage, then returned ready with one restored consumer after broker recovery |
| Container CI smoke test | Added | CI waits for bridge readiness, publishes a synthetic RabbitMQ fact, and asserts the matching Kafka record |
| Root typecheck/lint | Pass | 24 workspaces typecheck; lint has 0 errors and 6 pre-existing Google-font warnings |

## Analytics Kafka projection (2026-09-25)

The first real projection now exists, closing the largest Phase 4 gap.

### Boundary

The event path is unchanged and remains one-way:

```
domain outbox -> RabbitMQ -> event-stream-service -> Kafka -> analytics projection
```

No domain service publishes to both RabbitMQ and Kafka. The projection is a
read-side consumer only: it writes to `daily_sales_projections` and
`kafka_projection_progress` and to nothing else. It never calls RabbitMQ and
never mutates order, payment, inventory, or shipping state, so replaying a
topic from any offset cannot re-run a business workflow.

### Double-counting and cutover

The same domain fact reaches Analytics twice: once over RabbitMQ into
`daily_sales_report`, and once over Kafka into the new
`daily_sales_projections`. Writing both consumers into one table would count
every order and every payment twice.

The two are therefore kept in separate tables, with separate inbox consumer
names (`analytics.rabbitmq` and `analytics.kafka`) so each path may apply an
event exactly once to its own table. Read queries still serve
`daily_sales_report`; nothing reads the Kafka projection yet.

Cutover sequence, when the projection is trusted:

1. Rebuild `daily_sales_projections` from the topic using a fresh consumer
   group, with the RabbitMQ consumer still running.
2. Compare the two tables over a shared window and require exact agreement on
   orders, revenue, items sold, cancelled, and completed.
3. Repoint the read queries to the projection.
4. Only then retire the RabbitMQ analytics consumer.

Running both write paths into one table at any point in that sequence is the
failure this design exists to prevent.

The comparison gate is exposed to administrators at
`GET /analytics/projections/daily/comparison?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`.
It compares the union of dates in both tables and requires exact agreement for
orders, revenue, items sold, cancelled orders, and completed orders. A date
missing from either source is a mismatch. Two empty tables return `NO_DATA`
and `cutoverEligible: false`, so an unused projection cannot accidentally be
accepted as production-ready. The default window is 30 days and the maximum
window is 366 days.

Daily reads are selected with `ANALYTICS_DAILY_READ_MODEL`, which defaults to
`RABBITMQ`. Setting it to `KAFKA` does not blindly enable the new table: before
opening its HTTP port, Analytics compares the configured recent window
(`ANALYTICS_KAFKA_CUTOVER_WINDOW_DAYS`, default 30) and exits if the result is
`MISMATCH` or `NO_DATA`. This is deliberately fail-closed. After a successful
cutover and observation period, `ANALYTICS_RABBITMQ_CONSUMER_ENABLED=false`
retires the legacy writer. Configuration validation refuses to disable that
consumer while the read model is still `RABBITMQ`.

Only daily dashboard totals and daily revenue/order time series move with this
switch. Monthly, seller, product, category, and payment reports still use their
existing projections and are not falsely presented as Kafka-backed.

### Guarantees and how each is enforced

| Guarantee | Mechanism |
|---|---|
| Exactly-once application | `(event_id, consumer)` unique key; projection write and consumed marker share one transaction |
| Offset only after commit | `autoCommit: false`; a `FAILED` projection throws before `commitOffsets`, so the partition is re-read |
| Per-partition ordering | `partitionsConsumedConcurrently: 1`; aggregate key set by the bridge |
| Unsupported schema rejected | `checkEnvelope` accepts only `schemaVersion` 1; others are recorded and stepped over |
| Poison message does not stall a partition | Malformed or unsupported messages advance the offset and increment a counter rather than retrying forever |
| Replay safety | Projection tables only; no workflow calls, no authoritative state |
| Observability | `/analytics/readiness` reports connected state, projected/duplicate/rejected/failure counts, last event time, and per-partition lag |

A rejected message advancing the offset is a deliberate trade. Blocking the
partition until a human intervenes would stall every well-formed event behind
one bad record. The rejection counter is the signal an alert should watch.

### Validation record

Live Kafka 4.3.1 plus live PostgreSQL 16, `tests/integration/kafka-projection.test.ts`,
**12/12 pass**. The suite fails rather than skips when either dependency is
unreachable.

| Case | Result |
|---|---|
| Unsupported `schemaVersion` rejected, nothing projected | Pass |
| Non-JSON body rejected | Pass |
| Envelope missing `eventId` rejected | Pass |
| Order projected and partition progress recorded in one transaction | Pass |
| Replayed event not counted twice | Pass |
| 8 concurrent deliveries of one event produce exactly 1 projection | Pass |
| `OrderPaid` not projected, so `PaymentSuccess` revenue is not doubled | Pass |
| Transaction failure returns `FAILED` and projects nothing | Pass |
| Redelivery after an uncommitted offset applies exactly once | Pass |
| Event remains projectable after a transient failure | Pass |
| Per-key ordering preserved through a partitioned topic (live broker) | Pass |
| Fresh consumer group replays the log from the beginning (live broker) | Pass |

Not covered: multi-broker failover, rebalance under load, and sustained lag
behaviour. Those need a real cluster, not a single-node KRaft container.

## Remaining exit gates

- Rebuild the projection from the intended topic history, run the comparison endpoint over the approved shared window, and retain the evidence. The read model must not be switched unless it returns `MATCH` and `cutoverEligible: true`.
- Repoint the daily Analytics reads to the Kafka projection, observe them, then retire the RabbitMQ analytics consumer. The code still serves `daily_sales_report` by default because no representative cutover comparison has passed yet.
- Production cluster requirements are now written down in [kafka-production-requirements.md](kafka-production-requirements.md): 3 brokers, RF 3, `min.insync.replicas` 2, `unclean.leader.election.enable=false`, TLS plus SASL with per-service ACLs, storage sizing, monitoring and alert thresholds, export, and DR. **Marked external acceptance: no production cluster has been provided, so none of it is verified.**
- Decide retention/privacy deletion requirements with business/legal owners before public production.
- Replace the single-node plaintext Compose validation topology with the intended secured multi-node environment for production acceptance.

Phase 4 remains open. Kafka is not on the critical path for checkout, payment, stock, or shipping workflows.
