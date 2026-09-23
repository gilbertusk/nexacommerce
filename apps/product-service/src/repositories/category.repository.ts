import { prisma } from '../prisma/client';
import { Prisma } from '../generated/client';

export class CategoryRepository {
  async findAll() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string) {
    return prisma.category.findUnique({
      where: { slug },
    });
  }

  async create(data: Prisma.CategoryCreateInput) {
    return prisma.category.create({
      data,
    });
  }

  async delete(id: string) {
    return prisma.category.delete({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.CategoryUpdateInput) {
    return prisma.category.update({
      where: { id },
      data,
    });
  }
}

export const categoryRepository = new CategoryRepository();
