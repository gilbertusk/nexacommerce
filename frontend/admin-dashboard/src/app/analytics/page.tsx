"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAdminStore } from "@/lib/store/useAdminStore";
import { apiGet } from "@/lib/api/client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  revenueChart?: Array<{ label: string; value: number }>;
  topProducts?: Array<{ name: string; sales: number; revenue: number }>;
}

interface DashboardResponse {
  success: boolean;
  data: DashboardStats;
}

interface RevenueDataPoint {
  date?: string;
  month?: number;
  year?: number;
  label?: string;
  revenue: number;
  orders?: number;
}

interface RevenueResponse {
  success: boolean;
  data: RevenueDataPoint[] | { daily?: RevenueDataPoint[]; monthly?: RevenueDataPoint[] };
}

interface TopProduct {
  productId?: string;
  name: string;
  sales: number;
  revenue: number;
  rating?: number;
}

interface TopProductsResponse {
  success: boolean;
  data: TopProduct[] | { products?: TopProduct[] };
}

interface SellerPerformance {
  sellerId?: string;
  name: string;
  shopName?: string;
  totalSales: number;
  revenue: number;
}

interface SellersAnalyticsResponse {
  success: boolean;
  data: SellerPerformance[] | { sellers?: SellerPerformance[] };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRupiah(v: number) {
  if (v >= 1_000_000_000) return `Rp ${(v / 1_000_000_000).toFixed(1)}M`;
  if (v >= 1_000_000) return `Rp ${(v / 1_000_000).toFixed(1)}Jt`;
  return `Rp ${v.toLocaleString("id-ID")}`;
}

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function get30DaysAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

function normalizeRevenueData(raw: RevenueResponse["data"]): RevenueDataPoint[] {
  if (Array.isArray(raw)) return raw;
  return raw?.daily ?? raw?.monthly ?? [];
}

function normalizeTopProducts(raw: TopProductsResponse["data"]): TopProduct[] {
  if (Array.isArray(raw)) return raw;
  return raw?.products ?? [];
}

function normalizeSellers(raw: SellersAnalyticsResponse["data"]): SellerPerformance[] {
  if (Array.isArray(raw)) return raw;
  return (raw as { sellers?: SellerPerformance[] })?.sellers ?? [];
}

const CURRENT_YEAR = new Date().getFullYear();
const MONTHS_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];

