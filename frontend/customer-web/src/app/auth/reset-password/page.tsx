"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { apiPost } from "@/lib/api/client";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-8">
        <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-rose-600">link_off</span>
          </div>
          <div>
            <h1 className="font-serif text-xl text-ink-primary mb-2">Tautan Tidak Valid</h1>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Token pemulihan tidak ditemukan atau tidak valid. Silakan minta tautan baru.
            </p>
          </div>
          <Link
            href="/auth/forgot-password"
            className="bg-primary hover:bg-primary-hover text-white text-xs uppercase font-bold tracking-widest px-8 py-3 rounded-xs transition-colors"
          >
            Minta Tautan Baru
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Kata sandi minimal harus terdiri dari 8 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setIsLoading(true);
    try {
      await apiPost("/auth/reset-password", { token, newPassword });
      setIsSuccess(true);
      setTimeout(() => router.push("/auth/login"), 2500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-paper items-center justify-center p-12 overflow-hidden hairline-r">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1000"
          alt="Reset Password Background"
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.65]"
        />
        <div className="relative z-10 text-white max-w-md flex flex-col gap-4">
          <span className="text-[10px] uppercase font-bold tracking-widest bg-white text-primary px-2.5 py-1 rounded-sm w-fit">
            NEXA Keamanan
          </span>
          <h2 className="font-serif text-4xl md:text-5xl leading-tight">
            Atur Ulang Kata Sandi Baru Anda.
          </h2>
          <p className="text-xs text-paper/85 leading-relaxed">
            Pilih kata sandi baru yang kuat untuk mengamankan akun NexaCommerce Anda.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-surface">
        <div className="w-full max-w-sm flex flex-col">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-1 mb-2">
              <span className="font-serif text-3xl font-bold tracking-widest text-ink-primary">
                NEXA
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></span>
            </Link>
            <h1 className="text-xl font-serif text-ink-primary">Atur Ulang Kata Sandi</h1>
            <p className="text-xs text-ink-secondary mt-1">
              Buat kata sandi baru yang aman untuk akun Anda.
            </p>
          </div>

          {isSuccess ? (
            <div className="flex flex-col items-center gap-6 py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-emerald-600">check_circle</span>
              </div>
              <div className="text-center">
                <h2 className="font-serif text-xl text-ink-primary mb-2">Kata Sandi Diperbarui!</h2>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  Kata sandi Anda berhasil diperbarui. Anda akan diarahkan ke halaman login...
                </p>
              </div>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 text-xs uppercase font-bold tracking-widest text-primary hover:underline"
              >
                Masuk Sekarang
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-ink-secondary">
                  Kata Sandi Baru
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimal 8 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-paper text-xs text-ink-primary px-3.5 py-3 rounded-xs border border-transparent focus:border-outline-variant focus:outline-hidden transition-all placeholder:text-ink-secondary/50"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-ink-secondary">
                  Konfirmasi Kata Sandi
                </label>
                <input
                  type="password"
                  required
                  placeholder="Ulangi kata sandi baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-paper text-xs text-ink-primary px-3.5 py-3 rounded-xs border border-transparent focus:border-outline-variant focus:outline-hidden transition-all placeholder:text-ink-secondary/50"
                />
              </div>

              {error && (
                <p className="text-[10px] text-rose-800 font-semibold flex items-center gap-1.5 mt-1">
                  <span className="material-symbols-outlined text-sm">error</span>
                  <span>{error}</span>
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="bg-primary hover:bg-primary-hover text-white text-xs uppercase font-bold tracking-widest py-3.5 rounded-xs transition-colors flex items-center justify-center gap-1.5 mt-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                    Memperbarui...
                  </>
                ) : (
                  "Perbarui Kata Sandi"
                )}
              </button>
            </form>
          )}

          {!isSuccess && (
            <div className="mt-8 text-center border-t border-hairline pt-6">
              <p className="text-xs text-ink-secondary">
                <Link href="/auth/login" className="text-primary font-bold hover:underline">
                  Kembali ke Login
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-surface flex items-center justify-center"><span className="font-serif text-2xl animate-pulse">Loading...</span></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
