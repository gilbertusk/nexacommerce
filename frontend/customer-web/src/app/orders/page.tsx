"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/store/useUserStore";
import { useOrders } from "@/lib/api/hooks/useOrders";
import { formatIDR, formatDate } from "@/lib/utils/format";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";

type TabKey = "ALL" | "PENDING" | "PAID" | "COMPLETED" | "CANCELLED";

export default function OrdersHistoryPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState<TabKey>("ALL");

  const { data: ordersData, isLoading, isError } = useOrders();

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="py-20">
        <EmptyState
          icon="lock"
          title="Login Diperlukan"
          description="Anda harus masuk ke akun Anda terlebih dahulu untuk melihat riwayat pesanan."
          actionLabel="Login Sekarang"
          actionHref="/auth/login?redirect=/orders"
        />
      </div>
    );
  }

  const orders = ordersData?.data?.orders ?? [];

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "CANCELLED") {
      return ["CANCELLED", "FAILED", "EXPIRED"].includes(order.status.toUpperCase());
    }
    return order.status.toUpperCase() === activeTab;
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <h1 className="font-serif text-4xl md:text-5xl text-ink-primary mb-8">
          Riwayat Pesanan
        </h1>
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse bg-surface border border-hairline rounded-sm" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Editorial Header */}
      <div className="border-b border-hairline pb-8 mb-8">
        <h1 className="font-serif text-4xl md:text-5xl text-ink-primary mb-2">
          Riwayat Pesanan
        </h1>
        <p className="text-xs text-ink-secondary">
          Pantau status pengiriman paket Anda atau lihat kembali riwayat transaksi terdahulu.
        </p>
      </div>

      {/* Error Banner */}
      {isError && (
        <div className="mb-6 bg-rose-50 border border-rose-100 text-rose-800 text-xs p-4 rounded-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">error</span>
          <span>Gagal memuat riwayat pesanan. Silakan muat ulang halaman.</span>
        </div>
      )}

      {/* Tabs Filter Bar */}
      <div className="flex gap-4 border-b border-hairline mb-8 overflow-x-auto no-scrollbar">
        {(
          [
            { key: "ALL", label: "Semua Pesanan" },
            { key: "PENDING", label: "Menunggu" },
            { key: "PAID", label: "Dibayar" },
            { key: "COMPLETED", label: "Selesai" },
            { key: "CANCELLED", label: "Batal / Gagal" },
          ] as { key: TabKey; label: string }[]
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-4 text-xs uppercase font-bold tracking-widest border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-ink-secondary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon="receipt_long"
            title="Tidak Ada Pesanan"
            description={
              activeTab === "ALL"
                ? "Anda belum memiliki riwayat pesanan. Mulai belanja sekarang!"
                : "Kami tidak menemukan pesanan yang sesuai dengan status filter aktif Anda."
            }
            actionLabel="Belanja Sekarang"
            actionHref="/shop"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {filteredOrders.map((order) => {
            const firstItem = order.items[0];
            const otherItemsCount = order.items.length - 1;
            const orderDate = order.createdAt ?? order.date ?? "";

            return (
              <div
                key={order.id}
                className="bg-surface border border-hairline p-5 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xs transition-shadow"
              >
                {/* Left Side: Order Info & Product Preview */}
                <div className="flex-grow flex gap-4 items-start">
                  {firstItem && (
                    <div className="w-16 aspect-[4/5] bg-paper overflow-hidden rounded-xs shrink-0 border border-hairline">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={firstItem.image}
                        alt={firstItem.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-xs font-bold text-ink-primary select-all">
                        {order.id}
                      </span>
                      {orderDate && (
                        <span className="text-[10px] text-ink-secondary">
                          {formatDate(orderDate)}
                        </span>
                      )}
                      <StatusBadge status={order.status} />
                    </div>

                    {firstItem && (
                      <p className="text-xs font-semibold text-ink-primary mt-1.5 line-clamp-1 max-w-md">
                        {firstItem.name}
                      </p>
                    )}
                    {otherItemsCount > 0 && (
                      <span className="text-[10px] text-ink-secondary font-medium">
                        + {otherItemsCount} barang lainnya
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Side: Price Total & Details Button */}
                <div className="flex items-center md:items-end justify-between md:flex-col gap-4 md:text-right shrink-0">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-ink-secondary">
                      Total Pembayaran
                    </span>
                    <span className="font-mono text-base font-bold text-primary tabular-nums">
                      {formatIDR(order.total)}
                    </span>
                  </div>

                  <Link
                    href={`/orders/${order.id}`}
                    className="inline-flex items-center justify-center border border-ink-primary hover:bg-ink-primary hover:text-white text-[10px] uppercase font-bold tracking-widest px-5 py-2.5 rounded-xs transition-colors whitespace-nowrap"
                  >
                    Lihat Detail
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
