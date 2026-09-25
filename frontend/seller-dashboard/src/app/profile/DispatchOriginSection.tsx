'use client';

import { FormEvent, useEffect, useState } from 'react';
import { apiGet, apiPut } from '@/lib/api/client';

/**
 * The seller's dispatch origin.
 *
 * Shipments are quoted per seller from this location, so it is the input that
 * decides what a customer pays for delivery. A seller may propose it but not
 * approve it: saving always clears verification and an administrator reviews
 * the new location before quotes will use it.
 */

interface DispatchOrigin {
  originCity: string | null;
  originProvince: string | null;
  originVerifiedAt: string | null;
}

interface OriginResponse {
  success: boolean;
  data: DispatchOrigin | { sellerProfile: DispatchOrigin };
}

function unwrap(payload: OriginResponse['data']): DispatchOrigin {
  return 'sellerProfile' in payload ? payload.sellerProfile : payload;
}

export default function DispatchOriginSection({ token }: { token: string | null }) {
  const [origin, setOrigin] = useState<DispatchOrigin | null>(null);
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    (async () => {
      try {
        const response = await apiGet<OriginResponse>('/api/v1/users/seller-profile/me', token);
        if (cancelled) return;
        const current = unwrap(response.data);
        setOrigin(current);
        setCity(current.originCity ?? '');
        setProvince(current.originProvince ?? '');
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Lokasi pengiriman gagal dimuat.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSaved(false);
    setIsSaving(true);

    try {
      const response = await apiPut<OriginResponse>(
        '/api/v1/users/seller-profile/me/dispatch-origin',
        { originCity: city.trim(), originProvince: province.trim() },
        token ?? undefined,
      );
      setOrigin(unwrap(response.data));
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lokasi pengiriman gagal disimpan.');
    } finally {
      setIsSaving(false);
    }
  };

  const isVerified = Boolean(origin?.originVerifiedAt);
  const hasOrigin = Boolean(origin?.originCity && origin?.originProvince);

  return (
    <div className="bg-white hairline rounded-sm">
      <div className="p-5 hairline-b">
        <h2 className="font-serif text-lg text-ink-primary">Lokasi Pengiriman</h2>
        <p className="text-xs text-ink-secondary mt-1">
          Ongkos kirim dihitung dari lokasi ini ke alamat pembeli. Perubahan perlu diverifikasi
          admin sebelum dipakai untuk menghitung ongkir.
        </p>
      </div>

      <div className="p-6 flex flex-col gap-4">
        {isLoading ? (
          <div className="h-11 w-full bg-paper animate-pulse rounded-sm" />
        ) : (
          <>
            <div
              role="status"
              className={`text-xs px-4 py-3 rounded-sm hairline ${
                isVerified
                  ? 'bg-emerald-50 text-emerald-900'
                  : 'bg-amber-50 text-amber-900'
              }`}
            >
              {isVerified
                ? 'Lokasi terverifikasi. Produk Anda dapat dihitung ongkos kirimnya.'
                : hasOrigin
                  ? 'Menunggu verifikasi admin. Sampai terverifikasi, pembeli belum bisa checkout untuk produk Anda.'
                  : 'Belum ada lokasi pengiriman. Pembeli belum bisa checkout untuk produk Anda.'}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-widest text-ink-secondary">
                    Kota Asal
                  </span>
                  <input
                    required
                    minLength={2}
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    className="text-sm bg-surface rounded-sm px-4 py-3 hairline"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-widest text-ink-secondary">
                    Provinsi Asal
                  </span>
                  <input
                    required
                    minLength={2}
                    value={province}
                    onChange={(event) => setProvince(event.target.value)}
                    className="text-sm bg-surface rounded-sm px-4 py-3 hairline"
                  />
                </label>
              </div>

              {error && (
                <p role="alert" className="text-xs text-rose-800">
                  {error}
                </p>
              )}
              {saved && (
                <p role="status" className="text-xs text-amber-900">
                  Tersimpan. Menunggu verifikasi admin.
                </p>
              )}

              <button
                type="submit"
                disabled={isSaving || !city.trim() || !province.trim()}
                className="self-start px-5 py-3 text-xs font-bold uppercase tracking-widest bg-ink-primary text-white rounded-sm disabled:opacity-50"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Lokasi'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
