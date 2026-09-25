import crypto from 'crypto';
import type { PaymentExpired, PaymentFailed, PaymentSuccess } from '@nexacommerce/event-contracts';
import { Prisma } from '../generated/client';
import { prisma } from '../prisma/client';

const MAX_BACKOFF_MS = 5 * 60 * 1000;

type PaymentEvent = PaymentSuccess | PaymentExpired | PaymentFailed;
type PaymentEventPayload = PaymentEvent['payload'];
type OutboxTransaction = Prisma.TransactionClient;

function createEvent<T extends PaymentEvent>(eventName: T['eventName'], payload: T['payload']): T {
  return {
    eventId: crypto.randomUUID(),
    eventName,
    timestamp: new Date().toISOString(),
    payload,
  } as T;
}

async function enqueuePaymentEvent(
  tx: OutboxTransaction,
  routingKey: string,
  event: PaymentEvent,
): Promise<void> {
  const payload = event.payload as PaymentEventPayload & { paymentId: string };
  await tx.outboxEvent.create({
    data: {
      id: event.eventId,
      aggregateType: 'Payment',
      aggregateId: payload.paymentId,
      eventName: event.eventName,
      routingKey,
      eventPayload: event as unknown as Prisma.InputJsonValue,
    },
  });
}

export async function enqueuePaymentSuccess(
  tx: OutboxTransaction,
  payload: PaymentSuccess['payload'],
): Promise<void> {
  await enqueuePaymentEvent(tx, 'payment.success', createEvent<PaymentSuccess>('PaymentSuccess', payload));
}

export async function enqueuePaymentExpired(
  tx: OutboxTransaction,
  payload: PaymentExpired['payload'],
): Promise<void> {
  await enqueuePaymentEvent(tx, 'payment.expired', createEvent<PaymentExpired>('PaymentExpired', payload));
}

export async function enqueuePaymentFailed(
  tx: OutboxTransaction,
  payload: PaymentFailed['payload'],
): Promise<void> {
  await enqueuePaymentEvent(tx, 'payment.failed', createEvent<PaymentFailed>('PaymentFailed', payload));
}

export async function claimPaymentOutboxBatch(limit: number, leaseMs: number) {
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

export async function markPaymentOutboxPublished(id: string, lockToken: string): Promise<void> {
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

export async function reschedulePaymentOutbox(
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

export async function releasePaymentOutboxClaim(id: string, lockToken: string): Promise<void> {
  await prisma.outboxEvent.updateMany({
    where: { id, status: 'PROCESSING', lockToken },
    data: { status: 'PENDING', lockedAt: null, lockToken: null },
  });
}
