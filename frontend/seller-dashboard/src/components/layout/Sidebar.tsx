'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSellerStore } from '@/lib/store/useSellerStore';

const navigation = [
  { name: 'Beranda', href: '/', icon: 'home' },
  { name: 'Produk', href: '/products', icon: 'inventory_2' },
  { name: 'Inventori', href: '/inventory', icon: 'warehouse' },
  { name: 'Pesanan', href: '/orders', icon: 'receipt_long' },
  { name: 'Analitik', href: '/analytics', icon: 'monitoring' },
  { name: 'Ulasan', href: '/reviews', icon: 'star' },
  { name: 'Pengiriman', href: '/shipping', icon: 'local_shipping' },
  { name: 'Profil Toko', href: '/profile', icon: 'store' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { seller, logout } = useSellerStore();

  function handleLogout() {
    logout();
    router.push('/login');
  }

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside className="w-64 bg-white hairline-r flex flex-col h-full sticky top-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 hairline-b shrink-0">
        <span className="font-serif text-2xl tracking-tight text-ink-primary">
          NEXA{' '}
          <span className="text-primary text-sm font-sans tracking-normal uppercase ml-1">
            Seller
          </span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 flex flex-col gap-1 overflow-y-auto">
        <div className="text-[10px] uppercase font-bold tracking-widest text-ink-secondary mb-2 px-2">
          Menu Utama
        </div>
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-sm transition-colors text-sm font-medium ${
                active
                  ? 'bg-paper text-primary font-bold'
                  : 'text-ink-secondary hover:bg-surface hover:text-ink-primary'
              }`}
            >
              <span
                className={`material-symbols-outlined text-xl ${active ? 'fill-1' : ''}`}
              >
                {item.icon}
              </span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User info + Logout */}
      <div className="p-4 hairline-t shrink-0 flex flex-col gap-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-surface hairline flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-sm text-ink-secondary">
              storefront
            </span>
          </div>
          <div className="flex flex-col truncate">
            <span className="text-xs font-bold text-ink-primary truncate">
              {seller?.name ?? 'Seller'}
            </span>
            <span className="text-[10px] text-ink-secondary truncate">
              {seller?.email ?? ''}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-sm text-xs font-medium text-ink-secondary hover:text-red-600 hover:bg-red-50 transition-colors w-full"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          Keluar
        </button>
      </div>
    </aside>
  );
}
