jest.mock('../../src/repositories/order.repository');
const mockPrisma: any = {
  $transaction: jest.fn((cb) => cb(mockPrisma)),
  order: {
    update: jest.fn(),
  },
  orderStatusHistory: {
    create: jest.fn(),
  },
};
jest.mock('../../src/prisma/client', () => ({ prisma: mockPrisma }));
jest.mock('../../src/messaging/rabbitmq');

import { OrderService } from '../../src/services/order.service';
import { orderRepository } from '../../src/repositories/order.repository';

const mockOrderRepo = orderRepository as jest.Mocked<typeof orderRepository>;

const mockOrder = {
  id: 'order-1', orderNumber: 'ORD-001', customerId: 'user-1',
  status: 'PENDING' as any, subtotal: 100000, shippingCost: 15000,
  discount: 0, grandTotal: 115000, shippingAddressId: 'addr-1',
  createdAt: new Date(), updatedAt: new Date(), items: [],
};

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(() => {
    service = new OrderService();
    jest.clearAllMocks();
    (global.fetch as jest.Mock) = jest.fn();
    mockPrisma.order.update.mockResolvedValue(mockOrder);
  });

  describe('listOrders', () => {
    it('returns orders for a CUSTOMER filtered by their id', async () => {
      mockOrderRepo.findAndCountAll.mockResolvedValue({ items: [mockOrder as any], total: 1 } as any);

      const result = await service.listOrders({ userId: 'user-1', role: 'CUSTOMER' }, { page: 1, limit: 10 });
      expect(result.orders).toHaveLength(1);
      expect(mockOrderRepo.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ customerId: 'user-1' })
      );
    });

    it('returns all orders for ADMIN without customerId filter', async () => {
      mockOrderRepo.findAndCountAll.mockResolvedValue({ items: [mockOrder as any], total: 1 } as any);

      const result = await service.listOrders({ userId: 'admin-1', role: 'ADMIN' }, { page: 1, limit: 10 });
      expect(result.orders).toHaveLength(1);
      expect(mockOrderRepo.findAndCountAll).toHaveBeenCalledWith(
        expect.not.objectContaining({ customerId: expect.anything() })
      );
    });
  });

  describe('getOrderById', () => {
    it('returns order when CUSTOMER owns the order', async () => {
      mockOrderRepo.findById.mockResolvedValue(mockOrder as any);

      const result = await service.getOrderById('order-1', { userId: 'user-1', role: 'CUSTOMER' });
      expect(result.id).toBe('order-1');
    });

    it('throws ForbiddenError when CUSTOMER does not own the order', async () => {
      mockOrderRepo.findById.mockResolvedValue(mockOrder as any);

      await expect(service.getOrderById('order-1', { userId: 'other', role: 'CUSTOMER' }))
        .rejects.toThrow();
    });

    it('throws NotFoundError when order does not exist', async () => {
      mockOrderRepo.findById.mockResolvedValue(null);

      await expect(service.getOrderById('bad', { userId: 'u', role: 'ADMIN' }))
        .rejects.toThrow('Order not found');
    });
  });

  describe('cancelOrder', () => {
    it('cancels a PENDING order owned by the customer', async () => {
      mockOrderRepo.findById
        .mockResolvedValueOnce({ ...mockOrder, status: 'PENDING_PAYMENT' as any } as any)
        .mockResolvedValueOnce({ ...mockOrder, status: 'CANCELLED' as any } as any);
      mockOrderRepo.update.mockResolvedValue({ ...mockOrder, status: 'CANCELLED' as any } as any);

      const result = await service.cancelOrder('order-1', { userId: 'user-1', role: 'CUSTOMER' });
      expect(result.status).toBe('CANCELLED');
    });

    it('throws ValidationError when order is already COMPLETED', async () => {
      mockOrderRepo.findById.mockResolvedValue({ ...mockOrder, status: 'COMPLETED' as any } as any);

      await expect(service.cancelOrder('order-1', { userId: 'user-1', role: 'CUSTOMER' }))
        .rejects.toThrow();
    });

    it('does not allow a seller to cancel an entire order', async () => {
      await expect(service.cancelOrder('order-1', { userId: 'seller-1', role: 'SELLER' }))
        .rejects.toThrow('cannot cancel');
      expect(mockOrderRepo.findById).not.toHaveBeenCalled();
    });
  });

  describe('multi-seller mutation authorization', () => {
    it('rejects a seller status update that would affect another seller', async () => {
      mockOrderRepo.findById.mockResolvedValue({
        ...mockOrder,
        items: [{ sellerId: 'seller-1' }, { sellerId: 'seller-2' }],
      } as any);

      await expect(service.updateOrderStatus(
        'order-1',
        { userId: 'seller-1', role: 'SELLER' },
        'PROCESSING',
      )).rejects.toThrow('multi-seller');
    });
  });
});
