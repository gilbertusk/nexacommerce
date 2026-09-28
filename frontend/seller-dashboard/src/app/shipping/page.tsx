'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSellerStore } from '@/lib/store/useSellerStore';
import { apiGet, apiPatch } from '@/lib/api/client';

interface ShippingOrder {
  id: string;
  orderId?: string;
  sellerId?: string;
  order?: {
    id: string;
    customer?: { name: string };
    customerName?: string;
  };
  customerName?: string;
  status: string;
  courier?: string;
  courierName?: string;
  serviceName?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt?: string;
}

interface ShippingResponse {
  success: boolean;
  data:
    | ShippingOrder[]
    | { orders: ShippingOrder[]; total: number }
    | { shippings: ShippingOrder[]; total: number };
  meta?: { total: number };
}

const SHIPPING_STATUSES = [
  { key: '', label: 'Semua' },
  { key: 'WAITING_PICKUP', label: 'Menunggu Pickup' },
  { key: 'PICKED_UP', label: 'Dijemput' },
  { key: 'IN_TRANSIT', label: 'Dalam Perjalanan' },
  { key: 'DELIVERED', label: 'Terkirim' },
  { key: 'FAILED', label: 'Gagal Dikirim' },
  { key: 'RETURNED', label: 'Dikembalikan' },
];

const NEXT_SHIPPING_STATUSES: Record<string, string[]> = {
  WAITING_PICKUP: ['PICKED_UP', 'FAILED'],
  PICKED_UP: ['IN_TRANSIT', 'FAILED'],
  IN_TRANSIT: ['DELIVERED', 'FAILED'],
  FAILED: ['RETURNED'],
  DELIVERED: [],
  RETURNED: [],
};

