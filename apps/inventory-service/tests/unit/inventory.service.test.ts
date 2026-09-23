jest.mock('../../src/repositories/inventory.repository');
const mockPrisma: any = {
  $transaction: jest.fn((cb) => cb(mockPrisma)),
  inventory: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
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
});
