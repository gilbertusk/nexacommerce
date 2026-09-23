export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  images: string[];
  category: string;
  brand: string;
  description: string;
  specifications: { label: string; value: string }[];
  stock: number;
  rating: number;
  reviewsCount: number;
  sellerId: string;
  sellerName: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ShippingOption {
  id: string;
  courier: string;
  service: string;
  cost: number;
  etd: string; // Estimated Time of Delivery
}

// ----------------------------------------------------
// Mock Database
// ----------------------------------------------------

export const categories: Category[] = [
  { id: "cat-1", name: "Apparel", slug: "apparel", image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=400" },
  { id: "cat-2", name: "Home Goods", slug: "home-goods", image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=400" },
  { id: "cat-3", name: "Footwear", slug: "footwear", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=400" },
  { id: "cat-4", name: "Accessories", slug: "accessories", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400" },
  { id: "cat-5", name: "Apothecary", slug: "apothecary", image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=400" },
];

export const brands: Brand[] = [
  { id: "br-1", name: "NEXA Studio", logo: "/brands/nexa.svg" },
  { id: "br-2", name: "Studio Oline", logo: "/brands/oline.svg" },
  { id: "br-3", name: "Kala", logo: "/brands/kala.svg" },
  { id: "br-4", name: "SukkhaCitta", logo: "/brands/sukkhacitta.svg" },
  { id: "br-5", name: "Æther", logo: "/brands/aether.svg" },
];

export const products: Product[] = [
  {
    id: "prod-1",
    name: "Classic Linen Oversized Shirt",
    price: 489000,
    originalPrice: 589000,
    discountPercentage: 17,
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=600",
    ],
    category: "Apparel",
    brand: "NEXA Studio",
    description: "Crafted from 100% organic European flax, this oversized shirt features a structured collar, minimal hairline seams, and a curved hemline. Perfect for layering in warm climates, combining breathability with an architectural silhouette.",
    specifications: [
      { label: "Material", value: "100% Organic Linen" },
      { label: "Fit", value: "Oversized / Relaxed" },
      { label: "Origin", value: "Sourced & Crafted in Indonesia" },
      { label: "Care", value: "Hand wash cold, line dry in shade" }
    ],
    stock: 25,
    rating: 4.8,
    reviewsCount: 14,
    sellerId: "sell-1",
    sellerName: "Nexa Flagship Store",
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
  },
  {
    id: "prod-2",
    name: "Architectural Ceramic Vase No. 4",
    price: 350000,
    images: [
      "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&q=80&w=600",
    ],
    category: "Home Goods",
    brand: "Kala",
    description: "Hand-thrown stoneware vase with a raw, tactile clay finish. Featuring a distinctive dual-chambered geometry, this sculptural piece provides a bold statement even when left unoccupied. Interior is fully glazed to ensure water containment.",
    specifications: [
      { label: "Material", value: "Coarse Textured Stoneware" },
      { label: "Dimensions", value: "12cm x 12cm x 24cm" },
      { label: "Finish", value: "Matte Raw Exterior, Clear Glazed Interior" },
      { label: "Weight", value: "1.2 kg" }
    ],
    stock: 8,
    rating: 4.9,
    reviewsCount: 6,
    sellerId: "sell-2",
    sellerName: "Kala Ceramics",
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
  },
  {
    id: "prod-3",
    name: "Minimalist Leather Mule",
    price: 789000,
    originalPrice: 850000,
    discountPercentage: 7,
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?auto=format&fit=crop&q=80&w=600",
    ],
    category: "Footwear",
    brand: "Studio Oline",
    description: "An elegant, backless leather mule built on a low-stacked leather heel. Clean-cut vamp with subtle hidden stitching, offering a comfortable, glove-like fit that molds to your foot over time. Fully lined with breathable calfskin.",
    specifications: [
      { label: "Upper", value: "Premium Full-Grain Sheepskin Leather" },
      { label: "Lining", value: "Vegetable-Tanned Calfskin" },
      { label: "Sole", value: "Non-slip Stacked Leather Sole" },
      { label: "Heel Height", value: "20mm" }
    ],
    stock: 12,
    rating: 4.6,
    reviewsCount: 19,
    sellerId: "sell-3",
    sellerName: "Studio Oline",
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
  },
  {
    id: "prod-4",
    name: "Raw Canvas Tote with Leather Straps",
    price: 295000,
    images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=600",
    ],
    category: "Accessories",
    brand: "SukkhaCitta",
    description: "Heavyweight 16oz cotton canvas utility bag with hand-cut vegetable-tanned bridle leather handles. Reinforced base and double-stitched stress points. Inner hanging zip pocket keeps essentials organized.",
    specifications: [
      { label: "Material", value: "100% Unbleached Organic Cotton Canvas" },
      { label: "Strap Material", value: "Vegetable Tanned Leather (Bridle Grade)" },
      { label: "Hardware", value: "Solid Brass Rivets" },
      { label: "Dimensions", value: "40cm x 35cm x 12cm" }
    ],
    stock: 45,
    rating: 4.7,
    reviewsCount: 32,
    sellerId: "sell-4",
    sellerName: "SukkhaCitta Store",
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: true,
  },
  {
    id: "prod-5",
    name: "Botanical Soy Wax Candle - Hinoki",
    price: 220000,
    images: [
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=600",
    ],
    category: "Apothecary",
    brand: "Æther",
    description: "Scented candle with a woody profile of Japanese Hinoki cypress, cedarwood, and a touch of black pepper. Poured by hand into a reusable amber glass vessel. Uses clean-burning cotton wicks and natural soy wax.",
    specifications: [
      { label: "Ingredients", value: "100% Pure Soy Wax, Fine Fragrance Oils" },
      { label: "Burn Time", value: "Approximately 45 hours" },
      { label: "Volume", value: "220g / 7.7 oz" },
      { label: "Wick", value: "Lead-free Organic Cotton" }
    ],
    stock: 50,
    rating: 4.8,
    reviewsCount: 22,
    sellerId: "sell-5",
    sellerName: "Æther Botanicals",
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
  },
  {
    id: "prod-6",
    name: "Tailored Linen Trousers",
    price: 620000,
    originalPrice: 699000,
    discountPercentage: 11,
    images: [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=600",
    ],
    category: "Apparel",
    brand: "NEXA Studio",
    description: "High-rise linen trousers featuring a relaxed wide-leg silhouette. Designed with double front pleats, side slip pockets, and a neat buttoned waistband. Lightly washed for a soft feel right out of the box.",
    specifications: [
      { label: "Material", value: "100% Medium-weight Linen" },
      { label: "Closure", value: "Corozo Nut Button and YKK Zipper" },
      { label: "Silhouette", value: "Wide Leg / High Rise" },
      { label: "Waistband", value: "Structured with Belt Loops" }
    ],
    stock: 14,
    rating: 4.5,
    reviewsCount: 8,
    sellerId: "sell-1",
    sellerName: "Nexa Flagship Store",
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: true,
  },
  {
    id: "prod-7",
    name: "Handwoven Bamboo Pendant Lamp",
    price: 520000,
    images: [
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=600",
    ],
    category: "Home Goods",
    brand: "Kala",
    description: "Woven by traditional artisans using organic split bamboo, this pendant shade filters light into warm, textured patterns. Perfect above dining tables or bedroom centerpieces.",
    specifications: [
      { label: "Material", value: "Sustainably Harvested Bamboo" },
      { label: "Diameter", value: "38cm" },
      { label: "Cord Length", value: "1.5m adjustable textile cord" },
      { label: "Socket", value: "E27 max 40W (bulb not included)" }
    ],
    stock: 5,
    rating: 4.9,
    reviewsCount: 3,
    sellerId: "sell-2",
    sellerName: "Kala Ceramics",
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
  },
  {
    id: "prod-8",
    name: "Classic Leather Sandal - Clay",
    price: 550000,
    images: [
      "https://images.unsplash.com/photo-1562273138-f46be4ebdf33?auto=format&fit=crop&q=80&w=600",
    ],
    category: "Footwear",
    brand: "Studio Oline",
    description: "A bare-minimum strappy sandal with an adjustable ankle enclosure. Constructed from vegetable-tanned leather that develops a beautiful patina with wear. The padded footbed provides lasting daily comfort.",
    specifications: [
      { label: "Leather", value: "Vegetable-Tanned Cowhide" },
      { label: "Footbed", value: "Padded Latex Foam covered with Leather" },
      { label: "Hardware", value: "Solid brass buckle" },
      { label: "Outsole", value: "Flexible textured rubber" }
    ],
    stock: 0, // Out of stock to test warnings!
    rating: 4.7,
    reviewsCount: 11,
    sellerId: "sell-3",
    sellerName: "Studio Oline",
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
  }
];

export const reviews: Record<string, Review[]> = {
  "prod-1": [
    { id: "rev-1-1", userName: "Aditya Wardhana", rating: 5, comment: "Bahan linen tebal tapi sangat adem. Siluet oversized-nya jatuh dengan sempurna. Sangat direkomendasikan untuk pakaian kasual premium.", date: "2026-06-15" },
    { id: "rev-1-2", userName: "Siti Rahmawati", rating: 4, comment: "Ukuran agak sedikit lebih besar dari perkiraan, jadi pastikan cek size chart. Kualitas jahitannya luar biasa rapi.", date: "2026-06-12" },
    { id: "rev-1-3", userName: "Budi Santoso", rating: 5, comment: "Warna clay-nya sangat unik, jarang ditemui di pasaran. Setelah dicuci beberapa kali teksturnya malah jadi makin lembut.", date: "2026-06-08" },
  ],
  "prod-2": [
    { id: "rev-2-1", userName: "Farhan Hakim", rating: 5, comment: "Sangat berseni! Tekstur tanah liat mentahnya memberikan karakter yang kuat di ruang tamu saya.", date: "2026-06-18" },
    { id: "rev-2-2", userName: "Riana Putri", rating: 5, comment: "Pengemasan sangat tebal menggunakan box kayu kecil dan bubble wrap berlapis. Pot keramik aman tanpa cacat. Terima kasih!", date: "2026-06-14" },
  ],
  "prod-3": [
    { id: "rev-3-1", userName: "Kartika Sari", rating: 4, comment: "Kulitnya sangat lembut dan empuk di tumit. Awalnya agak ketat di punggung kaki tapi setelah dipakai 2 hari langsung melar pas.", date: "2026-06-10" },
    { id: "rev-3-2", userName: "Dimas Wibowo", rating: 5, comment: "Desain minimalis yang sangat berkelas. Cocok dipadukan dengan celana kulot atau celana bahan tailored.", date: "2026-06-04" },
  ]
};

export const vouchers = [
  { code: "NEXA10", discountType: "PERCENTAGE" as const, discountValue: 10, minOrderAmount: 200000, maxDiscountAmount: 50000, description: "Diskon 10% s.d. Rp50.000 dengan minimal pembelian Rp200.000" },
  { code: "WELCOME50", discountType: "FIXED_AMOUNT" as const, discountValue: 50000, minOrderAmount: 500000, description: "Potongan langsung Rp50.000 dengan minimal pembelian Rp500.000" },
  { code: "CLAYCLAY", discountType: "PERCENTAGE" as const, discountValue: 20, minOrderAmount: 300000, maxDiscountAmount: 100000, description: "Diskon Khusus 20% s.d. Rp100.000 dengan minimal pembelian Rp300.000" }
];

export const shippingOptions: ShippingOption[] = [
  { id: "ship-jne-reg", courier: "JNE", service: "Reguler", cost: 15000, etd: "2-3 Hari" },
  { id: "ship-jne-yes", courier: "JNE", service: "Yakin Esok Sampai (YES)", cost: 30000, etd: "1 Hari" },
  { id: "ship-jnt-reg", courier: "J&T", service: "Reguler", cost: 12000, etd: "2-4 Hari" },
  { id: "ship-sicepat-reg", courier: "SiCepat", service: "Reguler", cost: 14000, etd: "2-3 Hari" },
  { id: "ship-sicepat-gokil", courier: "SiCepat", service: "Cargo (GOKIL)", cost: 25000, etd: "3-5 Hari" }
];

// Helper to simulate network latency
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ----------------------------------------------------
// Mock Services Calls with Latency Simulation
// ----------------------------------------------------

export async function fetchProducts(filters?: {
  category?: string;
  brand?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sort?: string;
}): Promise<Product[]> {
  await delay(300);
  let list = [...products];

  if (filters?.category) {
    list = list.filter((p) => p.category.toLowerCase() === filters.category!.toLowerCase());
  }
  if (filters?.brand) {
    list = list.filter((p) => p.brand.toLowerCase() === filters.brand!.toLowerCase());
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }
  if (filters?.minPrice !== undefined) {
    list = list.filter((p) => p.price >= filters.minPrice!);
  }
  if (filters?.maxPrice !== undefined) {
    list = list.filter((p) => p.price <= filters.maxPrice!);
  }
  if (filters?.rating !== undefined) {
    list = list.filter((p) => p.rating >= filters.rating!);
  }

  // Sorting
  if (filters?.sort) {
    if (filters.sort === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (filters.sort === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (filters.sort === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (filters.sort === "newest") {
      list.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
    }
  }

  return list;
}

export async function fetchProductById(id: string): Promise<Product | null> {
  await delay(250);
  return products.find((p) => p.id === id) || null;
}

export async function fetchReviewsByProductId(productId: string): Promise<Review[]> {
  await delay(200);
  return reviews[productId] || [];
}

export async function validateVoucher(code: string): Promise<{ success: boolean; voucher?: typeof vouchers[0]; message: string }> {
  await delay(350);
  const found = vouchers.find((v) => v.code.toUpperCase() === code.toUpperCase());
  if (found) {
    return { success: true, voucher: found, message: "Voucher berhasil dipasang." };
  }
  return { success: false, message: "Kode voucher tidak valid." };
}

export async function fetchShippingRates(): Promise<ShippingOption[]> {
  await delay(200);
  return shippingOptions;
}
