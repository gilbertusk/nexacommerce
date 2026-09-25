import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service';
import { NotificationController } from './notification.controller';

describe('NotificationController.getNotifications', () => {
  const controller = new NotificationController();

  it('returns the paginated envelope expected by customer consumers', async () => {
    const pageResult = {
      notifications: [{ id: 'note-1', isRead: false }],
      total: 3,
      unreadCount: 2,
      page: 2,
      limit: 1,
    };
    const getNotifications = jest.spyOn(notificationService, 'getNotifications').mockResolvedValue(pageResult as never);
    const req = {
      headers: { 'x-user-id': 'user-1' },
      query: { page: '2', limit: '1', isRead: 'false', type: 'ORDER_CREATED' },
    } as unknown as Request;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

    await controller.getNotifications(req, res);

    expect(getNotifications).toHaveBeenCalledWith('user-1', false, 'ORDER_CREATED', 2, 1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: pageResult }));
  });

  it('rejects invalid filters and pagination before reading storage', async () => {
    const getNotifications = jest.spyOn(notificationService, 'getNotifications');
    const req = {
      headers: { 'x-user-id': 'user-1' },
      query: { page: '1.5', limit: '1000', isRead: 'sometimes', type: '   ' },
    } as unknown as Request;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

    await expect(controller.getNotifications(req, res)).rejects.toThrow();
    expect(getNotifications).not.toHaveBeenCalled();
  });
});

describe('NotificationController.sendAuthEmail', () => {
  const controller = new NotificationController();
  const body = {
    type: 'EMAIL_VERIFICATION',
    email: 'customer@example.com',
    name: 'Customer',
    token: '7a9b7ae8-1ac0-4a42-8348-6041ed96a1d2',
  };

  it('returns 503 when the email provider does not accept the message', async () => {
    jest.spyOn(notificationService, 'sendAuthEmail').mockResolvedValue(false);
    const req = { body } as Request;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

    await controller.sendAuthEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('returns 202 only after the email provider accepts the message', async () => {
    jest.spyOn(notificationService, 'sendAuthEmail').mockResolvedValue(true);
    const req = { body } as Request;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

    await controller.sendAuthEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: { accepted: true } }));
  });
});
