"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminStore } from "@/lib/store/useAdminStore";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api/client";

interface Voucher {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  scope: "PLATFORM" | "SELLER" | "CATEGORY";
  createdAt: string;
}

interface VouchersResponse {
  success: boolean;
  data: Voucher[] | { vouchers: Voucher[]; total?: number };
}

interface CreateVoucherBody {
  code: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  minOrderAmount?: number | null;
  maxUses?: number | null;
  expiresAt?: string | null;
  scope: "PLATFORM" | "SELLER" | "CATEGORY";
}

function formatRupiah(v: number) {
  return `Rp ${v.toLocaleString("id-ID")}`;
}

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

const EMPTY_FORM: CreateVoucherBody = {
  code: "",
  discountType: "PERCENTAGE",
  discountValue: 0,
  minOrderAmount: null,
  maxUses: null,
  expiresAt: null,
  scope: "PLATFORM",
};

export default function VouchersPage() {
  const token = useAdminStore((s) => s.token);
  const qc = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateVoucherBody>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<Voucher | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const { data, isLoading, isError, refetch } = useQuery<VouchersResponse>({
    queryKey: ["vouchers"],
    queryFn: () =>
      apiGet<VouchersResponse>("/vouchers", token ?? undefined),
    enabled: !!token,
  });

  const vouchers: Voucher[] = (() => {
    const d = data?.data;
    if (!d) return [];
    if (Array.isArray(d)) return d;
    return (d as { vouchers: Voucher[] }).vouchers ?? [];
  })();

  const createMutation = useMutation({
    mutationFn: (body: CreateVoucherBody) =>
      apiPost<unknown>("/vouchers", body, token ?? undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vouchers"] });
      setShowForm(false);
      setForm(EMPTY_FORM);
      setFeedback({ type: "success", message: "Voucher berhasil dibuat." });
      setTimeout(() => setFeedback(null), 3000);
    },
    onError: (e: Error) => {
      setFeedback({ type: "error", message: e.message || "Gagal membuat voucher." });
      setTimeout(() => setFeedback(null), 4000);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) =>
      apiPatch<unknown>(`/vouchers/${id}/toggle`, {}, token ?? undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vouchers"] });
    },
    onError: () => {
      setFeedback({ type: "error", message: "Gagal mengubah status voucher." });
      setTimeout(() => setFeedback(null), 3000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiDelete<unknown>(`/vouchers/${id}`, token ?? undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vouchers"] });
      setDeleteTarget(null);
      setFeedback({ type: "success", message: "Voucher berhasil dihapus." });
      setTimeout(() => setFeedback(null), 3000);
    },
    onError: () => {
      setDeleteTarget(null);
      setFeedback({ type: "error", message: "Gagal menghapus voucher." });
      setTimeout(() => setFeedback(null), 3000);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body: CreateVoucherBody = {
      ...form,
      discountValue: Number(form.discountValue),
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      expiresAt: form.expiresAt || null,
    };
    createMutation.mutate(body);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-serif text-ink-primary mb-1">
            Manajemen Voucher
          </h1>
          <p className="text-sm text-ink-secondary">
            Kelola kode diskon dan promosi untuk platform NexaCommerce.
          </p>
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); setForm(EMPTY_FORM); }}
          className="flex items-center gap-2 px-4 py-2 bg-ink-primary text-white rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-ink-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Buat Voucher
        </button>
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-sm text-sm hairline ${
            feedback.type === "success"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {feedback.type === "success" ? "check_circle" : "error"}
          </span>
          {feedback.message}
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="bg-white hairline rounded-sm">
          <div className="p-5 hairline-b flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink-primary">
              Buat Voucher Baru
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="p-1 text-ink-secondary hover:text-ink-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Code */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-ink-secondary">
                Kode Voucher *
              </label>
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="contoh: HEMAT50"
                className="w-full px-3 py-2.5 bg-surface hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary font-mono uppercase"
              />
            </div>

            {/* Scope */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-ink-secondary">
                Scope *
              </label>
              <select
                value={form.scope}
                onChange={(e) => setForm((f) => ({ ...f, scope: e.target.value as CreateVoucherBody["scope"] }))}
                className="w-full px-3 py-2.5 bg-surface hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="PLATFORM">Platform (semua produk)</option>
                <option value="SELLER">Penjual tertentu</option>
                <option value="CATEGORY">Kategori tertentu</option>
              </select>
            </div>

            {/* Discount Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-ink-secondary">
                Tipe Diskon *
              </label>
              <select
                value={form.discountType}
                onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value as CreateVoucherBody["discountType"] }))}
                className="w-full px-3 py-2.5 bg-surface hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="PERCENTAGE">Persentase (%)</option>
                <option value="FIXED_AMOUNT">Nominal Tetap (Rp)</option>
              </select>
            </div>

            {/* Discount Value */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-ink-secondary">
                Nilai Diskon *{" "}
                <span className="normal-case font-normal">
                  {form.discountType === "PERCENTAGE" ? "(%)" : "(Rp)"}
                </span>
              </label>
              <input
                type="number"
                required
                min={0}
                max={form.discountType === "PERCENTAGE" ? 100 : undefined}
                value={form.discountValue}
                onChange={(e) => setForm((f) => ({ ...f, discountValue: Number(e.target.value) }))}
                className="w-full px-3 py-2.5 bg-surface hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Min Order Amount */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-ink-secondary">
                Min. Nilai Pesanan (Rp)
              </label>
              <input
                type="number"
                min={0}
                value={form.minOrderAmount ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value ? Number(e.target.value) : null }))}
                placeholder="Kosongkan = tidak ada minimum"
                className="w-full px-3 py-2.5 bg-surface hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Max Uses */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-ink-secondary">
                Maks. Penggunaan
              </label>
              <input
                type="number"
                min={1}
                value={form.maxUses ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value ? Number(e.target.value) : null }))}
                placeholder="Kosongkan = tidak terbatas"
                className="w-full px-3 py-2.5 bg-surface hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Expires At */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-ink-secondary">
                Tanggal Kadaluarsa
              </label>
              <input
                type="datetime-local"
                value={form.expiresAt ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value || null }))}
                className="w-full px-3 py-2.5 bg-surface hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <p className="text-[10px] text-ink-secondary">Kosongkan jika voucher tidak memiliki kadaluarsa.</p>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 pt-2 hairline-t">
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                className="px-4 py-2 hairline rounded-sm text-xs font-bold uppercase tracking-widest text-ink-secondary hover:bg-surface transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-5 py-2 bg-ink-primary text-white rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-ink-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {createMutation.isPending ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Voucher"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white hairline rounded-sm p-6 w-full max-w-sm flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-red-500 text-2xl mt-0.5">warning</span>
              <div>
                <h3 className="font-serif text-lg text-ink-primary">Hapus Voucher</h3>
                <p className="text-sm text-ink-secondary mt-1">
                  Yakin hapus voucher{" "}
                  <strong className="text-ink-primary font-mono">{deleteTarget.code}</strong>?
                  Tindakan ini tidak dapat dibatalkan.
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
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vouchers Table */}
      <div className="bg-white hairline rounded-sm flex flex-col">
        <div className="p-4 hairline-b flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink-primary">Daftar Voucher</h2>
          <span className="text-xs text-ink-secondary">{vouchers.length} voucher</span>
        </div>

        {isLoading && (
          <div className="p-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-hairline border-t-ink-secondary rounded-full animate-spin" />
          </div>
        )}

        {isError && (
          <div className="p-8 flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-ink-secondary">cloud_off</span>
            <p className="text-sm text-ink-secondary">Gagal memuat data voucher.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-ink-primary text-white text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-ink-primary/90 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface hairline-b">
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Kode</th>
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Tipe</th>
                  <th className="text-right text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Nilai</th>
                  <th className="text-right text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Min. Pesanan</th>
                  <th className="text-center text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Penggunaan</th>
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Scope</th>
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Kadaluarsa</th>
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Status</th>
                  <th className="text-right text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E3DC]">
                {vouchers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-sm text-ink-secondary">
                      Belum ada voucher. Klik &ldquo;Buat Voucher&rdquo; untuk menambahkan.
                    </td>
                  </tr>
                ) : (
                  vouchers.map((v) => {
                    const usageRatio = v.maxUses ? v.usedCount / v.maxUses : null;
                    const isExpired = v.expiresAt ? new Date(v.expiresAt) < new Date() : false;
                    return (
                      <tr key={v.id} className="hover:bg-surface transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono text-xs font-bold text-ink-primary bg-surface px-2 py-0.5 rounded-sm hairline">
                            {v.code}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-widest font-bold ${
                            v.discountType === "PERCENTAGE"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-purple-50 text-purple-700"
                          }`}>
                            {v.discountType === "PERCENTAGE" ? "%" : "Rp"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-ink-primary text-right tabular-nums font-medium">
                          {v.discountType === "PERCENTAGE"
                            ? `${v.discountValue}%`
                            : formatRupiah(v.discountValue)}
                        </td>
                        <td className="py-3 px-4 text-xs text-ink-secondary text-right tabular-nums">
                          {v.minOrderAmount ? formatRupiah(v.minOrderAmount) : "—"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-xs text-ink-primary tabular-nums font-medium">
                              {v.usedCount}{v.maxUses ? ` / ${v.maxUses}` : ""}
                            </span>
                            {v.maxUses && (
                              <div className="w-16 h-1 bg-surface hairline rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    usageRatio && usageRatio >= 1 ? "bg-red-500" : usageRatio && usageRatio >= 0.8 ? "bg-yellow-500" : "bg-green-500"
                                  }`}
                                  style={{ width: `${Math.min(100, (usageRatio ?? 0) * 100)}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-widest font-bold bg-surface text-ink-secondary">
                            {v.scope}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-ink-secondary">
                          {v.expiresAt ? (
                            <span className={isExpired ? "text-red-600 font-medium" : ""}>
                              {formatDate(v.expiresAt)}
                              {isExpired && " (kadaluarsa)"}
                            </span>
                          ) : (
                            <span className="text-ink-secondary/50">Tidak terbatas</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => toggleMutation.mutate(v.id)}
                            disabled={toggleMutation.isPending}
                            className={`relative inline-flex w-9 h-5 rounded-full transition-colors disabled:opacity-50 ${
                              v.isActive ? "bg-green-500" : "bg-hairline"
                            }`}
                            title={v.isActive ? "Nonaktifkan" : "Aktifkan"}
                          >
                            <span
                              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                                v.isActive ? "translate-x-4" : ""
                              }`}
                            />
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setDeleteTarget(v)}
                            className="p-1.5 text-ink-secondary hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                            title="Hapus voucher"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
