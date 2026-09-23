'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSellerStore } from '@/lib/store/useSellerStore';
import { apiGet } from '@/lib/api/client';

interface SellerAnalytics {
  revenue?: number;
  totalRevenue?: number;
  monthlyRevenue?: number;
  orders?: number;
  totalOrders?: number;
  conversionRate?: number;
  productsSold?: number;
  topProducts?: Array<{
    id: string;
    name: string;
    revenue: number;
    sold?: number;
    quantity?: number;
  }>;
}

interface DailySale {
  date: string;
  revenue: number;
  orders?: number;
}

interface AnalyticsResponse {
  success: boolean;
  data: SellerAnalytics;
}

interface DailySalesResponse {
  success: boolean;
  data: DailySale[] | { sales: DailySale[] };
}

type DateRange = '7d' | '30d' | '3m';

const DATE_RANGE_OPTIONS: { key: DateRange; label: string; days: number }[] = [
  { key: '7d', label: '7 Hari', days: 7 },
  { key: '30d', label: '30 Hari', days: 30 },
  { key: '3m', label: '3 Bulan', days: 90 },
];

function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
  });
}

function getDateRange(days: number): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

export default function AnalyticsPage() {
  const { seller, token } = useSellerStore();

  const [analytics, setAnalytics] = useState<SellerAnalytics | null>(null);
  const [dailySales, setDailySales] = useState<DailySale[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [isLoadingDaily, setIsLoadingDaily] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!seller || !token) return;

    async function fetchAnalytics() {
      setIsLoadingAnalytics(true);
      try {
        const res = await apiGet<AnalyticsResponse>(
          `/api/v1/analytics/seller/${seller!.id}`,
          token!,
        );
        if (res.success) setAnalytics(res.data);
      } catch {
        try {
          const res2 = await apiGet<AnalyticsResponse>(
            `/api/v1/analytics/sellers?sellerId=${seller!.id}`,
            token!,
          );
          if (res2.success) setAnalytics(res2.data);
        } catch (err: unknown) {
          setError(
            err instanceof Error ? err.message : 'Gagal memuat analitik.',
          );
        }
      } finally {
        setIsLoadingAnalytics(false);
      }
    }

    fetchAnalytics();
  }, [seller, token]);

  const fetchDailySales = useCallback(async () => {
    if (!seller || !token) return;
    setIsLoadingDaily(true);
    try {
      const rangeDays =
        DATE_RANGE_OPTIONS.find((r) => r.key === dateRange)?.days ?? 30;
      const { startDate, endDate } = getDateRange(rangeDays);
      const params = new URLSearchParams({
        sellerId: seller.id,
        startDate,
        endDate,
      });
      const res = await apiGet<DailySalesResponse>(
        `/api/v1/analytics/sales/daily?${params.toString()}`,
        token,
      );
      if (res.success) {
        const list = Array.isArray(res.data)
          ? res.data
          : (res.data as { sales: DailySale[] }).sales ?? [];
        setDailySales(list);
      }
    } catch {
      // Daily sales is optional — fail silently
    } finally {
      setIsLoadingDaily(false);
    }
  }, [seller, token, dateRange]);

  useEffect(() => {
    fetchDailySales();
  }, [fetchDailySales]);

  const revenue = analytics?.revenue ?? analytics?.totalRevenue ?? 0;
  const monthlyRevenue = analytics?.monthlyRevenue ?? 0;
  const totalOrders = analytics?.orders ?? analytics?.totalOrders ?? 0;
  const conversionRate = analytics?.conversionRate ?? 0;
  const topProducts = analytics?.topProducts ?? [];

  const maxDailyRevenue = Math.max(...dailySales.map((d) => d.revenue), 1);

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
            label: 'Pendapatan Bulan Ini',
            value: isLoadingAnalytics ? null : formatRupiah(monthlyRevenue),
            icon: 'calendar_month',
            sub: 'Bulan berjalan',
          },
          {
            label: 'Total Pesanan',
            value: isLoadingAnalytics ? null : String(totalOrders),
            icon: 'receipt_long',
            sub: 'Semua status',
          },
          {
            label: 'Konversi',
            value: isLoadingAnalytics
              ? null
              : `${conversionRate.toFixed(1)}%`,
            icon: 'analytics',
            sub: 'Rata-rata industri: 2.1%',
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
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 className="font-serif text-lg text-ink-primary">
            Pendapatan Harian
          </h2>
          <div className="flex gap-1 bg-surface hairline rounded-sm p-1">
            {DATE_RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setDateRange(opt.key)}
                className={`px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-widest transition-colors ${
                  dateRange === opt.key
                    ? 'bg-white hairline text-ink-primary shadow-sm'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {isLoadingDaily ? (
          <div className="flex items-end gap-1 h-40">
            {[...Array(14)].map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-paper animate-pulse rounded-t-xs"
                style={{ height: `${Math.random() * 80 + 20}%` }}
              />
            ))}
          </div>
        ) : dailySales.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-sm text-ink-secondary">
            Tidak ada data penjualan harian.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Bar Chart */}
            <div className="flex items-end gap-1 h-48 overflow-x-auto">
              {dailySales.map((sale) => {
                const heightPct =
                  maxDailyRevenue > 0
                    ? (sale.revenue / maxDailyRevenue) * 100
                    : 0;
                return (
                  <div
                    key={sale.date}
                    className="flex flex-col items-center gap-1 flex-1 min-w-[24px] group"
                    title={`${formatDate(sale.date)}: ${formatRupiah(sale.revenue)}`}
                  >
                    <div
                      className="w-full bg-primary/20 group-hover:bg-primary/40 rounded-t-xs transition-colors relative"
                      style={{ height: `${Math.max(heightPct, 2)}%` }}
                    >
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-xs"
                        style={{ height: `${Math.max(heightPct, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Date Labels (sampled) */}
            <div className="flex gap-1 overflow-x-auto">
              {dailySales
                .filter(
                  (_, i) =>
                    i % Math.max(1, Math.floor(dailySales.length / 7)) === 0,
                )
                .map((sale) => (
                  <div
                    key={sale.date}
                    className="text-[10px] text-ink-secondary whitespace-nowrap flex-1 text-center"
                  >
                    {formatDate(sale.date)}
                  </div>
                ))}
            </div>
          </div>
        )}
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
