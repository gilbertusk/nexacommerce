'use client';

import { useState, useEffect } from 'react';
import { useSellerStore } from '@/lib/store/useSellerStore';
import { apiGet } from '@/lib/api/client';

interface SellerAnalytics {
  revenue?: number;
  totalRevenue?: number;
  orders?: number;
  totalOrders?: number;
  productsSold?: number;
  averageRating?: number;
  totalReviews?: number;
  topProducts?: Array<{
    id: string;
    name: string;
    revenue: number;
    sold?: number;
    quantity?: number;
  }>;
}

interface AnalyticsResponse {
  success: boolean;
  data: {
    overview: { totalRevenue: number; totalOrders: number; totalItemsSold: number; averageRating: number; totalReviews: number };
    topProducts: Array<{ productId: string; productName: string; revenue: number; unitsSold: number }>;
  };
}

function normalizeAnalytics(data: AnalyticsResponse['data']): SellerAnalytics {
  return {
    totalRevenue: data.overview.totalRevenue,
    totalOrders: data.overview.totalOrders,
    productsSold: data.overview.totalItemsSold,
    averageRating: data.overview.averageRating,
    totalReviews: data.overview.totalReviews,
    topProducts: data.topProducts.map((product) => ({
      id: product.productId,
      name: product.productName,
      revenue: product.revenue,
      sold: product.unitsSold,
    })),
  };
}

function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

export default function AnalyticsPage() {
  const { seller, token } = useSellerStore();

  const [analytics, setAnalytics] = useState<SellerAnalytics | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!seller || !token) return;

    async function fetchAnalytics() {
      setIsLoadingAnalytics(true);
      try {
        const res = await apiGet<AnalyticsResponse>('/api/v1/analytics/seller/dashboard', token!);
        if (res.success) setAnalytics(normalizeAnalytics(res.data));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Gagal memuat analitik.');
      } finally {
        setIsLoadingAnalytics(false);
      }
    }

    fetchAnalytics();
  }, [seller, token]);

  const revenue = analytics?.revenue ?? analytics?.totalRevenue ?? 0;
  const totalOrders = analytics?.orders ?? analytics?.totalOrders ?? 0;
  const productsSold = analytics?.productsSold ?? 0;
  const averageRating = analytics?.averageRating ?? 0;
  const totalReviews = analytics?.totalReviews ?? 0;
  const topProducts = analytics?.topProducts ?? [];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif text-ink-primary mb-1">Analitik</h1>
        <p className="text-sm text-ink-secondary">
          Pantau performa penjualan dan tren toko Anda.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 hairline border-red-200 rounded-sm px-4 py-3 text-sm text-red-700">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Pendapatan',
            value: isLoadingAnalytics ? null : formatRupiah(revenue),
            icon: 'account_balance_wallet',
            sub: 'Seluruh waktu',
          },
          {
            label: 'Unit Terjual',
            value: isLoadingAnalytics ? null : String(productsSold),
            icon: 'inventory_2',
            sub: 'Seluruh waktu',
          },
          {
            label: 'Total Pesanan',
            value: isLoadingAnalytics ? null : String(totalOrders),
            icon: 'receipt_long',
            sub: 'Semua status',
          },
          {
            label: 'Rating Rata-rata',
            value: isLoadingAnalytics ? null : totalReviews > 0 ? averageRating.toFixed(1) : '—',
            icon: 'star',
            sub: totalReviews > 0 ? `${totalReviews} ulasan` : 'Belum ada ulasan',
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white hairline rounded-sm p-5 flex flex-col gap-3"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-ink-secondary text-sm">
                {card.icon}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-ink-secondary">
                {card.label}
              </span>
            </div>
            {card.value === null ? (
              <div className="h-8 w-28 bg-paper animate-pulse rounded-xs" />
            ) : (
              <div className="text-2xl font-serif text-ink-primary">
                {card.value}
              </div>
            )}
            <div className="text-[10px] text-ink-secondary">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Daily Revenue Chart */}
      <div className="bg-white hairline rounded-sm p-6">
        <h2 className="font-serif text-lg text-ink-primary mb-4">Pendapatan Harian</h2>
        <div className="h-40 flex items-center justify-center text-sm text-ink-secondary">
          Data tren harian belum disediakan oleh API analitik penjual.
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white hairline rounded-sm">
        <div className="p-5 hairline-b">
          <h2 className="font-serif text-lg text-ink-primary">
            Produk Terlaris
          </h2>
        </div>
        {isLoadingAnalytics ? (
          <div className="p-5 flex flex-col gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-4 w-6 bg-paper animate-pulse rounded-xs" />
                <div className="h-4 flex-1 bg-paper animate-pulse rounded-xs" />
                <div className="h-4 w-24 bg-paper animate-pulse rounded-xs" />
              </div>
            ))}
          </div>
        ) : topProducts.length === 0 ? (
          <div className="p-6 text-sm text-ink-secondary text-center">
            Tidak ada data produk terlaris.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="hairline-b">
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 pt-4 px-5 w-10">
                    #
                  </th>
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 pt-4 pr-5">
                    Nama Produk
                  </th>
                  <th className="text-right text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 pt-4 pr-5">
                    Terjual
                  </th>
                  <th className="text-right text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 pt-4 pr-5">
                    Pendapatan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {topProducts.slice(0, 10).map((product, idx) => (
                  <tr
                    key={product.id}
                    className="hover:bg-surface transition-colors"
                  >
                    <td className="py-3 px-5 text-xs font-bold text-ink-secondary">
                      {idx + 1}
                    </td>
                    <td className="py-3 pr-5 font-medium text-ink-primary">
                      {product.name}
                    </td>
                    <td className="py-3 pr-5 text-right tabular-nums text-ink-secondary text-xs">
                      {product.sold ?? product.quantity ?? 0}
                    </td>
                    <td className="py-3 pr-5 text-right tabular-nums font-medium text-ink-primary">
                      {formatRupiah(product.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
