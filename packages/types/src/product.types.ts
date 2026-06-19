export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
  REJECTED = 'REJECTED',
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  alt?: string;
  sortOrder: number;
  isMain: boolean;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock: number;
  status: ProductStatus;
  categoryId: string;
  sellerId: string;
  brandId?: string;
  sku?: string;
  weight?: number;
  minPrice?: number;
  maxPrice?: number;
  rating: number;
  totalReviews: number;
  totalSold: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFilter {
  brandId?: string;
  sellerId?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  status?: ProductStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export type SortOption =
  | 'newest'
  | 'price_asc'
  | 'price_desc'
  | 'best_selling'
  | 'highest_rating';
