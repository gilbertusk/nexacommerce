import { notificationRepository } from '../repositories/notification.repository';
import { emailService } from './email.service';
import { NotificationService } from './notification.service';

describe('NotificationService.sendAuthEmail', () => {
  it('builds an email verification URL and queues the message durably', async () => {
    // Arrange
    const queueEmail = jest.spyOn(emailService, 'queueEmail').mockResolvedValue({ id: 'email-1' });

    // Act
    const accepted = await new NotificationService().sendAuthEmail({
      type: 'EMAIL_VERIFICATION',
      email: 'customer@example.com',
      name: 'Customer',
      token: '7a9b7ae8-1ac0-4a42-8348-6041ed96a1d2',
    });

    // Assert
    expect(accepted).toBe(true);
    expect(queueEmail).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        to: 'customer@example.com',
        templateName: 'EMAIL_VERIFICATION',
        templateData: expect.objectContaining({
          actionUrl: expect.stringContaining(
            '/auth/verify-email?token=7a9b7ae8-1ac0-4a42-8348-6041ed96a1d2',
          ),
        }),
      }),
    );
  });

  it('surfaces a queueing failure instead of reporting the email as accepted', async () => {
    // Arrange: an unknown template is a configuration fault, not a silent no-op.
    jest
      .spyOn(emailService, 'queueEmail')
      .mockRejectedValue(new Error('Email template "PASSWORD_RESET" not found or inactive'));

    // Act + Assert
    await expect(
      new NotificationService().sendAuthEmail({
        type: 'PASSWORD_RESET',
        email: 'customer@example.com',
        name: 'Customer',
        token: '7a9b7ae8-1ac0-4a42-8348-6041ed96a1d2',
      }),
    ).rejects.toThrow('not found or inactive');
  });
});

describe('NotificationService.getNotifications', () => {
  it('forwards the server-side type filter and pagination to the repository', async () => {
    const result = { notifications: [], total: 0, unreadCount: 0, page: 1, limit: 20 };
    const getNotificationsByUserId = jest.spyOn(notificationRepository, 'getNotificationsByUserId').mockResolvedValue(result as never);

    await expect(new NotificationService().getNotifications('admin-1', undefined, 'LOW_STOCK', 1, 20)).resolves.toBe(result);
    expect(getNotificationsByUserId).toHaveBeenCalledWith('admin-1', undefined, 'LOW_STOCK', 1, 20);
  });
});

describe('NotificationService.deleteNotification', () => {
  const service = new NotificationService();

  it('deletes only the requested notification belonging to the current user', async () => {
    const deleteForUser = jest.spyOn(notificationRepository, 'deleteForUser').mockResolvedValue({ count: 1 } as never);

    await expect(service.deleteNotification('notification-1', 'user-1')).resolves.toBe(true);
    expect(deleteForUser).toHaveBeenCalledWith('notification-1', 'user-1');
  });

  it('does not report success when the notification is absent or owned by someone else', async () => {
    jest.spyOn(notificationRepository, 'deleteForUser').mockResolvedValue({ count: 0 } as never);

    await expect(service.deleteNotification('notification-1', 'user-2')).resolves.toBe(false);
  });
});
