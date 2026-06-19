import { prisma } from '../prisma/client';
import { Address } from '../generated/client';

export class AddressRepository {
  async findByUserId(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.address.findUnique({
      where: { id },
    });
  }

  async create(userId: string, data: { label: string; recipientName: string; phone: string; street: string; city: string; province: string; postalCode: string; isDefault?: boolean }) {
    return prisma.address.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  async update(id: string, data: { label?: string; recipientName?: string; phone?: string; street?: string; city?: string; province?: string; postalCode?: string; isDefault?: boolean }) {
    return prisma.address.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.address.delete({
      where: { id },
    });
  }

  async countByUserId(userId: string) {
    return prisma.address.count({
      where: { userId },
    });
  }

  async unsetDefaults(userId: string, exceptAddressId?: string) {
    return prisma.address.updateMany({
      where: {
        userId,
        id: exceptAddressId ? { not: exceptAddressId } : undefined,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });
  }
}

export const addressRepository = new AddressRepository();
export default addressRepository;
