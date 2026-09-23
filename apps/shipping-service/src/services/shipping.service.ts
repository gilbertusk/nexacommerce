import { shippingRepository } from '../repositories/shipping.repository';
import { prisma } from '../prisma/client';
import { AppError, NotFoundError, ValidationError, ForbiddenError, buildInternalServiceHeaders } from '@nexacommerce/common';
import { publishOrderShipped, publishOrderDelivered } from '../messaging/rabbitmq';
import { config } from '../config';
import crypto from 'crypto';

export class ShippingService {
  private async getAuthoritativeOrder(orderId: string): Promise<any> {
    let response: globalThis.Response;
    try {
      response = await fetch(`${config.orderServiceUrl}/orders/internal/orders/${orderId}`, {
        headers: buildInternalServiceHeaders('shipping-service'),
      });
    } catch {
      throw new AppError('Unable to verify order ownership', 502);
    }

    if (!response.ok) {
      throw new AppError('Unable to verify order ownership', 502);
    }

    const body = await response.json() as any;
    if (!body?.data?.id || !body?.data?.customerId) {
      throw new AppError('Order service returned invalid ownership data', 502);
    }
    return body.data;
  }

  private async assertOrderAccess(orderId: string, actor: { userId: string; role: string }): Promise<any> {
    const order = await this.getAuthoritativeOrder(orderId);
    if (actor.role === 'ADMIN') return order;
    if (actor.role === 'CUSTOMER' && order.customerId === actor.userId) return order;
    if (actor.role === 'SELLER' && order.items?.some((item: any) => item.sellerId === actor.userId)) return order;
    throw new ForbiddenError('You are not allowed to access this shipment');
  }

  private async assertOrderMutationAccess(orderId: string, actor: { userId: string; role: string }): Promise<any> {
    const order = await this.assertOrderAccess(orderId, actor);
    if (actor.role === 'SELLER' && order.items?.some((item: any) => item.sellerId !== actor.userId)) {
      throw new ForbiddenError('Seller cannot mutate a shipment for a multi-seller order');
    }
    return order;
  }

  async getCouriers() {
    return shippingRepository.findAllCouriers(true);
  }

  async getRates(params: {
    originCity: string;
    destinationCity: string;
    weight: number;
    courierCode?: string;
  }) {
    let courierId: string | undefined;
    if (params.courierCode) {
      const courier = await shippingRepository.findCourierByCode(params.courierCode);
      if (!courier) {
        throw new NotFoundError('Courier not found');
      }
      courierId = courier.id;
    }

    const rates = await shippingRepository.findRates(
      params.originCity,
      params.destinationCity,
      params.weight,
      courierId
    );

    // Group by courier and service code to get the minimum weight bracket matching
    const grouped = new Map<string, any>();
    for (const rate of rates) {
      const key = `${rate.courierId}-${rate.serviceCode}`;
      if (!grouped.has(key)) {
        // Calculate cost based on weight scale (e.g. weight / 1000g, rounded up, times base cost per kg)
        // Wait, the rate entries in database can represent cost per kg, or flat cost.
        // Let's assume rate.cost is the base rate for this weight bracket.
        const multiplier = Math.ceil(params.weight / rate.weight);
        const totalCost = Number(rate.cost) * (rate.weight === 1000 ? multiplier : 1);
        
        const serviceInfo = (rate.courier.services as any[]).find((s: any) => s.code === rate.serviceCode);

        grouped.set(key, {
          courierName: rate.courier.name,
          serviceCode: rate.serviceCode,
          serviceName: serviceInfo ? serviceInfo.name : rate.serviceCode,
          cost: totalCost,
          estimatedDays: rate.estimatedDays,
        });
      }
    }

    return Array.from(grouped.values());
  }

  async createShippingOrder(data: {
    orderId: string;
    courierId: string;
    serviceCode: string;
    weight: number;
    originCity: string;
    destinationAddress: any;
    notes?: string;
  }) {
    const existing = await shippingRepository.findShippingOrderByOrderId(data.orderId);
    if (existing) {
      return existing; // idempotent
    }

    const courier = await shippingRepository.findCourierById(data.courierId);
    if (!courier) {
      throw new NotFoundError('Courier not found');
    }

    const serviceInfo = (courier.services as any[]).find((s: any) => s.code === data.serviceCode);
    if (!serviceInfo) {
      throw new ValidationError('Invalid service code for courier');
    }

    // Get rates to calculate cost
    const rates = await this.getRates({
      originCity: data.originCity,
      destinationCity: data.destinationAddress.city,
      weight: data.weight,
      courierCode: courier.code,
    });

    const selectedRate = rates.find((r) => r.serviceCode === data.serviceCode);
    const cost = selectedRate ? selectedRate.cost : 15000; // fallback cost

    // Generate tracking number: format NXC-SHP-{YYYYMMDD}-{random 6 chars uppercase}
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const trackingNumber = `NXC-SHP-${todayStr}-${randomHex}`;

    const originAddress = { city: data.originCity, province: 'DKI Jakarta' }; // simplified

    return prisma.$transaction(async (tx) => {
      const order = await shippingRepository.createShippingOrder(tx, {
        orderId: data.orderId,
        courierId: data.courierId,
        courierName: courier.name,
        serviceCode: data.serviceCode,
        serviceName: serviceInfo.name,
        trackingNumber,
        originAddress,
        destinationAddress: data.destinationAddress,
        weight: data.weight,
        cost,
        notes: data.notes,
      });

      await shippingRepository.createStatusHistory(tx, {
        shippingOrderId: order.id,
        fromStatus: null,
        toStatus: 'WAITING_PICKUP',
        location: data.originCity,
        note: 'Shipping label created',
      });

      return {
        ...order,
        history: [{ toStatus: 'WAITING_PICKUP', location: data.originCity, note: 'Shipping label created', createdAt: new Date() }],
      };
    });
  }

