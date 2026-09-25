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
    buildInternalServiceHeaders: jest.fn(() => ({})),
  };
});
jest.mock('../../src/services/notification.service', () => ({
  notificationService: { createNotification: jest.fn() },
}));

import { initRabbitMQ } from '../../src/messaging/rabbitmq';
import { notificationService } from '../../src/services/notification.service';

const mockNotificationService = notificationService as jest.Mocked<typeof notificationService>;

describe('notification RabbitMQ handler', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    capturedHandler = undefined;
    (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { email: 'customer@example.com', username: 'Customer' } }),
    });
    await initRabbitMQ();
  });

  it('passes the stable event id into notification deduplication', async () => {
    mockNotificationService.createNotification.mockResolvedValue({ id: 'notification-1' } as any);

    await capturedHandler!({
      eventId: 'event-1',
      eventName: 'PaymentSuccess',
      payload: { orderId: 'order-1', customerId: 'customer-1', amount: 1000 },
    });

    expect(mockNotificationService.createNotification).toHaveBeenCalledWith(expect.objectContaining({
      sourceEventId: 'event-1',
      userId: 'customer-1',
      type: 'PAYMENT_SUCCESS',
    }));
  });

  it('rethrows notification failures so the shared consumer can retry', async () => {
    mockNotificationService.createNotification.mockRejectedValue(new Error('database unavailable'));

    await expect(capturedHandler!({
      eventId: 'event-2',
      eventName: 'PaymentSuccess',
      payload: { orderId: 'order-1', customerId: 'customer-1', amount: 1000 },
    })).rejects.toThrow('database unavailable');
  });
});
