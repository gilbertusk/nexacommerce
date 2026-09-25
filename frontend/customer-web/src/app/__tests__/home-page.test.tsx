import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "../page";

const { useCategoriesMock, useProductsMock } = vi.hoisted(() => ({
  useCategoriesMock: vi.fn(),
  useProductsMock: vi.fn(),
}));

vi.mock("@/lib/api/hooks/useProducts", () => ({
  useCategories: useCategoriesMock,
  useProducts: useProductsMock,
}));

vi.mock("@/components/ui/ProductCard", () => ({
  default: ({ name }: { name: string }) => <div>{name}</div>,
}));

describe("HomePage catalog", () => {
  beforeEach(() => {
    useProductsMock.mockReset();
    useCategoriesMock.mockReset();
    useCategoriesMock.mockReturnValue({ data: { data: [] }, isError: false });
  });

  it("renders products and categories supplied by the API hooks", () => {
    useProductsMock.mockReturnValue({
      data: {
        data: {
          products: [
            {
              id: "product-1",
              name: "Produk API",
              price: 125000,
              images: ["https://example.com/product.jpg"],
              brand: "Nexa",
              stock: 2,
            },
          ],
        },
      },
      isLoading: false,
      isError: false,
    });
    useCategoriesMock.mockReturnValue({
      data: { data: [{ id: "category-1", name: "Kategori API", slug: "kategori-api" }] },
      isError: false,
    });

    render(<HomePage />);

    expect(screen.getByText("Produk API")).toBeInTheDocument();
    expect(screen.getByText("Kategori API")).toBeInTheDocument();
  });

  it("shows a useful message when the catalog API fails", () => {
    useProductsMock.mockReturnValue({ data: undefined, isLoading: false, isError: true });

    render(<HomePage />);

    expect(screen.getByText(/Katalog belum dapat dimuat/i)).toBeInTheDocument();
  });

  it("shows an empty state when the API returns no products", () => {
    useProductsMock.mockReturnValue({
      data: { data: { products: [] } },
      isLoading: false,
      isError: false,
    });

    render(<HomePage />);

    expect(screen.getByText("Belum ada produk yang tersedia.")).toBeInTheDocument();
  });
});
