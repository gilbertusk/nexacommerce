import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import CheckoutPage from "../checkout/page";

const {
  useCartMock,
  useAddressesMock,
  useCreateAddressMock,
  useUserStoreMock,
  apiPostMock,
  replaceMock,
  pushMock,
  useCouriersMock,
  requestQuoteMock,
  createOrderMock,
} = vi.hoisted(() => ({
  useCartMock: vi.fn(),
  useAddressesMock: vi.fn(),
  useCreateAddressMock: vi.fn(),
  useUserStoreMock: vi.fn(),
  apiPostMock: vi.fn(),
  replaceMock: vi.fn(),
  pushMock: vi.fn(),
  useCouriersMock: vi.fn(),
  requestQuoteMock: vi.fn(),
  createOrderMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: replaceMock, push: pushMock }) }));
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
vi.mock("@/lib/api/hooks/useShipping", () => ({ useShippingCouriers: useCouriersMock }));
vi.mock("@/lib/api/hooks/useShippingQuote", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/hooks/useShippingQuote")>();
  return { ...actual, useRequestShippingQuote: requestQuoteMock };
});
vi.mock("@/lib/api/hooks/useOrders", () => ({ useCreateOrder: createOrderMock }));

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

const couriers = [{ id: "jne", name: "JNE", services: [{ service: "REG", cost: 0 }] }];

const quote = {
  quoteId: "11111111-1111-4111-8111-111111111111",
  totalCost: 18000,
  expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  shipments: [{
    sellerId: "seller-1", storeName: "Toko API", originCity: "Bandung",
    originProvince: "Jawa Barat", courierCode: "jne", courierName: "JNE",
    serviceCode: "REG", serviceName: "REG", weightGrams: 1000,
    cost: 18000, estimatedDays: "2-3",
  }],
};

/** Choose a courier for the single seller and request a quote. */
async function requestQuote() {
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "jne::REG" } });
  fireEvent.click(screen.getByRole("button", { name: "Hitung ongkos kirim" }));
}

describe("CheckoutPage", () => {
  let quoteMutate: ReturnType<typeof vi.fn>;
  let orderMutate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    quoteMutate = vi.fn().mockResolvedValue(quote);
    orderMutate = vi.fn().mockResolvedValue({ data: { order: { id: "order-1" }, payment: { id: "pay-1" } } });
    useCouriersMock.mockReturnValue({ data: { data: { couriers } }, isLoading: false, isError: false });
    requestQuoteMock.mockReturnValue({ mutateAsync: quoteMutate, isPending: false });
    createOrderMock.mockReturnValue({ mutateAsync: orderMutate, isPending: false });
    useUserStoreMock.mockImplementation((selector?: (state: { user: { id: string; name: string }; token: string }) => unknown) => {
      const state = { user: { id: "customer-1", name: "Pembeli" }, token: "access-token" };
      return selector ? selector(state) : state;
    });
    useCartMock.mockReturnValue({ data: { data: cart }, isLoading: false, isError: false });
    useAddressesMock.mockReturnValue({ data: { data: { addresses: [address] } }, isLoading: false, isError: false });
    useCreateAddressMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
  });

  it("renders the server cart and saved address", () => {
    render(<CheckoutPage />);

    expect(screen.getByText("Produk API × 2")).toBeInTheDocument();
    expect(screen.getByText(/Jalan Satu, Jakarta/)).toBeInTheDocument();
  });

  it("cannot place an order before shipping has been priced by the server", () => {
    render(<CheckoutPage />);

    expect(screen.getByRole("button", { name: "Buat Pesanan" })).toBeDisabled();
    expect(screen.getByText("Belum dihitung")).toBeInTheDocument();
    expect(orderMutate).not.toHaveBeenCalled();
  });

  it("asks the server to price one shipment per seller", async () => {
    render(<CheckoutPage />);

    await requestQuote();

    await waitFor(() => expect(quoteMutate).toHaveBeenCalledWith({
      addressId: "address-1",
      selections: [{ sellerId: "seller-1", courierCode: "jne", serviceCode: "REG" }],
    }));
    expect((await screen.findAllByText(/18\.000/)).length).toBeGreaterThan(0);
  });

  it("submits only the quote id, never a shipping price", async () => {
    render(<CheckoutPage />);
    await requestQuote();
    await screen.findAllByText(/18\.000/);

    fireEvent.click(screen.getByRole("button", { name: "Buat Pesanan" }));

    await waitFor(() => expect(orderMutate).toHaveBeenCalledWith({
      shippingAddressId: "address-1",
      shippingQuoteId: quote.quoteId,
    }));
    const submitted = orderMutate.mock.calls[0][0];
    expect(submitted).not.toHaveProperty("shippingCost");
    expect(submitted).not.toHaveProperty("courierName");
  });

  it("discards the quote when the courier choice changes", async () => {
    render(<CheckoutPage />);
    await requestQuote();
    await screen.findAllByText(/18\.000/);

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "" } });

    // A price obtained for a different choice must not be carried forward.
    expect(screen.getByText("Belum dihitung")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Buat Pesanan" })).toBeDisabled();
  });

  it("explains an unverified seller origin instead of showing a generic failure", async () => {
    quoteMutate.mockRejectedValue(Object.assign(new Error("blocked"), {
      reason: "SELLER_ORIGIN_UNVERIFIED",
    }));
    render(<CheckoutPage />);

    await requestQuote();

    expect(await screen.findByText(/belum mengonfirmasi lokasi pengiriman/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Buat Pesanan" })).toBeDisabled();
  });

  it("clears the quote when the server rejects the order", async () => {
    orderMutate.mockRejectedValue(new Error("Shipping quote has expired; request a new quote"));
    render(<CheckoutPage />);
    await requestQuote();
    await screen.findAllByText(/18\.000/);

    fireEvent.click(screen.getByRole("button", { name: "Buat Pesanan" }));

    expect(await screen.findByText(/has expired/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Buat Pesanan" })).toBeDisabled();
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
