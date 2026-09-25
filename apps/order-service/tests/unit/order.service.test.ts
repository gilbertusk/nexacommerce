jest.mock('../../src/repositories/order.repository');
const mockPrisma: any = {
  $transaction: jest.fn((cb) => cb(mockPrisma)),
  order: {
    update: jest.fn(),
    updateMany: jest.fn(),
    findUniqueOrThrow: jest.fn(),
  },
  orderStatusHistory: {
    create: jest.fn(),
  },
  orderComplaint: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  },
  outboxEvent: {
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
    mockPrisma.order.updateMany.mockResolvedValue({ count: 1 });
    mockPrisma.order.findUniqueOrThrow.mockResolvedValue(mockOrder);
    mockPrisma.outboxEvent.create.mockResolvedValue({});
  });

  describe('checkout', () => {
    it('fails closed before any side effect while trusted shipping quotes are unavailable', async () => {
      await expect(service.checkout('user-1', {
        shippingAddressId: 'address-1',
        courierName: 'Browser-supplied courier',
        courierService: 'Browser-supplied service',
        shippingCost: 0,
      })).rejects.toThrow('trusted shipping quote is implemented');

      expect(global.fetch).not.toHaveBeenCalled();
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });
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
      expect(mockPrisma.outboxEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ eventName: 'OrderCancelled', routingKey: 'order.cancelled' }),
      });
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

  describe('payment event idempotency', () => {
    it.each(['PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'COMPLETED'])(
      'does not regress an order in %s when PaymentSuccess is redelivered',
      async (status) => {
        const existing = { ...mockOrder, status } as any;
        mockOrderRepo.findById.mockResolvedValue(existing);

        const result = await service.handlePaymentSuccess('order-1', new Date().toISOString(), 115000);

        expect(result).toBe(existing);
        expect(mockPrisma.order.update).not.toHaveBeenCalled();
      },
    );

    it('rejects a late payment success for a cancelled order', async () => {
      mockOrderRepo.findById.mockResolvedValue({ ...mockOrder, status: 'CANCELLED' } as any);

      await expect(service.handlePaymentSuccess('order-1', new Date().toISOString(), 115000))
        .rejects.toThrow('cannot transition order from CANCELLED');
      expect(mockPrisma.order.update).not.toHaveBeenCalled();
    });

    it.each(['PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED'])(
      'does not cancel an order in %s from a late failure event',
      async (status) => {
        mockOrderRepo.findById.mockResolvedValue({ ...mockOrder, status } as any);

        await expect(service.handlePaymentFailedOrExpired('order-1', 'FAILED'))
          .rejects.toThrow(`cannot cancel an order in ${status}`);
        expect(mockPrisma.order.update).not.toHaveBeenCalled();
      },
    );

    it('treats a repeated cancellation event as already processed', async () => {
      const existing = { ...mockOrder, status: 'CANCELLED' } as any;
      mockOrderRepo.findById.mockResolvedValue(existing);

      const result = await service.handlePaymentFailedOrExpired('order-1', 'EXPIRED');

      expect(result).toBe(existing);
      expect(mockPrisma.order.update).not.toHaveBeenCalled();
    });

    it('stores OrderPaid in the same transaction as the payment transition', async () => {
      const paidAt = '2026-09-24T04:00:00.000Z';
      mockOrderRepo.findById.mockResolvedValue({ ...mockOrder, status: 'PENDING_PAYMENT' } as any);
      mockPrisma.order.findUniqueOrThrow.mockResolvedValue({ ...mockOrder, status: 'PAID' });

      const result = await service.handlePaymentSuccess('order-1', paidAt, 115000);

      expect(result.status).toBe('PAID');
      expect(mockPrisma.order.updateMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'order-1', status: 'PENDING_PAYMENT' },
      }));
      expect(mockPrisma.outboxEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          aggregateType: 'Order',
          aggregateId: 'order-1',
          eventName: 'OrderPaid',
          routingKey: 'order.paid',
          eventPayload: expect.objectContaining({
            eventName: 'OrderPaid',
            payload: expect.objectContaining({ orderId: 'order-1', amount: 115000, paidAt }),
          }),
        }),
      });
    });

    it('rolls back the event enqueue when another transition wins the status claim', async () => {
      mockOrderRepo.findById.mockResolvedValue({ ...mockOrder, status: 'PENDING_PAYMENT' } as any);
      mockPrisma.order.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.handlePaymentSuccess('order-1', new Date().toISOString(), 115000))
        .rejects.toThrow('already processed');
      expect(mockPrisma.outboxEvent.create).not.toHaveBeenCalled();
    });

    it('stores OrderCancelled with a failed payment transition', async () => {
      mockOrderRepo.findById.mockResolvedValue({ ...mockOrder, status: 'PENDING_PAYMENT' } as any);
      mockPrisma.order.findUniqueOrThrow.mockResolvedValue({ ...mockOrder, status: 'CANCELLED' });

      const result = await service.handlePaymentFailedOrExpired('order-1', 'FAILED');

      expect(result.status).toBe('CANCELLED');
      expect(mockPrisma.outboxEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventName: 'OrderCancelled',
          routingKey: 'order.cancelled',
          eventPayload: expect.objectContaining({
            payload: expect.objectContaining({ reason: 'Payment failed' }),
          }),
        }),
      });
    });
  });

  describe('completion event outbox', () => {
    it('stores OrderCompleted in the status transition transaction', async () => {
      mockOrderRepo.findById.mockResolvedValue({
        ...mockOrder,
        status: 'DELIVERED',
        items: [{ productId: 'product-1', quantity: 2, productPrice: 50000 }],
      } as any);
      mockPrisma.order.findUniqueOrThrow.mockResolvedValue({ ...mockOrder, status: 'COMPLETED' });

      const result = await service.handleOrderCompleted('order-1', 'user-1');

      expect(result.status).toBe('COMPLETED');
      expect(mockPrisma.outboxEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventName: 'OrderCompleted',
          routingKey: 'order.completed',
          eventPayload: expect.objectContaining({
            payload: expect.objectContaining({
              items: [{ productId: 'product-1', quantity: 2, price: 50000 }],
            }),
          }),
        }),
      });
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

  describe('seller order status transitions', () => {
    it('allows only the next seller fulfillment transition', async () => {
      mockOrderRepo.findById.mockResolvedValue({
        ...mockOrder,
        status: 'PROCESSING',
        items: [{ sellerId: 'seller-1' }],
      } as any);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: { trackingNumber: 'NXC-TRACK-1', status: 'PICKED_UP' } }),
      });
      mockPrisma.order.update.mockResolvedValue({ ...mockOrder, status: 'SHIPPED' } as any);

      const updated = await service.updateOrderStatus(
        'order-1',
        { userId: 'seller-1', role: 'SELLER' },
        'SHIPPED',
      );

      expect(updated.status).toBe('SHIPPED');
      expect(mockPrisma.orderStatusHistory.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ fromStatus: 'PROCESSING', toStatus: 'SHIPPED' }),
      }));
    });

    it('rejects skipping from paid directly to shipped', async () => {
      mockOrderRepo.findById.mockResolvedValue({
        ...mockOrder,
        status: 'PAID',
        items: [{ sellerId: 'seller-1' }],
      } as any);

      await expect(service.updateOrderStatus(
        'order-1',
        { userId: 'seller-1', role: 'SELLER' },
        'SHIPPED',
      )).rejects.toThrow('cannot transition from PAID to SHIPPED');
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('requires a registered tracking number before marking shipped', async () => {
      mockOrderRepo.findById.mockResolvedValue({
        ...mockOrder,
        status: 'PROCESSING',
        items: [{ sellerId: 'seller-1' }],
      } as any);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: { trackingNumber: null, status: 'WAITING_PICKUP' } }),
      });

      await expect(service.updateOrderStatus(
        'order-1',
        { userId: 'seller-1', role: 'SELLER' },
        'SHIPPED',
      )).rejects.toThrow('without a registered tracking number');
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('requires courier handoff before marking the order shipped', async () => {
      mockOrderRepo.findById.mockResolvedValue({
        ...mockOrder,
        status: 'PROCESSING',
        items: [{ sellerId: 'seller-1' }],
      } as any);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: { trackingNumber: 'NXC-TRACK-1', status: 'WAITING_PICKUP' } }),
      });

      await expect(service.updateOrderStatus(
        'order-1',
        { userId: 'seller-1', role: 'SELLER' },
        'SHIPPED',
      )).rejects.toThrow('handed to the courier');
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it.each(['DELIVERED', 'COMPLETED'])('does not allow seller to set %s manually', async (status) => {
      mockOrderRepo.findById.mockResolvedValue({
        ...mockOrder,
        status: 'SHIPPED',
        items: [{ sellerId: 'seller-1' }],
      } as any);

      await expect(service.updateOrderStatus(
        'order-1',
        { userId: 'seller-1', role: 'SELLER' },
        status,
      )).rejects.toThrow(`cannot transition from SHIPPED to ${status}`);
    });
  });

  describe('return requests', () => {
    it('approves a return without claiming the payment was refunded', async () => {
      mockOrderRepo.findById
        .mockResolvedValueOnce({
          ...mockOrder,
          status: 'RETURN_REQUESTED',
          statusHistory: [{ toStatus: 'RETURN_REQUESTED', fromStatus: 'DELIVERED' }],
        } as any)
        .mockResolvedValueOnce({ ...mockOrder, status: 'RETURN_APPROVED' } as any);

      await service.updateReturnRequest('order-1', { userId: 'admin-1', role: 'ADMIN' }, 'approve');

      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'RETURN_APPROVED' },
      });
      expect(mockPrisma.order.update).not.toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'REFUNDED' } }),
      );
    });

    it('marks an approved return refunded only after an internal provider confirmation', async () => {
      mockOrderRepo.findById
        .mockResolvedValueOnce({ ...mockOrder, status: 'RETURN_APPROVED' } as any)
        .mockResolvedValueOnce({ ...mockOrder, status: 'REFUNDED' } as any);

      const result = await service.markRefundCompleted('order-1');

      expect(result?.status).toBe('REFUNDED');
      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'REFUNDED' },
      });
      expect(mockPrisma.orderStatusHistory.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ toStatus: 'REFUNDED', changedBy: 'SYSTEM' }),
      }));
    });

    it('records provider-confirmed partial refunds without claiming a full refund', async () => {
      mockOrderRepo.findById
        .mockResolvedValueOnce({ ...mockOrder, status: 'RETURN_APPROVED' } as any)
        .mockResolvedValueOnce({ ...mockOrder, status: 'PARTIALLY_REFUNDED' } as any);

      const result = await service.markRefundPartial('order-1');

      expect(result?.status).toBe('PARTIALLY_REFUNDED');
      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'PARTIALLY_REFUNDED' },
      });
    });

    it('does not mark an order refunded unless its return was approved', async () => {
      mockOrderRepo.findById.mockResolvedValue({ ...mockOrder, status: 'RETURN_REQUESTED' } as any);

      await expect(service.markRefundCompleted('order-1')).rejects.toThrow('requires an approved return');
      expect(mockPrisma.order.update).not.toHaveBeenCalled();
    });

    it('restores the delivered status when a return is rejected', async () => {
      mockOrderRepo.findById
        .mockResolvedValueOnce({
          ...mockOrder,
          status: 'RETURN_REQUESTED',
          statusHistory: [{ toStatus: 'RETURN_REQUESTED', fromStatus: 'DELIVERED' }],
        } as any)
        .mockResolvedValueOnce({ ...mockOrder, status: 'DELIVERED' } as any);

      await service.updateReturnRequest('order-1', { userId: 'admin-1', role: 'ADMIN' }, 'reject');

      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'DELIVERED' },
      });
    });
  });

  describe('order complaints', () => {
    it('creates an order complaint only for its customer after delivery', async () => {
      mockOrderRepo.findById.mockResolvedValue({
        ...mockOrder,
        status: 'DELIVERED',
        customerId: 'user-1',
      } as any);
      mockPrisma.orderComplaint.findUnique.mockResolvedValue(null);
      mockPrisma.orderComplaint.create.mockResolvedValue({ id: 'complaint-1', status: 'OPEN' });

      const result = await service.createComplaint('order-1', 'user-1', {
        category: 'DAMAGED', description: 'Barang rusak saat diterima',
      });

      expect(result).toEqual({ id: 'complaint-1', status: 'OPEN' });
      expect(mockPrisma.orderComplaint.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          orderId: 'order-1',
          customerId: 'user-1',
          category: 'DAMAGED',
          description: 'Barang rusak saat diterima',
        }),
      }));
    });

    it('rejects complaints for orders that have not been delivered', async () => {
      mockOrderRepo.findById.mockResolvedValue({ ...mockOrder, status: 'PAID', customerId: 'user-1' } as any);

      await expect(service.createComplaint('order-1', 'user-1', {
        category: 'OTHER', description: 'Masalah pesanan',
      })).rejects.toThrow('only be opened for a delivered order');
      expect(mockPrisma.orderComplaint.create).not.toHaveBeenCalled();
    });

    it('rejects complaint descriptions below the minimum length', async () => {
      mockOrderRepo.findById.mockResolvedValue({ ...mockOrder, status: 'DELIVERED', customerId: 'user-1' } as any);

      await expect(service.createComplaint('order-1', 'user-1', {
        category: 'OTHER', description: 'no',
      })).rejects.toThrow('5 to 2000 characters');
      expect(mockPrisma.orderComplaint.create).not.toHaveBeenCalled();
    });

    it('rejects a duplicate complaint for the same order/customer', async () => {
      mockOrderRepo.findById.mockResolvedValue({ ...mockOrder, status: 'COMPLETED', customerId: 'user-1' } as any);
      mockPrisma.orderComplaint.findUnique.mockResolvedValue({ id: 'complaint-existing' });

      await expect(service.createComplaint('order-1', 'user-1', {
        category: 'OTHER', description: 'Masalah pesanan',
      })).rejects.toThrow('already been submitted');
    });

    it('maps a concurrent duplicate insert to a conflict instead of a server error', async () => {
      mockOrderRepo.findById.mockResolvedValue({ ...mockOrder, status: 'DELIVERED', customerId: 'user-1' } as any);
      mockPrisma.orderComplaint.findUnique.mockResolvedValue(null);
      mockPrisma.orderComplaint.create.mockRejectedValue({ code: 'P2002' });

      await expect(service.createComplaint('order-1', 'user-1', {
        category: 'OTHER', description: 'Ada masalah pada pesanan',
      })).rejects.toThrow('already been submitted');
    });

    it('only allows valid moderation transitions', async () => {
      mockPrisma.orderComplaint.findUnique.mockResolvedValue({ id: 'complaint-1', status: 'OPEN' });
      mockPrisma.orderComplaint.update.mockResolvedValue({ id: 'complaint-1', status: 'IN_REVIEW' });

      const result = await service.adminUpdateComplaint('complaint-1', { status: 'IN_REVIEW' });
      expect(result.status).toBe('IN_REVIEW');

      mockPrisma.orderComplaint.findUnique.mockResolvedValue({ id: 'complaint-1', status: 'RESOLVED' });
      await expect(service.adminUpdateComplaint('complaint-1', { status: 'IN_REVIEW' }))
        .rejects.toThrow('cannot transition');
    });
  });
});
