import { describe, expect, it } from "vitest";
import { normalizeCartItem, type ApiCartItem } from "../useCart";

describe("normalizeCartItem", () => {
  it("maps server-authoritative cart values without trusting stale price", () => {
    const item: ApiCartItem = {
      id: "cart-line-1",
      productId: "product-1",
      productName: "Produk",
      productImage: "/produk.jpg",
      price: 100,
      currentPrice: 125,
      quantity: 2,
      stock: 5,
      sellerId: "seller-1",
      sellerName: "Toko",
      priceChanged: true,
      outOfStock: false,
      insufficientStock: false,
    };

    expect(normalizeCartItem(item)).toEqual({
      id: "product-1",
      cartItemId: "cart-line-1",
      name: "Produk",
      image: "/produk.jpg",
      price: 125,
      qty: 2,
      stock: 5,
      sellerId: "seller-1",
      sellerName: "Toko",
      priceChanged: true,
      outOfStock: false,
      insufficientStock: false,
    });
  });
});
