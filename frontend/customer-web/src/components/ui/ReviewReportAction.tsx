"use client";

import Link from "next/link";
import { useState } from "react";
import { useReportReview, type ApiReview, type ReviewReportReason } from "@/lib/api/hooks/useReviews";
import { useUserStore } from "@/lib/store/useUserStore";

const REASONS: Array<{ value: ReviewReportReason; label: string }> = [
  { value: "SPAM", label: "Spam atau promosi" },
  { value: "INAPPROPRIATE", label: "Konten tidak pantas" },
  { value: "FAKE", label: "Ulasan tidak autentik" },
  { value: "OFFENSIVE", label: "Konten menyinggung" },
  { value: "OTHER", label: "Alasan lainnya" },
];

export default function ReviewReportAction({ review, productId }: { review: ApiReview; productId: string }) {
  const user = useUserStore((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<ReviewReportReason>("SPAM");
  const [description, setDescription] = useState("");
  const report = useReportReview(productId);

  if (!user || user.id === review.userId) {
    return user ? null : (
      <Link className="text-[10px] text-ink-secondary hover:text-primary underline" href={`/auth/login?redirect=${encodeURIComponent(`/product/${productId}?tab=reviews`)}`}>
        Masuk untuk melaporkan
      </Link>
    );
  }

  if (report.isSuccess) return <span role="status" className="text-[10px] text-green-700">Laporan terkirim untuk ditinjau.</span>;

  return (
    <div className="flex flex-col items-end gap-2">
      {!isOpen ? (
        <button type="button" onClick={() => setIsOpen(true)} className="text-[10px] text-ink-secondary hover:text-primary underline">
          Laporkan ulasan
        </button>
      ) : (
        <form
          className="w-full max-w-sm flex flex-col gap-2 rounded-xs bg-paper p-3"
          onSubmit={(event) => {
            event.preventDefault();
            report.mutate({ reviewId: review.id, reason, description });
          }}
        >
          <label className="text-[10px] font-bold" htmlFor={`report-reason-${review.id}`}>Alasan laporan</label>
          <select id={`report-reason-${review.id}`} value={reason} onChange={(event) => setReason(event.target.value as ReviewReportReason)} className="border border-hairline bg-white p-2 text-xs">
            {REASONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <label className="text-[10px] font-bold" htmlFor={`report-description-${review.id}`}>Keterangan (opsional)</label>
          <textarea id={`report-description-${review.id}`} value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} rows={2} className="border border-hairline bg-white p-2 text-xs" />
          {report.isError && <p role="alert" className="text-[10px] text-rose-800">{report.error instanceof Error ? report.error.message : "Laporan gagal dikirim."}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => { setIsOpen(false); report.reset(); }} className="px-2 py-1 text-xs text-ink-secondary">Batal</button>
            <button type="submit" disabled={report.isPending} className="rounded-xs bg-primary px-3 py-1 text-xs font-bold text-white disabled:opacity-50">{report.isPending ? "Mengirim..." : "Kirim laporan"}</button>
          </div>
        </form>
      )}
    </div>
  );
}
