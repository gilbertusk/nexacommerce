import { categoryRepository } from '../repositories/category.repository';
import { productRepository } from '../repositories/product.repository';
import { brandRepository } from '../repositories/brand.repository';
import { ProductStatus } from '../generated/client';
import { NotFoundError, ValidationError, ForbiddenError, ConflictError } from '@nexacommerce/common';

export class ProductService {
  // --- Category ---
  async getCategories() {
    return categoryRepository.findAll();
  }

  async createCategory(data: { name: string; slug: string }) {
    const existing = await categoryRepository.findBySlug(data.slug);
    if (existing) {
      throw new ConflictError('Category slug already exists');
    }
    return categoryRepository.create(data);
  }

  // --- Brand ---
  async getBrands() {
    return brandRepository.findAll();
  }

  async createBrand(data: { name: string; slug: string; logo?: string }) {
    const existing = await brandRepository.findBySlug(data.slug);
    if (existing) {
      throw new ConflictError('Brand slug already exists');
    }
    return brandRepository.create(data);
  }

  async updateBrand(id: string, data: { name?: string; slug?: string; logo?: string }) {
    const brand = await brandRepository.findById(id);
    if (!brand) {
      throw new NotFoundError('Brand not found');
    }

    if (data.slug && data.slug !== brand.slug) {
      const existing = await brandRepository.findBySlug(data.slug);
      if (existing) {
        throw new ConflictError('Brand slug already exists');
      }
    }

    return brandRepository.update(id, data);
  }

  async deleteBrand(id: string) {
    const brand = await brandRepository.findById(id);
    if (!brand) {
      throw new NotFoundError('Brand not found');
    }
    return brandRepository.delete(id);
  }

  // --- Product ---
  async getProducts(params: {
    page?: number;
    limit?: number;
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
    const page = params.page || 1;
    const limit = params.limit || 10;

    const { products, total } = await productRepository.findAndCountAll({
      ...params,
      page,
      limit,
    });

    return {
      items: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProductById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return product;
  }

  async createProduct(data: {
    name: string;
    slug: string;
    description?: string;
    price: number;
    stock?: number;
    categoryId: string;
    sellerId: string;
    brandId?: string;
    sku?: string;
    weight?: number;
    status?: ProductStatus;
  }) {
    const category = await categoryRepository.findById(data.categoryId);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    if (data.brandId) {
      const brand = await brandRepository.findById(data.brandId);
      if (!brand) {
        throw new NotFoundError('Brand not found');
      }
    }

    const existingSlug = await productRepository.findBySlug(data.slug);
    if (existingSlug) {
      throw new ConflictError('Product slug already exists');
    }

    return productRepository.create({
      name: data.name,
      slug: data.slug,
      description: data.description,
      price: data.price,
      stock: data.stock !== undefined ? data.stock : 0,
      categoryId: data.categoryId,
      sellerId: data.sellerId,
      brandId: data.brandId || null,
      sku: data.sku || null,
      weight: data.weight || 0,
      status: data.status || ProductStatus.DRAFT,
    });
  }

  async updateProduct(
    id: string,
    actor: { userId: string; role: string },
    data: {
      name?: string;
      slug?: string;
      description?: string;
      price?: number;
      stock?: number;
      categoryId?: string;
      brandId?: string;
      sku?: string;
      weight?: number;
      status?: ProductStatus;
    }
  ) {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Product not found');
    }

    // Authorization: seller can only update their own products
    if (actor.role !== 'ADMIN' && existing.sellerId !== actor.userId) {
      throw new ForbiddenError('You are not authorized to update this product');
    }

    if (data.categoryId) {
      const category = await categoryRepository.findById(data.categoryId);
      if (!category) {
        throw new NotFoundError('Category not found');
      }
    }

    if (data.brandId) {
      const brand = await brandRepository.findById(data.brandId);
      if (!brand) {
        throw new NotFoundError('Brand not found');
      }
    }

    if (data.slug && data.slug !== existing.slug) {
      const existingSlug = await productRepository.findBySlug(data.slug);
      if (existingSlug) {
        throw new ConflictError('Product slug already exists');
      }
    }

    // Role check for status changes
    if (data.status) {
      if (actor.role !== 'ADMIN') {
        // Seller can only set DRAFT or ACTIVE
        if (data.status !== ProductStatus.DRAFT && data.status !== ProductStatus.ACTIVE) {
          throw new ForbiddenError('Sellers can only set status to DRAFT or ACTIVE');
        }
      }
    }

    return productRepository.update(id, data);
  }

  async deleteProduct(id: string, actor: { userId: string; role: string }) {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Product not found');
    }

    // Authorization
    if (actor.role !== 'ADMIN' && existing.sellerId !== actor.userId) {
      throw new ForbiddenError('You are not authorized to delete this product');
    }

    // Soft delete: update status to ARCHIVED
    return productRepository.update(id, { status: ProductStatus.ARCHIVED });
  }

  // --- Product Images ---
  async addProductImage(
    productId: string,
    actor: { userId: string; role: string },
    data: { url: string; alt?: string; sortOrder?: number; isMain?: boolean }
  ) {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (actor.role !== 'ADMIN' && product.sellerId !== actor.userId) {
      throw new ForbiddenError('You are not authorized to modify this product');
    }

    const totalImages = await productRepository.countImages(productId);
    
    // First image is automatically main
    if (totalImages === 0) {
      data.isMain = true;
    }

    if (data.isMain) {
      await productRepository.unsetMainImages(productId);
    }

    return productRepository.addImage(productId, data);
  }

  async deleteProductImage(productId: string, imageId: string, actor: { userId: string; role: string }) {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (actor.role !== 'ADMIN' && product.sellerId !== actor.userId) {
      throw new ForbiddenError('You are not authorized to modify this product');
    }

    const image = await productRepository.findImageById(imageId);
    if (!image || image.productId !== productId) {
      throw new NotFoundError('Product image not found');
    }

    await productRepository.deleteImage(imageId);

    // If we deleted the main image, make the first remaining image main
    if (image.isMain) {
      const firstRemaining = await productRepository.findFirstImage(productId);
      if (firstRemaining) {
        await productRepository.updateImage(firstRemaining.id, { isMain: true });
      }
    }

    return { id: imageId };
  }

  async updateProductImage(
    productId: string,
    imageId: string,
    actor: { userId: string; role: string },
    data: { alt?: string; sortOrder?: number; isMain?: boolean }
  ) {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (actor.role !== 'ADMIN' && product.sellerId !== actor.userId) {
      throw new ForbiddenError('You are not authorized to modify this product');
    }

    const image = await productRepository.findImageById(imageId);
    if (!image || image.productId !== productId) {
      throw new NotFoundError('Product image not found');
    }

    if (data.isMain) {
      await productRepository.unsetMainImages(productId, imageId);
    }

    return productRepository.updateImage(imageId, data);
  }
}

export const productService = new ProductService();
export default productService;
