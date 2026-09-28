import crypto from 'crypto';
import type { OrderCancelled, OrderCompleted, OrderCreated, OrderPaid } from '@nexacommerce/event-contracts';
import { Prisma } from '../generated/client';
import { prisma } from '../prisma/client';

const MAX_BACKOFF_MS = 5 * 60 * 1000;

type OrderEvent = OrderCreated | OrderCancelled | OrderPaid | OrderCompleted;
type OutboxTransaction = Prisma.TransactionClient;

function createEvent<T extends OrderEvent>(
  eventName: T['eventName'],
  payload: T['payload'],
  eventId: string = crypto.randomUUID(),
): T {
  return {
    eventId,
    eventName,
    timestamp: new Date().toISOString(),
    payload,
  } as T;
}

export async function enqueueOrderCreated(
  tx: OutboxTransaction,
  payload: OrderCreated['payload'],
): Promise<void> {
  // One checkout may have only one OrderCreated fact. The deterministic id
  // makes an accidental second finalization fail atomically instead of
  // creating a duplicate event with a new UUID.
  await enqueueOrderEvent(
    tx,
    'order.created',
    createEvent<OrderCreated>('OrderCreated', payload, `order-created:${payload.orderId}`),
  );
}

async function enqueueOrderEvent(
  tx: OutboxTransaction,
  routingKey: string,
  event: OrderEvent,
): Promise<void> {
  await tx.outboxEvent.create({
    data: {
      id: event.eventId,
      aggregateType: 'Order',
      aggregateId: event.payload.orderId,
      eventName: event.eventName,
      routingKey,
      eventPayload: event as unknown as Prisma.InputJsonValue,
    },
  });
}

export async function enqueueOrderCancelled(
  tx: OutboxTransaction,
  payload: OrderCancelled['payload'],
): Promise<void> {
  await enqueueOrderEvent(tx, 'order.cancelled', createEvent<OrderCancelled>('OrderCancelled', payload));
}

export async function enqueueOrderPaid(
  tx: OutboxTransaction,
  payload: OrderPaid['payload'],
): Promise<void> {
  await enqueueOrderEvent(tx, 'order.paid', createEvent<OrderPaid>('OrderPaid', payload));
}

export async function enqueueOrderCompleted(
  tx: OutboxTransaction,
  payload: OrderCompleted['payload'],
): Promise<void> {
  await enqueueOrderEvent(tx, 'order.completed', createEvent<OrderCompleted>('OrderCompleted', payload));
}

export async function claimOrderOutboxBatch(limit: number, leaseMs: number) {
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

export async function markOrderOutboxPublished(id: string, lockToken: string): Promise<void> {
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

export async function rescheduleOrderOutbox(
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

export async function releaseOrderOutboxClaim(id: string, lockToken: string): Promise<void> {
  await prisma.outboxEvent.updateMany({
    where: { id, status: 'PROCESSING', lockToken },
    data: { status: 'PENDING', lockedAt: null, lockToken: null },
  });
}
