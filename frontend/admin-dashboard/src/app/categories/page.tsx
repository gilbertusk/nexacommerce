"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminStore } from "@/lib/store/useAdminStore";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api/client";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  productCount?: number;
}

interface Brand {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  productCount?: number;
}

interface CategoriesResponse {
  success: boolean;
  data: Category[] | { categories: Category[] };
}

interface BrandsResponse {
  success: boolean;
  data: Brand[] | { brands: Brand[] };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeArray<T>(raw: T[] | { [k: string]: T[] } | null | undefined, key: string): T[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return (raw as Record<string, T[]>)[key] ?? [];
}

// ─── Reusable inline edit/delete row ──────────────────────────────────────────

interface ItemRowProps {
  name: string;
  sub?: string;
  onEdit: () => void;
  onDelete: () => void;
}

function ItemRow({ name, sub, onEdit, onDelete }: ItemRowProps) {
  return (
    <tr className="hover:bg-surface transition-colors">
      <td className="py-3 px-4">
        <p className="text-xs font-medium text-ink-primary">{name}</p>
        {sub && <p className="text-[10px] text-ink-secondary mt-0.5">{sub}</p>}
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 text-ink-secondary hover:text-primary hover:bg-paper rounded-sm transition-colors"
            title="Edit"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-ink-secondary hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"
            title="Hapus"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

interface DeleteModalProps {
  itemName: string;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteModal({ itemName, isPending, onConfirm, onCancel }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white hairline rounded-sm p-6 w-full max-w-sm flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-red-500 text-2xl mt-0.5">warning</span>
          <div>
            <h3 className="font-serif text-lg text-ink-primary">Konfirmasi Hapus</h3>
            <p className="text-sm text-ink-secondary mt-1">
              Yakin ingin menghapus <strong className="text-ink-primary">{itemName}</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 hairline rounded-sm text-xs font-bold uppercase tracking-widest text-ink-secondary hover:bg-surface transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="px-4 py-2 bg-red-600 text-white rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {isPending ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CategoriesPage() {
  const token = useAdminStore((s) => s.token);
  const qc = useQueryClient();

  // Feedback
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  function showFeedback(type: "success" | "error", message: string) {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  }

  // ── Categories state ──────────────────────────────────────────────────────
  const [catForm, setCatForm] = useState({ name: "", description: "" });
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [deleteCat, setDeleteCat] = useState<Category | null>(null);
  const [showCatForm, setShowCatForm] = useState(false);

  // ── Brands state ──────────────────────────────────────────────────────────
  const [brandForm, setBrandForm] = useState({ name: "", description: "" });
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [deleteBrand, setDeleteBrand] = useState<Brand | null>(null);
  const [showBrandForm, setShowBrandForm] = useState(false);

  // ── Queries ───────────────────────────────────────────────────────────────
  const catQuery = useQuery<CategoriesResponse>({
    queryKey: ["categories"],
    queryFn: () => apiGet<CategoriesResponse>("/products/categories", token ?? undefined),
    enabled: !!token,
  });

  const brandQuery = useQuery<BrandsResponse>({
    queryKey: ["brands"],
    queryFn: () => apiGet<BrandsResponse>("/products/brands", token ?? undefined),
    enabled: !!token,
  });

  const categories = normalizeArray<Category>(catQuery.data?.data as Category[] | { categories: Category[] }, "categories");
  const brands = normalizeArray<Brand>(brandQuery.data?.data as Brand[] | { brands: Brand[] }, "brands");

  // ── Category mutations ────────────────────────────────────────────────────
  const createCatMutation = useMutation({
    mutationFn: (body: { name: string; description: string }) =>
      apiPost<unknown>("/products/categories", body, token ?? undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      setShowCatForm(false);
      setCatForm({ name: "", description: "" });
      showFeedback("success", "Kategori berhasil dibuat.");
    },
    onError: (e: Error) => showFeedback("error", e.message || "Gagal membuat kategori."),
  });

  const updateCatMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: { name: string; description: string } }) =>
      apiPatch<unknown>(`/products/categories/${id}`, body, token ?? undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      setEditingCat(null);
      showFeedback("success", "Kategori berhasil diperbarui.");
    },
    onError: (e: Error) => showFeedback("error", e.message || "Gagal memperbarui kategori."),
  });

  const deleteCatMutation = useMutation({
    mutationFn: (id: string) =>
      apiDelete<unknown>(`/products/categories/${id}`, token ?? undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      setDeleteCat(null);
      showFeedback("success", "Kategori berhasil dihapus.");
    },
    onError: () => {
      setDeleteCat(null);
      showFeedback("error", "Gagal menghapus kategori.");
    },
  });

