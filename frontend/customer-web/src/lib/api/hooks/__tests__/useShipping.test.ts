import { describe, expect, it } from "vitest";
import { canRequestShippingRates } from "../useShipping";

describe("canRequestShippingRates", () => {
  it("allows a request only with both cities and a positive integer gram weight", () => {
    expect(canRequestShippingRates("Jakarta", "Bandung", 1250)).toBe(true);
  });

  it.each([
    ["", "Bandung", 1250],
    ["Jakarta", "   ", 1250],
    ["Jakarta", "Bandung", 0],
    ["Jakarta", "Bandung", -1],
    ["Jakarta", "Bandung", 1.5],
    ["Jakarta", "Bandung", Number.MAX_SAFE_INTEGER + 1],
  ])("rejects incomplete or invalid rate inputs: %s -> %s (%s g)", (origin, destination, weight) => {
    expect(canRequestShippingRates(origin, destination, weight)).toBe(false);
  });
});
