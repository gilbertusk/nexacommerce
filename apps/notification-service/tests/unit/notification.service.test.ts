jest.mock('../../src/repositories/notification.repository');
jest.mock('../../src/services/email.service', () => ({
  emailService: { queueEmail: jest.fn() },
}));

import { notificationRepository } from '../../src/repositories/notification.repository';
import { emailService } from '../../src/services/email.service';
import { NotificationService } from '../../src/services/notification.service';

const mockRepository = notificationRepository as jest.Mocked<typeof notificationRepository>;
const mockEmailService = emailService as jest.Mocked<typeof emailService>;

const TX = { tx: true } as any;

describe('NotificationService.createNotification', () => {
  const options = {
    userId: 'customer-1',
    type: 'PAYMENT_SUCCESS',
    title: 'Payment Successful',
    message: 'Payment received',
    channel: 'BOTH' as const,
    emailTo: 'customer@example.com',
    emailTemplateName: 'PAYMENT_SUCCESS',
    emailTemplateData: { orderId: 'order-1' },
    sourceEventId: 'event-1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockEmailService.queueEmail.mockResolvedValue({ id: 'email-1' });
    mockRepository.createNotification.mockResolvedValue({ id: 'notification-1' } as any);
  });

  it('writes the notification and queues its email through the same client', async () => {
    // Act
    await new NotificationService().createNotification(options, TX);

    // Assert: both writes must be able to commit or roll back as one unit.
    expect(mockRepository.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'customer-1', sourceEventId: 'event-1' }),
      TX,
    );
    expect(mockEmailService.queueEmail).toHaveBeenCalledWith(
      TX,
      expect.objectContaining({
        to: 'customer@example.com',
        templateName: 'PAYMENT_SUCCESS',
        notificationId: 'notification-1',
      }),
    );
  });

  it('queues no email for an in-app only notification', async () => {
    // Act
    await new NotificationService().createNotification(
      { ...options, channel: 'IN_APP' },
      TX,
    );

    // Assert
    expect(mockRepository.createNotification).toHaveBeenCalled();
    expect(mockEmailService.queueEmail).not.toHaveBeenCalled();
  });

  it('writes no in-app row for an email-only notification', async () => {
    // Act
    const result = await new NotificationService().createNotification(
      { ...options, channel: 'EMAIL' },
      TX,
    );

    // Assert
    expect(result).toBeNull();
    expect(mockRepository.createNotification).not.toHaveBeenCalled();
    expect(mockEmailService.queueEmail).toHaveBeenCalled();
  });

  it('propagates a queueing failure so the whole transaction is abandoned', async () => {
    // Arrange: the notification must not survive without its email.
    mockEmailService.queueEmail.mockRejectedValue(new Error('template missing'));

    // Act + Assert
    await expect(
      new NotificationService().createNotification(options, TX),
    ).rejects.toThrow('template missing');
  });
});
