"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { useUserStore } from "@/lib/store/useUserStore";
import { useLogin } from "@/lib/api/hooks/useAuth";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { user } = useUserStore();
  const loginMutation = useLogin();

  useEffect(() => {
    if (user) {
      router.push(redirectUrl);
    }
  }, [user, redirectUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.reset();

    try {
      await loginMutation.mutateAsync({ email, password });
      router.push(redirectUrl);
    } catch {
      // Error is captured in loginMutation.error
    }
  };

  const errorMessage = loginMutation.error instanceof Error
    ? loginMutation.error.message
    : loginMutation.isError
    ? "Kombinasi email atau kata sandi salah."
    : "";

  return (
    <div className="min-h-screen flex">
      {/* Left Panel: Visual Editorial Showcase (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-paper items-center justify-center p-12 overflow-hidden hairline-r">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1000"
          alt="Editorial Login BG"
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.7]"
        />
        <div className="relative z-10 text-white max-w-md flex flex-col gap-4">
          <span className="text-[10px] uppercase font-bold tracking-widest text-primary bg-white text-primary px-2.5 py-1 rounded-sm w-fit">
            NEXA Jurnal
          </span>
          <h2 className="font-serif text-4xl md:text-5xl leading-tight">
            Menyelaraskan Jiwa, Raga, dan Ruang Hidup.
          </h2>
          <p className="text-xs text-paper/85 leading-relaxed">
            Masuk ke portal anggota NexaCommerce untuk menikmati kurasi khusus, melacak kiriman pesanan, serta pembaruan rilis terbatas koleksi kami.
          </p>
        </div>
      </div>

      {/* Right Panel: Clean Authentication Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-surface">
        <div className="w-full max-w-sm flex flex-col">
          {/* Mobile logo header */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-1 mb-2">
              <span className="font-serif text-3xl font-bold tracking-widest text-ink-primary">
                NEXA
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></span>
            </Link>
            <h1 className="text-xl font-serif text-ink-primary">Selamat Datang Kembali</h1>
            <p className="text-xs text-ink-secondary mt-1">Masukkan rincian akun Anda untuk masuk.</p>
          </div>

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
                disabled={loginMutation.isPending}
                className="bg-paper text-xs text-ink-primary px-3.5 py-3 rounded-xs border border-transparent focus:border-outline-variant focus:outline-hidden transition-all placeholder:text-ink-secondary/50"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase font-bold tracking-wider text-ink-secondary">
                  Kata Sandi
                </label>
                <Link href="/auth/forgot-password" className="text-[10px] text-ink-secondary hover:text-primary transition-colors">
                  Lupa Sandi?
                </Link>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loginMutation.isPending}
                className="bg-paper text-xs text-ink-primary px-3.5 py-3 rounded-xs border border-transparent focus:border-outline-variant focus:outline-hidden transition-all placeholder:text-ink-secondary/50"
              />
            </div>

            {errorMessage && (
              <p className="text-[10px] text-rose-800 font-semibold flex items-center gap-1.5 mt-1">
                <span className="material-symbols-outlined text-sm">error</span>
                <span>{errorMessage}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="bg-primary hover:bg-primary-hover text-white text-xs uppercase font-bold tracking-widest py-3.5 rounded-xs transition-colors flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
            >
              {loginMutation.isPending ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                  Masuk...
                </>
              ) : (
                "Masuk Akun"
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center border-t border-hairline pt-6">
            <p className="text-xs text-ink-secondary">
              Belum terdaftar sebagai anggota?{" "}
              <Link href={`/auth/register?redirect=${encodeURIComponent(redirectUrl)}`} className="text-primary font-bold hover:underline">
                Daftar Sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-surface flex items-center justify-center"><span className="font-serif text-2xl animate-pulse">Loading...</span></div>}>
      <LoginContent />
    </Suspense>
  );
}