  async getShippingOrder(orderId: string, actor?: { userId: string; role: string }) {
    const order = await shippingRepository.findShippingOrderByOrderId(orderId);
    if (!order) {
      throw new NotFoundError('Shipping order not found');
    }

    if (actor) await this.assertOrderAccess(orderId, actor);

    return order;
  }

  async updateShippingStatus(
    orderId: string,
    actor: { userId: string; role: string },
    data: { status: string; location?: string; note?: string }
  ) {
    const order = await shippingRepository.findShippingOrderByOrderId(orderId);
    if (!order) {
      throw new NotFoundError('Shipping order not found');
    }

    const authoritativeOrder = await this.assertOrderMutationAccess(orderId, actor);

    const currentStatus = order.status;
    const nextStatus = data.status;

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      'WAITING_PICKUP': ['PICKED_UP', 'FAILED'],
      'PICKED_UP': ['IN_TRANSIT', 'FAILED'],
      'IN_TRANSIT': ['IN_TRANSIT', 'DELIVERED', 'FAILED'],
      'FAILED': ['RETURNED'],
      'DELIVERED': [],
      'RETURNED': [],
    };

    const allowed = validTransitions[currentStatus] || [];
    if (!allowed.includes(nextStatus)) {
      throw new ValidationError(`Invalid shipping status transition from ${currentStatus} to ${nextStatus}`);
    }

    const shippedAt = nextStatus === 'PICKED_UP' ? new Date() : order.shippedAt;
    const deliveredAt = nextStatus === 'DELIVERED' ? new Date() : order.deliveredAt;

    const updated = await prisma.$transaction(async (tx) => {
      const ord = await shippingRepository.updateShippingOrderStatus(tx, order.id, {
        status: nextStatus,
        shippedAt,
        deliveredAt,
      });

      await shippingRepository.createStatusHistory(tx, {
        shippingOrderId: order.id,
        fromStatus: currentStatus,
        toStatus: nextStatus,
        location: data.location,
        note: data.note,
        updatedBy: actor.userId,
      });

      return ord;
    });

    const customerId = authoritativeOrder.customerId;

    if (nextStatus === 'PICKED_UP' || nextStatus === 'IN_TRANSIT') {
      await publishOrderShipped({
        orderId: order.orderId,
        customerId,
        trackingNumber: order.trackingNumber || '',
        courierName: order.courierName,
        serviceName: order.serviceName,
        estimatedDelivery: order.estimatedDelivery || undefined,
      }).catch((e) => console.error('[Shipping Service] Publish OrderShipped failed:', e.message));
    } else if (nextStatus === 'DELIVERED') {
      await publishOrderDelivered({
        orderId: order.orderId,
        customerId,
        deliveredAt: deliveredAt!.toISOString(),
      }).catch((e) => console.error('[Shipping Service] Publish OrderDelivered failed:', e.message));
    }

