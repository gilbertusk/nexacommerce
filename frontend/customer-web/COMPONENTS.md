# NexaCommerce — Customer Web Frontend Components Documentation

Dokumen ini mendokumentasikan sistem desain, token styling, komponen UI reusable, dan manajemen state yang diimplementasikan di **customer-web** (`frontend/customer-web`).

---

## 1. Desain Sistem & Styling (`globals.css`)

Aplikasi ini menggunakan **Tailwind CSS v4** dengan kustomisasi token yang didefinisikan langsung di dalam directive `@theme`:

*   **Palet Warna Editorial:**
    *   `primary` (`#ad3300`): Aksen merah tanah liat (clay) sebagai aksen utama.
    *   `primary-hover` (`#8f2a00`): State hover untuk elemen primary.
    *   `paper` (`#F5F2EB`): Warna latar hangat off-white/beige.
    *   `surface` (`#FAF8F5`): Latar sekunder yang lebih bersih.
    *   `ink-primary` (`#1C1917`): Warna teks hitam arang hangat yang dominan.
    *   `ink-secondary` (`#78716C`): Warna teks stone-500 untuk subteks/muted.
    *   `hairline` (`#E7E3DC`): Warna border garis tipis khas gaya editorial.
*   **Tipografi:**
    *   `serif` (`Instrument Serif`): Digunakan untuk tajuk utama (headlines) dan kutipan.
    *   `sans` (`Hanken Grotesk`): Font sans-serif bersih untuk keterbacaan teks body.
    *   `mono` (`Geist Mono`): Digunakan untuk rendering angka nominal, kode, dan tagihan agar sejajar secara vertikal (`tabular-nums`).
*   **Border Radius:**
    *   Default / `xs` / `sm`: `2px` (tampilan sangat tajam/minimalis).
    *   `md`: `4px`.
    *   `lg`: `8px`.
    *   `xl`: `12px`.
*   **Utilitas Kustom:**
    *   `.hairline`, `.hairline-t`, `.hairline-b`, `.hairline-l`, `.hairline-r`: Border 1px solid berwarna `#E7E3DC`.
    *   `.tabular-nums`: Memaksa font angka untuk menggunakan lebar yang seragam.
    *   `.animate-shimmer`: Efek transisi shimmer halus untuk loading skeleton.

---

## 2. Reusable UI Components (`src/components/ui/`)

### A. `ProductCard.tsx`
Kartu produk dengan rasio frame `aspect-[4/5]` yang menampilkan gambar produk, label diskon, overlay status habis, tombol simpan wishlist, merek, judul dengan font serif, serta harga berformat rupiah dengan `Geist Mono`.
*   **State Hook:** Tersambung ke `useWishlistStore` secara reaktif.

### B. `QuantityStepper.tsx`
Elemen pengubah kuantitas `[ − ] [ qty ] [ + ]` dengan pembatasan nilai minimal dan maksimal stok.
*   **Props:** `value`, `onChange`, `max`, `min`, `disabled`.

### C. `StatusBadge.tsx`
Label status pemesanan (menunggu pembayaran, berhasil, dibayar, dikirim, batal, dll.) dengan skema warna yang diredam (muted).

### D. `TimelineVertical.tsx`
Komponen pelacakan log pengiriman dan riwayat status order menggunakan layout titik garis vertikal.

### E. `EmptyState.tsx`
Penanganan visual minimalis saat data keranjang belanja, pencarian, maupun daftar favorit sedang kosong. Dilengkapi tombol Call to Action (CTA).

### F. `LoadingSkeleton.tsx`
Komponen shimmer skeleton (untuk placeholder tulisan, grid produk, dan detail deskripsi) yang memicu UX responsif saat data sedang dimuat secara asinkron.

---

## 3. State Management Stores (`src/lib/store/`)

Kami menggunakan **Zustand** dengan middleware `persist` agar status belanja tetap tersimpan di `localStorage` meskipun halaman dimuat ulang.

### A. `useCartStore.ts`
Mengelola daftar barang belanja (`items`), voucher yang terpasang (`appliedVoucher`), serta fungsi-fungsi manipulasi keranjang:
*   `addItem(item, qty)`: Menambah item belanja secara cerdas (menggabungkan jumlah jika item sama dan membatasi sesuai stok maksimum).
*   `removeItem(id)`: Menghapus item.
*   `updateQty(id, qty)`: Mengubah jumlah unit item.
*   `applyVoucher(voucher)` & `removeVoucher()`: Mengelola voucher aktif.
*   `getCartTotal()`, `getDiscountAmount()`, `getFinalTotal()`: Helper untuk kalkulasi harga.

### B. `useWishlistStore.ts`
Mengelola daftar favorit belanja pelanggan:
*   `toggleWishlist(item)`: Menambah atau menghapus barang dari wishlist.
*   `isInWishlist(id)`: Pengecekan status untuk render ikon hati merah.

### C. `useUserStore.ts`
Mengelola sesi akun aktif (`user`), token JWT (`token`), daftar alamat pengiriman (`addresses`), dan alamat terpilih (`selectedAddressId`):
*   `login(user, token)`: Memicu sesi login sekaligus memasang alamat dummy awal.
*   `addAddress(address)`: Menambahkan alamat baru dengan pengaturan alamat utama (default).
*   `selectAddress(id)`: Mengubah alamat aktif saat checkout.

---

## 4. Layer Integrasi Data & Simulasi Latensi (`src/lib/api/`)

Berkas `mockData.ts` bertindak sebagai database frontend lokal yang mensimulasikan panggilan asinkron ke microservice cluster dengan artificial delay sebesar **200-400ms**.

Fungsi query yang tersedia:
*   `fetchProducts(filters)`: Mengambil daftar produk lengkap dengan filter pencarian kata kunci, kategori, brand, rating minimal, rentang harga, dan sorting terintegrasi.
*   `fetchProductById(id)`: Mengambil data detail satu produk.
*   `fetchReviewsByProductId(productId)`: Mengambil daftar ulasan produk.
*   `validateVoucher(code)`: Validasi kecocokan kode promo.
*   `fetchShippingRates()`: Mengambil daftar pilihan kurir logistik (JNE, J&T, SiCepat).
