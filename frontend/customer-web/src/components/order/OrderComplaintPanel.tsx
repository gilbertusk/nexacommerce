"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api/client";

interface OrderComplaint {
  id: string;
  category: string;
  description: string;
  status: string;
  adminNote?: string | null;
}

interface ComplaintResponse {
  data: OrderComplaint | null;
}

interface OrderComplaintPanelProps {
  orderId: string;
  orderStatus: string;
}

export default function OrderComplaintPanel({ orderId, orderStatus }: OrderComplaintPanelProps) {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState("OTHER");
  const [description, setDescription] = useState("");
  const eligible = ["DELIVERED", "COMPLETED"].includes(orderStatus.toUpperCase());
  const complaintQuery = useQuery<ComplaintResponse>({
    queryKey: ["order-complaint", orderId],
    queryFn: () => apiGet<ComplaintResponse>(`/orders/${orderId}/complaints`),
    enabled: eligible,
  });
  const complaintMutation = useMutation({
    mutationFn: () => apiPost(`/orders/${orderId}/complaints`, { category, description: description.trim() }),
    onSuccess: async () => {
      setDescription("");
      await queryClient.invalidateQueries({ queryKey: ["order-complaint", orderId] });
    },
  });

  if (!eligible) return null;
  if (complaintQuery.isLoading) return <p role="status" className="text-sm text-ink-secondary">Memeriksa status komplain…</p>;
  if (complaintQuery.isError) return <p role="alert" className="text-sm text-rose-700">Status komplain tidak dapat diperiksa. Coba muat ulang sebelum mengirim laporan.</p>;

  const complaint = complaintQuery.data?.data;
  if (complaint) {
    return (
      <section className="bg-amber-50 border border-amber-200 p-5 rounded-sm text-sm" aria-label="Status komplain pesanan">
        <h3 className="text-xs uppercase font-bold tracking-widest mb-2">Komplain Pesanan: {complaint.status}</h3>
        <p className="text-ink-secondary">Kategori: {complaint.category}</p>
        <p className="mt-2 whitespace-pre-wrap">{complaint.description}</p>
        {complaint.adminNote && <p className="mt-3 border-t border-amber-200 pt-3">Catatan admin: {complaint.adminNote}</p>}
      </section>
    );
  }

  return (
    <form
      className="bg-white border border-hairline p-5 rounded-sm flex flex-col gap-3"
      onSubmit={(event) => { event.preventDefault(); complaintMutation.mutate(); }}
    >
      <h3 className="text-xs uppercase font-bold tracking-widest text-ink-primary">Komplain Pesanan</h3>
      <p className="text-xs text-ink-secondary">Gunakan komplain untuk melaporkan barang rusak, kurang, atau tidak sesuai. Admin akan meninjau laporan ini.</p>
      <label htmlFor="order-complaint-category" className="text-xs font-semibold">Kategori komplain</label>
      <select id="order-complaint-category" value={category} onChange={(event) => setCategory(event.target.value)} className="px-3 py-2 bg-surface border border-hairline rounded-sm text-sm">
        <option value="DAMAGED">Barang rusak</option>
        <option value="MISSING_ITEM">Barang kurang</option>
        <option value="WRONG_ITEM">Barang tidak sesuai</option>
        <option value="QUALITY">Masalah kualitas</option>
        <option value="OTHER">Lainnya</option>
      </select>
      <label htmlFor="order-complaint-description" className="text-xs font-semibold">Keterangan</label>
      <textarea id="order-complaint-description" value={description} onChange={(event) => setDescription(event.target.value)} required minLength={5} maxLength={2000} rows={4} placeholder="Jelaskan masalah pesanan (5–2000 karakter)" className="w-full px-3 py-2 bg-surface border border-hairline rounded-sm text-sm" />
      {complaintMutation.isError && <p role="alert" className="text-xs text-rose-700">{complaintMutation.error instanceof Error ? complaintMutation.error.message : "Gagal mengirim komplain."}</p>}
      {complaintMutation.isSuccess && <p role="status" className="text-xs text-emerald-700">Komplain terkirim dan menunggu peninjauan admin.</p>}
      <button type="submit" disabled={complaintMutation.isPending || description.trim().length < 5} className="self-start px-4 py-2 bg-ink-primary text-white text-xs font-bold uppercase tracking-widest rounded-sm disabled:opacity-50">
        {complaintMutation.isPending ? "Mengirim…" : "Kirim Komplain"}
      </button>
    </form>
  );
}
