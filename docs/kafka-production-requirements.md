# Kafka production requirements

Status: **external acceptance pending.** No production Kafka environment has been provided, so
nothing in this document is verified. It states the minimum a cluster must meet before the event
stream carries production traffic, so that the gap is explicit rather than assumed away.

The local validation topology is a **single-node KRaft container with plaintext listeners and
replication factor 1**. That is adequate for proving projection correctness and is adequate for
nothing else: it cannot survive the loss of one machine, it authenticates nobody, and it encrypts
nothing.

## Durability

| Setting | Minimum | Why |
|---|---|---|
| Broker count | 3 | Two brokers cannot form a majority after one fails |
| Controller quorum | 3 | Same, for KRaft metadata |
| `replication.factor` (topics) | 3 | Survives one broker loss with a spare |
| `min.insync.replicas` | 2 | With RF 3 and `acks=all`, one broker may fail without losing writes |
| `acks` (producer) | `all` | Already set by Event Stream Service |
| `unclean.leader.election.enable` | `false` | An out-of-sync replica becoming leader silently discards committed records |
| `offsets.topic.replication.factor` | 3 | Consumer group offsets are as critical as the data |
| `transaction.state.log.replication.factor` | 3 | Same, if transactions are ever enabled |

`min.insync.replicas = 2` with RF 3 means a partition rejects writes once two replicas are
unavailable. That is the intended behaviour: refusing a write is recoverable, acknowledging one that
is later lost is not.

## Topics

Provisioned by Event Stream Service from `apps/event-stream-service/src/stream/catalog.ts`.
Automatic topic creation is **disabled** and must stay disabled.

| Topic | Partitions | Retention |
|---|---|---|
| `nexacommerce.orders.v1` | 6 | 180 days |
| `nexacommerce.payments.v1` | 6 | 365 days |
| `nexacommerce.inventory.v1` | 6 | 90 days |
| `nexacommerce.shipping.v1` | 6 | 180 days |
| `nexacommerce.reviews.v1` | 6 | 365 days |

Partition count is a one-way door for ordering: increasing it changes which partition a key lands
on, so records for one aggregate can end up split across partitions and lose their order. Size
partitions for peak consumer parallelism before launch, not after.

## Security

None of this exists in the local topology.

- **TLS** on every listener, including inter-broker. Plaintext listeners must not be reachable.
- **SASL** authentication — `SCRAM-SHA-512`, or mTLS if the platform standardises on certificates.
  A distinct principal per service, never a shared superuser.
- **ACLs**, default deny:
  - `event-stream-service`: `Write` and `Describe` on the five topics. No read.
  - `analytics-service`: `Read` and `Describe` on `orders.v1` and `payments.v1`, plus `Read` on its
    own consumer group. No write.
  - Administrative principals separate from both, used only by operators.
- Credentials from a secret manager, never baked into an image or a Compose file.

## Retention, privacy, and deletion

Event payloads carry customer and order identifiers. Before production:

- Confirm with the business and legal owners whether these count as personal data under the
  applicable regime, and what the lawful retention period is. The retention values above are
  engineering defaults, **not** a legal determination.
- Decide how an erasure request is satisfied. A compacted keyed topic can have a record tombstoned;
  a `delete`-policy topic cannot, so erasure has to be handled downstream in the projections and by
  letting retention expire the log. Whether that is acceptable is a legal question, not a technical
  one.
- Record where an export must be able to reach.

## Operations

- **Monitoring**: under-replicated partitions, offline partitions, ISR shrink/expand rate, active
  controller count, request latency, disk usage per broker, and **consumer group lag per partition**.
  Analytics exposes its own lag at `GET /analytics/readiness`.
- **Alerts** that should page: any offline partition; under-replicated partitions sustained past a
  short grace period; ISR below `min.insync.replicas`; consumer lag growing monotonically; disk
  above a threshold that still leaves time to act.
- **Alerts** that should not page but must be visible: the projection's rejected-message counter
  (an unsupported schema version or malformed record is a deployment problem, not an outage), and
  its failure counter.
- **Storage**: size for peak daily volume times the longest retention, plus replication factor, plus
  headroom. A full disk takes a broker down and an under-replicated partition with it.
- **Backup and export**: Kafka retention is not a backup. If the event log must be recoverable
  beyond its retention window, export to object storage on a schedule and verify a restore, the way
  `scripts/backup-restore-drill.sh` verifies the database backup.
- **Disaster recovery**: decide whether a second region is required, and if so whether it is
  active/passive with MirrorMaker 2 or an equivalent. Define RTO and RPO, then test them. An untested
  DR plan is a document, not a capability.

## Rebuilding a projection

The Analytics daily projection can be rebuilt from the log because it writes only to its own
tables and never calls a workflow or mutates authoritative state.

1. Create the new projection table alongside the current one.
2. Start the consumer with a **new** `KAFKA_PROJECTION_GROUP_ID` and `fromBeginning`.
3. Let it catch up; watch lag reach zero.
4. Compare the rebuilt table against the current one over a shared window.
5. Repoint reads only after they agree.

Never replay into a consumer group whose offsets are already committed for live reads, and never
point a replay at anything that calls RabbitMQ or writes order, payment, or inventory state.
