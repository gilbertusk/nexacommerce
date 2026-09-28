/**
 * Inbox behaviour against a live PostgreSQL database.
 *
 * These cases exist because the guarantees the inbox makes are properties of
 * the database transaction, not of the TypeScript. A mocked store can be made
 * to agree with any implementation; only a real transaction shows whether the
 * report mutation and the consumed marker actually commit or roll back
 * together.
 *
 * Requires DATABASE_URL to point at a migrated analytics schema. The suite
 * fails rather than skips when the database is unreachable: a green run with
 * no database would be worthless as evidence.
 */
import { processWithInbox } from '@nexacommerce/common';
import { analyticsInbox } from '../../src/messaging/inbox';
import { applyAnalyticsEvent } from '../../src/services/analytics.service';
import { prisma } from '../../src/prisma/client';
import { analyticsRepository } from '../../src/repositories/analytics.repository';

const CONSUMER = 'analytics.inbox.test';
const OTHER_CONSUMER = 'analytics.inbox.test.other';

/**
 * A date far enough in the past that no other suite writes to the same row.
 * Built at local midnight because that is how the repository normalises the
 * daily key; a UTC midnight would land on a different row.
 */
const REPORT_DATE = new Date(2019, 2, 4, 0, 0, 0, 0);

function paymentEvent(eventId: string, amount: number) {
  return {
    eventId,
    eventName: 'PaymentSuccess',
    payload: { orderId: `order-${eventId}`, customerId: 'customer-1', amount },
  };
}

/**
 * Apply a fixed revenue amount to one deterministic daily row. Writing through
 * the repository with the supplied client is what puts the mutation inside the
 * inbox transaction.
 */
function applyRevenue(amount: number) {
  return async (tx: any) => {
    await analyticsRepository.upsertDailyReport(REPORT_DATE, { totalRevenue: amount }, tx);
  };
}

async function revenueOnReportDate(): Promise<number> {
  const row = await prisma.dailySalesReport.findUnique({ where: { date: REPORT_DATE } });
  return row ? Number(row.totalRevenue) : 0;
}

async function inboxRow(eventId: string, consumer = CONSUMER) {
  return prisma.inboxEvent.findUnique({
    where: { eventId_consumer: { eventId, consumer } },
  });
}

