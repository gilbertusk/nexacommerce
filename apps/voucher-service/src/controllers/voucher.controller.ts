import { Request, Response } from 'express';
import { voucherService } from '../services/voucher.service';
import { ValidationError } from '@nexacommerce/common';

export class VoucherController {
  async createVoucher(req: Request, res: Response) {
    const userId = (req.headers['x-user-id'] as string) || 'SYSTEM';
    const voucher = await voucherService.createVoucher({
      ...req.body,
      createdBy: userId,
    });
    return res.status(201).json({
      success: true,
      message: 'Voucher created successfully',
      data: voucher,
    });
  }

  async getVoucherById(req: Request, res: Response) {
    const { id } = req.params;
    const voucher = await voucherService.getVoucherById(id);
    return res.status(200).json({
      success: true,
      data: voucher,
    });
  }

  async getVoucherByCode(req: Request, res: Response) {
    const { code } = req.params;
    const voucher = await voucherService.getVoucherByCode(code);
    return res.status(200).json({
      success: true,
      data: voucher,
    });
  }

  async listVouchers(req: Request, res: Response) {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string;

    const result = await voucherService.listVouchers({
      page,
      limit,
      search,
      status,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  }

  async updateVoucher(req: Request, res: Response) {
    const { id } = req.params;
    const voucher = await voucherService.updateVoucher(id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Voucher updated successfully',
      data: voucher,
    });
  }

  async deleteVoucher(req: Request, res: Response) {
    const { id } = req.params;
    await voucherService.deleteVoucher(id);
    return res.status(200).json({
      success: true,
      message: 'Voucher deleted successfully',
    });
  }

  // Customer validate
  async validateVoucher(req: Request, res: Response) {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      throw new ValidationError('Authentication required: user ID missing');
    }

    const { code } = req.body;
    if (!code) {
      throw new ValidationError('Voucher code is required');
    }
    const result = await voucherService.validateCustomerVoucher(code.trim().toUpperCase(), userId);
    return res.status(200).json({
      success: true,
      data: {
        voucher: result.voucher,
        discountAmount: result.discountAmount,
      },
    });
  }

  // Internal endpoints for other services
  async internalValidate(req: Request, res: Response) {
    const { code, userId, items } = req.body;
    if (!code || !userId || !items || !Array.isArray(items)) {
      throw new ValidationError('Missing parameters: code, userId, and items are required');
    }

    const result = await voucherService.validateVoucher(code, userId, items);
    return res.status(200).json({
      success: true,
      data: {
        voucher: result.voucher,
        discountAmount: result.discountAmount,
      },
    });
  }

  async internalApply(req: Request, res: Response) {
    const { code, userId, orderId, items } = req.body;
    if (!code || !userId || !orderId || !items || !Array.isArray(items)) {
      throw new ValidationError('Missing parameters: code, userId, orderId, and items are required');
    }

    const result = await voucherService.applyVoucher(code, userId, orderId, items);
    return res.status(200).json({
      success: true,
      data: result,
    });
  }

  async internalRelease(req: Request, res: Response) {
    const { orderId } = req.body;
    if (!orderId) {
      throw new ValidationError('Missing parameter: orderId is required');
    }

    const result = await voucherService.releaseVoucher(orderId);
    return res.status(200).json({
      success: true,
      data: result,
    });
  }

  async createSellerVoucher(req: Request, res: Response) {
    const sellerId = req.headers['x-user-id'] as string;
    if (!sellerId) throw new ValidationError('Authentication required: user ID missing');

    const voucher = await voucherService.createSellerVoucher(sellerId, req.body);
    return res.status(201).json({
      success: true,
      message: 'Seller voucher created successfully',
      data: voucher,
    });
  }

  async listSellerVouchers(req: Request, res: Response) {
    const sellerId = req.headers['x-user-id'] as string;
    if (!sellerId) throw new ValidationError('Authentication required: user ID missing');

    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const status = req.query.status as string | undefined;

    const result = await voucherService.listSellerVouchers(sellerId, { page, limit, status });
    return res.status(200).json({
      success: true,
      data: result,
    });
  }

  async toggleVoucher(req: Request, res: Response) {
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;
    if (!userId || !userRole) throw new ValidationError('Authentication required');

    const { id } = req.params;
    const voucher = await voucherService.toggleVoucher(id, { userId, role: userRole });
    return res.status(200).json({
      success: true,
      message: 'Voucher status toggled successfully',
      data: voucher,
    });
  }

  async getUsageHistory(req: Request, res: Response) {
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;
    if (!userId || !userRole) throw new ValidationError('Authentication required');

    const { id } = req.params;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const result = await voucherService.getUsageHistory(id, { userId, role: userRole }, { page, limit });
    return res.status(200).json({
      success: true,
      data: result,
    });
  }
}

export const voucherController = new VoucherController();
