jest.mock('../../src/repositories/shipping.repository');
const mockPrisma = { $transaction: jest.fn() };
jest.mock('../../src/prisma/client', () => ({ prisma: mockPrisma }));

import { ShippingService } from '../../src/services/shipping.service';
import { shippingRepository } from '../../src/repositories/shipping.repository';

const mockShippingRepo = shippingRepository as jest.Mocked<typeof shippingRepository>;

const mockCourier = {
  id: 'courier-1', name: 'JNE', code: 'jne', logoUrl: null, isActive: true,
  services: [{ code: 'REG', name: 'Reguler' }],
};

const mockRate = {
  id: 'rate-1', courierId: 'courier-1', serviceCode: 'REG',
  originCity: 'jakarta', destinationCity: 'bandung',
  weight: 1000, cost: 15000, estimatedDays: '2-3',
  courier: mockCourier,
};

const mockTracking = {
  id: 'track-1', orderId: 'order-1', sellerId: 'seller-1', trackingNumber: 'JNE123456',
  courierId: 'courier-1', courierName: 'JNE', serviceName: 'Regular', status: 'SHIPPED' as any,
  estimatedDelivery: '2 days', shippedAt: new Date(), deliveredAt: null,
  createdAt: new Date(), updatedAt: new Date(),
  history: [],
};

