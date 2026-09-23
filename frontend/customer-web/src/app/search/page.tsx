"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";
import { apiGet } from "@/lib/api/client";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  images: string[];
  brand?: string;
  stock: number;
  sellerName?: string;
  category?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    total: number;
    page: number;
    limit: number;
  };
}

interface CategoriesResponse {
  success: boolean;
  data: Category[];
}

const SORT_OPTIONS = [
  { label: "Relevansi", value: "relevance" },
  { label: "Terbaru", value: "newest" },
  { label: "Harga Terendah", value: "price_asc" },
  { label: "Harga Tertinggi", value: "price_desc" },
  { label: "Terpopuler", value: "popular" },
];

function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-surface border border-hairline animate-pulse">
      <div className="aspect-[4/5] bg-paper" />
      <div className="p-4 flex flex-col gap-2">
        <div className="h-2.5 w-1/3 bg-paper rounded-xs" />
        <div className="h-4 w-2/3 bg-paper rounded-xs" />
        <div className="h-3 w-1/4 bg-paper rounded-xs mt-2" />
      </div>
    </div>
  );
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? searchParams.get("search") ?? "";
  const categoryParam = searchParams.get("category") ?? "";
  const minPriceParam = searchParams.get("minPrice") ?? "";
  const maxPriceParam = searchParams.get("maxPrice") ?? "";
  const sortParam = searchParams.get("sort") ?? "relevance";
  const pageParam = parseInt(searchParams.get("page") ?? "1", 10);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filter local state
  const [localMinPrice, setLocalMinPrice] = useState(minPriceParam);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPriceParam);

  const limit = 16;

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, val]) => {
        if (val === null || val === "") params.delete(key);
        else params.set(key, val);
      });
      params.set("page", "1");
      router.push(`/search?${params.toString()}`);
    },
    [searchParams, router]
  );

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (q) params.set("search", q);
        if (categoryParam) params.set("category", categoryParam);
        if (minPriceParam) params.set("minPrice", minPriceParam);
        if (maxPriceParam) params.set("maxPrice", maxPriceParam);
        if (sortParam && sortParam !== "relevance") params.set("sort", sortParam);
        params.set("page", String(pageParam));
        params.set("limit", String(limit));

        const res = await apiGet<ProductsResponse>(`/products/products?${params.toString()}`);
        setProducts(res.data.products);
        setTotal(res.data.total);
      } catch (err) {
        console.error("Search error:", err);
        setProducts([]);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [q, categoryParam, minPriceParam, maxPriceParam, sortParam, pageParam]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiGet<CategoriesResponse>("/products/categories");
        setCategories(res.data);
      } catch {
        // Categories are optional, fail silently
      }
    };
    fetchCategories();
  }, []);

  const totalPages = Math.ceil(total / limit);

  const handlePriceFilter = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ minPrice: localMinPrice, maxPrice: localMaxPrice });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <div className="border-b border-hairline pb-6 mb-8">
        <h1 className="font-serif text-3xl md:text-4xl text-ink-primary mb-1">
          {q ? (
            <>Hasil untuk <span className="italic text-primary">&quot;{q}&quot;</span></>
          ) : (
            "Semua Produk"
          )}
        </h1>
        <p className="text-xs text-ink-secondary">
          {isLoading ? "Mencari..." : `${total.toLocaleString("id-ID")} produk ditemukan`}
          {categoryParam && (
            <> dalam kategori <span className="font-semibold text-ink-primary">{categoryParam}</span></>
          )}
        </p>
      </div>

      <div className="flex gap-8 items-start">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col gap-6 w-60 flex-shrink-0 sticky top-24">
          {/* Categories */}
          <div>
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-ink-secondary mb-3 pb-2 border-b border-hairline">
              Kategori
            </h3>
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => updateParams({ category: null })}
                className={`text-left text-xs py-1.5 px-2 rounded-xs transition-colors cursor-pointer ${
                  !categoryParam
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-ink-secondary hover:text-ink-primary hover:bg-paper"
                }`}
              >
                Semua Kategori
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateParams({ category: cat.name })}
                  className={`text-left text-xs py-1.5 px-2 rounded-xs transition-colors cursor-pointer ${
                    categoryParam === cat.name
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-ink-secondary hover:text-ink-primary hover:bg-paper"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-ink-secondary mb-3 pb-2 border-b border-hairline">
              Rentang Harga
            </h3>
            <form onSubmit={handlePriceFilter} className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-ink-secondary uppercase font-bold tracking-wide">Min (Rp)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={localMinPrice}
                  onChange={(e) => setLocalMinPrice(e.target.value)}
                  className="bg-paper text-xs text-ink-primary px-3 py-2 rounded-xs border border-transparent focus:border-outline-variant focus:outline-hidden"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-ink-secondary uppercase font-bold tracking-wide">Max (Rp)</label>
                <input
                  type="number"
                  placeholder="Tidak terbatas"
                  value={localMaxPrice}
                  onChange={(e) => setLocalMaxPrice(e.target.value)}
                  className="bg-paper text-xs text-ink-primary px-3 py-2 rounded-xs border border-transparent focus:border-outline-variant focus:outline-hidden"
                />
              </div>
              <button
                type="submit"
                className="bg-ink-primary text-white text-[10px] uppercase font-bold tracking-widest py-2 rounded-xs hover:bg-primary transition-colors cursor-pointer"
              >
                Terapkan
              </button>
              {(minPriceParam || maxPriceParam) && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalMinPrice("");
                    setLocalMaxPrice("");
                    updateParams({ minPrice: null, maxPrice: null });
                  }}
                  className="text-[10px] text-ink-secondary hover:text-rose-600 transition-colors cursor-pointer"
                >
                  Reset Harga
                </button>
              )}
            </form>
          </div>

          {/* Active Filters */}
          {(categoryParam || minPriceParam || maxPriceParam) && (
            <div>
              <h3 className="text-[10px] uppercase font-bold tracking-widest text-ink-secondary mb-3 pb-2 border-b border-hairline">
                Filter Aktif
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {categoryParam && (
                  <button
                    onClick={() => updateParams({ category: null })}
                    className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-sm cursor-pointer hover:bg-primary/20"
                  >
                    {categoryParam}
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                )}
                {(minPriceParam || maxPriceParam) && (
                  <button
                    onClick={() => {
                      setLocalMinPrice("");
                      setLocalMaxPrice("");
                      updateParams({ minPrice: null, maxPrice: null });
                    }}
                    className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-sm cursor-pointer hover:bg-primary/20"
                  >
                    Harga
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Sort & Result Info */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <p className="text-xs text-ink-secondary">
              {isLoading ? "Memuat..." : (
                total > 0
                  ? `Menampilkan ${Math.min((pageParam - 1) * limit + 1, total)}–${Math.min(pageParam * limit, total)} dari ${total.toLocaleString("id-ID")} produk`
                  : ""
              )}
            </p>
            <div className="flex items-center gap-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-ink-secondary">
                Urutkan:
              </label>
              <select
                value={sortParam}
                onChange={(e) => updateParams({ sort: e.target.value })}
                className="bg-paper text-xs text-ink-primary px-3 py-1.5 rounded-xs border border-hairline focus:outline-hidden focus:border-outline-variant cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-paper border border-hairline flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-2xl text-ink-secondary">search_off</span>
              </div>
              <p className="font-serif text-2xl text-ink-primary mb-2">
                Produk Tidak Ditemukan
              </p>
              <p className="text-xs text-ink-secondary mb-6">
                Tidak ada produk yang cocok dengan pencarian atau filter Anda.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={() => router.push("/search")}
                  className="bg-primary text-white text-xs uppercase font-bold tracking-widest px-6 py-2.5 rounded-xs hover:bg-primary-hover transition-colors"
                >
                  Reset Pencarian
                </button>
                <Link
                  href="/shop"
                  className="border border-hairline text-ink-primary text-xs uppercase font-bold tracking-widest px-6 py-2.5 rounded-xs hover:bg-paper transition-colors"
                >
                  Lihat Semua Produk
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  discountPercentage={product.discountPercentage}
                  image={product.images?.[0] ?? "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&q=80&w=600"}
                  brand={product.brand ?? "NEXA"}
                  stock={product.stock}
                  sellerName={product.sellerName ?? ""}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !isLoading && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => updateParams({ page: String(pageParam - 1) })}
                disabled={pageParam === 1}
                className="w-9 h-9 rounded-xs border border-hairline flex items-center justify-center text-ink-secondary hover:text-primary hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - pageParam) <= 2)
                .map((p, idx, arr) => (
                  <span key={p} className="flex items-center gap-2">
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="text-xs text-ink-secondary">...</span>
                    )}
                    <button
                      onClick={() => updateParams({ page: String(p) })}
                      className={`w-9 h-9 rounded-xs text-xs font-bold transition-colors cursor-pointer ${
                        p === pageParam
                          ? "bg-primary text-white"
                          : "border border-hairline text-ink-secondary hover:text-primary hover:border-primary"
                      }`}
                    >
                      {p}
                    </button>
                  </span>
                ))}
              <button
                onClick={() => updateParams({ page: String(pageParam + 1) })}
                disabled={pageParam === totalPages}
                className="w-9 h-9 rounded-xs border border-hairline flex items-center justify-center text-ink-secondary hover:text-primary hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
