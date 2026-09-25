import { PrismaClient as AuthClient } from '../apps/auth-service/src/generated/client';
import { PrismaClient as UserClient } from '../apps/user-service/src/generated/client';
import { PrismaClient as ProductClient } from '../apps/product-service/src/generated/client';
import { PrismaClient as InventoryClient } from '../apps/inventory-service/src/generated/client';
import { PrismaClient as VoucherClient } from '../apps/voucher-service/src/generated/client';
import { PrismaClient as ShippingClient } from '../apps/shipping-service/src/generated/client';
import bcrypt from 'bcryptjs';

const connectionStrings = {
  auth: 'postgresql://postgres:postgres123@localhost:5445/nexacommerce_db?schema=auth',
  users: 'postgresql://postgres:postgres123@localhost:5445/nexacommerce_db?schema=users',
  products: 'postgresql://postgres:postgres123@localhost:5445/nexacommerce_db?schema=products',
  inventory: 'postgresql://postgres:postgres123@localhost:5445/nexacommerce_db?schema=inventory',
  vouchers: 'postgresql://postgres:postgres123@localhost:5445/nexacommerce_db?schema=vouchers',
  shipping: 'postgresql://postgres:postgres123@localhost:5445/nexacommerce_db?schema=shipping',
};

const auth = new AuthClient({ datasources: { db: { url: connectionStrings.auth } } });
const users = new UserClient({ datasources: { db: { url: connectionStrings.users } } });
const products = new ProductClient({ datasources: { db: { url: connectionStrings.products } } });
const inventory = new InventoryClient({ datasources: { db: { url: connectionStrings.inventory } } });
const vouchers = new VoucherClient({ datasources: { db: { url: connectionStrings.vouchers } } });
const shipping = new ShippingClient({ datasources: { db: { url: connectionStrings.shipping } } });

