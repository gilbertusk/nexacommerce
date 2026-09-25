"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import EmptyState from "@/components/ui/EmptyState";
import { useCart, normalizeCartItem } from "@/lib/api/hooks/useCart";
import { useAddresses, useCreateAddress } from "@/lib/api/hooks/useProfile";
import { useUserStore } from "@/lib/store/useUserStore";
import { formatIDR } from "@/lib/utils/format";
import { useHydrated } from "@/lib/hooks/useHydrated";
import type { ApiAddress } from "@/lib/api/hooks/useProfile";
import { apiPost } from "@/lib/api/client";
import ShippingQuotePanel, { type SellerGroup } from "@/components/checkout/ShippingQuotePanel";
import { isQuoteExpired, type ShippingQuote } from "@/lib/api/hooks/useShippingQuote";
import { useCreateOrder } from "@/lib/api/hooks/useOrders";

const emptyAddresses: ApiAddress[] = [];

const emptyAddress = {
  label: "",
  receiverName: "",
  phoneNumber: "",
  street: "",
  city: "",
  province: "",
  postalCode: "",
  isDefault: false,
};


export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const cartQuery = useCart();
  const addressesQuery = useAddresses();
  const createAddress = useCreateAddress();
  const mounted = useHydrated();
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState(emptyAddress);
  const [formError, setFormError] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherDiscount, setVoucherDiscount] = useState<number | null>(null);
  const [voucherCartVersion, setVoucherCartVersion] = useState<string | null>(null);
  const [voucherError, setVoucherError] = useState("");
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [shippingQuote, setShippingQuote] = useState<ShippingQuote | null>(null);
  const [checkoutError, setCheckoutError] = useState("");
  const createOrder = useCreateOrder();

  const addresses = addressesQuery.data?.data.addresses ?? emptyAddresses;
  const cart = cartQuery.data?.data;
  const items = cart?.items.map(normalizeCartItem) ?? [];
  const currentVoucherDiscount = voucherCartVersion === cart?.updatedAt ? voucherDiscount ?? 0 : 0;

  // One shipment per seller: the fulfillment model is per-seller origin with
  // split shipment, so the customer chooses a courier for each seller.
  const sellerGroups: SellerGroup[] = Object.values(
    items.reduce<Record<string, SellerGroup>>((groups, item) => {
      const existing = groups[item.sellerId];
      groups[item.sellerId] = {
        sellerId: item.sellerId,
        sellerName: item.sellerName || item.sellerId,
        itemCount: (existing?.itemCount ?? 0) + item.qty,
      };
      return groups;
    }, {}),
  );

  // The shipping figure shown is the server's, never a locally computed one.
  const shippingCost = shippingQuote?.totalCost ?? 0;
  const grandTotal = Math.max(0, (cart?.subtotal ?? 0) - currentVoucherDiscount + shippingCost);

  const handleValidateVoucher = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setVoucherError("");
    setVoucherDiscount(null);
    setVoucherCartVersion(null);
    if (!voucherCode.trim()) {
      setVoucherError("Masukkan kode voucher.");
      return;
    }
    setIsValidatingVoucher(true);
    try {
      const result = await apiPost<{
        success: boolean;
        data: { voucher: { code: string }; discountAmount: number | string };
      }>("/vouchers/validate", { code: voucherCode.trim().toUpperCase() });
      const discount = Number(result.data.discountAmount);
      if (!Number.isFinite(discount) || discount < 0) {
        throw new Error("Layanan voucher mengembalikan nilai diskon yang tidak valid.");
      }
      setVoucherCode(result.data.voucher.code);
      setVoucherDiscount(Math.min(discount, cart?.subtotal ?? 0));
      setVoucherCartVersion(cart?.updatedAt ?? null);
    } catch (error) {
      setVoucherError(error instanceof Error ? error.message : "Voucher gagal divalidasi.");
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  useEffect(() => {
    if (mounted && user && !cartQuery.isLoading && items.length === 0) router.replace("/cart");
  }, [cartQuery.isLoading, items.length, mounted, router, user]);

  const loading = !mounted || (Boolean(user) && (cartQuery.isLoading || addressesQuery.isLoading));
  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 md:px-8 py-12"><div className="h-64 animate-pulse bg-surface border border-hairline rounded-sm" /></div>;
  }

  if (!user) {
    return <div className="py-20"><EmptyState icon="lock" title="Login Diperlukan" description="Masuk untuk memuat keranjang dan alamat pengiriman dari akun Anda." actionLabel="Login Sekarang" actionHref="/auth/login?redirect=/checkout" /></div>;
  }

  const handlePlaceOrder = async () => {
    setCheckoutError("");
    if (!shippingQuote) return;

    try {
      const result = await createOrder.mutateAsync({
        shippingAddressId: effectiveAddressId,
        // The only shipping value sent is the server-issued quote id; the
        // server resolves the price from its own record.
        shippingQuoteId: shippingQuote.quoteId,
        ...(currentVoucherDiscount > 0 ? { voucherCode } : {}),
      });
      router.push(`/payment/${result.data.payment?.id ?? result.data.order.id}`);
    } catch (error) {
      setShippingQuote(null);
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Order gagal dibuat. Hitung ulang ongkos kirim dan coba lagi.",
      );
    }
  };

  const handleAddAddress = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    try {
      const result = await createAddress.mutateAsync(newAddress);
      setSelectedAddressId(result.data.id);
      setNewAddress(emptyAddress);
      setShowAddressForm(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Alamat gagal disimpan.");
    }
  };

  if (cartQuery.isError || addressesQuery.isError) {
    return <main className="max-w-4xl mx-auto px-4 py-16"><h1 className="font-serif text-4xl mb-4">Checkout</h1><p role="alert" className="text-sm text-rose-800">Data keranjang atau alamat gagal dimuat dari server. Silakan kembali dan coba lagi.</p><Link href="/cart" className="inline-block mt-5 text-primary font-semibold">Kembali ke keranjang</Link></main>;
  }

  const effectiveAddressId = addresses.some((address) => address.id === selectedAddressId)
    ? selectedAddressId
    : addresses.find((address) => address.isDefault)?.id ?? addresses[0]?.id ?? "";
  const activeAddress = addresses.find((address) => address.id === effectiveAddressId);

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <div className="border-b border-hairline pb-7 mb-8">
        <h1 className="font-serif text-4xl md:text-5xl text-ink-primary mb-2">Checkout</h1>
        <p className="text-xs text-ink-secondary">Ringkasan dan alamat diambil dari layanan backend.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-start">
        <section className="flex flex-col gap-8">
          <div className="bg-surface border border-hairline p-6 md:p-8 rounded-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl">Alamat Pengiriman</h2>
              <button onClick={() => setShowAddressForm((value) => !value)} className="text-xs uppercase font-bold tracking-widest text-primary">Tambah Alamat</button>
            </div>
            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-paper/40 p-4 mb-6">
                {([
                  ["label", "Label alamat"], ["receiverName", "Nama penerima"], ["phoneNumber", "Nomor telepon"],
                  ["street", "Alamat lengkap"], ["city", "Kota"], ["province", "Provinsi"], ["postalCode", "Kode pos"],
                ] as const).map(([field, label]) => (
                  <label key={field} className={field === "street" ? "sm:col-span-2 text-xs" : "text-xs"}>
                    <span className="block mb-1">{label}</span>
                    <input required value={newAddress[field]} onChange={(event) => setNewAddress((current) => ({ ...current, [field]: event.target.value }))} className="w-full bg-white border border-hairline px-3 py-2" />
                  </label>
                ))}
                <label className="sm:col-span-2 flex gap-2 items-center text-xs"><input type="checkbox" checked={newAddress.isDefault} onChange={(event) => setNewAddress((current) => ({ ...current, isDefault: event.target.checked }))} />Jadikan alamat utama</label>
                {formError && <p role="alert" className="sm:col-span-2 text-xs text-rose-800">{formError}</p>}
                <div className="sm:col-span-2 flex justify-end gap-2"><button type="button" onClick={() => setShowAddressForm(false)} className="px-4 py-2 border border-hairline text-xs">Batal</button><button disabled={createAddress.isPending} className="px-4 py-2 bg-primary text-white text-xs disabled:opacity-50">{createAddress.isPending ? "Menyimpan..." : "Simpan Alamat"}</button></div>
              </form>
            )}
            {addresses.length === 0 ? <p className="text-xs text-ink-secondary">Belum ada alamat tersimpan. Tambahkan alamat untuk melanjutkan.</p> : (
              <div className="flex flex-col gap-3">{addresses.map((address) => (
                <button type="button" key={address.id} onClick={() => setSelectedAddressId(address.id)} className={`text-left p-4 border-2 rounded-xs ${effectiveAddressId === address.id ? "border-primary bg-primary/5" : "border-hairline"}`}>
                  <span className="text-xs font-bold uppercase">{address.label}{address.isDefault ? " · Utama" : ""}</span>
                  <p className="text-sm font-semibold mt-1">{address.receiverName} · {address.phoneNumber}</p>
                  <p className="text-xs text-ink-secondary mt-1">{address.street}, {address.city}, {address.province}, {address.postalCode}</p>
                </button>
              ))}</div>
            )}
          </div>

          <div className="bg-surface border border-hairline p-6 md:p-8 rounded-sm">
            <h2 className="font-serif text-2xl mb-5">Barang ({items.length})</h2>
            <div className="flex flex-col divide-y divide-hairline">{items.map((item) => (
              <div key={item.cartItemId} className="py-3 flex justify-between gap-4 text-xs"><span>{item.name} × {item.qty}</span><span className="font-mono">{formatIDR(item.price * item.qty)}</span></div>
            ))}</div>
            {activeAddress && <p className="text-xs text-ink-secondary mt-5">Dikirim ke: {activeAddress.receiverName}, {activeAddress.city}</p>}
          </div>
        </section>

        <aside className="bg-surface border border-hairline p-6 rounded-sm sticky top-24">
          <h2 className="text-xs uppercase font-bold tracking-widest mb-4 pb-3 border-b border-hairline">Total Pembayaran</h2>
          <div className="flex justify-between text-sm"><span>Subtotal produk</span><span className="font-mono">{formatIDR(cart?.subtotal ?? 0)}</span></div>
          <form onSubmit={handleValidateVoucher} className="mt-5">
            <label htmlFor="voucher-code" className="block text-xs font-semibold mb-2">Kode voucher</label>
            <div className="flex gap-2">
              <input id="voucher-code" value={voucherCode} onChange={(event) => setVoucherCode(event.target.value.toUpperCase())} autoComplete="off" className="min-w-0 flex-1 border border-hairline bg-white px-3 py-2 text-xs uppercase" placeholder="MASUKKAN KODE" />
              <button disabled={isValidatingVoucher || !cart?.items.length} className="border border-primary px-3 py-2 text-xs font-semibold text-primary disabled:opacity-50">{isValidatingVoucher ? "Memeriksa..." : "Pakai"}</button>
            </div>
            {voucherError && <p role="alert" className="mt-2 text-xs text-rose-800">{voucherError}</p>}
            {currentVoucherDiscount > 0 && <p role="status" className="mt-2 text-xs text-emerald-800">Voucher {voucherCode} tervalidasi untuk keranjang saat ini.</p>}
            {voucherDiscount !== null && voucherCartVersion !== cart?.updatedAt && <p role="status" className="mt-2 text-xs text-amber-900">Keranjang berubah; validasi voucher kembali.</p>}
          </form>
          {currentVoucherDiscount > 0 && <div className="flex justify-between text-sm mt-3 text-emerald-800"><span>Diskon voucher</span><span className="font-mono">−{formatIDR(currentVoucherDiscount)}</span></div>}
          <div className="mt-5 pt-5 border-t border-hairline">
            <h3 className="text-xs uppercase font-bold tracking-widest mb-3">Pengiriman</h3>
            <ShippingQuotePanel
              groups={sellerGroups}
              addressId={effectiveAddressId}
              quote={shippingQuote}
              onQuote={setShippingQuote}
            />
          </div>
          <div className="flex justify-between text-sm mt-4">
            <span>Ongkos kirim</span>
            {shippingQuote
              ? <span className="font-mono">{formatIDR(shippingCost)}</span>
              : <span className="text-ink-secondary">Belum dihitung</span>}
          </div>
          <div className="flex justify-between text-base font-semibold mt-3 pt-3 border-t border-hairline">
            <span>Total</span>
            {shippingQuote
              ? <span className="font-mono">{formatIDR(grandTotal)}</span>
              : <span className="text-ink-secondary text-sm">Menunggu ongkos kirim</span>}
          </div>
          <div role="status" className="mt-5 p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">Harga, diskon, dan ongkos kirim dihitung dan divalidasi ulang oleh server saat order dibuat. Ongkos kirim berlaku terbatas; jika keranjang atau alamat berubah, hitung ulang.</div>
          {checkoutError && <p role="alert" className="mt-3 text-xs text-rose-800">{checkoutError}</p>}
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={!shippingQuote || isQuoteExpired(shippingQuote) || createOrder.isPending || !effectiveAddressId}
            className="w-full mt-5 bg-primary text-white py-4 text-xs uppercase font-bold tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createOrder.isPending ? "Memproses..." : "Buat Pesanan"}
          </button>
          <Link href="/cart" className="block text-center text-xs text-ink-secondary mt-4">Kembali ke keranjang</Link>
        </aside>
      </div>
    </main>
  );
}
