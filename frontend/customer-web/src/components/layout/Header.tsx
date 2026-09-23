"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/store/useCartStore";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import { useUserStore } from "@/lib/store/useUserStore";

export default function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const cartItems = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);
  const { user, logout } = useUserStore();

  // Get quantities
  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const wishlistCount = wishlistItems.length;

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    router.push("/");
  };

  return (
    <header
      className={`sticky top-0 z-50 h-20 w-full bg-surface/90 backdrop-blur-md transition-all duration-300 ${
        scrolled ? "hairline-b shadow-xs" : "hairline-b"
      }`}
    >
      <div className="max-w-7xl mx-auto h-full px-4 md:px-8 flex items-center justify-between gap-4">
        {/* Left Side: Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-serif text-3xl font-bold tracking-widest text-ink-primary group-hover:text-primary transition-colors">
            NEXA
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></span>
        </Link>

        {/* Center: Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 max-w-md relative"
        >
          <input
            type="text"
            placeholder="Cari pakaian, keramik, wewangian..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-paper text-sm text-ink-primary pl-4 pr-10 py-2 rounded-xs border border-transparent focus:border-outline-variant focus:outline-hidden transition-all placeholder:text-ink-secondary/60"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-secondary hover:text-primary transition-colors flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">search</span>
          </button>
        </form>

        {/* Right Side: Action Icons */}
        <nav className="flex items-center gap-4 md:gap-6">
          {/* Catalog Shortcut */}
          <Link
            href="/shop"
            className="text-xs uppercase font-bold tracking-widest text-ink-primary hover:text-primary transition-colors hidden sm:block"
          >
            Belanja
          </Link>

          {/* Wishlist Link */}
          <Link
            href="/wishlist"
            className="relative p-1.5 text-ink-primary hover:text-primary transition-colors flex items-center justify-center"
            aria-label="Wishlist"
          >
            <span className="material-symbols-outlined">favorite</span>
            {mounted && wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 bg-primary text-white text-[9px] font-mono font-bold flex items-center justify-center px-1 rounded-full border border-surface">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Link */}
          <Link
            href="/cart"
            className="relative p-1.5 text-ink-primary hover:text-primary transition-colors flex items-center justify-center"
            aria-label="Cart"
          >
            <span className="material-symbols-outlined">shopping_bag</span>
            {mounted && cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 bg-primary text-white text-[9px] font-mono font-bold flex items-center justify-center px-1 rounded-full border border-surface">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Profile Dropdown or Login */}
          {mounted && user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 py-1 text-ink-primary hover:text-primary transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">account_circle</span>
                <span className="text-xs uppercase font-bold tracking-widest hidden lg:block">
                  {user.name.split(" ")[0]}
                </span>
                <span className="material-symbols-outlined text-sm hidden lg:block">
                  arrow_drop_down
                </span>
              </button>

              {dropdownOpen && (
                <>
                  {/* Backdrop overlay */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-surface hairline rounded-xs shadow-md z-20 py-1.5">
                    <div className="px-4 py-2 border-b border-hairline">
                      <p className="text-xs font-semibold text-ink-primary truncate">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-ink-secondary truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-xs text-ink-primary hover:bg-paper transition-colors"
                    >
                      Buku Alamat
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-xs text-ink-primary hover:bg-paper transition-colors"
                    >
                      Riwayat Pesanan
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-xs text-primary font-semibold hover:bg-paper transition-colors cursor-pointer border-t border-hairline mt-1.5"
                    >
                      Keluar
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1 bg-ink-primary hover:bg-primary text-white text-xs uppercase font-bold tracking-widest px-4 py-2 rounded-xs transition-all"
            >
              Masuk
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
