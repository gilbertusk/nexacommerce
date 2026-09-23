"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { useUserStore } from "@/lib/store/useUserStore";
import { useRegister } from "@/lib/api/hooks/useAuth";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState("");

  const { user } = useUserStore();
  const registerMutation = useRegister();

  useEffect(() => {
    if (user) {
      router.push(redirectUrl);
    }
  }, [user, redirectUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    registerMutation.reset();

    if (!name || !email || !password || !confirmPassword) {
      setValidationError("Seluruh rincian formulir pendaftaran wajib diisi.");
      return;
    }

    if (password.length < 6) {
      setValidationError("Kata sandi minimal harus terdiri dari 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setValidationError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    try {
      await registerMutation.mutateAsync({ name, email, password });
      router.push(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`);
    } catch {
      // Error is captured in registerMutation.error
    }
  };

  const errorMessage =
    validationError ||
    (registerMutation.error instanceof Error
      ? registerMutation.error.message
      : registerMutation.isError
      ? "Pendaftaran gagal. Silakan coba kembali."
      : "");

  return (
    <div className="min-h-screen flex">
      {/* Left Panel: Visual Editorial Showcase (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-paper items-center justify-center p-12 overflow-hidden hairline-r">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=1000"
          alt="Editorial Register BG"
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.7]"
        />
        <div className="relative z-10 text-white max-w-md flex flex-col gap-4">
          <span className="text-[10px] uppercase font-bold tracking-widest text-primary bg-white text-primary px-2.5 py-1 rounded-sm w-fit">
            NEXA Anggota
          </span>
          <h2 className="font-serif text-4xl md:text-5xl leading-tight">
            Bagian dari Gerakan Kehidupan yang Selaras.
          </h2>
          <p className="text-xs text-paper/85 leading-relaxed">
            Daftarkan diri Anda untuk menikmati kemudahan transaksi, buku alamat terintegrasi, dan notifikasi pelacakan pengiriman secara langsung.
          </p>
        </div>
      </div>

      {/* Right Panel: Clean Registration Form */}
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
            <h1 className="text-xl font-serif text-ink-primary">Daftar Keanggotaan</h1>
            <p className="text-xs text-ink-secondary mt-1">Lengkapi data diri untuk membuka akses penuh toko.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-ink-secondary">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Budi Santoso"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={registerMutation.isPending}
                className="bg-paper text-xs text-ink-primary px-3.5 py-3 rounded-xs border border-transparent focus:border-outline-variant focus:outline-hidden transition-all placeholder:text-ink-secondary/50"
              />
            </div>

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
                disabled={registerMutation.isPending}
                className="bg-paper text-xs text-ink-primary px-3.5 py-3 rounded-xs border border-transparent focus:border-outline-variant focus:outline-hidden transition-all placeholder:text-ink-secondary/50"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-ink-secondary">
                Kata Sandi
              </label>
              <input
                type="password"
                required
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={registerMutation.isPending}
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
                placeholder="Ulangi kata sandi"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={registerMutation.isPending}
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
              disabled={registerMutation.isPending}
              className="bg-primary hover:bg-primary-hover text-white text-xs uppercase font-bold tracking-widest py-3.5 rounded-xs transition-colors flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
            >
              {registerMutation.isPending ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                  Mendaftar...
                </>
              ) : (
                "Daftar Anggota"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center border-t border-hairline pt-6">
            <p className="text-xs text-ink-secondary">
              Sudah memiliki akun anggota?{" "}
              <Link href={`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`} className="text-primary font-bold hover:underline">
                Masuk Sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-surface flex items-center justify-center"><span className="font-serif text-2xl animate-pulse">Loading...</span></div>}>
      <RegisterContent />
    </Suspense>
  );
}