async function main() {
  console.log('🌱 Starting NexaCommerce seed script...\n');

  // ─── 1. USERS (Auth) ────────────────────────────────────────────────────────
  console.log('👤 Seeding Users...');

  const passwordAdmin    = await bcrypt.hash('Admin123!', 10);
  const passwordSeller   = await bcrypt.hash('Seller123!', 10);
  const passwordCustomer = await bcrypt.hash('Customer123!', 10);
  const passwordCourier  = await bcrypt.hash('Courier123!', 10);

  const userList = [
    { name: 'Super Admin',   email: 'superadmin@nexacommerce.com', passwordHash: passwordAdmin,    role: 'ADMIN'    as any, emailVerified: true },
    { name: 'Admin',         email: 'admin@nexacommerce.com',      passwordHash: passwordAdmin,    role: 'ADMIN'    as any, emailVerified: true },
    { name: 'Seller One',    email: 'seller1@nexacommerce.com',    passwordHash: passwordSeller,   role: 'SELLER'   as any, emailVerified: true },
    { name: 'Seller Two',    email: 'seller2@nexacommerce.com',    passwordHash: passwordSeller,   role: 'SELLER'   as any, emailVerified: true },
    { name: 'Customer One',  email: 'customer1@nexacommerce.com',  passwordHash: passwordCustomer, role: 'CUSTOMER' as any, emailVerified: true },
    { name: 'Customer Two',  email: 'customer2@nexacommerce.com',  passwordHash: passwordCustomer, role: 'CUSTOMER' as any, emailVerified: true },
    { name: 'Courier User',  email: 'courier@nexacommerce.com',    passwordHash: passwordCourier,  role: 'COURIER'  as any, emailVerified: true },
  ];

  const dbUsers: any[] = [];
  for (const u of userList) {
    const user = await auth.user.upsert({
      where:  { email: u.email },
      update: u,
      create: u,
    });
    dbUsers.push(user);
    console.log(`  ✓ ${u.role.padEnd(8)} ${u.email}`);
  }

  const superAdminUser = dbUsers.find(u => u.email === 'superadmin@nexacommerce.com')!;
  const adminUser      = dbUsers.find(u => u.email === 'admin@nexacommerce.com')!;
  const seller1User    = dbUsers.find(u => u.email === 'seller1@nexacommerce.com')!;
  const seller2User    = dbUsers.find(u => u.email === 'seller2@nexacommerce.com')!;
  const customer1User  = dbUsers.find(u => u.email === 'customer1@nexacommerce.com')!;
  const customer2User  = dbUsers.find(u => u.email === 'customer2@nexacommerce.com')!;

  // ─── 2. PROFILES & ADDRESSES (User Service) ─────────────────────────────────
  console.log('\n🏠 Seeding Profiles & Addresses...');

  await users.sellerProfile.upsert({
    where:  { userId: seller1User.id },
    update: { storeName: 'Toko Elektronik Jakarta', storeDescription: 'Pusat belanja elektronik murah dan bergaransi di Jakarta.', isVerified: true, verifiedAt: new Date() },
    create: { userId: seller1User.id, storeName: 'Toko Elektronik Jakarta', storeDescription: 'Pusat belanja elektronik murah dan bergaransi di Jakarta.', isVerified: true, verifiedAt: new Date() },
  });

  await users.sellerProfile.upsert({
    where:  { userId: seller2User.id },
    update: { storeName: 'Fashion Bandung Store', storeDescription: 'Pakaian distro premium dan fashion lokal kekinian dari Bandung.', isVerified: true, verifiedAt: new Date() },
    create: { userId: seller2User.id, storeName: 'Fashion Bandung Store', storeDescription: 'Pakaian distro premium dan fashion lokal kekinian dari Bandung.', isVerified: true, verifiedAt: new Date() },
  });

  await users.userProfile.upsert({
    where:  { userId: customer1User.id },
    update: { displayName: 'Customer Satu', phone: '081234567890', gender: 'MALE' },
    create: { userId: customer1User.id, displayName: 'Customer Satu', phone: '081234567890', gender: 'MALE' },
  });

  await users.address.deleteMany({ where: { userId: customer1User.id } });
  await users.address.createMany({
    data: [
      { userId: customer1User.id, label: 'Rumah',  recipientName: 'Customer Satu', phone: '081234567890', street: 'Jl. Sudirman No. 10',   city: 'Jakarta Selatan', province: 'DKI Jakarta', postalCode: '12190', isDefault: true  },
      { userId: customer1User.id, label: 'Kantor', recipientName: 'Customer Satu', phone: '081234567890', street: 'Gedung Cyber Lt. 5',     city: 'Jakarta Selatan', province: 'DKI Jakarta', postalCode: '12710', isDefault: false },
    ],
  });

  await users.userProfile.upsert({
    where:  { userId: customer2User.id },
    update: { displayName: 'Customer Dua', phone: '089876543210', gender: 'FEMALE' },
    create: { userId: customer2User.id, displayName: 'Customer Dua', phone: '089876543210', gender: 'FEMALE' },
  });

  await users.address.deleteMany({ where: { userId: customer2User.id } });
  await users.address.createMany({
    data: [
      { userId: customer2User.id, label: 'Rumah',  recipientName: 'Customer Dua', phone: '089876543210', street: 'Jl. Dago No. 100',    city: 'Bandung',        province: 'Jawa Barat', postalCode: '40135', isDefault: true  },
      { userId: customer2User.id, label: 'Kantor', recipientName: 'Customer Dua', phone: '089876543210', street: 'Wisma Asia Lt. 10',   city: 'Jakarta Barat',  province: 'DKI Jakarta', postalCode: '11480', isDefault: false },
    ],
  });
  console.log('  ✓ Seller & customer profiles and addresses seeded.');

  // ─── 3. CATEGORIES & BRANDS (Product Service) ───────────────────────────────
  console.log('\n🏷️  Seeding Categories & Brands...');

  const categoriesList = [
    { name: 'Elektronik',         slug: 'elektronik' },
    { name: 'Fashion',            slug: 'fashion' },
    { name: 'Komputer & Laptop',  slug: 'komputer-laptop' },
    { name: 'Handphone & Tablet', slug: 'handphone-tablet' },
    { name: 'Makanan & Minuman',  slug: 'makanan-minuman' },
    { name: 'Kesehatan',          slug: 'kesehatan' },
    { name: 'Olahraga',           slug: 'olahraga' },
    { name: 'Rumah Tangga',       slug: 'rumah-tangga' },
  ];

  const dbCategories: any[] = [];
  for (const c of categoriesList) {
    const cat = await products.category.upsert({ where: { slug: c.slug }, update: c, create: c });
    dbCategories.push(cat);
  }

  const brandsList = [
    { name: 'Samsung',  slug: 'samsung' },
    { name: 'Apple',    slug: 'apple' },
    { name: 'Xiaomi',   slug: 'xiaomi' },
    { name: 'Nike',     slug: 'nike' },
    { name: 'Adidas',   slug: 'adidas' },
    { name: 'Sony',     slug: 'sony' },
    { name: 'Logitech', slug: 'logitech' },
    { name: 'Uniqlo',   slug: 'uniqlo' },
  ];

  const dbBrands: any[] = [];
  for (const b of brandsList) {
    const brnd = await products.brand.upsert({ where: { name: b.name }, update: b, create: b });
    dbBrands.push(brnd);
  }
  console.log(`  ✓ ${dbCategories.length} categories, ${dbBrands.length} brands seeded.`);

  // ─── 4. PRODUCTS (Product Service) ──────────────────────────────────────────
  console.log('\n📦 Seeding Products...');

  const getCatId   = (slug: string) => dbCategories.find(c => c.slug === slug)!.id;
  const getBrandId = (slug: string) => dbBrands.find(b => b.slug === slug)!.id;

  const productsData = [
    // ── Seller 1: Elektronik ──────────────────────────────────────────────────
    { name: 'Samsung Galaxy S24 Ultra',       slug: 'samsung-galaxy-s24-ultra',      description: 'Flagship smartphone terbaru dari Samsung dengan AI terintegrasi dan kamera 200MP.', price: 19999000, categoryId: getCatId('handphone-tablet'),  brandId: getBrandId('samsung'),  sku: 'SG-S24U-512', weight: 232,  sellerId: seller1User.id },
    { name: 'MacBook Air M3',                 slug: 'macbook-air-m3',                description: 'Laptop super tipis dan ringan ditenagai chip Apple M3 yang andal untuk produktivitas.', price: 17499000, categoryId: getCatId('komputer-laptop'),   brandId: getBrandId('apple'),    sku: 'AP-MBA-M3',   weight: 1240, sellerId: seller1User.id },
    { name: 'Sony WH-1000XM5',               slug: 'sony-wh-1000xm5',               description: 'Headphone wireless dengan noise cancelling terbaik di kelasnya, baterai 30 jam.', price: 4999000,  categoryId: getCatId('elektronik'),        brandId: getBrandId('sony'),     sku: 'SN-XM5-WRLS', weight: 250,  sellerId: seller1User.id },
    { name: 'Logitech MX Master 3S',          slug: 'logitech-mx-master-3s',         description: 'Mouse wireless premium untuk produktivitas tinggi, kompatibel multi-device.', price: 1499000,  categoryId: getCatId('komputer-laptop'),   brandId: getBrandId('logitech'), sku: 'LT-MX3S-MSE', weight: 141,  sellerId: seller1User.id },
    { name: 'iPad Pro M4 11 Inch',            slug: 'ipad-pro-m4-11',                description: 'Tablet profesional tertipis dengan layar Tandem OLED super cerah dan chip M4.', price: 14999000, categoryId: getCatId('handphone-tablet'),  brandId: getBrandId('apple'),    sku: 'AP-IPP-M4',   weight: 444,  sellerId: seller1User.id },
    { name: 'Samsung Galaxy Watch 6',         slug: 'samsung-galaxy-watch-6',        description: 'Smartwatch pendamping kebugaran terbaik dengan sensor komposisi tubuh canggih.', price: 3999000,  categoryId: getCatId('elektronik'),        brandId: getBrandId('samsung'),  sku: 'SG-GW6-SMW',  weight: 50,   sellerId: seller1User.id },
    { name: 'Xiaomi Redmi Note 13 Pro',       slug: 'xiaomi-redmi-note-13-pro',      description: 'Smartphone mid-range dengan kamera 200MP ultra jernih dan pengisian 67W.', price: 3299000,  categoryId: getCatId('handphone-tablet'),  brandId: getBrandId('xiaomi'),   sku: 'XM-RN13P-8',  weight: 187,  sellerId: seller1User.id },
    { name: 'Logitech G Pro X Superlight',    slug: 'logitech-g-pro-x-superlight',   description: 'Mouse gaming ultra-ringan pilihan para atlet e-sports profesional dunia.', price: 1899000,  categoryId: getCatId('komputer-laptop'),   brandId: getBrandId('logitech'), sku: 'LT-GPXS-GMSE', weight: 63,  sellerId: seller1User.id },
    { name: 'Sony A7 IV Camera',              slug: 'sony-a7-iv-camera',             description: 'Kamera mirrorless hybrid full-frame 33MP untuk foto dan video profesional.', price: 29999000, categoryId: getCatId('elektronik'),        brandId: getBrandId('sony'),     sku: 'SN-A7M4-BODY', weight: 658, sellerId: seller1User.id },
    { name: 'Samsung 32 Inch Smart Monitor',  slug: 'samsung-32-smart-monitor',      description: 'Monitor serbaguna dengan aplikasi smart TV internal, panel IPS 4K.', price: 5499000,  categoryId: getCatId('komputer-laptop'),   brandId: getBrandId('samsung'),  sku: 'SG-SM32-MON', weight: 6400, sellerId: seller1User.id },

    // ── Seller 2: Fashion & Olahraga ──────────────────────────────────────────
    { name: 'Nike Air Force 1 Low',           slug: 'nike-air-force-1-low',          description: 'Sepatu sneaker legendaris yang stylish dan nyaman untuk aktivitas harian.', price: 1549000,  categoryId: getCatId('fashion'),           brandId: getBrandId('nike'),     sku: 'NK-AF1-LOW',   weight: 900, sellerId: seller2User.id },
    { name: 'Adidas Ultraboost Light',        slug: 'adidas-ultraboost-light',       description: 'Sepatu lari premium dengan kenyamanan bantalan boost teringan dari Adidas.', price: 2800000,  categoryId: getCatId('olahraga'),          brandId: getBrandId('adidas'),   sku: 'AD-UBLT-RUN',  weight: 800, sellerId: seller2User.id },
    { name: 'Uniqlo AIRism Crew Neck T-Shirt',slug: 'uniqlo-airism-crew-neck',       description: 'Kaos polos adem dengan teknologi serat kain AIRism eksklusif anti lembap.', price: 149000,   categoryId: getCatId('fashion'),           brandId: getBrandId('uniqlo'),   sku: 'UQ-ARSM-TSH',  weight: 150, sellerId: seller2User.id },
    { name: 'Nike Dri-FIT Running Shorts',    slug: 'nike-dri-fit-running-shorts',   description: 'Celana pendek lari bersirkulasi udara dengan material Dri-FIT cepat kering.', price: 449000,   categoryId: getCatId('olahraga'),          brandId: getBrandId('nike'),     sku: 'NK-DFSH-RUN',  weight: 120, sellerId: seller2User.id },
    { name: 'Adidas Originals Superstar',     slug: 'adidas-originals-superstar',    description: 'Sneaker shell-toe klasik dengan gaya retro streetwear yang selalu hits.', price: 1600000,  categoryId: getCatId('fashion'),           brandId: getBrandId('adidas'),   sku: 'AD-SSTAR-CLS', weight: 850, sellerId: seller2User.id },
    { name: 'Uniqlo Ultra Light Down Jacket', slug: 'uniqlo-ultra-light-down-jacket',description: 'Jaket bulu angsa ultra ringan yang hangat dan mudah dilipat ke kantong.', price: 799000,   categoryId: getCatId('fashion'),           brandId: getBrandId('uniqlo'),   sku: 'UQ-ULDJ-WNT',  weight: 300, sellerId: seller2User.id },
    { name: 'Nike Air Max 90',                slug: 'nike-air-max-90',               description: 'Sneaker ikonik dengan bantalan udara Max Air yang khas dan legendaris.', price: 1899000,  categoryId: getCatId('fashion'),           brandId: getBrandId('nike'),     sku: 'NK-AM90-CLS',  weight: 950, sellerId: seller2User.id },
    { name: 'Adidas Running Cap',             slug: 'adidas-running-cap',            description: 'Topi lari ringan berteknologi menyerap keringat untuk olahraga outdoor.', price: 299000,   categoryId: getCatId('olahraga'),          brandId: getBrandId('adidas'),   sku: 'AD-RNCAP-ACC', weight: 80,  sellerId: seller2User.id },
    { name: 'Uniqlo Kando Pants',             slug: 'uniqlo-kando-pants',            description: 'Celana panjang formal ultra elastis, ringan, dan cepat kering untuk kantor.', price: 599000,   categoryId: getCatId('fashion'),           brandId: getBrandId('uniqlo'),   sku: 'UQ-KNDP-FRM',  weight: 350, sellerId: seller2User.id },
    { name: 'Nike Sportswear Club Hoodie',    slug: 'nike-sportswear-club-hoodie',   description: 'Jaket hoodie fleece tebal dan lembut untuk kehangatan sepanjang hari.', price: 899000,   categoryId: getCatId('fashion'),           brandId: getBrandId('nike'),     sku: 'NK-NSCH-HD',   weight: 600, sellerId: seller2User.id },
  ];

  const productImages: Record<string, string> = {
    'samsung-galaxy-s24-ultra':      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400&h=500',
    'macbook-air-m3':                'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400&h=500',
    'sony-wh-1000xm5':              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400&h=500',
    'logitech-mx-master-3s':         'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&q=80&w=400&h=500',
    'ipad-pro-m4-11':                'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=400&h=500',
    'samsung-galaxy-watch-6':        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400&h=500',
    'xiaomi-redmi-note-13-pro':      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=400&h=500',
    'logitech-g-pro-x-superlight':   'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80&w=400&h=500',
    'sony-a7-iv-camera':             'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400&h=500',
    'samsung-32-smart-monitor':      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=400&h=500',
    'nike-air-force-1-low':          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400&h=500',
    'adidas-ultraboost-light':       'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=400&h=500',
    'uniqlo-airism-crew-neck':       'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400&h=500',
    'nike-dri-fit-running-shorts':   'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=400&h=500',
    'adidas-originals-superstar':    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=400&h=500',
    'uniqlo-ultra-light-down-jacket':'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=400&h=500',
    'nike-air-max-90':               'https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&q=80&w=400&h=500',
    'adidas-running-cap':            'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=400&h=500',
    'uniqlo-kando-pants':            'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=400&h=500',
    'nike-sportswear-club-hoodie':   'https://images.unsplash.com/photo-1556821840-3a63f15732ce?auto=format&fit=crop&q=80&w=400&h=500',
  };

  const dbProducts: any[] = [];
  for (const p of productsData) {
    const prod = await products.product.upsert({
      where:  { slug: p.slug },
      update: { name: p.name, description: p.description, price: p.price, stock: 50, status: 'ACTIVE', categoryId: p.categoryId, brandId: p.brandId, sku: p.sku, weight: p.weight, sellerId: p.sellerId },
      create: { name: p.name, slug: p.slug, description: p.description, price: p.price, stock: 50, status: 'ACTIVE', categoryId: p.categoryId, brandId: p.brandId, sku: p.sku, weight: p.weight, sellerId: p.sellerId },
    });

    await products.productImage.deleteMany({ where: { productId: prod.id } });
    await products.productImage.create({
      data: { productId: prod.id, url: productImages[p.slug] ?? `https://placehold.co/400x500/e7e3dc/14110f?text=${encodeURIComponent(p.name)}`, alt: p.name, isMain: true, sortOrder: 0 },
    });

    dbProducts.push(prod);
    console.log(`  ✓ [${prod.sku}] ${prod.name}`);
  }

  // ─── 5. INVENTORY ────────────────────────────────────────────────────────────
  console.log('\n📊 Seeding Inventory...');
  for (const prod of dbProducts) {
    await inventory.inventory.upsert({
      where:  { productId: prod.id },
      update: { currentStock: 50, availableStock: 50, reservedStock: 0, lowStockThreshold: 10, sku: prod.sku },
      create: { productId: prod.id, sku: prod.sku, currentStock: 50, availableStock: 50, reservedStock: 0, lowStockThreshold: 10 },
    });
  }
  console.log(`  ✓ Inventory initialized for ${dbProducts.length} products.`);

  // ─── 6. VOUCHERS ─────────────────────────────────────────────────────────────
  console.log('\n🎟️  Seeding Vouchers...');
  const now      = new Date();
  const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

  const vouchersData = [
    { code: 'WELCOME10', type: 'PERCENTAGE',  value: 10,    minPurchase: 200000, maxDiscount: 50000,  usageLimit: 1000, usageLimitPerUser: 1, scope: 'ALL',      startsAt: now, endsAt: nextYear, status: 'ACTIVE', createdBy: adminUser.id },
    { code: 'DISKON25K', type: 'FIXED_AMOUNT', value: 25000, minPurchase: 150000, maxDiscount: 25000,  usageLimit: 500,  usageLimitPerUser: 1, scope: 'ALL',      startsAt: now, endsAt: nextYear, status: 'ACTIVE', createdBy: adminUser.id },
    { code: 'FASHION15', type: 'PERCENTAGE',  value: 15,    minPurchase: 0,      maxDiscount: 75000,  usageLimit: 200,  usageLimitPerUser: 1, scope: 'CATEGORY', scopeReferenceId: getCatId('fashion'), startsAt: now, endsAt: nextYear, status: 'ACTIVE', createdBy: adminUser.id },
    { code: 'ELEKTRO20', type: 'PERCENTAGE',  value: 20,    minPurchase: 500000, maxDiscount: 200000, usageLimit: 100,  usageLimitPerUser: 1, scope: 'CATEGORY', scopeReferenceId: getCatId('elektronik'), startsAt: now, endsAt: nextYear, status: 'ACTIVE', createdBy: adminUser.id },
    { code: 'GRATIS50K', type: 'FIXED_AMOUNT', value: 50000, minPurchase: 500000, maxDiscount: 50000,  usageLimit: 300,  usageLimitPerUser: 2, scope: 'ALL',      startsAt: now, endsAt: nextYear, status: 'ACTIVE', createdBy: superAdminUser.id },
  ];

  for (const v of vouchersData) {
    await vouchers.voucher.upsert({ where: { code: v.code }, update: v, create: v });
    console.log(`  ✓ Voucher ${v.code} (${v.type === 'PERCENTAGE' ? v.value + '%' : 'Rp' + v.value.toLocaleString('id-ID')} off)`);
  }

  // Synthetic rates exist only for explicitly opted-in development/demo databases.
  const allowDemoShippingRates = process.env.ALLOW_DEMO_SHIPPING_RATES === 'true';
  if (allowDemoShippingRates && process.env.NODE_ENV === 'production') {
    throw new Error('Synthetic shipping rates cannot be seeded in production');
  }

  if (!allowDemoShippingRates) {
    console.log('\n🚚 Skipping synthetic shipping rates; configure verified rates before enabling checkout.');
  } else {
  // ─── 7. DEMO-ONLY COURIERS & SHIPPING RATES ───────────────────────────────────
  console.log('\n🚚 Seeding demo couriers & synthetic shipping rates...');

  const couriersData = [
    {
      name: 'JNE',
      code: 'jne',
      services: [
        { code: 'REG',  name: 'Reguler',       estimatedDays: '2-3' },
        { code: 'YES',  name: 'Yakin Esok Sampai', estimatedDays: '1' },
        { code: 'OKE',  name: 'Ongkos Kirim Ekonomis', estimatedDays: '4-7' },
      ],
    },
    {
      name: 'J&T Express',
      code: 'jnt',
      services: [
        { code: 'EZ',   name: 'J&T EZ',        estimatedDays: '2-4' },
        { code: 'ECO',  name: 'J&T Economy',   estimatedDays: '5-7' },
      ],
    },
    {
      name: 'SiCepat',
      code: 'sicepat',
      services: [
        { code: 'REG',  name: 'Reguler',        estimatedDays: '2-4' },
        { code: 'BEST', name: 'Best',            estimatedDays: '1-2' },
        { code: 'HALU', name: 'Halu',            estimatedDays: '1' },
      ],
    },
    {
      name: 'Anteraja',
      code: 'anteraja',
      services: [
        { code: 'REG',  name: 'Reguler',        estimatedDays: '2-4' },
        { code: 'ND',   name: 'Next Day',       estimatedDays: '1' },
      ],
    },
    {
      name: 'Pos Indonesia',
      code: 'pos',
      services: [
        { code: 'POS',  name: 'Pos Reguler',   estimatedDays: '5-14' },
        { code: 'SKH',  name: 'Pos Kilat Khusus', estimatedDays: '2-4' },
      ],
    },
  ];

  const dbCouriers: any[] = [];
  for (const c of couriersData) {
    const courier = await shipping.courier.upsert({
      where:  { code: c.code },
      update: { name: c.name, services: c.services, isActive: true },
      create: { name: c.name, code: c.code, services: c.services, isActive: true },
    });
    dbCouriers.push(courier);
    console.log(`  ✓ Courier: ${c.name} (${c.services.length} layanan)`);
  }

  // Shipping rate matrix: origin → destination → service → cost
  // Kota yang di-cover: Jakarta, Bandung, Surabaya, Yogyakarta, Medan, Makassar
  const cities = ['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Medan', 'Makassar'];

  // Biaya ongkir per kg (dalam rupiah) berdasarkan jarak
  const rateMatrix: Record<string, Record<string, number>> = {
    'Jakarta':    { 'Jakarta': 8000,  'Bandung': 12000, 'Surabaya': 17000, 'Yogyakarta': 15000, 'Medan': 25000, 'Makassar': 28000 },
    'Bandung':    { 'Jakarta': 12000, 'Bandung': 8000,  'Surabaya': 18000, 'Yogyakarta': 13000, 'Medan': 26000, 'Makassar': 29000 },
    'Surabaya':   { 'Jakarta': 17000, 'Bandung': 18000, 'Surabaya': 8000,  'Yogyakarta': 12000, 'Medan': 27000, 'Makassar': 22000 },
    'Yogyakarta': { 'Jakarta': 15000, 'Bandung': 13000, 'Surabaya': 12000, 'Yogyakarta': 8000,  'Medan': 26000, 'Makassar': 24000 },
    'Medan':      { 'Jakarta': 25000, 'Bandung': 26000, 'Surabaya': 27000, 'Yogyakarta': 26000, 'Medan': 8000,  'Makassar': 30000 },
    'Makassar':   { 'Jakarta': 28000, 'Bandung': 29000, 'Surabaya': 22000, 'Yogyakarta': 24000, 'Medan': 30000, 'Makassar': 8000  },
  };

  // Multiplier per layanan relatif terhadap harga REG
  const serviceMultiplier: Record<string, number> = {
    'REG': 1.0,
    'YES': 2.0,
    'OKE': 0.7,
    'EZ':  1.0,
    'ECO': 0.7,
    'BEST': 1.5,
    'HALU': 1.8,
    'ND':  1.8,
    'POS': 0.65,
    'SKH': 1.1,
  };

  const etdMap: Record<string, string> = {
    'REG': '2-4 hari', 'YES': '1 hari', 'OKE': '4-7 hari',
    'EZ': '2-4 hari', 'ECO': '5-7 hari',
    'BEST': '1-2 hari', 'HALU': '1 hari',
    'ND': '1 hari',
    'POS': '5-14 hari', 'SKH': '2-4 hari',
  };

  // Berat referensi: 1000g (1kg)
  const referenceWeight = 1000;

  let rateCount = 0;
  for (const courier of dbCouriers) {
    const courierDef = couriersData.find(c => c.code === courier.code)!;
    for (const origin of cities) {
      for (const destination of cities) {
        const baseRate = rateMatrix[origin][destination];
        for (const service of courierDef.services) {
          const cost = Math.round(baseRate * (serviceMultiplier[service.code] ?? 1.0));
          await shipping.shippingRate.upsert({
            where: {
              // Composite unique — buat unique constraint dengan raw delete+insert jika tidak ada index
              id: `${courier.code}-${origin}-${destination}-${service.code}`.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
            },
            update: { cost, estimatedDays: etdMap[service.code] ?? '2-5 hari' },
            create: {
              id:              `${courier.code}-${origin}-${destination}-${service.code}`.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
              courierId:       courier.id,
              originCity:      origin,
              destinationCity: destination,
              serviceCode:     service.code,
              weight:          referenceWeight,
              cost,
              estimatedDays:   etdMap[service.code] ?? '2-5 hari',
            },
          });
          rateCount++;
        }
      }
    }
  }
  console.log(`  ✓ ${rateCount} shipping rates seeded (${cities.length}×${cities.length} kota, ${dbCouriers.length} kurir).`);
  }

  // ─── SUMMARY ─────────────────────────────────────────────────────────────────
  console.log('\n✅ Seeding selesai!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  AKUN YANG TERSEDIA:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  [ADMIN]    superadmin@nexacommerce.com  | Admin123!');
  console.log('  [ADMIN]    admin@nexacommerce.com       | Admin123!');
  console.log('  [SELLER]   seller1@nexacommerce.com     | Seller123!');
  console.log('  [SELLER]   seller2@nexacommerce.com     | Seller123!');
  console.log('  [CUSTOMER] customer1@nexacommerce.com   | Customer123!');
  console.log('  [CUSTOMER] customer2@nexacommerce.com   | Customer123!');
  console.log('  [COURIER]  courier@nexacommerce.com     | Courier123!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  VOUCHER CODES: WELCOME10 | DISKON25K | FASHION15 | ELEKTRO20 | GRATIS50K');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await auth.$disconnect();
    await users.$disconnect();
    await products.$disconnect();
    await inventory.$disconnect();
    await vouchers.$disconnect();
    await shipping.$disconnect();
  });
