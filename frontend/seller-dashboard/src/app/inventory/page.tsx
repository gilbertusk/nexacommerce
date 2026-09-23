'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSellerStore } from '@/lib/store/useSellerStore';
import { apiGet, apiPut } from '@/lib/api/client';

interface InventoryItem {
  id: string;
  productId?: string;
  product?: {
    id: string;
    name: string;
    price?: number;
  };
  productName?: string;
  currentStock?: number;
  stock?: number;
  reservedStock?: number;
  availableStock?: number;
}

interface InventoryResponse {
  success: boolean;
  data: InventoryItem[] | { inventory: InventoryItem[]; total: number };
  meta?: { total: number; page: number; limit: number };
}

const LIMIT = 20;

function getStockColor(stock: number): string {
  if (stock >= 20) return 'bg-green-100 text-green-700';
  if (stock >= 5) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
}

function getStockLabel(stock: number): string {
  if (stock >= 20) return 'Aman';
  if (stock >= 5) return 'Rendah';
  return 'Kritis';
}

export default function InventoryPage() {
  const { seller, token } = useSellerStore();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const [stockUpdates, setStockUpdates] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    if (!seller || !token) return;
    setIsLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        sellerId: seller.id,
        page: String(page),
        limit: String(LIMIT),
      });
      const res = await apiGet<InventoryResponse>(
        `/api/v1/inventory?${params.toString()}`,
        token,
      );
      if (res.success) {
        const list = Array.isArray(res.data)
          ? res.data
          : (res.data as { inventory: InventoryItem[] }).inventory ?? [];
        setItems(list);
        const t =
          res.meta?.total ??
          (Array.isArray(res.data)
            ? res.data.length
            : (res.data as { total: number }).total ?? list.length);
        setTotal(t);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memuat inventori.');
    } finally {
      setIsLoading(false);
    }
  }, [seller, token, page]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  async function handleStockUpdate(item: InventoryItem) {
    const itemId = item.productId ?? item.product?.id ?? item.id;
    const newStockStr = stockUpdates[itemId];
    if (!newStockStr || !token) return;
    const newStock = Number(newStockStr);
    if (isNaN(newStock) || newStock < 0) return;

    setUpdatingId(itemId);
    try {
      await apiPut(
        `/api/v1/inventory/${itemId}`,
        { stock: newStock },
        token,
      );
      setUpdateSuccess(itemId);
      setTimeout(() => setUpdateSuccess(null), 2000);
      setStockUpdates((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
      fetchInventory();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memperbarui stok.');
    } finally {
      setUpdatingId(null);
    }
  }

  const displayItems = lowStockOnly
    ? items.filter((item) => {
        const stock =
          item.availableStock ?? item.currentStock ?? item.stock ?? 0;
        return stock < 20;
      })
    : items;

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const startItem = (page - 1) * LIMIT + 1;
  const endItem = Math.min(page * LIMIT, total);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-ink-primary mb-1">
            Inventori
          </h1>
          <p className="text-sm text-ink-secondary">
            Pantau dan perbarui stok produk Anda.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-ink-secondary">
            <button
              role="switch"
              aria-checked={lowStockOnly}
              onClick={() => setLowStockOnly((v) => !v)}
              className={`relative w-10 h-5 rounded-full transition-colors ${lowStockOnly ? 'bg-primary' : 'bg-stone-300'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${lowStockOnly ? 'translate-x-5' : ''}`}
              />
            </button>
            Stok rendah saja
          </label>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 hairline border-red-200 rounded-sm px-4 py-3 text-sm text-red-700">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
          <button onClick={fetchInventory} className="ml-auto text-xs underline">
            Coba lagi
          </button>
        </div>
      )}

      <div className="bg-white hairline rounded-sm flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface text-[10px] uppercase tracking-widest text-ink-secondary border-b border-hairline">
                <th className="px-4 py-3 font-bold">Nama Produk</th>
                <th className="px-4 py-3 font-bold text-right">Stok Saat Ini</th>
                <th className="px-4 py-3 font-bold text-right">Direservasi</th>
                <th className="px-4 py-3 font-bold text-right">Tersedia</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Perbarui Stok</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-b border-hairline">
                    <td className="px-4 py-3">
                      <div className="h-4 w-40 bg-paper animate-pulse rounded-xs" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="h-4 w-12 bg-paper animate-pulse rounded-xs ml-auto" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="h-4 w-12 bg-paper animate-pulse rounded-xs ml-auto" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="h-4 w-12 bg-paper animate-pulse rounded-xs ml-auto" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-5 w-16 bg-paper animate-pulse rounded-sm" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-8 w-32 bg-paper animate-pulse rounded-sm" />
                    </td>
                  </tr>
                ))
              ) : displayItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-sm text-ink-secondary"
                  >
                    {lowStockOnly
                      ? 'Tidak ada produk dengan stok rendah.'
                      : 'Tidak ada data inventori.'}
                  </td>
                </tr>
              ) : (
                displayItems.map((item) => {
                  const itemId = item.productId ?? item.product?.id ?? item.id;
                  const productName =
                    item.product?.name ?? item.productName ?? '—';
                  const currentStock =
                    item.currentStock ?? item.stock ?? 0;
                  const reserved = item.reservedStock ?? 0;
                  const available = item.availableStock ?? currentStock - reserved;
                  const stockColor = getStockColor(available);
                  const stockLabel = getStockLabel(available);
                  const isUpdating = updatingId === itemId;
                  const wasUpdated = updateSuccess === itemId;

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-hairline last:border-b-0 hover:bg-surface/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-ink-primary">
                        {productName}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-ink-primary">
                        {currentStock}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-ink-secondary">
                        {reserved}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium text-ink-primary">
                        {available}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-widest font-bold ${stockColor}`}
                        >
                          {stockLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {wasUpdated ? (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">
                              check_circle
                            </span>
                            Diperbarui
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={stockUpdates[itemId] ?? ''}
                              onChange={(e) =>
                                setStockUpdates((prev) => ({
                                  ...prev,
                                  [itemId]: e.target.value,
                                }))
                              }
                              placeholder={String(currentStock)}
                              className="w-20 px-2 py-1.5 bg-surface hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary tabular-nums"
                            />
                            <button
                              onClick={() => handleStockUpdate(item)}
                              disabled={
                                isUpdating ||
                                !stockUpdates[itemId] ||
                                stockUpdates[itemId] === ''
                              }
                              className="px-3 py-1.5 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-sm transition-colors flex items-center gap-1"
                            >
                              {isUpdating ? (
                                <span className="material-symbols-outlined text-sm animate-spin">
                                  progress_activity
                                </span>
                              ) : (
                                'Update'
                              )}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 hairline-t flex items-center justify-between text-xs text-ink-secondary">
          <span>
            {isLoading
              ? 'Memuat...'
              : total === 0
                ? 'Tidak ada data'
                : `Menampilkan ${startItem}–${endItem} dari ${total} item`}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              className="w-8 h-8 flex items-center justify-center hairline rounded-sm disabled:opacity-50 hover:bg-surface transition-colors"
            >
              <span className="material-symbols-outlined text-sm">
                chevron_left
              </span>
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 flex items-center justify-center hairline rounded-sm transition-colors ${
                  page === i + 1
                    ? 'bg-primary text-white border-primary'
                    : 'hover:bg-surface text-ink-primary'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isLoading}
              className="w-8 h-8 flex items-center justify-center hairline rounded-sm disabled:opacity-50 hover:bg-surface transition-colors"
            >
              <span className="material-symbols-outlined text-sm">
                chevron_right
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
