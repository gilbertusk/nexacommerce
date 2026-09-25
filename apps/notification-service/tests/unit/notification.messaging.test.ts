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
jest.mock('../../src/messaging/inbox', () => ({
  notificationInbox: {
    runInTransaction: jest.fn(),
    claim: jest.fn(),
    markProcessed: jest.fn(),
    recordFailure: jest.fn(),
    isUniqueViolation: jest.fn(() => false),
  },
}));
jest.mock('../../src/messaging/email-dispatcher', () => ({
  startEmailDispatcher: jest.fn(),
}));

import { initRabbitMQ, NOTIFICATION_RABBITMQ_CONSUMER } from '../../src/messaging/rabbitmq';
import { notificationInbox } from '../../src/messaging/inbox';
import { notificationService } from '../../src/services/notification.service';

const mockInbox = notificationInbox as jest.Mocked<typeof notificationInbox>;
const mockNotificationService = notificationService as jest.Mocked<typeof notificationService>;

const TX = { tx: true } as any;

const paymentEvent = {
  eventId: 'event-1',
  eventName: 'PaymentSuccess',
  payload: { orderId: 'order-1', customerId: 'customer-1', amount: 1000 },
};

describe('notification RabbitMQ handler', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockInbox.isUniqueViolation.mockReturnValue(false);
    mockInbox.runInTransaction.mockImplementation(async (fn: any) => fn(TX));
    mockInbox.claim.mockResolvedValue('CLAIMED');
    mockNotificationService.createNotification.mockResolvedValue({ id: 'notification-1' } as any);
    capturedHandler = undefined;
    (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { email: 'customer@example.com', username: 'Customer' } }),
    });
    await initRabbitMQ();
  });

  it('writes the notification and the consumed marker with one transaction', async () => {
    // Act
    await capturedHandler!(paymentEvent);

    // Assert
    expect(mockNotificationService.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceEventId: 'event-1',
        userId: 'customer-1',
        type: 'PAYMENT_SUCCESS',
        emailTo: 'customer@example.com',
      }),
      TX,
    );
    expect(mockInbox.markProcessed).toHaveBeenCalledWith(TX, {
      eventId: 'event-1',
      consumer: NOTIFICATION_RABBITMQ_CONSUMER,
    });
  });

  it('resolves the recipient before opening the transaction', async () => {
    // Arrange
    const order: string[] = [];
    (global.fetch as jest.Mock) = jest.fn(async () => {
      order.push('lookup');
      return { ok: true, json: async () => ({ data: { email: 'c@example.com', username: 'C' } }) };
    });
    mockInbox.runInTransaction.mockImplementation(async (fn: any) => {
      order.push('transaction');
      return fn(TX);
    });

    // Act
    await capturedHandler!(paymentEvent);

    // Assert: no network call may happen while the transaction holds locks.
    expect(order).toEqual(['lookup', 'transaction']);
  });

  it('does not rewrite an event the inbox reports as already consumed', async () => {
    // Arrange
    mockInbox.claim.mockResolvedValue('DUPLICATE');

    // Act
    await capturedHandler!(paymentEvent);

    // Assert
    expect(mockNotificationService.createNotification).not.toHaveBeenCalled();
    expect(mockInbox.markProcessed).not.toHaveBeenCalled();
  });

  it('rethrows notification failures without marking the event consumed', async () => {
    // Arrange
    mockNotificationService.createNotification.mockRejectedValue(new Error('database unavailable'));

    // Act + Assert
    await expect(capturedHandler!({ ...paymentEvent, eventId: 'event-2' })).rejects.toThrow(
      'database unavailable',
    );
    expect(mockInbox.markProcessed).not.toHaveBeenCalled();
  });

  it('fails the event rather than inventing a recipient when the user lookup fails', async () => {
    // Arrange: a guessed address would send real mail to the wrong person.
    (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({ ok: false, status: 503 });

    // Act + Assert
    await expect(capturedHandler!({ ...paymentEvent, eventId: 'event-3' })).rejects.toThrow(/503/);
    expect(mockNotificationService.createNotification).not.toHaveBeenCalled();
    expect(mockInbox.runInTransaction).not.toHaveBeenCalled();
  });

  it('fails the event when the user record carries no email address', async () => {
    // Arrange
    (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { username: 'Customer' } }),
    });

    // Act + Assert
    await expect(capturedHandler!({ ...paymentEvent, eventId: 'event-4' })).rejects.toThrow(
      /no email/i,
    );
  });
});
