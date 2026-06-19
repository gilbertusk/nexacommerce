import { prisma } from '../prisma/client';
import { Prisma } from '../generated/client';

export class InventoryRepository {
  async findAndCountAll(params: { page: number; limit: number; productId?: string }) {
    const { page, limit, productId } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.InventoryWhereInput = {};
    if (productId) {
      where.productId = productId;
    }

    const [inventories, total] = await Promise.all([
      prisma.inventory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.inventory.count({ where }),
    ]);

    return { inventories, total };
  }

  async findByProductId(productId: string) {
    return prisma.inventory.findUnique({
      where: { productId },
    });
  }

  async findById(id: string) {
    return prisma.inventory.findUnique({
      where: { id },
    });
  }

  async create(data: { productId: string; sku?: string; currentStock?: number; reservedStock?: number; availableStock?: number; lowStockThreshold?: number; warehouseId?: string }) {
    return prisma.inventory.create({
      data: {
        productId: data.productId,
        sku: data.sku || null,
        currentStock: data.currentStock || 0,
        reservedStock: data.reservedStock || 0,
        availableStock: data.availableStock !== undefined ? data.availableStock : (data.currentStock || 0),
        lowStockThreshold: data.lowStockThreshold !== undefined ? data.lowStockThreshold : 10,
        warehouseId: data.warehouseId || null,
      },
    });
  }

  async update(productId: string, data: { currentStock?: number; reservedStock?: number; availableStock?: number; sku?: string; lowStockThreshold?: number; warehouseId?: string }) {
    return prisma.inventory.update({
      where: { productId },
      data,
    });
  }

  async createMovement(tx: any, data: { inventoryId: string; type: string; quantity: number; referenceType?: string; referenceId?: string; note?: string; createdBy?: string }) {
    const client = tx || prisma;
    return client.stockMovement.create({
      data,
    });
  }

  async findMovements(inventoryId: string) {
    return prisma.stockMovement.findMany({
      where: { inventoryId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findLowStock() {
    return prisma.inventory.findMany({
      where: {
        availableStock: {
          lte: prisma.inventory.fields.lowStockThreshold,
        },
      },
      orderBy: { availableStock: 'asc' },
    });
  }

  // --- Reservation methods ---
  async createReservation(tx: any, data: { inventoryId: string; orderId: string; quantity: number; status: string; expiresAt: Date }) {
    const client = tx || prisma;
    return client.stockReservation.create({
      data,
    });
  }

  async findReservationById(id: string) {
    return prisma.stockReservation.findUnique({
      where: { id },
      include: { inventory: true },
    });
  }

  async findReservationByOrderAndProduct(orderId: string, productId: string) {
    const inv = await this.findByProductId(productId);
    if (!inv) return null;
    return prisma.stockReservation.findFirst({
      where: {
        orderId,
        inventoryId: inv.id,
        status: 'RESERVED',
      },
    });
  }

  async updateReservation(tx: any, id: string, data: { status?: string; confirmedAt?: Date; releasedAt?: Date }) {
    const client = tx || prisma;
    return client.stockReservation.update({
      where: { id },
      data,
    });
  }
}

export const inventoryRepository = new InventoryRepository();
export default inventoryRepository;
