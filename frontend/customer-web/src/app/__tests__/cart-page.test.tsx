import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CartPage from "../cart/page";

const { useCartMock, useRemoveCartItemMock, useUpdateCartItemMock, useUserStoreMock } = vi.hoisted(() => ({
  useCartMock: vi.fn(),
  useRemoveCartItemMock: vi.fn(),
  useUpdateCartItemMock: vi.fn(),
  useUserStoreMock: vi.fn(),
}));

vi.mock("@/lib/api/hooks/useCart", () => ({
  useCart: useCartMock,
  useRemoveCartItem: useRemoveCartItemMock,
  useUpdateCartItem: useUpdateCartItemMock,
  normalizeCartItem: (item: { id: string; productId: string; productName: string; productImage: string; currentPrice: number; quantity: number; stock: number; sellerId: string; sellerName: string; priceChanged: boolean; outOfStock: boolean; insufficientStock: boolean }) => ({
    id: item.productId, cartItemId: item.id, name: item.productName, image: item.productImage,
    price: item.currentPrice, qty: item.quantity, stock: item.stock, sellerId: item.sellerId,
    sellerName: item.sellerName, priceChanged: item.priceChanged, outOfStock: item.outOfStock,
    insufficientStock: item.insufficientStock,
  }),
}));
vi.mock("@/lib/store/useUserStore", () => ({ useUserStore: useUserStoreMock }));
vi.mock("@/lib/hooks/useHydrated", () => ({ useHydrated: () => true }));

describe("CartPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUserStoreMock.mockImplementation((selector?: (state: unknown) => unknown) => {
      const state = { user: { id: "customer-1" }, token: "access-token" };
      return selector ? selector(state) : state;
    });
    useCartMock.mockReturnValue({
      data: { data: {
        items: [{
          id: "line-1", productId: "product-1", productName: "Produk API", productImage: "/product.jpg",
          currentPrice: 25000, quantity: 2, stock: 5, sellerId: "seller-1", sellerName: "Toko API",
          priceChanged: false, outOfStock: false, insufficientStock: false,
        }],
        subtotal: 50000,
      } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    useRemoveCartItemMock.mockReturnValue({ mutate: vi.fn(), isPending: false });
    useUpdateCartItemMock.mockReturnValue({ mutate: vi.fn(), isPending: false });
  });

  it("directs voucher entry to checkout and describes server-side validation accurately", () => {
    render(<CartPage />);

    expect(screen.getByText(/Kode voucher dapat dimasukkan pada langkah checkout/)).toBeInTheDocument();
    expect(screen.queryByText(/Voucher belum dapat dipasang/)).not.toBeInTheDocument();
  });
});
