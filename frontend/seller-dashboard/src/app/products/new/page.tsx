'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSellerStore } from '@/lib/store/useSellerStore';
import { apiGet, apiPost, apiUpload } from '@/lib/api/client';

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

interface CategoryListResponse {
  success: boolean;
  data: Category[] | { categories: Category[] };
}

interface BrandListResponse {
  success: boolean;
  data: Brand[] | { brands: Brand[] };
}

interface ProductCreateResponse {
  success: boolean;
  data?: { id?: string } | { product?: { id?: string } };
  message?: string;
}

interface FormState {
  name: string;
  description: string;
  price: string;
  stock: string;
  weight: string;
  categoryId: string;
  brandId: string;
  images: string;
}

const INITIAL_FORM: FormState = {
  name: '',
  description: '',
  price: '',
  stock: '',
  weight: '',
  categoryId: '',
  brandId: '',
  images: '',
};

function validateForm(form: FormState): Record<string, string> {
  const errors: Record<string, string> = {};
  if (form.name.trim().length < 2) errors.name = 'Nama produk minimal 2 karakter.';
  if (!form.price || !Number.isFinite(Number(form.price)) || Number(form.price) <= 0)
    errors.price = 'Harga harus lebih besar dari nol.';
  if (!form.stock || !Number.isSafeInteger(Number(form.stock)) || Number(form.stock) < 0)
    errors.stock = 'Stok harus berupa bilangan bulat tidak negatif.';
  if (!form.categoryId) errors.categoryId = 'Kategori wajib dipilih.';
  if (!form.weight || !Number.isSafeInteger(Number(form.weight)) || Number(form.weight) <= 0)
    errors.weight = 'Berat harus berupa bilangan bulat positif dalam gram.';
  const imageUrls = form.images.split('\n').map((url) => url.trim()).filter(Boolean);
  if (new Set(imageUrls).size !== imageUrls.length) errors.images = 'URL gambar tidak boleh duplikat.';
  if (imageUrls.some((url) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol !== 'https:' || Boolean(parsed.username || parsed.password) || url.length > 2048;
    } catch { return true; }
  })) errors.images = 'Setiap URL gambar harus berupa URL HTTPS yang valid.';
  return errors;
}

function slugify(value: string) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);
}

