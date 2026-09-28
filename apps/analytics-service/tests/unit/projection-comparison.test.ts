jest.mock('../../src/repositories/analytics.repository');

import { analyticsRepository } from '../../src/repositories/analytics.repository';
import {
  assertKafkaCutoverEligible,
  compareDailyProjection,
  compareDailyProjectionRows,
} from '../../src/services/projection-comparison';

const mockRepository = analyticsRepository as jest.Mocked<typeof analyticsRepository>;
const START = new Date('2026-09-01T00:00:00.000Z');
const END = new Date('2026-09-30T23:59:59.999Z');

function row(date: string, overrides: Record<string, unknown> = {}) {
  return {
    date: new Date(`${date}T00:00:00.000Z`),
    totalOrders: 2,
    totalRevenue: '125000.00',
    totalItemsSold: 3,
    totalCancelledOrders: 0,
    totalCompletedOrders: 1,
    ...overrides,
  } as any;
}

describe('daily projection comparison', () => {
  beforeEach(() => jest.clearAllMocks());

  it('allows cutover only when every field matches exactly', () => {
    const result = compareDailyProjectionRows(
      [row('2026-09-12', { totalRevenue: '125000' })],
      [row('2026-09-12', { totalRevenue: '125000.00' })],
      START,
      END,
    );

    expect(result).toMatchObject({
      status: 'MATCH',
      cutoverEligible: true,
      daysCompared: 1,
      matchedDays: 1,
      mismatchedDays: 0,
    });
  });

  it('reports exact fields that differ', () => {
    const result = compareDailyProjectionRows(
      [row('2026-09-12')],
      [row('2026-09-12', { totalRevenue: '124999.99', totalItemsSold: 4 })],
      START,
      END,
    );

    expect(result.status).toBe('MISMATCH');
    expect(result.cutoverEligible).toBe(false);
    expect(result.differences[0]).toMatchObject({
      date: '2026-09-12',
      mismatchedFields: ['totalRevenue', 'totalItemsSold'],
    });
  });

  it('treats a date missing from either source as a mismatch', () => {
    const result = compareDailyProjectionRows(
      [row('2026-09-12')],
      [row('2026-09-13')],
      START,
      END,
    );

    expect(result).toMatchObject({ status: 'MISMATCH', daysCompared: 2, mismatchedDays: 2 });
    expect(result.differences[0].kafka).toBeNull();
    expect(result.differences[1].rabbitmq).toBeNull();
  });

  it('does not treat two empty tables as cutover evidence', () => {
    const result = compareDailyProjectionRows([], [], START, END);

    expect(result).toMatchObject({
      status: 'NO_DATA',
      cutoverEligible: false,
      daysCompared: 0,
    });
  });

  it('loads both sources for the same bounded window', async () => {
    mockRepository.findRabbitMqDailyReports.mockResolvedValue([row('2026-09-12')]);
    mockRepository.findDailyProjections.mockResolvedValue([row('2026-09-12')]);

    const result = await compareDailyProjection(START, END);

    expect(mockRepository.findRabbitMqDailyReports).toHaveBeenCalledWith(START, END);
    expect(mockRepository.findDailyProjections).toHaveBeenCalledWith(START, END);
    expect(result.cutoverEligible).toBe(true);
  });

  it('fails closed when startup requests Kafka without matching evidence', () => {
    const comparison = compareDailyProjectionRows([], [], START, END);

    expect(() => assertKafkaCutoverEligible(comparison)).toThrow(
      'Kafka daily read cutover blocked: comparison=NO_DATA',
    );
  });

  it('accepts a matching comparison as startup evidence', () => {
    const comparison = compareDailyProjectionRows(
      [row('2026-09-12')],
      [row('2026-09-12')],
      START,
      END,
    );

    expect(() => assertKafkaCutoverEligible(comparison)).not.toThrow();
  });
});
