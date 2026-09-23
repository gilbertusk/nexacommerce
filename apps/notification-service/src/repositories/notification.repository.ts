import prisma from '../prisma/client';
import { Prisma } from '../generated/client';

export class NotificationRepository {
  async createNotification(data: Prisma.NotificationCreateInput) {
    return prisma.notification.create({ data });
  }

  async getNotificationsByUserId(userId: string, isRead?: boolean) {
    const where: Prisma.NotificationWhereInput = { userId };
    if (isRead !== undefined) {
      where.isRead = isRead;
    }
    return prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async getNotificationById(id: string, userId: string) {
    return prisma.notification.findFirst({
      where: { id, userId },
    });
  }

  // Email logs
  async createEmailLog(data: Prisma.EmailLogUncheckedCreateInput) {
    return prisma.emailLog.create({ data });
  }

  async updateEmailLog(id: string, data: Prisma.EmailLogUpdateInput) {
    return prisma.emailLog.update({
      where: { id },
      data,
    });
  }

  // Templates
  async findTemplateByName(name: string) {
    return prisma.emailTemplate.findUnique({
      where: { name },
    });
  }

  async upsertTemplate(name: string, subject: string, htmlBody: string, textBody?: string) {
    return prisma.emailTemplate.upsert({
      where: { name },
      update: { subject, htmlBody, textBody },
      create: { name, subject, htmlBody, textBody },
    });
  }
}

export const notificationRepository = new NotificationRepository();