    return this.getShippingOrder(orderId);
  }

  async getSellerShippingOrders(sellerId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    // Fetch order list for this seller via internal call to order service
    let orderIds: string[] = [];
    try {
      const response = await fetch(`${config.orderServiceUrl}/orders/internal/orders/seller/${sellerId}`, {
        headers: buildInternalServiceHeaders('shipping-service')
      });
      if (response.ok) {
        const resBody = await response.json() as any;
        orderIds = (resBody.data || []).map((o: any) => o.id);
      }
    } catch (err) {
      console.error('[Shipping Service] Failed to fetch seller orders from order service:', err);
    }

    if (orderIds.length === 0) {
      return { orders: [], total: 0, page, limit, totalPages: 0 };
    }

    const { orders, total } = await shippingRepository.findAndCountAll({
      skip,
      take: limit,
      orderIds,
    });

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAdminShippingOrders(params: { page?: number; limit?: number; status?: string; courierId?: string }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const { orders, total } = await shippingRepository.findAndCountAll({
      skip,
      take: limit,
      status: params.status,
      courierId: params.courierId,
    });

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async seedData() {
    console.log('[Shipping Service] Starting data seeding...');
    
    // Seed Couriers
    const jne = await shippingRepository.upsertCourier('jne', 'JNE', [
      { code: 'REG', name: 'Regular', estimatedDays: '2-3' },
      { code: 'YES', name: 'Yakin Esok Sampai', estimatedDays: '1' },
      { code: 'OKE', name: 'Ongkos Kirim Ekonomis', estimatedDays: '4-6' }
    ]);
    
    const jnt = await shippingRepository.upsertCourier('jnt', 'J&T', [
      { code: 'REG', name: 'Regular', estimatedDays: '2-3' },
      { code: 'EZ', name: 'EZ', estimatedDays: '2-3' }
    ]);
    
    const sicepat = await shippingRepository.upsertCourier('sicepat', 'SiCepat', [
      { code: 'REG', name: 'Regular', estimatedDays: '2-3' },
      { code: 'BEST', name: 'Besok Sampai Tujuan', estimatedDays: '1' }
    ]);
    
    const anteraja = await shippingRepository.upsertCourier('anteraja', 'AnterAja', [
      { code: 'REG', name: 'Regular', estimatedDays: '2-3' },
      { code: 'ND', name: 'Next Day', estimatedDays: '1' }
    ]);
    
    const pos = await shippingRepository.upsertCourier('pos', 'Pos Indonesia', [
      { code: 'REG', name: 'Regular', estimatedDays: '3-5' },
      { code: 'EXPRESS', name: 'Express', estimatedDays: '1-2' }
    ]);

    // Check if rates already exist
    const count = await shippingRepository.countRates();
    if (count > 0) {
      console.log('[Shipping Service] Shipping rates already seeded.');
      return;
    }

    // Seed Shipping Rates
    const cities = ['Jakarta', 'Surabaya', 'Bandung', 'Semarang', 'Yogyakarta', 'Medan', 'Makassar', 'Denpasar'];
    const couriers = [jne, jnt, sicepat, anteraja, pos];

    for (const origin of cities) {
      for (const dest of cities) {
        if (origin === dest) continue;

        for (const courier of couriers) {
          const services = courier.services as any[];
          for (const service of services) {
            // Generate some reasonable cost
            const baseCost = origin === 'Jakarta' || dest === 'Jakarta' ? 12000 : 18000;
            const multiplier = service.code === 'YES' || service.code === 'BEST' || service.code === 'ND' || service.code === 'EXPRESS' ? 1.8 : 1.0;
            const calculatedCost = Math.round(baseCost * multiplier);

            // Add for 1kg, 2kg, 5kg brackets
            await shippingRepository.createShippingRate({
              courierId: courier.id,
              originCity: origin,
              destinationCity: dest,
              serviceCode: service.code,
              weight: 1000,
              cost: calculatedCost,
              estimatedDays: service.estimatedDays,
            });

            await shippingRepository.createShippingRate({
              courierId: courier.id,
              originCity: origin,
              destinationCity: dest,
              serviceCode: service.code,
              weight: 2000,
              cost: calculatedCost * 2,
              estimatedDays: service.estimatedDays,
            });

            await shippingRepository.createShippingRate({
              courierId: courier.id,
              originCity: origin,
              destinationCity: dest,
              serviceCode: service.code,
              weight: 5000,
              cost: calculatedCost * 4.5,
              estimatedDays: service.estimatedDays,
            });
          }
        }
      }
    }

    console.log('[Shipping Service] Data seeding completed successfully.');
  }

  async trackByTrackingNumber(trackingNumber: string) {
    const order = await shippingRepository.findTrackingByNumber(trackingNumber);

    if (!order) {
      throw new NotFoundError(`No shipment found with tracking number: ${trackingNumber}`);
    }

    return {
      trackingNumber: order.trackingNumber,
      courierName: order.courierName,
      serviceName: order.serviceName,
      status: order.status,
      estimatedDelivery: order.estimatedDelivery,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      history: order.history.map((entry) => ({
        status: entry.toStatus,
        location: entry.location,
        note: entry.note,
        createdAt: entry.createdAt,
      })),
    };
  }

  async getTracking(trackingNumber: string) {
    return this.trackByTrackingNumber(trackingNumber);
  }

  async updateTrackingNumber(
    orderId: string,
    actor: { userId: string; role: string },
    trackingNumber: string
  ) {
    const order = await shippingRepository.findShippingOrderByOrderId(orderId);
    if (!order) {
      throw new NotFoundError('Shipping order not found');
    }

    await this.assertOrderMutationAccess(orderId, actor);

    // Check for uniqueness
    const existing = await prisma.shippingOrder.findUnique({
      where: { trackingNumber },
    });
    if (existing && existing.id !== order.id) {
      throw new ValidationError(`Tracking number "${trackingNumber}" is already assigned to another shipment`);
    }

    const updated = await prisma.shippingOrder.update({
      where: { id: order.id },
      data: { trackingNumber },
      include: {
        courier: true,
        history: { orderBy: { createdAt: 'desc' } },
      },
    });

    return updated;
  }
}

export const shippingService = new ShippingService();
export default shippingService;
