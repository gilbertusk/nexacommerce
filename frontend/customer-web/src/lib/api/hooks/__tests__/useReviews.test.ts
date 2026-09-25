import { describe, expect, it } from "vitest";
import { normalizeReview } from "../useReviews";

describe("normalizeReview", () => {
  it("maps the Review Service contract to the product page view model", () => {
    expect(normalizeReview({
      id: "review-1",
      productId: "product-1",
      customerId: "customer-1",
      customerName: "Pelanggan",
      rating: 5,
      content: "Produk sesuai deskripsi.",
      createdAt: "2026-09-23T10:00:00.000Z",
    })).toEqual({
      id: "review-1",
      productId: "product-1",
      userId: "customer-1",
      userName: "Pelanggan",
      rating: 5,
      comment: "Produk sesuai deskripsi.",
      createdAt: "2026-09-23T10:00:00.000Z",
    });
  });
});
