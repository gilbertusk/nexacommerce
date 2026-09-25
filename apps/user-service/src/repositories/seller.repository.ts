import { prisma } from '../prisma/client';
import { SellerProfile } from '../generated/client';

export class SellerRepository {
  async findByUserId(userId: string) {
    return prisma.sellerProfile.findUnique({
      where: { userId },
    });
  }

  async create(userId: string, data: { storeName: string; storeDescription?: string; storeLogo?: string; storeBanner?: string; storeAddress?: string }) {
    return prisma.sellerProfile.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  async update(userId: string, data: { storeName?: string; storeDescription?: string; storeLogo?: string; storeBanner?: string; storeAddress?: string; isVerified?: boolean; verifiedAt?: Date }) {
    return prisma.sellerProfile.update({
      where: { userId },
      data,
    });
  }

  async findAll(params?: { skip?: number; take?: number }) {
    return prisma.sellerProfile.findMany({
      skip: params?.skip,
      take: params?.take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async countAll() {
    return prisma.sellerProfile.count();
  }

  async findById(id: string) {
    return prisma.sellerProfile.findUnique({
      where: { id },
    });
  }

  async updateById(id: string, data: { storeName?: string; storeDescription?: string; storeLogo?: string; storeBanner?: string; storeAddress?: string; isVerified?: boolean; verifiedAt?: Date | null; status?: string }) {
    return prisma.sellerProfile.update({
      where: { id },
      data,
    });
  }
}

export const sellerRepository = new SellerRepository();
export default sellerRepository;
