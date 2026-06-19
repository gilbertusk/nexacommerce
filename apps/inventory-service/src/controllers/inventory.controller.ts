import { Request, Response } from 'express';
import { inventoryService } from '../services/inventory.service';
import { successResponse } from '@nexacommerce/common';
import {
  stockInSchema,
  stockOutSchema,
  reserveStockSchema,
  initializeInventorySchema,
} from '@nexacommerce/validation';

export class InventoryController {
  getInventory = async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;
    const actor = { userId, role: userRole };

    const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

    const result = await inventoryService.getInventory(actor, { page, limit });
    res.status(200).json(successResponse(result, 'Inventory levels retrieved successfully'));
  };

  getStockByProductId = async (req: Request, res: Response) => {
    const { productId } = req.params;
    const result = await inventoryService.getStockByProductId(productId);
    res.status(200).json(successResponse(result, 'Product stock levels retrieved successfully'));
  };

  initializeInventory = async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;
    const actor = { userId, role: userRole };

    const validatedData = initializeInventorySchema.parse(req.body);
    const result = await inventoryService.initializeInventory(actor, {
      productId: validatedData.productId,
      sku: validatedData.sku,
      currentStock: validatedData.initialStock || 0,
      lowStockThreshold: validatedData.lowStockThreshold,
    });
    res.status(201).json(successResponse(result, 'Inventory initialized successfully'));
  };

  stockIn = async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;
    const actor = { userId, role: userRole };

    const validatedData = stockInSchema.parse(req.body);
    const result = await inventoryService.stockIn(actor, validatedData);
    res.status(200).json(successResponse(result, 'Stock added successfully'));
  };

  stockOut = async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;
    const actor = { userId, role: userRole };

    const validatedData = stockOutSchema.parse(req.body);
    const result = await inventoryService.stockOut(actor, validatedData);
    res.status(200).json(successResponse(result, 'Stock removed successfully'));
  };

  reserveStock = async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;
    const actor = { userId, role: userRole };

    const validatedData = reserveStockSchema.parse(req.body);
    const result = await inventoryService.reserveStock(actor, {
      productId: validatedData.productId,
      orderId: validatedData.orderId,
      quantity: validatedData.quantity,
      expiresAt: validatedData.expiresAt.toISOString(),
    });
    res.status(201).json(successResponse(result, 'Stock reserved successfully'));
  };

  confirmStock = async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;
    const actor = { userId, role: userRole };

    const { productId, orderId } = req.body;
    if (!productId || !orderId) {
      res.status(400).json({ success: false, message: 'productId and orderId are required' });
      return;
    }

    const result = await inventoryService.confirmStock(actor, { productId, orderId });
    res.status(200).json(successResponse(result, 'Stock reservation confirmed successfully'));
  };

  releaseStock = async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;
    const actor = { userId, role: userRole };

    const { productId, orderId } = req.body;
    if (!productId || !orderId) {
      res.status(400).json({ success: false, message: 'productId and orderId are required' });
      return;
    }

    const result = await inventoryService.releaseStock(actor, { productId, orderId });
    res.status(200).json(successResponse(result, 'Stock reservation released successfully'));
  };

  getMovements = async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;
    const actor = { userId, role: userRole };

    const { productId } = req.params;
    const result = await inventoryService.getMovements(actor, productId);
    res.status(200).json(successResponse(result, 'Stock movements retrieved successfully'));
  };

  getLowStock = async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;
    const actor = { userId, role: userRole };

    const result = await inventoryService.getLowStock(actor);
    res.status(200).json(successResponse(result, 'Low stock levels retrieved successfully'));
  };
}

export const inventoryController = new InventoryController();
export default inventoryController;
