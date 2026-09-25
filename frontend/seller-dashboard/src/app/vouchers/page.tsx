'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { useSellerStore } from '@/lib/store/useSellerStore';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/client';

interface Voucher {
  id: string;
  code: string;
  description?: string;
  discountType?: string;
  type?: string;
  discountValue?: number;
  value?: number;
  minPurchase?: number;
  minimumPurchase?: number;
  maxDiscount?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  maxUsage?: number;
  usageCount?: number;
  usedCount?: number;
  isActive: boolean;
  active?: boolean;
  expiresAt?: string;
  expiredAt?: string;
  startDate?: string;
  endDate?: string;
}

interface VoucherResponse {
  success: boolean;
  data: Voucher[] | { vouchers: Voucher[]; total: number };
}

interface CreateVoucherResponse {
  success: boolean;
  data: Voucher | { voucher: Voucher };
  message?: string;
}

const DISCOUNT_TYPES = [
  { value: 'PERCENTAGE', label: 'Persentase (%)' },
  { value: 'FIXED', label: 'Nominal Tetap (Rp)' },
];

const EMPTY_FORM = {
  code: '',
  discountType: 'PERCENTAGE',
  discountValue: '',
  minPurchase: '',
  maxDiscount: '',
  usageLimit: '',
  expiresAt: '',
};

