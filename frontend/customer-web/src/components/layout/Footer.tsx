"use client";

import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSuccess(true);
      setNewsletterEmail("");
      setTimeout(() => setNewsletterSuccess(false), 5000);
    }
  };

  return (
    <footer className="bg-surface hairline-t mt-auto w-full pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Main Grid: 4 columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-16">
          {/* Column 1: Editorial Statement */}
          <div className="flex flex-col gap-4">
            <span className="font-serif text-3xl font-bold tracking-widest text-ink-primary">
              NEXA
            </span>
            <p className="text-xs text-ink-secondary leading-relaxed max-w-sm">
              Sebuah kurasi premium produk sandang, kerajinan tanah liat, dan wewangian alam Nusantara. Didesain dengan estetika modern untuk mendukung kehidupan yang selaras dan bermakna.
            </p>
            <p className="text-[10px] text-ink-secondary/70 font-mono mt-4 uppercase">
              © {new Date().getFullYear()} NexaCommerce.
            </p>
          </div>

          {/* Column 2: Collections */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs uppercase font-bold tracking-widest text-ink-primary">
              Koleksi Utama
            </h4>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/shop?category=Apparel" className="text-xs text-ink-secondary hover:text-primary transition-colors">
                  Pakaian Linen
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Home%20Goods" className="text-xs text-ink-secondary hover:text-primary transition-colors">
                  Keramik Buatan Tangan
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Apothecary" className="text-xs text-ink-secondary hover:text-primary transition-colors">
                  Apoteker & Wewangian
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Accessories" className="text-xs text-ink-secondary hover:text-primary transition-colors">
                  Tas & Aksesoris
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs uppercase font-bold tracking-widest text-ink-primary">
              Layanan Pelanggan
            </h4>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/orders" className="text-xs text-ink-secondary hover:text-primary transition-colors">
                  Lacak Pesanan
                </Link>
              </li>
              <li>
                <a href="#" className="text-xs text-ink-secondary hover:text-primary transition-colors">
                  Kebijakan Pengembalian
                </a>
              </li>
              <li>
                <a href="#" className="text-xs text-ink-secondary hover:text-primary transition-colors">
                  Panduan Perawatan Bahan
                </a>
              </li>
              <li>
                <a href="#" className="text-xs text-ink-secondary hover:text-primary transition-colors">
                  Hubungi Kami
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter Sign-up */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs uppercase font-bold tracking-widest text-ink-primary">
              Kabar Berkala
            </h4>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Dapatkan pembaruan rilis terbatas koleksi kami dan jurnal editorial terpilih.
            </p>

            <form onSubmit={handleSubscribe} className="flex flex-col gap-2 mt-2">
              <div className="flex relative">
                <input
                  type="email"
                  placeholder="Alamat Email Anda"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  className="w-full bg-paper text-xs text-ink-primary px-3 py-2.5 rounded-xs border border-transparent focus:border-outline-variant focus:outline-hidden transition-all placeholder:text-ink-secondary/60"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-primary hover:text-primary transition-colors flex items-center justify-center cursor-pointer"
                  aria-label="Subscribe"
                >
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>

              {newsletterSuccess && (
                <span className="text-[10px] text-emerald-700 font-semibold mt-1">
                  Pendaftaran berhasil! Jurnal pertama akan segera dikirim.
                </span>
              )}
            </form>
          </div>
        </div>

        {/* Footer Bottom Separator */}
        <div className="hairline-t pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-6">
            <a href="#" className="text-[10px] uppercase font-bold tracking-widest text-ink-secondary hover:text-primary transition-colors">
              Instagram
            </a>
            <a href="#" className="text-[10px] uppercase font-bold tracking-widest text-ink-secondary hover:text-primary transition-colors">
              Pinterest
            </a>
            <a href="#" className="text-[10px] uppercase font-bold tracking-widest text-ink-secondary hover:text-primary transition-colors">
              Journal
            </a>
          </div>

          <div className="flex gap-4 text-[10px] text-ink-secondary/60 font-mono">
            <span>Dibuat dengan dedikasi di Jakarta</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