describe('analytics inbox (live PostgreSQL)', () => {
  beforeAll(async () => {
    // Fail loudly and early if this is not actually running against a database.
    await prisma.$queryRaw`SELECT 1`;
  });

  beforeEach(async () => {
    await prisma.inboxEvent.deleteMany({ where: { consumer: { in: [CONSUMER, OTHER_CONSUMER] } } });
    await prisma.dailySalesReport.deleteMany({ where: { date: REPORT_DATE } });
  });

  afterAll(async () => {
    await prisma.inboxEvent.deleteMany({ where: { consumer: { in: [CONSUMER, OTHER_CONSUMER] } } });
    await prisma.dailySalesReport.deleteMany({ where: { date: REPORT_DATE } });
    await prisma.$disconnect();
  });

  it('commits the mutation and the consumed marker together', async () => {
    // Act
    const outcome = await processWithInbox(
      analyticsInbox,
      CONSUMER,
      paymentEvent('evt-commit', 1000),
      applyRevenue(1000),
    );

    // Assert
    expect(outcome).toBe('PROCESSED');
    expect(await revenueOnReportDate()).toBe(1000);
    expect(await inboxRow('evt-commit')).toMatchObject({ status: 'PROCESSED' });
  });

  it('does not apply a redelivered event a second time', async () => {
    // Arrange
    await processWithInbox(analyticsInbox, CONSUMER, paymentEvent('evt-dup', 1000), applyRevenue(1000));

    // Act
    const outcome = await processWithInbox(
      analyticsInbox,
      CONSUMER,
      paymentEvent('evt-dup', 1000),
      applyRevenue(1000),
    );

    // Assert
    expect(outcome).toBe('SKIPPED_DUPLICATE');
    expect(await revenueOnReportDate()).toBe(1000);
  });

  it('applies exactly once when the same event is delivered concurrently', async () => {
    // Act: ten workers race on one event, as a broker redelivery storm would.
    const results = await Promise.all(
      Array.from({ length: 10 }, () =>
        processWithInbox(analyticsInbox, CONSUMER, paymentEvent('evt-race', 500), applyRevenue(500)),
      ),
    );

    // Assert
    expect(results.filter((r) => r === 'PROCESSED')).toHaveLength(1);
    expect(results.filter((r) => r === 'SKIPPED_DUPLICATE')).toHaveLength(9);
    expect(await revenueOnReportDate()).toBe(500);
  });

  it('rolls back the mutation when the handler fails after writing', async () => {
    // Act
    const run = processWithInbox(analyticsInbox, CONSUMER, paymentEvent('evt-fail', 700), async (tx) => {
      await analyticsRepository.upsertDailyReport(REPORT_DATE, { totalRevenue: 700 }, tx);
      throw new Error('projection failed after writing');
    });

    // Assert: neither the revenue nor a PROCESSED marker survives.
    await expect(run).rejects.toThrow('projection failed after writing');
    expect(await revenueOnReportDate()).toBe(0);
    expect(await inboxRow('evt-fail')).toMatchObject({ status: 'FAILED', attempts: 1 });
  });

  it('applies a previously failed event exactly once on redelivery', async () => {
    // Arrange
    await expect(
      processWithInbox(analyticsInbox, CONSUMER, paymentEvent('evt-retry', 300), async (tx) => {
        await analyticsRepository.upsertDailyReport(REPORT_DATE, { totalRevenue: 300 }, tx);
        throw new Error('transient');
      }),
    ).rejects.toThrow('transient');

    // Act
    const outcome = await processWithInbox(
      analyticsInbox,
      CONSUMER,
      paymentEvent('evt-retry', 300),
      applyRevenue(300),
    );

    // Assert
    expect(outcome).toBe('PROCESSED');
    expect(await revenueOnReportDate()).toBe(300);
    expect(await inboxRow('evt-retry')).toMatchObject({ status: 'PROCESSED' });
  });

  it('lets only one of many concurrent redeliveries take over a previously failed event', async () => {
    // Arrange: a FAILED inbox row exists, as after a rolled-back first attempt.
    await expect(
      processWithInbox(analyticsInbox, CONSUMER, paymentEvent('evt-failed-race', 50), async () => {
        throw new Error('first attempt failed');
      }),
    ).rejects.toThrow('first attempt failed');
    expect(await inboxRow('evt-failed-race')).toMatchObject({ status: 'FAILED' });

    // Act: the takeover path, not the insert path, is what races here.
    const outcomes = await Promise.all(
      Array.from({ length: 8 }, () => processWithInbox(
        analyticsInbox,
        CONSUMER,
        paymentEvent('evt-failed-race', 50),
        applyRevenue(50),
      )),
    );

    // Assert
    expect(outcomes.filter((outcome) => outcome === 'PROCESSED')).toHaveLength(1);
    expect(outcomes.filter((outcome) => outcome === 'SKIPPED_DUPLICATE')).toHaveLength(7);
    expect(await revenueOnReportDate()).toBe(50);
    expect(await inboxRow('evt-failed-race')).toMatchObject({ status: 'PROCESSED' });
  });

  it('keeps deduplication independent per consumer', async () => {
    // Act
    await processWithInbox(analyticsInbox, CONSUMER, paymentEvent('evt-shared', 400), applyRevenue(400));
    const outcome = await processWithInbox(
      analyticsInbox,
      OTHER_CONSUMER,
      paymentEvent('evt-shared', 400),
      applyRevenue(400),
    );

    // Assert: one event, two consumers, two independent applications.
    expect(outcome).toBe('PROCESSED');
    expect(await revenueOnReportDate()).toBe(800);
    expect(await inboxRow('evt-shared', OTHER_CONSUMER)).toMatchObject({ status: 'PROCESSED' });
  });

  it('applies a real projected event through applyAnalyticsEvent in one transaction', async () => {
    // Act
    await processWithInbox(
      analyticsInbox,
      CONSUMER,
      paymentEvent('evt-projection', 2500),
      async (tx) => {
        await applyAnalyticsEvent(tx, { kind: 'PaymentSuccess', amount: 2500 });
      },
    );

    // Assert: today's row, not the isolated fixture date, receives the revenue.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const row = await prisma.dailySalesReport.findUnique({ where: { date: today } });
    expect(row).not.toBeNull();
    expect(await inboxRow('evt-projection')).toMatchObject({ status: 'PROCESSED' });
  });
});
