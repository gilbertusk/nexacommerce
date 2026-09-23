"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/store/useCartStore";
import { useUserStore } from "@/lib/store/useUserStore";
import { useCreateOrder } from "@/lib/api/hooks/useOrders";
import { useShippingCouriers } from "@/lib/api/hooks/useShipping";
import { formatIDR } from "@/lib/utils/format";
import EmptyState from "@/components/ui/EmptyState";

interface ShippingOption {
  id: string;
  courier: string;
  service: string;
  cost: number;
  etd: string;
}

function buildShippingOptions(couriers: { id: string; name: string; services?: { service: string; cost: number; eta?: string }[] }[]): ShippingOption[] {
  const options: ShippingOption[] = [];
  for (const courier of couriers) {
    if (courier.services && courier.services.length > 0) {
      for (const svc of courier.services) {
        options.push({
          id: `${courier.id}-${svc.service}`,
          courier: courier.name,
          service: svc.service,
          cost: svc.cost,
          etd: svc.eta ?? "-",
        });
      }
    } else {
      // Courier with no service breakdown - use courier itself
      options.push({
        id: courier.id,
        courier: courier.name,
        service: "Reguler",
        cost: 0,
        etd: "-",
      });
    }
  }
  return options;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, appliedVoucher, getCartTotal, getDiscountAmount, getFinalTotal, clearCart } = useCartStore();
  const { user, addresses, selectedAddressId, addAddress, selectAddress } = useUserStore();

  const [step, setStep] = useState(1);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "",
    receiverName: "",
    phoneNumber: "",
    street: "",
    city: "",
    province: "",
    postalCode: "",
    isDefault: false,
  });

  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [mounted, setMounted] = useState(false);
  const [orderError, setOrderError] = useState("");

  const { data: couriersData, isLoading: loadingShipping } = useShippingCouriers();
  const createOrder = useCreateOrder();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && items.length === 0) {
      router.push("/cart");
    }
  }, [items, mounted, router]);

  // Pre-select first shipping option when data loads
  useEffect(() => {
    if (couriersData?.data?.couriers && !selectedShipping) {
      const options = buildShippingOptions(couriersData.data.couriers);
      if (options.length > 0) {
        setSelectedShipping(options[0]);
      }
    }
  }, [couriersData, selectedShipping]);

  if (!mounted || items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="h-64 animate-pulse bg-surface border border-hairline rounded-sm" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-20">
        <EmptyState
          icon="lock"
          title="Login Diperlukan"
          description="Anda harus masuk ke akun Anda terlebih dahulu untuk memproses pesanan."
          actionLabel="Login Sekarang"
          actionHref="/auth/login?redirect=/checkout"
        />
      </div>
    );
  }

  const shippingOptions = buildShippingOptions(couriersData?.data?.couriers ?? []);

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.label || !newAddress.receiverName || !newAddress.phoneNumber || !newAddress.street || !newAddress.city || !newAddress.province || !newAddress.postalCode) {
      return;
    }
    addAddress(newAddress);
    setShowAddressForm(false);
    setNewAddress({ label: "", receiverName: "", phoneNumber: "", street: "", city: "", province: "", postalCode: "", isDefault: false });
  };

  const handlePlaceOrder = async () => {
    setOrderError("");

    if (!selectedAddressId) {
      setOrderError("Pilih alamat pengiriman terlebih dahulu.");
      return;
    }

    try {
      const result = await createOrder.mutateAsync({
        items: items.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          qty: item.qty,
          image: item.image,
          sellerId: item.sellerId,
        })),
        addressId: selectedAddressId,
        shippingCourierId: selectedShipping?.id ?? "",
        voucherId: appliedVoucher?.code,
      });

      clearCart();
      const orderId = result.data.order.id;
      router.push(`/payment/${orderId}`);
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : "Gagal membuat pesanan. Silakan coba kembali.");
    }
  };

  const activeAddress = addresses.find((a) => a.id === selectedAddressId);
  const cartSubtotal = getCartTotal();
  const voucherDiscount = getDiscountAmount();
  const shippingCost = selectedShipping?.cost ?? 0;
  const grandTotal = getFinalTotal() + shippingCost;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Stepper Header */}
      <div className="flex items-center justify-center max-w-xl mx-auto mb-12 gap-2">
        {[
          { num: 1, label: "Alamat" },
          { num: 2, label: "Pengiriman" },
          { num: 3, label: "Review & Bayar" },
        ].map((s, idx) => (
          <div key={s.num} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold border transition-colors ${
                step === s.num
                  ? "bg-primary border-primary text-white"
                  : step > s.num
                  ? "bg-ink-primary border-ink-primary text-white"
                  : "bg-surface border-outline-variant text-ink-secondary"
              }`}
            >
              {step > s.num ? (
                <span className="material-symbols-outlined text-xs">check</span>
              ) : (
                s.num
              )}
            </div>
            <span
              className={`text-xs uppercase font-bold tracking-widest ${
                step === s.num ? "text-primary" : "text-ink-secondary"
              }`}
            >
              {s.label}
            </span>
            {idx < 2 && <div className="w-8 md:w-16 h-px bg-hairline mx-2" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-start">
        {/* Step panel */}
        <div className="bg-surface border border-hairline p-6 md:p-8 rounded-sm">

          {/* STEP 1: Address */}
          {step === 1 && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif text-2xl text-ink-primary">Pilih Alamat Pengiriman</h2>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="text-xs uppercase font-bold tracking-widest text-primary hover:text-primary-hover flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Alamat Baru
                </button>
              </div>

              {showAddressForm && (
                <form
                  onSubmit={handleAddAddress}
                  className="border border-hairline bg-paper/30 p-5 rounded-xs mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <div className="sm:col-span-2">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-ink-secondary block mb-1">Label Alamat</label>
                    <input type="text" required value={newAddress.label} onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })} className="bg-paper text-xs text-ink-primary px-3 py-2 w-full focus:outline-hidden" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-wider text-ink-secondary block mb-1">Nama Penerima</label>
                    <input type="text" required value={newAddress.receiverName} onChange={(e) => setNewAddress({ ...newAddress, receiverName: e.target.value })} className="bg-paper text-xs text-ink-primary px-3 py-2 w-full focus:outline-hidden" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-wider text-ink-secondary block mb-1">Nomor Telepon</label>
                    <input type="text" required value={newAddress.phoneNumber} onChange={(e) => setNewAddress({ ...newAddress, phoneNumber: e.target.value })} className="bg-paper text-xs text-ink-primary px-3 py-2 w-full focus:outline-hidden" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-ink-secondary block mb-1">Alamat Lengkap</label>
                    <textarea required rows={2} value={newAddress.street} onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} className="bg-paper text-xs text-ink-primary px-3 py-2 w-full focus:outline-hidden resize-none" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-wider text-ink-secondary block mb-1">Kota</label>
                    <input type="text" required value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className="bg-paper text-xs text-ink-primary px-3 py-2 w-full focus:outline-hidden" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-wider text-ink-secondary block mb-1">Provinsi</label>
                    <input type="text" required value={newAddress.province} onChange={(e) => setNewAddress({ ...newAddress, province: e.target.value })} className="bg-paper text-xs text-ink-primary px-3 py-2 w-full focus:outline-hidden" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-wider text-ink-secondary block mb-1">Kode Pos</label>
                    <input type="text" required value={newAddress.postalCode} onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })} className="bg-paper text-xs text-ink-primary px-3 py-2 w-full focus:outline-hidden" />
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2 pt-2">
                    <input type="checkbox" id="isDefault" checked={newAddress.isDefault} onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })} className="accent-primary" />
                    <label htmlFor="isDefault" className="text-xs text-ink-primary font-medium">Jadikan alamat default pengiriman</label>
                  </div>
                  <div className="sm:col-span-2 flex gap-2 justify-end pt-2">
                    <button type="button" onClick={() => setShowAddressForm(false)} className="bg-surface hover:bg-paper text-ink-primary text-[10px] uppercase font-bold px-4 py-2 border border-hairline rounded-xs">Batal</button>
                    <button type="submit" className="bg-primary hover:bg-primary-hover text-white text-[10px] uppercase font-bold px-4 py-2 rounded-xs">Simpan Alamat</button>
                  </div>
                </form>
              )}

              <div className="flex flex-col gap-4">
                {addresses.length === 0 ? (
                  <p className="text-xs text-ink-secondary text-center py-6">Belum ada alamat tersimpan. Tambah alamat baru untuk melanjutkan.</p>
                ) : (
                  addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => selectAddress(addr.id)}
                      className={`p-4 rounded-xs border-2 text-left cursor-pointer transition-all flex justify-between items-start ${
                        selectedAddressId === addr.id ? "border-primary bg-primary/5" : "border-hairline hover:border-outline-variant bg-surface"
                      }`}
                    >
                      <div className="flex flex-col gap-1 pr-6">
                        <div className="flex items-center gap-2">
                          <span className="text-xs uppercase font-bold text-ink-primary">{addr.label}</span>
                          {addr.isDefault && (
                            <span className="bg-primary/10 text-primary text-[8px] uppercase font-bold tracking-wider px-1 py-0.5 rounded-sm">Utama</span>
                          )}
                        </div>
                        <h4 className="text-sm font-semibold text-ink-primary mt-1">{addr.receiverName}</h4>
                        <span className="font-mono text-xs text-ink-secondary tabular-nums">{addr.phoneNumber}</span>
                        <p className="text-xs text-ink-secondary leading-relaxed mt-1">{addr.street}, {addr.city}, {addr.province}, {addr.postalCode}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${selectedAddressId === addr.id ? "border-primary" : "border-outline-variant"}`}>
                        {selectedAddressId === addr.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-end mt-8 border-t border-hairline pt-6">
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedAddressId}
                  className="bg-primary hover:bg-primary-hover text-white text-xs uppercase font-bold tracking-widest px-8 py-3.5 rounded-xs disabled:opacity-50 cursor-pointer transition-colors"
                >
                  Lanjutkan Ke Pengiriman
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Shipping Method */}
          {step === 2 && (
            <div>
              <h2 className="font-serif text-2xl text-ink-primary mb-6">Pilih Metode Pengiriman</h2>

              {loadingShipping ? (
                <div className="flex flex-col gap-3 py-6">
                  <div className="h-14 bg-paper animate-pulse rounded-xs" />
                  <div className="h-14 bg-paper animate-pulse rounded-xs" />
                  <div className="h-14 bg-paper animate-pulse rounded-xs" />
                </div>
              ) : shippingOptions.length === 0 ? (
                <p className="text-xs text-ink-secondary py-6">Opsi pengiriman tidak tersedia. Silakan coba lagi.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {shippingOptions.map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedShipping(opt)}
                      className={`p-4 rounded-xs border-2 cursor-pointer transition-all flex justify-between items-center ${
                        selectedShipping?.id === opt.id ? "border-primary bg-primary/5" : "border-hairline hover:border-outline-variant bg-surface"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-paper flex items-center justify-center border border-hairline font-bold text-xs text-ink-secondary uppercase">
                          {opt.courier.slice(0, 3)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-ink-primary">{opt.courier} — {opt.service}</span>
                          <span className="text-[10px] text-ink-secondary">Estimasi tiba: {opt.etd}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-xs font-bold text-ink-primary tabular-nums">{formatIDR(opt.cost)}</span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedShipping?.id === opt.id ? "border-primary" : "border-outline-variant"}`}>
                          {selectedShipping?.id === opt.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between mt-8 border-t border-hairline pt-6">
                <button onClick={() => setStep(1)} className="bg-surface hover:bg-paper text-ink-primary text-xs uppercase font-bold tracking-widest px-6 py-3.5 border border-hairline rounded-xs cursor-pointer transition-colors">Kembali</button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedShipping}
                  className="bg-primary hover:bg-primary-hover text-white text-xs uppercase font-bold tracking-widest px-8 py-3.5 rounded-xs disabled:opacity-50 cursor-pointer transition-colors"
                >
                  Lanjutkan Ke Review
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Confirm */}
          {step === 3 && (
            <div>
              <h2 className="font-serif text-2xl text-ink-primary mb-6">Tinjau Pesanan & Pembayaran</h2>

              {/* Items review */}
              <div className="flex flex-col gap-4 border-b border-hairline pb-6 mb-6">
                <h4 className="text-xs uppercase font-bold tracking-widest text-ink-secondary mb-2">Daftar Barang ({items.length})</h4>
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.name} className="w-10 aspect-[4/5] object-cover bg-paper rounded-xs border border-hairline" />
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-ink-primary line-clamp-1">{item.name}</span>
                        <span className="text-[10px] text-ink-secondary">{item.qty} x {formatIDR(item.price)}</span>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-ink-primary tabular-nums">{formatIDR(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>

              {/* Address review */}
              {activeAddress && (
                <div className="border-b border-hairline pb-6 mb-6">
                  <h4 className="text-xs uppercase font-bold tracking-widest text-ink-secondary mb-2">Tujuan Pengiriman</h4>
                  <div className="text-xs text-ink-primary">
                    <p className="font-semibold">{activeAddress.receiverName}</p>
                    <p className="font-mono text-ink-secondary mt-0.5">{activeAddress.phoneNumber}</p>
                    <p className="text-ink-secondary mt-1">{activeAddress.street}, {activeAddress.city}, {activeAddress.province}, {activeAddress.postalCode}</p>
                  </div>
                </div>
              )}

              {/* Courier review */}
              {selectedShipping && (
                <div className="pb-6 mb-2">
                  <h4 className="text-xs uppercase font-bold tracking-widest text-ink-secondary mb-2">Metode Pengiriman</h4>
                  <div className="text-xs text-ink-primary">
                    <p className="font-semibold">{selectedShipping.courier} — {selectedShipping.service}</p>
                    <p className="text-ink-secondary mt-0.5">Estimasi tiba: {selectedShipping.etd}</p>
                  </div>
                </div>
              )}

              {/* Error */}
              {orderError && (
                <div className="mt-4 bg-rose-50 border border-rose-100 text-rose-800 text-xs p-3 rounded-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">error</span>
                  <span>{orderError}</span>
                </div>
              )}

              <div className="flex justify-between mt-8 border-t border-hairline pt-6">
                <button
                  onClick={() => setStep(2)}
                  disabled={createOrder.isPending}
                  className="bg-surface hover:bg-paper text-ink-primary text-xs uppercase font-bold tracking-widest px-6 py-3.5 border border-hairline rounded-xs cursor-pointer transition-colors"
                >
                  Kembali
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={createOrder.isPending}
                  className="bg-primary hover:bg-primary-hover text-white text-xs uppercase font-bold tracking-widest px-8 py-3.5 rounded-xs disabled:opacity-50 cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  {createOrder.isPending ? (
                    <>
                      <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                      Membuat Order...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">payments</span>
                      Buat Pesanan & Bayar
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Order Summary */}
        <aside className="bg-surface border border-hairline p-6 rounded-sm sticky top-24">
          <h4 className="text-xs uppercase font-bold tracking-widest text-ink-primary mb-4 pb-2 border-b border-hairline">Detail Pembayaran</h4>
          <div className="flex flex-col gap-3 font-mono text-xs text-ink-secondary pb-4 border-b border-hairline">
            <div className="flex justify-between items-center">
              <span>Subtotal Produk</span>
              <span className="text-ink-primary font-sans font-medium tabular-nums">{formatIDR(cartSubtotal)}</span>
            </div>
            {voucherDiscount > 0 && (
              <div className="flex justify-between items-center text-primary font-semibold">
                <span>Potongan Voucher</span>
                <span className="tabular-nums">-{formatIDR(voucherDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span>Ongkos Kirim</span>
              <span className="text-ink-primary font-sans font-medium tabular-nums">
                {selectedShipping ? formatIDR(shippingCost) : "Belum dihitung"}
              </span>
            </div>
            {appliedVoucher && (
              <div className="bg-emerald-50 text-emerald-800 text-[10px] px-2 py-1 rounded-sm mt-1 flex items-center gap-1 font-sans font-semibold border border-emerald-100">
                <span className="material-symbols-outlined text-xs">confirmation_number</span>
                <span>Voucher {appliedVoucher.code} Aktif</span>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center pt-4">
            <span className="text-xs uppercase font-bold tracking-widest text-ink-primary">Total Pembayaran</span>
            <span className="font-mono text-lg font-bold text-primary tabular-nums">{formatIDR(grandTotal)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
