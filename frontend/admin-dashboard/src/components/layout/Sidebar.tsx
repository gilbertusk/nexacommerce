"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminStore } from "@/lib/store/useAdminStore";

const navigation = [
  { name: "Overview", href: "/", icon: "analytics" },
  { name: "Pengguna", href: "/users", icon: "group" },
  { name: "Produk", href: "/products", icon: "inventory_2" },
  { name: "Pesanan", href: "/orders", icon: "receipt_long" },
  { name: "Analitik", href: "/analytics", icon: "monitoring" },
  { name: "Verifikasi Toko", href: "/sellers/verification", icon: "verified_user" },
  { name: "Lokasi Pengiriman", href: "/sellers/dispatch-origins", icon: "local_shipping" },
  { name: "Tarif Pengiriman", href: "/shipping/rates", icon: "route" },
  { name: "Ulasan", href: "/reviews", icon: "star" },
  { name: "Pembayaran", href: "/payments", icon: "payments" },
  { name: "Notifikasi", href: "/notifications", icon: "notifications" },
  { name: "Inventori", href: "/inventory", icon: "warehouse" },
  { name: "Pengaturan", href: "/settings", icon: "settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, logout } = useAdminStore();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <aside className="w-64 bg-white hairline-r flex flex-col h-full sticky top-0">
      <div className="h-16 flex items-center px-6 hairline-b shrink-0">
        <span className="font-serif text-2xl tracking-tight text-ink-primary">
          NEXA{" "}
          <span className="text-primary text-sm font-sans tracking-normal uppercase ml-1">Admin</span>
        </span>
      </div>

      <nav className="flex-1 py-6 px-4 flex flex-col gap-1 overflow-y-auto">
        <div className="text-[10px] uppercase font-bold tracking-widest text-ink-secondary mb-2 px-2">
          Menu Superadmin
        </div>
        {navigation.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-sm transition-colors text-sm font-medium ${
                isActive
                  ? "bg-paper text-primary font-bold"
                  : "text-ink-secondary hover:bg-surface hover:text-ink-primary"
              }`}
            >
              <span className={`material-symbols-outlined text-xl ${isActive ? "fill-1" : ""}`}>
                {item.icon}
              </span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 hairline-t shrink-0 flex flex-col gap-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-surface hairline flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-sm text-ink-secondary">shield_person</span>
          </div>
          <div className="flex flex-col truncate">
            <span className="text-xs font-bold text-ink-primary truncate">
              {admin?.name ?? "System Admin"}
            </span>
            <span className="text-[10px] text-ink-secondary truncate">
              {admin?.email ?? "NexaCommerce HQ"}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-sm text-sm text-ink-secondary hover:text-red-600 hover:bg-red-50 transition-colors w-full"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          Keluar
        </button>
      </div>
    </aside>
  );
}
