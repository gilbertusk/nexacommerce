'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSellerStore } from '@/lib/store/useSellerStore';
import { apiPost } from '@/lib/api/client';

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
  message?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const login = useSellerStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await apiPost<LoginResponse>('/api/v1/auth/login', {
        email,
        password,
      });

      if (!res.success || !res.data) {
        setError(res.message ?? 'Login gagal. Silakan coba lagi.');
        return;
      }

      const { user } = res.data;

      if (user.role !== 'SELLER') {
        await apiPost('/api/v1/auth/logout', {});
        setError(
          'Akun ini bukan akun penjual. Silakan gunakan akun seller untuk masuk.',
        );
        return;
      }

      login(user);
      router.push('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-10">
          <span className="font-serif text-4xl tracking-tight text-ink-primary">
            NEXA{' '}
            <span className="text-primary text-lg font-sans tracking-normal uppercase">
              Seller
            </span>
          </span>
          <p className="text-sm text-ink-secondary mt-3">
            Masuk ke dashboard penjual Anda
          </p>
        </div>

        {/* Card */}
        <div className="bg-white hairline rounded-sm p-8">
          <h1 className="text-xl font-serif text-ink-primary mb-6">
            Masuk ke Toko Anda
          </h1>

          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 hairline border-red-200 rounded-sm p-4">
              <span className="material-symbols-outlined text-red-600 text-sm mt-0.5">
                error
              </span>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-xs font-bold uppercase tracking-widest text-ink-secondary"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="penjual@contoh.com"
                className="w-full px-4 py-3 bg-surface hairline rounded-sm text-sm text-ink-primary placeholder:text-ink-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-xs font-bold uppercase tracking-widest text-ink-secondary"
              >
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
                className="w-full px-4 py-3 bg-surface hairline rounded-sm text-sm text-ink-primary placeholder:text-ink-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs uppercase font-bold tracking-widest px-6 py-4 rounded-sm transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">
                    progress_activity
                  </span>
                  Memproses...
                </>
              ) : (
                'Masuk'
              )}
            </button>
          </form>
        </div>

        {/* Register Link */}
        <p className="text-center text-sm text-ink-secondary mt-6">
          Pendaftaran akun penjual belum tersedia dari aplikasi ini.
        </p>
      </div>
    </div>
  );
}
