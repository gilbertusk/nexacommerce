"use client";

import { use } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatIDR } from "@/lib/utils/format";
import { useOrder } from "@/lib/api/hooks/useOrders";
import { useInitiatePayment, usePaymentStatus } from "@/lib/api/hooks/usePayment";
import { useUserStore } from "@/lib/store/useUserStore";
import EmptyState from "@/components/ui/EmptyState";

interface PaymentPageProps {
  params: Promise<{ id: string }>;
}

export default function PaymentPage({ params }: PaymentPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { user } = useUserStore();

  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const { data: orderData, isLoading: orderLoading } = useOrder(id);
  const { data: paymentData, isLoading: paymentLoading, refetch: refetchPayment } = usePaymentStatus(id);
  const initiatePayment = useInitiatePayment();

  const order = orderData?.data?.order ?? null;
  const paymentStatus = paymentData?.data?.status ?? order?.status ?? "PENDING";

  // Countdown timer
  useEffect(() => {
    if (["PAID", "FAILED", "EXPIRED", "CANCELLED"].includes(paymentStatus.toUpperCase())) {
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [paymentStatus]);

  // Auto-initiate payment on load if order is pending
  useEffect(() => {
    if (order && order.status.toUpperCase() === "PENDING" && !paymentInitiated && user) {
      initiatePayment.mutateAsync(id).then((res) => {
        setPaymentInitiated(true);
        if (res.data.paymentUrl) {
          setPaymentUrl(res.data.paymentUrl);
        }
      }).catch(() => {
        // Payment initiation failed — show QRIS mock anyway
        setPaymentInitiated(true);
      });
    }
  }, [order, paymentInitiated, user, id, initiatePayment]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleCheckStatus = async () => {
    await refetchPayment();
  };

  if (!user) {
    return (
      <div className="py-20">
        <EmptyState
          icon="lock"
          title="Login Diperlukan"
          description="Silakan masuk ke akun Anda untuk melihat halaman pembayaran."
          actionLabel="Login Sekarang"
          actionHref={`/auth/login?redirect=/payment/${id}`}
        />
      </div>
    );
  }

  if (orderLoading || paymentLoading) {
    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <div className="h-96 animate-pulse bg-surface border border-hairline rounded-sm" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20">
        <EmptyState
          icon="error"
          title="Transaksi Tidak Ditemukan"
          description="Kode tagihan pembayaran ini tidak terdaftar dalam sistem kami."
          actionLabel="Kembali Belanja"
          actionHref="/shop"
        />
      </div>
    );
  }

  const normalStatus = paymentStatus.toUpperCase();

  return (
    <div className="max-w-md mx-auto py-12 px-4 flex flex-col gap-6">
      {/* Editorial Header */}
      <div className="text-center">
        <span className="text-[10px] uppercase font-bold tracking-widest text-primary mb-2 block">
          Pembayaran Pesanan
        </span>
        <h1 className="font-serif text-3xl text-ink-primary">
          Selesaikan Pembayaran
        </h1>
        <p className="text-xs text-ink-secondary mt-1">
          ID Transaksi: <strong className="font-mono text-ink-primary select-all">{order.id}</strong>
        </p>
      </div>

      {/* PENDING: Show QRIS / payment UI */}
      {normalStatus === "PENDING" && (
        <div className="bg-surface border border-hairline p-6 rounded-sm flex flex-col items-center">
          {/* Timer */}
          {timeLeft > 0 ? (
            <div className="flex flex-col items-center mb-6">
              <span className="text-[10px] uppercase font-bold tracking-widest text-ink-secondary mb-1">
                Batas Waktu Pembayaran
              </span>
              <span className="font-mono text-2xl font-bold text-primary tabular-nums">
                {formatTime(timeLeft)}
              </span>
            </div>
          ) : (
            <div className="mb-6 bg-rose-50 text-rose-800 border border-rose-100 text-xs p-3 rounded-xs w-full text-center font-semibold">
              Waktu pembayaran telah habis.
            </div>
          )}

          {/* Amount */}
          <div className="bg-paper p-4 w-full rounded-xs text-center border border-hairline/60 mb-6">
            <span className="text-[10px] uppercase font-bold text-ink-secondary block mb-1">Jumlah Tagihan</span>
            <span className="font-mono text-xl font-bold text-ink-primary tabular-nums">
              {formatIDR(order.total)}
            </span>
          </div>

          {/* Payment URL redirect option */}
          {paymentUrl && (
            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full mb-4 bg-ink-primary hover:bg-ink-primary/90 text-white text-xs uppercase font-bold tracking-widest py-3 rounded-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">open_in_new</span>
              Buka Halaman Pembayaran
            </a>
          )}

          {/* Mock QRIS Code */}
          <div className="relative p-6 bg-white hairline rounded-md mb-6 flex flex-col items-center">
            <div className="flex justify-between items-center w-48 mb-3">
              <span className="text-[9px] font-black italic tracking-tighter text-blue-900">QRIS</span>
              <span className="text-[7px] font-mono text-ink-secondary/70">GPN INDONESIA</span>
            </div>
            <svg className="w-48 h-48 text-ink-primary border border-hairline p-2 bg-stone-50" viewBox="0 0 100 100" fill="currentColor">
              <rect x="5" y="5" width="20" height="20" />
              <rect x="9" y="9" width="12" height="12" fill="white" />
              <rect x="12" y="12" width="6" height="6" />
              <rect x="75" y="5" width="20" height="20" />
              <rect x="79" y="9" width="12" height="12" fill="white" />
              <rect x="82" y="12" width="6" height="6" />
              <rect x="5" y="75" width="20" height="20" />
              <rect x="9" y="79" width="12" height="12" fill="white" />
              <rect x="12" y="82" width="6" height="6" />
              <rect x="35" y="15" width="4" height="6" />
              <rect x="45" y="5" width="8" height="4" />
              <rect x="60" y="25" width="10" height="3" />
              <rect x="30" y="35" width="4" height="8" />
              <rect x="40" y="45" width="6" height="6" />
              <rect x="55" y="35" width="12" height="4" />
              <rect x="30" y="60" width="8" height="4" />
              <rect x="45" y="65" width="14" height="6" />
              <rect x="65" y="55" width="4" height="10" />
              <rect x="30" y="75" width="8" height="6" />
              <rect x="45" y="85" width="10" height="4" />
              <rect x="75" y="45" width="12" height="8" />
              <rect x="85" y="35" width="6" height="6" />
              <rect x="80" y="70" width="6" height="15" />
            </svg>
            <span className="text-[9px] uppercase font-bold tracking-widest text-ink-secondary mt-3">
              Pindai dengan E-Wallet atau M-Banking
            </span>
          </div>

          {/* Check payment status button */}
          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={handleCheckStatus}
              className="w-full bg-primary hover:bg-primary-hover text-white text-xs uppercase font-bold tracking-widest py-3.5 rounded-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              Cek Status Pembayaran
            </button>
          </div>
        </div>
      )}

      {/* PAID: Success state */}
      {normalStatus === "PAID" && (
        <div className="bg-surface border border-hairline p-8 rounded-sm text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 border border-emerald-100">
            <span className="material-symbols-outlined text-3xl">check</span>
          </div>
          <h2 className="font-serif text-2xl text-ink-primary mb-2">Pembayaran Berhasil</h2>
          <p className="text-xs text-ink-secondary leading-relaxed mb-6">
            Terima kasih! Pembayaran Anda telah terverifikasi. Pesanan Anda kini sedang diproses untuk pengemasan.
          </p>
          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={() => router.push(`/orders/${order.id}`)}
              className="w-full bg-primary hover:bg-primary-hover text-white text-xs uppercase font-bold tracking-widest py-3.5 rounded-xs transition-colors"
            >
              Lihat Detail Pesanan
            </button>
            <button
              onClick={() => router.push("/shop")}
              className="w-full text-xs text-ink-secondary hover:text-primary transition-colors py-2 font-semibold"
            >
              Lanjut Belanja
            </button>
          </div>
        </div>
      )}

      {/* FAILED / EXPIRED / CANCELLED */}
      {["FAILED", "EXPIRED", "CANCELLED"].includes(normalStatus) && (
        <div className="bg-surface border border-hairline p-8 rounded-sm text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-6 border border-rose-100">
            <span className="material-symbols-outlined text-3xl">close</span>
          </div>
          <h2 className="font-serif text-2xl text-ink-primary mb-2">
            {normalStatus === "EXPIRED" ? "Pembayaran Kadaluwarsa" : "Pembayaran Gagal"}
          </h2>
          <p className="text-xs text-ink-secondary leading-relaxed mb-6">
            {normalStatus === "EXPIRED"
              ? "Batas waktu pembayaran telah terlampaui. Silakan buat pesanan baru."
              : "Transaksi pembayaran dibatalkan atau ditolak oleh gerbang pembayaran."}
          </p>
          <button
            onClick={() => router.push("/shop")}
            className="w-full bg-primary hover:bg-primary-hover text-white text-xs uppercase font-bold tracking-widest py-3.5 rounded-xs transition-colors"
          >
            Kembali Ke Toko
          </button>
        </div>
      )}
    </div>
  );
}
