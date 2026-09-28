import { shippingRepository } from '../repositories/shipping.repository';
import { prisma } from '../prisma/client';
import { AppError, ConflictError, NotFoundError, ValidationError, ForbiddenError, buildInternalServiceHeaders } from '@nexacommerce/common';
import { enqueueOrderDelivered, enqueueOrderShipped } from '../messaging/outbox';
import { config } from '../config';
import crypto from 'crypto';

type CourierServiceInput = { code: string; name: string; estimatedDays: string };
type ManagedRateInput = {
  courierId: string;
  originCity: string;
  destinationCity: string;
  serviceCode: string;
  weight: number;
  cost: number;
  estimatedDays: string;
};

function boundedText(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== 'string') throw new ValidationError(`${field} must be a string`);
  const normalized = value.trim().replace(/\s+/g, ' ');
  if (!normalized || normalized.length > maxLength) {
    throw new ValidationError(`${field} must contain 1-${maxLength} characters`);
  }
  return normalized;
}

function normalizeRateInput(input: ManagedRateInput): ManagedRateInput {
  const courierId = boundedText(input.courierId, 'courierId', 100);
  const originCity = boundedText(input.originCity, 'originCity', 100).toLocaleUpperCase('id-ID');
  const destinationCity = boundedText(input.destinationCity, 'destinationCity', 100).toLocaleUpperCase('id-ID');
  const serviceCode = boundedText(input.serviceCode, 'serviceCode', 30).toUpperCase();
  const estimatedDays = boundedText(input.estimatedDays, 'estimatedDays', 50);
  if (!Number.isSafeInteger(input.weight) || input.weight <= 0) {
    throw new ValidationError('weight must be a positive integer in grams');
  }
  if (!Number.isSafeInteger(input.cost) || input.cost <= 0) {
    throw new ValidationError('cost must be a positive integer amount in IDR');
  }
  return { courierId, originCity, destinationCity, serviceCode, weight: input.weight, cost: input.cost, estimatedDays };
}

