"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAdminStore } from "@/lib/store/useAdminStore";
import { apiGet } from "@/lib/api/client";
import Link from "next/link";

interface Order {
  id: string;
  customer?: { name?: string; email?: string };
  customerName?: string;
  totalAmount?: number;
  total?: number;
  status: string;
  createdAt: string;
}

interface OrdersResponse {
  success: boolean;
  data: {
    orders: Order[];
    total: number;
  };
}

const STATUSES = [
  { value: "", label: "Semua Status" },
  { value: "PENDING_PAYMENT", label: "Menunggu Pembayaran" },
  { value: "PAID", label: "Dibayar" },
  { value: "SHIPPED", label: "Dikirim" },
  { value: "COMPLETED", label: "Selesai" },
  { value: "CANCELLED", label: "Dibatalkan" },
];

const STATUS_STYLES: Record<string, string> = {
  PENDING_PAYMENT: "bg-yellow-50 text-yellow-700",
  PAID: "bg-blue-50 text-blue-700",
  SHIPPED: "bg-indigo-50 text-indigo-700",
  COMPLETED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Menunggu Pembayaran",
  PAID: "Dibayar",
  SHIPPED: "Dikirim",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

function formatRupiah(v: number) {
  return `Rp ${v.toLocaleString("id-ID")}`;
}

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return d;
  }
}

export default function OrdersPage() {
  const token = useAdminStore((s) => s.token);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(search ? { search } : {}),
    ...(status ? { status } : {}),
  });

  const { data, isLoading, isError, refetch } = useQuery<OrdersResponse>({
    queryKey: ["orders", page, search, status],
    queryFn: () => apiGet<OrdersResponse>(`/orders?${params.toString()}`, token ?? undefined),
    enabled: !!token,
  });

  const orders = data?.data?.orders ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-serif text-ink-primary mb-1">Manajemen Pesanan</h1>
            <p className="text-sm text-ink-secondary">Pantau seluruh transaksi dan status pesanan pelanggan.</p>
          </div>
          <Link href="/orders/complaints" className="px-4 py-2 bg-ink-primary text-white text-xs font-bold uppercase tracking-widest rounded-sm">
            Komplain Pelanggan
          </Link>
        </div>
      </div>

      <div className="bg-white hairline rounded-sm flex flex-col">
        {/* Toolbar */}
        <div className="p-4 hairline-b flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <span className="material-symbols-outlined absolute left-3 top-2 text-ink-secondary text-sm">search</span>
            <input
              type="text"
              placeholder="Cari ID pesanan..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-1.5 bg-surface hairline rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-3 py-1.5 bg-surface hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <span className="text-xs text-ink-secondary ml-auto">{total} pesanan</span>
        </div>

        {isLoading && (
          <div className="p-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-hairline border-t-ink-secondary rounded-full animate-spin" />
          </div>
        )}

        {isError && (
          <div className="p-8 flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-ink-secondary">cloud_off</span>
            <p className="text-sm text-ink-secondary">Gagal memuat data pesanan.</p>
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
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">ID Pesanan</th>
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Pelanggan</th>
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Tanggal</th>
                  <th className="text-right text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Total</th>
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Status</th>
                  <th className="text-right text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E3DC]">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-ink-secondary">
                      Tidak ada pesanan ditemukan.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-surface transition-colors">
                      <td className="py-3 px-4 text-xs font-mono text-ink-secondary">{order.id.slice(0, 12)}...</td>
                      <td className="py-3 px-4 text-xs text-ink-primary font-medium">
                        {order.customer?.name ?? order.customerName ?? "—"}
                      </td>
                      <td className="py-3 px-4 text-xs text-ink-secondary">{formatDate(order.createdAt)}</td>
                      <td className="py-3 px-4 text-xs text-ink-primary text-right tabular-nums font-medium">
                        {formatRupiah(order.totalAmount ?? order.total ?? 0)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-widest font-bold ${STATUS_STYLES[order.status] ?? "bg-surface text-ink-secondary"}`}>
                          {STATUS_LABELS[order.status] ?? order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/orders/${order.id}`}
                          className="p-1.5 text-ink-secondary hover:text-primary rounded-sm transition-colors inline-flex"
                          title="Lihat detail"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </Link>
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