function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function VouchersPage() {
  const { token } = useSellerStore();

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchVouchers = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await apiGet<VoucherResponse>(
        '/api/v1/vouchers/seller/mine',
        token,
      );
      if (res.success) {
        const list = Array.isArray(res.data)
          ? res.data
          : (res.data as { vouchers: Voucher[] }).vouchers ?? [];
        setVouchers(list);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memuat voucher.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // This effect starts an asynchronous API request; its callback owns loading/result state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchVouchers();
  }, [fetchVouchers]);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError('');
    if (!form.code.trim()) {
      setFormError('Kode voucher wajib diisi.');
      return;
    }
    if (!form.discountValue || Number(form.discountValue) <= 0) {
      setFormError('Nilai diskon harus lebih dari 0.');
      return;
    }
    if (!form.expiresAt) {
      setFormError('Tanggal kedaluwarsa wajib diisi.');
      return;
    }

    setIsCreating(true);
    try {
      const payload: Record<string, unknown> = {
        code: form.code.trim().toUpperCase(),
        type: form.discountType === 'FIXED' ? 'FIXED_AMOUNT' : form.discountType,
        value: Number(form.discountValue),
        startsAt: new Date().toISOString(),
        endsAt: new Date(form.expiresAt).toISOString(),
      };
      if (form.minPurchase) payload.minPurchase = Number(form.minPurchase);
      if (form.maxDiscount) payload.maxDiscount = Number(form.maxDiscount);
      if (form.usageLimit) payload.usageLimit = Number(form.usageLimit);

      const res = await apiPost<CreateVoucherResponse>(
        '/api/v1/vouchers/seller',
        payload,
        token!,
      );
      if (res.success) {
        let created: Voucher;
        if ('id' in res.data) {
          created = res.data as Voucher;
        } else {
          created = (res.data as { voucher: Voucher }).voucher;
        }
        setVouchers((prev) => [created, ...prev]);
        setForm(EMPTY_FORM);
        setShowCreate(false);
      } else {
        setFormError(res.message ?? 'Gagal membuat voucher.');
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Gagal membuat voucher.');
    } finally {
      setIsCreating(false);
    }
  }

  async function handleToggle(id: string) {
    if (!token || togglingId) return;
    setTogglingId(id);
    try {
      await apiPatch(`/api/v1/vouchers/${id}/toggle`, {}, token);
      setVouchers((prev) =>
        prev.map((v) =>
          v.id === id ? { ...v, isActive: !v.isActive, active: !v.isActive } : v,
        ),
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal mengubah status voucher.');
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!token) return;
    setDeletingId(id);
    try {
      await apiDelete(`/api/v1/vouchers/${id}`, token);
      setVouchers((prev) => prev.filter((v) => v.id !== id));
      setConfirmDeleteId(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus voucher.');
    } finally {
      setDeletingId(null);
    }
  }

  function handleFormChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-ink-primary mb-1">Voucher</h1>
          <p className="text-sm text-ink-secondary">
            Buat dan kelola voucher diskon untuk toko Anda.
          </p>
        </div>
        <button
          onClick={() => {
            setShowCreate(true);
            setFormError('');
          }}
          className="bg-primary hover:bg-primary-hover text-white text-xs uppercase font-bold tracking-widest px-6 py-3 rounded-sm transition-colors flex items-center gap-2 w-fit"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Buat Voucher
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 hairline border-red-200 rounded-sm px-4 py-3 text-sm text-red-700">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
          <button
            onClick={fetchVouchers}
            className="ml-auto text-xs underline"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Create Voucher Form */}
      {showCreate && (
        <div className="bg-white hairline rounded-sm">
          <div className="p-5 hairline-b flex items-center justify-between">
            <h2 className="font-serif text-lg text-ink-primary">
              Buat Voucher Baru
            </h2>
            <button
              onClick={() => {
                setShowCreate(false);
                setForm(EMPTY_FORM);
                setFormError('');
              }}
              className="text-ink-secondary hover:text-ink-primary transition-colors"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
          <form onSubmit={handleCreate} className="p-6 flex flex-col gap-5">
            {formError && (
              <div className="flex items-center gap-2 bg-red-50 hairline border-red-200 rounded-sm px-4 py-3 text-sm text-red-700">
                <span className="material-symbols-outlined text-sm">error</span>
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-ink-secondary">
                  Kode Voucher <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={handleFormChange}
                  placeholder="DISKON10"
                  className="w-full px-4 py-3 bg-surface hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary font-mono uppercase"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-ink-secondary">
                  Jenis Diskon
                </label>
                <select
                  name="discountType"
                  value={form.discountType}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 bg-surface hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {DISCOUNT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-ink-secondary">
                  Nilai Diskon <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="discountValue"
                  value={form.discountValue}
                  onChange={handleFormChange}
                  placeholder={form.discountType === 'PERCENTAGE' ? '10' : '50000'}
                  min="0"
                  className="w-full px-4 py-3 bg-surface hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-ink-secondary">
                  Min. Pembelian (Rp)
                </label>
                <input
                  type="number"
                  name="minPurchase"
                  value={form.minPurchase}
                  onChange={handleFormChange}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-3 bg-surface hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              {form.discountType === 'PERCENTAGE' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-ink-secondary">
                    Maks. Diskon (Rp)
                  </label>
                  <input
                    type="number"
                    name="maxDiscount"
                    value={form.maxDiscount}
                    onChange={handleFormChange}
                    placeholder="100000"
                    min="0"
                    className="w-full px-4 py-3 bg-surface hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-ink-secondary">
                  Maks. Penggunaan
                </label>
                <input
                  type="number"
                  name="usageLimit"
                  value={form.usageLimit}
                  onChange={handleFormChange}
                  placeholder="100"
                  min="1"
                  className="w-full px-4 py-3 bg-surface hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 max-w-xs">
              <label className="text-xs font-bold uppercase tracking-widest text-ink-secondary">
                Berlaku Hingga
              </label>
              <input
                type="datetime-local"
                name="expiresAt"
                value={form.expiresAt}
                onChange={handleFormChange}
                className="w-full px-4 py-3 bg-surface hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex gap-3 pt-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowCreate(false);
                  setForm(EMPTY_FORM);
                  setFormError('');
                }}
                className="px-6 py-3 hairline rounded-sm text-sm font-medium text-ink-secondary hover:bg-surface transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-6 py-3 bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-sm transition-colors flex items-center gap-2"
              >
                {isCreating ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">
                      progress_activity
                    </span>
                    Membuat...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">
                      confirmation_number
                    </span>
                    Buat Voucher
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Voucher List */}
      <div className="bg-white hairline rounded-sm flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface text-[10px] uppercase tracking-widest text-ink-secondary border-b border-hairline">
                <th className="px-4 py-3 font-bold">Kode</th>
                <th className="px-4 py-3 font-bold">Deskripsi</th>
                <th className="px-4 py-3 font-bold">Diskon</th>
                <th className="px-4 py-3 font-bold">Min. Beli</th>
                <th className="px-4 py-3 font-bold text-center">Terpakai</th>
                <th className="px-4 py-3 font-bold">Berlaku Hingga</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="border-b border-hairline">
                    {[...Array(8)].map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-full bg-paper animate-pulse rounded-xs" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : vouchers.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-sm text-ink-secondary"
                  >
                    Belum ada voucher. Buat voucher pertama Anda!
                  </td>
                </tr>
              ) : (
                vouchers.map((voucher) => {
                  const isActive = voucher.isActive || voucher.active;
                  const discountType = voucher.discountType ?? voucher.type ?? 'FIXED';
                  const discountValue = voucher.discountValue ?? voucher.value ?? 0;
                  const minPurchase = voucher.minPurchase ?? voucher.minimumPurchase ?? 0;
                  const usageCount = voucher.usageCount ?? voucher.usedCount ?? 0;
                  const usageLimit = voucher.usageLimit ?? voucher.maxUsage;
                  const expiresAt = voucher.expiresAt ?? voucher.expiredAt ?? voucher.endDate;
                  const isToggling = togglingId === voucher.id;
                  const isDeleting = deletingId === voucher.id;

                  const discountLabel =
                    discountType === 'PERCENTAGE'
                      ? `${discountValue}%`
                      : formatRupiah(discountValue);

                  return (
                    <tr
                      key={voucher.id}
                      className="border-b border-hairline last:border-b-0 hover:bg-surface/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-bold text-ink-primary bg-surface px-2 py-1 rounded-sm hairline">
                          {voucher.code}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-secondary max-w-[180px]">
                        <span className="line-clamp-2">
                          {voucher.description || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold text-ink-primary">
                          {discountLabel}
                        </span>
                        {discountType === 'PERCENTAGE' &&
                          (voucher.maxDiscount ?? voucher.maximumDiscount) ? (
                          <p className="text-[10px] text-ink-secondary mt-0.5">
                            maks.{' '}
                            {formatRupiah(
                              voucher.maxDiscount ?? voucher.maximumDiscount ?? 0,
                            )}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-secondary tabular-nums">
                        {minPurchase > 0 ? formatRupiah(minPurchase) : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-center tabular-nums text-ink-primary">
                        {usageCount}
                        {usageLimit ? (
                          <span className="text-ink-secondary">
                            /{usageLimit}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-secondary whitespace-nowrap">
                        {formatDate(expiresAt)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggle(voucher.id)}
                          disabled={isToggling}
                          className={`relative w-10 h-5 rounded-full transition-colors disabled:opacity-50 ${
                            isActive ? 'bg-primary' : 'bg-stone-300'
                          }`}
                          title={isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                              isActive ? 'translate-x-5' : ''
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setConfirmDeleteId(voucher.id)}
                          disabled={isDeleting}
                          className="w-8 h-8 flex items-center justify-center text-ink-secondary hover:text-red-600 transition-colors rounded-sm hover:bg-red-50 ml-auto disabled:opacity-50"
                          title="Hapus"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            delete
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white hairline rounded-sm p-6 max-w-sm w-full shadow-lg">
            <h3 className="font-serif text-lg text-ink-primary mb-2">
              Hapus Voucher
            </h3>
            <p className="text-sm text-ink-secondary mb-6">
              Apakah Anda yakin ingin menghapus voucher ini? Tindakan ini tidak
              dapat dibatalkan.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDeleteId(null)}
                disabled={deletingId === confirmDeleteId}
                className="px-5 py-2.5 hairline rounded-sm text-sm font-medium text-ink-secondary hover:bg-surface transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={deletingId === confirmDeleteId}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-sm text-sm font-medium transition-colors flex items-center gap-2"
              >
                {deletingId === confirmDeleteId ? (
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
