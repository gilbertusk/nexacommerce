"use client";

import { useQuery } from "@tanstack/react-query";
import { useAdminStore } from "@/lib/store/useAdminStore";
import { apiGet } from "@/lib/api/client";

interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  revenueChart: Array<{ label: string; value: number }>;
  topProducts: Array<{ name: string; sales: number; revenue: number }>;
}

interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}

function formatRupiah(value: number): string {
  if (value >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(1)}Jt`;
  }
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function StatSkeleton({ wide = false }: { wide?: boolean }) {
  return (
    <div className={`${wide ? "md:col-span-8" : "md:col-span-4"} bg-white hairline rounded-sm p-6 h-48 flex flex-col gap-4`}>
      <div className="h-3 w-32 animate-shimmer rounded-sm" />
      <div className="h-8 w-48 animate-shimmer rounded-sm mt-2" />
      <div className="h-3 w-24 animate-shimmer rounded-sm mt-auto" />
    </div>
  );
}

function SmallStatSkeleton() {
  return (
    <div className="md:col-span-4 bg-white hairline rounded-sm p-6 h-32 flex flex-col gap-3">
      <div className="h-3 w-24 animate-shimmer rounded-sm" />
      <div className="h-6 w-16 animate-shimmer rounded-sm mt-auto" />
    </div>
  );
}

export default function AdminDashboardHome() {
  const token = useAdminStore((s) => s.token);

  const { data, isLoading, isError, refetch } = useQuery<DashboardResponse>({
    queryKey: ["analytics-dashboard"],
    queryFn: () => apiGet<DashboardResponse>("/analytics/dashboard", token ?? undefined),
    enabled: !!token,
  });

  const stats = data?.data;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <div className="h-6 w-48 animate-shimmer rounded-sm mb-2" />
          <div className="h-4 w-72 animate-shimmer rounded-sm" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <StatSkeleton wide />
          <StatSkeleton />
          <SmallStatSkeleton />
          <SmallStatSkeleton />
          <SmallStatSkeleton />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-serif text-ink-primary mb-1">Platform Overview</h1>
          <p className="text-sm text-ink-secondary">Ringkasan performa dan metrik kesehatan NexaCommerce.</p>
        </div>
        <div className="bg-white hairline rounded-sm p-8 flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-4xl text-ink-secondary">cloud_off</span>
          <p className="text-sm text-ink-secondary">Gagal memuat data analitik.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-ink-primary text-white text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-ink-primary/90 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-serif text-ink-primary mb-1">Platform Overview</h1>
        <p className="text-sm text-ink-secondary">Ringkasan performa dan metrik kesehatan NexaCommerce.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Main Stat — Total Revenue */}
        <div className="md:col-span-8 bg-ink-primary text-white hairline border-ink-primary rounded-sm p-6 flex flex-col justify-between h-48">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-white/60 text-sm">payments</span>
              <span className="text-xs uppercase font-bold tracking-widest text-white/60">Total GMV (Bulan Ini)</span>
            </div>
            <h2 className="text-4xl font-serif mt-2">
              {stats ? formatRupiah(stats.totalRevenue) : "—"}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-400 bg-white/10 px-2 py-0.5 rounded-sm font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[10px]">trending_up</span>
              Platform aktif
            </span>
            <span className="text-white/50 text-xs">data real-time</span>
          </div>
        </div>

        {/* Total Users */}
        <div className="md:col-span-4 bg-white hairline rounded-sm p-6 flex flex-col justify-between h-48">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-ink-secondary text-sm">group</span>
              <span className="text-xs uppercase font-bold tracking-widest text-ink-secondary">Total Pengguna</span>
            </div>
            <h2 className="text-4xl font-serif text-ink-primary mt-2">
              {stats ? stats.totalUsers.toLocaleString("id-ID") : "—"}
            </h2>
          </div>
          <div className="text-sm text-ink-secondary">
            pengguna terdaftar
          </div>
        </div>

        {/* Total Orders */}
        <div className="md:col-span-4 bg-white hairline rounded-sm p-6 flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-widest text-ink-secondary">Total Pesanan</span>
            <span className="material-symbols-outlined text-ink-secondary text-sm">receipt_long</span>
          </div>
          <div>
            <div className="text-2xl font-serif text-ink-primary">
              {stats ? stats.totalOrders.toLocaleString("id-ID") : "—"}
            </div>
            <div className="text-[10px] text-ink-secondary mt-1">seluruh waktu</div>
          </div>
        </div>

        {/* Total Products */}
        <div className="md:col-span-4 bg-white hairline rounded-sm p-6 flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-widest text-ink-secondary">Total Produk</span>
            <span className="material-symbols-outlined text-ink-secondary text-sm">inventory_2</span>
          </div>
          <div>
            <div className="text-2xl font-serif text-ink-primary">
              {stats ? stats.totalProducts.toLocaleString("id-ID") : "—"}
            </div>
            <div className="text-[10px] text-ink-secondary mt-1">produk aktif</div>
          </div>
        </div>

        {/* System Status */}
        <div className="md:col-span-4 bg-white hairline rounded-sm p-6 flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-widest text-ink-secondary">Sistem Status</span>
            <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
          </div>
          <div>
            <div className="text-2xl font-serif text-ink-primary">Normal</div>
            <div className="text-[10px] text-ink-secondary mt-1">Semua layanan berjalan</div>
          </div>
        </div>

      </div>

      {/* Top Products */}
      {stats?.topProducts && stats.topProducts.length > 0 && (
        <div className="bg-white hairline rounded-sm">
          <div className="p-5 hairline-b flex items-center justify-between">
            <h3 className="text-sm font-bold text-ink-primary">Produk Terlaris</h3>
            <span className="text-[10px] text-ink-secondary uppercase tracking-widest">Bulan Ini</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="hairline-b">
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-5 pt-4">Produk</th>
                  <th className="text-right text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-5 pt-4">Terjual</th>
                  <th className="text-right text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-5 pt-4">Pendapatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E3DC]">
                {stats.topProducts.map((product, idx) => (
                  <tr key={idx} className="hover:bg-surface transition-colors">
                    <td className="py-3 px-5 text-xs text-ink-primary font-medium">{product.name}</td>
                    <td className="py-3 px-5 text-xs text-ink-secondary text-right tabular-nums">{product.sales}</td>
                    <td className="py-3 px-5 text-xs text-ink-primary text-right tabular-nums font-medium">
                      {formatRupiah(product.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