type ChartMode = "daily" | "monthly";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const token = useAdminStore((s) => s.token);

  const [chartMode, setChartMode] = useState<ChartMode>("daily");
  const [dateFrom, setDateFrom] = useState(get30DaysAgo());
  const [dateTo, setDateTo] = useState(getTodayStr());
  const [year, setYear] = useState(CURRENT_YEAR);

  // ── Dashboard Stats ───────────────────────────────────────────────────────
  const dashboardQuery = useQuery<DashboardResponse>({
    queryKey: ["analytics-dashboard", dateFrom, dateTo],
    queryFn: () =>
      apiGet<DashboardResponse>(
        `/analytics/dashboard?dateFrom=${dateFrom}&dateTo=${dateTo}`,
        token ?? undefined
      ),
    enabled: !!token,
  });

  // ── Revenue Chart (daily / monthly) ──────────────────────────────────────
  const revenueParams =
    chartMode === "daily"
      ? `dateFrom=${dateFrom}&dateTo=${dateTo}`
      : `year=${year}`;

  const revenueQuery = useQuery<RevenueResponse>({
    queryKey: ["analytics-revenue", chartMode, dateFrom, dateTo, year],
    queryFn: () =>
      apiGet<RevenueResponse>(
        `/analytics/revenue?${revenueParams}`,
        token ?? undefined
      ),
    enabled: !!token,
  });

  // ── Top Selling Products ──────────────────────────────────────────────────
  const topProductsQuery = useQuery<TopProductsResponse>({
    queryKey: ["analytics-top-products", dateFrom, dateTo],
    queryFn: () =>
      apiGet<TopProductsResponse>(
        `/analytics/products/top-selling?dateFrom=${dateFrom}&dateTo=${dateTo}`,
        token ?? undefined
      ),
    enabled: !!token,
  });

  // ── Seller Performance (keep existing endpoint) ───────────────────────────
  const sellersQuery = useQuery<SellersAnalyticsResponse>({
    queryKey: ["analytics-sellers"],
    queryFn: () =>
      apiGet<SellersAnalyticsResponse>("/analytics/sellers", token ?? undefined),
    enabled: !!token,
  });

  // ── Derived data ──────────────────────────────────────────────────────────
  const stats = dashboardQuery.data?.data;
  const revenueData = normalizeRevenueData(revenueQuery.data?.data ?? []);
  const topProducts = normalizeTopProducts(topProductsQuery.data?.data ?? []);
  const sellers = normalizeSellers(sellersQuery.data?.data ?? []);

  const maxRevenue = Math.max(...revenueData.map((d) => d.revenue), 1);
  const totalRevenue = stats?.totalRevenue ?? revenueData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = stats?.totalOrders ?? revenueData.reduce((s, d) => s + (d.orders ?? 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-serif text-ink-primary mb-1">Analitik</h1>
          <p className="text-sm text-ink-secondary">
            Laporan penjualan, performa produk, dan penjual terbaik.
          </p>
        </div>
        {/* Global date range filter */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest font-bold text-ink-secondary">
            Periode:
          </span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-2 py-1.5 bg-white hairline rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <span className="text-ink-secondary text-xs">—</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-2 py-1.5 bg-white hairline rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white hairline rounded-sm p-5">
          <span className="text-[10px] uppercase tracking-widest font-bold text-ink-secondary">
            Total Pendapatan
          </span>
          {dashboardQuery.isLoading ? (
            <div className="h-8 w-32 animate-shimmer rounded-sm mt-2" />
          ) : (
            <div className="text-2xl font-serif text-ink-primary mt-2">
              {formatRupiah(totalRevenue)}
            </div>
          )}
          <span className="text-[10px] text-ink-secondary">Periode dipilih</span>
        </div>

        <div className="bg-white hairline rounded-sm p-5">
          <span className="text-[10px] uppercase tracking-widest font-bold text-ink-secondary">
            Total Pesanan
          </span>
          {dashboardQuery.isLoading ? (
            <div className="h-8 w-24 animate-shimmer rounded-sm mt-2" />
          ) : (
            <div className="text-2xl font-serif text-ink-primary mt-2">
              {totalOrders.toLocaleString("id-ID")}
            </div>
          )}
          <span className="text-[10px] text-ink-secondary">Periode dipilih</span>
        </div>

        <div className="bg-white hairline rounded-sm p-5">
          <span className="text-[10px] uppercase tracking-widest font-bold text-ink-secondary">
            Rata-rata per Pesanan
          </span>
          {dashboardQuery.isLoading ? (
            <div className="h-8 w-28 animate-shimmer rounded-sm mt-2" />
          ) : (
            <div className="text-2xl font-serif text-ink-primary mt-2">
              {totalOrders > 0 ? formatRupiah(Math.round(totalRevenue / totalOrders)) : "—"}
            </div>
          )}
          <span className="text-[10px] text-ink-secondary">AOV (Average Order Value)</span>
        </div>
      </div>

      {/* Additional Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Pengguna", value: stats.totalUsers?.toLocaleString("id-ID") ?? "—", icon: "group" },
            { label: "Total Produk", value: stats.totalProducts?.toLocaleString("id-ID") ?? "—", icon: "inventory_2" },
          ].map((item) => (
            <div key={item.label} className="bg-white hairline rounded-sm p-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-ink-secondary text-xl">{item.icon}</span>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-ink-secondary">{item.label}</p>
                <p className="text-lg font-serif text-ink-primary mt-0.5">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Revenue Chart */}
      <div className="bg-white hairline rounded-sm">
        <div className="p-5 hairline-b flex flex-wrap items-center gap-4">
          <h2 className="text-sm font-bold text-ink-primary flex-1">Grafik Pendapatan</h2>

          <div className="flex items-center hairline rounded-sm overflow-hidden">
            <button
              onClick={() => setChartMode("daily")}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors ${
                chartMode === "daily"
                  ? "bg-ink-primary text-white"
                  : "text-ink-secondary hover:bg-surface"
              }`}
            >
              Harian
            </button>
            <button
              onClick={() => setChartMode("monthly")}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors ${
                chartMode === "monthly"
                  ? "bg-ink-primary text-white"
                  : "text-ink-secondary hover:bg-surface"
              }`}
            >
              Bulanan
            </button>
          </div>

          {chartMode === "daily" ? (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-2 py-1.5 bg-surface hairline rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="text-ink-secondary text-xs">—</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-2 py-1.5 bg-surface hairline rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          ) : (
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="px-3 py-1.5 bg-surface hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {[CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          )}
        </div>

        <div className="p-5">
          {revenueQuery.isLoading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-hairline border-t-ink-secondary rounded-full animate-spin" />
            </div>
          ) : revenueQuery.isError ? (
            <div className="h-40 flex flex-col items-center justify-center gap-2">
              <span className="material-symbols-outlined text-2xl text-ink-secondary">cloud_off</span>
              <p className="text-sm text-ink-secondary">Gagal memuat data grafik.</p>
              <button
                onClick={() => revenueQuery.refetch()}
                className="px-3 py-1.5 bg-ink-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-sm"
              >
                Coba Lagi
              </button>
            </div>
          ) : revenueData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-sm text-ink-secondary">
              Tidak ada data untuk periode ini.
            </div>
          ) : (
            <div className="flex items-end gap-1 h-40 overflow-x-auto pb-4">
              {revenueData.map((d, i) => {
                const height = Math.max(4, Math.round((d.revenue / maxRevenue) * 100));
                let label: string;
                if (d.label) {
                  label = d.label;
                } else if (d.date) {
                  label = d.date.slice(5);
                } else if (d.month != null) {
                  label = MONTHS_ID[(d.month) - 1] ?? String(d.month);
                } else {
                  label = String(i + 1);
                }
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-1 flex-1 min-w-[24px] group relative"
                  >
                    <div
                      className="w-full bg-ink-primary/10 hover:bg-ink-primary/25 transition-colors rounded-sm cursor-default"
                      style={{ height: `${height}%` }}
                      title={`${label}: ${formatRupiah(d.revenue)}`}
                    />
                    <span className="text-[8px] text-ink-secondary rotate-45 origin-left mt-1 truncate">
                      {label}
                    </span>
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-ink-primary text-white text-[10px] px-2 py-1 rounded-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {formatRupiah(d.revenue)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-white hairline rounded-sm">
          <div className="p-5 hairline-b flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink-primary">Produk Terlaris</h2>
            <span className="text-[10px] text-ink-secondary uppercase tracking-widest">Periode dipilih</span>
          </div>
          {topProductsQuery.isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="w-5 h-5 border-2 border-hairline border-t-ink-secondary rounded-full animate-spin" />
            </div>
          ) : topProductsQuery.isError ? (
            <div className="p-8 flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-ink-secondary">cloud_off</span>
              <p className="text-sm text-ink-secondary">Gagal memuat data produk.</p>
            </div>
          ) : topProducts.length === 0 ? (
            <div className="p-8 text-center text-sm text-ink-secondary">Tidak ada data</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="hairline-b">
                    <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-5 pt-4">
                      Produk
                    </th>
                    <th className="text-right text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-5 pt-4">
                      Terjual
                    </th>
                    <th className="text-right text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-5 pt-4">
                      Pendapatan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E3DC]">
                  {topProducts.slice(0, 10).map((p, i) => (
                    <tr key={p.productId ?? i} className="hover:bg-surface transition-colors">
                      <td className="py-3 px-5 text-xs font-medium text-ink-primary">{p.name}</td>
                      <td className="py-3 px-5 text-xs text-ink-secondary text-right tabular-nums">
                        {p.sales}
                      </td>
                      <td className="py-3 px-5 text-xs font-medium text-ink-primary text-right tabular-nums">
                        {formatRupiah(p.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Seller Performance */}
        <div className="bg-white hairline rounded-sm">
          <div className="p-5 hairline-b">
            <h2 className="text-sm font-bold text-ink-primary">Performa Penjual</h2>
          </div>
          {sellersQuery.isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="w-5 h-5 border-2 border-hairline border-t-ink-secondary rounded-full animate-spin" />
            </div>
          ) : sellersQuery.isError ? (
            <div className="p-8 flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-ink-secondary">cloud_off</span>
              <p className="text-sm text-ink-secondary">Gagal memuat data penjual.</p>
            </div>
          ) : sellers.length === 0 ? (
            <div className="p-8 text-center text-sm text-ink-secondary">Tidak ada data</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="hairline-b">
                    <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-5 pt-4">
                      Penjual
                    </th>
                    <th className="text-right text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-5 pt-4">
                      Penjualan
                    </th>
                    <th className="text-right text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-5 pt-4">
                      Pendapatan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E3DC]">
                  {sellers.slice(0, 10).map((s, i) => (
                    <tr key={s.sellerId ?? i} className="hover:bg-surface transition-colors">
                      <td className="py-3 px-5 text-xs font-medium text-ink-primary">
                        {s.shopName ?? s.name}
                      </td>
                      <td className="py-3 px-5 text-xs text-ink-secondary text-right tabular-nums">
                        {s.totalSales}
                      </td>
                      <td className="py-3 px-5 text-xs font-medium text-ink-primary text-right tabular-nums">
                        {formatRupiah(s.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
