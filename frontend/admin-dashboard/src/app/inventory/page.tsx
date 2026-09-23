"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAdminStore } from "@/lib/store/useAdminStore";
import { apiGet } from "@/lib/api/client";

interface InventoryItem {
  id: string;
  productId?: string;
  productName?: string;
  product?: { name?: string; seller?: { name?: string; shopName?: string } };
  sellerName?: string;
  stock: number;
  reserved?: number;
  available?: number;
  threshold?: number;
}

interface InventoryResponse {
  success: boolean;
  data: {
    inventory?: InventoryItem[];
    items?: InventoryItem[];
    total?: number;
  } | InventoryItem[];
}

type StockLevel = "high" | "medium" | "low" | "out";

function getStockLevel(stock: number): StockLevel {
  if (stock === 0) return "out";
  if (stock <= 5) return "low";
  if (stock <= 20) return "medium";
  return "high";
}

const STOCK_LEVEL_STYLES: Record<StockLevel, string> = {
  high: "bg-green-50 text-green-700",
  medium: "bg-yellow-50 text-yellow-700",
  low: "bg-red-50 text-red-700",
  out: "bg-red-100 text-red-800",
};

const STOCK_LEVEL_LABELS: Record<StockLevel, string> = {
  high: "Cukup",
  medium: "Rendah",
  low: "Kritis",
  out: "Habis",
};

function StockBar({ stock, max }: { stock: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((stock / max) * 100)) : 0;
  const level = getStockLevel(stock);
  const barColor = level === "high" ? "bg-green-500" : level === "medium" ? "bg-yellow-400" : level === "low" ? "bg-red-400" : "bg-red-200";
  return (
    <div className="w-24 h-1.5 bg-surface rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function InventoryPage() {
  const token = useAdminStore((s) => s.token);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 20;

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(lowStockOnly ? { lowStock: "true" } : {}),
  });

  const { data, isLoading, isError, refetch } = useQuery<InventoryResponse>({
    queryKey: ["inventory", page, lowStockOnly],
    queryFn: () => apiGet<InventoryResponse>(`/inventory?${params.toString()}`, token ?? undefined),
    enabled: !!token,
  });

  function getItems(): InventoryItem[] {
    if (!data?.data) return [];
    if (Array.isArray(data.data)) return data.data;
    const d = data.data as { inventory?: InventoryItem[]; items?: InventoryItem[] };
    return d.inventory ?? d.items ?? [];
  }

  const items = getItems();
  const maxStock = Math.max(...items.map((i) => i.stock), 1);
  const lowStockCount = items.filter((i) => getStockLevel(i.stock) === "low" || getStockLevel(i.stock) === "out").length;
  const totalPages = Math.ceil((Array.isArray(data?.data) ? (data?.data as InventoryItem[]).length : ((data?.data as { total?: number })?.total ?? items.length * page)) / limit);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-serif text-ink-primary mb-1">Inventori</h1>
        <p className="text-sm text-ink-secondary">Pantau stok produk seluruh penjual di platform.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white hairline rounded-sm p-4">
          <span className="text-[10px] uppercase tracking-widest font-bold text-ink-secondary">Total SKU</span>
          <div className="text-2xl font-serif text-ink-primary mt-2">{items.length}</div>
        </div>
        <div className={`hairline rounded-sm p-4 ${lowStockCount > 0 ? "bg-red-50" : "bg-white"}`}>
          <span className="text-[10px] uppercase tracking-widest font-bold text-ink-secondary">Stok Kritis / Habis</span>
          <div className={`text-2xl font-serif mt-2 ${lowStockCount > 0 ? "text-red-600" : "text-ink-primary"}`}>
            {lowStockCount}
          </div>
        </div>
        <div className="bg-white hairline rounded-sm p-4">
          <span className="text-[10px] uppercase tracking-widest font-bold text-ink-secondary">Stok Cukup</span>
          <div className="text-2xl font-serif text-green-600 mt-2">{items.length - lowStockCount}</div>
        </div>
      </div>

      <div className="bg-white hairline rounded-sm flex flex-col">
        {/* Toolbar */}
        <div className="p-4 hairline-b flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => { setLowStockOnly(e.target.checked); setPage(1); }}
              className="w-4 h-4 accent-primary rounded"
            />
            <span className="text-sm text-ink-primary font-medium">Stok rendah saja</span>
          </label>
          <span className="text-xs text-ink-secondary ml-auto">{items.length} item</span>
        </div>

        {isLoading && (
          <div className="p-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-hairline border-t-ink-secondary rounded-full animate-spin" />
          </div>
        )}

        {isError && (
          <div className="p-8 flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-ink-secondary">cloud_off</span>
            <p className="text-sm text-ink-secondary">Gagal memuat data inventori.</p>
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
                  <th className="text-right text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Stok</th>
                  <th className="text-right text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Dipesan</th>
                  <th className="text-right text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Tersedia</th>
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Level</th>
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Indikator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E3DC]">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-ink-secondary">
                      Tidak ada data inventori.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const level = getStockLevel(item.stock);
                    const available = item.available ?? (item.stock - (item.reserved ?? 0));
                    return (
                      <tr key={item.id} className="hover:bg-surface transition-colors">
                        <td className="py-3 px-4 text-xs font-medium text-ink-primary max-w-xs truncate">
                          {item.productName ?? item.product?.name ?? "—"}
                        </td>
                        <td className="py-3 px-4 text-xs text-ink-secondary">
                          {item.sellerName ?? item.product?.seller?.shopName ?? item.product?.seller?.name ?? "—"}
                        </td>
                        <td className={`py-3 px-4 text-xs text-right tabular-nums font-bold ${level === "out" ? "text-red-600" : level === "low" ? "text-red-500" : level === "medium" ? "text-yellow-600" : "text-ink-primary"}`}>
                          {item.stock}
                        </td>
                        <td className="py-3 px-4 text-xs text-ink-secondary text-right tabular-nums">
                          {item.reserved ?? 0}
                        </td>
                        <td className="py-3 px-4 text-xs text-ink-primary text-right tabular-nums">
                          {available}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-widest font-bold ${STOCK_LEVEL_STYLES[level]}`}>
                            {STOCK_LEVEL_LABELS[level]}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <StockBar stock={item.stock} max={maxStock} />
                        </td>
                      </tr>
                    );
                  })
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