  // ── Brand mutations ───────────────────────────────────────────────────────
  const createBrandMutation = useMutation({
    mutationFn: (body: { name: string; description: string }) =>
      apiPost<unknown>("/products/brands", body, token ?? undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["brands"] });
      setShowBrandForm(false);
      setBrandForm({ name: "", description: "" });
      showFeedback("success", "Brand berhasil dibuat.");
    },
    onError: (e: Error) => showFeedback("error", e.message || "Gagal membuat brand."),
  });

  const updateBrandMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: { name: string; description: string } }) =>
      apiPatch<unknown>(`/products/brands/${id}`, body, token ?? undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["brands"] });
      setEditingBrand(null);
      showFeedback("success", "Brand berhasil diperbarui.");
    },
    onError: (e: Error) => showFeedback("error", e.message || "Gagal memperbarui brand."),
  });

  const deleteBrandMutation = useMutation({
    mutationFn: (id: string) =>
      apiDelete<unknown>(`/products/brands/${id}`, token ?? undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["brands"] });
      setDeleteBrand(null);
      showFeedback("success", "Brand berhasil dihapus.");
    },
    onError: () => {
      setDeleteBrand(null);
      showFeedback("error", "Gagal menghapus brand.");
    },
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleCatSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingCat) {
      updateCatMutation.mutate({ id: editingCat.id, body: catForm });
    } else {
      createCatMutation.mutate(catForm);
    }
  }

  function handleBrandSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingBrand) {
      updateBrandMutation.mutate({ id: editingBrand.id, body: brandForm });
    } else {
      createBrandMutation.mutate(brandForm);
    }
  }

  function startEditCat(cat: Category) {
    setEditingCat(cat);
    setCatForm({ name: cat.name, description: cat.description ?? "" });
    setShowCatForm(true);
  }

  function startEditBrand(brand: Brand) {
    setEditingBrand(brand);
    setBrandForm({ name: brand.name, description: brand.description ?? "" });
    setShowBrandForm(true);
  }

  function cancelCatForm() {
    setShowCatForm(false);
    setEditingCat(null);
    setCatForm({ name: "", description: "" });
  }

  function cancelBrandForm() {
    setShowBrandForm(false);
    setEditingBrand(null);
    setBrandForm({ name: "", description: "" });
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-serif text-ink-primary mb-1">
          Kategori &amp; Brand
        </h1>
        <p className="text-sm text-ink-secondary">
          Kelola kategori produk dan brand yang tersedia di platform.
        </p>
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-sm text-sm hairline ${
            feedback.type === "success"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {feedback.type === "success" ? "check_circle" : "error"}
          </span>
          {feedback.message}
        </div>
      )}

      {/* Delete Modals */}
      {deleteCat && (
        <DeleteModal
          itemName={deleteCat.name}
          isPending={deleteCatMutation.isPending}
          onConfirm={() => deleteCatMutation.mutate(deleteCat.id)}
          onCancel={() => setDeleteCat(null)}
        />
      )}
      {deleteBrand && (
        <DeleteModal
          itemName={deleteBrand.name}
          isPending={deleteBrandMutation.isPending}
          onConfirm={() => deleteBrandMutation.mutate(deleteBrand.id)}
          onCancel={() => setDeleteBrand(null)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── CATEGORIES ─────────────────────────────────────────────────── */}
        <div className="bg-white hairline rounded-sm flex flex-col">
          <div className="p-5 hairline-b flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-ink-primary">Kategori Produk</h2>
              <p className="text-[10px] text-ink-secondary mt-0.5">{categories.length} kategori</p>
            </div>
            <button
              onClick={() => { cancelCatForm(); setShowCatForm(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-ink-primary text-white rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-ink-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              Tambah
            </button>
          </div>

          {/* Category Form */}
          {showCatForm && (
            <div className="p-4 hairline-b bg-surface">
              <form onSubmit={handleCatSubmit} className="flex flex-col gap-3">
                <p className="text-[10px] uppercase tracking-widest font-bold text-ink-secondary">
                  {editingCat ? `Edit: ${editingCat.name}` : "Kategori Baru"}
                </p>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-ink-secondary">
                    Nama *
                  </label>
                  <input
                    type="text"
                    required
                    value={catForm.name}
                    onChange={(e) => setCatForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-white hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="nama kategori"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-ink-secondary">
                    Deskripsi
                  </label>
                  <textarea
                    value={catForm.description}
                    onChange={(e) => setCatForm((f) => ({ ...f, description: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 bg-white hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    placeholder="Opsional"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={cancelCatForm}
                    className="px-3 py-1.5 hairline rounded-sm text-[10px] font-bold uppercase tracking-widest text-ink-secondary hover:bg-white transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={createCatMutation.isPending || updateCatMutation.isPending}
                    className="px-3 py-1.5 bg-ink-primary text-white rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-ink-primary/90 transition-colors disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {(createCatMutation.isPending || updateCatMutation.isPending) ? (
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : null}
                    {editingCat ? "Perbarui" : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {catQuery.isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="w-5 h-5 border-2 border-hairline border-t-ink-secondary rounded-full animate-spin" />
            </div>
          ) : catQuery.isError ? (
            <div className="p-8 flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-2xl text-ink-secondary">cloud_off</span>
              <p className="text-sm text-ink-secondary">Gagal memuat kategori.</p>
              <button
                onClick={() => catQuery.refetch()}
                className="px-3 py-1.5 bg-ink-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-sm"
              >
                Coba Lagi
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface hairline-b">
                    <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-3">Nama</th>
                    <th className="text-right text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E3DC]">
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-sm text-ink-secondary">
                        Belum ada kategori.
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => (
                      <ItemRow
                        key={cat.id}
                        name={cat.name}
                        sub={cat.slug}
                        onEdit={() => startEditCat(cat)}
                        onDelete={() => setDeleteCat(cat)}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── BRANDS ─────────────────────────────────────────────────────── */}
        <div className="bg-white hairline rounded-sm flex flex-col">
          <div className="p-5 hairline-b flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-ink-primary">Brand / Merek</h2>
              <p className="text-[10px] text-ink-secondary mt-0.5">{brands.length} brand</p>
            </div>
            <button
              onClick={() => { cancelBrandForm(); setShowBrandForm(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-ink-primary text-white rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-ink-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              Tambah
            </button>
          </div>

          {/* Brand Form */}
          {showBrandForm && (
            <div className="p-4 hairline-b bg-surface">
              <form onSubmit={handleBrandSubmit} className="flex flex-col gap-3">
                <p className="text-[10px] uppercase tracking-widest font-bold text-ink-secondary">
                  {editingBrand ? `Edit: ${editingBrand.name}` : "Brand Baru"}
                </p>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-ink-secondary">
                    Nama *
                  </label>
                  <input
                    type="text"
                    required
                    value={brandForm.name}
                    onChange={(e) => setBrandForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-white hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="nama brand"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-ink-secondary">
                    Deskripsi
                  </label>
                  <textarea
                    value={brandForm.description}
                    onChange={(e) => setBrandForm((f) => ({ ...f, description: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 bg-white hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    placeholder="Opsional"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={cancelBrandForm}
                    className="px-3 py-1.5 hairline rounded-sm text-[10px] font-bold uppercase tracking-widest text-ink-secondary hover:bg-white transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={createBrandMutation.isPending || updateBrandMutation.isPending}
                    className="px-3 py-1.5 bg-ink-primary text-white rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-ink-primary/90 transition-colors disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {(createBrandMutation.isPending || updateBrandMutation.isPending) ? (
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : null}
                    {editingBrand ? "Perbarui" : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {brandQuery.isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="w-5 h-5 border-2 border-hairline border-t-ink-secondary rounded-full animate-spin" />
            </div>
          ) : brandQuery.isError ? (
            <div className="p-8 flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-2xl text-ink-secondary">cloud_off</span>
              <p className="text-sm text-ink-secondary">Gagal memuat brand.</p>
              <button
                onClick={() => brandQuery.refetch()}
                className="px-3 py-1.5 bg-ink-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-sm"
              >
                Coba Lagi
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface hairline-b">
                    <th className="text-left text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-3">Nama</th>
                    <th className="text-right text-[10px] uppercase font-bold tracking-widest text-ink-secondary pb-3 px-4 pt-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E3DC]">
                  {brands.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-sm text-ink-secondary">
                        Belum ada brand.
                      </td>
                    </tr>
                  ) : (
                    brands.map((brand) => (
                      <ItemRow
                        key={brand.id}
                        name={brand.name}
                        sub={brand.slug}
                        onEdit={() => startEditBrand(brand)}
                        onDelete={() => setDeleteBrand(brand)}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
