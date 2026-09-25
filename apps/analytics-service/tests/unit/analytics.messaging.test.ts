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
  };
});
jest.mock('../../src/services/analytics.service', () => ({
  analyticsService: {
    handleOrderCreated: jest.fn(),
    handlePaymentSuccess: jest.fn(),
    handlePaymentFailed: jest.fn(),
    handlePaymentExpired: jest.fn(),
    handleOrderCancelled: jest.fn(),
    handleOrderCompleted: jest.fn(),
    handleReviewCreated: jest.fn(),
  },
}));
jest.mock('../../src/repositories/analytics.repository', () => ({
  analyticsRepository: {
    saveEvent: jest.fn(),
    markEventProcessed: jest.fn(),
  },
}));

import { initRabbitMQ } from '../../src/messaging/rabbitmq';
import { analyticsRepository } from '../../src/repositories/analytics.repository';
import { analyticsService } from '../../src/services/analytics.service';

const mockRepository = analyticsRepository as jest.Mocked<typeof analyticsRepository>;
const mockService = analyticsService as jest.Mocked<typeof analyticsService>;

describe('analytics RabbitMQ handler', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    capturedHandler = undefined;
    await initRabbitMQ();
  });

  it('skips a source event already marked as processed', async () => {
    mockRepository.saveEvent.mockResolvedValue({ id: 'row-1', isProcessed: true } as any);

    await capturedHandler!({
      eventId: 'event-1',
      eventName: 'PaymentSuccess',
      payload: { orderId: 'order-1', customerId: 'customer-1', amount: 1000 },
    });

    expect(mockRepository.saveEvent).toHaveBeenCalledWith(
      'event-1',
      'PaymentSuccess',
      expect.objectContaining({ orderId: 'order-1' }),
    );
    expect(mockService.handlePaymentSuccess).not.toHaveBeenCalled();
  });

  it('rethrows handler errors so the shared consumer can retry', async () => {
    mockRepository.saveEvent.mockResolvedValue({ id: 'row-2', isProcessed: false } as any);
    mockService.handlePaymentSuccess.mockRejectedValue(new Error('database unavailable'));

    await expect(capturedHandler!({
      eventId: 'event-2',
      eventName: 'PaymentSuccess',
      payload: { orderId: 'order-1', customerId: 'customer-1', amount: 1000 },
    })).rejects.toThrow('database unavailable');

    expect(mockRepository.markEventProcessed).not.toHaveBeenCalled();
  });
});
