import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PaymentPage from "../payment/[id]/page";

const { useOrderMock, usePaymentStatusMock, useUserStoreMock } = vi.hoisted(() => ({
  useOrderMock: vi.fn(),
  usePaymentStatusMock: vi.fn(),
  useUserStoreMock: vi.fn(),
}));

vi.mock("@/lib/api/hooks/useOrders", () => ({ useOrder: useOrderMock }));
vi.mock("@/lib/api/hooks/usePayment", () => ({ usePaymentStatus: usePaymentStatusMock }));
vi.mock("@/lib/store/useUserStore", () => ({ useUserStore: useUserStoreMock }));
vi.mock("@/lib/hooks/useHydrated", () => ({ useHydrated: () => true }));
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, use: () => ({ id: "order-1" }) };
});

const order = {
  id: "order-1",
  status: "PENDING_PAYMENT",
  total: 125000,
  items: [],
};

function renderPaymentPage() {
  return render(<PaymentPage params={Promise.resolve({ id: "order-1" })} />);
}

describe("PaymentPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUserStoreMock.mockImplementation((selector?: (state: unknown) => unknown) => {
      const state = { user: { id: "customer-1" }, token: "access-token" };
      return selector ? selector(state) : state;
    });
    useOrderMock.mockReturnValue({ data: { data: { order } }, isLoading: false, isError: false, refetch: vi.fn() });
  });

  it("links pending payments only to the provider URL returned by the API", async () => {
    usePaymentStatusMock.mockReturnValue({
      data: { data: { status: "PENDING", amount: 125000, paymentUrl: "https://app.midtrans.com/snap/v4/test-token" } },
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    renderPaymentPage();

    const link = await screen.findByRole("link", { name: /Buka Pembayaran Resmi/ });
    expect(link).toHaveAttribute("href", "https://app.midtrans.com/snap/v4/test-token");
    expect(screen.getByText("Selesaikan Pembayaran")).toBeInTheDocument();
    expect(screen.queryByText(/Pembayaran telah dikonfirmasi/)).not.toBeInTheDocument();
  });

  it("does not fabricate a payment method or success state when a pending payment has no URL", async () => {
    usePaymentStatusMock.mockReturnValue({
      data: { data: { status: "PENDING", amount: 125000, paymentUrl: null } },
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    renderPaymentPage();

    expect(await screen.findByText(/Tautan pembayaran resmi belum tersedia/)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Buka Pembayaran Resmi/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/Pembayaran Berhasil/)).not.toBeInTheDocument();
  });

  it("shows confirmed success only when the backend reports a paid status", async () => {
    usePaymentStatusMock.mockReturnValue({
      data: { data: { status: "PAID", amount: 125000, paymentUrl: null } },
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    renderPaymentPage();

    expect(await screen.findByText("Pembayaran Berhasil")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Pembayaran telah dikonfirmasi oleh penyedia pembayaran.");
    expect(screen.queryByRole("link", { name: /Buka Pembayaran Resmi/ })).not.toBeInTheDocument();
  });
});