export default function NewProductPage() {
  const router = useRouter();
  const { token } = useSellerStore();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    if (!token) return;

    async function fetchDropdowns() {
      try {
        const [catRes, brandRes] = await Promise.all([
          apiGet<CategoryListResponse>('/api/v1/products/categories', token!),
          apiGet<BrandListResponse>('/api/v1/products/brands', token!),
        ]);

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
      } catch {
        // Non-fatal: dropdowns will just be empty
      }
    }

    fetchDropdowns();
  }, [token]);

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
        slug: slugify(form.name),
        description: form.description.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        weight: Number(form.weight),
        categoryId: form.categoryId,
      };
      if (form.brandId) payload.brandId = form.brandId;

      const res = await apiPost<ProductCreateResponse>(
        '/api/v1/products/products',
        payload,
        token!,
      );

      if (res.success) {
        const product = res.data && 'id' in res.data
          ? res.data
          : res.data && 'product' in res.data ? res.data.product : undefined;
        if (!product?.id) {
          setServerError('Produk mungkin sudah tersimpan, tetapi respons server tidak menyertakan ID. Periksa daftar produk sebelum mencoba lagi.');
          return;
        }
        try {
          for (const file of imageFiles) {
            const upload = new FormData();
            upload.append('image', file);
            await apiUpload(`/api/v1/products/products/${product.id}/images/upload`, upload);
          }
          for (const [index, url] of imageUrls.entries()) {
            await apiPost(`/api/v1/products/products/${product.id}/images`, {
              url,
              alt: form.name.trim(),
              sortOrder: imageFiles.length + index,
              isMain: imageFiles.length === 0 && index === 0,
            }, token!);
          }
        } catch (imageError) {
          setServerError(`Produk berhasil dibuat, tetapi gambar gagal disimpan: ${imageError instanceof Error ? imageError.message : 'kesalahan tidak diketahui'}. Periksa produk sebelum mengulangi pembuatan.`);
          return;
        }
        router.push('/products');
      } else {
        setServerError(res.message ?? 'Gagal membuat produk.');
      }
    } catch (err: unknown) {
      setServerError(
        err instanceof Error ? err.message : 'Terjadi kesalahan.',
      );
    } finally {
      setIsSubmitting(false);
    }
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
          <h1 className="text-2xl font-serif text-ink-primary">
            Tambah Produk Baru
          </h1>
          <p className="text-sm text-ink-secondary">
            Isi detail produk yang akan dijual di toko Anda.
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
        {/* Basic Info */}
        <div className="bg-white hairline rounded-sm p-6 flex flex-col gap-5">
          <h2 className="font-serif text-lg text-ink-primary hairline-b pb-4">
            Informasi Produk
          </h2>

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-ink-secondary">
              Nama Produk <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Contoh: Piring Keramik Kasongan"
              className={`w-full px-4 py-3 bg-surface hairline rounded-sm text-sm text-ink-primary placeholder:text-ink-secondary/60 focus:outline-none focus:ring-1 focus:ring-primary transition-all ${errors.name ? 'border-red-400' : ''}`}
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-ink-secondary">
              Deskripsi
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Deskripsikan produk Anda secara detail..."
              className="w-full px-4 py-3 bg-surface hairline rounded-sm text-sm text-ink-primary placeholder:text-ink-secondary/60 focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
            />
          </div>

          {/* Price and Stock */}
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
                placeholder="0"
                className={`w-full px-4 py-3 bg-surface hairline rounded-sm text-sm text-ink-primary placeholder:text-ink-secondary/60 focus:outline-none focus:ring-1 focus:ring-primary transition-all ${errors.price ? 'border-red-400' : ''}`}
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
                placeholder="0"
                className={`w-full px-4 py-3 bg-surface hairline rounded-sm text-sm text-ink-primary placeholder:text-ink-secondary/60 focus:outline-none focus:ring-1 focus:ring-primary transition-all ${errors.stock ? 'border-red-400' : ''}`}
              />
              {errors.stock && (
                <p className="text-xs text-red-600">{errors.stock}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-ink-secondary">
                Berat produk (gram) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="weight"
                value={form.weight}
                onChange={handleChange}
                min="1"
                step="1"
                placeholder="Contoh: 500"
                className={`w-full px-4 py-3 bg-surface hairline rounded-sm text-sm text-ink-primary placeholder:text-ink-secondary/60 focus:outline-none focus:ring-1 focus:ring-primary transition-all ${errors.weight ? 'border-red-400' : ''}`}
              />
              {errors.weight && <p className="text-xs text-red-600">{errors.weight}</p>}
            </div>
          </div>

          {/* Category and Brand */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-ink-secondary">
              Kategori <span className="text-red-500">*</span>
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
              {errors.categoryId && <p className="text-xs text-red-600">{errors.categoryId}</p>}
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

          {/* Images */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="product-image-files" className="text-xs font-bold uppercase tracking-widest text-ink-secondary">
              Upload Gambar Produk
            </label>
            <input
              id="product-image-files"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(event) => setImageFiles(Array.from(event.target.files ?? []))}
              className="w-full px-4 py-3 bg-surface hairline rounded-sm text-sm text-ink-primary"
            />
            {imageFiles.length > 0 && (
              <p className="text-[10px] text-ink-secondary">{imageFiles.length} gambar dipilih: {imageFiles.map((file) => file.name).join(', ')}</p>
            )}
            <label htmlFor="product-image-urls" className="text-xs font-bold uppercase tracking-widest text-ink-secondary mt-3">
              Atau Tambahkan URL HTTPS
            </label>
            <textarea
              id="product-image-urls"
              name="images"
              value={form.images}
              onChange={handleChange}
              rows={3}
              placeholder="Satu URL per baris&#10;https://example.com/gambar1.jpg"
              className="w-full px-4 py-3 bg-surface hairline rounded-sm text-sm text-ink-primary placeholder:text-ink-secondary/60 focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none font-mono"
            />
            <p className="text-[10px] text-ink-secondary">
              Upload menerima JPEG, PNG, atau WebP maksimal 5 MB per gambar. Server memvalidasi, mengubah ke WebP, lalu menyimpan ke media object storage.
            </p>
            {errors.images && <p className="text-xs text-red-600">{errors.images}</p>}
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
                Simpan Produk
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
