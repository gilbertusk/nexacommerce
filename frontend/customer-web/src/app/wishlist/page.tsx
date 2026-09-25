"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import { useAddCartItem } from "@/lib/api/hooks/useCart";
import { useUserStore } from "@/lib/store/useUserStore";
import EmptyState from "@/components/ui/EmptyState";
import { formatIDR } from "@/lib/utils/format";
import { useState } from "react";
import { useHydrated } from "@/lib/hooks/useHydrated";

export default function WishlistPage() {
  const router = useRouter();
  const { items, toggleWishlist } = useWishlistStore();
  const { user } = useUserStore();
  const addCartItem = useAddCartItem();
  const mounted = useHydrated();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [cartError, setCartError] = useState("");

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="border-b border-hairline pb-8 mb-8">
          <h1 className="font-serif text-4xl md:text-5xl text-ink-primary">Favorit Saya</h1>
        </div>
        <div className="h-64 animate-pulse bg-surface border border-hairline rounded-sm" />
      </div>
    );
  }

  const handleAddToCart = async (item: typeof items[0]) => {
    setCartError("");
    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent("/wishlist")}`);
      return;
    }
    try {
      await addCartItem.mutateAsync({ productId: item.id, quantity: 1 });
    } catch (error) {
      setCartError(error instanceof Error ? error.message : "Produk gagal ditambahkan ke keranjang.");
      return;
    }
    setAddedIds((prev) => new Set(prev).add(item.id));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }, 2000);
  };

  const handleRemove = (item: typeof items[0]) => {
    toggleWishlist(item);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <div className="border-b border-hairline pb-8 mb-8">
        <h1 className="font-serif text-4xl md:text-5xl text-ink-primary mb-2">Favorit Saya</h1>
        <p className="text-xs text-ink-secondary">
          Daftar produk kurasi yang Anda sukai dan rencanakan untuk dibeli di kemudian hari.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon="favorite"
            title="Wishlist Kosong"
            description="Anda belum menambahkan produk apa pun ke daftar favorit Anda. Mulai cari produk dan klik ikon hati!"
            actionLabel="Cari Produk Sekarang"
            actionHref="/shop"
          />
        </div>
      ) : (
        <>
          {cartError && <p role="alert" className="text-xs text-rose-800 mb-4">{cartError}</p>}
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs text-ink-secondary font-mono">
              <span className="font-semibold text-ink-primary font-sans">{items.length}</span> produk tersimpan
            </p>
            <button
              onClick={() => items.forEach((item) => toggleWishlist(item))}
              className="text-[10px] uppercase font-bold tracking-widest text-rose-700 hover:text-rose-900 transition-colors cursor-pointer"
            >
              Hapus Semua
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => {
              const isAdded = addedIds.has(item.id);
              const isOutOfStock = item.stock === 0;

              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col bg-surface hairline transition-all duration-300 hover:shadow-sm rounded-xs overflow-hidden"
                >
                  {/* Product Image */}
                  <Link href={`/product/${item.id}`} className="block relative aspect-[4/5] overflow-hidden bg-paper">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-ink-primary/40 backdrop-blur-xs flex items-center justify-center">
                        <span className="bg-surface text-ink-primary text-xs uppercase font-bold tracking-widest px-3 py-1.5 rounded-sm hairline">
                          Habis
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Remove from Wishlist button */}
                  <button
                    onClick={() => handleRemove(item)}
                    className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-surface hairline flex items-center justify-center text-primary hover:text-rose-700 transition-colors cursor-pointer"
                    aria-label="Hapus dari wishlist"
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      favorite
                    </span>
                  </button>

                  {/* Info Container */}
                  <div className="flex flex-col p-4 flex-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-ink-secondary mb-1">
                      {item.sellerName}
                    </span>
                    <Link href={`/product/${item.id}`} className="hover:text-primary transition-colors mb-2">
                      <h3 className="font-serif text-lg leading-tight text-ink-primary line-clamp-1">
                        {item.name}
                      </h3>
                    </Link>

                    <div className="mt-auto flex items-baseline gap-2 flex-wrap mb-3">
                      <span className="font-mono text-sm font-semibold text-primary tabular-nums">
                        {formatIDR(item.price)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={addCartItem.isPending || isOutOfStock}
                        className={`w-full text-[10px] uppercase font-bold tracking-widest py-2.5 rounded-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                          isAdded
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : isOutOfStock
                            ? "bg-paper text-ink-secondary border border-hairline opacity-50 cursor-not-allowed"
                            : "bg-primary hover:bg-primary-hover text-white"
                        }`}
                      >
                        <span className="material-symbols-outlined text-xs">
                          {isAdded ? "check" : "shopping_bag"}
                        </span>
                        {isAdded ? "Ditambahkan!" : isOutOfStock ? "Stok Habis" : "Tambah ke Keranjang"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
