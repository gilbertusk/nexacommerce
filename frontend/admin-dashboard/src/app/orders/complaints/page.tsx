"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch } from "@/lib/api/client";
import { useAdminStore } from "@/lib/store/useAdminStore";
import Link from "next/link";

interface Complaint {
  id: string;
  orderId: string;
  customerId: string;
  category: string;
  description: string;
  status: "OPEN" | "IN_REVIEW" | "RESOLVED" | "REJECTED";
  adminNote?: string | null;
  createdAt: string;
  order: { orderNumber: string; status: string; customerName: string; customerEmail: string };
}

interface ComplaintResponse {
  success: boolean;
  data: { complaints: Complaint[]; total: number; page: number; totalPages: number };
}

const STATUSES = ["", "OPEN", "IN_REVIEW", "RESOLVED", "REJECTED"];

export default function OrderComplaintsPage() {
  const token = useAdminStore((state) => state.token);
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const queryKey = ["order-complaints", status];
  const { data, isLoading, isError } = useQuery<ComplaintResponse>({
    queryKey,
    queryFn: () => apiGet<ComplaintResponse>(`/orders/admin/complaints?limit=100${status ? `&status=${status}` : ""}`, token ?? undefined),
    enabled: Boolean(token),
  });
  const mutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: string }) =>
      apiPatch(`/orders/admin/complaints/${id}`, { status: nextStatus, adminNote: notes[id] ?? "" }, token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["order-complaints"] }),
  });

  const complaints = data?.data?.complaints ?? [];
  return (
    <main className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-serif text-ink-primary">Komplain Pesanan</h1>
          <p className="text-sm text-ink-secondary">Tinjau dan selesaikan laporan pelanggan berdasarkan pesanan.</p>
        </div>
        <Link href="/orders" className="text-sm underline">Kembali ke pesanan</Link>
      </header>
      <section className="bg-white hairline rounded-sm">
        <div className="p-4 hairline-b flex items-center justify-between gap-4">
          <label htmlFor="complaint-status" className="text-xs font-bold uppercase tracking-widest">Filter status</label>
          <select id="complaint-status" value={status} onChange={(event) => setStatus(event.target.value)} className="px-3 py-2 bg-surface hairline rounded-sm text-sm">
            {STATUSES.map((value) => <option key={value} value={value}>{value || "Semua status"}</option>)}
          </select>
        </div>
        {isLoading ? <p className="p-8 text-sm text-ink-secondary">Memuat komplain…</p> : null}
        {isError ? <p role="alert" className="p-8 text-sm text-rose-700">Gagal memuat komplain. Periksa koneksi lalu muat ulang halaman.</p> : null}
        {!isLoading && !isError && complaints.length === 0 ? <p className="p-8 text-sm text-ink-secondary">Belum ada komplain untuk filter ini.</p> : null}
        <div className="divide-y divide-[#E7E3DC]">
          {complaints.map((complaint) => {
            const nextStatuses = complaint.status === "OPEN" ? ["IN_REVIEW", "REJECTED"] : complaint.status === "IN_REVIEW" ? ["RESOLVED", "REJECTED"] : [];
            return (
              <article key={complaint.id} className="p-5 grid gap-3">
                <div className="flex flex-wrap justify-between gap-2">
                  <div>
                    <h2 className="font-semibold">{complaint.order.orderNumber} · {complaint.category}</h2>
                    <p className="text-xs text-ink-secondary">{complaint.order.customerName} · {complaint.order.customerEmail}</p>
                  </div>
                  <span className="text-xs font-bold">{complaint.status}</span>
                </div>
                <p className="whitespace-pre-wrap text-sm">{complaint.description}</p>
                <p className="text-xs text-ink-secondary">Status pesanan: {complaint.order.status} · {new Date(complaint.createdAt).toLocaleString("id-ID")}</p>
                <label className="grid gap-1 text-xs font-semibold" htmlFor={`note-${complaint.id}`}>
                  Catatan admin
                  <textarea id={`note-${complaint.id}`} maxLength={1000} rows={2} value={notes[complaint.id] ?? complaint.adminNote ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [complaint.id]: event.target.value }))} className="w-full px-3 py-2 bg-surface hairline rounded-sm text-sm font-normal" />
                </label>
                {mutation.isError && <p role="alert" className="text-xs text-rose-700">{mutation.error instanceof Error ? mutation.error.message : "Gagal memperbarui komplain."}</p>}
                <div className="flex flex-wrap gap-2">
                  {nextStatuses.map((nextStatus) => <button key={nextStatus} type="button" disabled={mutation.isPending} onClick={() => mutation.mutate({ id: complaint.id, nextStatus })} className="px-3 py-2 bg-ink-primary text-white text-xs font-bold uppercase tracking-wider rounded-sm disabled:opacity-50">{nextStatus.replace("_", " ")}</button>)}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
