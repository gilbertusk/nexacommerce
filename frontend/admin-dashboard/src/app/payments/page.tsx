"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAdminStore } from "@/lib/store/useAdminStore";
import { apiGet } from "@/lib/api/client";

interface Payment {
  id: string;
  orderId?: string;
  order?: { id?: string };
  amount: number;
  method?: string;
  status: string;
  createdAt: string;
}

interface PaymentsResponse {
  success: boolean;
  data: {
    payments: Payment[];
    total: number;
    page?: number;
    limit?: number;
  };
}

const STATUSES = [
  { value: "", label: "Semua Status" },
  { value: "SUCCESS", label: "Berhasil" },
  { value: "PENDING", label: "Menunggu" },
  { value: "FAILED", label: "Gagal" },
  { value: "EXPIRED", label: "Kedaluwarsa" },
];

const STATUS_STYLES: Record<string, string> = {
  SUCCESS: "bg-green-50 text-green-700",
  PENDING: "bg-yellow-50 text-yellow-700",
  FAILED: "bg-red-50 text-red-700",
  EXPIRED: "bg-surface text-ink-secondary",
};

const STATUS_LABELS: Record<string, string> = {
  SUCCESS: "Berhasil",
  PENDING: "Menunggu",
  FAILED: "Gagal",
  EXPIRED: "Kedaluwarsa",
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

export default function PaymentsPage() {
  const token = useAdminStore((s) => s.token);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(status ? { status } : {}),
  });

  const { data, isLoading, isError, refetch } = useQuery<PaymentsResponse>({
    queryKey: ["payments", page, status],
    queryFn: () => apiGet<PaymentsResponse>(`/payments?${params.toString()}`, token ?? undefined),
    enabled: !!token,
  });

  const payments = data?.data?.payments ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const totalRevenue = payments
    .filter((p) => p.status === "SUCCESS")
    .reduce((sum, p) => sum + p.amount, 0);

  const countByStatus = (s: string) => payments.filter((p) => p.status === s).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-serif text-ink-primary mb-1">Pembayaran</h1>
        <p className="text-sm text-ink-secondary">Monitor seluruh transaksi pembayaran di platform.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-ink-primary text-white hairline rounded-sm p-4 col-span-2 md:col-span-1">
          <span className="text-[10px] uppercase tracking-widest font-bold text-white/60">Total Pendapatan</span>
          <div className="text-xl font-serif mt-2">{formatRupiah(totalRevenue)}</div>
          <span className="text-[10px] text-white/50">transaksi berhasil</span>
        </div>
        <div className="bg-white hairline rounded-sm p-4">
          <span className="text-[10px] uppercase tracking-widest font-bold text-ink-secondary">Berhasil</span>
          <div className="text-xl font-serif text-green-600 mt-2">{countByStatus("SUCCESS")}</div>
        </div>
        <div className="bg-white hairline rounded-sm p-4">
          <span className="text-[10px] uppercase tracking-widest font-bold text-ink-secondary">Gagal</span>
          <div className="text-xl font-serif text-red-600 mt-2">{countByStatus("FAILED")}</div>
        </div>
        <div className="bg-white hairline rounded-sm p-4">
          <span className="text-[10px] uppercase tracking-widest font-bold text-ink-secondary">Menunggu</span>
          <div className="text-xl font-serif text-yellow-600 mt-2">{countByStatus("PENDING")}</div>
        </div>
      </div>

      <div className="bg-white hairline rounded-sm flex flex-col">
        {/* Toolbar */}
        <div className="p-4 hairline-b flex flex-wrap items-center gap-3">
          <div className="flex items-center hairline rounded-sm overflow-hidden">
            {STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => { setStatus(s.value); setPage(1); }}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors ${status === s.value ? "bg-ink-primary text-white" : "text-ink-secondary hover:bg-surface"}`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-ink-secondary ml-auto">{total} transaksi</span>
        </div>

        {isLoading && (
          <div className="p-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-hairline border-t-ink-secondary rounded-full animate-spin" />
          </div>
        )}

        {isError && (
          <div className="p-8 flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-ink-secondary">cloud_off</span>
            <p className="text-sm text-ink-secondary">Gagal memuat data pembayaran.</p>
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
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">ID Transaksi</th>
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">ID Pesanan</th>
                  <th className="text-right text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Jumlah</th>
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Metode</th>
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Status</th>
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E3DC]">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-ink-secondary">
                      Tidak ada transaksi ditemukan.
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-surface transition-colors">
                      <td className="py-3 px-4 text-xs font-mono text-ink-secondary">
                        {payment.id.slice(0, 12)}...
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-ink-secondary">
                        {(payment.orderId ?? payment.order?.id ?? "—").toString().slice(0, 12)}
                        {(payment.orderId ?? payment.order?.id ?? "").toString().length > 12 ? "..." : ""}
                      </td>
                      <td className="py-3 px-4 text-xs text-ink-primary text-right tabular-nums font-medium">
                        {formatRupiah(payment.amount)}
                      </td>
                      <td className="py-3 px-4 text-xs text-ink-secondary">{payment.method ?? "—"}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-widest font-bold ${STATUS_STYLES[payment.status] ?? "bg-surface text-ink-secondary"}`}>
                          {STATUS_LABELS[payment.status] ?? payment.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-ink-secondary">{formatDate(payment.createdAt)}</td>
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
