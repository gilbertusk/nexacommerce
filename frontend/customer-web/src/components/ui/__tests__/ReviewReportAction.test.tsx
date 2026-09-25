import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ReviewReportAction from "../ReviewReportAction";

const { mutateMock, useReportReviewMock, useUserStoreMock } = vi.hoisted(() => ({
  mutateMock: vi.fn(),
  useReportReviewMock: vi.fn(),
  useUserStoreMock: vi.fn(),
}));

vi.mock("@/lib/api/hooks/useReviews", () => ({
  useReportReview: useReportReviewMock,
}));

vi.mock("@/lib/store/useUserStore", () => ({
  useUserStore: useUserStoreMock,
}));

describe("ReviewReportAction", () => {
  beforeEach(() => {
    mutateMock.mockReset();
    useReportReviewMock.mockReset();
    useReportReviewMock.mockReturnValue({ mutate: mutateMock, isPending: false, isSuccess: false, isError: false });
    useUserStoreMock.mockImplementation((selector: (state: unknown) => unknown) => selector({ user: { id: "customer-2" } }));
  });

  it("submits the selected report reason and optional description", () => {
    render(<ReviewReportAction productId="product-1" review={{
      id: "review-1", productId: "product-1", userId: "customer-1", userName: "Customer 1", rating: 1, comment: "Review text",
    }} />);

    fireEvent.click(screen.getByRole("button", { name: "Laporkan ulasan" }));
    fireEvent.change(screen.getByLabelText("Alasan laporan"), { target: { value: "FAKE" } });
    fireEvent.change(screen.getByLabelText("Keterangan (opsional)"), { target: { value: "Tidak sesuai transaksi" } });
    fireEvent.click(screen.getByRole("button", { name: "Kirim laporan" }));

    expect(mutateMock).toHaveBeenCalledWith({
      reviewId: "review-1",
      reason: "FAKE",
      description: "Tidak sesuai transaksi",
    });
  });

  it("does not let a customer report their own review", () => {
    useUserStoreMock.mockImplementation((selector: (state: unknown) => unknown) => selector({ user: { id: "customer-1" } }));
    render(<ReviewReportAction productId="product-1" review={{
      id: "review-1", productId: "product-1", userId: "customer-1", userName: "Customer 1", rating: 5, comment: "Review text",
    }} />);

    expect(screen.queryByRole("button", { name: "Laporkan ulasan" })).not.toBeInTheDocument();
  });
});
