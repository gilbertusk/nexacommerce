"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/store/useCartStore";
import { validateVoucher } from "@/lib/api/mockData";
import { formatIDR } from "@/lib/utils/format";
import QuantityStepper from "@/components/ui/QuantityStepper";
import EmptyState from "@/components/ui/EmptyState";

export default function CartPage() {
  const {
    items,
    appliedVoucher,
    updateQty,
    removeItem,
    applyVoucher,
    removeVoucher,
    getCartTotal,
    getDiscountAmount,
    getFinalTotal,
  } = useCartStore();

  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [voucherError, setVoucherError] = useState("");
  const [voucherSuccess, setVoucherSuccess] = useState("");
  const [validatingVoucher, setValidatingVoucher] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleApplyVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    setVoucherError("");
    setVoucherSuccess("");

    if (!voucherCodeInput.trim()) return;

    setValidatingVoucher(true);
    try {
      const res = await validateVoucher(voucherCodeInput.trim());
      if (res.success && res.voucher) {
        // Check min order amount constraint
        const subtotal = getCartTotal();
        if (subtotal < res.voucher.minOrderAmount) {
          setVoucherError(
            `Minimal pembelian untuk voucher ini adalah ${formatIDR(res.voucher.minOrderAmount)}`
          );
        } else {
          applyVoucher({
            code: res.voucher.code,
            discountType: res.voucher.discountType,
            discountValue: res.voucher.discountValue,
            minOrderAmount: res.voucher.minOrderAmount,
            maxDiscountAmount: "maxDiscountAmount" in res.voucher ? res.voucher.maxDiscountAmount : undefined,
          });
          setVoucherSuccess(`Voucher ${res.voucher.code} berhasil dipasang!`);
          setVoucherCodeInput("");
        }
      } else {
        setVoucherError(res.message);
      }
    } catch (err) {
      setVoucherError("Terjadi kesalahan teknis saat memvalidasi voucher.");
    } finally {
      setValidatingVoucher(false);
    }
  };

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <h1 className="font-serif text-4xl md:text-5xl text-ink-primary mb-8">
          Keranjang Belanja
        </h1>
        <div className="h-64 animate-pulse bg-surface border border-hairline rounded-sm" />
      </div>
    );
  }

  const subtotal = getCartTotal();
  const discount = getDiscountAmount();
  const total = getFinalTotal();

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Page Header */}
      <div className="border-b border-hairline pb-8 mb-8">
        <h1 className="font-serif text-4xl md:text-5xl text-ink-primary mb-2">
          Keranjang Belanja
        </h1>
        <p className="text-xs text-ink-secondary">
          Tinjau kembali barang-barang pilihaan Anda sebelum melanjutkan ke proses pembayaran.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon="shopping_bag"
            title="Keranjang Anda Kosong"
            description="Sepertinya Anda belum memasukkan produk apa pun ke keranjang belanja Anda."
            actionLabel="Belanja Sekarang"
            actionHref="/shop"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List: col-span-8 */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-surface hairline rounded-sm p-4 flex gap-4 items-center justify-between"
              >
                {/* Product thumbnail */}
                <div className="w-16 sm:w-20 aspect-[4/5] bg-paper overflow-hidden rounded-xs shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-grow flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2 sm:px-4">
                  <div className="max-w-xs md:max-w-sm">
                    <span className="text-[9px] uppercase font-bold text-ink-secondary tracking-wide">
                      {item.sellerName}
                    </span>
                    <h3 className="font-serif text-base text-ink-primary line-clamp-1">
                      <Link href={`/product/${item.id}`} className="hover:text-primary transition-colors">
                        {item.name}
                      </Link>
                    </h3>
                    <span className="font-mono text-xs text-primary font-semibold block mt-1 tabular-nums">
                      {formatIDR(item.price)}
                    </span>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex items-center gap-4">
                    <QuantityStepper
                      value={item.qty}
                      onChange={(val) => updateQty(item.id, val)}
                      max={item.stock}
                    />

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-ink-secondary hover:text-primary p-2 flex items-center justify-center cursor-pointer transition-colors"
                      aria-label="Remove item"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>

                {/* Total price for this item */}
                <div className="hidden sm:block text-right pr-2">
                  <span className="font-mono text-sm font-bold text-ink-primary tabular-nums">
                    {formatIDR(item.price * item.qty)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Panel: col-span-4 */}
          <div className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
            {/* Voucher input form */}
            <div className="bg-surface border border-hairline p-5 rounded-sm">
              <h4 className="text-xs uppercase font-bold tracking-widest text-ink-primary mb-3">
                Kode Voucher / Promo
              </h4>

              {appliedVoucher ? (
                <div className="bg-emerald-50 border border-emerald-200/50 p-3 rounded-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-800 text-sm">confirmation_number</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-emerald-900">{appliedVoucher.code}</span>
                      <span className="text-[10px] text-emerald-800">
                        {appliedVoucher.discountType === "PERCENTAGE"
                          ? `Diskon ${appliedVoucher.discountValue}%`
                          : `Potongan ${formatIDR(appliedVoucher.discountValue)}`}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={removeVoucher}
                    className="text-emerald-800 hover:text-rose-800 font-bold text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyVoucher} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: NEXA10"
                    value={voucherCodeInput}
                    onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                    disabled={validatingVoucher}
                    className="bg-paper text-xs text-ink-primary px-3 py-2 rounded-xs flex-grow focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    disabled={validatingVoucher || !voucherCodeInput.trim()}
                    className="bg-ink-primary hover:bg-primary text-white text-[10px] uppercase font-bold tracking-wider px-4 py-2 rounded-xs disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    Pasang
                  </button>
                </form>
              )}

              {voucherError && (
                <p className="text-[10px] text-rose-800 font-semibold mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">error</span>
                  <span>{voucherError}</span>
                </p>
              )}
              {voucherSuccess && (
                <p className="text-[10px] text-emerald-800 font-semibold mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  <span>{voucherSuccess}</span>
                </p>
              )}
            </div>

            {/* Price breakdown and checkout CTA */}
            <div className="bg-surface border border-hairline p-6 rounded-sm">
              <h4 className="text-xs uppercase font-bold tracking-widest text-ink-primary mb-4 pb-2 border-b border-hairline">
                Ringkasan Pemesanan
              </h4>

              <div className="flex flex-col gap-3 font-mono text-xs text-ink-secondary pb-4 border-b border-hairline">
                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span className="text-ink-primary font-sans font-medium tabular-nums">{formatIDR(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center text-primary font-semibold">
                    <span>Diskon Voucher</span>
                    <span className="tabular-nums">-{formatIDR(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span>Pajak (Ppn 11%)</span>
                  <span className="text-ink-primary font-sans font-medium">Termasuk</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 mb-6">
                <span className="text-xs uppercase font-bold tracking-widest text-ink-primary">Total Belanja</span>
                <span className="font-mono text-lg font-bold text-primary tabular-nums">{formatIDR(total)}</span>
              </div>

              <Link
                href="/checkout"
                className="w-full inline-flex items-center justify-center bg-primary hover:bg-primary-hover text-white text-xs uppercase font-bold tracking-widest py-4 rounded-xs transition-colors cursor-pointer"
              >
                Lanjutkan Ke Checkout
              </Link>

              <Link
                href="/shop"
                className="w-full text-center text-xs text-ink-secondary hover:text-primary transition-colors block mt-4 font-semibold"
              >
                Kembali Belanja
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