const STATUS_COLORS: Record<string, string> = {
  WAITING_PICKUP: 'bg-stone-50 text-stone-600',
  PICKED_UP: 'bg-blue-50 text-blue-700',
  IN_TRANSIT: 'bg-orange-50 text-orange-700',
  DELIVERED: 'bg-green-50 text-green-700',
  FAILED: 'bg-red-50 text-red-700',
  RETURNED: 'bg-violet-50 text-violet-700',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ShippingPage() {
  const { token } = useSellerStore();

  const [shippings, setShippings] = useState<ShippingOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [updatingTrackingId, setUpdatingTrackingId] = useState<string | null>(
    null,
  );
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>(
    {},
  );
  const [expandedTracking, setExpandedTracking] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  const fetchShippings = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      const queryStr = params.toString();
      const res = await apiGet<ShippingResponse>(
        `/api/v1/shipping/seller/orders${queryStr ? `?${queryStr}` : ''}`,
        token,
      );
      if (res.success) {
        let list: ShippingOrder[];
        if (Array.isArray(res.data)) {
          list = res.data;
        } else if ('orders' in res.data) {
          list = (res.data as { orders: ShippingOrder[] }).orders ?? [];
        } else if ('shippings' in res.data) {
          list = (res.data as { shippings: ShippingOrder[] }).shippings ?? [];
        } else {
          list = [];
        }
        setShippings(list);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Gagal memuat data pengiriman.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [token, statusFilter]);

  useEffect(() => {
    // This effect starts an asynchronous API request; its callback owns loading/result state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchShippings();
  }, [fetchShippings]);

  async function handleUpdateStatus(
    orderId: string,
    newStatus: string,
  ) {
    if (!token) return;
    setUpdatingStatusId(orderId);
    setActionError('');
    try {
      await apiPatch(
        `/api/v1/shipping/${orderId}/status`,
        { status: newStatus },
        token,
      );
      setShippings((prev) =>
        prev.map((s) =>
          (s.orderId ?? s.id) === orderId
            ? { ...s, status: newStatus }
            : s,
        ),
      );
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : 'Gagal memperbarui status.',
      );
    } finally {
      setUpdatingStatusId(null);
    }
  }

  async function handleUpdateTracking(orderId: string) {
    const trackingNumber = trackingInputs[orderId]?.trim();
    if (!trackingNumber || !token) return;
    setUpdatingTrackingId(orderId);
    setActionError('');
    try {
      await apiPatch(
        `/api/v1/shipping/${orderId}/tracking`,
        { trackingNumber },
        token,
      );
      setShippings((prev) =>
        prev.map((s) =>
          (s.orderId ?? s.id) === orderId
            ? { ...s, trackingNumber }
            : s,
        ),
      );
      setTrackingInputs((prev) => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
      setExpandedTracking(null);
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : 'Gagal memperbarui nomor resi.',
      );
    } finally {
      setUpdatingTrackingId(null);
    }
  }

  const displayed = shippings.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const id = (s.orderId ?? s.id ?? '').toLowerCase();
    return id.includes(q);
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchQuery(searchInput);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif text-ink-primary mb-1">
          Manajemen Pengiriman
        </h1>
        <p className="text-sm text-ink-secondary">
          Pantau dan perbarui status pengiriman pesanan Anda.
        </p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 bg-white hairline rounded-sm p-1 overflow-x-auto">
        {SHIPPING_STATUSES.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
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
              onClick={fetchShippings}
              className="ml-auto text-xs underline"
            >
              Coba lagi
            </button>
          )}
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white hairline rounded-sm flex flex-col">
        {/* Toolbar */}
        <div className="p-4 hairline-b flex items-center justify-between gap-3">
          <form onSubmit={handleSearch} className="relative w-72">
            <span className="material-symbols-outlined absolute left-3 top-2 text-ink-secondary text-sm">
              search
            </span>
            <input
              type="text"
              placeholder="Cari ID pesanan..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-surface hairline rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </form>
          <button
            onClick={fetchShippings}
            className="px-3 py-1.5 hairline rounded-sm text-xs font-medium text-ink-secondary hover:text-ink-primary hover:bg-surface flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">
              refresh
            </span>
            Muat Ulang
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface text-[10px] uppercase tracking-widest text-ink-secondary border-b border-hairline">
                <th className="px-4 py-3 font-bold">ID Pesanan</th>
                <th className="px-4 py-3 font-bold">Pelanggan</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Kurir</th>
                <th className="px-4 py-3 font-bold">Nomor Resi</th>
                <th className="px-4 py-3 font-bold">Tanggal</th>
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
              ) : displayed.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-sm text-ink-secondary"
                  >
                    {searchQuery
                      ? `Tidak ada pengiriman dengan ID "${searchQuery}".`
                      : statusFilter
                        ? `Tidak ada pengiriman dengan status "${SHIPPING_STATUSES.find((s) => s.key === statusFilter)?.label}".`
                        : 'Belum ada data pengiriman.'}
                  </td>
                </tr>
              ) : (
                displayed.map((shipping) => {
                  const orderId = shipping.orderId ?? shipping.id;
                  const customerName =
                    shipping.customerName ??
                    shipping.order?.customer?.name ??
                    shipping.order?.customerName ??
                    '-';
                  const statusColor =
                    STATUS_COLORS[shipping.status] ??
                    'bg-stone-50 text-stone-600';
                  const statusLabel =
                    SHIPPING_STATUSES.find((s) => s.key === shipping.status)
                      ?.label ?? shipping.status;
                  const isUpdatingStatus = updatingStatusId === orderId;
                  const isUpdatingTracking = updatingTrackingId === orderId;
                  const isTrackingExpanded = expandedTracking === orderId;

                  return (
                    <tr
                      key={shipping.id}
                      className="border-b border-hairline last:border-b-0 hover:bg-surface/50 transition-colors align-top"
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-ink-primary">
                          #{orderId.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-primary">
                        {customerName}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-widest font-bold ${statusColor}`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-secondary">
                        {shipping.courierName ?? shipping.courier ?? '—'}
                        {shipping.serviceName ? ` — ${shipping.serviceName}` : ''}
                      </td>
                      <td className="px-4 py-3 min-w-[200px]">
                        {isTrackingExpanded ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={trackingInputs[orderId] ?? ''}
                              onChange={(e) =>
                                setTrackingInputs((prev) => ({
                                  ...prev,
                                  [orderId]: e.target.value,
                                }))
                              }
                              placeholder="Masukkan nomor resi"
                              className="w-36 px-2 py-1.5 bg-surface hairline rounded-sm text-xs text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                            />
                            <button
                              onClick={() => handleUpdateTracking(orderId)}
                              disabled={
                                isUpdatingTracking ||
                                !trackingInputs[orderId]?.trim()
                              }
                              className="px-2.5 py-1.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-[10px] font-bold rounded-sm transition-colors flex items-center gap-1"
                            >
                              {isUpdatingTracking ? (
                                <span className="material-symbols-outlined text-[14px] animate-spin">
                                  progress_activity
                                </span>
                              ) : (
                                'Simpan'
                              )}
                            </button>
                            <button
                              onClick={() => setExpandedTracking(null)}
                              className="text-ink-secondary hover:text-ink-primary"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                close
                              </span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-ink-primary">
                              {shipping.trackingNumber ?? '—'}
                            </span>
                            <button
                              onClick={() => {
                                setExpandedTracking(orderId);
                                setTrackingInputs((prev) => ({
                                  ...prev,
                                  [orderId]: shipping.trackingNumber ?? '',
                                }));
                              }}
                              className="text-ink-secondary hover:text-primary transition-colors"
                              title="Edit nomor resi"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                edit
                              </span>
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-secondary whitespace-nowrap">
                        {formatDate(shipping.createdAt)}
                      </td>
                      <td className="px-4 py-3 min-w-[160px]">
                        <select
                          value={shipping.status}
                          onChange={(e) => {
                            if (e.target.value !== shipping.status) {
                              handleUpdateStatus(orderId, e.target.value);
                            }
                          }}
                          disabled={isUpdatingStatus}
                          className="w-full px-2 py-1.5 bg-surface hairline rounded-sm text-xs text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 cursor-pointer"
                        >
                          {SHIPPING_STATUSES.filter((s) => (
                            s.key === shipping.status
                            || (NEXT_SHIPPING_STATUSES[shipping.status] ?? []).includes(s.key)
                          )).map(
                            (s) => (
                              <option key={s.key} value={s.key}>
                                {s.label}
                              </option>
                            ),
                          )}
                        </select>
                        {isUpdatingStatus && (
                          <span className="text-[10px] text-ink-secondary flex items-center gap-1 mt-1">
                            <span className="material-symbols-outlined text-[12px] animate-spin">
                              progress_activity
                            </span>
                            Memperbarui...
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
