import { notificationRepository } from '../repositories/notification.repository';
import { emailService } from './email.service';
import { createLogger } from '@nexacommerce/logger';
import config from '../config';

const logger = createLogger('notification-service');

export class NotificationService {
  async sendAuthEmail(options: {
    type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';
    email: string;
    name: string;
    token: string;
  }): Promise<boolean> {
    const route = options.type === 'EMAIL_VERIFICATION'
      ? '/auth/verify-email'
      : '/auth/reset-password';
    const actionUrl = new URL(route, config.customerWebUrl);
    actionUrl.searchParams.set('token', options.token);

    return emailService.sendEmail({
      to: options.email,
      templateName: options.type,
      templateData: {
        name: options.name,
        actionUrl: actionUrl.toString(),
      },
    });
  }

  async createNotification(options: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    channel?: 'IN_APP' | 'EMAIL' | 'BOTH';
    emailTo?: string;
    emailTemplateName?: string;
    emailTemplateData?: any;
  }) {
    const {
      userId,
      type,
      title,
      message,
      data,
      channel = 'IN_APP',
      emailTo,
      emailTemplateName,
      emailTemplateData,
    } = options;

    logger.info(`Creating notification: type=${type}, userId=${userId}, channel=${channel}`);

    let notificationRecord = null;

    // Create In-App Notification if channel is IN_APP or BOTH
    if (channel === 'IN_APP' || channel === 'BOTH') {
      notificationRecord = await notificationRepository.createNotification({
        userId,
        type,
        title,
        message,
        data: data ? (data as any) : undefined,
        channel,
      });
    }

    // Send Email if channel is EMAIL or BOTH
    if ((channel === 'EMAIL' || channel === 'BOTH') && emailTo && emailTemplateName) {
      // Async send email so it doesn't block the API/event response
      emailService.sendEmail({
        to: emailTo,
        templateName: emailTemplateName,
        templateData: emailTemplateData || {},
        notificationId: notificationRecord?.id,
      }).catch((err) => {
        logger.error(`Failed to send email async for ${emailTemplateName} to ${emailTo}:`, err);
      });
    }

    return notificationRecord;
  }

  async getNotifications(userId: string, isRead?: boolean) {
    return notificationRepository.getNotificationsByUserId(userId, isRead);
  }

  async markAsRead(id: string, userId: string) {
    const result = await notificationRepository.markAsRead(id, userId);
    return result.count > 0;
  }

  async markAllAsRead(userId: string) {
    const result = await notificationRepository.markAllAsRead(userId);
    return result.count;
  }

  async getUnreadCount(userId: string) {
    const notifications = await notificationRepository.getNotificationsByUserId(userId, false);
    return notifications.length;
  }

  // Seeding wrapper
  async seedTemplates() {
    return emailService.seedTemplates();
  }
}

export const notificationService = new NotificationService();
export default notificationService;
