import { prisma } from '../prisma/client';
import { Prisma, ProductStatus } from '../generated/client';

export class ProductRepository {
  async findAndCountAll(params: {
    page: number;
    limit: number;
    search?: string;
    brandId?: string;
    sellerId?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    status?: ProductStatus;
    sort?: string;
  }) {
    const {
      page,
      limit,
      search,
      brandId,
      sellerId,
      categoryId,
      minPrice,
      maxPrice,
      minRating,
      status,
      sort,
    } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    // Soft-delete: by default, do not show ARCHIVED products unless explicitly requested
    if (status) {
      where.status = status;
    } else {
      where.status = { not: ProductStatus.ARCHIVED };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (brandId) where.brandId = brandId;
    if (sellerId) where.sellerId = sellerId;
    if (categoryId) where.categoryId = categoryId;

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (minRating !== undefined) {
      where.rating = { gte: minRating };
    }

    // Sorting
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'best_selling') {
      orderBy = { totalSold: 'desc' };
    } else if (sort === 'highest_rating') {
      orderBy = { rating: 'desc' };
    } else if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          brand: true,
          images: {
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy,
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total };
  }

  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  async findManyByIds(ids: string[]) {
    return prisma.product.findMany({
      where: {
        id: { in: ids },
      },
      include: {
        category: true,
        brand: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    return prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        brand: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  async create(data: Prisma.ProductUncheckedCreateInput) {
    return prisma.product.create({
      data,
      include: {
        category: true,
        brand: true,
        images: true,
      },
    });
  }

  async update(id: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        brand: true,
        images: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.product.delete({
      where: { id },
    });
  }

  async updateRating(productId: string, averageRating: number, totalReviews: number) {
    return prisma.product.update({
      where: { id: productId },
      data: {
        rating: new Prisma.Decimal(averageRating),
        totalReviews,
      },
    });
  }

  async countProducts(where: Prisma.ProductWhereInput) {
    return prisma.product.count({ where });
  }

  async findIdsBySellerId(sellerId: string): Promise<string[]> {
    const products = await prisma.product.findMany({
      where: {
        sellerId,
        status: { not: ProductStatus.ARCHIVED },
      },
      select: { id: true },
    });
    return products.map((p) => p.id);
  }

  // --- Product Image Methods ---
  async findImageById(imageId: string) {
    return prisma.productImage.findUnique({
      where: { id: imageId },
    });
  }

  async addImage(productId: string, data: { url: string; alt?: string; sortOrder?: number; isMain?: boolean }) {
    return prisma.productImage.create({
      data: {
        productId,
        ...data,
      },
    });
  }

  async deleteImage(imageId: string) {
    return prisma.productImage.delete({
      where: { id: imageId },
    });
  }

  async updateImage(imageId: string, data: { alt?: string; sortOrder?: number; isMain?: boolean }) {
    return prisma.productImage.update({
      where: { id: imageId },
      data,
    });
  }

  async countImages(productId: string) {
    return prisma.productImage.count({
      where: { productId },
    });
  }

  async unsetMainImages(productId: string, exceptImageId?: string) {
    return prisma.productImage.updateMany({
      where: {
        productId,
        id: exceptImageId ? { not: exceptImageId } : undefined,
        isMain: true,
      },
      data: {
        isMain: false,
      },
    });
  }

  async findFirstImage(productId: string) {
    return prisma.productImage.findFirst({
      where: { productId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findBySellerId(sellerId: string, params: { page: number; limit: number }) {
    const skip = (params.page - 1) * params.limit;
    const where = {
      sellerId,
      status: { not: ProductStatus.ARCHIVED },
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: params.limit,
        include: {
          category: true,
          brand: true,
          images: {
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total };
  }
}

export const productRepository = new ProductRepository();
export default productRepository;
