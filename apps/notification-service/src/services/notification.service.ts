import { notificationRepository } from '../repositories/notification.repository';
import { emailService } from './email.service';
import { createLogger } from '@nexacommerce/logger';
import config from '../config';
import prisma from '../prisma/client';
import type { NotificationWriteClient } from '../repositories/notification.repository';

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

    // Queued rather than sent inline: the caller is told the message is
    // durably accepted for delivery, not that SMTP already took it.
    await emailService.queueEmail(prisma, {
      to: options.email,
      templateName: options.type,
      templateData: {
        name: options.name,
        actionUrl: actionUrl.toString(),
      },
    });
    return true;
  }

  /**
   * Write one notification and, when the channel calls for it, the email job
   * that goes with it.
   *
   * Both writes use `client`. When the caller passes an inbox transaction, the
   * in-app record, the queued email, and the marker saying the source event was
   * consumed all commit together — so a crash cannot leave a notification with
   * no email, or an event marked handled with neither.
   */
  async createNotification(
    options: {
      userId: string;
      type: string;
      title: string;
      message: string;
      data?: any;
      channel?: 'IN_APP' | 'EMAIL' | 'BOTH';
      emailTo?: string;
      emailTemplateName?: string;
      emailTemplateData?: any;
      sourceEventId?: string;
    },
    client: NotificationWriteClient = prisma,
  ) {
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
      sourceEventId,
    } = options;

    logger.info(`Creating notification: type=${type}, userId=${userId}, channel=${channel}`);

    let notificationRecord = null;

    if (channel === 'IN_APP' || channel === 'BOTH') {
      notificationRecord = await notificationRepository.createNotification(
        {
          userId,
          sourceEventId,
          type,
          title,
          message,
          data: data ? (data as any) : undefined,
          channel,
        },
        client,
      );
    }

    if ((channel === 'EMAIL' || channel === 'BOTH') && emailTo && emailTemplateName) {
      await emailService.queueEmail(client, {
        to: emailTo,
        templateName: emailTemplateName,
        templateData: emailTemplateData || {},
        notificationId: notificationRecord?.id,
      });
    }

    return notificationRecord;
  }

  async getNotifications(userId: string, isRead: boolean | undefined, type: string | undefined, page: number, limit: number) {
    return notificationRepository.getNotificationsByUserId(userId, isRead, type, page, limit);
  }

  async markAsRead(id: string, userId: string) {
    const result = await notificationRepository.markAsRead(id, userId);
    return result.count > 0;
  }

  async deleteNotification(id: string, userId: string) {
    const result = await notificationRepository.deleteForUser(id, userId);
    return result.count > 0;
  }

  async markAllAsRead(userId: string) {
    const result = await notificationRepository.markAllAsRead(userId);
    return result.count;
  }

  async getUnreadCount(userId: string) {
    return notificationRepository.countUnreadByUserId(userId);
  }

  // Seeding wrapper
  async seedTemplates() {
    return emailService.seedTemplates();
  }
}

export const notificationService = new NotificationService();
export default notificationService;
