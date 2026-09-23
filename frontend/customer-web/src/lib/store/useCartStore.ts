import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  stock: number;
  sellerId: string;
  sellerName: string;
}

export interface AppliedVoucher {
  code: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
}

interface CartStore {
  items: CartItem[];
  appliedVoucher: AppliedVoucher | null;
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  applyVoucher: (voucher: AppliedVoucher | null) => void;
  removeVoucher: () => void;
  getCartTotal: () => number;
  getDiscountAmount: () => number;
  getFinalTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      appliedVoucher: null,

      addItem: (item, qty = 1) => {
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((i) => i.id === item.id);

        if (existingIndex > -1) {
          const updatedItems = [...currentItems];
          const newQty = updatedItems[existingIndex].qty + qty;
          // Clamp to stock
          updatedItems[existingIndex].qty = Math.min(newQty, item.stock);
          set({ items: updatedItems });
        } else {
          set({ items: [...currentItems, { ...item, qty: Math.min(qty, item.stock) }] });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },

      updateQty: (id, qty) => {
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, qty: Math.min(Math.max(1, qty), item.stock) } : item
          ),
        });
      },

      clearCart: () => {
        set({ items: [], appliedVoucher: null });
      },

      applyVoucher: (voucher) => {
        set({ appliedVoucher: voucher });
      },

      removeVoucher: () => {
        set({ appliedVoucher: null });
      },

      getCartTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.qty, 0);
      },

      getDiscountAmount: () => {
        const total = get().getCartTotal();
        const voucher = get().appliedVoucher;
        if (!voucher || total < voucher.minOrderAmount) return 0;

        if (voucher.discountType === "PERCENTAGE") {
          const discount = (total * voucher.discountValue) / 100;
          if (voucher.maxDiscountAmount) {
            return Math.min(discount, voucher.maxDiscountAmount);
          }
          return discount;
        } else {
          return Math.min(voucher.discountValue, total);
        }
      },

      getFinalTotal: () => {
        return Math.max(0, get().getCartTotal() - get().getDiscountAmount());
      },
    }),
    {
      name: "nexa-cart-storage",
    }
  )
);
