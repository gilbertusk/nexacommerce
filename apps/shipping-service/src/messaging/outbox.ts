import crypto from 'crypto';
import type { OrderDelivered, OrderShipped } from '@nexacommerce/event-contracts';
import { Prisma } from '../generated/client';
import { prisma } from '../prisma/client';

const MAX_BACKOFF_MS = 5 * 60 * 1000;
type ShippingEvent = OrderShipped | OrderDelivered;
type OutboxTransaction = Prisma.TransactionClient;

async function enqueueShippingEvent(
  tx: OutboxTransaction,
  routingKey: string,
  event: ShippingEvent,
): Promise<void> {
  await tx.outboxEvent.create({
    data: {
      id: event.eventId,
      aggregateType: 'ShippingOrder',
      aggregateId: event.payload.orderId,
      eventName: event.eventName,
      routingKey,
      eventPayload: event as unknown as Prisma.InputJsonValue,
    },
  });
}

export async function enqueueOrderShipped(
  tx: OutboxTransaction,
  payload: OrderShipped['payload'],
): Promise<void> {
  await enqueueShippingEvent(tx, 'order.shipped', {
    eventId: crypto.randomUUID(),
    eventName: 'OrderShipped',
    timestamp: new Date().toISOString(),
    payload,
  });
}

export async function enqueueOrderDelivered(
  tx: OutboxTransaction,
  payload: OrderDelivered['payload'],
): Promise<void> {
  await enqueueShippingEvent(tx, 'order.delivered', {
    eventId: crypto.randomUUID(),
    eventName: 'OrderDelivered',
    timestamp: new Date().toISOString(),
    payload,
  });
}

export async function claimShippingOutboxBatch(limit: number, leaseMs: number) {
  const now = new Date();
  const staleBefore = new Date(now.getTime() - leaseMs);
  const lockToken = crypto.randomUUID();

  return prisma.$transaction(async (tx) => {
    const candidates = await tx.outboxEvent.findMany({
      where: {
        availableAt: { lte: now },
        OR: [
          { status: 'PENDING' },
          { status: 'PROCESSING', lockedAt: { lt: staleBefore } },
        ],
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      select: { id: true },
    });

    const ids = candidates.map(({ id }) => id);
    if (ids.length === 0) return [];

    await tx.outboxEvent.updateMany({
      where: {
        id: { in: ids },
        availableAt: { lte: now },
        OR: [
          { status: 'PENDING' },
          { status: 'PROCESSING', lockedAt: { lt: staleBefore } },
        ],
      },
      data: { status: 'PROCESSING', lockedAt: now, lockToken },
    });

    return tx.outboxEvent.findMany({
      where: { id: { in: ids }, status: 'PROCESSING', lockToken },
      orderBy: { createdAt: 'asc' },
    });
  });
}

export async function markShippingOutboxPublished(id: string, lockToken: string): Promise<void> {
  await prisma.outboxEvent.updateMany({
    where: { id, status: 'PROCESSING', lockToken },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
      lockedAt: null,
      lockToken: null,
      lastError: null,
    },
  });
}

export async function rescheduleShippingOutbox(
  id: string,
  lockToken: string,
  attempts: number,
  error: unknown,
): Promise<void> {
  const nextAttempt = attempts + 1;
  const backoffMs = Math.min(1_000 * (2 ** Math.min(nextAttempt - 1, 8)), MAX_BACKOFF_MS);
  await prisma.outboxEvent.updateMany({
    where: { id, status: 'PROCESSING', lockToken },
    data: {
      status: 'PENDING',
      attempts: nextAttempt,
      availableAt: new Date(Date.now() + backoffMs),
      lockedAt: null,
      lockToken: null,
      lastError: String(error instanceof Error ? error.message : error).slice(0, 1000),
    },
  });
}

export async function releaseShippingOutboxClaim(id: string, lockToken: string): Promise<void> {
  await prisma.outboxEvent.updateMany({
    where: { id, status: 'PROCESSING', lockToken },
    data: { status: 'PENDING', lockedAt: null, lockToken: null },
  });
}
