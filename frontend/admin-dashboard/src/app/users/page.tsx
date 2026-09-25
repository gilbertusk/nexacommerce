"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminStore } from "@/lib/store/useAdminStore";
import { apiGet, apiPatch } from "@/lib/api/client";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

interface UsersResponse {
  success: boolean;
  data: {
    items: User[];
    total: number;
    page: number;
    limit: number;
  };
}

const ROLES = [
  { value: "", label: "Semua Peran" },
  { value: "CUSTOMER", label: "Pelanggan" },
  { value: "SELLER", label: "Penjual" },
  { value: "ADMIN", label: "Admin" },
];

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-50 text-green-700",
  SUSPENDED: "bg-red-50 text-red-700",
  PENDING: "bg-yellow-50 text-yellow-700",
};

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return d;
  }
}

export default function UsersPage() {
  const token = useAdminStore((s) => s.token);
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const limit = 20;

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(role ? { role } : {}),
  });

  const { data, isLoading, isError, refetch } = useQuery<UsersResponse>({
    queryKey: ["users", page, role],
    queryFn: () => apiGet<UsersResponse>(`/users?${params.toString()}`, token ?? undefined),
    enabled: !!token,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiPatch<unknown>(`/users/${id}/status`, { status }, token ?? undefined),
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ["users"] });
      setFeedback({ type: "success", message: status === "ACTIVE" ? "Pengguna diaktifkan." : "Pengguna ditangguhkan." });
      setTimeout(() => setFeedback(null), 3000);
    },
    onError: () => {
      setFeedback({ type: "error", message: "Gagal memperbarui status pengguna." });
      setTimeout(() => setFeedback(null), 3000);
    },
  });

  const users = data?.data?.items ?? [];
  const visibleUsers = users.filter((user) =>
    !search || `${user.name} ${user.email}`.toLowerCase().includes(search.toLowerCase()),
  );
  const total = data?.data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-serif text-ink-primary mb-1">Manajemen Pengguna</h1>
        <p className="text-sm text-ink-secondary">Kelola semua akun pengguna, penjual, dan admin platform.</p>
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-sm text-sm hairline ${
            feedback.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {feedback.type === "success" ? "check_circle" : "error"}
          </span>
          {feedback.message}
        </div>
      )}

      <div className="bg-white hairline rounded-sm flex flex-col">
        {/* Toolbar */}
        <div className="p-4 hairline-b flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <span className="material-symbols-outlined absolute left-3 top-2 text-ink-secondary text-sm">search</span>
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-1.5 bg-surface hairline rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            value={role}
            onChange={(e) => { setRole(e.target.value); setPage(1); }}
            className="px-3 py-1.5 bg-surface hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <span className="text-xs text-ink-secondary ml-auto">
            {total} pengguna
          </span>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="p-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-hairline border-t-ink-secondary rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="p-8 flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-ink-secondary">cloud_off</span>
            <p className="text-sm text-ink-secondary">Gagal memuat data pengguna.</p>
            <button onClick={() => refetch()} className="px-4 py-2 bg-ink-primary text-white text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-ink-primary/90 transition-colors">
              Coba Lagi
            </button>
          </div>
        )}

        {/* Table */}
        {!isLoading && !isError && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface hairline-b">
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Nama</th>
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Email</th>
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Peran</th>
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Status</th>
                  <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Bergabung</th>
                  <th className="text-right text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E3DC]">
                {visibleUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-ink-secondary">
                      Tidak ada pengguna ditemukan.
                    </td>
                  </tr>
                ) : (
                  visibleUsers.map((user) => {
                    const isProcessing = mutation.isPending && (mutation.variables as { id: string })?.id === user.id;
                    const canSuspend = user.status === "ACTIVE";
                    return (
                      <tr key={user.id} className="hover:bg-surface transition-colors">
                        <td className="py-3 px-4 text-xs font-medium text-ink-primary">{user.name}</td>
                        <td className="py-3 px-4 text-xs text-ink-secondary">{user.email}</td>
                        <td className="py-3 px-4 text-xs text-ink-secondary">{user.role}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-widest font-bold ${STATUS_COLORS[user.status] ?? "bg-surface text-ink-secondary"}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-ink-secondary">{formatDate(user.createdAt)}</td>
                        <td className="py-3 px-4 text-right">
                          {isProcessing ? (
                            <span className="text-[10px] text-ink-secondary">Memproses...</span>
                          ) : (
                            <button
                              onClick={() =>
                                mutation.mutate({ id: user.id, status: canSuspend ? "SUSPENDED" : "ACTIVE" })
                              }
                              disabled={mutation.isPending}
                              className={`px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50 ${
                                canSuspend
                                  ? "bg-red-50 text-red-700 hover:bg-red-100"
                                  : "bg-green-50 text-green-700 hover:bg-green-100"
                              }`}
                            >
                              {canSuspend ? "Tangguhkan" : "Aktifkan"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 hairline-t flex items-center justify-between">
            <span className="text-xs text-ink-secondary">
              Halaman {page} dari {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 hairline rounded-sm text-xs font-medium text-ink-secondary hover:text-ink-primary hover:bg-surface disabled:opacity-40 transition-colors"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 hairline rounded-sm text-xs font-medium text-ink-secondary hover:text-ink-primary hover:bg-surface disabled:opacity-40 transition-colors"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
