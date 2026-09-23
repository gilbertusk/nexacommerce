"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { fetchProducts, categories, Product } from "@/lib/api/mockData";
import ProductCard from "@/components/ui/ProductCard";
import { ProductGridSkeleton } from "@/components/ui/LoadingSkeleton";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Carousel State
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselSlides = [
    {
      title: "Koleksi Tanah Liat Jingga",
      subtitle: "Sentuhan Bumi di Ruang Saji Anda",
      image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=1200",
      link: "/shop?category=Home%20Goods",
    },
    {
      title: "Sandang Linen Ringan",
      subtitle: "Napas Longgar Sepanjang Hari",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1200",
      link: "/shop?category=Apparel",
    },
    {
      title: "Aroma Terapi Nusantara",
      subtitle: "Menenangkan Jiwa yang Sibuk",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1200",
      link: "/shop?category=Apothecary",
    },
  ];

  // Flash Sale Timer State
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 34, seconds: 12 });

  useEffect(() => {
    // Load products
    const load = async () => {
      try {
        const data = await fetchProducts();
        setFeaturedProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();

    // Carousel Timer
    const carouselTimer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);

    // Countdown Timer
    const countdownTimer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          clearInterval(countdownTimer);
          return prev;
        }
      });
    }, 1000);

    return () => {
      clearInterval(carouselTimer);
      clearInterval(countdownTimer);
    };
  }, []);

  const formatNumber = (num: number) => String(num).padStart(2, "0");

  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-20">
      {/* 1. Editorial Hero Split-Layout */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pt-8 md:pt-16 grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-8 items-center">
        <div className="flex flex-col justify-center">
          <span className="text-[10px] uppercase font-bold tracking-widest text-primary mb-4 block">
            NEXA — Edisi Terbatas
          </span>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-none text-ink-primary tracking-tight mb-6">
            Menenun Estetika <br />
            <span className="italic font-normal text-primary">Selaras</span> Keseharian
          </h1>
          <p className="text-sm text-ink-secondary leading-relaxed mb-8 max-w-md">
            Menghadirkan seleksi kurasi produk sandang berbahan serat alami, peralatan keramik hand-thrown, dan esensi aromatik Nusantara yang dirancang untuk memperindah ruang hidup Anda.
          </p>
          <div className="flex gap-4">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center bg-primary hover:bg-primary-hover text-white text-xs uppercase font-bold tracking-widest px-8 py-4 rounded-xs transition-colors cursor-pointer"
            >
              Jelajahi Koleksi
            </Link>
            <Link
              href="/shop?sort=newest"
              className="inline-flex items-center justify-center bg-surface hover:bg-paper text-ink-primary text-xs uppercase font-bold tracking-widest px-8 py-4 rounded-xs hairline transition-colors cursor-pointer"
            >
              Rilis Terbaru
            </Link>
          </div>
        </div>

        <div className="relative h-[300px] md:h-[450px] lg:h-[500px] w-full bg-paper overflow-hidden hairline">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1200"
            alt="Editorial Home Showcase"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute bottom-4 left-4 bg-surface/85 backdrop-blur-xs p-3 hairline max-w-xs hidden sm:block">
            <span className="text-[9px] uppercase font-bold tracking-wider text-ink-secondary block mb-1">
              Sudut Inspirasi
            </span>
            <span className="font-serif text-sm text-ink-primary italic">
              "Ketenangan didapatkan melalui penyederhanaan bentuk dan kepatuhan pada alam."
            </span>
          </div>
        </div>
      </section>

      {/* 2. Category Shortcut Strip */}
      <section className="hairline-y bg-surface/50 py-6">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar scroll-smooth">
            {categories.map((cat, idx) => (
              <Link
                key={cat.id}
                href={`/shop?category=${encodeURIComponent(cat.name)}`}
                className="flex items-center gap-4 shrink-0 px-6 py-2 hover:bg-paper/50 transition-colors rounded-xs border-r border-hairline last:border-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-10 h-10 rounded-full object-cover hairline shrink-0"
                />
                <div className="flex flex-col">
                  <span className="text-xs uppercase font-bold tracking-widest text-ink-primary">
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-ink-secondary/70">
                    Lihat Koleksi
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Promotional Banner Carousel */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="relative h-[300px] md:h-[400px] w-full bg-paper overflow-hidden hairline rounded-sm">
          {carouselSlides.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 flex items-center ${
                idx === carouselIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.image}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover filter brightness-[0.85]"
              />
              <div className="relative z-20 px-8 md:px-16 text-white max-w-lg">
                <span className="text-[10px] uppercase font-bold tracking-widest text-primary bg-surface/90 text-primary px-2.5 py-1 rounded-sm mb-3 inline-block">
                  Sorotan Jurnal
                </span>
                <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl leading-tight mb-2">
                  {slide.title}
                </h2>
                <p className="text-xs md:text-sm text-paper/90 mb-6 font-medium">
                  {slide.subtitle}
                </p>
                <Link
                  href={slide.link}
                  className="inline-flex items-center justify-center bg-white text-ink-primary hover:bg-primary hover:text-white text-[10px] uppercase font-bold tracking-widest px-5 py-3 rounded-xs transition-colors cursor-pointer"
                >
                  Selengkapnya
                </Link>
              </div>
            </div>
          ))}

          {/* Dots Indicator */}
          <div className="absolute bottom-4 right-4 z-20 flex gap-2">
            {carouselSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCarouselIndex(idx)}
                className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${
                  idx === carouselIndex ? "bg-white w-6" : "bg-white/50"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Featured Collections Bento Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-[7fr_5fr] gap-6">
          {/* Bento Block 1 */}
          <div className="relative h-[350px] md:h-96 min-w-0 bg-paper overflow-hidden hairline rounded-sm group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800"
              alt="Crafts Process"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-ink-primary/80 via-ink-primary/20 to-transparent p-6 md:p-8 flex flex-col justify-end text-white">
              <span className="text-[9px] uppercase font-bold tracking-widest text-primary mb-2 block">
                Cerita Desain
              </span>
              <h3 className="font-serif text-2xl md:text-3xl mb-2">
                Kerajinan Tanah Liat Tradisional
              </h3>
              <p className="text-xs text-paper/80 max-w-sm mb-4">
                Dibuat langsung oleh maestro pengrajin di Kasongan, Jogjakarta. Setiap goresan adalah warisan masa lalu.
              </p>
              <Link
                href="/shop?category=Home%20Goods"
                className="text-[10px] uppercase font-bold tracking-widest text-white hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
              >
                Kunjungi Studio <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Bento Block 2 */}
          <div className="relative h-[350px] md:h-96 min-w-0 bg-paper overflow-hidden hairline rounded-sm group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=600"
              alt="Minimalist Living"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-ink-primary/80 via-ink-primary/20 to-transparent p-6 md:p-8 flex flex-col justify-end text-white">
              <span className="text-[9px] uppercase font-bold tracking-widest text-primary mb-2 block">
                Filosofi Material
              </span>
              <h3 className="font-serif text-2xl md:text-3xl mb-2">
                Keserhanaan Struktur
              </h3>
              <p className="text-xs text-paper/80 max-w-xs mb-4">
                Kami percaya pada bahan baku murni: serat rami organik, kayu jati lestari, dan tanah liat bumi lokal.
              </p>
              <Link
                href="/shop"
                className="text-[10px] uppercase font-bold tracking-widest text-white hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
              >
                Lihat Jurnal <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Flash Sale (Countdown Timer + Scroll Items) */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="bg-paper hairline p-6 md:p-8 rounded-sm">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
              <h2 className="font-serif text-2xl md:text-3xl text-ink-primary">
                Tawaran Terbatas
              </h2>
              {/* Countdown Frame */}
              <div className="flex items-center gap-1.5 bg-surface px-3 py-1.5 hairline rounded-xs text-xs font-mono text-ink-primary font-bold tabular-nums">
                <span>{formatNumber(timeLeft.hours)}</span>
                <span className="animate-pulse">:</span>
                <span>{formatNumber(timeLeft.minutes)}</span>
                <span className="animate-pulse">:</span>
                <span className="text-primary">{formatNumber(timeLeft.seconds)}</span>
              </div>
            </div>
            <Link
              href="/shop"
              className="text-xs uppercase font-bold tracking-widest text-ink-primary hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
            >
              Lihat Semua <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </Link>
          </div>

          {/* Flash Sale Product Row */}
          {loading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredProducts
                .filter((p) => p.discountPercentage && p.discountPercentage > 0)
                .slice(0, 4)
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    originalPrice={product.originalPrice}
                    discountPercentage={product.discountPercentage}
                    image={product.images[0]}
                    brand={product.brand}
                    stock={product.stock}
                    sellerName={product.sellerName}
                  />
                ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. Best Selling / New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col gap-12">
        <div>
          <div className="flex justify-between items-end mb-6">
            <h2 className="font-serif text-3xl text-ink-primary">
              Koleksi Terbaik Musim Ini
            </h2>
            <Link
              href="/shop"
              className="text-xs uppercase font-bold tracking-widest text-ink-primary hover:text-primary transition-colors cursor-pointer"
            >
              Katalog Lengkap
            </Link>
          </div>

          {loading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  discountPercentage={product.discountPercentage}
                  image={product.images[0]}
                  brand={product.brand}
                  stock={product.stock}
                  sellerName={product.sellerName}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 7. Trust Row */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 border-t border-hairline pt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col md:border-r border-hairline pr-6 last:border-0 last:pr-0">
            <div className="w-10 h-10 rounded-full bg-paper flex items-center justify-center text-primary mb-4">
              <span className="material-symbols-outlined">nature_people</span>
            </div>
            <h4 className="text-sm font-semibold text-ink-primary mb-2">
              Bahan Organik Murni
            </h4>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Seluruh serat sandang kami ditenun secara saksama menggunakan linen alami, pewarnaan indigo nabati bebas kimia berbahaya.
            </p>
          </div>

          <div className="flex flex-col md:border-r border-hairline pr-6 last:border-0 last:pr-0">
            <div className="w-10 h-10 rounded-full bg-paper flex items-center justify-center text-primary mb-4">
              <span className="material-symbols-outlined">spa</span>
            </div>
            <h4 className="text-sm font-semibold text-ink-primary mb-2">
              Kurasi Pengrajin Lokal
            </h4>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Bekerja sama erat dengan koperasi pengrajin dan pembuat tembikar tradisional di pelosok desa demi upah yang adil dan pelestarian seni.
            </p>
          </div>

          <div className="flex flex-col last:border-0 last:pr-0">
            <div className="w-10 h-10 rounded-full bg-paper flex items-center justify-center text-primary mb-4">
              <span className="material-symbols-outlined">package</span>
            </div>
            <h4 className="text-sm font-semibold text-ink-primary mb-2">
              Pengiriman Tanpa Plastik
            </h4>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Kami berkomitmen penuh menjaga kelestarian lingkungan. Seluruh kemasan kami menggunakan kardus daur ulang dan pelindung organik.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
