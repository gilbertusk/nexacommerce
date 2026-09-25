import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiPost } from "../client";

/**
 * The API client must preserve the server's machine-readable `reason`.
 *
 * A previous version threw a bare Error, which discarded it. Any UI that
 * branched on `reason` would silently fall back to a generic message forever,
 * and a test that mocked the rejection itself would never notice. These cases
 * go through the real client with a stubbed `fetch`, so the field has to
 * survive the actual parsing path.
 */

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubResponse(status: number, body: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: status >= 200 && status < 300,
      status,
      statusText: "",
      json: async () => body,
    })),
  );
}

describe("api client error handling", () => {
  it("preserves the reason and details from a refused request", async () => {
    // Arrange: the shape Shipping Service returns when it fails a quote closed.
    stubResponse(422, {
      success: false,
      message: "A seller in this cart has no verified dispatch origin",
      reason: "SELLER_ORIGIN_UNVERIFIED",
      details: { sellerId: "seller-1", storeName: "Toko API" },
    });

    // Act
    const error = await apiPost("/shipping/quotes", {}).catch((err) => err);

    // Assert
    expect(error).toBeInstanceOf(ApiError);
    expect(error.reason).toBe("SELLER_ORIGIN_UNVERIFIED");
    expect(error.status).toBe(422);
    expect(error.details).toEqual({ sellerId: "seller-1", storeName: "Toko API" });
    expect(error.message).toContain("verified dispatch origin");
  });

  it("still reports a message when the server supplies no reason", async () => {
    // Arrange
    stubResponse(400, { success: false, message: "Shipping quote has expired" });

    // Act
    const error = await apiPost("/orders/checkout", {}).catch((err) => err);

    // Assert
    expect(error).toBeInstanceOf(ApiError);
    expect(error.reason).toBeUndefined();
    expect(error.message).toBe("Shipping quote has expired");
  });

  it("falls back to a generic message when the body carries neither", async () => {
    // Arrange
    stubResponse(500, { success: false });

    // Act
    const error = await apiPost("/orders/checkout", {}).catch((err) => err);

    // Assert
    expect(error.message).toBe("Terjadi kesalahan pada server.");
    expect(error.status).toBe(500);
  });

  it("returns the parsed body on success", async () => {
    // Arrange
    stubResponse(201, { success: true, data: { quoteId: "quote-1" } });

    // Act
    const result = await apiPost<{ success: boolean; data: { quoteId: string } }>(
      "/shipping/quotes",
      {},
    );

    // Assert
    expect(result.data.quoteId).toBe("quote-1");
  });
});
