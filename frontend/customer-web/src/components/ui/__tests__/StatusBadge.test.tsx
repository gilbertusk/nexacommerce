import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import StatusBadge from "../StatusBadge";

describe("StatusBadge return states", () => {
  it("explains that an approved return is still waiting for the physical item", () => {
    render(<StatusBadge status="RETURN_APPROVED" />);
    expect(screen.getByText("Retur Disetujui, Barang Ditunggu")).toBeInTheDocument();
  });

  it("shows that a received return is waiting for refund processing", () => {
    render(<StatusBadge status="RETURN_RECEIVED" />);
    expect(screen.getByText("Barang Retur Diterima, Refund Menunggu")).toBeInTheDocument();
  });
});
