import { inventoryRepository } from '../repositories/inventory.repository';
import { prisma } from '../prisma/client';
import { config } from '../config';
import { NotFoundError, ValidationError, ForbiddenError, ConflictError, buildInternalServiceHeaders } from '@nexacommerce/common';
import {
  enqueueLowStockDetected,
  enqueueStockConfirmed,
  enqueueStockReleased,
} from '../messaging/outbox';

export class InventoryService {
  // --- Product Service Internal Calls ---
  private async makeProductRequest(path: string, method: string, body?: any) {
    const url = `${config.productServiceUrl}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      ...buildInternalServiceHeaders('inventory-service'),
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const resBody = await response.json() as any;
      if (!response.ok) {
        throw new NotFoundError(resBody.message || 'Product service call failed');
      }
      return resBody.data;
    } catch (err: any) {
      if (err instanceof NotFoundError) throw err;
      throw new ValidationError(`Product Service communication error: ${err.message}`);
    }
  }

  private async checkProductOwnership(productId: string, actor: { userId: string; role: string }) {
    const product = await this.makeProductRequest(`/internal/products/${productId}`, 'GET');
    if (!product) {
      throw new NotFoundError('Product not found in catalog');
    }
    if (actor.role !== 'ADMIN' && product.sellerId !== actor.userId) {
      throw new ForbiddenError('You do not own this product');
    }
    return product;
  }

  // --- Inventory Operations ---
  async getInventory(actor: { userId: string; role: string }, query: { page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 10;

    if (actor.role === 'ADMIN') {
      const result = await inventoryRepository.findAndCountAll({ page, limit });
      return {
        items: result.inventories,
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      };
    } else {
      // Seller: get their own products
      const productsData = await this.makeProductRequest(`/products?sellerId=${actor.userId}&limit=100`, 'GET');
      const productIds = (productsData.items || []).map((p: any) => p.id);

      if (productIds.length === 0) {
        return {
          items: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        };
      }

      // Fetch inventories for these productIds
      const inventories = await prisma.inventory.findMany({
        where: {
          productId: { in: productIds },
        },
        orderBy: { updatedAt: 'desc' },
      });

      // Simple slice pagination
      const total = inventories.length;
      const skip = (page - 1) * limit;
      const paginated = inventories.slice(skip, skip + limit);

      return {
        items: paginated,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }
  }

  async getStockByProductId(productId: string) {
    const inv = await inventoryRepository.findByProductId(productId);
    if (!inv) {
      return {
        productId,
        currentStock: 0,
        reservedStock: 0,
        availableStock: 0,
      };
    }
    return {
      productId: inv.productId,
      currentStock: inv.currentStock,
      reservedStock: inv.reservedStock,
      availableStock: inv.availableStock,
    };
  }

  async getInventoryByProductId(productId: string) {
    const inv = await inventoryRepository.findByProductId(productId);
    if (!inv) {
      throw new NotFoundError('Inventory not found');
    }
    return inv;
  }

  async batchCheckStock(productIds: string[]) {
    const inventories = await prisma.inventory.findMany({
      where: {
        productId: { in: productIds },
      },
    });

    return productIds.map((productId) => {
      const inv = inventories.find((i) => i.productId === productId);
      return {
        productId,
        currentStock: inv ? inv.currentStock : 0,
        reservedStock: inv ? inv.reservedStock : 0,
        availableStock: inv ? inv.availableStock : 0,
      };
    });
  }

  async initializeInventory(
    actor: { userId: string; role: string },
    data: { productId: string; sku?: string; currentStock: number; lowStockThreshold?: number; warehouseId?: string }
  ) {
    // Check product exists and actor is authorized
    await this.checkProductOwnership(data.productId, actor);

    const existing = await inventoryRepository.findByProductId(data.productId);
    if (existing) {
      throw new ConflictError('Inventory for this product already initialized');
    }

    return prisma.$transaction(async (tx) => {
      const inv = await tx.inventory.create({
        data: {
          productId: data.productId,
          sku: data.sku || null,
          currentStock: data.currentStock,
          reservedStock: 0,
          availableStock: data.currentStock,
          lowStockThreshold: data.lowStockThreshold !== undefined ? data.lowStockThreshold : 10,
          warehouseId: data.warehouseId || null,
        },
      });

      await inventoryRepository.createMovement(tx, {
        inventoryId: inv.id,
        type: 'IN',
        quantity: data.currentStock,
        referenceType: 'MANUAL',
        note: 'Initial stock setup',
        createdBy: actor.userId,
      });

      return inv;
    });
  }

  async stockIn(
    actor: { userId: string; role: string },
    data: { productId: string; quantity: number; note?: string }
  ) {
    if (data.quantity <= 0) {
      throw new ValidationError('Quantity must be greater than 0');
    }

    await this.checkProductOwnership(data.productId, actor);

    const inv = await inventoryRepository.findByProductId(data.productId);
    if (!inv) {
      throw new NotFoundError('Inventory not initialized for this product');
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.inventory.update({
        where: { id: inv.id },
        data: {
          currentStock: { increment: data.quantity },
          availableStock: { increment: data.quantity },
        },
      });

      await inventoryRepository.createMovement(tx, {
        inventoryId: inv.id,
        type: 'IN',
        quantity: data.quantity,
        referenceType: 'MANUAL',
        note: data.note || 'Manual stock-in',
        createdBy: actor.userId,
      });

      return updated;
    });
  }

  async stockOut(
    actor: { userId: string; role: string },
    data: { productId: string; quantity: number; note?: string }
  ) {
    if (data.quantity <= 0) {
      throw new ValidationError('Quantity must be greater than 0');
    }

    await this.checkProductOwnership(data.productId, actor);

    const inv = await inventoryRepository.findByProductId(data.productId);
    if (!inv) {
      throw new NotFoundError('Inventory not initialized for this product');
    }

    if (inv.availableStock < data.quantity) {
      throw new ValidationError(`Insufficient stock. Available: ${inv.availableStock}, Requested: ${data.quantity}`);
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.inventory.update({
        where: { id: inv.id },
        data: {
          currentStock: { decrement: data.quantity },
          availableStock: { decrement: data.quantity },
        },
      });

      await inventoryRepository.createMovement(tx, {
        inventoryId: inv.id,
        type: 'OUT',
        quantity: -data.quantity,
        referenceType: 'MANUAL',
        note: data.note || 'Manual stock-out',
        createdBy: actor.userId,
      });

      return updated;
    });
  }

  // --- Reserve, Confirm, Release FLOW ---
  async reserveStock(
    actor: { userId: string; role: string },
    data: { productId: string; orderId: string; quantity: number; expiresAt?: string }
  ) {
    if (data.quantity <= 0) {
      throw new ValidationError('Quantity must be greater than 0');
    }

    const inv = await inventoryRepository.findByProductId(data.productId);
    if (!inv) {
      throw new NotFoundError('Inventory not initialized for this product');
    }

    if (inv.availableStock < data.quantity) {
      throw new ValidationError(`Insufficient available stock. Available: ${inv.availableStock}, Requested: ${data.quantity}`);
    }

    const expiresAt = data.expiresAt ? new Date(data.expiresAt) : new Date(Date.now() + 30 * 60 * 1000); // Default 30 mins

    return prisma.$transaction(async (tx) => {
      const updated = await tx.inventory.update({
        where: { id: inv.id },
        data: {
          reservedStock: { increment: data.quantity },
          availableStock: { decrement: data.quantity },
        },
      });

      const reservation = await tx.stockReservation.create({
        data: {
          inventoryId: inv.id,
          orderId: data.orderId,
          quantity: data.quantity,
          status: 'RESERVED',
          expiresAt,
        },
      });

      await inventoryRepository.createMovement(tx, {
        inventoryId: inv.id,
        type: 'RESERVE',
        quantity: data.quantity,
        referenceType: 'ORDER',
        referenceId: data.orderId,
        note: `Reservation for Order ${data.orderId}`,
        createdBy: actor.userId,
      });

      return reservation;
    });
  }

  async confirmStock(
    actor: { userId: string; role: string },
    data: { productId: string; orderId: string }
  ) {
    const inv = await inventoryRepository.findByProductId(data.productId);
    if (!inv) {
      throw new NotFoundError('Inventory not initialized for this product');
    }

    const reservation = await prisma.stockReservation.findFirst({
      where: {
        inventoryId: inv.id,
        orderId: data.orderId,
      },
    });

    if (!reservation) {
      throw new NotFoundError(`No reservation found for Product ${data.productId} and Order ${data.orderId}`);
    }
    if (reservation.status === 'CONFIRMED') return reservation;
    if (reservation.status !== 'RESERVED') {
      throw new ConflictError(`Reservation cannot be confirmed from ${reservation.status}`);
    }

    return prisma.$transaction(async (tx) => {
      const claimed = await tx.stockReservation.updateMany({
        where: { id: reservation.id, status: 'RESERVED' },
        data: { status: 'CONFIRMED', confirmedAt: new Date() },
      });
      if (claimed.count === 0) {
        const current = await tx.stockReservation.findUnique({ where: { id: reservation.id } });
        if (current?.status === 'CONFIRMED') return current;
        throw new ConflictError(`Reservation cannot be confirmed from ${current?.status || 'UNKNOWN'}`);
      }

      await tx.inventory.update({
        where: { id: inv.id },
        data: {
          currentStock: { decrement: reservation.quantity },
          reservedStock: { decrement: reservation.quantity },
          // availableStock is already correct because it was decremented during reserve
        },
      });

      await inventoryRepository.createMovement(tx, {
        inventoryId: inv.id,
        type: 'CONFIRM',
        quantity: -reservation.quantity,
        referenceType: 'ORDER',
        referenceId: data.orderId,
        note: `Confirmed sale for Order ${data.orderId}`,
        createdBy: actor.userId,
      });

      return tx.stockReservation.findUniqueOrThrow({ where: { id: reservation.id } });
    });
  }

  async releaseStock(
    actor: { userId: string; role: string },
    data: { productId: string; orderId: string }
  ) {
    const inv = await inventoryRepository.findByProductId(data.productId);
    if (!inv) {
      throw new NotFoundError('Inventory not initialized for this product');
    }

    const reservation = await prisma.stockReservation.findFirst({
      where: {
        inventoryId: inv.id,
        orderId: data.orderId,
      },
    });

    if (!reservation) {
      throw new NotFoundError(`No reservation found for Product ${data.productId} and Order ${data.orderId}`);
    }
    if (reservation.status === 'RELEASED') return reservation;
    if (reservation.status !== 'RESERVED') {
      throw new ConflictError(`Reservation cannot be released from ${reservation.status}`);
    }

    return prisma.$transaction(async (tx) => {
      const claimed = await tx.stockReservation.updateMany({
        where: { id: reservation.id, status: 'RESERVED' },
        data: { status: 'RELEASED', releasedAt: new Date() },
      });
      if (claimed.count === 0) {
        const current = await tx.stockReservation.findUnique({ where: { id: reservation.id } });
        if (current?.status === 'RELEASED') return current;
        throw new ConflictError(`Reservation cannot be released from ${current?.status || 'UNKNOWN'}`);
      }

      await tx.inventory.update({
        where: { id: inv.id },
        data: {
          reservedStock: { decrement: reservation.quantity },
          availableStock: { increment: reservation.quantity },
        },
      });

      await inventoryRepository.createMovement(tx, {
        inventoryId: inv.id,
        type: 'RELEASE',
        quantity: reservation.quantity,
        referenceType: 'ORDER',
        referenceId: data.orderId,
        note: `Released reservation for Order ${data.orderId}`,
        createdBy: actor.userId,
      });

      return tx.stockReservation.findUniqueOrThrow({ where: { id: reservation.id } });
    });
  }

  async getMovements(actor: { userId: string; role: string }, productId: string) {
    const inv = await inventoryRepository.findByProductId(productId);
    if (!inv) {
      throw new NotFoundError('Inventory not initialized for this product');
    }

    // Check authorization (seller can only see their own product's movements)
    await this.checkProductOwnership(productId, actor);

    return inventoryRepository.findMovements(inv.id);
  }

  async getLowStock(actor: { userId: string; role: string }) {
    if (actor.role === 'ADMIN') {
      return inventoryRepository.findLowStock();
    } else {
      // Seller: get their own low stock products
      const productsData = await this.makeProductRequest(`/products?sellerId=${actor.userId}&limit=100`, 'GET');
      const productIds = (productsData.items || []).map((p: any) => p.id);

      if (productIds.length === 0) return [];

      return prisma.inventory.findMany({
        where: {
          productId: { in: productIds },
          availableStock: {
            lte: prisma.inventory.fields.lowStockThreshold,
          },
        },
        orderBy: { availableStock: 'asc' },
      });
    }
  }

  async getProductDetails(productId: string) {
    try {
      return await this.makeProductRequest(`/internal/products/${productId}`, 'GET');
    } catch {
      return null;
    }
  }

  async confirmOrderStock(orderId: string) {
    const reservations = await prisma.stockReservation.findMany({
      where: { orderId, status: 'RESERVED' },
      include: { inventory: true },
    });

    const productOwners = new Map<string, string>();
    await Promise.all(reservations.map(async (reservation) => {
      const product = await this.getProductDetails(reservation.inventory.productId);
      productOwners.set(reservation.inventory.productId, product?.sellerId || 'SYSTEM');
    }));

    return prisma.$transaction(async (tx) => {
      const confirmedReservations = [];
      const lowStockAlerts = [];

      for (const reservation of reservations) {
        const claimed = await tx.stockReservation.updateMany({
          where: { id: reservation.id, status: 'RESERVED' },
          data: { status: 'CONFIRMED', confirmedAt: new Date() },
        });
        if (claimed.count === 0) continue;

        const updatedInventory = await tx.inventory.update({
          where: { id: reservation.inventoryId },
          data: {
            currentStock: { decrement: reservation.quantity },
            reservedStock: { decrement: reservation.quantity },
          },
        });
        await inventoryRepository.createMovement(tx, {
          inventoryId: reservation.inventoryId,
          type: 'CONFIRM',
          quantity: -reservation.quantity,
          referenceType: 'ORDER',
          referenceId: orderId,
          note: `Confirmed sale for Order ${orderId}`,
          createdBy: 'SYSTEM',
        });

        confirmedReservations.push({
          reservationId: reservation.id,
          productId: reservation.inventory.productId,
          quantity: reservation.quantity,
        });
        if (updatedInventory.availableStock <= updatedInventory.lowStockThreshold) {
          lowStockAlerts.push({
            productId: reservation.inventory.productId,
            currentStock: updatedInventory.availableStock,
            threshold: updatedInventory.lowStockThreshold,
          });
        }
      }

      if (confirmedReservations.length > 0) {
        await enqueueStockConfirmed(tx, { orderId, reservations: confirmedReservations });
      }
      for (const alert of lowStockAlerts) {
        await enqueueLowStockDetected(tx, {
          ...alert,
          sellerId: productOwners.get(alert.productId) || 'SYSTEM',
        });
      }

      return { confirmedReservations, lowStockAlerts };
    });
  }

  async releaseOrderStock(orderId: string) {
    const reservations = await prisma.stockReservation.findMany({
      where: { orderId, status: 'RESERVED' },
      include: { inventory: true },
    });

    return prisma.$transaction(async (tx) => {
      const releasedReservations = [];

      for (const reservation of reservations) {
        const claimed = await tx.stockReservation.updateMany({
          where: { id: reservation.id, status: 'RESERVED' },
          data: { status: 'RELEASED', releasedAt: new Date() },
        });
        if (claimed.count === 0) continue;

        await tx.inventory.update({
          where: { id: reservation.inventoryId },
          data: {
            reservedStock: { decrement: reservation.quantity },
            availableStock: { increment: reservation.quantity },
          },
        });
        await inventoryRepository.createMovement(tx, {
          inventoryId: reservation.inventoryId,
          type: 'RELEASE',
          quantity: reservation.quantity,
          referenceType: 'ORDER',
          referenceId: orderId,
          note: `Released reservation for Order ${orderId}`,
          createdBy: 'SYSTEM',
        });
        releasedReservations.push({
          reservationId: reservation.id,
          productId: reservation.inventory.productId,
          quantity: reservation.quantity,
        });
      }

      if (releasedReservations.length > 0) {
        await enqueueStockReleased(tx, { orderId, reservations: releasedReservations });
      }
      return releasedReservations;
    });
  }
}

export const inventoryService = new InventoryService();
export default inventoryService;
