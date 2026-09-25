"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiPost } from "@/lib/api/client";

function ResendVerificationContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";
  const wasRegistered = searchParams.get("registered") === "1";
  const deliveryAccepted = searchParams.get("delivery") === "accepted";
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await apiPost("/auth/resend-verification", { email });
      setIsSent(true);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Permintaan gagal. Silakan coba kembali."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface p-8">
      <section className="w-full max-w-md">
        <Link href="/" className="font-serif text-3xl font-bold tracking-widest text-ink-primary">
          NEXA<span className="text-primary">.</span>
        </Link>
        <h1 className="font-serif text-2xl text-ink-primary mt-8 mb-2">
          Kirim Ulang Verifikasi Email
        </h1>
        {wasRegistered && !isSent && (
          <p className="text-sm text-ink-secondary mb-5" role="status">
            {deliveryAccepted
              ? "Pendaftaran berhasil dan layanan email menerima permintaan verifikasi. Periksa inbox/spam; jika tautan tidak tiba, minta pengiriman ulang di sini."
              : "Pendaftaran berhasil, tetapi layanan email belum mengonfirmasi permintaan verifikasi. Anda dapat mencoba mengirim ulang di sini; jangan mendaftar ulang."}
          </p>
        )}
        {isSent ? (
          <div role="status" className="bg-emerald-50 border border-emerald-100 rounded-xs p-5">
            <p className="text-sm text-emerald-900">
              Jika alamat email terdaftar dan belum diverifikasi, instruksi verifikasi akan dikirim. Periksa inbox dan folder spam.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <p className="text-sm text-ink-secondary">
              Masukkan email akun Anda. Demi keamanan, hasil permintaan tidak mengungkap status akun.
            </p>
            <label className="flex flex-col gap-1 text-xs font-semibold text-ink-secondary">
              Alamat Email
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isLoading}
                className="bg-paper text-sm text-ink-primary px-3.5 py-3 rounded-xs border border-hairline focus:border-outline-variant focus:outline-hidden"
              />
            </label>
            {error && <p role="alert" className="text-sm text-rose-800">{error}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary-hover disabled:opacity-60 text-white text-xs uppercase font-bold tracking-widest py-3.5 rounded-xs"
            >
              {isLoading ? "Mengirim..." : "Kirim Ulang Tautan"}
            </button>
          </form>
        )}
        <Link
          href={`/auth/login?redirect=${encodeURIComponent(redirect)}`}
          className="inline-block mt-6 text-sm text-primary font-bold hover:underline"
        >
          Kembali ke Login
        </Link>
      </section>
    </main>
  );
}

export default function ResendVerificationPage() {
  return (
    <Suspense fallback={<main className="min-h-screen flex items-center justify-center">Memuat...</main>}>
      <ResendVerificationContent />
    </Suspense>
  );
}
