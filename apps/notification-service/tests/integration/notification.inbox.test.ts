/**
 * Notification inbox and email queue behaviour against a live PostgreSQL
 * database.
 *
 * The property under test is that an in-app notification, the email job that
 * belongs to it, and the record marking the source event consumed are one
 * atomic unit. Before the inbox existed, those were three separate
 * transactions, so a crash could mark an event handled while its email was
 * never queued — and the redelivery would short-circuit on the existing
 * notification row and never queue it either.
 *
 * Requires DATABASE_URL to point at a migrated notifications schema. The suite
 * fails rather than skips when the database is unreachable.
 */
import { processWithInbox } from '@nexacommerce/common';
import { notificationInbox } from '../../src/messaging/inbox';
import { applyNotificationEvent, PreparedNotificationEvent } from '../../src/messaging/notification-events';
import prisma from '../../src/prisma/client';
import { claimPendingEmails, markEmailSent, rescheduleOrFailEmail } from '../../src/services/email-outbox';
import { emailService } from '../../src/services/email.service';

const CONSUMER = 'notification.inbox.test';
const USER_ID = 'inbox-test-user';
const TEMPLATE = 'INBOX_TEST_TEMPLATE';

function preparedEvent(orderId: string): PreparedNotificationEvent {
  return {
    kind: 'Notifications',
    notifications: [
      {
        userId: USER_ID,
        type: 'PAYMENT_SUCCESS',
        title: 'Payment Successful',
        message: `Payment for Order #${orderId} was received.`,
        data: { orderId },
        channel: 'BOTH',
        emailTo: 'inbox-test@example.invalid',
        emailTemplateName: TEMPLATE,
        emailTemplateData: { orderId },
      },
    ],
  };
}

async function cleanup() {
  // Every queued email is removed, not only this suite's. The dispatcher claims
  // the oldest due jobs regardless of template, so rows left behind by another
  // suite would fill the batch and make the claim assertions order-dependent.
  // This runs against a dedicated test schema.
  await prisma.emailLog.deleteMany({});
  await prisma.notification.deleteMany({ where: { userId: USER_ID } });
  await prisma.inboxEvent.deleteMany({ where: { consumer: CONSUMER } });
}

async function counts() {
  const [notifications, emails] = await Promise.all([
    prisma.notification.count({ where: { userId: USER_ID } }),
    prisma.emailLog.count({ where: { templateName: TEMPLATE } }),
  ]);
  return { notifications, emails };
}

