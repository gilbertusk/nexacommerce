import prisma from '../prisma/client';
import { NotificationRepository } from './notification.repository';

describe('NotificationRepository.getNotificationsByUserId', () => {
  const repository = new NotificationRepository();

  beforeEach(() => {
    jest.spyOn(prisma.notification, 'findMany').mockResolvedValue([] as never);
    jest.spyOn(prisma.notification, 'count').mockResolvedValue(0 as never);
  });

  afterEach(() => jest.restoreAllMocks());

  it('applies the same user, read-state, and type filters to rows and total while keeping unread count global', async () => {
    await repository.getNotificationsByUserId('admin-1', false, 'LOW_STOCK', 2, 20);

    expect(prisma.notification.findMany).toHaveBeenCalledWith({
      where: { userId: 'admin-1', isRead: false, type: 'LOW_STOCK' },
      orderBy: { createdAt: 'desc' },
      skip: 20,
      take: 20,
    });
    expect(prisma.notification.count).toHaveBeenNthCalledWith(1, {
      where: { userId: 'admin-1', isRead: false, type: 'LOW_STOCK' },
    });
    expect(prisma.notification.count).toHaveBeenNthCalledWith(2, {
      where: { userId: 'admin-1', isRead: false },
    });
  });
});
