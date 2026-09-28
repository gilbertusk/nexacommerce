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
    const ADDRESS = { id: 'addr-1', userId: 'user-1', city: 'Bandung', province: 'Jawa Barat', postalCode: '40111' };
    const CART = { items: [{ productId: 'prod-1', quantity: 2 }] };
    const PRODUCTS = [
      {
        id: 'prod-1',
        name: 'Widget',
        price: 50000,
        weight: 500,
        status: 'ACTIVE',
        sellerId: 'seller-1',
        categoryId: 'cat-1',
        images: [],
      },
    ];
    const STOCKS = [{ productId: 'prod-1', availableStock: 10 }];

    /**
     * Answer the checkout saga's internal calls by URL. Returns the recorded
     * request bodies so a test can assert what checkout sent where.
     */
    function stubServices(overrides: { quote?: unknown; quoteStatus?: number } = {}) {
      const calls: Array<{ url: string; method: string; body: any }> = [];
      (global.fetch as jest.Mock).mockImplementation(async (url: string, init: any) => {
        const body = init?.body ? JSON.parse(init.body) : undefined;
        calls.push({ url, method: init?.method ?? 'GET', body });

        const ok = (data: unknown) => ({ ok: true, status: 200, json: async () => ({ data }) });

        if (url.includes('/cart/internal/cart/')) return ok(CART);
        if (url.includes('/internal/products/batch')) return ok(PRODUCTS);
        if (url.includes('/batch-check')) return ok(STOCKS);
        if (url.includes('/addresses/')) return ok(ADDRESS);
        if (url.includes('/auth/internal/users/')) return ok({ name: 'Customer', email: 'c@example.com' });
        if (url.includes('/quotes/') && url.includes('/consume')) {
          if (overrides.quoteStatus && overrides.quoteStatus >= 400) {
            return {
              ok: false,
              status: overrides.quoteStatus,
              json: async () => ({ message: 'Shipping quote is no longer valid' }),
            };
          }
          return ok(
            overrides.quote ?? {
              quoteId: 'quote-1',
              totalCost: 18000,
              shipments: [{ sellerId: 'seller-1', courierName: 'JNE', serviceCode: 'REG', cost: 18000 }],
            },
          );
        }
        return ok({});
      });
      return calls;
    }

    const body = {
      shippingAddressId: 'addr-1',
      shippingQuoteId: 'quote-1',
    };

    it('prices shipping from the consumed quote rather than from the request', async () => {
      // Arrange
      const calls = stubServices();
      mockOrderRepo.countCreatedToday.mockResolvedValue(0);
      mockPrisma.order.create = jest.fn().mockResolvedValue({ ...mockOrder, items: [] });

      // Act
      await service.checkout('user-1', body).catch(() => undefined);

      // Assert: the order was written with the quote's cost, not a client value.
      const created = mockPrisma.order.create.mock.calls[0]?.[0]?.data;
      expect(Number(created.shippingCost)).toBe(18000);
      expect(created.shippingQuoteId).toBe('quote-1');
      expect(created.shipmentBreakdown).toEqual([
        expect.objectContaining({ sellerId: 'seller-1', cost: 18000 }),
      ]);
      expect(calls.some((c) => c.url.includes('/quotes/quote-1/consume'))).toBe(true);
    });

    it('sends the quote a cart fingerprint and the order id it is claiming', async () => {
      // Arrange
      const calls = stubServices();
      mockOrderRepo.countCreatedToday.mockResolvedValue(0);
      mockPrisma.order.create = jest.fn().mockResolvedValue({ ...mockOrder, items: [] });

      // Act
      await service.checkout('user-1', body).catch(() => undefined);

      // Assert
      const consume = calls.find((c) => c.url.includes('/consume'));
      expect(consume!.body).toEqual({
        customerId: 'user-1',
        orderId: expect.any(String),
        cartHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      });
      const created = mockPrisma.order.create.mock.calls[0]?.[0]?.data;
      expect(created.id).toBe(consume!.body.orderId);
    });

    it('atomically marks checkout finalized and queues OrderCreated after payment setup', async () => {
      stubServices();
      mockOrderRepo.countCreatedToday.mockResolvedValue(0);
      mockPrisma.order.create = jest.fn().mockResolvedValue({
        ...mockOrder,
        status: 'PENDING_PAYMENT',
        customerId: 'user-1',
        voucherId: null,
        shippingAddressId: 'addr-1',
        items: [{ productId: 'prod-1', quantity: 2, productPrice: 50000 }],
      });

      const result = await service.checkout('user-1', body);

      expect(result.order.id).toBe('order-1');
      expect(mockPrisma.order.updateMany).toHaveBeenCalledWith({
        where: {
          id: 'order-1',
          status: 'PENDING_PAYMENT',
          checkoutFinalizedAt: null,
        },
        data: { checkoutFinalizedAt: expect.any(Date) },
      });
      expect(mockPrisma.orderStatusHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          orderId: 'order-1',
          note: 'Checkout saga finalized; OrderCreated queued',
        }),
      });
      expect(mockPrisma.outboxEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: 'order-created:order-1',
          eventName: 'OrderCreated',
          routingKey: 'order.created',
          eventPayload: expect.objectContaining({
            eventId: 'order-created:order-1',
            payload: expect.objectContaining({
              orderId: 'order-1',
              customerId: 'user-1',
              shippingCost: 18000,
              grandTotal: 118000,
            }),
          }),
        }),
      });
    });

    it('rolls back OrderCreated enqueue when finalization loses its state claim', async () => {
      const calls = stubServices();
      mockOrderRepo.countCreatedToday.mockResolvedValue(0);
      mockPrisma.order.create = jest.fn().mockResolvedValue({
        ...mockOrder,
        status: 'PENDING_PAYMENT',
        customerId: 'user-1',
        voucherId: null,
        shippingAddressId: 'addr-1',
        items: [],
      });
      mockPrisma.order.updateMany.mockResolvedValueOnce({ count: 0 });

      await expect(service.checkout('user-1', body)).rejects.toThrow('finalization was already processed');
      expect(mockPrisma.outboxEvent.create).not.toHaveBeenCalledWith({
        data: expect.objectContaining({ eventName: 'OrderCreated' }),
      });
      expect(calls).not.toContainEqual(expect.objectContaining({
        method: 'DELETE',
        url: expect.stringContaining('/cart/internal/cart/'),
      }));
    });

    it('creates no order when the quote is refused', async () => {
      // Arrange: an expired, replayed, or tampered quote.
      stubServices({ quoteStatus: 400 });
      mockPrisma.order.create = jest.fn();

      // Act + Assert
      await expect(service.checkout('user-1', body)).rejects.toThrow();
      expect(mockPrisma.order.create).not.toHaveBeenCalled();
    });

    it('refuses a quote whose total is not a usable number', async () => {
      // Arrange
      stubServices({ quote: { quoteId: 'quote-1', totalCost: 'free', shipments: [] } });
      mockPrisma.order.create = jest.fn();

      // Act + Assert
      await expect(service.checkout('user-1', body)).rejects.toThrow(/usable shipping cost/);
      expect(mockPrisma.order.create).not.toHaveBeenCalled();
    });

    it('rejects an empty cart before consuming a quote', async () => {
      // Arrange
      const calls: Array<{ url: string }> = [];
      (global.fetch as jest.Mock).mockImplementation(async (url: string) => {
        calls.push({ url });
        if (url.includes('/cart/internal/cart/')) {
          return { ok: true, status: 200, json: async () => ({ data: { items: [] } }) };
        }
        return { ok: true, status: 200, json: async () => ({ data: {} }) };
      });

      // Act + Assert
      await expect(service.checkout('user-1', body)).rejects.toThrow('Cart is empty');
      expect(calls.some((c) => c.url.includes('/consume'))).toBe(false);
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

  describe('multi-seller fulfillment', () => {
    it('allows an owning seller to start processing without exposing another seller items', async () => {
      mockOrderRepo.findById.mockResolvedValue({
        ...mockOrder,
        status: 'PAID',
        items: [{ sellerId: 'seller-1' }, { sellerId: 'seller-2' }],
      } as any);
      mockPrisma.order.update.mockResolvedValue({ ...mockOrder, status: 'PROCESSING' } as any);

      const updated = await service.updateOrderStatus(
        'order-1',
        { userId: 'seller-1', role: 'SELLER' },
        'PROCESSING',
      );

      expect(updated.status).toBe('PROCESSING');
    });

    it('requires every seller shipment to be handed to a courier', async () => {
      mockOrderRepo.findById.mockResolvedValue({
        ...mockOrder,
        status: 'PROCESSING',
        items: [{ sellerId: 'seller-1' }, { sellerId: 'seller-2' }],
      } as any);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: { shipments: [
          { sellerId: 'seller-1', trackingNumber: 'TRACK-1', status: 'PICKED_UP' },
          { sellerId: 'seller-2', trackingNumber: 'TRACK-2', status: 'WAITING_PICKUP' },
        ] } }),
      });

      await expect(service.updateOrderStatus(
        'order-1',
        { userId: 'seller-1', role: 'SELLER' },
        'SHIPPED',
      )).rejects.toThrow('Every seller shipment');
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

  describe('shipping aggregate events', () => {
    it('moves the global order to shipped after Shipping Service confirms all parcels', async () => {
      mockOrderRepo.findById.mockResolvedValue({
        ...mockOrder,
        status: 'PROCESSING',
        items: [{ sellerId: 'seller-1' }, { sellerId: 'seller-2' }],
      } as any);
      mockPrisma.order.findUniqueOrThrow.mockResolvedValue({ ...mockOrder, status: 'SHIPPED' });

      const result = await service.handleOrderShipped('order-1');

      expect(result.status).toBe('SHIPPED');
      expect(mockPrisma.order.updateMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'order-1', status: { in: ['PAID', 'PROCESSING', 'PACKED'] } },
        data: { status: 'SHIPPED' },
      }));
      expect(mockPrisma.orderStatusHistory.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ toStatus: 'SHIPPED', changedBy: 'SYSTEM' }),
      }));
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

    it('records who physically received the return and creates an audit entry', async () => {
      mockOrderRepo.findById
        .mockResolvedValueOnce({ ...mockOrder, status: 'RETURN_APPROVED', returnReceivedAt: null } as any)
        .mockResolvedValueOnce({
          ...mockOrder,
          status: 'RETURN_RECEIVED',
          returnReceivedAt: new Date('2026-09-28T03:00:00Z'),
          returnReceivedBy: 'admin-1',
        } as any);

      const result = await service.confirmReturnReceipt('order-1', 'admin-1', 'Seal intact');

      expect(result?.status).toBe('RETURN_RECEIVED');
      expect(mockPrisma.order.updateMany).toHaveBeenCalledWith({
        where: { id: 'order-1', status: 'RETURN_APPROVED', returnReceivedAt: null },
        data: expect.objectContaining({
          status: 'RETURN_RECEIVED',
          returnReceivedBy: 'admin-1',
          returnReceiptNote: 'Seal intact',
          returnReceivedAt: expect.any(Date),
        }),
      });
      expect(mockPrisma.orderStatusHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          orderId: 'order-1',
          fromStatus: 'RETURN_APPROVED',
          toStatus: 'RETURN_RECEIVED',
          changedBy: 'admin-1',
          note: 'Seal intact',
        }),
      });
    });

    it('does not confirm a physical receipt before the return is approved', async () => {
      mockOrderRepo.findById.mockResolvedValue({ ...mockOrder, status: 'RETURN_REQUESTED', returnReceivedAt: null } as any);

      await expect(service.confirmReturnReceipt('order-1', 'admin-1')).rejects.toThrow(
        'requires RETURN_APPROVED',
      );
      expect(mockPrisma.order.updateMany).not.toHaveBeenCalled();
    });

    it('rolls back the audit entry when a concurrent receipt/status change wins', async () => {
      mockOrderRepo.findById.mockResolvedValue({
        ...mockOrder,
        status: 'RETURN_APPROVED',
        returnReceivedAt: null,
      } as any);
      mockPrisma.order.updateMany.mockResolvedValueOnce({ count: 0 });

      await expect(service.confirmReturnReceipt('order-1', 'admin-1', 'Checked')).rejects.toThrow(
        'already confirmed or the order changed',
      );
      expect(mockPrisma.orderStatusHistory.create).not.toHaveBeenCalled();
    });

    it('marks a received return refunded only after an internal provider confirmation', async () => {
      mockOrderRepo.findById
        .mockResolvedValueOnce({ ...mockOrder, status: 'RETURN_RECEIVED', returnReceivedAt: new Date() } as any)
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
        .mockResolvedValueOnce({ ...mockOrder, status: 'RETURN_RECEIVED', returnReceivedAt: new Date() } as any)
        .mockResolvedValueOnce({ ...mockOrder, status: 'PARTIALLY_REFUNDED' } as any);

      const result = await service.markRefundPartial('order-1');

      expect(result?.status).toBe('PARTIALLY_REFUNDED');
      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'PARTIALLY_REFUNDED' },
      });
    });

    it('does not mark an order refunded until its physical return is received', async () => {
      mockOrderRepo.findById.mockResolvedValue({ ...mockOrder, status: 'RETURN_APPROVED', returnReceivedAt: null } as any);

      await expect(service.markRefundCompleted('order-1')).rejects.toThrow('requires a physically received return');
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
