import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service';
import { successResponse, ValidationError, ForbiddenError } from '@nexacommerce/common';
import prisma from '../prisma/client';
import { z } from 'zod';

const authEmailSchema = z.object({
  type: z.enum(['EMAIL_VERIFICATION', 'PASSWORD_RESET']),
  email: z.string().email(),
  name: z.string().trim().min(1).max(120),
  token: z.string().uuid(),
}).strict();

export class NotificationController {
  sendAuthEmail = async (req: Request, res: Response) => {
    const data = authEmailSchema.parse(req.body);
    const accepted = await notificationService.sendAuthEmail(data);
    if (!accepted) {
      res.status(503).json({ success: false, message: 'Email delivery could not be accepted' });
      return;
    }
    res.status(202).json(successResponse({ accepted: true }, 'Email delivery accepted'));
  };

  getNotifications = async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      throw new ValidationError('User ID is required');
    }
    const isReadParam = req.query.isRead;
    let isRead: boolean | undefined;
    if (isReadParam !== undefined) {
      isRead = isReadParam === 'true';
    }

    const result = await notificationService.getNotifications(userId, isRead);
    res.status(200).json(successResponse(result, 'Notifications retrieved successfully'));
  };

  getUnreadCount = async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    const count = await notificationService.getUnreadCount(userId);
    res.status(200).json(successResponse({ count }, 'Unread notifications count retrieved'));
  };

  markAsRead = async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    const { id } = req.params;
    if (!userId || !id) {
      throw new ValidationError('User ID and Notification ID are required');
    }

    const marked = await notificationService.markAsRead(id, userId);
    if (!marked) {
      throw new ValidationError('Notification not found or already read');
    }

    res.status(200).json(successResponse(null, 'Notification marked as read'));
  };

  markAllAsRead = async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    const count = await notificationService.markAllAsRead(userId);
    res.status(200).json(successResponse({ count }, 'All notifications marked as read'));
  };

  // Admin endpoint to view email logs
  getEmailLogs = async (req: Request, res: Response) => {
    const userRole = req.headers['x-user-role'] as string;
    if (userRole !== 'ADMIN') {
      throw new ForbiddenError('Only admin can view email logs');
    }

    const logs = await prisma.emailLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100, // limit to 100 most recent logs
    });

    res.status(200).json(successResponse(logs, 'Email logs retrieved successfully'));
  };

  // Internal test endpoint to trigger an email template seed manually
  seedTemplates = async (req: Request, res: Response) => {
    await notificationService.seedTemplates();
    res.status(200).json(successResponse(null, 'Templates seeded successfully'));
  };
}

export const notificationController = new NotificationController();
export default notificationController;
