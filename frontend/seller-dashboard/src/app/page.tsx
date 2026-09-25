'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
    sold: number;
  }>;
}

interface Order {
  id: string;
  customerName?: string;
  customer?: { name: string };
  createdAt: string;
  status: string;
  total: number;
  itemsCount?: number;
}

interface OrdersResponse {
  success: boolean;
  data: Order[] | { orders: Order[]; total: number };
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

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Menunggu',
  PROCESSING: 'Diproses',
  SHIPPED: 'Dikirim',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-stone-50 text-stone-600',
  PROCESSING: 'bg-blue-50 text-blue-700',
  SHIPPED: 'bg-orange-50 text-orange-700',
  COMPLETED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-red-50 text-red-700',
};

function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function StatSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="h-3 w-24 bg-paper animate-pulse rounded-xs" />
      <div className="h-10 w-36 bg-paper animate-pulse rounded-xs" />
      <div className="h-3 w-32 bg-paper animate-pulse rounded-xs" />
    </div>
  );
}

export default function SellerDashboardHome() {
  const { seller, token } = useSellerStore();

  const [analytics, setAnalytics] = useState<SellerAnalytics | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [analyticsError, setAnalyticsError] = useState('');
  const [ordersError, setOrdersError] = useState('');

  useEffect(() => {
    if (!seller || !token) return;

    async function fetchAnalytics() {
      setIsLoadingAnalytics(true);
      setAnalyticsError('');
      try {
        const res = await apiGet<AnalyticsResponse>('/api/v1/analytics/seller/dashboard', token!);
        if (res.success) setAnalytics(normalizeAnalytics(res.data));
      } catch (err: unknown) {
        if (err instanceof Error) {
          setAnalyticsError(err.message);
        } else {
          setAnalyticsError('Gagal memuat analitik.');
        }
      } finally {
        setIsLoadingAnalytics(false);
      }
    }

    async function fetchOrders() {
      setIsLoadingOrders(true);
      setOrdersError('');
      try {
        const res = await apiGet<OrdersResponse>(
          `/api/v1/orders?sellerId=${seller!.id}&page=1&limit=5`,
          token!,
        );
        if (res.success) {
          const orders = Array.isArray(res.data)
            ? res.data
            : (res.data as { orders: Order[] }).orders ?? [];
          setRecentOrders(orders.slice(0, 5));
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setOrdersError(err.message);
        } else {
          setOrdersError('Gagal memuat pesanan.');
        }
      } finally {
        setIsLoadingOrders(false);
      }
    }

    fetchAnalytics();
    fetchOrders();
  }, [seller, token]);

  const revenue = analytics?.revenue ?? analytics?.totalRevenue ?? 0;
  const orders = analytics?.orders ?? analytics?.totalOrders ?? 0;
  const productsSold = analytics?.productsSold ?? 0;
  const averageRating = analytics?.averageRating ?? 0;
  const totalReviews = analytics?.totalReviews ?? 0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-serif text-ink-primary mb-1">
          Selamat Datang, {seller?.name ?? 'Penjual'}
        </h1>
        <p className="text-sm text-ink-secondary">
          Berikut adalah ringkasan performa toko Anda berdasarkan data sepanjang waktu.
        </p>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Main Stat — Revenue */}
        <div className="md:col-span-8 bg-white hairline rounded-sm p-6 flex flex-col justify-between h-48">
          {isLoadingAnalytics ? (
            <StatSkeleton />
          ) : analyticsError ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-ink-secondary text-sm">
                  account_balance_wallet
                </span>
                <span className="text-xs uppercase font-bold tracking-widest text-ink-secondary">
                  Pendapatan Kotor
                </span>
              </div>
              <p className="text-xs text-ink-secondary">{analyticsError}</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-ink-secondary text-sm">
                  account_balance_wallet
                </span>
                <span className="text-xs uppercase font-bold tracking-widest text-ink-secondary">
                  Pendapatan Kotor
                </span>
              </div>
              <h2 className="text-4xl font-serif text-ink-primary mt-2">
                {formatRupiah(revenue)}
              </h2>
            </div>
          )}
          <div className="text-xs text-ink-secondary">Total pendapatan toko</div>
        </div>

        {/* Secondary Stat — Orders */}
        <div className="md:col-span-4 bg-primary text-white hairline border-primary rounded-sm p-6 flex flex-col justify-between h-48">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-white/80 text-sm">
                shopping_bag
              </span>
              <span className="text-xs uppercase font-bold tracking-widest text-white/80">
                Total Pesanan
              </span>
            </div>
            {isLoadingAnalytics ? (
              <div className="h-10 w-16 bg-white/20 animate-pulse rounded-xs mt-2" />
            ) : (
              <h2 className="text-4xl font-serif text-white mt-2">{orders}</h2>
            )}
          </div>
          <Link
            href="/orders"
            className="text-sm text-white/90 hover:text-white transition-colors"
          >
            Lihat semua pesanan →
          </Link>
        </div>

        {/* Small Stat — Rating */}
        <div className="md:col-span-4 bg-white hairline rounded-sm p-6 flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-widest text-ink-secondary">
              Rating Rata-rata
            </span>
            <span className="material-symbols-outlined text-ink-secondary text-sm">
              star
            </span>
          </div>
          <div>
            {isLoadingAnalytics ? (
              <div className="h-7 w-16 bg-paper animate-pulse rounded-xs" />
            ) : (
              <div className="text-2xl font-serif text-ink-primary">
                {totalReviews > 0 ? averageRating.toFixed(1) : '—'}
              </div>
            )}
            <div className="text-[10px] text-ink-secondary mt-1">
              {totalReviews > 0 ? `${totalReviews} ulasan` : 'Belum ada ulasan'}
            </div>
          </div>
        </div>

        {/* Small Stat — Products Sold */}
        <div className="md:col-span-4 bg-white hairline rounded-sm p-6 flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-widest text-ink-secondary">
              Produk Terjual
            </span>
            <span className="material-symbols-outlined text-ink-secondary text-sm">
              inventory
            </span>
          </div>
          <div>
            {isLoadingAnalytics ? (
              <div className="h-7 w-12 bg-paper animate-pulse rounded-xs" />
            ) : (
              <div className="text-2xl font-serif text-ink-primary">
                {productsSold}
              </div>
            )}
            <div className="text-[10px] text-ink-secondary mt-1">
              Seluruh waktu
            </div>
          </div>
        </div>

        {/* Small Stat — Quick Link */}
        <div className="md:col-span-4 bg-white hairline rounded-sm p-6 flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-widest text-ink-secondary">
              Kelola Toko
            </span>
            <span className="material-symbols-outlined text-ink-secondary text-sm">
              storefront
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <Link
              href="/products"
              className="text-xs text-primary hover:underline"
            >
              → Tambah produk baru
            </Link>
            <Link
              href="/inventory"
              className="text-xs text-primary hover:underline"
            >
              → Perbarui stok inventori
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white hairline rounded-sm">
        <div className="p-5 hairline-b flex items-center justify-between">
          <h2 className="font-serif text-lg text-ink-primary">Pesanan Terbaru</h2>
          <Link
            href="/orders"
            className="text-xs text-primary hover:underline font-medium"
          >
            Lihat semua
          </Link>
        </div>

        {isLoadingOrders ? (
          <div className="p-6 flex flex-col gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-4 w-24 bg-paper animate-pulse rounded-xs" />
                <div className="h-4 w-32 bg-paper animate-pulse rounded-xs" />
                <div className="h-4 w-20 bg-paper animate-pulse rounded-xs ml-auto" />
              </div>
            ))}
          </div>
        ) : ordersError ? (
          <div className="p-6 text-sm text-ink-secondary">{ordersError}</div>
        ) : recentOrders.length === 0 ? (
          <div className="p-6 text-sm text-ink-secondary text-center">
            Belum ada pesanan masuk.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="hairline-b">
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 pt-4 px-6 pr-6">
                    ID Pesanan
                  </th>
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 pt-4 pr-6">
                    Pelanggan
                  </th>
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 pt-4 pr-6">
                    Tanggal
                  </th>
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 pt-4 pr-6">
                    Total
                  </th>
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 pt-4 pr-6">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {recentOrders.map((order) => {
                  const customerName =
                    order.customerName ?? order.customer?.name ?? '-';
                  const statusLabel = STATUS_LABELS[order.status] ?? order.status;
                  const statusColor =
                    STATUS_COLORS[order.status] ?? 'bg-stone-50 text-stone-600';
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-surface transition-colors"
                    >
                      <td className="py-3 px-6 pr-6">
                        <Link
                          href={`/orders/${order.id}`}
                          className="font-mono text-xs text-primary hover:underline"
                        >
                          #{order.id.slice(-8).toUpperCase()}
                        </Link>
                      </td>
                      <td className="py-3 pr-6 text-xs text-ink-primary">
                        {customerName}
                      </td>
                      <td className="py-3 pr-6 text-xs text-ink-secondary">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-3 pr-6 text-xs text-ink-primary tabular-nums">
                        {formatRupiah(order.total)}
                      </td>
                      <td className="py-3 pr-6">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-widest font-bold ${statusColor}`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
