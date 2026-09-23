const BASE_URL = 'http://localhost:3000/api/v1';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function logSuccess(message) {
  console.log(`${colors.green}✔ SUCCESS: ${message}${colors.reset}`);
}

function logError(message, err) {
  console.error(`${colors.red}✘ ERROR: ${message}${colors.reset}`);
  if (err) console.error(err);
}

function logStep(message) {
  console.log(`\n${colors.cyan}--- ${message} ---${colors.reset}`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message || 'Assertion failed'}: expected "${expected}" (type ${typeof expected}), got "${actual}" (type ${typeof actual})`);
  }
}

async function runTests() {
  logStep('Starting E2E Integration Tests for NexaCommerce Stage 3');

  let customerToken = null;
  let adminToken = null;
  let sellerToken = null;
  let sellerId = null;

  let testProductId = null;
  let testCategoryId = null;
  let testBrandId = null;
  let addressId = null;

  const timestamp = Date.now();
  let voucherPercentageCode = `DISCOUNT50_${timestamp}`;
  let voucherFixedCode = `POTONG10K_${timestamp}`;
  let voucherPercentageId = null;

  const customerEmail = `customer.s3.${timestamp}@example.com`;
  const sellerEmail = `seller.s3.${timestamp}@example.com`;
  const adminEmail = `admin.s3.${timestamp}@example.com`;
  const password = 'password123';

  try {
    // ----------------------------------------------------
    // 1. HEALTH CHECKS
    // ----------------------------------------------------
    logStep('1. Health Checks');
    const gatewayHealth = await fetch('http://localhost:3000/health').then(r => r.json());
    assertEqual(gatewayHealth.status, 'UP', 'Gateway is not UP');
    logSuccess('Gateway health check passed');

    const authHealth = await fetch(`${BASE_URL}/auth/health`).then(r => r.json());
    assertEqual(authHealth.status, 'UP', 'Auth service is not UP');
    logSuccess('Auth Service health check passed');

    // ----------------------------------------------------
    // 2. SETUP USERS & AUTHENTICATION
    // ----------------------------------------------------
    logStep('2. Setup Users & Authentication');

    // Register Customer
    const regCust = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'S3 Customer', email: customerEmail, password, role: 'CUSTOMER' }),
    }).then(r => r.json());
    assert(regCust.success, 'Customer registration failed');
    await fetch(`${BASE_URL}/auth/verify-email?token=${regCust.data.emailVerificationToken}`, { method: 'POST' });

    // Register Seller
    const regSel = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'S3 Seller', email: sellerEmail, password, role: 'SELLER' }),
    }).then(r => r.json());
    assert(regSel.success, 'Seller registration failed');
    await fetch(`${BASE_URL}/auth/verify-email?token=${regSel.data.emailVerificationToken}`, { method: 'POST' });

    // Register Admin
    const regAdm = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'S3 Admin', email: adminEmail, password, role: 'ADMIN' }),
    }).then(r => r.json());
    assert(regAdm.success, 'Admin registration failed');
    await fetch(`${BASE_URL}/auth/verify-email?token=${regAdm.data.emailVerificationToken}`, { method: 'POST' });

    // Login all
    const logCust = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: customerEmail, password }),
    }).then(r => r.json());
    customerToken = logCust.data.accessToken;

    const logSel = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: sellerEmail, password }),
    }).then(r => r.json());
    sellerToken = logSel.data.accessToken;

    // Create seller profile
    const selProfile = await fetch(`${BASE_URL}/users/seller-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sellerToken}` },
      body: JSON.stringify({ storeName: `Shop S3 ${timestamp}`, storeDescription: 'Stage 3 shop' }),
    }).then(async r => {
      const data = await r.json();
      if (!r.ok) {
        console.error('Seller profile creation failed details:', data);
      }
      return data;
    });
    assert(selProfile.success, 'Seller profile creation failed');
    sellerId = selProfile.data.userId;

    const logAdm = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password }),
    }).then(r => r.json());
    adminToken = logAdm.data.accessToken;

    logSuccess('Authentication setup completed');

    // ----------------------------------------------------
    // 3. SEED CATEGORY, BRAND, PRODUCT AND INVENTORY
    // ----------------------------------------------------
    logStep('3. Setup Catalog and Stock');

    // Create Category
    const catRes = await fetch(`${BASE_URL}/products/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ name: `S3 Category ${timestamp}`, slug: `s3-cat-${timestamp}` }),
    }).then(r => r.json());
    assert(catRes.success, 'Category creation failed');
    testCategoryId = catRes.data.id;

    // Create Brand
    const brandRes = await fetch(`${BASE_URL}/products/brands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ name: `S3 Brand ${timestamp}`, slug: `s3-brand-${timestamp}` }),
    }).then(r => r.json());
    assert(brandRes.success, 'Brand creation failed');
    testBrandId = brandRes.data.id;

    // Create Product (by Seller)
    const prodRes = await fetch(`${BASE_URL}/products/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sellerToken}` },
      body: JSON.stringify({
        name: 'Stage 3 Laptop Pro',
        slug: `stage-3-laptop-pro-${timestamp}`,
        description: 'Developer laptop',
        price: 20000,
        categoryId: testCategoryId,
        brandId: testBrandId,
        sku: `S3-LAP-${timestamp}`,
        weight: 1500,
        sellerId
      }),
    }).then(async r => {
      const data = await r.json();
      if (!r.ok) {
        console.error('Product creation failed details:', data);
      }
      return data;
    });
    assert(prodRes.success, 'Product creation failed');
    testProductId = prodRes.data.id;

    // Set Product image
    await fetch(`${BASE_URL}/products/products/${testProductId}/images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sellerToken}` },
      body: JSON.stringify({ url: 'https://example.com/laptop.jpg', alt: 'Laptop alt', sortOrder: 0, isMain: true }),
    });

    // Moderate/Activate product (by Admin)
    await fetch(`${BASE_URL}/products/products/${testProductId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ status: 'ACTIVE' }),
    });

    // Initialize Stock (by Seller)
    const initStock = await fetch(`${BASE_URL}/inventory/initialize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sellerToken}` },
      body: JSON.stringify({ productId: testProductId, initialStock: 50, lowStockThreshold: 5 }),
    }).then(r => r.json());
    assert(initStock.success, 'Inventory initialization failed');

    // Create Customer shipping address
    const addrRes = await fetch(`${BASE_URL}/users/me/addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` },
      body: JSON.stringify({
        label: 'Home',
        recipientName: 'S3 Customer',
        phone: '081234567890',
        street: 'Sudirman Street No. 42',
        city: 'South Jakarta',
        province: 'DKI Jakarta',
        postalCode: '12345',
        isDefault: true
      }),
    }).then(r => r.json());
    assert(addrRes.success, 'Address creation failed');
    addressId = addrRes.data.id;

    logSuccess('Catalog and stock seeded');

    // ----------------------------------------------------
    // 4. VOUCHER CREATION & VALIDATION
    // ----------------------------------------------------
    logStep('4. Voucher Setup');

    // Admin creates percentage voucher
    const voucher1 = await fetch(`${BASE_URL}/vouchers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        code: voucherPercentageCode,
        type: 'PERCENTAGE',
        value: 10, // 10%
        minPurchase: 10000,
        maxDiscount: 5000,
        usageLimit: 100,
        usageLimitPerUser: 1,
        startsAt: new Date(Date.now() - 10000).toISOString(), // active
        endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        scope: 'ALL',
        status: 'ACTIVE'
      }),
    }).then(async r => {
      const data = await r.json();
      if (!r.ok) console.error('Voucher 1 creation failed details:', data);
      return data;
    });
    assert(voucher1.success, 'Voucher creation failed');
    voucherPercentageId = voucher1.data.id;

    // Admin creates fixed amount voucher
    const voucher2 = await fetch(`${BASE_URL}/vouchers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        code: voucherFixedCode,
        type: 'FIXED_AMOUNT',
        value: 10000, // Rp10.000
        minPurchase: 15000,
        usageLimit: 100,
        usageLimitPerUser: 2,
        startsAt: new Date(Date.now() - 10000).toISOString(),
        endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        scope: 'ALL',
        status: 'ACTIVE'
      }),
    }).then(async r => {
      const data = await r.json();
      if (!r.ok) console.error('Voucher 2 creation failed details:', data);
      return data;
    });
    assert(voucher2.success, 'Fixed Voucher creation failed');

    // Public/Auth get vouchers list
    const vouchersList = await fetch(`${BASE_URL}/vouchers`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    }).then(r => r.json());
    assert(vouchersList.success && vouchersList.data.vouchers.length >= 2, 'Failed to fetch vouchers list');

    // Customer voucher validation
    const validateRes = await fetch(`${BASE_URL}/vouchers/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` },
      body: JSON.stringify({
        code: voucherPercentageCode,
        items: [
          { price: 20000, quantity: 1, categoryId: testCategoryId, sellerId }
        ]
      }),
    }).then(r => r.json());
    assert(validateRes.success, 'Voucher validation failed');
    assertEqual(Number(validateRes.data.discountAmount), 2000, 'Discount calculation failed (10% of 20000 = 2000)');

    logSuccess('Voucher creation and validation passed');

    // ----------------------------------------------------
    // 5. CART OPERATIONS
    // ----------------------------------------------------
    logStep('5. Cart Operations');

    // Add item to cart
    const addToCart = await fetch(`${BASE_URL}/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` },
      body: JSON.stringify({ productId: testProductId, quantity: 2 }),
    }).then(async r => {
      const data = await r.json();
      if (!r.ok) {
        console.error('Adding item to cart failed details:', data);
      }
      return data;
    });
    assert(addToCart.success, 'Adding item to cart failed');

    // Get Cart & Validate prices and flags
    const getCart = await fetch(`${BASE_URL}/cart`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    }).then(r => r.json());
    assert(getCart.success && getCart.data.items.length === 1, 'Failed to get cart items');
    assertEqual(getCart.data.items[0].productId, testProductId, 'Cart item productId mismatch');
    assertEqual(getCart.data.items[0].quantity, 2, 'Cart item quantity mismatch');
    assertEqual(Number(getCart.data.items[0].price), 20000, 'Cart item price mismatch');
    assert(!getCart.data.items[0].outOfStock, 'Product flagged outOfStock');

    // Patch quantity
    const patchCart = await fetch(`${BASE_URL}/cart/items/${testProductId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` },
      body: JSON.stringify({ quantity: 3 }),
    }).then(r => r.json());
    assert(patchCart.success, 'Patching cart quantity failed');

    const getCartAfterPatch = await fetch(`${BASE_URL}/cart`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    }).then(r => r.json());
    assertEqual(getCartAfterPatch.data.items[0].quantity, 3, 'Cart quantity patch didn\'t register');

    logSuccess('Cart operations (Add, Get, Patch) passed');

    // ----------------------------------------------------
    // 6. E2E CHECKOUT ORCHESTRATION WITH SUCCESSFUL PAYMENT
    // ----------------------------------------------------
    logStep('6. E2E Checkout Flow & Settlement Webhook');

    // Perform Checkout
    const checkoutRes = await fetch(`${BASE_URL}/orders/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` },
      body: JSON.stringify({
        shippingAddressId: addressId,
        voucherCode: voucherPercentageCode,
        courierName: 'JNE',
        courierService: 'REG',
        shippingCost: 5000,
        notes: 'Fragile!'
      }),
    }).then(r => r.json());
    assert(checkoutRes.success, 'Checkout failed');

    const { order, payment } = checkoutRes.data;
    assert(order && order.id, 'Checkout response missing order details');
    assert(payment && payment.id, 'Checkout response missing payment details');
    assertEqual(order.status, 'PENDING_PAYMENT', 'Order status should be PENDING_PAYMENT');
    assertEqual(payment.status, 'PENDING', 'Payment status should be PENDING');

    // Total = (20000 * 3) - 5000 (percentage voucher cap) + 5000 (shippingCost) = 60000
    assertEqual(Number(order.grandTotal), 60000, 'Grand total calculation failed');

    // Verify Cart cleared
    const getCartAfterCheckout = await fetch(`${BASE_URL}/cart`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    }).then(r => r.json());
    assertEqual(getCartAfterCheckout.data.items.length, 0, 'Cart should be empty after checkout');

    // Check stock RESERVED: initialized: 50. Checked out: 3. availableStock: 47, reservedStock: 3, currentStock: 50
    const stockCheck = await fetch(`${BASE_URL}/inventory/${testProductId}`).then(r => r.json());
    assertEqual(stockCheck.data.availableStock, 47, 'availableStock should be 47');
    assertEqual(stockCheck.data.reservedStock, 3, 'reservedStock should be 3');
    assertEqual(stockCheck.data.currentStock, 50, 'currentStock should be 50');
    logSuccess('Orchestrator database records and stock reservations created successfully');

    // Simulate Midtrans Webhook Notification callback (settlement)
    // signature_key is bypassable using 'mock-signature'
    const webhookRes = await fetch(`${BASE_URL}/payments/webhook/midtrans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: order.id,
        transaction_status: 'settlement',
        status_code: '200',
        gross_amount: '60000.00',
        signature_key: 'mock-signature',
        transaction_id: 'midtrans-test-uuid-12345',
        settlement_time: new Date().toISOString()
      }),
    }).then(r => r.json());
    assert(webhookRes.success, 'Webhook simulation failed');

    // Wait for RabbitMQ async event propagation (e.g. status changes downstream)
    await sleep(2000);

    // Verify payment PAID
    const getPayment = await fetch(`${BASE_URL}/payments/order/${order.id}`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    }).then(r => r.json());
    assertEqual(getPayment.data.status, 'PAID', 'Payment status should have updated to PAID');

    // Verify order PAID
    const getOrder = await fetch(`${BASE_URL}/orders/${order.id}`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    }).then(r => r.json());
    assertEqual(getOrder.data.status, 'PAID', 'Order status should have updated to PAID');

    // Verify stock CONFIRMED: currentStock: 47, reservedStock: 0, availableStock: 47
    const stockAfterSettlement = await fetch(`${BASE_URL}/inventory/${testProductId}`).then(r => r.json());
    assertEqual(stockAfterSettlement.data.availableStock, 47, 'availableStock should remain 47');
    assertEqual(stockAfterSettlement.data.reservedStock, 0, 'reservedStock should be 0');
    assertEqual(stockAfterSettlement.data.currentStock, 47, 'currentStock should have decremented to 47');

    logSuccess('E2E Checkout and Webhook settlement process completed successfully');

    // ----------------------------------------------------
    // 7. CANCELLATION FLOW (STOCK RELEASE & COMPENSATIONS)
    // ----------------------------------------------------
    logStep('7. Cancellation Flow & Stock Release');

    // Add back to cart and checkout new order
    await fetch(`${BASE_URL}/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` },
      body: JSON.stringify({ productId: testProductId, quantity: 2 }),
    });

    const checkout2 = await fetch(`${BASE_URL}/orders/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` },
      body: JSON.stringify({
        shippingAddressId: addressId,
        voucherCode: voucherFixedCode, // Use fixed promo
        courierName: 'JNE',
        courierService: 'REG',
        shippingCost: 5000
      }),
    }).then(r => r.json());
    assert(checkout2.success, 'Checkout 2 failed');
    const order2 = checkout2.data.order;

    // Verify stocks reserved (availableStock: 45, reservedStock: 2, currentStock: 47)
    const stockBeforeCancel = await fetch(`${BASE_URL}/inventory/${testProductId}`).then(r => r.json());
    assertEqual(stockBeforeCancel.data.availableStock, 45, 'availableStock should be 45');
    assertEqual(stockBeforeCancel.data.reservedStock, 2, 'reservedStock should be 2');

    // Cancel order
    const cancelRes = await fetch(`${BASE_URL}/orders/${order2.id}/cancel`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` },
      body: JSON.stringify({ reason: 'Changed mind' }),
    }).then(r => r.json());
    assert(cancelRes.success, 'Cancel order endpoint failed');

    // Wait for event propagation
    await sleep(2000);

    // Verify stock is RELEASED (availableStock: 47, reservedStock: 0, currentStock: 47)
    const stockAfterCancel = await fetch(`${BASE_URL}/inventory/${testProductId}`).then(r => r.json());
    assertEqual(stockAfterCancel.data.availableStock, 47, 'availableStock should be restored to 47');
    assertEqual(stockAfterCancel.data.reservedStock, 0, 'reservedStock should be released to 0');
    assertEqual(stockAfterCancel.data.currentStock, 47, 'currentStock should remain 47');

    logSuccess('Stock release compensation on order cancel passed');

    // ----------------------------------------------------
    // 8. EXPIRE FLOW (WEBHOOK EXPIRED -> CANCELLED & RELEASE)
    // ----------------------------------------------------
    logStep('8. Expire Flow');

    // Add back to cart and checkout new order
    await fetch(`${BASE_URL}/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` },
      body: JSON.stringify({ productId: testProductId, quantity: 5 }),
    });

    const checkout3 = await fetch(`${BASE_URL}/orders/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` },
      body: JSON.stringify({ shippingAddressId: addressId }),
    }).then(r => r.json());
    assert(checkout3.success, 'Checkout 3 failed');
    const order3 = checkout3.data.order;

    // Verify stocks reserved (availableStock: 42, reservedStock: 5, currentStock: 47)
    const stockBeforeExpire = await fetch(`${BASE_URL}/inventory/${testProductId}`).then(r => r.json());
    assertEqual(stockBeforeExpire.data.availableStock, 42, 'availableStock should be 42');
    assertEqual(stockBeforeExpire.data.reservedStock, 5, 'reservedStock should be 5');

    // Simulate Midtrans Webhook: Expired
    await fetch(`${BASE_URL}/payments/webhook/midtrans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: order3.id,
        transaction_status: 'expire',
        status_code: '202',
        gross_amount: '105000.00',
        signature_key: 'mock-signature'
      }),
    });

    // Wait for event propagation
    await sleep(2000);

    // Verify order status updated to CANCELLED
    const getOrder3 = await fetch(`${BASE_URL}/orders/${order3.id}`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    }).then(r => r.json());
    assertEqual(getOrder3.data.status, 'CANCELLED', 'Order 3 status should have updated to CANCELLED');

    // Verify stock is RELEASED (availableStock: 47, reservedStock: 0, currentStock: 47)
    const stockAfterExpire = await fetch(`${BASE_URL}/inventory/${testProductId}`).then(r => r.json());
    assertEqual(stockAfterExpire.data.availableStock, 47, 'availableStock should be restored to 47');
    assertEqual(stockAfterExpire.data.reservedStock, 0, 'reservedStock should be released to 0');

    logSuccess('Stock release compensation on webhook payment expiration passed');

    // ----------------------------------------------------
    // 9. WEBHOOK IDEMPOTENCY
    // ----------------------------------------------------
    logStep('9. Webhook Idempotency');

    // Send identical settlement webhook payload again for order 1
    const duplicateWebhookRes = await fetch(`${BASE_URL}/payments/webhook/midtrans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: order.id,
        transaction_status: 'settlement',
        status_code: '200',
        gross_amount: '60000.00',
        signature_key: 'mock-signature',
        transaction_id: 'midtrans-test-uuid-12345',
        settlement_time: new Date().toISOString()
      }),
    }).then(r => r.json());

    // Should return duplicate notice/processed flag is handled safely
    assert(duplicateWebhookRes.success, 'Duplicate webhook call should succeed with 200 OK');
    assertEqual(duplicateWebhookRes.data.status, 'DUPLICATE', 'Webhook response should state it is DUPLICATE');

    logSuccess('Idempotency checks verified and duplicate calls handled safely');

    // ----------------------------------------------------
    // 10. ROLE AND GUARDS VALIDATION
    // ----------------------------------------------------
    logStep('10. Security & Role Guards');

    // Attempt to create voucher as customer
    const badVoucherRes = await fetch(`${BASE_URL}/vouchers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` },
      body: JSON.stringify({
        code: 'HACK',
        type: 'PERCENTAGE',
        value: 99
      }),
    });
    assertEqual(badVoucherRes.status, 403, 'Voucher creation should be guarded against non-admins');

    // Attempt to call without headers/token
    const unauthVoucherRes = await fetch(`${BASE_URL}/vouchers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'HACK2',
        type: 'PERCENTAGE',
        value: 99
      }),
    });
    assertEqual(unauthVoucherRes.status, 401, 'Request should be unauthorized without token');

    logSuccess('Voucher guards and authorization filters verified');

    console.log(`\n${colors.green}=========================================`);
    console.log(`🎉 ALL STAGE 3 INTEGRATION TESTS PASSED 🎉`);
    console.log(`=========================================${colors.reset}\n`);
    process.exit(0);

  } catch (err) {
    logError('Tests execution failed', err);
    process.exit(1);
  }
}

// Start tests
runTests();