function isUniqueConflict(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && 'code' in error && error.code === 'P2002');
}

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

  private async assertOrderMutationAccess(
    orderId: string,
    actor: { userId: string; role: string },
    sellerId?: string | null,
  ): Promise<any> {
    const order = await this.assertOrderAccess(orderId, actor);
    if (actor.role === 'SELLER' && sellerId && sellerId !== actor.userId) {
      throw new ForbiddenError('Seller cannot mutate another seller shipment');
    }
    return order;
  }

  private async selectShipmentForMutation(
    orderId: string,
    actor: { userId: string; role: string },
    requestedSellerId?: string,
  ) {
    const shipments = await shippingRepository.findShippingOrdersByOrderId(orderId);
    if (shipments.length === 0) throw new NotFoundError('Shipping order not found');

    const sellerId = actor.role === 'SELLER' ? actor.userId : requestedSellerId;
    if (sellerId) {
      const shipment = shipments.find((candidate) => candidate.sellerId === sellerId);
      if (!shipment) throw new NotFoundError('Seller shipment not found');
      return shipment;
    }
    if (shipments.length > 1) {
      throw new ValidationError('sellerId is required when mutating a split shipment');
    }
    return shipments[0];
  }

  async getCouriers() {
    return shippingRepository.findAllCouriers(true);
  }

  async adminListCouriers() {
    return shippingRepository.findAllCouriers(false);
  }

  async adminCreateCourier(adminId: string, input: { code: string; name: string; services: CourierServiceInput[] }) {
    const code = boundedText(input.code, 'code', 30).toLowerCase();
    if (!/^[a-z0-9][a-z0-9_-]*$/.test(code)) {
      throw new ValidationError('code may contain only lowercase letters, numbers, underscore, and hyphen');
    }
    const name = boundedText(input.name, 'name', 100);
    if (!Array.isArray(input.services) || input.services.length < 1 || input.services.length > 20) {
      throw new ValidationError('services must contain 1-20 entries');
    }
    const seen = new Set<string>();
    const services = input.services.map((service, index) => {
      const serviceCode = boundedText(service?.code, `services[${index}].code`, 30).toUpperCase();
      if (!/^[A-Z0-9][A-Z0-9_-]*$/.test(serviceCode)) {
        throw new ValidationError(`services[${index}].code has an invalid format`);
      }
      if (seen.has(serviceCode)) throw new ValidationError(`Duplicate courier service code: ${serviceCode}`);
      seen.add(serviceCode);
      return {
        code: serviceCode,
        name: boundedText(service?.name, `services[${index}].name`, 100),
        estimatedDays: boundedText(service?.estimatedDays, `services[${index}].estimatedDays`, 50),
      };
    });

    if (await shippingRepository.findCourierByCode(code)) {
      throw new ConflictError(`Courier code ${code} already exists`);
    }
    try {
      return await shippingRepository.createCourier({ code, name, services, createdBy: adminId });
    } catch (error) {
      if (isUniqueConflict(error)) throw new ConflictError(`Courier code ${code} already exists`);
      throw error;
    }
  }

  async adminListRates(params: {
    page: number;
    limit: number;
    courierId?: string;
    originCity?: string;
    destinationCity?: string;
  }) {
    const [rates, total] = await shippingRepository.findAndCountRates({
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      courierId: params.courierId,
      originCity: params.originCity?.trim() || undefined,
      destinationCity: params.destinationCity?.trim() || undefined,
    });
    return {
      rates: rates.map((rate) => ({ ...rate, cost: Number(rate.cost) })),
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    };
  }

  async adminCreateRate(adminId: string, input: ManagedRateInput) {
    const data = normalizeRateInput(input);
    await this.assertRateCourierService(data.courierId, data.serviceCode);
    try {
      const rate = await shippingRepository.createShippingRate({ ...data, createdBy: adminId });
      return { ...rate, cost: Number(rate.cost) };
    } catch (error) {
      if (isUniqueConflict(error)) throw new ConflictError('This route, service, and weight bracket already exists');
      throw error;
    }
  }

  async adminUpdateRate(rateId: string, adminId: string, input: ManagedRateInput) {
    if (!await shippingRepository.findShippingRateById(rateId)) throw new NotFoundError('Shipping rate not found');
    const data = normalizeRateInput(input);
    await this.assertRateCourierService(data.courierId, data.serviceCode);
    try {
      const rate = await shippingRepository.updateShippingRate(rateId, { ...data, updatedBy: adminId });
      return { ...rate, cost: Number(rate.cost) };
    } catch (error) {
      if (isUniqueConflict(error)) throw new ConflictError('This route, service, and weight bracket already exists');
      throw error;
    }
  }

  async adminDeleteRate(rateId: string) {
    if (!await shippingRepository.findShippingRateById(rateId)) throw new NotFoundError('Shipping rate not found');
    await shippingRepository.deleteShippingRate(rateId);
  }

  private async assertRateCourierService(courierId: string, serviceCode: string) {
    const courier = await shippingRepository.findCourierById(courierId);
    if (!courier) throw new NotFoundError('Courier not found');
    if (!courier.isActive) throw new ValidationError('Courier is inactive');
    const services = Array.isArray(courier.services) ? courier.services as any[] : [];
    if (!services.some((service) => service?.code === serviceCode)) {
      throw new ValidationError(`Service ${serviceCode} is not configured for courier ${courier.code}`);
    }
  }

  async getRates(params: {
    originCity: string;
    destinationCity: string;
    weight: number;
    courierCode?: string;
  }) {
    if (!params.originCity?.trim() || !params.destinationCity?.trim()) {
      throw new ValidationError('Origin and destination cities are required');
    }
    if (!Number.isSafeInteger(params.weight) || params.weight <= 0) {
      throw new ValidationError('Shipping weight must be a positive integer in grams');
    }

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
        // ShippingRate.cost is the configured total for this matching weight bracket.
        // The repository returns the smallest sufficient bracket first; recomputing
        // the amount here would make persisted courier rates ambiguous.
        const serviceInfo = (rate.courier.services as any[]).find((s: any) => s.code === rate.serviceCode);

        grouped.set(key, {
          courierName: rate.courier.name,
          serviceCode: rate.serviceCode,
          serviceName: serviceInfo ? serviceInfo.name : rate.serviceCode,
          cost: Number(rate.cost),
          estimatedDays: rate.estimatedDays,
        });
      }
    }

    return Array.from(grouped.values());
  }

  async createShippingOrder(data: {
    orderId: string;
    sellerId: string;
    courierId: string;
    serviceCode: string;
    weight: number;
    originCity: string;
    originProvince: string;
    trustedQuotedCost?: number;
    destinationAddress: any;
    notes?: string;
  }) {
    if (!Number.isSafeInteger(data.weight) || data.weight <= 0) {
      throw new ValidationError('Shipping weight must be a positive integer in grams');
    }
    if (!data.sellerId?.trim()) throw new ValidationError('sellerId is required for shipment creation');
    if (!data.originCity?.trim() || !data.originProvince?.trim() || !data.destinationAddress?.city?.trim()) {
      throw new ValidationError('Verified origin city, origin province, and destination city are required');
    }
    if (data.trustedQuotedCost !== undefined
      && (!Number.isSafeInteger(data.trustedQuotedCost) || data.trustedQuotedCost <= 0)) {
      throw new ValidationError('Trusted quoted cost must be a positive integer amount in IDR');
    }

    const existing = await shippingRepository.findShippingOrderByOrderAndSeller(data.orderId, data.sellerId);
    if (existing) {
      return existing; // idempotent
    }

    const courier = await shippingRepository.findCourierById(data.courierId);
    if (!courier) {
      throw new NotFoundError('Courier not found');
    }
    if (!courier.isActive) throw new ValidationError('Courier is inactive');

    const serviceInfo = (courier.services as any[]).find((s: any) => s.code === data.serviceCode);
    if (!serviceInfo) {
      throw new ValidationError('Invalid service code for courier');
    }

    // A paid order carries the immutable quote amount that checkout consumed.
    // Internal event processing supplies it so later rate-table edits cannot
    // mutate the value recorded on the shipping label. Manual/internal creation
    // without that snapshot still resolves the current authoritative table.
    let cost = data.trustedQuotedCost;
    if (cost === undefined) {
      const rates = await this.getRates({
        originCity: data.originCity,
        destinationCity: data.destinationAddress.city,
        weight: data.weight,
        courierCode: courier.code,
      });

      const selectedRate = rates.find((r) => r.serviceCode === data.serviceCode);
      if (!selectedRate) {
        throw new ValidationError('No configured shipping rate is available for this route, service, and weight');
      }
      cost = selectedRate.cost;
    }
    if (cost === undefined) throw new ValidationError('Unable to resolve shipping cost');
    const finalCost = cost;

    // Generate tracking number: format NXC-SHP-{YYYYMMDD}-{random 6 chars uppercase}
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const trackingNumber = `NXC-SHP-${todayStr}-${randomHex}`;

    const originAddress = { city: data.originCity, province: data.originProvince };

    return prisma.$transaction(async (tx) => {
      const order = await shippingRepository.createShippingOrder(tx, {
        orderId: data.orderId,
        sellerId: data.sellerId,
        courierId: data.courierId,
        courierName: courier.name,
        serviceCode: data.serviceCode,
        serviceName: serviceInfo.name,
        trackingNumber,
        originAddress,
        destinationAddress: data.destinationAddress,
        weight: data.weight,
        cost: finalCost,
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

  async getShippingOrder(
    orderId: string,
    actor?: { userId: string; role: string },
    requestedSellerId?: string,
  ) {
    const shipments = await shippingRepository.findShippingOrdersByOrderId(orderId);
    if (shipments.length === 0) {
      throw new NotFoundError('Shipping order not found');
    }

    if (actor) await this.assertOrderAccess(orderId, actor);

    if (actor?.role === 'SELLER') {
      const own = shipments.find((shipment) => shipment.sellerId === actor.userId)
        ?? (shipments.length === 1 && shipments[0].sellerId === null ? shipments[0] : undefined);
      if (!own) throw new NotFoundError('Seller shipment not found');
      return own;
    }

    if (requestedSellerId) {
      const selected = shipments.find((shipment) => shipment.sellerId === requestedSellerId);
      if (!selected) throw new NotFoundError('Seller shipment not found');
      return selected;
    }

    if (shipments.length === 1) return shipments[0];
    const handedStatuses = new Set(['PICKED_UP', 'IN_TRANSIT', 'DELIVERED']);
    return {
      orderId,
      shipments,
      allPickedUp: shipments.every((shipment) => handedStatuses.has(shipment.status)),
      allDelivered: shipments.every((shipment) => shipment.status === 'DELIVERED'),
    };
  }

  async updateShippingStatus(
    orderId: string,
    actor: { userId: string; role: string },
    data: { status: string; location?: string; note?: string; sellerId?: string }
  ) {
    const order = await this.selectShipmentForMutation(orderId, actor, data.sellerId);

    const authoritativeOrder = await this.assertOrderMutationAccess(orderId, actor, order.sellerId);

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

    await prisma.$transaction(async (tx) => {
      const claim = await shippingRepository.claimShippingOrderStatus(tx, order.id, currentStatus, {
        status: nextStatus,
        shippedAt,
        deliveredAt,
      });
      if (claim.count !== 1) {
        throw new ValidationError('Shipping status changed concurrently; reload and retry');
      }

      await shippingRepository.createStatusHistory(tx, {
        shippingOrderId: order.id,
        fromStatus: currentStatus,
        toStatus: nextStatus,
        location: data.location,
        note: data.note,
        updatedBy: actor.userId,
      });

      if (nextStatus === 'PICKED_UP') {
        await shippingRepository.lockShippingOrderAggregate(tx, orderId);
        const remaining = await tx.shippingOrder.count({
          where: { orderId, status: { notIn: ['PICKED_UP', 'IN_TRANSIT', 'DELIVERED'] } },
        });
        if (remaining !== 0) return;
        const shipmentSummary = await tx.shippingOrder.findMany({
          where: { orderId },
          select: { sellerId: true, trackingNumber: true, courierName: true, serviceName: true },
          orderBy: { sellerId: 'asc' },
        });
        await enqueueOrderShipped(tx, {
          orderId: order.orderId,
          customerId: authoritativeOrder.customerId,
          trackingNumber: order.trackingNumber || '',
          courierName: order.courierName,
          serviceName: order.serviceName,
          estimatedDelivery: order.estimatedDelivery || undefined,
          shipments: shipmentSummary.map((shipment) => ({
            sellerId: shipment.sellerId ?? 'legacy',
            trackingNumber: shipment.trackingNumber || '',
            courierName: shipment.courierName,
            serviceName: shipment.serviceName,
          })),
        });
      } else if (nextStatus === 'DELIVERED') {
        await shippingRepository.lockShippingOrderAggregate(tx, orderId);
        const remaining = await tx.shippingOrder.count({
          where: { orderId, status: { not: 'DELIVERED' } },
        });
        if (remaining !== 0) return;
        await enqueueOrderDelivered(tx, {
          orderId: order.orderId,
          customerId: authoritativeOrder.customerId,
          deliveredAt: deliveredAt!.toISOString(),
        });
      }
    });

    return this.getShippingOrder(orderId, actor, order.sellerId ?? undefined);
  }

  async getSellerShippingOrders(sellerId: string, page = 1, limit = 10, status?: string) {
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
      sellerId,
      status,
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
    if (process.env.NODE_ENV === 'production' || process.env.ALLOW_DEMO_SHIPPING_RATES !== 'true') {
      throw new ValidationError('Synthetic shipping data is disabled; configure verified courier and rate data explicitly');
    }
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
    trackingNumber: string,
    sellerId?: string,
  ) {
    const order = await this.selectShipmentForMutation(orderId, actor, sellerId);

    await this.assertOrderMutationAccess(orderId, actor, order.sellerId);

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
