jest.mock('../../src/repositories/notification.repository');
jest.mock('../../src/services/email.service', () => ({
  emailService: { sendEmail: jest.fn() },
}));

import { notificationRepository } from '../../src/repositories/notification.repository';
import { emailService } from '../../src/services/email.service';
import { NotificationService } from '../../src/services/notification.service';

const mockRepository = notificationRepository as jest.Mocked<typeof notificationRepository>;
const mockEmailService = emailService as jest.Mocked<typeof emailService>;

describe('NotificationService event idempotency', () => {
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
    mockEmailService.sendEmail.mockResolvedValue(true);
  });

  it('does not create or email a notification for an event already handled', async () => {
    mockRepository.findBySourceEventId.mockResolvedValue({ id: 'notification-1' } as any);

    const result = await new NotificationService().createNotification(options);

    expect(result).toEqual({ id: 'notification-1' });
    expect(mockRepository.createNotification).not.toHaveBeenCalled();
    expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
  });

  it('stores the source event id before scheduling email delivery', async () => {
    mockRepository.findBySourceEventId.mockResolvedValue(null);
    mockRepository.createNotification.mockResolvedValue({ id: 'notification-2' } as any);

    const result = await new NotificationService().createNotification(options);

    expect(result).toEqual({ id: 'notification-2' });
    expect(mockRepository.createNotification).toHaveBeenCalledWith(expect.objectContaining({
      sourceEventId: 'event-1',
    }));
    expect(mockEmailService.sendEmail).toHaveBeenCalledWith(expect.objectContaining({
      notificationId: 'notification-2',
    }));
  });

  it('treats a concurrent unique event insert as a duplicate', async () => {
    mockRepository.findBySourceEventId
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'notification-winner' } as any);
    mockRepository.createNotification.mockRejectedValue({ code: 'P2002' });

    const result = await new NotificationService().createNotification(options);

    expect(result).toEqual({ id: 'notification-winner' });
    expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
  });
});
