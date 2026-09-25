"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAdminStore } from "@/lib/store/useAdminStore";
import { apiGet } from "@/lib/api/client";
import Link from "next/link";

interface OrderItem {
  id: string;
  productName?: string;
  product?: { name?: string };
  quantity: number;
  price: number;
  subtotal?: number;
}

interface OrderDetail {
  id: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  totalAmount?: number;
  total?: number;
  customer?: { name?: string; email?: string; phone?: string };
  customerName?: string;
  shippingAddress?: {
    street?: string;
    city?: string;
    province?: string;
    postalCode?: string;
  };
  payment?: {
    method?: string;
    status?: string;
    amount?: number;
    paidAt?: string;
  };
  items?: OrderItem[];
  orderItems?: OrderItem[];
}

interface OrderResponse {
  success: boolean;
  data: OrderDetail;
}

const STATUS_TIMELINE = ["PENDING_PAYMENT", "PAID", "PROCESSING", "PACKED", "SHIPPED", "DELIVERED", "COMPLETED"];

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Menunggu Pembayaran",
  PROCESSING: "Sedang Diproses",
  PACKED: "Dikemas",
  PAID: "Dibayar",
  SHIPPED: "Dikirim",
  DELIVERED: "Terkirim",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

function formatRupiah(v: number) {
  return `Rp ${v.toLocaleString("id-ID")}`;
}

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return d;
  }
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const token = useAdminStore((s) => s.token);

  const { data, isLoading, isError, refetch } = useQuery<OrderResponse>({
    queryKey: ["order", id],
    queryFn: () => apiGet<OrderResponse>(`/orders/${id}`, token ?? undefined),
    enabled: !!token && !!id,
  });

  const order = data?.data;
  const items = order?.items ?? order?.orderItems ?? [];
  const currentStatusIdx = order ? STATUS_TIMELINE.indexOf(order.status) : -1;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-shimmer rounded-sm" />
          <div className="h-4 w-32 animate-shimmer rounded-sm" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white hairline rounded-sm p-5 h-40 animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col gap-6">
        <Link href="/orders" className="flex items-center gap-2 text-sm text-ink-secondary hover:text-ink-primary transition-colors w-fit">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Kembali ke Pesanan
        </Link>
        <div className="bg-white hairline rounded-sm p-8 flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-3xl text-ink-secondary">cloud_off</span>
          <p className="text-sm text-ink-secondary">Gagal memuat detail pesanan.</p>
          <button onClick={() => refetch()} className="px-4 py-2 bg-ink-primary text-white text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-ink-primary/90 transition-colors">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link href="/orders" className="flex items-center gap-2 text-sm text-ink-secondary hover:text-ink-primary transition-colors w-fit">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Kembali
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-serif text-ink-primary">Detail Pesanan</h1>
          <p className="text-xs font-mono text-ink-secondary mt-0.5">{order.id}</p>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-sm text-[10px] uppercase tracking-widest font-bold ${
          order.status === "COMPLETED" ? "bg-green-50 text-green-700" :
          order.status === "CANCELLED" ? "bg-red-50 text-red-700" :
          order.status === "SHIPPED" ? "bg-indigo-50 text-indigo-700" :
          order.status === "PAID" ? "bg-blue-50 text-blue-700" :
          "bg-yellow-50 text-yellow-700"
        }`}>
          {STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>

      {/* Status Timeline */}
      {order.status !== "CANCELLED" && (
        <div className="bg-white hairline rounded-sm p-5">
          <h2 className="text-[10px] uppercase font-bold tracking-widest text-ink-secondary mb-4">Status Pesanan</h2>
          <div className="flex items-center gap-0">
            {STATUS_TIMELINE.map((s, idx) => {
              const isDone = currentStatusIdx >= idx;
              const isCurrent = currentStatusIdx === idx;
              return (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDone ? "bg-ink-primary" : "bg-surface hairline"}`}>
                      <span className={`material-symbols-outlined text-[14px] ${isDone ? "text-white" : "text-ink-secondary"}`}>
                        {isDone && !isCurrent ? "check" : idx === 0 ? "schedule" : idx === 1 ? "payments" : idx === 2 ? "local_shipping" : "done_all"}
                      </span>
                    </div>
                    <span className={`text-[10px] uppercase tracking-widest font-bold whitespace-nowrap ${isCurrent ? "text-ink-primary" : isDone ? "text-ink-secondary" : "text-ink-secondary/50"}`}>
                      {STATUS_LABELS[s]}
                    </span>
                  </div>
                  {idx < STATUS_TIMELINE.length - 1 && (
                    <div className={`flex-1 h-px mx-2 mb-4 ${currentStatusIdx > idx ? "bg-ink-primary" : "bg-hairline"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Info */}
        <div className="bg-white hairline rounded-sm p-5 flex flex-col gap-3">
          <h2 className="text-[10px] uppercase font-bold tracking-widest text-ink-secondary">Informasi Pelanggan</h2>
          <div className="flex flex-col gap-2">
            <div>
              <span className="text-[10px] text-ink-secondary uppercase tracking-widest">Nama</span>
              <p className="text-sm font-medium text-ink-primary mt-0.5">{order.customer?.name ?? order.customerName ?? "—"}</p>
            </div>
            {order.customer?.email && (
              <div>
                <span className="text-[10px] text-ink-secondary uppercase tracking-widest">Email</span>
                <p className="text-xs text-ink-primary mt-0.5">{order.customer.email}</p>
              </div>
            )}
            {order.customer?.phone && (
              <div>
                <span className="text-[10px] text-ink-secondary uppercase tracking-widest">Telepon</span>
                <p className="text-xs text-ink-primary mt-0.5">{order.customer.phone}</p>
              </div>
            )}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white hairline rounded-sm p-5 flex flex-col gap-3">
          <h2 className="text-[10px] uppercase font-bold tracking-widest text-ink-secondary">Alamat Pengiriman</h2>
          {order.shippingAddress ? (
            <div className="flex flex-col gap-1">
              {order.shippingAddress.street && <p className="text-sm text-ink-primary">{order.shippingAddress.street}</p>}
              <p className="text-xs text-ink-secondary">
                {[order.shippingAddress.city, order.shippingAddress.province, order.shippingAddress.postalCode].filter(Boolean).join(", ")}
              </p>
            </div>
          ) : (
            <p className="text-sm text-ink-secondary">Tidak tersedia</p>
          )}
        </div>

        {/* Payment Info */}
        <div className="bg-white hairline rounded-sm p-5 flex flex-col gap-3">
          <h2 className="text-[10px] uppercase font-bold tracking-widest text-ink-secondary">Informasi Pembayaran</h2>
          <div className="flex flex-col gap-2">
            {order.payment?.method && (
              <div>
                <span className="text-[10px] text-ink-secondary uppercase tracking-widest">Metode</span>
                <p className="text-sm text-ink-primary mt-0.5">{order.payment.method}</p>
              </div>
            )}
            {order.payment?.status && (
              <div>
                <span className="text-[10px] text-ink-secondary uppercase tracking-widest">Status</span>
                <p className="text-sm text-ink-primary mt-0.5">{order.payment.status}</p>
              </div>
            )}
            <div>
              <span className="text-[10px] text-ink-secondary uppercase tracking-widest">Total</span>
              <p className="text-lg font-serif text-ink-primary mt-0.5">
                {formatRupiah(order.totalAmount ?? order.total ?? 0)}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-ink-secondary uppercase tracking-widest">Tanggal</span>
              <p className="text-xs text-ink-secondary mt-0.5">{formatDate(order.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      {items.length > 0 && (
        <div className="bg-white hairline rounded-sm">
          <div className="p-5 hairline-b">
            <h2 className="text-sm font-bold text-ink-primary">Item Pesanan</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface hairline-b">
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-5 pt-4">Produk</th>
                  <th className="text-right text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-5 pt-4">Harga</th>
                  <th className="text-right text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-5 pt-4">Qty</th>
                  <th className="text-right text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-5 pt-4">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E3DC]">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-surface transition-colors">
                    <td className="py-3 px-5 text-xs font-medium text-ink-primary">
                      {item.productName ?? item.product?.name ?? "—"}
                    </td>
                    <td className="py-3 px-5 text-xs text-ink-secondary text-right tabular-nums">
                      {formatRupiah(item.price)}
                    </td>
                    <td className="py-3 px-5 text-xs text-ink-secondary text-right tabular-nums">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-5 text-xs font-medium text-ink-primary text-right tabular-nums">
                      {formatRupiah(item.subtotal ?? item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="hairline-t">
                  <td colSpan={3} className="py-3 px-5 text-xs font-bold text-ink-primary text-right">Total</td>
                  <td className="py-3 px-5 text-sm font-serif text-ink-primary text-right tabular-nums">
                    {formatRupiah(order.totalAmount ?? order.total ?? 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
