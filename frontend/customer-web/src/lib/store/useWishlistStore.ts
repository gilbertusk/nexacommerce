import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  sellerName: string;
}

interface WishlistStore {
  items: WishlistItem[];
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggleWishlist: (item) => {
        const currentItems = get().items;
        const exists = currentItems.some((i) => i.id === item.id);
        if (exists) {
          set({ items: currentItems.filter((i) => i.id !== item.id) });
        } else {
          set({ items: [...currentItems, item] });
        }
      },
      isInWishlist: (id) => {
        return get().items.some((item) => item.id === id);
      },
      clearWishlist: () => {
        set({ items: [] });
      },
    }),
    {
      name: "nexa-wishlist-storage",
    }
  )
);
