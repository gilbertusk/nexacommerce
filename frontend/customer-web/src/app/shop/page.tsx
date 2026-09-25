"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useProducts, useCategories, useBrands } from "@/lib/api/hooks/useProducts";
import ProductCard from "@/components/ui/ProductCard";
import EmptyState from "@/components/ui/EmptyState";
import { ProductGridSkeleton } from "@/components/ui/LoadingSkeleton";

const ITEMS_PER_PAGE = 20;

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const initialSearch = searchParams.get("search") || "";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [sortOption, setSortOption] = useState("newest");
  const [isListView, setIsListView] = useState(false);
  const [page, setPage] = useState(1);

  // Sync query params when they change
  useEffect(() => {
    // This effect intentionally mirrors browser URL navigation into controlled filters.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedCategory(searchParams.get("category") || "");
    setSearchInput(searchParams.get("search") || "");
    setDebouncedSearch(searchParams.get("search") || "");
    setPage(1);
  }, [searchParams]);

  // Debounce search input
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data: productsData, isLoading, isError } = useProducts({
    page,
    limit: ITEMS_PER_PAGE,
    search: debouncedSearch,
    category: selectedCategory,
    brand: selectedBrand,
  });

  const { data: categoriesData } = useCategories();
  const { data: brandsData } = useBrands();

  const products = productsData?.data?.products ?? [];
  const total = productsData?.data?.total ?? 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const categories = Array.isArray(categoriesData?.data) ? categoriesData.data : [];
  const brands = Array.isArray(brandsData?.data) ? brandsData.data : [];

  const handleResetFilters = useCallback(() => {
    setSelectedCategory("");
    setSelectedBrand("");
    setSearchInput("");
    setDebouncedSearch("");
    setSortOption("newest");
    setPage(1);
  }, []);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortOption === "price-asc") return a.price - b.price;
    if (sortOption === "price-desc") return b.price - a.price;
    if (sortOption === "rating") {
      const ra = a.averageRating ?? a.rating ?? 0;
      const rb = b.averageRating ?? b.rating ?? 0;
      return rb - ra;
    }
    if (sortOption === "newest") {
      return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
    }
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Editorial Header */}
      <div className="border-b border-hairline pb-8 mb-8">
        <h1 className="font-serif text-4xl md:text-5xl text-ink-primary mb-2">
          Katalog Produk
        </h1>
        <p className="text-xs text-ink-secondary max-w-xl">
          Jelajahi pilihan lengkap sandang katun linen murni, keramik hand-thrown lokal, dan minyak esensial organik Nusantara.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sticky Filters Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 bg-surface hairline p-6 rounded-sm sticky top-24">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs uppercase font-bold tracking-widest text-ink-primary">
              Filter Pencarian
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-[10px] uppercase font-bold tracking-widest text-primary hover:text-primary-hover cursor-pointer"
            >
              Reset
            </button>
          </div>

          <div className="flex flex-col gap-6">
            {/* Search filter */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-bold tracking-wider text-ink-secondary">
                Kata Kunci
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full bg-paper text-xs text-ink-primary pl-3 pr-8 py-2 rounded-xs border border-transparent focus:border-outline-variant focus:outline-hidden transition-all"
                />
                {searchInput && (
                  <button
                    onClick={() => setSearchInput("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-secondary hover:text-primary text-xs flex items-center cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-ink-secondary">
                Kategori
              </span>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => { setSelectedCategory(""); setPage(1); }}
                  className={`text-left text-xs py-1 px-2 rounded-xs transition-colors flex items-center justify-between ${
                    selectedCategory === ""
                      ? "bg-paper font-semibold text-primary"
                      : "text-ink-primary hover:bg-paper/40"
                  }`}
                >
                  <span>Semua Kategori</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
                    className={`text-left text-xs py-1 px-2 rounded-xs transition-colors flex items-center justify-between ${
                      selectedCategory === cat.slug || selectedCategory.toLowerCase() === cat.name.toLowerCase()
                        ? "bg-paper font-semibold text-primary"
                        : "text-ink-primary hover:bg-paper/40"
                    }`}
                  >
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            {brands.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-ink-secondary">
                  Merek
                </span>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => { setSelectedBrand(""); setPage(1); }}
                    className={`text-left text-xs py-1 px-2 rounded-xs transition-colors flex items-center justify-between ${
                      selectedBrand === ""
                        ? "bg-paper font-semibold text-primary"
                        : "text-ink-primary hover:bg-paper/40"
                    }`}
                  >
                    <span>Semua Merek</span>
                  </button>
                  {brands.map((br) => (
                    <button
                      key={br.id}
                      onClick={() => { setSelectedBrand(br.name); setPage(1); }}
                      className={`text-left text-xs py-1 px-2 rounded-xs transition-colors flex items-center justify-between ${
                        selectedBrand.toLowerCase() === br.name.toLowerCase()
                          ? "bg-paper font-semibold text-primary"
                          : "text-ink-primary hover:bg-paper/40"
                      }`}
                    >
                      <span>{br.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Catalog List section */}
        <div className="flex-grow w-full flex flex-col gap-6">
          {/* Sorting & Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface p-4 hairline rounded-sm">
            <span className="text-xs text-ink-secondary font-mono">
              {isLoading ? (
                <span className="animate-pulse">Memuat produk...</span>
              ) : (
                <>
                  Menampilkan{" "}
                  <span className="text-ink-primary font-semibold font-sans">{sortedProducts.length}</span>
                  {total > 0 && (
                    <> dari <span className="text-ink-primary font-semibold font-sans">{total}</span></>
                  )}{" "}
                  produk
                </>
              )}
            </span>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              {/* Sort Selector */}
              <div className="flex items-center gap-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-ink-secondary">
                  Urutkan:
                </label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-paper text-xs text-ink-primary px-3 py-1.5 rounded-xs border border-transparent focus:outline-hidden focus:border-outline-variant font-medium cursor-pointer"
                >
                  <option value="newest">Terbaru</option>
                  <option value="price-asc">Harga Terendah</option>
                  <option value="price-desc">Harga Tertinggi</option>
                  <option value="rating">Rating Tertinggi</option>
                </select>
              </div>

              {/* View Grid/List toggle */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsListView(false)}
                  className={`w-8 h-8 flex items-center justify-center rounded-xs transition-colors cursor-pointer ${
                    !isListView ? "bg-paper text-primary" : "text-ink-secondary hover:bg-paper/50"
                  }`}
                  aria-label="Grid View"
                >
                  <span className="material-symbols-outlined text-lg">grid_view</span>
                </button>
                <button
                  onClick={() => setIsListView(true)}
                  className={`w-8 h-8 flex items-center justify-center rounded-xs transition-colors cursor-pointer ${
                    isListView ? "bg-paper text-primary" : "text-ink-secondary hover:bg-paper/50"
                  }`}
                  aria-label="List View"
                >
                  <span className="material-symbols-outlined text-lg">view_list</span>
                </button>
              </div>
            </div>
          </div>

          {/* Error State */}
          {isError && (
            <div className="bg-rose-50 border border-rose-100 text-rose-800 text-xs p-4 rounded-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              <span>Gagal memuat produk. Silakan coba kembali.</span>
            </div>
          )}

          {/* Grid or List Render */}
          {isLoading ? (
            <ProductGridSkeleton count={8} />
          ) : sortedProducts.length === 0 ? (
            <EmptyState
              icon="search_off"
              title="Produk Tidak Ditemukan"
              description="Kami tidak menemukan produk yang cocok dengan filter atau kata kunci pencarian Anda. Silakan reset filter dan coba lagi."
              actionLabel="Reset Semua Filter"
              actionHref="/shop"
            />
          ) : isListView ? (
            <div className="flex flex-col gap-4">
              {sortedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex bg-surface hairline rounded-sm p-4 gap-4 md:gap-6 hover:shadow-xs transition-shadow relative"
                >
                  <div className="w-24 sm:w-32 aspect-[4/5] bg-paper overflow-hidden rounded-xs shrink-0 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.discountPercentage && product.discountPercentage > 0 && (
                      <span className="absolute top-2 left-2 bg-primary text-white text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-sm">
                        -{product.discountPercentage}%
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col flex-grow justify-between py-1">
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-ink-secondary">
                        {product.brand}
                      </span>
                      <h3 className="font-serif text-lg md:text-xl text-ink-primary mt-0.5 hover:text-primary transition-colors">
                        <Link href={`/product/${product.id}`}>{product.name}</Link>
                      </h3>
                      <p className="text-xs text-ink-secondary leading-relaxed mt-2 line-clamp-2 max-w-xl">
                        {product.description}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-4">
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-sm font-semibold text-primary tabular-nums">
                          {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(product.price)}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="font-mono text-xs text-ink-secondary line-through tabular-nums">
                            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(product.originalPrice)}
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/product/${product.id}`}
                        className="inline-flex items-center gap-1 border border-ink-primary hover:bg-ink-primary hover:text-surface text-[10px] uppercase font-bold tracking-widest px-4 py-2 rounded-xs transition-colors"
                      >
                        Detail
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  discountPercentage={product.discountPercentage}
                  image={product.images[0]}
                  brand={product.brand}
                  stock={product.stock}
                  sellerName={product.sellerName ?? ""}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4 border-t border-hairline mt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-xs border border-hairline text-ink-secondary hover:bg-paper disabled:opacity-40 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= page - 1 && pageNum <= page + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 flex items-center justify-center rounded-xs text-xs font-mono font-bold transition-colors cursor-pointer ${
                        page === pageNum
                          ? "bg-primary text-white"
                          : "border border-hairline text-ink-secondary hover:bg-paper"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                if (pageNum === page - 2 || pageNum === page + 2) {
                  return (
                    <span key={pageNum} className="text-xs text-ink-secondary">
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-xs border border-hairline text-ink-secondary hover:bg-paper disabled:opacity-40 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-16"><ProductGridSkeleton count={8} /></div>}>
      <ShopContent />
    </Suspense>
  );
}
