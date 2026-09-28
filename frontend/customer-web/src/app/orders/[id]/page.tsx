"use client";

import { use } from "react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { formatIDR, formatDate } from "@/lib/utils/format";
import { useOrder } from "@/lib/api/hooks/useOrders";
import { useUserStore } from "@/lib/store/useUserStore";
import StatusBadge from "@/components/ui/StatusBadge";
import TimelineVertical from "@/components/ui/TimelineVertical";
import EmptyState from "@/components/ui/EmptyState";
import { apiPost } from "@/lib/api/client";
import OrderComplaintPanel from "@/components/order/OrderComplaintPanel";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

function buildTimeline(status: string, order: { createdAt?: string; date?: string; shippingInfo?: { courier?: string } }) {
  const dateStr = order.createdAt ?? order.date ?? "";
  const baseEvents = [
    {
      id: "1",
      title: "Pesanan Dibuat",
      description: "Pesanan Anda berhasil dibuat di sistem",
      date: dateStr ? formatDate(dateStr) : undefined,
      isActive: true,
    },
  ];

  const norm = status.toUpperCase();

  if (norm === "PENDING" || norm === "PENDING_PAYMENT") {
    return [
      ...baseEvents,
      { id: "2", title: "Menunggu Pembayaran", description: "Silakan selesaikan pembayaran melalui instruksi dari penyedia pembayaran.", isActive: true },
    ];
  }

  if (norm === "PAID") {
    return [
      ...baseEvents,
      { id: "2", title: "Pembayaran Terverifikasi", description: "Pembayaran tagihan Anda berhasil divalidasi", isActive: true },
      { id: "3", title: "Pesanan Diproses", description: "Pihak toko sedang mempersiapkan kemasan paket Anda", isActive: true },
    ];
  }

  if (["SHIPPED", "DELIVERING"].includes(norm)) {
    return [
      ...baseEvents,
      { id: "2", title: "Pembayaran Terverifikasi", isActive: true },
      { id: "3", title: "Paket Disiapkan", isActive: true },
      { id: "4", title: "Paket Diserahkan ke Kurir", description: order.shippingInfo?.courier ? `Dibawa oleh ${order.shippingInfo.courier}` : undefined, isActive: true },
    ];
  }

  if (norm === "COMPLETED" || norm === "DELIVERED") {
    return [
      ...baseEvents,
      { id: "2", title: "Pembayaran Terverifikasi", isActive: true },
      { id: "3", title: "Paket Diserahkan ke Kurir", description: order.shippingInfo?.courier ? `Dibawa oleh ${order.shippingInfo.courier}` : undefined, isActive: true },
      { id: "4", title: "Pesanan Selesai", description: "Konfirmasi pesanan diterima oleh pelanggan", isActive: true },
    ];
  }

  if (["CANCELLED", "FAILED", "EXPIRED"].includes(norm)) {
    return [
      ...baseEvents,
      {
        id: "2",
        title: norm === "EXPIRED" ? "Tagihan Kedaluwarsa" : "Pesanan Dibatalkan",
        description: "Pesanan ditutup otomatis oleh sistem",
        isActive: true,
      },
    ];
  }

  return baseEvents;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = use(params);
  const { user } = useUserStore();
  const queryClient = useQueryClient();
  const [returnReason, setReturnReason] = useState("");
  const returnMutation = useMutation({
    mutationFn: () => apiPost(`/orders/${id}/return-request`, { reason: returnReason.trim() }),
    onSuccess: async () => {
      setReturnReason("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["order", id] }),
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
      ]);
    },
  });

  const { data: orderData, isLoading, isError } = useOrder(id);

  if (!user) {
    return (
      <div className="py-20">
        <EmptyState
          icon="lock"
          title="Login Diperlukan"
          description="Anda harus masuk ke akun Anda terlebih dahulu untuk melihat detail pesanan."
          actionLabel="Login Sekarang"
          actionHref={`/auth/login?redirect=/orders/${id}`}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="h-96 animate-pulse bg-surface border border-hairline rounded-sm" />
      </div>
    );
  }

  if (isError || !orderData?.data?.order) {
    return (
      <div className="py-20">
        <EmptyState
          icon="error"
          title="Pesanan Tidak Ditemukan"
          description="Rincian nomor pesanan ini tidak dapat ditemukan di riwayat Anda."
          actionLabel="Ke Riwayat Pesanan"
          actionHref="/orders"
        />
      </div>
    );
  }

  const order = orderData.data.order;
  const timeline = order.timeline ?? buildTimeline(order.status, order);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Navigation breadcrumbs */}
      <nav className="text-xs text-ink-secondary mb-8 flex gap-2 items-center">
        <Link href="/orders" className="hover:text-primary transition-colors">Riwayat Pesanan</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-ink-primary font-semibold truncate max-w-[200px]">{order.id}</span>
      </nav>

      {/* Title block */}
      <div className="border-b border-hairline pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-ink-primary">
            Rincian Pesanan
          </h1>
          {(order.createdAt ?? order.date) && (
            <p className="text-xs text-ink-secondary mt-1">
              Tanggal Transaksi:{" "}
              <strong className="font-mono text-ink-primary">
                {formatDate(order.createdAt ?? order.date ?? "")}
              </strong>
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          {["PENDING", "PENDING_PAYMENT"].includes(order.status.toUpperCase()) && (
            <Link
              href={`/payment/${order.id}`}
              className="bg-primary hover:bg-primary-hover text-white text-xs uppercase font-bold tracking-widest px-5 py-2.5 rounded-xs transition-colors cursor-pointer"
            >
              Bayar Sekarang
            </Link>
          )}
          {order.status.toUpperCase() === "COMPLETED" && (
            <Link
              href={`/shop`}
              className="bg-surface hover:bg-paper text-ink-primary text-xs uppercase font-bold tracking-widest px-5 py-2.5 rounded-xs border border-hairline transition-colors"
            >
              Belanja Lagi
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side Info Panel: col-span-8 */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {["DELIVERED", "COMPLETED"].includes(order.status.toUpperCase()) && (
            <form
              className="bg-white border border-hairline p-5 rounded-sm flex flex-col gap-3"
              onSubmit={(event) => { event.preventDefault(); returnMutation.mutate(); }}
            >
              <h3 className="text-xs uppercase font-bold tracking-widest text-ink-primary">Ajukan Retur</h3>
              <p className="text-xs text-ink-secondary">Jelaskan alasan pengajuan. Persetujuan retur belum berarti dana sudah dikembalikan.</p>
              <textarea
                value={returnReason}
                onChange={(event) => setReturnReason(event.target.value)}
                minLength={5}
                required
                maxLength={1000}
                rows={3}
                placeholder="Alasan retur (minimal 5 karakter)"
                className="w-full px-3 py-2 bg-surface border border-hairline rounded-sm text-sm"
              />
              {returnMutation.isError && <p role="alert" className="text-xs text-rose-700">{returnMutation.error instanceof Error ? returnMutation.error.message : "Gagal mengirim permintaan retur."}</p>}
              {returnMutation.isSuccess && <p role="status" className="text-xs text-emerald-700">Permintaan retur terkirim.</p>}
              <button type="submit" disabled={returnMutation.isPending || returnReason.trim().length < 5} className="self-start px-4 py-2 bg-ink-primary text-white text-xs font-bold uppercase tracking-widest rounded-sm disabled:opacity-50">
                {returnMutation.isPending ? "Mengirim..." : "Kirim Permintaan"}
              </button>
            </form>
          )}

          {order.status.toUpperCase() === "RETURN_REQUESTED" && (
            <p role="status" className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-sm text-sm">Permintaan retur Anda sedang ditinjau.</p>
          )}
          {order.status.toUpperCase() === "RETURN_APPROVED" && (
            <p role="status" className="bg-violet-50 border border-violet-200 text-violet-900 p-4 rounded-sm text-sm">Retur disetujui. Kirimkan barang sesuai instruksi retur; refund baru dapat diajukan setelah admin mengonfirmasi barang sudah diterima.</p>
          )}
          {order.status.toUpperCase() === "RETURN_RECEIVED" && (
            <p role="status" className="bg-teal-50 border border-teal-200 text-teal-900 p-4 rounded-sm text-sm">Barang retur sudah diterima dan diverifikasi. Pengembalian dana menunggu pemrosesan provider pembayaran.</p>
          )}
          <OrderComplaintPanel orderId={id} orderStatus={order.status} />
          {/* Items card */}
          <div className="bg-surface border border-hairline p-6 rounded-sm">
            <h3 className="text-xs uppercase font-bold tracking-widest text-ink-primary mb-4 pb-2 border-b border-hairline">
              Daftar Barang Belanja
            </h3>
            <div className="flex flex-col gap-4">
              {order.items.map((item, idx) => (
                <div key={`${item.productId}-${idx}`} className="flex gap-4 items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 aspect-[4/5] object-cover bg-paper rounded-xs border border-hairline"
                    />
                    <div className="flex flex-col">
                      <h4 className="text-xs font-semibold text-ink-primary line-clamp-1 hover:text-primary">
                        <Link href={`/product/${item.productId}`}>{item.name}</Link>
                      </h4>
                      <span className="text-[10px] text-ink-secondary">
                        {item.qty} x {formatIDR(item.price)}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-ink-primary tabular-nums">
                    {formatIDR(item.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Billing grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Address */}
            {order.address && (
              <div className="bg-surface border border-hairline p-6 rounded-sm">
                <h3 className="text-xs uppercase font-bold tracking-widest text-ink-primary mb-4 pb-2 border-b border-hairline">
                  Alamat Tujuan
                </h3>
                <div className="text-xs text-ink-primary">
                  <p className="font-semibold">{order.address.receiverName}</p>
                  <p className="font-mono text-ink-secondary mt-0.5">{order.address.phoneNumber}</p>
                  <p className="text-ink-secondary mt-1">
                    {order.address.street}, {order.address.city}, {order.address.province}, {order.address.postalCode}
                  </p>
                </div>
              </div>
            )}

            {/* One tracking card per seller shipment. */}
            {order.shipments && order.shipments.length > 0 && (
              <div className="bg-surface border border-hairline p-6 rounded-sm flex flex-col gap-4">
                <h3 className="text-xs uppercase font-bold tracking-widest text-ink-primary mb-4 pb-2 border-b border-hairline">
                  Informasi Pengiriman ({order.shipments.length} Paket)
                </h3>
                {order.shipments.map((shipment, index) => (
                  <div key={shipment.sellerId ?? `${shipment.courier}-${index}`} className="text-xs text-ink-primary border-b border-hairline last:border-b-0 pb-4 last:pb-0">
                    <p className="font-semibold">{shipment.storeName ?? `Paket ${index + 1}`}</p>
                    <p className="mt-1">
                      {shipment.courier}{shipment.service ? ` — ${shipment.service}` : ""}
                    </p>
                    {(shipment.originCity || shipment.originProvince) && (
                      <p className="text-ink-secondary mt-0.5">
                        Dikirim dari {[shipment.originCity, shipment.originProvince].filter(Boolean).join(", ")}
                      </p>
                    )}
                    {shipment.etd && <p className="text-ink-secondary mt-0.5">Estimasi: {shipment.etd}</p>}
                    {shipment.status && <p className="text-ink-secondary mt-0.5">Status: {shipment.status}</p>}
                    {shipment.trackingNumber ? (
                      <div className="mt-3 pt-3 border-t border-hairline flex justify-between items-center gap-3">
                        <span className="text-[10px] text-ink-secondary uppercase">Nomor Resi</span>
                        <span className="font-mono text-xs font-bold text-primary select-all">{shipment.trackingNumber}</span>
                      </div>
                    ) : (
                      <p className="text-[10px] text-ink-secondary/70 italic mt-3">
                        Nomor resi paket ini belum tersedia.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side Tracking Timeline: col-span-4 */}
        <div className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
          {/* Tracking progress */}
          <div className="bg-surface border border-hairline p-6 rounded-sm">
            <h3 className="text-xs uppercase font-bold tracking-widest text-ink-primary mb-6 pb-2 border-b border-hairline">
              Lacak Status Paket
            </h3>
            <TimelineVertical events={timeline} />
          </div>

          {/* Pricing breakdowns */}
          <div className="bg-surface border border-hairline p-6 rounded-sm">
            <h3 className="text-xs uppercase font-bold tracking-widest text-ink-primary mb-4 pb-2 border-b border-hairline">
              Rincian Biaya
            </h3>
            <div className="flex flex-col gap-2.5 font-mono text-xs text-ink-secondary mb-4">
              {order.subtotal !== undefined && (
                <div className="flex justify-between items-center">
                  <span>Subtotal Barang</span>
                  <span className="text-ink-primary font-sans font-medium">{formatIDR(order.subtotal)}</span>
                </div>
              )}
              {order.discount !== undefined && order.discount > 0 && (
                <div className="flex justify-between items-center text-primary font-semibold">
                  <span>Diskon Promo</span>
                  <span>-{formatIDR(order.discount)}</span>
                </div>
              )}
              {order.shippingCost !== undefined && (
                <div className="flex justify-between items-center">
                  <span>Ongkos Kirim</span>
                  <span className="text-ink-primary font-sans font-medium">{formatIDR(order.shippingCost)}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center border-t border-hairline pt-4 font-sans">
              <span className="text-xs uppercase font-bold text-ink-primary">Total Akhir</span>
              <span className="font-mono text-base font-bold text-primary tabular-nums">
                {formatIDR(order.total)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
