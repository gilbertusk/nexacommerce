import { voucherRepository } from '../repositories/voucher.repository';
import { prisma } from '../prisma/client';
import { NotFoundError, ValidationError } from '@nexacommerce/common';
import { Prisma } from '../generated/client';

export interface ValidateVoucherItem {
  price: number;
  quantity: number;
  categoryId: string;
  sellerId: string;
}

export class VoucherService {
  async createVoucher(data: any) {
    const existing = await voucherRepository.findByCode(data.code.toUpperCase());
    if (existing) {
      throw new ValidationError('Voucher code already exists');
    }

    return voucherRepository.create({
      code: data.code.toUpperCase(),
      type: data.type,
      value: new Prisma.Decimal(data.value),
      minPurchase: data.minPurchase ? new Prisma.Decimal(data.minPurchase) : new Prisma.Decimal(0),
      maxDiscount: data.maxDiscount ? new Prisma.Decimal(data.maxDiscount) : null,
      usageLimit: data.usageLimit || null,
      usageLimitPerUser: data.usageLimitPerUser || 1,
      scope: data.scope || 'ALL',
      scopeReferenceId: data.scopeReferenceId || null,
      startsAt: new Date(data.startsAt),
      endsAt: new Date(data.endsAt),
      status: data.status || 'ACTIVE',
      createdBy: data.createdBy,
    });
  }

  async getVoucherById(id: string) {
    const voucher = await voucherRepository.findById(id);
    if (!voucher) {
      throw new NotFoundError('Voucher not found');
    }
    return voucher;
  }

  async getVoucherByCode(code: string) {
    const voucher = await voucherRepository.findByCode(code.toUpperCase());
    if (!voucher) {
      throw new NotFoundError('Voucher not found');
    }
    return voucher;
  }

  async listVouchers(params: { page: number; limit: number; search?: string; status?: string }) {
    const skip = (params.page - 1) * params.limit;
    const { items, total } = await voucherRepository.findAndCountAll({
      skip,
      take: params.limit,
      search: params.search,
      status: params.status,
    });

    return {
      vouchers: items,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    };
  }

  async updateVoucher(id: string, data: any) {
    const voucher = await this.getVoucherById(id);
    
    const updateData: Prisma.VoucherUpdateInput = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.usageLimit !== undefined) updateData.usageLimit = data.usageLimit;
    if (data.usageLimitPerUser !== undefined) updateData.usageLimitPerUser = data.usageLimitPerUser;
    if (data.endsAt !== undefined) updateData.endsAt = new Date(data.endsAt);
    if (data.startsAt !== undefined) updateData.startsAt = new Date(data.startsAt);
    if (data.value !== undefined) updateData.value = new Prisma.Decimal(data.value);
    if (data.minPurchase !== undefined) updateData.minPurchase = new Prisma.Decimal(data.minPurchase);
    if (data.maxDiscount !== undefined) updateData.maxDiscount = data.maxDiscount ? new Prisma.Decimal(data.maxDiscount) : null;
    if (data.scope !== undefined) updateData.scope = data.scope;
    if (data.scopeReferenceId !== undefined) updateData.scopeReferenceId = data.scopeReferenceId;

