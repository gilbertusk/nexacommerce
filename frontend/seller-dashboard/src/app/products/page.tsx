'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSellerStore } from '@/lib/store/useSellerStore';
import { apiGet, apiDelete } from '@/lib/api/client';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  status?: string;
  isActive?: boolean;
  category?: { name: string };
  categoryName?: string;
  images?: string[];
  image?: string;
}

interface ProductsResponse {
  success: boolean;
  data: Product[] | { products: Product[]; total: number };
  meta?: { total: number; page: number; limit: number };
}

const LIMIT = 20;

function getStatusLabel(product: Product): string {
  if (product.status) return product.status;
  if (product.isActive === false) return 'Nonaktif';
  if (product.stock === 0) return 'Habis';
  return 'Aktif';
}

function getStatusColor(label: string): string {
  if (label === 'Aktif') return 'bg-green-50 text-green-700';
  if (label === 'Habis') return 'bg-red-50 text-red-700';
  if (label === 'Nonaktif') return 'bg-stone-50 text-stone-600';
  return 'bg-yellow-50 text-yellow-700';
}

export default function ProductsPage() {
  const { seller, token } = useSellerStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!seller || !token) return;
    setIsLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        sellerId: seller.id,
        page: String(page),
        limit: String(LIMIT),
        ...(search ? { search } : {}),
      });
      const res = await apiGet<ProductsResponse>(
        `/api/v1/products/products?${params.toString()}`,
        token,
      );
      if (res.success) {
        const list = Array.isArray(res.data)
          ? res.data
          : (res.data as { products: Product[] }).products ?? [];
        setProducts(list);
        const t =
          res.meta?.total ??
          (Array.isArray(res.data)
            ? res.data.length
            : (res.data as { total: number }).total ?? list.length);
        setTotal(t);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memuat produk.');
    } finally {
      setIsLoading(false);
    }
  }, [seller, token, page, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  async function handleDelete(product: Product) {
    if (!token) return;
    setDeletingId(product.id);
    try {
      await apiDelete(`/api/v1/products/products/${product.id}`, token);
      setConfirmDelete(null);
      fetchProducts();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus produk.');
    } finally {
      setDeletingId(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const startItem = (page - 1) * LIMIT + 1;
  const endItem = Math.min(page * LIMIT, total);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-ink-primary mb-1">
            Produk Saya
          </h1>
          <p className="text-sm text-ink-secondary">
            Kelola katalog produk, harga, dan ketersediaan stok.
          </p>
        </div>
        <Link
          href="/products/new"
          className="bg-primary hover:bg-primary-hover text-white text-xs uppercase font-bold tracking-widest px-6 py-3 rounded-sm transition-colors flex items-center gap-2 w-fit"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Tambah Produk
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 hairline border-red-200 rounded-sm px-4 py-3 text-sm text-red-700">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
          <button
            onClick={fetchProducts}
            className="ml-auto text-xs underline"
          >
            Coba lagi
          </button>
        </div>
      )}

      <div className="bg-white hairline rounded-sm flex flex-col">
        {/* Toolbar */}
        <div className="p-4 hairline-b flex items-center justify-between gap-3">
          <form onSubmit={handleSearch} className="relative w-64">
            <span className="material-symbols-outlined absolute left-3 top-2 text-ink-secondary text-sm">
              search
            </span>
            <input
              type="text"
              placeholder="Cari nama produk..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-surface hairline rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </form>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchProducts}
              className="px-3 py-1.5 hairline rounded-sm text-xs font-medium text-ink-secondary hover:text-ink-primary hover:bg-surface flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">
                refresh
              </span>
              Muat Ulang
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface text-[10px] uppercase tracking-widest text-ink-secondary border-b border-hairline">
                <th className="px-4 py-3 font-bold w-12">No</th>
                <th className="px-4 py-3 font-bold">Produk</th>
                <th className="px-4 py-3 font-bold">Kategori</th>
                <th className="px-4 py-3 font-bold">Harga</th>
                <th className="px-4 py-3 font-bold">Stok</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-hairline">
                    <td className="px-4 py-3">
                      <div className="h-4 w-6 bg-paper animate-pulse rounded-xs" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-paper animate-pulse rounded-sm" />
                        <div className="h-4 w-32 bg-paper animate-pulse rounded-xs" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-20 bg-paper animate-pulse rounded-xs" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-24 bg-paper animate-pulse rounded-xs" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-10 bg-paper animate-pulse rounded-xs" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-5 w-16 bg-paper animate-pulse rounded-sm" />
                    </td>
                    <td className="px-4 py-3" />
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-sm text-ink-secondary"
                  >
                    {search
                      ? `Tidak ada produk cocok dengan "${search}".`
                      : 'Belum ada produk. Tambahkan produk pertama Anda!'}
                  </td>
                </tr>
              ) : (
                products.map((product, idx) => {
                  const statusLabel = getStatusLabel(product);
                  const statusColor = getStatusColor(statusLabel);
                  const imageUrl =
                    product.images?.[0] ?? product.image ?? null;
                  const categoryName =
                    product.category?.name ?? product.categoryName ?? '—';

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-hairline last:border-b-0 hover:bg-surface/50 transition-colors group"
                    >
                      <td className="px-4 py-3 text-ink-secondary">
                        {(page - 1) * LIMIT + idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={imageUrl}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded-sm hairline"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-surface hairline rounded-sm flex items-center justify-center">
                              <span className="material-symbols-outlined text-ink-secondary text-sm">
                                image
                              </span>
                            </div>
                          )}
                          <span className="font-medium text-ink-primary">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-secondary">
                        {categoryName}
                      </td>
                      <td className="px-4 py-3 text-ink-primary tabular-nums">
                        Rp {product.price.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-ink-primary tabular-nums">
                        {product.stock}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-widest font-bold ${statusColor}`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/products/${product.id}/edit`}
                            className="w-8 h-8 flex items-center justify-center text-ink-secondary hover:text-primary transition-colors rounded-sm hover:bg-surface"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              edit
                            </span>
                          </Link>
                          <button
                            onClick={() => setConfirmDelete(product)}
                            className="w-8 h-8 flex items-center justify-center text-ink-secondary hover:text-red-600 transition-colors rounded-sm hover:bg-surface"
                            title="Hapus"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              delete
                            </span>
                          </button>
                        </div>
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
                ? 'Tidak ada produk'
                : `Menampilkan ${startItem}–${endItem} dari ${total} produk`}
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

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white hairline rounded-sm p-6 max-w-sm w-full shadow-lg">
            <h3 className="font-serif text-lg text-ink-primary mb-2">
              Hapus Produk
            </h3>
            <p className="text-sm text-ink-secondary mb-6">
              Apakah Anda yakin ingin menghapus{' '}
              <strong className="text-ink-primary">{confirmDelete.name}</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deletingId === confirmDelete.id}
                className="px-5 py-2.5 hairline rounded-sm text-sm font-medium text-ink-secondary hover:bg-surface transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deletingId === confirmDelete.id}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-sm text-sm font-medium transition-colors flex items-center gap-2"
              >
                {deletingId === confirmDelete.id ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">
                      progress_activity
                    </span>
                    Menghapus...
                  </>
                ) : (
                  'Ya, Hapus'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
