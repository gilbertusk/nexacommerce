import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Footer from "../Footer";

describe("Footer", () => {
  it("does not claim unsupported newsletter, policy, contact, or social actions are available", () => {
    render(<Footer />);

    expect(screen.getByText(/Pendaftaran newsletter belum tersedia/)).toBeInTheDocument();
    expect(screen.getByText(/Kebijakan pengembalian akan dipublikasikan/)).toBeInTheDocument();
    expect(screen.getByText(/Saluran kontak pelanggan belum tersedia/)).toBeInTheDocument();
    expect(screen.getByText(/Kanal sosial dan jurnal belum dikonfigurasi/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Subscribe" })).not.toBeInTheDocument();
    expect(document.querySelector('a[href="#"]')).toBeNull();
  });
});
