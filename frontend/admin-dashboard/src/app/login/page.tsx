"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/lib/store/useAdminStore";
import { apiPost } from "@/lib/api/client";

interface LoginResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  };
}

export default function LoginPage() {
  const router = useRouter();
  const login = useAdminStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await apiPost<LoginResponse>("/auth/login", { email, password });

      if (!res.success) {
        setError("Login gagal. Periksa kredensial Anda.");
        return;
      }

      if (res.data.user.role !== "ADMIN") {
        await apiPost("/auth/logout", {});
        setError("Akses ditolak. Hanya admin yang diizinkan masuk.");
        return;
      }

      login(res.data.user);
      router.push("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-ink-primary rounded-sm mb-4">
            <span className="material-symbols-outlined text-white text-xl">shield_person</span>
          </div>
          <h1 className="font-serif text-3xl text-ink-primary">NEXA</h1>
          <p className="text-xs uppercase tracking-widest font-bold text-primary mt-1">Admin Dashboard</p>
        </div>

        <div className="bg-white hairline rounded-sm p-8">
          <div className="mb-6">
            <h2 className="text-lg font-serif text-ink-primary">Masuk ke Akun Admin</h2>
            <p className="text-xs text-ink-secondary mt-1">Hanya untuk administrator resmi NexaCommerce.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-ink-secondary" htmlFor="email">
                Alamat Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nexacommerce.id"
                className="w-full px-3 py-2.5 bg-surface hairline rounded-sm text-sm text-ink-primary placeholder:text-ink-secondary focus:outline-none focus:ring-1 focus:ring-primary transition-shadow"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-ink-secondary" htmlFor="password">
                Kata Sandi
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 bg-surface hairline rounded-sm text-sm text-ink-primary placeholder:text-ink-secondary focus:outline-none focus:ring-1 focus:ring-primary transition-shadow"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 text-red-700 hairline border-red-200 rounded-sm px-3 py-2.5 text-xs">
                <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-ink-primary text-white rounded-sm py-2.5 text-sm font-bold uppercase tracking-widest hover:bg-ink-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-ink-secondary mt-6">
          NexaCommerce &copy; {new Date().getFullYear()} · Panel Administrasi
        </p>
      </div>
    </div>
  );
}
