import { Prisma } from '../generated/client';
import { prisma } from '../prisma/client';

/**
 * The Kafka-sourced daily sales projection.
 *
 * This projection writes only to `daily_sales_projections` and
 * `kafka_projection_progress`. It never touches order, payment, or inventory
 * state and never republishes to RabbitMQ, so replaying the topic from any
 * offset is safe: it recomputes a derived view and nothing else.
 */

/** Stream envelope versions this projection understands. */
export const SUPPORTED_SCHEMA_VERSIONS = [1];

export type ProjectionClient = Prisma.TransactionClient | typeof prisma;

export interface StreamEnvelope {
  schemaVersion: number;
  eventId: string;
  eventName: string;
  occurredAt: string;
  streamedAt?: string;
  partitionKey: string;
  payload: Record<string, unknown>;
}

/** Why an envelope cannot be projected. Each is permanent, not transient. */
export type EnvelopeRejection =
  | { reason: 'MALFORMED'; detail: string }
  | { reason: 'UNSUPPORTED_SCHEMA'; detail: string };

export type EnvelopeCheck =
  | { ok: true; envelope: StreamEnvelope }
  | { ok: false; rejection: EnvelopeRejection };

/**
 * Validate a raw Kafka message body.
 *
 * Returns a rejection rather than throwing, because the caller must be able to
 * distinguish a permanently unprocessable message — which has to be recorded
 * and stepped over so the partition keeps moving — from a transient failure,
 * which must not advance the offset.
 */
export function checkEnvelope(raw: unknown): EnvelopeCheck {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, rejection: { reason: 'MALFORMED', detail: 'message body is not an object' } };
  }

  const candidate = raw as Partial<StreamEnvelope>;

  if (typeof candidate.schemaVersion !== 'number') {
    return { ok: false, rejection: { reason: 'MALFORMED', detail: 'schemaVersion is missing' } };
  }
  if (!SUPPORTED_SCHEMA_VERSIONS.includes(candidate.schemaVersion)) {
    return {
      ok: false,
      rejection: {
        reason: 'UNSUPPORTED_SCHEMA',
        detail: `schemaVersion ${candidate.schemaVersion} is not supported by this projection`,
      },
    };
  }
  if (typeof candidate.eventId !== 'string' || candidate.eventId.length === 0) {
    return { ok: false, rejection: { reason: 'MALFORMED', detail: 'eventId is missing' } };
  }
  if (typeof candidate.eventName !== 'string' || candidate.eventName.length === 0) {
    return { ok: false, rejection: { reason: 'MALFORMED', detail: 'eventName is missing' } };
  }
  if (typeof candidate.occurredAt !== 'string' || Number.isNaN(Date.parse(candidate.occurredAt))) {
    return { ok: false, rejection: { reason: 'MALFORMED', detail: 'occurredAt is not a valid timestamp' } };
  }
  if (!candidate.payload || typeof candidate.payload !== 'object') {
    return { ok: false, rejection: { reason: 'MALFORMED', detail: 'payload is missing' } };
  }

  return { ok: true, envelope: candidate as StreamEnvelope };
}

/** The daily bucket an event belongs to, derived from when it occurred. */
function dayOf(occurredAt: string): Date {
  const d = new Date(occurredAt);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

type DailyDelta = {
  totalOrders?: number;
  totalCompletedOrders?: number;
  totalCancelledOrders?: number;
  totalItemsSold?: number;
  totalRevenue?: number;
};

/** Translate one event into the counters it moves. Returns null when the event is not projected. */
export function dailyDeltaFor(envelope: StreamEnvelope): DailyDelta | null {
  const payload = envelope.payload as Record<string, any>;

  switch (envelope.eventName) {
    case 'OrderCreated':
      return { totalOrders: 1 };
    case 'OrderCancelled':
      // Mirrors the RabbitMQ projection: a checkout compensated before
      // OrderCreated was announced is not an order cancellation.
      return payload.checkoutFinalized === false ? null : { totalCancelledOrders: 1 };
    case 'OrderCompleted': {
      const items = Array.isArray(payload.items) ? payload.items : [];
      const quantity = items.reduce((sum: number, i: any) => sum + (Number(i?.quantity) || 0), 0);
      return { totalCompletedOrders: 1, totalItemsSold: quantity };
    }
    case 'PaymentSuccess':
      return { totalRevenue: Number(payload.amount) || 0 };
    default:
      // OrderPaid restates PaymentSuccess revenue and is deliberately not
      // projected; counting both would double the day's revenue.
      return null;
  }
}

/**
 * Apply one event's deltas. Uses `client` so the write joins the inbox
 * transaction that marks the event consumed.
 */
export async function applyDailyDelta(
  client: ProjectionClient,
  day: Date,
  delta: DailyDelta,
): Promise<void> {
  await client.dailySalesProjection.upsert({
    where: { date: day },
    create: {
      date: day,
      totalOrders: delta.totalOrders ?? 0,
      totalCompletedOrders: delta.totalCompletedOrders ?? 0,
      totalCancelledOrders: delta.totalCancelledOrders ?? 0,
      totalItemsSold: delta.totalItemsSold ?? 0,
      totalRevenue: delta.totalRevenue ?? 0,
    },
    update: {
      totalOrders: { increment: delta.totalOrders ?? 0 },
      totalCompletedOrders: { increment: delta.totalCompletedOrders ?? 0 },
      totalCancelledOrders: { increment: delta.totalCancelledOrders ?? 0 },
      totalItemsSold: { increment: delta.totalItemsSold ?? 0 },
      totalRevenue: { increment: delta.totalRevenue ?? 0 },
    },
  });
}

/** Project one validated event. */
export async function projectStreamEvent(
  client: ProjectionClient,
  envelope: StreamEnvelope,
): Promise<void> {
  const delta = dailyDeltaFor(envelope);
  if (!delta) return;
  await applyDailyDelta(client, dayOf(envelope.occurredAt), delta);
}

/**
 * Record how far the projection has read a partition. Observability only:
 * Kafka remains the authority for offsets, and this value is never used to
 * decide where to resume.
 */
export async function recordProgress(
  client: ProjectionClient,
  progress: {
    consumerGroup: string;
    topic: string;
    partition: number;
    offset: string;
    eventAt: Date;
  },
): Promise<void> {
  const key = {
    consumerGroup: progress.consumerGroup,
    topic: progress.topic,
    partition: progress.partition,
  };
  await client.kafkaProjectionProgress.upsert({
    where: { consumerGroup_topic_partition: key },
    create: { ...key, lastOffset: BigInt(progress.offset), lastEventAt: progress.eventAt },
    update: { lastOffset: BigInt(progress.offset), lastEventAt: progress.eventAt },
  });
}
