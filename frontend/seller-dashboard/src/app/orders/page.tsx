'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSellerStore } from '@/lib/store/useSellerStore';
import { apiGet, apiPut } from '@/lib/api/client';

interface Order {
  id: string;
  customerName?: string;
  customer?: { name: string; phone?: string };
  createdAt: string;
  status: string;
  total: number;
  items?: Array<{ id: string; quantity: number; product?: { name: string } }>;
  itemsCount?: number;
}

interface OrdersResponse {
  success: boolean;
  data: Order[] | { orders: Order[]; total: number };
  meta?: { total: number; page: number; limit: number };
}

const STATUS_TABS = [
  { key: '', label: 'Semua' },
  { key: 'PENDING', label: 'Menunggu' },
  { key: 'PROCESSING', label: 'Diproses' },
  { key: 'SHIPPED', label: 'Dikirim' },
  { key: 'COMPLETED', label: 'Selesai' },
  { key: 'CANCELLED', label: 'Dibatalkan' },
];

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Menunggu',
  PROCESSING: 'Diproses',
  SHIPPED: 'Dikirim',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-stone-50 text-stone-600',
  PROCESSING: 'bg-blue-50 text-blue-700',
  SHIPPED: 'bg-orange-50 text-orange-700',
  COMPLETED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-red-50 text-red-700',
};

const LIMIT = 20;

function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrdersPage() {
  const { seller, token } = useSellerStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  const fetchOrders = useCallback(async () => {
    if (!seller || !token) return;
    setIsLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        sellerId: seller.id,
        page: String(page),
        limit: String(LIMIT),
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      const res = await apiGet<OrdersResponse>(
        `/api/v1/orders?${params.toString()}`,
        token,
      );
      if (res.success) {
        const list = Array.isArray(res.data)
          ? res.data
          : (res.data as { orders: Order[] }).orders ?? [];
        setOrders(list);
        const t =
          res.meta?.total ??
          (Array.isArray(res.data)
            ? res.data.length
            : (res.data as { total: number }).total ?? list.length);
        setTotal(t);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memuat pesanan.');
    } finally {
      setIsLoading(false);
    }
  }, [seller, token, page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  async function updateOrderStatus(
    orderId: string,
    newStatus: 'PROCESSING' | 'SHIPPED',
  ) {
    if (!token) return;
    setUpdatingId(orderId);
    setActionError('');
    try {
      await apiPut(
        `/api/v1/orders/${orderId}/status`,
        { status: newStatus },
        token,
      );
      fetchOrders();
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : 'Gagal memperbarui status.',
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const startItem = (page - 1) * LIMIT + 1;
  const endItem = Math.min(page * LIMIT, total);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif text-ink-primary mb-1">
          Manajemen Pesanan
        </h1>
        <p className="text-sm text-ink-secondary">
          Proses dan pantau semua pesanan masuk.
        </p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 bg-white hairline rounded-sm p-1 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setStatusFilter(tab.key);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${
              statusFilter === tab.key
                ? 'bg-primary text-white'
                : 'text-ink-secondary hover:bg-surface hover:text-ink-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {(error || actionError) && (
        <div className="flex items-center gap-2 bg-red-50 hairline border-red-200 rounded-sm px-4 py-3 text-sm text-red-700">
          <span className="material-symbols-outlined text-sm">error</span>
          {error || actionError}
          {error && (
            <button
              onClick={fetchOrders}
              className="ml-auto text-xs underline"
            >
              Coba lagi
            </button>
          )}
        </div>
      )}

      <div className="bg-white hairline rounded-sm flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface text-[10px] uppercase tracking-widest text-ink-secondary border-b border-hairline">
                <th className="px-4 py-3 font-bold">ID Pesanan</th>
                <th className="px-4 py-3 font-bold">Pelanggan</th>
                <th className="px-4 py-3 font-bold">Tanggal</th>
                <th className="px-4 py-3 font-bold text-center">Item</th>
                <th className="px-4 py-3 font-bold text-right">Total</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-b border-hairline">
                    {[...Array(7)].map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-full bg-paper animate-pulse rounded-xs" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-sm text-ink-secondary"
                  >
                    {statusFilter
                      ? `Tidak ada pesanan dengan status "${STATUS_LABELS[statusFilter] ?? statusFilter}".`
                      : 'Belum ada pesanan masuk.'}
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const customerName =
                    order.customerName ?? order.customer?.name ?? '-';
                  const statusLabel =
                    STATUS_LABELS[order.status] ?? order.status;
                  const statusColor =
                    STATUS_COLORS[order.status] ?? 'bg-stone-50 text-stone-600';
                  const itemsCount =
                    order.itemsCount ?? order.items?.length ?? 0;
                  const isUpdating = updatingId === order.id;

                  return (
                    <tr
                      key={order.id}
                      className="border-b border-hairline last:border-b-0 hover:bg-surface/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/orders/${order.id}`}
                          className="font-mono text-xs text-primary hover:underline"
                        >
                          #{order.id.slice(-8).toUpperCase()}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-primary">
                        {customerName}
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-secondary whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-xs text-center tabular-nums text-ink-primary">
                        {itemsCount}
                      </td>
                      <td className="px-4 py-3 text-xs text-right tabular-nums text-ink-primary font-medium">
                        {formatRupiah(order.total)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-widest font-bold ${statusColor}`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {order.status === 'PENDING' && (
                            <button
                              onClick={() =>
                                updateOrderStatus(order.id, 'PROCESSING')
                              }
                              disabled={isUpdating}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-[10px] font-bold uppercase tracking-widest rounded-sm transition-colors flex items-center gap-1"
                            >
                              {isUpdating ? (
                                <span className="material-symbols-outlined text-sm animate-spin">
                                  progress_activity
                                </span>
                              ) : (
                                'Proses'
                              )}
                            </button>
                          )}
                          {order.status === 'PROCESSING' && (
                            <button
                              onClick={() =>
                                updateOrderStatus(order.id, 'SHIPPED')
                              }
                              disabled={isUpdating}
                              className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-[10px] font-bold uppercase tracking-widest rounded-sm transition-colors flex items-center gap-1"
                            >
                              {isUpdating ? (
                                <span className="material-symbols-outlined text-sm animate-spin">
                                  progress_activity
                                </span>
                              ) : (
                                'Kirim'
                              )}
                            </button>
                          )}
                          <Link
                            href={`/orders/${order.id}`}
                            className="px-3 py-1.5 hairline rounded-sm text-[10px] font-bold uppercase tracking-widest text-ink-secondary hover:text-ink-primary hover:bg-surface transition-colors"
                          >
                            Detail
                          </Link>
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
                ? 'Tidak ada pesanan'
                : `Menampilkan ${startItem}–${endItem} dari ${total} pesanan`}
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
            {[...Array(Math.min(totalPages, 5))].map((_, i) => (
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
