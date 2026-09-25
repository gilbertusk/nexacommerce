"use client";

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const norm = status.toUpperCase();

  let style = "bg-stone-50 text-stone-600 border-stone-200";
  let label = status;

  switch (norm) {
    case "PENDING":
    case "PENDING_PAYMENT":
      style = "bg-amber-50 text-amber-800 border-amber-200/60";
      label = "Menunggu Pembayaran";
      break;
    case "PAID":
      style = "bg-emerald-50 text-emerald-800 border-emerald-200/60";
      label = "Sudah Dibayar";
      break;
    case "SHIPPED":
    case "DELIVERING":
    case "DELIVERED":
      style = "bg-blue-50 text-blue-800 border-blue-200/60";
      label = norm === "SHIPPED" ? "Dikirim" : norm === "DELIVERING" ? "Sedang Dikirim" : "Terkirim";
      break;
    case "COMPLETED":
      style = "bg-teal-50 text-teal-800 border-teal-200/60";
      label = "Selesai";
      break;
    case "RETURN_REQUESTED":
      style = "bg-amber-50 text-amber-800 border-amber-200/60";
      label = "Permintaan Retur Ditinjau";
      break;
    case "RETURN_APPROVED":
      style = "bg-violet-50 text-violet-800 border-violet-200/60";
      label = "Retur Disetujui, Refund Menunggu";
      break;
    case "PARTIALLY_REFUNDED":
      style = "bg-blue-50 text-blue-800 border-blue-200/60";
      label = "Sebagian Dana Dikembalikan";
      break;
    case "REFUNDED":
      style = "bg-violet-50 text-violet-800 border-violet-200/60";
      label = "Dana Dikembalikan";
      break;
    case "CANCELLED":
      style = "bg-rose-50 text-rose-800 border-rose-200/60";
      label = "Dibatalkan";
      break;
    case "FAILED":
      style = "bg-red-50 text-red-800 border-red-200/60";
      label = "Gagal";
      break;
  }

  return (
    <span className={`inline-flex items-center text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm border ${style}`}>
      {label}
    </span>
  );
}
