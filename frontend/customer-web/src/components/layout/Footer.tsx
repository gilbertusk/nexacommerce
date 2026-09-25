"use client";

import Link from "next/link";

export default function Footer() {
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
                <span className="text-xs text-ink-secondary">Kebijakan pengembalian akan dipublikasikan setelah ditetapkan.</span>
              </li>
              <li>
                <span className="text-xs text-ink-secondary">Panduan perawatan bahan segera hadir.</span>
              </li>
              <li>
                <span className="text-xs text-ink-secondary">Saluran kontak pelanggan belum tersedia.</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter Sign-up */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs uppercase font-bold tracking-widest text-ink-primary">
              Kabar Berkala
            </h4>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Pendaftaran newsletter belum tersedia. Kami tidak akan mengklaim alamat email tersimpan sebelum layanan ini aktif.
            </p>
          </div>
        </div>

        {/* Footer Bottom Separator */}
        <div className="hairline-t pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-ink-secondary">Kanal sosial dan jurnal belum dikonfigurasi.</p>

          <div className="flex gap-4 text-[10px] text-ink-secondary/60 font-mono">
            <span>Dibuat dengan dedikasi di Jakarta</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
