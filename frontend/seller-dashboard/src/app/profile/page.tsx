'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useSellerStore } from '@/lib/store/useSellerStore';
import { apiGet, apiPatch } from '@/lib/api/client';
import DispatchOriginSection from './DispatchOriginSection';

interface SellerProfile {
  id: string;
  storeName?: string;
  storeDescription?: string;
  storeAddress?: string;
  description?: string;
  phone?: string;
  address?: string;
  isVerified?: boolean;
  verificationStatus?: string;
  totalProducts?: number;
  totalOrders?: number;
}

interface ProfileResponse {
  success: boolean;
  data: SellerProfile | { sellerProfile: SellerProfile; seller: SellerProfile };
}

interface StatsResponse {
  success: boolean;
  data: {
    overview?: { totalProducts?: number; totalOrders?: number };
    totalProducts?: number;
    totalOrders?: number;
  };
}

interface FormState {
  storeName: string;
  description: string;
  phone: string;
  address: string;
}

function FieldSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="h-3 w-24 bg-paper animate-pulse rounded-xs" />
      <div className="h-11 w-full bg-paper animate-pulse rounded-sm" />
    </div>
  );
}

export default function ProfilePage() {
  const { seller, token } = useSellerStore();

  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [totalOrders, setTotalOrders] = useState<number | null>(null);

  const [form, setForm] = useState<FormState>({
    storeName: '',
    description: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (!token) return;

    async function fetchProfile() {
      setIsLoading(true);
      setError('');
      try {
        const [res, userRes] = await Promise.all([apiGet<ProfileResponse>(
          '/api/v1/users/seller-profile/me',
          token!,
        ), apiGet<{ success: boolean; data: { phone?: string | null } }>('/api/v1/users/me', token!)]);
        if (res.success) {
          let data: SellerProfile;
          if ('storeName' in res.data || 'id' in res.data) {
            data = res.data as unknown as SellerProfile;
          } else {
            const nested = res.data as { sellerProfile?: SellerProfile; seller?: SellerProfile };
            data = nested.sellerProfile ?? nested.seller ?? (res.data as unknown as SellerProfile);
          }
          data = { ...data, description: data.storeDescription, address: data.storeAddress, phone: userRes.data.phone ?? '' };
          setProfile(data);
          setForm({
            storeName: data.storeName ?? '',
            description: data.description ?? '',
            phone: data.phone ?? '',
            address: data.address ?? '',
          });
          if (data.totalProducts != null) setTotalProducts(data.totalProducts);
          if (data.totalOrders != null) setTotalOrders(data.totalOrders);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Gagal memuat profil.');
      } finally {
        setIsLoading(false);
      }
    }

    async function fetchStats() {
      if (!seller) return;
      try {
        const res = await apiGet<StatsResponse>(
          `/api/v1/analytics/seller/dashboard`,
          token!,
        );
        if (res.success) {
          setTotalProducts(
            res.data.overview?.totalProducts ?? res.data.totalProducts ?? null,
          );
          setTotalOrders(
            res.data.overview?.totalOrders ?? res.data.totalOrders ?? null,
          );
        }
      } catch {
        // stats are optional
      }
    }

    fetchProfile();
    fetchStats();
  }, [token, seller]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaveError('');
    setIsSaving(true);
    try {
      const profileUpdate = apiPatch(
        '/api/v1/users/seller-profile/me',
        {
          storeName: form.storeName.trim() || undefined,
          storeDescription: form.description.trim() || undefined,
          storeAddress: form.address.trim() || undefined,
        },
        token!,
      );
      const accountUpdate = apiPatch('/api/v1/users/me', { phone: form.phone.trim() || undefined }, token!);
      await Promise.all([profileUpdate, accountUpdate]);
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              storeName: form.storeName,
              description: form.description,
              phone: form.phone,
              address: form.address,
            }
          : prev,
      );
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      setSaveError(
        err instanceof Error ? err.message : 'Gagal menyimpan perubahan.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  const verified =
    profile?.isVerified ||
    profile?.verificationStatus === 'VERIFIED' ||
    profile?.verificationStatus === 'APPROVED';

  const verificationLabel = verified
    ? 'Terverifikasi'
    : profile?.verificationStatus === 'PENDING'
      ? 'Menunggu Verifikasi'
      : 'Belum Terverifikasi';

  const verificationColor = verified
    ? 'bg-green-50 text-green-700'
    : profile?.verificationStatus === 'PENDING'
      ? 'bg-yellow-50 text-yellow-700'
      : 'bg-stone-50 text-stone-600';

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-ink-primary mb-1">
            Profil Toko
          </h1>
          <p className="text-sm text-ink-secondary">
            Kelola informasi dan identitas toko Anda.
          </p>
        </div>
        {!isLoading && !isEditing && (
          <button
            onClick={() => {
              setIsEditing(true);
              setSaveError('');
            }}
            className="bg-primary hover:bg-primary-hover text-white text-xs uppercase font-bold tracking-widest px-6 py-3 rounded-sm transition-colors flex items-center gap-2 w-fit"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
            Edit Profil
          </button>
        )}
      </div>

      {/* Success Banner */}
      {saveSuccess && (
        <div className="flex items-center gap-2 bg-green-50 hairline border-green-200 rounded-sm px-4 py-3 text-sm text-green-700">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          Profil berhasil diperbarui.
        </div>
      )}

      {/* Error Banner */}
      {(error || saveError) && (
        <div className="flex items-center gap-2 bg-red-50 hairline border-red-200 rounded-sm px-4 py-3 text-sm text-red-700">
          <span className="material-symbols-outlined text-sm">error</span>
          {error || saveError}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Verification Status */}
        <div className="bg-white hairline rounded-sm p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-ink-secondary text-sm">
              verified_user
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-ink-secondary">
              Status Akun
            </span>
          </div>
          {isLoading ? (
            <div className="h-6 w-28 bg-paper animate-pulse rounded-sm" />
          ) : (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs uppercase tracking-widest font-bold w-fit ${verificationColor}`}
            >
              {verified && (
                <span className="material-symbols-outlined text-[14px] fill-1">
                  verified
                </span>
              )}
              {verificationLabel}
            </span>
          )}
        </div>

        {/* Total Products */}
        <div className="bg-white hairline rounded-sm p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-ink-secondary text-sm">
              inventory_2
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-ink-secondary">
              Total Produk
            </span>
          </div>
          {isLoading || totalProducts === null ? (
            <div className="h-8 w-16 bg-paper animate-pulse rounded-xs" />
          ) : (
            <span className="text-3xl font-serif text-ink-primary">
              {totalProducts}
            </span>
          )}
        </div>

        {/* Total Orders */}
        <div className="bg-white hairline rounded-sm p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-ink-secondary text-sm">
              receipt_long
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-ink-secondary">
              Total Pesanan
            </span>
          </div>
          {isLoading || totalOrders === null ? (
            <div className="h-8 w-16 bg-paper animate-pulse rounded-xs" />
          ) : (
            <span className="text-3xl font-serif text-ink-primary">
              {totalOrders}
            </span>
          )}
        </div>
      </div>

      {/* Profile Form / View */}
      <div className="bg-white hairline rounded-sm">
        <div className="p-5 hairline-b flex items-center justify-between">
          <h2 className="font-serif text-lg text-ink-primary">
            Informasi Toko
          </h2>
          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setSaveError('');
                // Reset form to current profile values
                if (profile) {
                  setForm({
                    storeName: profile.storeName ?? '',
                    description: profile.description ?? '',
                    phone: profile.phone ?? '',
                    address: profile.address ?? '',
                  });
                }
              }}
              className="text-xs text-ink-secondary hover:text-ink-primary transition-colors"
            >
              Batal
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="p-6 flex flex-col gap-5">
            <FieldSkeleton />
            <FieldSkeleton />
            <FieldSkeleton />
            <FieldSkeleton />
            <FieldSkeleton />
          </div>
        ) : isEditing ? (
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-ink-secondary">
                Nama Toko
              </label>
              <input
                type="text"
                name="storeName"
                value={form.storeName}
                onChange={handleChange}
                placeholder="Masukkan nama toko"
                className="w-full px-4 py-3 bg-surface hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-ink-secondary">
                Deskripsi Toko
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Ceritakan tentang toko Anda..."
                className="w-full px-4 py-3 bg-surface hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-ink-secondary">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-4 py-3 bg-surface hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-ink-secondary">
                Alamat Toko
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={3}
                placeholder="Alamat lengkap toko"
                className="w-full px-4 py-3 bg-surface hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setSaveError('');
                }}
                className="px-6 py-3 hairline rounded-sm text-sm font-medium text-ink-secondary hover:bg-surface transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-sm transition-colors flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">
                      progress_activity
                    </span>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">save</span>
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 flex flex-col gap-5">
            {[
              {
                label: 'Nama Toko',
                value: profile?.storeName,
                icon: 'store',
              },
              {
                label: 'Deskripsi',
                value: profile?.description,
                icon: 'description',
                multi: true,
              },
              {
                label: 'Nomor Telepon',
                value: profile?.phone,
                icon: 'phone',
              },
              {
                label: 'Alamat',
                value: profile?.address,
                icon: 'location_on',
                multi: true,
              },
            ].map((field) => (
              <div key={field.label} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-ink-secondary text-sm">
                    {field.icon}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-ink-secondary">
                    {field.label}
                  </span>
                </div>
                {field.value ? (
                  <p
                    className={`text-sm text-ink-primary bg-surface rounded-sm px-4 py-3 hairline ${
                      field.multi ? 'whitespace-pre-wrap' : ''
                    }`}
                  >
                    {field.value}
                  </p>
                ) : (
                  <p className="text-sm text-ink-secondary italic px-4 py-3">
                    Belum diisi
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <DispatchOriginSection token={token} />

      {/* Account Info (read-only) */}
      <div className="bg-white hairline rounded-sm">
        <div className="p-5 hairline-b">
          <h2 className="font-serif text-lg text-ink-primary">
            Informasi Akun
          </h2>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase tracking-widest text-ink-secondary">
                Nama
              </span>
              <p className="text-sm text-ink-primary bg-surface rounded-sm px-4 py-3 hairline">
                {seller?.name ?? '—'}
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase tracking-widest text-ink-secondary">
                Email
              </span>
              <p className="text-sm text-ink-primary bg-surface rounded-sm px-4 py-3 hairline">
                {seller?.email ?? '—'}
              </p>
            </div>
          </div>
          <p className="text-xs text-ink-secondary">
            Untuk mengubah nama atau email, hubungi tim dukungan NEXA.
          </p>
        </div>
      </div>
    </div>
  );
}
