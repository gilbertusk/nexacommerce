import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import OrderComplaintPanel from "../OrderComplaintPanel";

const { apiGetMock, apiPostMock } = vi.hoisted(() => ({ apiGetMock: vi.fn(), apiPostMock: vi.fn() }));

vi.mock("@/lib/api/client", () => ({ apiGet: apiGetMock, apiPost: apiPostMock }));

function renderPanel(orderStatus = "DELIVERED") {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <OrderComplaintPanel orderId="order-1" orderStatus={orderStatus} />
    </QueryClientProvider>,
  );
}

describe("OrderComplaintPanel", () => {
  beforeEach(() => {
    apiGetMock.mockReset();
    apiPostMock.mockReset();
    apiGetMock.mockResolvedValue({ data: null });
    apiPostMock.mockResolvedValue({ success: true });
  });

  it("submits the selected category and trimmed description through the order API", async () => {
    renderPanel();
    fireEvent.change(await screen.findByLabelText("Kategori komplain"), { target: { value: "DAMAGED" } });
    fireEvent.change(screen.getByLabelText("Keterangan"), { target: { value: "  Kemasan rusak  " } });
    fireEvent.click(screen.getByRole("button", { name: "Kirim Komplain" }));

    await waitFor(() => expect(apiPostMock).toHaveBeenCalledWith("/orders/order-1/complaints", {
      category: "DAMAGED",
      description: "Kemasan rusak",
    }));
    expect(await screen.findByRole("status")).toHaveTextContent("Komplain terkirim");
  });

  it("displays an existing complaint and admin response instead of a second form", async () => {
    apiGetMock.mockResolvedValue({ data: {
      id: "complaint-1", category: "DAMAGED", description: "Kemasan rusak", status: "IN_REVIEW", adminNote: "Sedang diperiksa",
    } });
    renderPanel("COMPLETED");

    expect(await screen.findByRole("region", { name: "Status komplain pesanan" })).toHaveTextContent("IN_REVIEW");
    expect(screen.getByText("Catatan admin: Sedang diperiksa")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Kirim Komplain" })).not.toBeInTheDocument();
  });

  it("does not show or request a complaint for an undelivered order", () => {
    renderPanel("PAID");

    expect(apiGetMock).not.toHaveBeenCalled();
    expect(screen.queryByText("Komplain Pesanan")).not.toBeInTheDocument();
  });
});
