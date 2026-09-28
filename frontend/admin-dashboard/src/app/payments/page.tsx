"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAdminStore } from "@/lib/store/useAdminStore";
import { apiGet, apiPostWithHeaders } from "@/lib/api/client";

interface Payment {
  id: string;
  orderId?: string;
  order?: { id?: string };
  amount: number;
  remainingRefundableAmount?: number;
  pendingRefund?: { id: string; amount: number; reason: string } | null;
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

interface PaymentStatsResponse {
  success: boolean;
  data: {
    breakdown: { paid: number; failed: number; pending: number; expired: number };
    totalRevenue: number;
  };
}

const STATUSES = [
  { value: "", label: "Semua Status" },
  { value: "PAID", label: "Berhasil" },
  { value: "PENDING", label: "Menunggu" },
  { value: "FAILED", label: "Gagal" },
  { value: "EXPIRED", label: "Kedaluwarsa" },
  { value: "PARTIALLY_REFUNDED", label: "Refund sebagian" },
  { value: "REFUNDED", label: "Refund selesai" },
];

const STATUS_STYLES: Record<string, string> = {
  PAID: "bg-green-50 text-green-700",
  PENDING: "bg-yellow-50 text-yellow-700",
  FAILED: "bg-red-50 text-red-700",
  EXPIRED: "bg-surface text-ink-secondary",
  PARTIALLY_REFUNDED: "bg-blue-50 text-blue-700",
  REFUNDED: "bg-surface text-ink-secondary",
};

const STATUS_LABELS: Record<string, string> = {
  PAID: "Berhasil",
  PENDING: "Menunggu",
  FAILED: "Gagal",
  EXPIRED: "Kedaluwarsa",
  PARTIALLY_REFUNDED: "Refund sebagian",
  REFUNDED: "Refund selesai",
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
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [refundTarget, setRefundTarget] = useState<Payment | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refundKey, setRefundKey] = useState("");
  const [refundMessage, setRefundMessage] = useState("");
  const limit = 20;

  const refundMutation = useMutation({
    mutationFn: () => {
      if (!refundTarget) throw new Error("Pilih transaksi terlebih dahulu.");
      return apiPostWithHeaders(`/payments/order/${encodeURIComponent(refundTarget.orderId ?? refundTarget.order?.id ?? "")}/refunds`, {
        amount: Number(refundAmount),
        reason: refundReason,
      }, { "Idempotency-Key": refundKey }, token ?? undefined);
    },
    onSuccess: () => {
      setRefundMessage("Permintaan diterima. Status dana tetap menunggu konfirmasi Midtrans/bank.");
      setRefundTarget(null);
      setRefundAmount("");
      setRefundReason("");
      setRefundKey("");
      void queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (error) => setRefundMessage(error instanceof Error ? error.message : "Permintaan refund gagal."),
  });

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

  const { data: statsData } = useQuery<PaymentStatsResponse>({
    queryKey: ["payment-stats"],
    queryFn: () => apiGet<PaymentStatsResponse>("/payments/stats", token ?? undefined),
    enabled: !!token,
  });

  const payments = (data?.data?.payments ?? []).map((payment) => ({
    ...payment,
    amount: Number(payment.amount),
    remainingRefundableAmount: Number(payment.remainingRefundableAmount ?? payment.amount),
    pendingRefund: payment.pendingRefund ? { ...payment.pendingRefund, amount: Number(payment.pendingRefund.amount) } : null,
  }));
  const total = data?.data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const stats = statsData?.data;

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
          <div className="text-xl font-serif mt-2">{formatRupiah(stats?.totalRevenue ?? 0)}</div>
          <span className="text-[10px] text-white/50">transaksi berhasil</span>
        </div>
        <div className="bg-white hairline rounded-sm p-4">
          <span className="text-[10px] uppercase tracking-widest font-bold text-ink-secondary">Berhasil</span>
          <div className="text-xl font-serif text-green-600 mt-2">{stats?.breakdown.paid ?? 0}</div>
        </div>
        <div className="bg-white hairline rounded-sm p-4">
          <span className="text-[10px] uppercase tracking-widest font-bold text-ink-secondary">Gagal</span>
          <div className="text-xl font-serif text-red-600 mt-2">{stats?.breakdown.failed ?? 0}</div>
        </div>
        <div className="bg-white hairline rounded-sm p-4">
          <span className="text-[10px] uppercase tracking-widest font-bold text-ink-secondary">Menunggu</span>
          <div className="text-xl font-serif text-yellow-600 mt-2">{stats?.breakdown.pending ?? 0}</div>
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

        {refundMessage && <p role="status" className="mx-4 mt-4 rounded-xs border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">{refundMessage}</p>}

        {refundTarget && (
          <form className="mx-4 mt-4 grid gap-3 rounded-sm border border-hairline bg-surface p-4 md:grid-cols-[1fr_2fr_auto]" onSubmit={(event) => { event.preventDefault(); setRefundMessage(""); refundMutation.mutate(); }}>
            <div className="md:col-span-3">
              <p className="text-sm font-semibold text-ink-primary">Refund untuk pesanan {refundTarget.orderId ?? refundTarget.order?.id}</p>
              <p className="mt-1 text-xs text-ink-secondary">Hanya untuk retur yang barang fisiknya sudah dikonfirmasi diterima oleh admin. Dana belum dianggap kembali sampai Midtrans/bank mengirim konfirmasi.</p>
            </div>
            <label className="flex flex-col gap-1 text-xs text-ink-secondary">Jumlah (maks. {formatRupiah(refundTarget.remainingRefundableAmount ?? refundTarget.amount)})
              <input required type="number" min={1} max={refundTarget.remainingRefundableAmount ?? refundTarget.amount} step={1} value={refundAmount} onChange={(event) => setRefundAmount(event.target.value)} className="rounded-xs border border-hairline bg-white px-3 py-2 text-ink-primary" />
            </label>
            <label className="flex flex-col gap-1 text-xs text-ink-secondary">Alasan refund
              <input required maxLength={255} value={refundReason} onChange={(event) => setRefundReason(event.target.value)} className="rounded-xs border border-hairline bg-white px-3 py-2 text-ink-primary" />
            </label>
            <div className="flex items-end gap-2">
              <button type="button" onClick={() => { setRefundTarget(null); refundMutation.reset(); }} className="rounded-xs border border-hairline px-3 py-2 text-xs">Batal</button>
              <button type="submit" disabled={refundMutation.isPending} className="rounded-xs bg-primary px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{refundMutation.isPending ? "Mengirim…" : "Ajukan refund"}</button>
            </div>
          </form>
        )}

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
                  <th className="text-right text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E3DC]">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-ink-secondary">
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
                      <td className="py-3 px-4 text-right">
                        {payment.pendingRefund ? (
                          <span className="text-[10px] text-amber-800">Refund pending · {formatRupiah(payment.pendingRefund.amount)}</span>
                        ) : ["PAID", "PARTIALLY_REFUNDED"].includes(payment.status) && payment.remainingRefundableAmount > 0 ? (
                          <button type="button" onClick={() => {
                            setRefundTarget(payment);
                            setRefundAmount(String(payment.remainingRefundableAmount));
                            setRefundReason("Pengembalian pesanan yang disetujui");
                            setRefundKey(crypto.randomUUID());
                            setRefundMessage("");
                          }} className="rounded-xs border border-hairline px-2 py-1 text-[10px] font-bold text-ink-primary hover:bg-surface">Refund…</button>
                        ) : null}
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
