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
}

export const sellerRepository = new SellerRepository();
export default sellerRepository;
