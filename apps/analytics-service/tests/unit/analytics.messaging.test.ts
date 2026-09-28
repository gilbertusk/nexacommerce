const channel = {};
let capturedHandler: ((event: any) => Promise<void>) | undefined;

jest.mock('@nexacommerce/common', () => {
  const actual = jest.requireActual('@nexacommerce/common');
  return {
    ...actual,
    connectRabbitMQ: jest.fn(async () => ({ createConfirmChannel: async () => channel })),
    setupExchangeAndQueues: jest.fn(async () => undefined),
    createConsumer: jest.fn(async (_channel, _queue, handler) => {
      capturedHandler = handler;
    }),
    // The service attaches consumers through the reconnecting wrapper; run its
    // setup on every start so each test captures a fresh handler.
    createResilientConsumer: jest.fn((options: { setup: (channel: unknown) => Promise<void> }) => ({
      start: async () => options.setup(channel),
      stop: async () => undefined,
      isReady: () => true,
    })),
  };
});
jest.mock('../../src/services/analytics.service', () => ({
  prepareAnalyticsEvent: jest.fn(async (eventName: string) => ({ kind: eventName })),
  applyAnalyticsEvent: jest.fn(),
}));
jest.mock('../../src/messaging/inbox', () => ({
  analyticsInbox: {
    runInTransaction: jest.fn(),
    claim: jest.fn(),
    markProcessed: jest.fn(),
    recordFailure: jest.fn(),
    isUniqueViolation: jest.fn(() => false),
  },
}));

import { initRabbitMQ, ANALYTICS_RABBITMQ_CONSUMER } from '../../src/messaging/rabbitmq';
import { analyticsInbox } from '../../src/messaging/inbox';
import { applyAnalyticsEvent, prepareAnalyticsEvent } from '../../src/services/analytics.service';

const mockInbox = analyticsInbox as jest.Mocked<typeof analyticsInbox>;
const mockApply = applyAnalyticsEvent as jest.MockedFunction<typeof applyAnalyticsEvent>;
const mockPrepare = prepareAnalyticsEvent as jest.MockedFunction<typeof prepareAnalyticsEvent>;

const TX = { tx: true } as any;

/** Run the inbox transaction against a stand-in transaction client. */
function withOpenTransaction() {
  mockInbox.runInTransaction.mockImplementation(async (fn: any) => fn(TX));
}

const event = {
  eventId: 'event-1',
  eventName: 'PaymentSuccess',
  payload: { orderId: 'order-1', customerId: 'customer-1', amount: 1000 },
};

describe('analytics RabbitMQ handler', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockInbox.isUniqueViolation.mockReturnValue(false);
    capturedHandler = undefined;
    await initRabbitMQ();
  });

  it('enriches the event before the transaction opens, then applies it inside', async () => {
    // Arrange
    const order: string[] = [];
    mockPrepare.mockImplementation(async () => {
      order.push('prepare');
      return { kind: 'PaymentSuccess', amount: 1000 };
    });
    mockInbox.runInTransaction.mockImplementation(async (fn: any) => {
      order.push('transaction');
      return fn(TX);
    });
    mockInbox.claim.mockResolvedValue('CLAIMED');
    mockApply.mockImplementation(async () => {
      order.push('apply');
    });

    // Act
    await capturedHandler!(event);

    // Assert
    expect(order).toEqual(['prepare', 'transaction', 'apply']);
    expect(mockApply).toHaveBeenCalledWith(TX, { kind: 'PaymentSuccess', amount: 1000 });
  });

  it('marks the event consumed with the same transaction that applied it', async () => {
    // Arrange
    withOpenTransaction();
    mockInbox.claim.mockResolvedValue('CLAIMED');

    // Act
    await capturedHandler!(event);

    // Assert
    expect(mockApply).toHaveBeenCalledWith(TX, expect.anything());
    expect(mockInbox.markProcessed).toHaveBeenCalledWith(TX, {
      eventId: 'event-1',
      consumer: ANALYTICS_RABBITMQ_CONSUMER,
    });
  });

  it('does not re-apply an event the inbox reports as already consumed', async () => {
    // Arrange
    withOpenTransaction();
    mockInbox.claim.mockResolvedValue('DUPLICATE');

    // Act
    await capturedHandler!(event);

    // Assert
    expect(mockApply).not.toHaveBeenCalled();
    expect(mockInbox.markProcessed).not.toHaveBeenCalled();
  });

  it('rethrows handler errors without marking the event consumed', async () => {
    // Arrange
    withOpenTransaction();
    mockInbox.claim.mockResolvedValue('CLAIMED');
    mockApply.mockRejectedValue(new Error('database unavailable'));

    // Act + Assert
    await expect(capturedHandler!(event)).rejects.toThrow('database unavailable');
    expect(mockInbox.markProcessed).not.toHaveBeenCalled();
    expect(mockInbox.recordFailure).toHaveBeenCalled();
  });

  it('rejects an event with no eventId rather than applying it undeduplicated', async () => {
    // Arrange
    withOpenTransaction();

    // Act + Assert
    await expect(capturedHandler!({ ...event, eventId: '' })).rejects.toThrow(/eventId/);
    expect(mockApply).not.toHaveBeenCalled();
    expect(mockInbox.runInTransaction).not.toHaveBeenCalled();
  });
});
