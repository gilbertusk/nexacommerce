import crypto from 'crypto';
import { Prisma } from '../generated/client';
import prisma from '../prisma/client';

/**
 * Durable queue for outbound email.
 *
 * An email is a side effect that cannot be rolled back once the SMTP server
 * accepts it, and it cannot be recovered once the process that was going to
 * send it dies. Enqueuing the job in the same transaction as the notification
 * it belongs to makes the intent to send durable; the dispatcher then converts
 * that intent into at-least-once delivery.
 */

export type EmailWriteClient = Prisma.TransactionClient | typeof prisma;

/** Cap on exponential backoff between delivery attempts. */
const MAX_BACKOFF_MS = 5 * 60 * 1000;

export interface EmailJobInput {
  to: string;
  subject: string;
  templateName: string;
  templateData: Record<string, unknown>;
  notificationId?: string;
}

/** Template values that must never be written to the log table. */
function redactSensitive(templateData: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(templateData).map(([key, value]) => [
      key,
      /token|url/i.test(key) ? '[REDACTED]' : value,
    ]),
  );
}

/**
 * Record the intent to send one email. Pass the caller's transaction client so
 * the job commits together with whatever caused it.
 */
export async function enqueueEmail(
  client: EmailWriteClient,
  job: EmailJobInput,
): Promise<{ id: string }> {
  return client.emailLog.create({
    data: {
      notificationId: job.notificationId,
      to: job.to,
      subject: job.subject,
      templateName: job.templateName,
      // The dispatcher recompiles the body from the template, so the stored
      // copy is for audit only and is redacted.
      templateData: redactSensitive(job.templateData) as Prisma.InputJsonValue,
      status: 'PENDING',
    },
    select: { id: true },
  });
}

/**
 * Claim a batch of due email jobs. A claim older than `leaseMs` is treated as
 * abandoned by a dead dispatcher and becomes eligible again.
 */
export async function claimPendingEmails(limit: number, leaseMs: number) {
  const now = new Date();
  const staleBefore = new Date(now.getTime() - leaseMs);
  const lockToken = crypto.randomUUID();

  return prisma.$transaction(async (tx) => {
    const candidates = await tx.emailLog.findMany({
      where: {
        availableAt: { lte: now },
        OR: [
          { status: 'PENDING' },
          { status: 'SENDING', lockedAt: { lt: staleBefore } },
        ],
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      select: { id: true },
    });
    const ids = candidates.map(({ id }) => id);
    if (ids.length === 0) return { lockToken, jobs: [] };

    await tx.emailLog.updateMany({
      where: {
        id: { in: ids },
        availableAt: { lte: now },
        OR: [
          { status: 'PENDING' },
          { status: 'SENDING', lockedAt: { lt: staleBefore } },
        ],
      },
      data: { status: 'SENDING', lockedAt: now, lockToken },
    });

    const jobs = await tx.emailLog.findMany({
      where: { id: { in: ids }, status: 'SENDING', lockToken },
      orderBy: { createdAt: 'asc' },
    });
    return { lockToken, jobs };
  });
}

export async function markEmailSent(id: string, lockToken: string): Promise<void> {
  await prisma.emailLog.updateMany({
    where: { id, status: 'SENDING', lockToken },
    data: {
      status: 'SENT',
      sentAt: new Date(),
      lockedAt: null,
      lockToken: null,
      error: null,
    },
  });
}

/**
 * Schedule another attempt, or give up once the retry budget is exhausted.
 * A FAILED row is left in place deliberately: it is the record that a message
 * the system promised to send was never delivered.
 */
export async function rescheduleOrFailEmail(
  id: string,
  lockToken: string,
  retryCount: number,
  maxRetries: number,
  error: unknown,
): Promise<'RETRY' | 'FAILED'> {
  const message = String(error instanceof Error ? error.message : error).slice(0, 1000);
  const nextRetry = retryCount + 1;

  if (nextRetry > maxRetries) {
    await prisma.emailLog.updateMany({
      where: { id, status: 'SENDING', lockToken },
      data: {
        status: 'FAILED',
        failedAt: new Date(),
        retryCount: nextRetry,
        lockedAt: null,
        lockToken: null,
        error: message,
      },
    });
    return 'FAILED';
  }

  const backoffMs = Math.min(1_000 * 2 ** Math.min(nextRetry - 1, 8), MAX_BACKOFF_MS);
  await prisma.emailLog.updateMany({
    where: { id, status: 'SENDING', lockToken },
    data: {
      status: 'PENDING',
      retryCount: nextRetry,
      availableAt: new Date(Date.now() + backoffMs),
      lockedAt: null,
      lockToken: null,
      error: message,
    },
  });
  return 'RETRY';
}

export async function releaseEmailClaim(id: string, lockToken: string): Promise<void> {
  await prisma.emailLog.updateMany({
    where: { id, status: 'SENDING', lockToken },
    data: { status: 'PENDING', lockedAt: null, lockToken: null },
  });
}