    return voucherRepository.update(id, updateData);
  }

  async deleteVoucher(id: string) {
    await this.getVoucherById(id);
    return voucherRepository.delete(id);
  }

  async validateVoucher(code: string, userId: string, items: ValidateVoucherItem[]) {
    const voucher = await voucherRepository.findByCode(code.toUpperCase());
    if (!voucher) {
      throw new NotFoundError(`Voucher code "${code}" is invalid or does not exist`);
    }

    if (voucher.status !== 'ACTIVE') {
      throw new ValidationError('Voucher is inactive');
    }

    const now = new Date();
    if (now < new Date(voucher.startsAt)) {
      throw new ValidationError('Voucher promo period has not started yet');
    }
    if (now > new Date(voucher.endsAt)) {
      throw new ValidationError('Voucher has expired');
    }

    if (voucher.usageLimit !== null && voucher.usedCount >= voucher.usageLimit) {
      throw new ValidationError('Voucher usage limit reached');
    }

    // Check user usage limit
    const userUsageCount = await voucherRepository.countUsageByUser(voucher.id, userId);
    if (userUsageCount >= voucher.usageLimitPerUser) {
      throw new ValidationError('You have reached the usage limit for this voucher');
    }

    // Calculate eligible subtotal based on scope
    let eligibleSubtotal = 0;
    let hasMatchingScope = false;

    if (voucher.scope === 'ALL') {
      eligibleSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      hasMatchingScope = true;
    } else if (voucher.scope === 'CATEGORY') {
      const scopedItems = items.filter(item => item.categoryId === voucher.scopeReferenceId);
      if (scopedItems.length > 0) {
        eligibleSubtotal = scopedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        hasMatchingScope = true;
      }
    } else if (voucher.scope === 'SELLER') {
      const scopedItems = items.filter(item => item.sellerId === voucher.scopeReferenceId);
      if (scopedItems.length > 0) {
        eligibleSubtotal = scopedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        hasMatchingScope = true;
      }
    }

    if (!hasMatchingScope) {
      throw new ValidationError(`Voucher is only applicable for specific ${voucher.scope.toLowerCase()} items`);
    }

    const minPurchaseVal = Number(voucher.minPurchase);
    if (eligibleSubtotal < minPurchaseVal) {
      throw new ValidationError(`Minimum purchase of Rp${minPurchaseVal.toLocaleString()} required to use this voucher`);
    }

    // Calculate discount amount
    let discountAmount = 0;
    const valueNum = Number(voucher.value);
    
    if (voucher.type === 'PERCENTAGE') {
      discountAmount = eligibleSubtotal * (valueNum / 100);
      if (voucher.maxDiscount !== null) {
        const maxDiscountVal = Number(voucher.maxDiscount);
        if (discountAmount > maxDiscountVal) {
          discountAmount = maxDiscountVal;
        }
      }
    } else if (voucher.type === 'FIXED_AMOUNT') {
      discountAmount = valueNum;
    }

    // Caps discount at total items subtotal
    const totalSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (discountAmount > totalSubtotal) {
      discountAmount = totalSubtotal;
    }

    return {
      voucher,
      discountAmount,
    };
  }

  async applyVoucher(code: string, userId: string, orderId: string, items: ValidateVoucherItem[]) {
    return prisma.$transaction(async (tx) => {
      // Re-validate to ensure safety inside transaction
      const { voucher, discountAmount } = await this.validateVoucher(code, userId, items);

      // Increment usedCount
      await tx.voucher.update({
        where: { id: voucher.id },
        data: {
          usedCount: {
            increment: 1,
          },
        },
      });

      // Create usage record
      const usage = await tx.voucherUsage.create({
        data: {
          voucherId: voucher.id,
          userId,
          orderId,
          discountAmount,
        },
      });

      return {
        voucher,
        discountAmount,
        usage,
      };
    });
  }

  async releaseVoucher(orderId: string) {
    return prisma.$transaction(async (tx) => {
      const usage = await tx.voucherUsage.findFirst({
        where: { orderId },
      });

      if (!usage) {
        // Idempotent release
        return { released: false };
      }

      // Decrement usedCount
      await tx.voucher.update({
        where: { id: usage.voucherId },
        data: {
          usedCount: {
            decrement: 1,
          },
        },
      });

      // Delete usage record
      await tx.voucherUsage.delete({
        where: { id: usage.id },
      });

      return { released: true };
    });
  }

  async createSellerVoucher(sellerId: string, data: any) {
    const code = data.code?.toUpperCase();
    if (!code) throw new ValidationError('Voucher code is required');

    const existing = await voucherRepository.findByCode(code);
    if (existing) throw new ValidationError('Voucher code already exists');

    return voucherRepository.create({
      code,
      type: data.type,
      value: new Prisma.Decimal(data.value),
      minPurchase: data.minPurchase ? new Prisma.Decimal(data.minPurchase) : new Prisma.Decimal(0),
      maxDiscount: data.maxDiscount ? new Prisma.Decimal(data.maxDiscount) : null,
      usageLimit: data.usageLimit || null,
      usageLimitPerUser: data.usageLimitPerUser || 1,
      scope: 'SELLER',
      scopeReferenceId: sellerId,
      startsAt: new Date(data.startsAt),
      endsAt: new Date(data.endsAt),
      status: data.status || 'ACTIVE',
      createdBy: sellerId,
    });
  }

  async listSellerVouchers(sellerId: string, params: { page: number; limit: number; status?: string }) {
    const skip = (params.page - 1) * params.limit;

    const where: Prisma.VoucherWhereInput = {
      scope: 'SELLER',
      scopeReferenceId: sellerId,
    };
    if (params.status) where.status = params.status;

    const [items, total] = await Promise.all([
      prisma.voucher.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.voucher.count({ where }),
    ]);

    return {
      vouchers: items,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    };
  }

  async toggleVoucher(id: string, actor: { userId: string; role: string }) {
    const voucher = await this.getVoucherById(id);

    // Sellers can only toggle their own vouchers
    if (actor.role === 'SELLER' && voucher.scopeReferenceId !== actor.userId) {
      throw new ValidationError('Access denied: You can only manage your own vouchers');
    }

    const newStatus = voucher.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    return voucherRepository.update(id, { status: newStatus });
  }

  async getUsageHistory(id: string, actor: { userId: string; role: string }, params: { page: number; limit: number }) {
    const voucher = await this.getVoucherById(id);

    // Sellers can only view their own vouchers' usage
    if (actor.role === 'SELLER' && voucher.scopeReferenceId !== actor.userId) {
      throw new ValidationError('Access denied: You can only view usage for your own vouchers');
    }

    const skip = (params.page - 1) * params.limit;

    const [usages, total] = await Promise.all([
      prisma.voucherUsage.findMany({
        where: { voucherId: id },
        skip,
        take: params.limit,
        orderBy: { usedAt: 'desc' },
      }),
      prisma.voucherUsage.count({ where: { voucherId: id } }),
    ]);

    return {
      voucher,
      usages,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    };
  }
}

export const voucherService = new VoucherService();
