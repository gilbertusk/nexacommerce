import { prisma } from '../prisma/client';
import { Prisma } from '../generated/client';

export class VoucherRepository {
  async findById(id: string) {
    return prisma.voucher.findUnique({
      where: { id },
    });
  }

  async findByCode(code: string) {
    return prisma.voucher.findUnique({
      where: { code },
    });
  }

  async create(data: Prisma.VoucherCreateInput) {
    return prisma.voucher.create({
      data,
    });
  }

  async update(id: string, data: Prisma.VoucherUpdateInput) {
    return prisma.voucher.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.voucher.delete({
      where: { id },
    });
  }

  async findAndCountAll(params: { skip: number; take: number; search?: string; status?: string }) {
    const where: Prisma.VoucherWhereInput = {};
    
    if (params.search) {
      where.code = {
        contains: params.search,
        mode: 'insensitive',
      };
    }
    
    if (params.status) {
      where.status = params.status;
    }

    const [items, total] = await Promise.all([
      prisma.voucher.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.voucher.count({ where }),
    ]);

    return { items, total };
  }

  // Usages
  async createUsage(data: Prisma.VoucherUsageUncheckedCreateInput) {
    return prisma.voucherUsage.create({
      data,
    });
  }

  async findUsageByOrder(orderId: string) {
    return prisma.voucherUsage.findFirst({
      where: { orderId },
      include: { voucher: true },
    });
  }

  async countUsageByUser(voucherId: string, userId: string) {
    return prisma.voucherUsage.count({
      where: {
        voucherId,
        userId,
      },
    });
  }

  async deleteUsage(id: string) {
    return prisma.voucherUsage.delete({
      where: { id },
    });
  }

  async deleteUsageByOrder(orderId: string) {
    return prisma.voucherUsage.deleteMany({
      where: { orderId },
    });
  }
}

export const voucherRepository = new VoucherRepository();