describe('ShippingService', () => {
  let service: ShippingService;

  beforeEach(() => {
    service = new ShippingService();
    jest.clearAllMocks();
  });

  describe('getCouriers', () => {
    it('returns list of active couriers', async () => {
      mockShippingRepo.findAllCouriers.mockResolvedValue([mockCourier as any]);

      const result = await service.getCouriers();
      expect(result).toHaveLength(1);
      expect(result[0].code).toBe('jne');
    });
  });

  describe('admin-managed courier and rates', () => {
    it('normalizes and records the admin when creating a courier', async () => {
      mockShippingRepo.findCourierByCode.mockResolvedValue(null);
      mockShippingRepo.createCourier.mockResolvedValue({ ...mockCourier, createdBy: 'admin-1' } as any);

      await service.adminCreateCourier('admin-1', {
        code: ' JNE ',
        name: ' JNE Express ',
        services: [{ code: ' reg ', name: ' Regular ', estimatedDays: ' 2-3 hari ' }],
      });

      expect(mockShippingRepo.createCourier).toHaveBeenCalledWith({
        code: 'jne',
        name: 'JNE Express',
        services: [{ code: 'REG', name: 'Regular', estimatedDays: '2-3 hari' }],
        createdBy: 'admin-1',
      });
    });

    it('rejects duplicate courier service codes before writing', async () => {
      await expect(service.adminCreateCourier('admin-1', {
        code: 'jne',
        name: 'JNE',
        services: [
          { code: 'REG', name: 'Regular', estimatedDays: '2-3' },
          { code: 'reg', name: 'Regular duplicate', estimatedDays: '3-4' },
        ],
      })).rejects.toThrow('Duplicate courier service code');
      expect(mockShippingRepo.createCourier).not.toHaveBeenCalled();
    });

    it('creates only a rate matching an active courier service and audits the admin', async () => {
      mockShippingRepo.findCourierById.mockResolvedValue(mockCourier as any);
      mockShippingRepo.createShippingRate.mockResolvedValue({ ...mockRate, cost: 18000 } as any);

      const result = await service.adminCreateRate('admin-1', {
        courierId: 'courier-1',
        originCity: ' Bandung ',
        destinationCity: ' Surabaya ',
        serviceCode: 'reg',
        weight: 1000,
        cost: 18000,
        estimatedDays: '2-3 hari',
      });

      expect(result.cost).toBe(18000);
      expect(mockShippingRepo.createShippingRate).toHaveBeenCalledWith({
        courierId: 'courier-1',
        originCity: 'BANDUNG',
        destinationCity: 'SURABAYA',
        serviceCode: 'REG',
        weight: 1000,
        cost: 18000,
        estimatedDays: '2-3 hari',
        createdBy: 'admin-1',
      });
    });

    it('rejects a service code not configured on the courier', async () => {
      mockShippingRepo.findCourierById.mockResolvedValue(mockCourier as any);

      await expect(service.adminCreateRate('admin-1', {
        courierId: 'courier-1', originCity: 'Bandung', destinationCity: 'Surabaya',
        serviceCode: 'YES', weight: 1000, cost: 25000, estimatedDays: '1 hari',
      })).rejects.toThrow('is not configured for courier');
      expect(mockShippingRepo.createShippingRate).not.toHaveBeenCalled();
    });
  });

  describe('getRates', () => {
    it('returns rates when courierId filter provided', async () => {
      mockShippingRepo.findCourierByCode.mockResolvedValue(mockCourier as any);
      mockShippingRepo.findRates.mockResolvedValue([mockRate as any]);

      const result = await service.getRates({
        originCity: 'jakarta', destinationCity: 'bandung',
        weight: 1000, courierCode: 'jne',
      });
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].cost).toBe(15000);
    });

    it('uses the configured total from the smallest sufficient weight bracket without recalculating it', async () => {
      mockShippingRepo.findRates.mockResolvedValue([
        { ...mockRate, id: 'rate-2kg', weight: 2000, cost: 30000 } as any,
        { ...mockRate, id: 'rate-5kg', weight: 5000, cost: 67500 } as any,
      ]);

      const result = await service.getRates({
        originCity: 'jakarta', destinationCity: 'bandung', weight: 1500,
      });

      expect(result).toEqual([expect.objectContaining({ serviceCode: 'REG', cost: 30000 })]);
    });

    it('rejects a zero or invalid package weight rather than returning a free quote', async () => {
      await expect(service.getRates({ originCity: 'Jakarta', destinationCity: 'Bandung', weight: 0 }))
        .rejects.toThrow('positive integer');
      expect(mockShippingRepo.findRates).not.toHaveBeenCalled();
    });

    it('throws NotFoundError when courier code does not exist', async () => {
      mockShippingRepo.findCourierByCode.mockResolvedValue(null);

      await expect(service.getRates({
        originCity: 'jakarta', destinationCity: 'bandung',
        weight: 1000, courierCode: 'bad-courier',
      })).rejects.toThrow('Courier not found');
    });
  });

  describe('createShippingOrder', () => {
    it('records the immutable paid quote cost and exact origin without re-pricing', async () => {
      mockShippingRepo.findShippingOrderByOrderAndSeller.mockResolvedValue(null);
      mockShippingRepo.findCourierById.mockResolvedValue(mockCourier as any);
      mockShippingRepo.createShippingOrder.mockResolvedValue({ ...mockTracking, cost: 18000 } as any);
      mockShippingRepo.createStatusHistory.mockResolvedValue({} as any);
      mockPrisma.$transaction.mockImplementation(async (callback: any) => callback({}));

      await service.createShippingOrder({
        orderId: 'order-1', sellerId: 'seller-1', courierId: 'courier-1', serviceCode: 'REG', weight: 1000,
        originCity: 'Bandung', originProvince: 'Jawa Barat', trustedQuotedCost: 18000,
        destinationAddress: { city: 'Surabaya' },
      });

      expect(mockShippingRepo.findRates).not.toHaveBeenCalled();
      expect(mockShippingRepo.createShippingOrder).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        cost: 18000,
        originAddress: { city: 'Bandung', province: 'Jawa Barat' },
      }));
    });

    it('does not invent a shipping fee when no configured rate matches', async () => {
      mockShippingRepo.findShippingOrderByOrderAndSeller.mockResolvedValue(null);
      mockShippingRepo.findCourierById.mockResolvedValue(mockCourier as any);
      mockShippingRepo.findCourierByCode.mockResolvedValue(mockCourier as any);
      mockShippingRepo.findRates.mockResolvedValue([]);

      await expect(service.createShippingOrder({
        orderId: 'order-1', sellerId: 'seller-1', courierId: 'courier-1', serviceCode: 'REG', weight: 1000,
        originCity: 'Jakarta', originProvince: 'DKI Jakarta', destinationAddress: { city: 'Bandung' },
      })).rejects.toThrow('No configured shipping rate');
    });

    it('rejects invalid weight and missing route before querying providers', async () => {
      await expect(service.createShippingOrder({
        orderId: 'order-1', sellerId: 'seller-1', courierId: 'courier-1', serviceCode: 'REG', weight: 0,
        originCity: 'Jakarta', originProvince: 'DKI Jakarta', destinationAddress: { city: 'Bandung' },
      })).rejects.toThrow('positive integer');
      expect(mockShippingRepo.findShippingOrderByOrderAndSeller).not.toHaveBeenCalled();
    });
  });

  describe('getTracking', () => {
    it('returns tracking info for valid tracking number', async () => {
      mockShippingRepo.findTrackingByNumber.mockResolvedValue(mockTracking as any);

      const result = await service.getTracking('JNE123456');
      expect(result.trackingNumber).toBe('JNE123456');
    });

    it('throws NotFoundError for unknown tracking number', async () => {
      mockShippingRepo.findTrackingByNumber.mockResolvedValue(null);

      await expect(service.getTracking('BAD')).rejects.toThrow();
    });
  });

  describe('object-level authorization', () => {
    it('rejects a customer who does not own the order', async () => {
      mockShippingRepo.findShippingOrdersByOrderId.mockResolvedValue([mockTracking] as any);
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({ data: { id: 'order-1', customerId: 'owner-1', items: [] } }),
      } as Response);

      await expect(service.getShippingOrder('order-1', { userId: 'other-user', role: 'CUSTOMER' }))
        .rejects.toThrow('not allowed');
    });

    it('selects only the authenticated seller shipment in a multi-seller order', async () => {
      mockShippingRepo.findShippingOrdersByOrderId.mockResolvedValue([
        mockTracking,
        { ...mockTracking, id: 'track-2', sellerId: 'seller-2', trackingNumber: 'OTHER' },
      ] as any);
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            id: 'order-1',
            customerId: 'owner-1',
            items: [{ sellerId: 'seller-1' }, { sellerId: 'seller-2' }],
          },
        }),
      } as Response);

      const result = await service.getShippingOrder(
        'order-1',
        { userId: 'seller-1', role: 'SELLER' },
      );
      expect(result).toEqual(expect.objectContaining({ id: 'track-1', sellerId: 'seller-1' }));
    });
  });

  describe('updateShippingStatus', () => {
    const shippingOrder = {
      ...mockTracking,
      status: 'WAITING_PICKUP',
      trackingNumber: 'JNE123456',
      courierName: 'JNE',
      serviceName: 'Regular',
      estimatedDelivery: '2 days',
      shippedAt: null,
    };
    const tx = {
      outboxEvent: { create: jest.fn() },
      shippingOrder: { count: jest.fn(), findMany: jest.fn() },
    };

    beforeEach(() => {
      tx.outboxEvent.create.mockResolvedValue({});
      mockPrisma.$transaction.mockImplementation(async (callback: (client: typeof tx) => unknown) => callback(tx));
      mockShippingRepo.findShippingOrdersByOrderId.mockResolvedValue([shippingOrder] as any);
      mockShippingRepo.claimShippingOrderStatus.mockResolvedValue({ count: 1 });
      mockShippingRepo.createStatusHistory.mockResolvedValue({} as any);
      mockShippingRepo.lockShippingOrderAggregate.mockResolvedValue(undefined);
      tx.shippingOrder.count.mockResolvedValue(0);
      tx.shippingOrder.findMany.mockResolvedValue([{
        sellerId: 'seller-1', trackingNumber: 'JNE123456', courierName: 'JNE', serviceName: 'Regular',
      }]);
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({ data: { id: 'order-1', customerId: 'customer-1', items: [{ sellerId: 'seller-1' }] } }),
      } as Response);
    });

    it('claims the old status and writes OrderShipped to the same transaction', async () => {
      await service.updateShippingStatus(
        'order-1',
        { userId: 'admin-1', role: 'ADMIN' },
        { status: 'PICKED_UP', location: 'Jakarta' },
      );

      expect(mockShippingRepo.claimShippingOrderStatus).toHaveBeenCalledWith(
        tx,
        'track-1',
        'WAITING_PICKUP',
        expect.objectContaining({ status: 'PICKED_UP', shippedAt: expect.any(Date) }),
      );
      expect(tx.outboxEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          aggregateType: 'ShippingOrder',
          aggregateId: 'order-1',
          eventName: 'OrderShipped',
          routingKey: 'order.shipped',
        }),
      });
    });

    it('does not emit the global shipped event while another seller parcel is waiting', async () => {
      tx.shippingOrder.count.mockResolvedValueOnce(1);

      await service.updateShippingStatus(
        'order-1',
        { userId: 'seller-1', role: 'SELLER' },
        { status: 'PICKED_UP' },
      );

      expect(tx.outboxEvent.create).not.toHaveBeenCalled();
    });

    it('emits delivered only after every seller parcel is delivered', async () => {
      const inTransit = { ...shippingOrder, status: 'IN_TRANSIT' };
      mockShippingRepo.findShippingOrdersByOrderId.mockResolvedValue([inTransit] as any);

      await service.updateShippingStatus(
        'order-1',
        { userId: 'seller-1', role: 'SELLER' },
        { status: 'DELIVERED' },
      );

      expect(tx.outboxEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ eventName: 'OrderDelivered', routingKey: 'order.delivered' }),
      });
    });

    it('rolls back the side effects when another request already changed the status', async () => {
      mockShippingRepo.claimShippingOrderStatus.mockResolvedValueOnce({ count: 0 });

      await expect(service.updateShippingStatus(
        'order-1',
        { userId: 'admin-1', role: 'ADMIN' },
        { status: 'PICKED_UP' },
      )).rejects.toThrow('changed concurrently');

      expect(mockShippingRepo.createStatusHistory).not.toHaveBeenCalled();
      expect(tx.outboxEvent.create).not.toHaveBeenCalled();
    });
  });
});
