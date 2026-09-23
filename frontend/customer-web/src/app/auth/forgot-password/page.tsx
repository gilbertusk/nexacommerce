"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { apiPost } from "@/lib/api/client";

function ForgotPasswordContent() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await apiPost("/auth/forgot-password", { email });
      setIsSuccess(true);
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
          src="https://images.unsplash.com/photo-1586769852044-692d6e3703f2?auto=format&fit=crop&q=80&w=1000"
          alt="Forgot Password Background"
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.65]"
        />
        <div className="relative z-10 text-white max-w-md flex flex-col gap-4">
          <span className="text-[10px] uppercase font-bold tracking-widest bg-white text-primary px-2.5 py-1 rounded-sm w-fit">
            NEXA Keamanan
          </span>
          <h2 className="font-serif text-4xl md:text-5xl leading-tight">
            Pulihkan Akses Akun Anda dengan Mudah.
          </h2>
          <p className="text-xs text-paper/85 leading-relaxed">
            Masukkan alamat email Anda dan kami akan segera mengirimkan tautan untuk mengatur ulang kata sandi Anda.
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
            <h1 className="text-xl font-serif text-ink-primary">Lupa Kata Sandi</h1>
            <p className="text-xs text-ink-secondary mt-1">
              Masukkan email akun Anda untuk menerima tautan pemulihan.
            </p>
          </div>

          {isSuccess ? (
            /* Success State */
            <div className="flex flex-col items-center gap-6 py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-emerald-600">mark_email_read</span>
              </div>
              <div className="text-center">
                <h2 className="font-serif text-xl text-ink-primary mb-2">Email Terkirim!</h2>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  Kami telah mengirimkan tautan pemulihan ke{" "}
                  <span className="font-semibold text-ink-primary">{email}</span>.
                  Silakan periksa kotak masuk Anda.
                </p>
                <p className="text-[10px] text-ink-secondary mt-3">
                  Tidak menerima email? Periksa folder spam atau{" "}
                  <button
                    onClick={() => { setIsSuccess(false); setEmail(""); }}
                    className="text-primary font-bold hover:underline cursor-pointer"
                  >
                    coba lagi
                  </button>
                  .
                </p>
              </div>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 text-xs uppercase font-bold tracking-widest text-ink-primary hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Kembali ke Halaman Login
              </Link>
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-ink-secondary">
                  Alamat Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="contoh@nexa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    Mengirim...
                  </>
                ) : (
                  "Kirim Tautan Pemulihan"
                )}
              </button>
            </form>
          )}

          {/* Back to login */}
          {!isSuccess && (
            <div className="mt-8 text-center border-t border-hairline pt-6">
              <p className="text-xs text-ink-secondary">
                Ingat kata sandi Anda?{" "}
                <Link href="/auth/login" className="text-primary font-bold hover:underline">
                  Masuk Sekarang
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-surface flex items-center justify-center"><span className="font-serif text-2xl animate-pulse">Loading...</span></div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
