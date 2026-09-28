import { Prisma } from '../generated/client';
import { analyticsRepository } from '../repositories/analytics.repository';

export const DAILY_COMPARISON_FIELDS = [
  'totalOrders',
  'totalRevenue',
  'totalItemsSold',
  'totalCancelledOrders',
  'totalCompletedOrders',
] as const;

type ComparisonField = (typeof DAILY_COMPARISON_FIELDS)[number];

export interface DailyAggregateRow {
  date: Date;
  totalOrders: number;
  totalRevenue: Prisma.Decimal | number | string;
  totalItemsSold: number;
  totalCancelledOrders: number;
  totalCompletedOrders: number;
}

interface NormalizedDailyAggregate {
  totalOrders: number;
  totalRevenue: string;
  totalItemsSold: number;
  totalCancelledOrders: number;
  totalCompletedOrders: number;
}

export interface DailyProjectionDifference {
  date: string;
  mismatchedFields: ComparisonField[];
  rabbitmq: NormalizedDailyAggregate | null;
  kafka: NormalizedDailyAggregate | null;
}

export interface DailyProjectionComparison {
  status: 'MATCH' | 'MISMATCH' | 'NO_DATA';
  cutoverEligible: boolean;
  window: { startDate: string; endDate: string };
  sourceRows: { rabbitmq: number; kafka: number };
  daysCompared: number;
  matchedDays: number;
  mismatchedDays: number;
  differences: DailyProjectionDifference[];
}

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function normalize(row: DailyAggregateRow): NormalizedDailyAggregate {
  return {
    totalOrders: row.totalOrders,
    // Both columns are Decimal(14,2). Canonicalising to two decimal places
    // prevents representation-only differences (for example 10 and 10.00)
    // while retaining exact cent-level comparison.
    totalRevenue: new Prisma.Decimal(row.totalRevenue).toFixed(2),
    totalItemsSold: row.totalItemsSold,
    totalCancelledOrders: row.totalCancelledOrders,
    totalCompletedOrders: row.totalCompletedOrders,
  };
}

/**
 * Compare the RabbitMQ-owned and Kafka-owned daily tables without hiding
 * missing dates. A day present on only one side is a mismatch, and two empty
 * tables are explicitly NO_DATA rather than evidence that a cutover is safe.
 */
export function compareDailyProjectionRows(
  rabbitmqRows: DailyAggregateRow[],
  kafkaRows: DailyAggregateRow[],
  startDate: Date,
  endDate: Date,
): DailyProjectionComparison {
  const rabbitmqByDate = new Map(rabbitmqRows.map((row) => [dateKey(row.date), normalize(row)]));
  const kafkaByDate = new Map(kafkaRows.map((row) => [dateKey(row.date), normalize(row)]));
  const dates = [...new Set([...rabbitmqByDate.keys(), ...kafkaByDate.keys()])].sort();

  const differences: DailyProjectionDifference[] = [];
  for (const date of dates) {
    const rabbitmq = rabbitmqByDate.get(date) ?? null;
    const kafka = kafkaByDate.get(date) ?? null;
    const mismatchedFields = DAILY_COMPARISON_FIELDS.filter(
      (field) => !rabbitmq || !kafka || rabbitmq[field] !== kafka[field],
    );

    if (mismatchedFields.length > 0) {
      differences.push({ date, mismatchedFields, rabbitmq, kafka });
    }
  }

  const status = dates.length === 0 ? 'NO_DATA' : differences.length === 0 ? 'MATCH' : 'MISMATCH';
  return {
    status,
    cutoverEligible: status === 'MATCH',
    window: { startDate: dateKey(startDate), endDate: dateKey(endDate) },
    sourceRows: { rabbitmq: rabbitmqRows.length, kafka: kafkaRows.length },
    daysCompared: dates.length,
    matchedDays: dates.length - differences.length,
    mismatchedDays: differences.length,
    differences,
  };
}

export async function compareDailyProjection(
  startDate: Date,
  endDate: Date,
): Promise<DailyProjectionComparison> {
  const [rabbitmqRows, kafkaRows] = await Promise.all([
    analyticsRepository.findRabbitMqDailyReports(startDate, endDate),
    analyticsRepository.findDailyProjections(startDate, endDate),
  ]);

  return compareDailyProjectionRows(rabbitmqRows, kafkaRows, startDate, endDate);
}

export function assertKafkaCutoverEligible(comparison: DailyProjectionComparison): void {
  if (comparison.cutoverEligible) return;

  throw new Error(
    `Kafka daily read cutover blocked: comparison=${comparison.status}, `
    + `days=${comparison.daysCompared}, mismatches=${comparison.mismatchedDays}`,
  );
}

/**
 * Fail-closed startup gate. Setting the Kafka read model is not enough: the
 * selected recent window must still agree at process startup. This catches a
 * stale or accidentally emptied projection before it serves dashboard reads.
 */
export async function verifyConfiguredDailyReadModel(): Promise<DailyProjectionComparison | null> {
  const { config } = await import('../config');
  if (config.dailyReadModel !== 'KAFKA') return null;

  const now = new Date();
  const endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
  const startDate = new Date(endDate.getTime() - (config.kafkaCutoverWindowDays - 1) * 86_400_000);
  startDate.setUTCHours(0, 0, 0, 0);

  const comparison = await compareDailyProjection(startDate, endDate);
  assertKafkaCutoverEligible(comparison);
  return comparison;
}
