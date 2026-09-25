import { prisma } from '../prisma/client';
import { SellerProfile } from '../generated/client';

export class SellerRepository {
  async findByUserId(userId: string) {
    return prisma.sellerProfile.findUnique({
      where: { userId },
    });
  }

  /** Record a proposed origin, leaving it unverified until an admin reviews it. */
  async setDispatchOrigin(userId: string, originCity: string, originProvince: string) {
    return prisma.sellerProfile.update({
      where: { userId },
      data: { originCity, originProvince, originVerifiedAt: null },
    });
  }

  /** Approve or revoke a proposed origin. */
  async setDispatchOriginVerification(id: string, verified: boolean) {
    return prisma.sellerProfile.update({
      where: { id },
      data: { originVerifiedAt: verified ? new Date() : null },
    });
  }

  /**
   * Dispatch origins for several sellers at once. Used by shipping quoting,
   * which must not issue N sequential lookups while a customer waits.
   */
  async findDispatchOrigins(userIds: string[]) {
    return prisma.sellerProfile.findMany({
      where: { userId: { in: userIds } },
      select: {
        userId: true,
        storeName: true,
        status: true,
        originCity: true,
        originProvince: true,
        originVerifiedAt: true,
      },
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
