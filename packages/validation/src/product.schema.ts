import { z } from 'zod';

export const ProductStatusEnum = z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED', 'REJECTED']);

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric and hyphen characters'),
});

export const createBrandSchema = z.object({
  name: z.string().min(2, 'Brand name must be at least 2 characters'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric and hyphen characters'),
  logo: z.string().url('Invalid logo URL').optional().or(z.literal('')),
});

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric and hyphen characters'),
  description: z.string().optional(),
  price: z.number().positive('Price must be greater than 0'),
  stock: z.number().int().nonnegative('Stock cannot be negative').optional(),
  categoryId: z.string().uuid('Invalid category ID'),
  sellerId: z.string().min(1, 'Seller ID is required'),
  brandId: z.string().uuid('Invalid brand ID').optional(),
  sku: z.string().optional(),
  weight: z.number().int().positive('Weight must be a positive integer in grams'),
  status: ProductStatusEnum.optional(),
});

export const updateProductSchema = createProductSchema.partial().omit({ sellerId: true });

export const productQuerySchema = z.object({
  brandId: z.string().uuid().optional(),
  sellerId: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  minPrice: z.preprocess((val) => val ? parseFloat(val as string) : undefined, z.number().nonnegative().optional()),
  maxPrice: z.preprocess((val) => val ? parseFloat(val as string) : undefined, z.number().nonnegative().optional()),
  minRating: z.preprocess((val) => val ? parseFloat(val as string) : undefined, z.number().min(0).max(5).optional()),
  status: ProductStatusEnum.optional(),
  search: z.string().optional(),
  page: z.preprocess((val) => val ? parseInt(val as string, 10) : undefined, z.number().int().positive().optional()),
  limit: z.preprocess((val) => val ? parseInt(val as string, 10) : undefined, z.number().int().positive().optional()),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'best_selling', 'highest_rating']).optional(),
});
