"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import { useAdminStore } from "@/lib/store/useAdminStore";

interface CourierService {
  code: string;
  name: string;
  estimatedDays: string;
}

interface Courier {
  id: string;
  code: string;
  name: string;
  services: CourierService[];
  isActive: boolean;
}

interface ShippingRate {
  id: string;
  courierId: string;
  courier: Courier;
  originCity: string;
  destinationCity: string;
  serviceCode: string;
  weight: number;
  cost: number | string;
  estimatedDays: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  updatedAt: string;
}

interface CouriersResponse { success: boolean; data: Courier[] }
interface RatesResponse {
  success: boolean;
  data: { rates: ShippingRate[]; total: number; page: number; limit: number; totalPages: number };
}

const blankService = (): CourierService => ({ code: "", name: "", estimatedDays: "" });
const blankRate = () => ({
  courierId: "",
  originCity: "",
  destinationCity: "",
  serviceCode: "",
  weight: "1000",
  cost: "",
  estimatedDays: "",
});

function rupiah(value: number | string) {
  return `Rp ${Number(value).toLocaleString("id-ID")}`;
}

export default function ShippingRatesPage() {
  const token = useAdminStore((state) => state.token);
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState("");
  const [courierCode, setCourierCode] = useState("");
  const [courierName, setCourierName] = useState("");
  const [services, setServices] = useState<CourierService[]>([blankService()]);
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [rate, setRate] = useState(blankRate);

  const couriersQuery = useQuery<CouriersResponse>({
    queryKey: ["managed-shipping-couriers"],
    queryFn: () => apiGet<CouriersResponse>("/shipping/admin/couriers", token ?? undefined),
    enabled: !!token,
  });
  const ratesQuery = useQuery<RatesResponse>({
    queryKey: ["managed-shipping-rates"],
    queryFn: () => apiGet<RatesResponse>("/shipping/admin/rates?limit=100", token ?? undefined),
    enabled: !!token,
  });

  const couriers = couriersQuery.data?.data ?? [];
  const rates = ratesQuery.data?.data?.rates ?? [];
  const selectedCourier = couriers.find((courier) => courier.id === rate.courierId);

  const courierMutation = useMutation({
    mutationFn: () => apiPost("/shipping/admin/couriers", {
      code: courierCode,
      name: courierName,
      services,
    }, token ?? undefined),
    onSuccess: async () => {
      setCourierCode("");
      setCourierName("");
      setServices([blankService()]);
      setFeedback("Kurir tersimpan. Tambahkan baris tarif yang sudah diverifikasi.");
      await queryClient.invalidateQueries({ queryKey: ["managed-shipping-couriers"] });
    },
    onError: (error) => setFeedback(error instanceof Error ? error.message : "Gagal menyimpan kurir."),
  });

  const rateMutation = useMutation({
    mutationFn: () => {
      const payload = {
        courierId: rate.courierId,
        originCity: rate.originCity,
        destinationCity: rate.destinationCity,
        serviceCode: rate.serviceCode,
        weight: Number(rate.weight),
        cost: Number(rate.cost),
        estimatedDays: rate.estimatedDays,
      };
      return editingRateId
        ? apiPatch(`/shipping/admin/rates/${encodeURIComponent(editingRateId)}`, payload, token ?? undefined)
        : apiPost("/shipping/admin/rates", payload, token ?? undefined);
    },
    onSuccess: async () => {
      setFeedback(editingRateId ? "Tarif berhasil diperbarui." : "Tarif terverifikasi berhasil ditambahkan.");
      setEditingRateId(null);
      setRate(blankRate());
      await queryClient.invalidateQueries({ queryKey: ["managed-shipping-rates"] });
    },
    onError: (error) => setFeedback(error instanceof Error ? error.message : "Gagal menyimpan tarif."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/shipping/admin/rates/${encodeURIComponent(id)}`, token ?? undefined),
    onSuccess: async () => {
      setFeedback("Tarif dihapus. Quote baru tidak lagi dapat memakai baris tersebut.");
      await queryClient.invalidateQueries({ queryKey: ["managed-shipping-rates"] });
    },
    onError: (error) => setFeedback(error instanceof Error ? error.message : "Gagal menghapus tarif."),
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-serif text-ink-primary mb-1">Tarif Pengiriman Terverifikasi</h1>
        <p className="text-sm text-ink-secondary">
          Hanya data yang dimasukkan admin di sini yang dapat dipakai server untuk membuat quote checkout.
        </p>
      </div>

      {feedback && <p role="status" className="rounded-sm hairline bg-surface px-4 py-3 text-sm text-ink-primary">{feedback}</p>}

      <section className="bg-white hairline rounded-sm p-5">
        <h2 className="text-sm font-bold text-ink-primary">1. Tambah Kurir dan Layanan</h2>
        <form className="mt-4 flex flex-col gap-4" onSubmit={(event) => { event.preventDefault(); setFeedback(""); courierMutation.mutate(); }}>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-xs text-ink-secondary">Kode kurir
              <input required maxLength={30} value={courierCode} onChange={(event) => setCourierCode(event.target.value)} placeholder="jne" className="mt-1 w-full rounded-xs border border-hairline px-3 py-2 text-ink-primary" />
            </label>
            <label className="text-xs text-ink-secondary">Nama kurir
              <input required maxLength={100} value={courierName} onChange={(event) => setCourierName(event.target.value)} placeholder="JNE" className="mt-1 w-full rounded-xs border border-hairline px-3 py-2 text-ink-primary" />
            </label>
          </div>
          <div className="flex flex-col gap-2">
            {services.map((service, index) => (
              <div key={index} className="grid gap-2 md:grid-cols-[1fr_2fr_1fr_auto]">
                <input aria-label={`Kode layanan ${index + 1}`} required maxLength={30} value={service.code} onChange={(event) => setServices((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, code: event.target.value } : item))} placeholder="REG" className="rounded-xs border border-hairline px-3 py-2 text-sm" />
                <input aria-label={`Nama layanan ${index + 1}`} required maxLength={100} value={service.name} onChange={(event) => setServices((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))} placeholder="Regular" className="rounded-xs border border-hairline px-3 py-2 text-sm" />
                <input aria-label={`Estimasi layanan ${index + 1}`} required maxLength={50} value={service.estimatedDays} onChange={(event) => setServices((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, estimatedDays: event.target.value } : item))} placeholder="2-3 hari" className="rounded-xs border border-hairline px-3 py-2 text-sm" />
                <button type="button" disabled={services.length === 1} onClick={() => setServices((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="rounded-xs border border-hairline px-3 text-xs disabled:opacity-40">Hapus</button>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setServices((current) => [...current, blankService()])} disabled={services.length >= 20} className="rounded-xs border border-hairline px-3 py-2 text-xs font-bold">Tambah Layanan</button>
            <button type="submit" disabled={courierMutation.isPending} className="rounded-xs bg-ink-primary px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{courierMutation.isPending ? "Menyimpan…" : "Simpan Kurir"}</button>
          </div>
        </form>
      </section>

      <section className="bg-white hairline rounded-sm p-5">
        <h2 className="text-sm font-bold text-ink-primary">2. {editingRateId ? "Ubah" : "Tambah"} Tarif</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-4" onSubmit={(event) => { event.preventDefault(); setFeedback(""); rateMutation.mutate(); }}>
          <label className="text-xs text-ink-secondary">Kurir
            <select required value={rate.courierId} onChange={(event) => { const courier = couriers.find((item) => item.id === event.target.value); setRate((current) => ({ ...current, courierId: event.target.value, serviceCode: courier?.services[0]?.code ?? "", estimatedDays: courier?.services[0]?.estimatedDays ?? "" })); }} className="mt-1 w-full rounded-xs border border-hairline px-3 py-2 text-ink-primary">
              <option value="">Pilih kurir</option>
              {couriers.filter((courier) => courier.isActive).map((courier) => <option key={courier.id} value={courier.id}>{courier.name}</option>)}
            </select>
          </label>
          <label className="text-xs text-ink-secondary">Layanan
            <select required value={rate.serviceCode} onChange={(event) => { const service = selectedCourier?.services.find((item) => item.code === event.target.value); setRate((current) => ({ ...current, serviceCode: event.target.value, estimatedDays: service?.estimatedDays ?? current.estimatedDays })); }} className="mt-1 w-full rounded-xs border border-hairline px-3 py-2 text-ink-primary">
              <option value="">Pilih layanan</option>
              {(selectedCourier?.services ?? []).map((service) => <option key={service.code} value={service.code}>{service.name} ({service.code})</option>)}
            </select>
          </label>
          <label className="text-xs text-ink-secondary">Kota asal
            <input required maxLength={100} value={rate.originCity} onChange={(event) => setRate((current) => ({ ...current, originCity: event.target.value }))} placeholder="Bandung" className="mt-1 w-full rounded-xs border border-hairline px-3 py-2" />
          </label>
          <label className="text-xs text-ink-secondary">Kota tujuan
            <input required maxLength={100} value={rate.destinationCity} onChange={(event) => setRate((current) => ({ ...current, destinationCity: event.target.value }))} placeholder="Surabaya" className="mt-1 w-full rounded-xs border border-hairline px-3 py-2" />
          </label>
          <label className="text-xs text-ink-secondary">Batas berat (gram)
            <input required type="number" min={1} step={1} value={rate.weight} onChange={(event) => setRate((current) => ({ ...current, weight: event.target.value }))} className="mt-1 w-full rounded-xs border border-hairline px-3 py-2" />
          </label>
          <label className="text-xs text-ink-secondary">Biaya total (IDR)
            <input required type="number" min={1} step={1} value={rate.cost} onChange={(event) => setRate((current) => ({ ...current, cost: event.target.value }))} className="mt-1 w-full rounded-xs border border-hairline px-3 py-2" />
          </label>
          <label className="text-xs text-ink-secondary">Estimasi
            <input required maxLength={50} value={rate.estimatedDays} onChange={(event) => setRate((current) => ({ ...current, estimatedDays: event.target.value }))} placeholder="2-3 hari" className="mt-1 w-full rounded-xs border border-hairline px-3 py-2" />
          </label>
          <div className="flex items-end gap-2">
            {editingRateId && <button type="button" onClick={() => { setEditingRateId(null); setRate(blankRate()); }} className="rounded-xs border border-hairline px-3 py-2 text-xs">Batal</button>}
            <button type="submit" disabled={rateMutation.isPending || couriers.length === 0} className="rounded-xs bg-primary px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{rateMutation.isPending ? "Menyimpan…" : editingRateId ? "Simpan Perubahan" : "Tambah Tarif"}</button>
          </div>
        </form>
      </section>

      <section className="bg-white hairline rounded-sm overflow-hidden">
        <div className="p-4 hairline-b flex justify-between"><h2 className="text-sm font-bold text-ink-primary">Baris Tarif Aktif</h2><span className="text-xs text-ink-secondary">{ratesQuery.data?.data?.total ?? 0} baris</span></div>
        {(couriersQuery.isLoading || ratesQuery.isLoading) && <p className="p-8 text-center text-sm text-ink-secondary">Memuat data…</p>}
        {(couriersQuery.isError || ratesQuery.isError) && <p className="p-8 text-center text-sm text-red-700">Gagal memuat konfigurasi pengiriman.</p>}
        {!ratesQuery.isLoading && !ratesQuery.isError && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-surface hairline-b text-[10px] uppercase tracking-widest text-ink-secondary"><th className="px-4 py-3 text-left">Rute</th><th className="px-4 py-3 text-left">Kurir</th><th className="px-4 py-3 text-right">Berat</th><th className="px-4 py-3 text-right">Biaya</th><th className="px-4 py-3 text-left">Estimasi</th><th className="px-4 py-3 text-right">Aksi</th></tr></thead>
              <tbody className="divide-y divide-[#E7E3DC]">
                {rates.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-sm text-ink-secondary">Belum ada tarif terverifikasi. Quote checkout akan tetap gagal tertutup.</td></tr> : rates.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-xs text-ink-primary">{item.originCity} → {item.destinationCity}</td>
                    <td className="px-4 py-3 text-xs text-ink-secondary">{item.courier.name} · {item.serviceCode}</td>
                    <td className="px-4 py-3 text-right text-xs tabular-nums">≤ {item.weight.toLocaleString("id-ID")} g</td>
                    <td className="px-4 py-3 text-right text-xs font-medium tabular-nums">{rupiah(item.cost)}</td>
                    <td className="px-4 py-3 text-xs text-ink-secondary">{item.estimatedDays}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button type="button" onClick={() => { setEditingRateId(item.id); setRate({ courierId: item.courierId, originCity: item.originCity, destinationCity: item.destinationCity, serviceCode: item.serviceCode, weight: String(item.weight), cost: String(item.cost), estimatedDays: item.estimatedDays }); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="mr-2 rounded-xs border border-hairline px-2 py-1 text-[10px] font-bold">Ubah</button>
                      <button type="button" disabled={deleteMutation.isPending} onClick={() => { if (window.confirm("Hapus tarif ini? Quote baru tidak akan dapat menggunakannya.")) deleteMutation.mutate(item.id); }} className="rounded-xs bg-red-50 px-2 py-1 text-[10px] font-bold text-red-700 disabled:opacity-50">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
