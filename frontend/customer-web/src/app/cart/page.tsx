"use client";

import Link from "next/link";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { useCart, useRemoveCartItem, useUpdateCartItem, normalizeCartItem } from "@/lib/api/hooks/useCart";
import { useUserStore } from "@/lib/store/useUserStore";
import { formatIDR } from "@/lib/utils/format";
import QuantityStepper from "@/components/ui/QuantityStepper";
import EmptyState from "@/components/ui/EmptyState";

export default function CartPage() {
  const { user } = useUserStore();
  const cartQuery = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const mounted = useHydrated();

  if (!mounted || (user && cartQuery.isLoading)) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <h1 className="font-serif text-4xl md:text-5xl text-ink-primary mb-8">Keranjang Belanja</h1>
        <div className="h-64 animate-pulse bg-surface border border-hairline rounded-sm" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-20">
        <EmptyState
          icon="lock"
          title="Login untuk melihat keranjang"
          description="Keranjang tersimpan di akun Anda. Silakan masuk untuk melihat dan mengelolanya."
          actionLabel="Login Sekarang"
          actionHref="/auth/login?redirect=/cart"
        />
      </div>
    );
  }

  if (cartQuery.isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <h1 className="font-serif text-4xl text-ink-primary mb-4">Keranjang Belanja</h1>
        <p role="alert" className="text-sm text-rose-800 mb-4">Keranjang gagal dimuat dari server.</p>
        <button onClick={() => void cartQuery.refetch()} className="bg-primary text-white text-xs font-bold px-5 py-3 rounded-xs">Coba Lagi</button>
      </div>
    );
  }

  const cart = cartQuery.data?.data;
  const items = cart?.items.map(normalizeCartItem) ?? [];
  const mutationError = updateItem.error ?? removeItem.error;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <div className="border-b border-hairline pb-8 mb-8">
        <h1 className="font-serif text-4xl md:text-5xl text-ink-primary mb-2">Keranjang Belanja</h1>
        <p className="text-xs text-ink-secondary">Harga, stok, dan jumlah barang ditampilkan berdasarkan data terbaru dari server.</p>
      </div>

      {items.length === 0 ? (
        <div className="py-12"><EmptyState icon="shopping_bag" title="Keranjang Anda Kosong" description="Tambahkan produk untuk mulai berbelanja." actionLabel="Belanja Sekarang" actionHref="/shop" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 flex flex-col gap-4">
            {items.map((item) => (
              <div key={item.cartItemId} className="bg-surface hairline rounded-sm p-4 flex gap-4 items-center justify-between">
                <div className="w-16 sm:w-20 aspect-[4/5] bg-paper overflow-hidden rounded-xs shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2 sm:px-4">
                  <div className="max-w-xs md:max-w-sm">
                    <span className="text-[9px] uppercase font-bold text-ink-secondary tracking-wide">{item.sellerName}</span>
                    <h3 className="font-serif text-base text-ink-primary line-clamp-1"><Link href={`/product/${item.id}`} className="hover:text-primary">{item.name}</Link></h3>
                    <span className="font-mono text-xs text-primary font-semibold block mt-1">{formatIDR(item.price)}</span>
                    {item.priceChanged && <span className="text-[10px] text-amber-800">Harga berubah; harga terbaru digunakan.</span>}
                    {(item.outOfStock || item.insufficientStock) && <span className="text-[10px] text-rose-800">Stok tidak mencukupi.</span>}
                  </div>
                  <div className="flex items-center gap-4">
                    <QuantityStepper value={item.qty} onChange={(quantity) => updateItem.mutate({ itemId: item.cartItemId, quantity })} max={Math.max(1, item.stock)} />
                    <button onClick={() => removeItem.mutate(item.cartItemId)} disabled={removeItem.isPending} className="text-ink-secondary hover:text-primary p-2 disabled:opacity-50" aria-label={`Hapus ${item.name}`}>
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
                <div className="hidden sm:block text-right pr-2"><span className="font-mono text-sm font-bold text-ink-primary">{formatIDR(item.price * item.qty)}</span></div>
              </div>
            ))}
          </div>

          <aside className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
            {(mutationError || items.some((item) => item.outOfStock || item.insufficientStock)) && (
              <p role="alert" className="bg-rose-50 border border-rose-100 text-rose-800 text-xs p-3 rounded-xs">{mutationError instanceof Error ? mutationError.message : "Perbaiki jumlah atau hapus produk yang stoknya tidak mencukupi sebelum checkout."}</p>
            )}
            <div className="bg-surface border border-hairline p-6 rounded-sm">
              <h4 className="text-xs uppercase font-bold tracking-widest text-ink-primary mb-4 pb-2 border-b border-hairline">Ringkasan Pemesanan</h4>
              <div className="flex justify-between items-center font-mono text-xs text-ink-secondary pb-4 border-b border-hairline">
                <span>Subtotal</span><span className="text-ink-primary font-sans font-medium">{formatIDR(cart?.subtotal ?? 0)}</span>
              </div>
              <p className="text-[10px] text-ink-secondary mt-3">Kode voucher dapat dimasukkan pada langkah checkout. Diskon akan divalidasi server berdasarkan keranjang dan katalog terbaru.</p>
              <Link href="/checkout" aria-disabled={items.some((item) => item.outOfStock || item.insufficientStock)} className={`w-full inline-flex items-center justify-center bg-primary hover:bg-primary-hover text-white text-xs uppercase font-bold tracking-widest py-4 rounded-xs mt-6 ${items.some((item) => item.outOfStock || item.insufficientStock) ? "pointer-events-none opacity-50" : ""}`}>
                Lanjutkan Ke Checkout
              </Link>
              <Link href="/shop" className="w-full text-center text-xs text-ink-secondary hover:text-primary block mt-4 font-semibold">Kembali Belanja</Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
