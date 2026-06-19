import { prisma } from '../prisma/client';
import { Prisma } from '../generated/client';

export class BrandRepository {
  async findAll() {
    return prisma.brand.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    return prisma.brand.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string) {
    return prisma.brand.findUnique({
      where: { slug },
    });
  }

  async create(data: Prisma.BrandCreateInput) {
    return prisma.brand.create({
      data,
    });
  }

  async update(id: string, data: Prisma.BrandUpdateInput) {
    return prisma.brand.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.brand.delete({
      where: { id },
    });
  }
}

export const brandRepository = new BrandRepository();
export default brandRepository;
