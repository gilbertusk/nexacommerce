import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";

// ------- Raw API Types (matches actual backend response) -------

interface RawProductImage {
  id: string;
  url: string;
  alt: string;
  isMain: boolean;
  sortOrder: number;
}

interface RawCategory {
  id: string;
  name: string;
  slug: string;
}

interface RawBrand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
}

interface RawProduct {
  id: string;
  name: string;
  description: string;
  price: string | number;
  stock: number;
  images: RawProductImage[];
  category: RawCategory;
  brand: RawBrand;
  sellerId: string;
  rating?: string | number;
  totalReviews?: number;
  totalSold?: number;
  status?: string;
  sku?: string;
  weight?: number;
}

// ------- Normalized Frontend Types -------

export interface ApiProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  category: string;
  brand: string;
  sellerId: string;
  sellerName?: string;
  averageRating?: number;
  totalReviews?: number;
  originalPrice?: number;
  discountPercentage?: number;
  rating?: number;
  reviewsCount?: number;
  specifications?: { label: string; value: string }[];
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
}

function normalizeProduct(raw: RawProduct): ApiProduct {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    price: Number(raw.price),
    stock: raw.stock,
    images: raw.images?.map((img) => img.url) ?? [],
    category: raw.category?.name ?? "",
    brand: raw.brand?.name ?? "",
    sellerId: raw.sellerId,
    averageRating: Number(raw.rating ?? 0),
    totalReviews: raw.totalReviews ?? 0,
  };
}

export interface ProductsListResponse {
  success: boolean;
  data: {
    products: ApiProduct[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface SingleProductResponse {
  success: boolean;
  data: {
    product: ApiProduct;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
}

export interface Brand {
  id: string;
  name: string;
}

export interface BrandsResponse {
  success: boolean;
  data: Brand[];
}

export type ProductsParams = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
};

// ------- Hooks -------

export function useProducts(params: ProductsParams = {}) {
  const { page = 1, limit = 20, search = "", category = "", brand = "" } = params;

  const queryParams = new URLSearchParams();
  queryParams.set("page", String(page));
  queryParams.set("limit", String(limit));
  if (search) queryParams.set("search", search);
  if (category) queryParams.set("category", category);
  if (brand) queryParams.set("brand", brand);

  return useQuery({
    queryKey: ["products", page, limit, search, category, brand],
    queryFn: async () => {
      const raw = await apiGet<{
        success: boolean;
        data: { items: RawProduct[]; total: number; page: number; limit: number; totalPages: number };
      }>(`/products/products?${queryParams.toString()}`);
      return {
        success: raw.success,
        data: {
          products: (raw.data?.items ?? []).map(normalizeProduct),
          total: raw.data?.total ?? 0,
          page: raw.data?.page ?? 1,
          limit: raw.data?.limit ?? limit,
        },
      } as ProductsListResponse;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const raw = await apiGet<{ success: boolean; data: RawProduct }>(
        `/products/products/${id}`
      );
      return {
        success: raw.success,
        data: { product: normalizeProduct(raw.data) },
      } as SingleProductResponse;
    },
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => apiGet<CategoriesResponse>("/products/categories"),
    staleTime: 1000 * 60 * 30,
  });
}

export function useBrands() {
  return useQuery({
    queryKey: ["brands"],
    queryFn: () => apiGet<BrandsResponse>("/brands"),
    staleTime: 1000 * 60 * 30,
  });
}
