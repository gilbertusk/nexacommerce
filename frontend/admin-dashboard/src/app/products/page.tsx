"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminStore } from "@/lib/store/useAdminStore";
import { apiGet, apiDelete } from "@/lib/api/client";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  status: string;
  seller?: { name?: string; shopName?: string };
  sellerId?: string;
  createdAt: string;
}

interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    total: number;
    page: number;
    limit: number;
  };
}

function formatRupiah(v: number) {
  return `Rp ${v.toLocaleString("id-ID")}`;
}

export default function ProductsPage() {
  const token = useAdminStore((s) => s.token);
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const limit = 20;

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(search ? { search } : {}),
    ...(category ? { category } : {}),
  });

  const { data, isLoading, isError, refetch } = useQuery<ProductsResponse>({
    queryKey: ["products", page, search, category],
    queryFn: () => apiGet<ProductsResponse>(`/products/products?${params.toString()}`, token ?? undefined),
    enabled: !!token,
  });

  const mutation = useMutation({
    mutationFn: (id: string) => apiDelete<unknown>(`/products/products/${id}`, token ?? undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      setDeleteTarget(null);
      setFeedback({ type: "success", message: "Produk berhasil dihapus." });
      setTimeout(() => setFeedback(null), 3000);
    },
    onError: () => {
      setDeleteTarget(null);
      setFeedback({ type: "error", message: "Gagal menghapus produk." });
      setTimeout(() => setFeedback(null), 3000);
    },
  });

  const products = data?.data?.products ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-serif text-ink-primary mb-1">Manajemen Produk</h1>
        <p className="text-sm text-ink-secondary">Pantau dan kelola semua produk yang tersedia di platform.</p>
      </div>

      {feedback && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-sm text-sm hairline ${feedback.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          <span className="material-symbols-outlined text-[18px]">{feedback.type === "success" ? "check_circle" : "error"}</span>
          {feedback.message}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white hairline rounded-sm p-6 w-full max-w-sm flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-red-500 text-2xl mt-0.5">warning</span>
              <div>
                <h3 className="font-serif text-lg text-ink-primary">Hapus Produk</h3>
                <p className="text-sm text-ink-secondary mt-1">
                  Apakah Anda yakin ingin menghapus{" "}
                  <strong className="text-ink-primary">{deleteTarget.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 hairline rounded-sm text-xs font-bold uppercase tracking-widest text-ink-secondary hover:bg-surface transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => mutation.mutate(deleteTarget.id)}
                disabled={mutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {mutation.isPending ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white hairline rounded-sm flex flex-col">
        {/* Toolbar */}
        <div className="p-4 hairline-b flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <span className="material-symbols-outlined absolute left-3 top-2 text-ink-secondary text-sm">search</span>
            <input
              type="text"
              placeholder="Cari nama produk..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-1.5 bg-surface hairline rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <input
            type="text"
            placeholder="Filter kategori..."
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="px-3 py-1.5 bg-surface hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary w-40"
          />
          <span className="text-xs text-ink-secondary ml-auto">{total} produk</span>
        </div>

        {isLoading && (
          <div className="p-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-hairline border-t-ink-secondary rounded-full animate-spin" />
          </div>
        )}

        {isError && (
          <div className="p-8 flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-ink-secondary">cloud_off</span>
            <p className="text-sm text-ink-secondary">Gagal memuat data produk.</p>
            <button onClick={() => refetch()} className="px-4 py-2 bg-ink-primary text-white text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-ink-primary/90 transition-colors">
              Coba Lagi
            </button>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface hairline-b">
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Produk</th>
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Penjual</th>
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Kategori</th>
                  <th className="text-right text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Harga</th>
                  <th className="text-right text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Stok</th>
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Status</th>
                  <th className="text-right text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E3DC]">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-ink-secondary">
                      Tidak ada produk ditemukan.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-surface transition-colors">
                      <td className="py-3 px-4 text-xs font-medium text-ink-primary max-w-xs truncate">{product.name}</td>
                      <td className="py-3 px-4 text-xs text-ink-secondary">
                        {product.seller?.shopName ?? product.seller?.name ?? product.sellerId ?? "—"}
                      </td>
                      <td className="py-3 px-4 text-xs text-ink-secondary">{product.category}</td>
                      <td className="py-3 px-4 text-xs text-ink-primary text-right tabular-nums font-medium">
                        {formatRupiah(product.price)}
                      </td>
                      <td className="py-3 px-4 text-xs text-right tabular-nums">
                        <span className={product.stock <= 5 ? "text-red-600 font-bold" : product.stock <= 20 ? "text-yellow-600" : "text-ink-secondary"}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-widest font-bold ${
                          product.status === "ACTIVE" ? "bg-green-50 text-green-700" : "bg-surface text-ink-secondary"
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="p-1.5 text-ink-secondary hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                          title="Hapus produk"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 hairline-t flex items-center justify-between">
            <span className="text-xs text-ink-secondary">Halaman {page} dari {totalPages}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 hairline rounded-sm text-xs font-medium text-ink-secondary hover:text-ink-primary hover:bg-surface disabled:opacity-40 transition-colors">
                Sebelumnya
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 hairline rounded-sm text-xs font-medium text-ink-secondary hover:text-ink-primary hover:bg-surface disabled:opacity-40 transition-colors">
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
