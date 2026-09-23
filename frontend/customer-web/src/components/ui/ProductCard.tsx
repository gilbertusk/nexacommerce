"use client";

import Link from "next/link";
import { formatIDR } from "@/lib/utils/format";
import { useWishlistStore, WishlistItem } from "@/lib/store/useWishlistStore";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  image: string;
  brand: string;
  stock: number;
  sellerName: string;
}

export default function ProductCard({
  id,
  name,
  price,
  originalPrice,
  discountPercentage,
  image,
  brand,
  stock,
  sellerName,
}: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const liked = isInWishlist(id);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const wishlistItem: WishlistItem = {
      id,
      name,
      price,
      image,
      stock,
      sellerName,
    };
    toggleWishlist(wishlistItem);
  };

  return (
    <div className="group relative flex flex-col bg-surface hairline transition-all duration-300 hover:shadow-sm">
      {/* Product Image Frame (Aspect 4:5) */}
      <Link href={`/product/${id}`} className="block relative aspect-[4/5] overflow-hidden bg-paper w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Discount Badge */}
        {discountPercentage && discountPercentage > 0 && (
          <div className="absolute top-3 left-3 bg-primary text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm">
            -{discountPercentage}%
          </div>
        )}

        {/* Out of Stock Overlay */}
        {stock === 0 && (
          <div className="absolute inset-0 bg-ink-primary/40 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-surface text-ink-primary text-xs uppercase font-bold tracking-widest px-3 py-1.5 rounded-sm hairline">
              Habis
            </span>
          </div>
        )}
      </Link>

      {/* Action Buttons: Wishlist */}
      <button
        onClick={handleLike}
        className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-surface hairline flex items-center justify-center text-ink-primary hover:text-primary transition-colors cursor-pointer"
        aria-label="Add to wishlist"
      >
        <span
          className="material-symbols-outlined"
          style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}
        >
          {liked ? "favorite" : "favorite"}
        </span>
      </button>

      {/* Info Container */}
      <div className="flex flex-col p-4 flex-1">
        <span className="text-[10px] uppercase font-bold tracking-wider text-ink-secondary mb-1">
          {brand}
        </span>
        <Link href={`/product/${id}`} className="hover:text-primary transition-colors mb-2">
          <h3 className="font-serif text-lg leading-tight text-ink-primary line-clamp-1">
            {name}
          </h3>
        </Link>
        
        {/* Price Row */}
        <div className="mt-auto flex items-baseline gap-2 flex-wrap">
          <span className="font-mono text-sm font-semibold text-primary tabular-nums">
            {formatIDR(price)}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="font-mono text-xs text-ink-secondary line-through tabular-nums">
              {formatIDR(originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
