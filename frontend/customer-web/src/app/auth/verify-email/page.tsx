"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { apiPost } from "@/lib/api/client";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const displayStatus = token ? status : "error";
  const displayErrorMessage = token
    ? errorMessage
    : "Token verifikasi tidak ditemukan dalam URL.";

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      try {
        await apiPost("/auth/verify-email", { token });
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Verifikasi email gagal. Token mungkin sudah kadaluarsa."
        );
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-8">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex justify-center mb-12">
          <Link href="/" className="inline-flex items-center gap-1">
            <span className="font-serif text-3xl font-bold tracking-widest text-ink-primary">NEXA</span>
            <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></span>
          </Link>
        </div>

        {/* Loading State */}
        {displayStatus === "loading" && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="w-20 h-20 rounded-full bg-paper border border-hairline flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-ink-secondary animate-spin">sync</span>
            </div>
            <div>
              <h1 className="font-serif text-2xl text-ink-primary mb-2">Memverifikasi Email...</h1>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Mohon tunggu sementara kami memverifikasi alamat email Anda.
              </p>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary/40"
                  style={{ animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Success State */}
        {displayStatus === "success" && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div
              className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center"
              style={{ animation: "successPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards" }}
            >
              <span className="material-symbols-outlined text-4xl text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
            <div>
              <h1 className="font-serif text-2xl text-ink-primary mb-2">Email Terverifikasi!</h1>
              <p className="text-xs text-ink-secondary leading-relaxed max-w-sm">
                Alamat email Anda telah berhasil diverifikasi. Akun NexaCommerce Anda kini aktif dan siap digunakan.
              </p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-xs px-6 py-4 w-full">
              <p className="text-xs text-emerald-800 flex items-center gap-2 justify-center">
                <span className="material-symbols-outlined text-base">verified_user</span>
                Akun Anda telah dikonfirmasi dan aman.
              </p>
            </div>
            <Link
              href="/auth/login"
              className="bg-primary hover:bg-primary-hover text-white text-xs uppercase font-bold tracking-widest px-10 py-3.5 rounded-xs transition-colors inline-flex items-center gap-2"
            >
              Masuk ke Akun
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
            <Link href="/" className="text-xs text-ink-secondary hover:text-ink-primary transition-colors">
              Kembali ke Beranda
            </Link>
          </div>
        )}

        {/* Error State */}
        {displayStatus === "error" && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="w-20 h-20 rounded-full bg-rose-50 border-2 border-rose-200 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-rose-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                cancel
              </span>
            </div>
            <div>
              <h1 className="font-serif text-2xl text-ink-primary mb-2">Verifikasi Gagal</h1>
              <p className="text-xs text-ink-secondary leading-relaxed max-w-sm">
                {displayErrorMessage || "Terjadi kesalahan saat memverifikasi email Anda."}
              </p>
            </div>
            <div className="bg-rose-50 border border-rose-100 rounded-xs px-6 py-4 w-full">
              <p className="text-xs text-rose-800 flex items-center gap-2 justify-center">
                <span className="material-symbols-outlined text-base">info</span>
                Token mungkin sudah kadaluarsa atau telah digunakan sebelumnya.
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full">
              <Link
                href="/auth/login"
                className="bg-primary hover:bg-primary-hover text-white text-xs uppercase font-bold tracking-widest px-10 py-3.5 rounded-xs transition-colors inline-flex items-center justify-center gap-2"
              >
                Kembali ke Login
              </Link>
              <p className="text-xs text-ink-secondary">
                Belum menerima email verifikasi?{" "}
                <Link href="/auth/resend-verification" className="text-primary font-bold hover:underline">
                  Kirim Ulang
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes successPop {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-surface flex items-center justify-center"><span className="font-serif text-2xl animate-pulse">Loading...</span></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
