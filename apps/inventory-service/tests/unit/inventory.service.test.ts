jest.mock('../../src/repositories/inventory.repository');
const mockPrisma: any = {
  $transaction: jest.fn((cb) => cb(mockPrisma)),
  inventory: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
  stockReservation: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    updateMany: jest.fn(),
  },
  stockMovement: {
    create: jest.fn(),
  },
  outboxEvent: {
    create: jest.fn(),
    findMany: jest.fn(),
    updateMany: jest.fn(),
  },
};
jest.mock('../../src/prisma/client', () => ({
  prisma: mockPrisma,
}));

import { InventoryService } from '../../src/services/inventory.service';
import { inventoryRepository } from '../../src/repositories/inventory.repository';

const mockInventoryRepo = inventoryRepository as jest.Mocked<typeof inventoryRepository>;

const mockInventory = {
  id: 'inv-1', productId: 'prod-1', availableStock: 100,
  reservedStock: 0, soldStock: 0, lowStockThreshold: 10,
  createdAt: new Date(), updatedAt: new Date(),
};

describe('InventoryService', () => {
  let service: InventoryService;

  beforeEach(() => {
    service = new InventoryService();
    jest.clearAllMocks();
    (global.fetch as jest.Mock) = jest.fn();
  });

  describe('initializeInventory', () => {
    it('creates inventory when product exists and inventory is not yet created', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: { id: 'prod-1', sellerId: 'seller-1' } }),
      });
      mockInventoryRepo.findByProductId.mockResolvedValue(null);
      mockPrisma.inventory.create.mockResolvedValue(mockInventory as any);
      mockInventoryRepo.createMovement.mockResolvedValue({} as any);

      const result = await service.initializeInventory({ userId: 'seller-1', role: 'SELLER' }, { productId: 'prod-1', currentStock: 100 });
      expect(result.productId).toBe('prod-1');
      expect(mockPrisma.inventory.create).toHaveBeenCalledTimes(1);
    });

    it('throws ConflictError when inventory already exists', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: { id: 'prod-1', sellerId: 'seller-1' } }),
      });
      mockInventoryRepo.findByProductId.mockResolvedValue(mockInventory as any);

      await expect(service.initializeInventory({ userId: 'seller-1', role: 'SELLER' }, { productId: 'prod-1', currentStock: 100 }))
        .rejects.toThrow('initialized');
    });

    it('throws ForbiddenError when SELLER does not own product', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: { id: 'prod-1', sellerId: 'other-seller' } }),
      });

      await expect(service.initializeInventory({ userId: 'seller-1', role: 'SELLER' }, { productId: 'prod-1', currentStock: 100 }))
        .rejects.toThrow('do not own');
    });
  });

  describe('getInventoryByProductId', () => {
    it('returns inventory when found', async () => {
      mockInventoryRepo.findByProductId.mockResolvedValue(mockInventory as any);

      const result = await service.getInventoryByProductId('prod-1');
      expect(result.productId).toBe('prod-1');
    });

    it('throws NotFoundError when inventory does not exist', async () => {
      mockInventoryRepo.findByProductId.mockResolvedValue(null);

      await expect(service.getInventoryByProductId('bad')).rejects.toThrow('Inventory not found');
    });
  });

  describe('stockIn', () => {
    it('adds stock and records movement', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: { id: 'prod-1', sellerId: 'seller-1' } }),
      });
      mockInventoryRepo.findByProductId.mockResolvedValue(mockInventory as any);
      mockPrisma.inventory.update.mockResolvedValue({ ...mockInventory, availableStock: 150 } as any);
      mockInventoryRepo.createMovement.mockResolvedValue({} as any);

      const result = await service.stockIn({ userId: 'seller-1', role: 'SELLER' }, { productId: 'prod-1', quantity: 50, note: 'Restock' });
      expect(result.availableStock).toBe(150);
    });
  });

  describe('reservation event idempotency', () => {
    const reservation = {
      id: 'reservation-1',
      inventoryId: 'inv-1',
      orderId: 'order-1',
      quantity: 2,
      status: 'RESERVED',
    };

    beforeEach(() => {
      mockInventoryRepo.findByProductId.mockResolvedValue(mockInventory as any);
      mockInventoryRepo.createMovement.mockResolvedValue({} as any);
    });

    it('does not decrement inventory for an already confirmed reservation', async () => {
      const confirmed = { ...reservation, status: 'CONFIRMED' };
      mockPrisma.stockReservation.findFirst.mockResolvedValue(confirmed);

      const result = await service.confirmStock(
        { userId: 'SYSTEM', role: 'ADMIN' },
        { productId: 'prod-1', orderId: 'order-1' },
      );

      expect(result).toBe(confirmed);
      expect(mockPrisma.inventory.update).not.toHaveBeenCalled();
      expect(mockPrisma.stockReservation.updateMany).not.toHaveBeenCalled();
    });

    it('claims a reserved row before changing inventory', async () => {
      const confirmed = { ...reservation, status: 'CONFIRMED' };
      mockPrisma.stockReservation.findFirst.mockResolvedValue(reservation);
      mockPrisma.stockReservation.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.inventory.update.mockResolvedValue(mockInventory);
      mockPrisma.stockReservation.findUniqueOrThrow.mockResolvedValue(confirmed);

      const result = await service.confirmStock(
        { userId: 'SYSTEM', role: 'ADMIN' },
        { productId: 'prod-1', orderId: 'order-1' },
      );

      expect(result).toBe(confirmed);
      expect(mockPrisma.stockReservation.updateMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'reservation-1', status: 'RESERVED' },
      }));
      expect(mockPrisma.inventory.update).toHaveBeenCalledTimes(1);
      expect(mockInventoryRepo.createMovement).toHaveBeenCalledTimes(1);
    });

    it('does not increment inventory for an already released reservation', async () => {
      const released = { ...reservation, status: 'RELEASED' };
      mockPrisma.stockReservation.findFirst.mockResolvedValue(released);

      const result = await service.releaseStock(
        { userId: 'SYSTEM', role: 'ADMIN' },
        { productId: 'prod-1', orderId: 'order-1' },
      );

      expect(result).toBe(released);
      expect(mockPrisma.inventory.update).not.toHaveBeenCalled();
      expect(mockPrisma.stockReservation.updateMany).not.toHaveBeenCalled();
    });

    it('does not apply inventory twice when another worker wins the claim', async () => {
      const released = { ...reservation, status: 'RELEASED' };
      mockPrisma.stockReservation.findFirst.mockResolvedValue(reservation);
      mockPrisma.stockReservation.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.stockReservation.findUnique.mockResolvedValue(released);

      const result = await service.releaseStock(
        { userId: 'SYSTEM', role: 'ADMIN' },
        { productId: 'prod-1', orderId: 'order-1' },
      );

      expect(result).toBe(released);
      expect(mockPrisma.inventory.update).not.toHaveBeenCalled();
      expect(mockInventoryRepo.createMovement).not.toHaveBeenCalled();
    });
  });

  describe('order-level reservation events', () => {
    const reservation = {
      id: 'reservation-1',
      inventoryId: 'inv-1',
      orderId: 'order-1',
      quantity: 2,
      status: 'RESERVED',
      inventory: { ...mockInventory, currentStock: 12, availableStock: 8 },
    };

    beforeEach(() => {
      mockPrisma.stockReservation.findMany.mockResolvedValue([reservation]);
      mockPrisma.stockReservation.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.inventory.update.mockResolvedValue({
        ...mockInventory,
        currentStock: 10,
        availableStock: 8,
        lowStockThreshold: 10,
      });
      mockPrisma.outboxEvent.create.mockResolvedValue({});
      mockInventoryRepo.createMovement.mockResolvedValue({} as any);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: { id: 'prod-1', sellerId: 'seller-1' } }),
      });
    });

    it('commits stock confirmation and low-stock events with the claimed reservation', async () => {
      const result = await service.confirmOrderStock('order-1');

      expect(result.confirmedReservations).toEqual([{
        reservationId: 'reservation-1', productId: 'prod-1', quantity: 2,
      }]);
      const eventNames = mockPrisma.outboxEvent.create.mock.calls.map((call: any[]) => call[0].data.eventName);
      expect(eventNames).toEqual(['StockConfirmed', 'LowStockDetected']);
      expect(mockPrisma.outboxEvent.create).toHaveBeenLastCalledWith({
        data: expect.objectContaining({
          aggregateType: 'Inventory',
          aggregateId: 'prod-1',
          routingKey: 'stock.low_detected',
          eventPayload: expect.objectContaining({
            payload: expect.objectContaining({ sellerId: 'seller-1' }),
          }),
        }),
      });
    });

    it('commits stock release and its event together', async () => {
      const result = await service.releaseOrderStock('order-1');

      expect(result).toEqual([{
        reservationId: 'reservation-1', productId: 'prod-1', quantity: 2,
      }]);
      expect(mockPrisma.outboxEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          aggregateType: 'OrderStock',
          aggregateId: 'order-1',
          eventName: 'StockReleased',
          routingKey: 'stock.released',
        }),
      });
    });

    it('does not emit an event when every reservation loses the conditional claim', async () => {
      mockPrisma.stockReservation.updateMany.mockResolvedValueOnce({ count: 0 });

      const result = await service.releaseOrderStock('order-1');

      expect(result).toEqual([]);
      expect(mockPrisma.inventory.update).not.toHaveBeenCalled();
      expect(mockPrisma.outboxEvent.create).not.toHaveBeenCalled();
    });
  });
});
