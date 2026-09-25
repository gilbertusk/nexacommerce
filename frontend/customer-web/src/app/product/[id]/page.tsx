"use client";

import { use } from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useProduct } from "@/lib/api/hooks/useProducts";
import { useProductReviews } from "@/lib/api/hooks/useReviews";
import ReviewReportAction from "@/components/ui/ReviewReportAction";
import { formatIDR } from "@/lib/utils/format";
import { useAddCartItem } from "@/lib/api/hooks/useCart";
import { useUserStore } from "@/lib/store/useUserStore";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import QuantityStepper from "@/components/ui/QuantityStepper";
import EmptyState from "@/components/ui/EmptyState";
import { Skeleton, TextSkeleton } from "@/components/ui/LoadingSkeleton";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = use(params);

  const [activeImage, setActiveImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "shipping" | "reviews">(
    searchParams.get("tab") === "reviews" ? "reviews" : "desc"
  );
  const [addedToCart, setAddedToCart] = useState(false);
  const [cartError, setCartError] = useState("");

  const { data: productData, isLoading, isError } = useProduct(id);
  const { data: reviewsData, isLoading: reviewsLoading } = useProductReviews(id);

  const addCartItem = useAddCartItem();
  const { user } = useUserStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const product = productData?.data?.product ?? null;
  const reviews = reviewsData?.data?.reviews ?? [];

  const displayImage = activeImage || (product?.images?.[0] ?? "");
  const isWishlisted = product ? isInWishlist(product.id) : false;

  const productRating = product?.averageRating ?? product?.rating ?? 0;
  const productReviewsCount = product?.totalReviews ?? product?.reviewsCount ?? reviews.length;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 animate-pulse">
        <div className="flex flex-col gap-4">
          <Skeleton className="w-full aspect-[4/5] rounded-xs" />
          <div className="flex gap-2">
            <Skeleton className="w-16 h-16 rounded-xs" />
            <Skeleton className="w-16 h-16 rounded-xs" />
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div>
            <Skeleton className="h-4 w-1/4 mb-2" />
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/3" />
          </div>
          <TextSkeleton lines={5} />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="py-20">
        <EmptyState
          icon="error"
          title="Produk Tidak Ditemukan"
          description="Produk yang Anda cari tidak ada atau telah dihapus dari sistem kami."
          actionLabel="Kembali Belanja"
          actionHref="/shop"
        />
      </div>
    );
  }

  const handleAddToCart = async () => {
    setCartError("");
    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/product/${product.id}`)}`);
      return false;
    }
    try {
      await addCartItem.mutateAsync({ productId: product.id, quantity });
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
      return true;
    } catch (error) {
      setCartError(error instanceof Error ? error.message : "Produk gagal ditambahkan ke keranjang.");
      return false;
    }
  };

  const handleBuyNow = async () => {
    if (await handleAddToCart()) router.push("/checkout");
  };

  const handleWishlistToggle = () => {
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      stock: product.stock,
      sellerName: product.sellerName ?? "",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="text-xs text-ink-secondary mb-8 flex gap-2 items-center">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <Link href="/shop" className="hover:text-primary transition-colors">Belanja</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-ink-primary font-semibold truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Grid Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start mb-16">
        {/* Left Side: Photo Gallery */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-[4/5] bg-paper overflow-hidden hairline rounded-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayImage}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
            {product.discountPercentage && product.discountPercentage > 0 && (
              <span className="absolute top-4 left-4 bg-primary text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm">
                -{product.discountPercentage}%
              </span>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 aspect-[4/5] bg-paper overflow-hidden rounded-xs border-2 shrink-0 transition-colors cursor-pointer ${
                    displayImage === img ? "border-primary" : "border-transparent hover:border-outline-variant"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`${product.name} thumb ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Info Panel */}
        <div className="flex flex-col">
          {/* Brand & Stars Row */}
          <div className="flex justify-between items-center gap-4 mb-2">
            <span className="text-xs uppercase font-bold tracking-widest text-ink-secondary">
              {product.brand}
            </span>
            {productRating > 0 && (
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-amber-500 fill-amber-500">star</span>
                <span className="text-xs font-bold text-ink-primary font-mono">{productRating.toFixed(1)}</span>
                <span className="text-[10px] text-ink-secondary">({productReviewsCount} Ulasan)</span>
              </div>
            )}
          </div>

          {/* Product Title */}
          <h1 className="font-serif text-3xl md:text-4xl text-ink-primary mb-4 leading-tight">
            {product.name}
          </h1>

          {/* Price Panel */}
          <div className="bg-paper p-4 rounded-sm hairline flex items-baseline gap-3 mb-6">
            <span className="font-mono text-2xl font-bold text-primary tabular-nums">
              {formatIDR(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="font-mono text-sm text-ink-secondary line-through tabular-nums">
                  {formatIDR(product.originalPrice)}
                </span>
                <span className="bg-primary/10 text-primary text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm">
                  Hemat {product.discountPercentage}%
                </span>
              </>
            )}
          </div>

          {/* Seller Card */}
          {product.sellerName && (
            <div className="flex items-center gap-3 bg-surface p-3.5 rounded-sm border border-hairline mb-6">
              <div className="w-10 h-10 rounded-full bg-paper flex items-center justify-center text-ink-secondary border border-hairline">
                <span className="material-symbols-outlined">storefront</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-ink-secondary">Penjual Resmi</span>
                <span className="text-xs font-semibold text-ink-primary">{product.sellerName}</span>
              </div>
            </div>
          )}

          {/* Stock Status */}
          <div className="mb-8">
            {product.stock === 0 ? (
              <div className="bg-rose-50 text-rose-800 border border-rose-100 p-3 text-xs rounded-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                <span>Stok habis. Produk ini sedang tidak tersedia untuk dibeli.</span>
              </div>
            ) : product.stock <= 5 ? (
              <div className="bg-amber-50 text-amber-800 border border-amber-100/60 p-3 text-xs rounded-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">warning</span>
                <span>Stok kritis! Tersisa hanya <strong className="font-mono font-bold">{product.stock}</strong> unit lagi.</span>
              </div>
            ) : (
              <span className="text-xs text-emerald-800 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>Tersedia <strong className="font-mono font-bold text-ink-primary">{product.stock}</strong> unit di toko</span>
              </span>
            )}
          </div>

          {/* Stepper + CTA */}
          {product.stock > 0 && (
            <div className="flex flex-col gap-4 border-t border-hairline pt-6">
              <div className="flex items-center gap-4">
                <span className="text-xs uppercase font-bold tracking-wider text-ink-secondary">Jumlah</span>
                <QuantityStepper
                  value={quantity}
                  onChange={setQuantity}
                  max={product.stock}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {cartError && <p role="alert" className="text-xs text-rose-800 mb-3">{cartError}</p>}
                <button
                  onClick={handleAddToCart}
                  disabled={addCartItem.isPending}
                  className={`font-bold text-xs uppercase tracking-widest px-6 py-4 rounded-xs hairline transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                    addedToCart
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-surface hover:bg-paper text-ink-primary"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">
                    {addedToCart ? "check" : "shopping_bag"}
                  </span>
                  {addCartItem.isPending ? "Menambahkan..." : addedToCart ? "Ditambahkan!" : "Keranjang"}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={addCartItem.isPending}
                  className="bg-primary hover:bg-primary-hover text-white font-bold text-xs uppercase tracking-widest px-6 py-4 rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  Beli Sekarang
                </button>
              </div>

              <button
                onClick={handleWishlistToggle}
                className={`mt-2 text-xs font-semibold flex items-center justify-center gap-1.5 py-2.5 rounded-xs transition-colors border hover:bg-paper/40 cursor-pointer ${
                  isWishlisted
                    ? "border-primary text-primary bg-primary/5"
                    : "border-hairline text-ink-secondary"
                }`}
              >
                <span
                  className="material-symbols-outlined text-lg"
                  style={{ fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}
                >
                  favorite
                </span>
                {isWishlisted ? "Tersimpan di Wishlist" : "Simpan Ke Wishlist"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Section */}
      <div className="border-t border-hairline pt-12">
        <div className="flex gap-8 border-b border-hairline mb-8 overflow-x-auto no-scrollbar">
          {(["desc", "specs", "shipping", "reviews"] as const).map((tab) => {
            const labels: Record<string, string> = {
              desc: "Deskripsi",
              specs: "Spesifikasi",
              shipping: "Informasi Pengiriman",
              reviews: `Ulasan (${productReviewsCount})`,
            };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-xs uppercase font-bold tracking-widest border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab ? "border-primary text-primary" : "border-transparent text-ink-secondary"
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        <div className="min-h-48">
          {activeTab === "desc" && (
            <div className="max-w-3xl">
              <p className="text-sm text-ink-secondary leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {activeTab === "specs" && (
            <div className="max-w-2xl">
              {product.specifications && product.specifications.length > 0 ? (
                <div className="bg-surface hairline rounded-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <tbody>
                      {product.specifications.map((spec, i) => (
                        <tr key={i} className="border-b border-hairline last:border-0">
                          <td className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-ink-secondary bg-paper/40 w-1/3">
                            {spec.label}
                          </td>
                          <td className="px-4 py-3 text-xs text-ink-primary">
                            {spec.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-ink-secondary">Spesifikasi produk belum tersedia.</p>
              )}
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="max-w-3xl flex flex-col gap-4 text-sm text-ink-secondary leading-relaxed">
              <h5 className="font-semibold text-ink-primary">Informasi biaya dan estimasi</h5>
              <p role="status" className="rounded-xs border border-amber-200 bg-amber-50 p-4 text-amber-900">
                Tarif dan estimasi pengiriman belum dapat dikonfirmasi untuk produk dan alamat tujuan ini. Checkout sementara belum tersedia karena server belum memvalidasi ongkir berdasarkan rute dan berat barang. Kami tidak akan menampilkan tarif, kurir, atau jadwal yang belum terkonfirmasi.
              </p>
            </div>
          )}

          {activeTab === "reviews" && (
            <div id="reviews" className="max-w-3xl flex flex-col gap-6">
              {reviewsLoading ? (
                <div className="flex flex-col gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="border-b border-hairline pb-6 flex flex-col gap-2 animate-pulse">
                      <div className="h-3 w-1/4 bg-paper rounded-xs" />
                      <div className="h-3 w-1/3 bg-paper rounded-xs" />
                      <div className="h-12 w-full bg-paper rounded-xs" />
                    </div>
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8 bg-surface hairline rounded-xs">
                  <p className="text-xs text-ink-secondary">Belum ada ulasan untuk produk ini.</p>
                </div>
              ) : (
                reviews.map((rev) => (
                  <div id={`review-${rev.id}`} key={rev.id} className="border-b border-hairline pb-6 last:border-0 last:pb-0 flex flex-col gap-2">
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-xs font-bold text-ink-primary">
                        {rev.userName ?? "Pengguna Anonim"}
                      </span>
                      <span className="font-mono text-[10px] text-ink-secondary/70">
                        {rev.date ?? rev.createdAt ?? ""}
                      </span>
                    </div>

                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={`material-symbols-outlined text-sm ${
                            i < rev.rating ? "text-amber-500 fill-amber-500" : "text-outline-variant"
                          }`}
                        >
                          star
                        </span>
                      ))}
                    </div>

                    <p className="text-xs text-ink-secondary leading-relaxed mt-1">
                      {rev.comment}
                    </p>
                    <ReviewReportAction review={rev} productId={id} />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
