import { prisma } from '../prisma/client';
import { Prisma } from '../generated/client';

export class OrderRepository {
  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findByOrderNumber(orderNumber: string) {
    return prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async create(data: Prisma.OrderCreateInput) {
    return prisma.order.create({
      data,
      include: {
        items: true,
      },
    });
  }

  async update(id: string, data: Prisma.OrderUpdateInput) {
    return prisma.order.update({
      where: { id },
      data,
      include: {
        items: true,
      },
    });
  }

  async findAndCountAll(params: {
    skip: number;
    take: number;
    customerId?: string;
    status?: string;
    sellerId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const where: Prisma.OrderWhereInput = {};

    if (params.customerId) {
      where.customerId = params.customerId;
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.sellerId) {
      where.items = {
        some: {
          sellerId: params.sellerId,
        },
      };
    }

    if (params.dateFrom || params.dateTo) {
      where.createdAt = {};
      if (params.dateFrom) (where.createdAt as any).gte = params.dateFrom;
      if (params.dateTo) (where.createdAt as any).lte = params.dateTo;
    }

    // If searching by seller, we need to filter/return only orders having seller items,
    // but in microservices we might return the whole order or filter. Here, simple filter by order items is perfect.
    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: params.skip,
        take: params.take,
        include: {
          items: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    return { items, total };
  }

  async countCreatedToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.order.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });
  }

  async findExpiredOrders(now: Date) {
    return prisma.order.findMany({
      where: {
        status: 'PENDING_PAYMENT',
        expiresAt: {
          lte: now,
        },
      },
    });
  }

  async findDeliveredOrdersOlderThan(date: Date) {
    return prisma.order.findMany({
      where: {
        status: 'DELIVERED',
        updatedAt: {
          lte: date,
        },
      },
      include: {
        items: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }
}

export const orderRepository = new OrderRepository();
