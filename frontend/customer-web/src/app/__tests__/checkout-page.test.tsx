import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import CheckoutPage from "../checkout/page";

const { useCartMock, useAddressesMock, useCreateAddressMock, useUserStoreMock, apiPostMock, replaceMock } = vi.hoisted(() => ({
  useCartMock: vi.fn(),
  useAddressesMock: vi.fn(),
  useCreateAddressMock: vi.fn(),
  useUserStoreMock: vi.fn(),
  apiPostMock: vi.fn(),
  replaceMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: replaceMock }) }));
vi.mock("@/lib/api/hooks/useCart", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/hooks/useCart")>();
  return { ...actual, useCart: useCartMock };
});
vi.mock("@/lib/api/hooks/useProfile", () => ({
  useAddresses: useAddressesMock,
  useCreateAddress: useCreateAddressMock,
}));
vi.mock("@/lib/store/useUserStore", () => ({ useUserStore: useUserStoreMock }));
vi.mock("@/lib/hooks/useHydrated", () => ({ useHydrated: () => true }));
vi.mock("@/lib/api/client", () => ({ apiPost: apiPostMock }));

const cart = {
  items: [{
    id: "cart-line-1", productId: "product-1", productName: "Produk API",
    productImage: "", price: 100000, currentPrice: 120000, quantity: 2,
    stock: 5, sellerId: "seller-1", sellerName: "Toko API",
    priceChanged: true, outOfStock: false, insufficientStock: false,
  }],
  subtotal: 240000,
  totalItems: 2,
  updatedAt: "cart-version-1",
};

const address = {
  id: "address-1", label: "Rumah", receiverName: "Pembeli",
  phoneNumber: "08123456789", street: "Jalan Satu", city: "Jakarta",
  province: "DKI Jakarta", postalCode: "12345", isDefault: true,
};

describe("CheckoutPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUserStoreMock.mockImplementation((selector?: (state: { user: { id: string; name: string }; token: string }) => unknown) => {
      const state = { user: { id: "customer-1", name: "Pembeli" }, token: "access-token" };
      return selector ? selector(state) : state;
    });
    useCartMock.mockReturnValue({ data: { data: cart }, isLoading: false, isError: false });
    useAddressesMock.mockReturnValue({ data: { data: { addresses: [address] } }, isLoading: false, isError: false });
    useCreateAddressMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
  });

  it("renders the server cart and saved address, and never submits an order without shipping validation", () => {
    render(<CheckoutPage />);

    expect(screen.getByText("Produk API × 2")).toBeInTheDocument();
    expect(screen.getAllByText(/240\.000/)).toHaveLength(2);
    expect(screen.getByText(/Jalan Satu, Jakarta/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Checkout belum tersedia" })).toBeDisabled();
    expect(apiPostMock).not.toHaveBeenCalled();
  });

  it("sends only the voucher code for server-side validation", async () => {
    apiPostMock.mockResolvedValue({
      success: true,
      data: { voucher: { code: "HEMAT10" }, discountAmount: 20000 },
    });
    render(<CheckoutPage />);

    fireEvent.change(screen.getByLabelText("Kode voucher"), { target: { value: "hemat10" } });
    fireEvent.click(screen.getByRole("button", { name: "Pakai" }));

    await waitFor(() => expect(apiPostMock).toHaveBeenCalledWith("/vouchers/validate", { code: "HEMAT10" }));
    expect(apiPostMock.mock.calls[0]).toHaveLength(2);
    expect(await screen.findByText("Voucher HEMAT10 tervalidasi untuk keranjang saat ini.")).toBeInTheDocument();
  });

  it("shows the backend validation error without applying a discount", async () => {
    apiPostMock.mockRejectedValue(new Error("Voucher sudah kedaluwarsa."));
    render(<CheckoutPage />);

    fireEvent.change(screen.getByLabelText("Kode voucher"), { target: { value: "EXPIRED" } });
    fireEvent.click(screen.getByRole("button", { name: "Pakai" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Voucher sudah kedaluwarsa.");
    expect(screen.queryByText(/Voucher EXPIRED tervalidasi/)).not.toBeInTheDocument();
  });
});
