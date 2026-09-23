'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useSellerStore } from '@/lib/store/useSellerStore';
import { apiGet, apiPut, apiDelete } from '@/lib/api/client';

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId?: string;
  brandId?: string;
  images?: string[];
}

interface ProductResponse {
  success: boolean;
  data: Product | { product: Product };
  message?: string;
}

interface CategoryListResponse {
  success: boolean;
  data: Category[] | { categories: Category[] };
}

interface BrandListResponse {
  success: boolean;
  data: Brand[] | { brands: Brand[] };
}

interface FormState {
  name: string;
  description: string;
  price: string;
  stock: string;
  categoryId: string;
  brandId: string;
  images: string;
}

function validateForm(form: FormState): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.name.trim()) errors.name = 'Nama produk wajib diisi.';
  if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0)
    errors.price = 'Harga harus berupa angka positif.';
  if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0)
    errors.stock = 'Stok harus berupa angka tidak negatif.';
  return errors;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { token } = useSellerStore();

  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    brandId: '',
    images: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    if (!token || !productId) return;

    async function fetchData() {
      setIsLoading(true);
      try {
        const [productRes, catRes, brandRes] = await Promise.all([
          apiGet<ProductResponse>(
            `/api/v1/products/products/${productId}`,
            token!,
          ),
          apiGet<CategoryListResponse>('/api/v1/products/categories', token!),
          apiGet<BrandListResponse>('/api/v1/brands', token!),
        ]);

        if (productRes.success) {
          const raw = productRes.data;
          const product: Product =
            'id' in raw ? raw : (raw as { product: Product }).product;

          setForm({
            name: product.name,
            description: product.description ?? '',
            price: String(product.price),
            stock: String(product.stock),
            categoryId: product.categoryId ?? '',
            brandId: product.brandId ?? '',
            images: (product.images ?? []).join('\n'),
          });
        }

        if (catRes.success) {
          const cats = Array.isArray(catRes.data)
            ? catRes.data
            : (catRes.data as { categories: Category[] }).categories ?? [];
          setCategories(cats);
        }

        if (brandRes.success) {
          const brs = Array.isArray(brandRes.data)
            ? brandRes.data
            : (brandRes.data as { brands: Brand[] }).brands ?? [];
          setBrands(brs);
        }
      } catch (err: unknown) {
        setServerError(
          err instanceof Error ? err.message : 'Gagal memuat data produk.',
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [token, productId]);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError('');

    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const imageUrls = form.images
        .split('\n')
        .map((u) => u.trim())
        .filter(Boolean);

      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        images: imageUrls,
      };
      if (form.categoryId) payload.categoryId = form.categoryId;
      if (form.brandId) payload.brandId = form.brandId;

      const res = await apiPut<{ success: boolean; message?: string }>(
        `/api/v1/products/products/${productId}`,
        payload,
        token!,
      );

      if (res.success) {
        router.push('/products');
      } else {
        setServerError(res.message ?? 'Gagal memperbarui produk.');
      }
    } catch (err: unknown) {
      setServerError(
        err instanceof Error ? err.message : 'Terjadi kesalahan.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!token) return;
    setIsDeleting(true);
    try {
      await apiDelete(`/api/v1/products/products/${productId}`, token);
      router.push('/products');
    } catch (err: unknown) {
      setServerError(
        err instanceof Error ? err.message : 'Gagal menghapus produk.',
      );
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-paper animate-pulse rounded-sm" />
          <div className="h-8 w-48 bg-paper animate-pulse rounded-xs" />
        </div>
        <div className="bg-white hairline rounded-sm p-6 flex flex-col gap-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="h-3 w-24 bg-paper animate-pulse rounded-xs" />
              <div className="h-11 bg-paper animate-pulse rounded-sm" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/products"
          className="w-8 h-8 flex items-center justify-center hairline rounded-sm hover:bg-surface transition-colors text-ink-secondary"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-serif text-ink-primary">Edit Produk</h1>
          <p className="text-sm text-ink-secondary">
            Perbarui informasi produk Anda.
          </p>
        </div>
      </div>

      {serverError && (
        <div className="flex items-start gap-3 bg-red-50 hairline border-red-200 rounded-sm p-4">
          <span className="material-symbols-outlined text-red-600 text-sm mt-0.5">
            error
          </span>
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="bg-white hairline rounded-sm p-6 flex flex-col gap-5">
          <h2 className="font-serif text-lg text-ink-primary hairline-b pb-4">
            Informasi Produk
          </h2>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-ink-secondary">
              Nama Produk <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nama produk"
              className={`w-full px-4 py-3 bg-surface hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all ${errors.name ? 'border-red-400' : ''}`}
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-ink-secondary">
              Deskripsi
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 bg-surface hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-ink-secondary">
                Harga (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                min="0"
                className={`w-full px-4 py-3 bg-surface hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all ${errors.price ? 'border-red-400' : ''}`}
              />
              {errors.price && (
                <p className="text-xs text-red-600">{errors.price}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-ink-secondary">
                Stok <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                min="0"
                className={`w-full px-4 py-3 bg-surface hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all ${errors.stock ? 'border-red-400' : ''}`}
              />
              {errors.stock && (
                <p className="text-xs text-red-600">{errors.stock}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-ink-secondary">
                Kategori
              </label>
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-surface hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              >
                <option value="">Pilih kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-ink-secondary">
                Merek / Brand
              </label>
              <select
                name="brandId"
                value={form.brandId}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-surface hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              >
                <option value="">Pilih merek</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-ink-secondary">
              URL Gambar
            </label>
            <textarea
              name="images"
              value={form.images}
              onChange={handleChange}
              rows={3}
              placeholder="Satu URL per baris"
              className="w-full px-4 py-3 bg-surface hairline rounded-sm text-sm text-ink-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none font-mono"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Link
            href="/products"
            className="px-6 py-3 hairline rounded-sm text-sm font-medium text-ink-secondary hover:bg-surface transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-sm transition-colors flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined text-sm animate-spin">
                  progress_activity
                </span>
                Menyimpan...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">save</span>
                Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="bg-white hairline border-red-100 rounded-sm p-6">
        <h3 className="font-serif text-base text-red-700 mb-2">Zona Bahaya</h3>
        <p className="text-sm text-ink-secondary mb-4">
          Menghapus produk ini akan menghilangkan semua data terkait secara
          permanen.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-sm text-sm font-medium transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">delete</span>
          Hapus Produk
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white hairline rounded-sm p-6 max-w-sm w-full shadow-lg">
            <h3 className="font-serif text-lg text-ink-primary mb-2">
              Hapus Produk
            </h3>
            <p className="text-sm text-ink-secondary mb-6">
              Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak
              dapat dibatalkan.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-5 py-2.5 hairline rounded-sm text-sm font-medium text-ink-secondary hover:bg-surface transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-sm text-sm font-medium transition-colors flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">
                      progress_activity
                    </span>
                    Menghapus...
                  </>
                ) : (
                  'Ya, Hapus'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
