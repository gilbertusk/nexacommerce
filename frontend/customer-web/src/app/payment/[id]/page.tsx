"use client";

import { use } from "react";
import Link from "next/link";
import { useOrder } from "@/lib/api/hooks/useOrders";
import { usePaymentStatus } from "@/lib/api/hooks/usePayment";
import { useUserStore } from "@/lib/store/useUserStore";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { formatIDR } from "@/lib/utils/format";
import EmptyState from "@/components/ui/EmptyState";

interface PaymentPageProps {
  params: Promise<{ id: string }>;
}

export default function PaymentPage({ params }: PaymentPageProps) {
  const { id } = use(params);
  const hydrated = useHydrated();
  const { user } = useUserStore();
  const orderQuery = useOrder(id);
  const paymentQuery = usePaymentStatus(id);
  const order = orderQuery.data?.data.order;
  const payment = paymentQuery.data?.data;

  if (!hydrated || (user && (orderQuery.isLoading || paymentQuery.isLoading))) {
    return <div className="max-w-md mx-auto py-16 px-4"><div className="h-80 animate-pulse bg-surface border border-hairline rounded-sm" /></div>;
  }

  if (!user) {
    return <div className="py-20"><EmptyState icon="lock" title="Login Diperlukan" description="Masuk untuk melihat status pembayaran Anda." actionLabel="Login Sekarang" actionHref={`/auth/login?redirect=/payment/${id}`} /></div>;
  }

  if (orderQuery.isError || paymentQuery.isError) {
    return <main className="max-w-md mx-auto py-16 px-4"><h1 className="font-serif text-3xl mb-3">Status pembayaran belum tersedia</h1><p role="alert" className="text-sm text-rose-800">Server tidak dapat memuat status pesanan/pembayaran. Jangan melakukan pembayaran di luar tautan resmi.</p><button onClick={() => { void orderQuery.refetch(); void paymentQuery.refetch(); }} className="mt-5 bg-primary text-white px-5 py-3 text-xs font-bold">Coba Lagi</button></main>;
  }

  if (!order) {
    return <div className="py-20"><EmptyState icon="error" title="Transaksi Tidak Ditemukan" description="Pesanan ini tidak terdaftar atau Anda tidak memiliki akses." actionLabel="Kembali Belanja" actionHref="/shop" /></div>;
  }

  const status = (payment?.status ?? order.status).toUpperCase();
  const isPending = status === "PENDING" || status === "PENDING_PAYMENT";
  const isPaid = status === "PAID" || status === "SETTLEMENT";
  const title = isPaid ? "Pembayaran Berhasil" : isPending ? "Selesaikan Pembayaran" : "Status Pembayaran";

  return (
    <main className="max-w-md mx-auto py-12 px-4 flex flex-col gap-6">
      <header className="text-center">
        <span className="text-[10px] uppercase font-bold tracking-widest text-primary mb-2 block">Pembayaran Pesanan</span>
        <h1 className="font-serif text-3xl text-ink-primary">{title}</h1>
        <p className="text-xs text-ink-secondary mt-2">ID Pesanan: <strong className="font-mono text-ink-primary select-all">{order.id}</strong></p>
      </header>

      <section className="bg-surface border border-hairline p-6 rounded-sm">
        <div className="bg-paper p-4 w-full rounded-xs text-center border border-hairline/60 mb-5">
          <span className="text-[10px] uppercase font-bold text-ink-secondary block mb-1">Jumlah Tagihan</span>
          <span className="font-mono text-xl font-bold text-ink-primary">{formatIDR(payment?.amount ?? order.total)}</span>
        </div>

        <div className="flex justify-between text-xs mb-4"><span>Status pembayaran</span><strong>{status}</strong></div>

        {isPending && payment?.paymentUrl ? (
          <>
            <a href={payment.paymentUrl} target="_blank" rel="noopener noreferrer" className="w-full bg-primary hover:bg-primary-hover text-white text-xs uppercase font-bold tracking-widest py-4 rounded-xs flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">open_in_new</span>Buka Pembayaran Resmi
            </a>
            {payment.expiresAt && <p className="text-[10px] text-ink-secondary text-center mt-3">Batas pembayaran: {new Date(payment.expiresAt).toLocaleString("id-ID")}</p>}
          </>
        ) : isPending ? (
          <p role="alert" className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-3 rounded-xs">Tautan pembayaran resmi belum tersedia. Tidak ada QRIS tiruan yang akan ditampilkan. Periksa status kembali atau hubungi bantuan.</p>
        ) : isPaid ? (
          <p role="status" className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs p-3 rounded-xs">Pembayaran telah dikonfirmasi oleh penyedia pembayaran.</p>
        ) : (
          <p role="status" className="bg-paper border border-hairline text-ink-secondary text-xs p-3 rounded-xs">Status pembayaran: {status}. Hubungi bantuan jika Anda memerlukan tindak lanjut.</p>
        )}

        <button onClick={() => void paymentQuery.refetch()} disabled={paymentQuery.isFetching} className="w-full mt-4 border border-hairline text-ink-primary text-xs uppercase font-bold tracking-widest py-3 rounded-xs disabled:opacity-50">{paymentQuery.isFetching ? "Memeriksa..." : "Periksa Status Pembayaran"}</button>
      </section>

      <Link href={`/orders/${order.id}`} className="text-xs text-primary text-center font-semibold">Lihat detail pesanan</Link>
    </main>
  );
}