describe('notification inbox and email queue (live PostgreSQL)', () => {
  beforeAll(async () => {
    await prisma.$queryRaw`SELECT 1`;
    await prisma.emailTemplate.upsert({
      where: { name: TEMPLATE },
      create: {
        name: TEMPLATE,
        subject: 'Order {{ orderId }}',
        htmlBody: '<p>Order {{ orderId }}</p>',
        textBody: 'Order {{ orderId }}',
        isActive: true,
      },
      update: { isActive: true },
    });
  });

  beforeEach(cleanup);

  afterAll(async () => {
    await cleanup();
    await prisma.emailTemplate.deleteMany({ where: { name: TEMPLATE } });
    await prisma.$disconnect();
  });

  it('commits the notification, its email job, and the consumed marker together', async () => {
    // Act
    const outcome = await processWithInbox(
      notificationInbox,
      CONSUMER,
      { eventId: 'evt-commit', eventName: 'PaymentSuccess', payload: {} },
      async (tx) => applyNotificationEvent(tx, 'evt-commit', preparedEvent('order-1')),
    );

    // Assert
    expect(outcome).toBe('PROCESSED');
    expect(await counts()).toEqual({ notifications: 1, emails: 1 });
    const queued = await prisma.emailLog.findFirst({ where: { templateName: TEMPLATE } });
    expect(queued).toMatchObject({ status: 'PENDING', to: 'inbox-test@example.invalid' });
  });

  it('leaves neither a notification nor a queued email when the write fails', async () => {
    // Act
    const run = processWithInbox(
      notificationInbox,
      CONSUMER,
      { eventId: 'evt-fail', eventName: 'PaymentSuccess', payload: {} },
      async (tx) => {
        await applyNotificationEvent(tx, 'evt-fail', preparedEvent('order-2'));
        throw new Error('failed after writing the notification');
      },
    );

    // Assert
    await expect(run).rejects.toThrow('failed after writing the notification');
    expect(await counts()).toEqual({ notifications: 0, emails: 0 });
  });

  it('does not duplicate the email on a redelivered event', async () => {
    // Arrange
    const event = { eventId: 'evt-dup', eventName: 'PaymentSuccess', payload: {} };
    await processWithInbox(notificationInbox, CONSUMER, event, async (tx) =>
      applyNotificationEvent(tx, event.eventId, preparedEvent('order-3')),
    );

    // Act
    const outcome = await processWithInbox(notificationInbox, CONSUMER, event, async (tx) =>
      applyNotificationEvent(tx, event.eventId, preparedEvent('order-3')),
    );

    // Assert
    expect(outcome).toBe('SKIPPED_DUPLICATE');
    expect(await counts()).toEqual({ notifications: 1, emails: 1 });
  });

  it('queues exactly one email when the event is delivered concurrently', async () => {
    // Act
    const event = { eventId: 'evt-race', eventName: 'PaymentSuccess', payload: {} };
    const results = await Promise.all(
      Array.from({ length: 8 }, () =>
        processWithInbox(notificationInbox, CONSUMER, event, async (tx) =>
          applyNotificationEvent(tx, event.eventId, preparedEvent('order-4')),
        ),
      ),
    );

    // Assert
    expect(results.filter((r) => r === 'PROCESSED')).toHaveLength(1);
    expect(await counts()).toEqual({ notifications: 1, emails: 1 });
  });

  it('hands a queued email to exactly one dispatcher claim', async () => {
    // Arrange
    await processWithInbox(
      notificationInbox,
      CONSUMER,
      { eventId: 'evt-claim', eventName: 'PaymentSuccess', payload: {} },
      async (tx) => applyNotificationEvent(tx, 'evt-claim', preparedEvent('order-5')),
    );

    // Act: two dispatchers poll at the same time.
    const [first, second] = await Promise.all([
      claimPendingEmails(10, 60_000),
      claimPendingEmails(10, 60_000),
    ]);

    // Assert
    const claimed = [...first.jobs, ...second.jobs].filter((j) => j.templateName === TEMPLATE);
    expect(claimed).toHaveLength(1);
  });

  it('marks a delivered email SENT and stops re-claiming it', async () => {
    // Arrange
    await processWithInbox(
      notificationInbox,
      CONSUMER,
      { eventId: 'evt-send', eventName: 'PaymentSuccess', payload: {} },
      async (tx) => applyNotificationEvent(tx, 'evt-send', preparedEvent('order-6')),
    );
    const { lockToken, jobs } = await claimPendingEmails(10, 60_000);
    const job = jobs.find((j) => j.templateName === TEMPLATE)!;

    // Act
    await markEmailSent(job.id, lockToken);

    // Assert
    const after = await prisma.emailLog.findUnique({ where: { id: job.id } });
    expect(after).toMatchObject({ status: 'SENT', lockToken: null });
    const next = await claimPendingEmails(10, 60_000);
    expect(next.jobs.filter((j) => j.templateName === TEMPLATE)).toHaveLength(0);
  });

  it('gives up on an email only after its retry budget is exhausted', async () => {
    // Arrange
    await processWithInbox(
      notificationInbox,
      CONSUMER,
      { eventId: 'evt-retry', eventName: 'PaymentSuccess', payload: {} },
      async (tx) => applyNotificationEvent(tx, 'evt-retry', preparedEvent('order-7')),
    );
    const first = await claimPendingEmails(10, 60_000);
    const job = first.jobs.find((j) => j.templateName === TEMPLATE)!;

    // Act: one attempt below budget, then one past it.
    const retry = await rescheduleOrFailEmail(job.id, first.lockToken, 0, job.maxRetries, new Error('smtp down'));
    const afterRetry = await prisma.emailLog.findUnique({ where: { id: job.id } });

    // The backoff holds the row back, so make it due again rather than waiting.
    await prisma.emailLog.update({ where: { id: job.id }, data: { availableAt: new Date(0) } });
    const second = await claimPendingEmails(10, 60_000);
    const requeued = second.jobs.find((j) => j.templateName === TEMPLATE);
    const exhausted = await rescheduleOrFailEmail(
      job.id,
      second.lockToken,
      job.maxRetries,
      job.maxRetries,
      new Error('smtp down'),
    );

    // Assert
    expect(retry).toBe('RETRY');
    expect(afterRetry).toMatchObject({ status: 'PENDING', retryCount: 1, lockToken: null });
    expect(requeued).toBeDefined();
    expect(exhausted).toBe('FAILED');
    const after = await prisma.emailLog.findUnique({ where: { id: job.id } });
    expect(after).toMatchObject({ status: 'FAILED', error: 'smtp down' });
    expect(after!.failedAt).not.toBeNull();
  });

  it('refuses to queue an email whose template does not exist', async () => {
    // Act + Assert: a silent skip would lose a message the system promised.
    await expect(
      emailService.queueEmail(prisma, {
        to: 'inbox-test@example.invalid',
        templateName: 'NO_SUCH_TEMPLATE',
        templateData: {},
      }),
    ).rejects.toThrow(/not found or inactive/);
  });

  it('redacts token and url template values written to the email log', async () => {
    // Act
    await emailService.queueEmail(prisma, {
      to: 'inbox-test@example.invalid',
      templateName: TEMPLATE,
      templateData: { orderId: 'order-8', token: 'secret-token', actionUrl: 'https://example.test/x' },
    });

    // Assert
    const row = await prisma.emailLog.findFirst({
      where: { templateName: TEMPLATE },
      orderBy: { createdAt: 'desc' },
    });
    expect(row!.templateData).toMatchObject({
      orderId: 'order-8',
      token: '[REDACTED]',
      actionUrl: '[REDACTED]',
    });
  });
});
