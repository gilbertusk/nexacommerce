import { prisma } from '../prisma/client';
import { Prisma } from '../generated/client';

export class ShippingRepository {
  async findCourierById(id: string) {
    return prisma.courier.findUnique({
      where: { id },
    });
  }

  async findCourierByCode(code: string) {
    return prisma.courier.findUnique({
      where: { code: code.toLowerCase() },
    });
  }

  async findAllCouriers(isActiveOnly = true) {
    return prisma.courier.findMany({
      where: isActiveOnly ? { isActive: true } : {},
      orderBy: { name: 'asc' },
    });
  }

  async upsertCourier(code: string, name: string, services: any[]) {
    return prisma.courier.upsert({
      where: { code: code.toLowerCase() },
      update: { name, services },
      create: { code: code.toLowerCase(), name, services },
    });
  }

  async createShippingRate(data: {
    courierId: string;
    originCity: string;
    destinationCity: string;
    serviceCode: string;
    weight: number;
    cost: number;
    estimatedDays: string;
  }) {
    return prisma.shippingRate.create({
      data: {
        courierId: data.courierId,
        originCity: data.originCity,
        destinationCity: data.destinationCity,
        serviceCode: data.serviceCode,
        weight: data.weight,
        cost: new Prisma.Decimal(data.cost),
        estimatedDays: data.estimatedDays,
      },
    });
  }

  async countRates() {
    return prisma.shippingRate.count();
  }

  async findShippingOrderById(id: string) {
    return prisma.shippingOrder.findUnique({
      where: { id },
      include: {
        history: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async findShippingOrderByOrderId(orderId: string) {
    return prisma.shippingOrder.findUnique({
      where: { orderId },
      include: {
        history: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async createShippingOrder(tx: Prisma.TransactionClient, data: {
    orderId: string;
    courierId: string;
    courierName: string;
    serviceCode: string;
    serviceName: string;
    trackingNumber: string;
    originAddress: any;
    destinationAddress: any;
    weight: number;
    cost: number;
    notes?: string;
  }) {
    return tx.shippingOrder.create({
      data: {
        orderId: data.orderId,
        courierId: data.courierId,
        courierName: data.courierName,
        serviceCode: data.serviceCode,
        serviceName: data.serviceName,
        trackingNumber: data.trackingNumber,
        originAddress: data.originAddress,
        destinationAddress: data.destinationAddress,
        weight: data.weight,
        cost: new Prisma.Decimal(data.cost),
        status: 'WAITING_PICKUP',
        notes: data.notes,
      },
    });
  }

  async createStatusHistory(tx: Prisma.TransactionClient, data: {
    shippingOrderId: string;
    fromStatus: string | null;
    toStatus: string;
    location?: string;
    note?: string;
    updatedBy?: string;
  }) {
    return tx.shippingStatusHistory.create({
      data: {
        shippingOrderId: data.shippingOrderId,
        fromStatus: data.fromStatus,
        toStatus: data.toStatus,
        location: data.location || null,
        note: data.note || null,
        updatedBy: data.updatedBy || 'SYSTEM',
      },
    });
  }

  async updateShippingOrderStatus(tx: Prisma.TransactionClient, id: string, data: {
    status: string;
    shippedAt?: Date | null;
    deliveredAt?: Date | null;
  }) {
    return tx.shippingOrder.update({
      where: { id },
      data: {
        status: data.status,
        shippedAt: data.shippedAt,
        deliveredAt: data.deliveredAt,
      },
    });
  }

  async claimShippingOrderStatus(tx: Prisma.TransactionClient, id: string, currentStatus: string, data: {
    status: string;
    shippedAt?: Date | null;
    deliveredAt?: Date | null;
  }) {
    return tx.shippingOrder.updateMany({
      where: { id, status: currentStatus },
      data: {
        status: data.status,
        shippedAt: data.shippedAt,
        deliveredAt: data.deliveredAt,
      },
    });
  }

  async findRates(originCity: string, destinationCity: string, weight: number, courierId?: string) {
    const whereClause: any = {
      originCity: { equals: originCity, mode: 'insensitive' },
      destinationCity: { equals: destinationCity, mode: 'insensitive' },
      weight: { gte: weight },
    };

    if (courierId) {
      whereClause.courierId = courierId;
    }

    return prisma.shippingRate.findMany({
      where: whereClause,
      include: {
        courier: true,
      },
      orderBy: [
        { weight: 'asc' },
        { cost: 'asc' },
      ],
    });
  }

  async findAndCountAll(params: {
    skip: number;
    take: number;
    status?: string;
    courierId?: string;
    orderIds?: string[];
  }) {
    const where: any = {};
    if (params.status) {
      where.status = params.status;
    }
    if (params.courierId) {
      where.courierId = params.courierId;
    }
    if (params.orderIds) {
      where.orderId = { in: params.orderIds };
    }

    const [orders, total] = await Promise.all([
      prisma.shippingOrder.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: {
          history: { orderBy: { createdAt: 'asc' } },
        },
      }),
      prisma.shippingOrder.count({ where }),
    ]);

    return { orders, total };
  }

  async findTrackingByNumber(trackingNumber: string) {
    return prisma.shippingOrder.findUnique({
      where: { trackingNumber },
      include: {
        history: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }
}

export const shippingRepository = new ShippingRepository();
export default shippingRepository;
