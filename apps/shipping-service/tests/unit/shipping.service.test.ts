jest.mock('../../src/repositories/shipping.repository');
jest.mock('../../src/prisma/client', () => ({ prisma: {} }));
jest.mock('../../src/messaging/rabbitmq');

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
  id: 'track-1', orderId: 'order-1', trackingNumber: 'JNE123456',
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

  describe('getRates', () => {
    it('returns rates when courierId filter provided', async () => {
      mockShippingRepo.findCourierByCode.mockResolvedValue(mockCourier as any);
      mockShippingRepo.findRates.mockResolvedValue([mockRate as any]);

      const result = await service.getRates({
        originCity: 'jakarta', destinationCity: 'bandung',
        weight: 1000, courierCode: 'jne',
      });
      expect(result.length).toBeGreaterThan(0);
    });

    it('throws NotFoundError when courier code does not exist', async () => {
      mockShippingRepo.findCourierByCode.mockResolvedValue(null);

      await expect(service.getRates({
        originCity: 'jakarta', destinationCity: 'bandung',
        weight: 1000, courierCode: 'bad-courier',
      })).rejects.toThrow('Courier not found');
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
      mockShippingRepo.findShippingOrderByOrderId.mockResolvedValue(mockTracking as any);
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({ data: { id: 'order-1', customerId: 'owner-1', items: [] } }),
      } as Response);

      await expect(service.getShippingOrder('order-1', { userId: 'other-user', role: 'CUSTOMER' }))
        .rejects.toThrow('not allowed');
    });

    it('rejects a seller mutation when another seller also owns order items', async () => {
      mockShippingRepo.findShippingOrderByOrderId.mockResolvedValue(mockTracking as any);
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

      await expect(service.updateTrackingNumber(
        'order-1',
        { userId: 'seller-1', role: 'SELLER' },
        'NEW-TRACKING',
      )).rejects.toThrow('multi-seller');
    });
  });
});
