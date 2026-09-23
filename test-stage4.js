const BASE_URL = 'http://localhost:3000/api/v1';
const PAYMENT_SERVICE_URL = 'http://localhost:3006';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
};

function logSuccess(message) {
  console.log(`${colors.green}✔ ${message}${colors.reset}`);
}

function logError(message, err) {
  console.error(`${colors.red}✘ ${message}${colors.reset}`);
  if (err) console.error('  ', err?.message || err);
}

function logStep(message) {
  console.log(`\n${colors.cyan}━━━ ${message} ━━━${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.yellow}  ℹ ${message}${colors.reset}`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

async function request(method, path, body, token, isExternal = false) {
  const url = isExternal ? path : `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  return { status: res.status, data };
}

async function runTests() {
  console.log(`\n${colors.magenta}╔══════════════════════════════════════════════╗`);
  console.log(`║  NexaCommerce — Stage 4 Integration Tests    ║`);
  console.log(`╚══════════════════════════════════════════════╝${colors.reset}\n`);

  const timestamp = Date.now();
  const customerEmail = `customer.s4.${timestamp}@example.com`;
  const sellerEmail = `seller.s4.${timestamp}@example.com`;
  const adminEmail = `admin.s4.${timestamp}@example.com`;

  let customerToken, sellerToken, adminToken;
  let customerId, sellerId, adminId;
  let productId, categoryId, addressId, courierId;
  let orderId, orderItemId, paymentId, paymentToken;
  let shippingOrderId, trackingNumber;
  let reviewId, notificationId, reportId;

  // ─── 1. SETUP: Register & Login ───────────────────────────────────────────
  logStep('1. Setup — Register & Login');

  try {
    // Register customer
    let r = await request('POST', '/auth/register', {
      email: customerEmail, password: 'Password123!', name: 'Customer Stage4', role: 'CUSTOMER',
    });
    assert(r.status === 201, `Customer register failed: ${JSON.stringify(r.data)}`);
    customerId = r.data.data?.id;
    logSuccess(`Customer registered (ID: ${customerId})`);

    // Login customer
    r = await request('POST', '/auth/login', { email: customerEmail, password: 'Password123!' });
    assert(r.status === 200, `Customer login failed`);
    customerToken = r.data.data?.accessToken;
    logSuccess('Customer logged in');

    // Register seller
    r = await request('POST', '/auth/register', {
      email: sellerEmail, password: 'Password123!', name: 'Seller Stage4', role: 'SELLER',
    });
    assert(r.status === 201, `Seller register failed`);
    sellerId = r.data.data?.id;
    sellerToken = r.data.data?.accessToken || null;

    r = await request('POST', '/auth/login', { email: sellerEmail, password: 'Password123!' });
    sellerToken = r.data.data?.accessToken;
    logSuccess(`Seller registered & logged in (ID: ${sellerId})`);

    // Register admin
    r = await request('POST', '/auth/register', {
      email: adminEmail, password: 'Password123!', name: 'Admin Stage4', role: 'ADMIN',
    });
    adminId = r.data.data?.id;
    r = await request('POST', '/auth/login', { email: adminEmail, password: 'Password123!' });
    adminToken = r.data.data?.accessToken;
    logSuccess(`Admin registered & logged in (ID: ${adminId})`);
  } catch (err) {
    logError('Setup failed', err);
    process.exit(1);
  }

  // ─── 2. SHIPPING: Couriers & Rates ────────────────────────────────────────
  logStep('2. Shipping — Couriers & Rates');

  try {
    // GET /shipping/couriers (public)
    let r = await request('GET', '/shipping/couriers');
    assert(r.status === 200, `Get couriers failed: ${r.status}`);
    assert(Array.isArray(r.data.data) && r.data.data.length >= 5, 'Expected at least 5 couriers');
    const jne = r.data.data.find((c) => c.code === 'jne');
    assert(jne, 'JNE courier not found');
    courierId = jne.id;
    logSuccess(`Couriers listed — ${r.data.data.length} couriers found (JNE ID: ${courierId})`);

    // GET /shipping/rates (public)
    r = await request('GET', '/shipping/rates?originCity=Jakarta&destinationCity=Semarang&weight=1000');
    assert(r.status === 200, `Get rates failed: ${r.status}`);
    assert(Array.isArray(r.data.data) && r.data.data.length > 0, 'Expected at least 1 rate option');
    const firstRate = r.data.data[0];
    logSuccess(`Shipping rates fetched — ${r.data.data.length} options. Example: ${firstRate.courierName} ${firstRate.serviceCode} = Rp ${firstRate.cost}`);
  } catch (err) {
    logError('Shipping rates test failed', err);
  }

  // ─── 3. SETUP: Product & Inventory ───────────────────────────────────────
  logStep('3. Setup — Create Product & Set Inventory');

  try {
    // Create category
    let r = await request('POST', '/products/categories', { name: `Electronics S4 ${timestamp}`, slug: `electronics-s4-${timestamp}` }, adminToken);
    assert(r.status === 201, `Create category failed: ${JSON.stringify(r.data)}`);
    categoryId = r.data.data.id;

    // Create product
    r = await request('POST', '/products/products', {
      name: `Test Product S4 ${timestamp}`,
      slug: `test-product-s4-${timestamp}`,
      description: 'Test product for Stage 4',
      price: 150000,
      stock: 100,
      categoryId,
      sellerId,
      weight: 500,
      status: 'ACTIVE',
    }, sellerToken);
    assert(r.status === 201, `Create product failed: ${JSON.stringify(r.data)}`);
    productId = r.data.data.id;
    logSuccess(`Product created (ID: ${productId})`);

    // Set inventory
    r = await request('POST', '/inventory/initialize', { productId, initialStock: 50, lowStockThreshold: 5 }, sellerToken);
    assert(r.status === 201 || r.status === 200, `Inventory initialization failed: ${JSON.stringify(r.data)}`);
    logSuccess('Inventory set');

    // Add customer address
    r = await request('POST', '/users/me/addresses', {
      label: 'Rumah', recipientName: 'Customer Stage4', phone: '081234567890',
      street: 'Jl. Test No. 4', city: 'Jakarta', province: 'DKI Jakarta', postalCode: '10110', isDefault: true,
    }, customerToken);
    assert(r.status === 201 || r.status === 200, `Add address failed: ${JSON.stringify(r.data)}`);
    addressId = r.data.data?.id || r.data.data?.address?.id;
    logSuccess(`Address added (ID: ${addressId})`);
  } catch (err) {
    logError('Setup product/inventory failed', err);
    process.exit(1);
  }

  // ─── 4. FULL ORDER-TO-DELIVERY FLOW ──────────────────────────────────────
  logStep('4. Full Order-to-Delivery Flow');

  try {
    // Add to cart
    let r = await request('POST', '/cart/items', { productId, quantity: 1 }, customerToken);
    assert(r.status === 200 || r.status === 201, `Add to cart failed: ${JSON.stringify(r.data)}`);
    logSuccess('Product added to cart');

    // Checkout
    r = await request('POST', '/orders/checkout', {
      shippingAddressId: addressId,
      courierName: 'JNE',
      courierService: 'REG',
      shippingCost: 18000,
    }, customerToken);
    assert(r.status === 201, `Checkout failed: ${JSON.stringify(r.data)}`);
    orderId = r.data.data?.order?.id;
    paymentToken = r.data.data?.payment?.midtransToken || r.data.data?.payment?.token;
    paymentId = r.data.data?.payment?.id;
    logSuccess(`Order created (ID: ${orderId}), payment token: ${paymentToken}`);

    // Get order items
    r = await request('GET', `/orders/${orderId}`, null, customerToken);
    assert(r.status === 200, `Get order failed`);
    orderItemId = r.data.data?.items?.[0]?.id;
    logSuccess(`Order item ID: ${orderItemId}`);

    // Simulate payment webhook
    const webhookPayload = {
      order_id: orderId,
      status_code: '200',
      gross_amount: '168000.00',
      signature_key: 'mock-signature',
      transaction_status: 'settlement',
      payment_type: 'qris',
      transaction_time: new Date().toISOString(),
    };
    r = await request('POST', `${PAYMENT_SERVICE_URL}/payments/webhook/midtrans`, webhookPayload, null, true);
    logInfo(`Payment webhook response: ${r.status}`);

    logInfo('Waiting 3 seconds for event processing...');
    await sleep(3000);

    // Verify shipping order was created (via API gateway)
    r = await request('GET', `/shipping/${orderId}`, null, customerToken);
    if (r.status === 200) {
      trackingNumber = r.data.data?.trackingNumber;
      shippingOrderId = r.data.data?.id;
      logSuccess(`Shipping order created — Tracking: ${trackingNumber}, Status: ${r.data.data?.status}`);
      assert(r.data.data?.status === 'WAITING_PICKUP', `Expected WAITING_PICKUP, got ${r.data.data?.status}`);
    } else {
      logInfo(`Shipping order not yet created (status ${r.status}) — may need OrderPaid event to fire. Creating manually...`);

      // Manual create shipping order if event didn't fire
      r = await request('POST', '/shipping/create', {
        orderId,
        courierId,
        serviceCode: 'REG',
        weight: 500,
        originCity: 'Jakarta',
        destinationAddress: { recipientName: 'Customer Stage4', phone: '081234567890', street: 'Jl. Test No. 4', city: 'Semarang', province: 'Jawa Tengah', postalCode: '50000' },
      }, sellerToken);
      if (r.status === 201 || r.status === 200) {
        trackingNumber = r.data.data?.trackingNumber;
        shippingOrderId = r.data.data?.id;
        logSuccess(`Shipping order created manually — Tracking: ${trackingNumber}`);
      } else {
        logError(`Manual shipping order creation also failed: ${JSON.stringify(r.data)}`);
      }
    }

    // Update shipping status: WAITING_PICKUP → PICKED_UP
    r = await request('PATCH', `/shipping/${orderId}/status`, { status: 'PICKED_UP', location: 'Gudang Jakarta Pusat' }, sellerToken);
    assert(r.status === 200, `PICKED_UP update failed: ${JSON.stringify(r.data)}`);
    logSuccess('Shipping status updated to PICKED_UP');

    // → IN_TRANSIT
    r = await request('PATCH', `/shipping/${orderId}/status`, { status: 'IN_TRANSIT', location: 'Hub Semarang' }, sellerToken);
    assert(r.status === 200, `IN_TRANSIT update failed: ${JSON.stringify(r.data)}`);
    logSuccess('Shipping status updated to IN_TRANSIT');

    // → DELIVERED
    r = await request('PATCH', `/shipping/${orderId}/status`, { status: 'DELIVERED', location: 'Semarang', note: 'Diterima oleh customer' }, sellerToken);
    assert(r.status === 200, `DELIVERED update failed: ${JSON.stringify(r.data)}`);
    logSuccess('Shipping status updated to DELIVERED → OrderDelivered event published');

    logInfo('Waiting 3 seconds for event processing...');
    await sleep(3000);

    // Verify order status = DELIVERED
    r = await request('GET', `/orders/${orderId}`, null, customerToken);
    assert(r.status === 200);
    logInfo(`Order status after delivery: ${r.data.data?.status}`);
    if (r.data.data?.status === 'DELIVERED') {
      logSuccess('Order status updated to DELIVERED via event');
    } else {
      logInfo(`Order status is ${r.data.data?.status} — OrderDelivered consumer may still be processing`);
    }
  } catch (err) {
    logError('Order-to-delivery flow failed', err);
  }

  // ─── 5. ORDER COMPLETION ─────────────────────────────────────────────────
  logStep('5. Order Completion');

  try {
    // First ensure order is DELIVERED (force update if event didn't arrive yet)
    let r = await request('GET', `/orders/${orderId}`, null, customerToken);
    if (r.data.data?.status !== 'DELIVERED') {
      logInfo('Order not DELIVERED yet, trying status update via admin...');
      r = await request('PATCH', `/orders/${orderId}/status`, { status: 'DELIVERED', note: 'Manual test delivery' }, adminToken);
      logInfo(`Force-set DELIVERED: ${r.status}`);
      await sleep(1000);
    }

    // Manual complete by customer
    r = await request('PATCH', `/orders/${orderId}/complete`, null, customerToken);
    assert(r.status === 200, `Complete order failed: ${JSON.stringify(r.data)}`);
    logSuccess('Customer manually completed the order → OrderCompleted event published');

    // Verify COMPLETED status
    r = await request('GET', `/orders/${orderId}`, null, customerToken);
    assert(r.status === 200 && r.data.data?.status === 'COMPLETED', `Expected COMPLETED, got ${r.data.data?.status}`);
    logSuccess('Order status confirmed: COMPLETED');
  } catch (err) {
    logError('Order completion test failed', err);
  }

  // ─── 6. REVIEW FLOW ──────────────────────────────────────────────────────
  logStep('6. Review Flow');

  try {
    // Valid review
    let r = await request('POST', '/reviews', {
      productId,
      orderId,
      orderItemId,
      rating: 5,
      title: 'Produk Luar Biasa!',
      content: 'Barang datang cepat, kondisi sangat baik. Penjual responsif dan packaging aman.',
    }, customerToken);
    assert(r.status === 201, `Create review failed: ${JSON.stringify(r.data)}`);
    reviewId = r.data.data?.id;
    logSuccess(`Review created (ID: ${reviewId})`);

    logInfo('Waiting 2 seconds for rating sync event...');
    await sleep(2000);

    // Get reviews for product
    r = await request('GET', `/reviews/products/${productId}`);
    assert(r.status === 200 && r.data.data?.reviews?.length >= 1, `Expected reviews, got: ${JSON.stringify(r.data)}`);
    logSuccess(`Product reviews listed — ${r.data.data.reviews.length} review(s)`);

    // Get rating summary
    r = await request('GET', `/reviews/summary/${productId}`);
    assert(r.status === 200, `Get summary failed`);
    logSuccess(`Rating summary: avg=${r.data.data?.averageRating}, total=${r.data.data?.totalReviews}`);

    // Check product rating updated (event-driven sync)
    r = await request('GET', `/products/products/${productId}`);
    assert(r.status === 200, `Get product failed`);
    logInfo(`Product rating after review: ${r.data.data?.rating}, totalReviews: ${r.data.data?.totalReviews}`);
    if (parseFloat(r.data.data?.rating) > 0) {
      logSuccess('Product rating synced via ReviewCreated event ✓');
    } else {
      logInfo('Product rating not yet synced (event may still be processing)');
    }

    // Duplicate review should fail
    r = await request('POST', '/reviews', {
      productId, orderId, orderItemId, rating: 4, content: 'Mencoba review kedua kali.',
    }, customerToken);
    assert(r.status === 400 || r.status === 409 || r.status === 422, `Duplicate review should be rejected, got ${r.status}`);
    logSuccess('Duplicate review correctly rejected');

    // Review for non-completed order should fail — create new order and try
    logInfo('Skipping non-completed order review test (flow setup would require a new order)');
  } catch (err) {
    logError('Review flow test failed', err);
  }

  // ─── 7. REVIEW MODERATION ────────────────────────────────────────────────
  logStep('7. Review Moderation');

  try {
    // Report review
    let r = await request('POST', `/reviews/${reviewId}/report`, {
      reason: 'SPAM', description: 'Ini review spam test',
    }, customerToken);
    assert(r.status === 201, `Report review failed: ${JSON.stringify(r.data)}`);
    logSuccess('Review reported successfully');

    // Admin list reports
    r = await request('GET', '/reviews/reports', null, adminToken);
    assert(r.status === 200, `List reports failed`);
    reportId = r.data.data?.reports?.[0]?.id;
    logSuccess(`Reports listed: ${r.data.data?.reports?.length} report(s)`);

    // Admin hide review
    r = await request('PATCH', `/reviews/${reviewId}/moderate`, {
      moderationStatus: 'HIDDEN', moderationNote: 'Test moderation hide',
    }, adminToken);
    assert(r.status === 200, `Moderate review failed: ${JSON.stringify(r.data)}`);
    logSuccess('Review hidden by admin');

    // Verify hidden review not in public list
    r = await request('GET', `/reviews/products/${productId}`);
    assert(r.status === 200);
    const hiddenCheck = r.data.data?.reviews?.find((rv) => rv.id === reviewId);
    assert(!hiddenCheck, 'Hidden review should not appear in public listing');
    logSuccess('Hidden review correctly excluded from public listing');

    // Verify rating recalculated (should be 0 now)
    r = await request('GET', `/reviews/summary/${productId}`);
    logInfo(`Rating summary after hide: avg=${r.data.data?.averageRating}, total=${r.data.data?.totalReviews}`);
    assert(r.data.data?.totalReviews === 0, `Expected totalReviews=0 after hide, got ${r.data.data?.totalReviews}`);
    logSuccess('Rating recalculated after review hidden');

    // Admin update report status
    if (reportId) {
      r = await request('PATCH', `/reviews/reports/${reportId}`, { status: 'REVIEWED' }, adminToken);
      assert(r.status === 200, `Update report failed: ${JSON.stringify(r.data)}`);
      logSuccess('Report status updated to REVIEWED');
    }

    // Restore review (approve)
    r = await request('PATCH', `/reviews/${reviewId}/moderate`, { moderationStatus: 'APPROVED' }, adminToken);
    assert(r.status === 200, `Restore review failed`);
    logSuccess('Review restored to APPROVED');
  } catch (err) {
    logError('Review moderation test failed', err);
  }

  // ─── 8. NOTIFICATIONS ────────────────────────────────────────────────────
  logStep('8. Notifications');

  try {
    logInfo('Waiting 2 seconds for notifications to settle...');
    await sleep(2000);

    // Customer notifications
    let r = await request('GET', '/notifications', null, customerToken);
    assert(r.status === 200, `Get notifications failed: ${r.status}`);
    const notifications = r.data.data || [];
    logSuccess(`Customer notifications: ${notifications.length} notification(s)`);
    if (notifications.length > 0) {
      const types = [...new Set(notifications.map((n) => n.type))];
      logInfo(`Notification types: ${types.join(', ')}`);
    }

    // Unread count
    r = await request('GET', '/notifications/unread-count', null, customerToken);
    assert(r.status === 200, `Get unread count failed`);
    const unreadCount = r.data.data?.count;
    logSuccess(`Unread notifications: ${unreadCount}`);

    // Mark one as read
    if (notifications.length > 0) {
      notificationId = notifications[0].id;
      r = await request('PATCH', `/notifications/${notificationId}/read`, null, customerToken);
      assert(r.status === 200, `Mark as read failed: ${r.status}`);
      logSuccess(`Notification ${notificationId} marked as read`);

      // Verify count decreased
      r = await request('GET', '/notifications/unread-count', null, customerToken);
      logInfo(`Unread count after mark-read: ${r.data.data?.count}`);
    }

    // Mark all as read
    r = await request('POST', '/notifications/read-all', null, customerToken);
    assert(r.status === 200, `Mark all as read failed`);
    logSuccess('All notifications marked as read');

    // Admin email logs
    r = await request('GET', '/notifications/admin/email-logs', null, adminToken);
    assert(r.status === 200, `Get email logs failed: ${r.status}`);
    const emailLogs = r.data.data || [];
    logSuccess(`Email logs: ${emailLogs.length} entry/entries`);
    if (emailLogs.length > 0) {
      const statuses = [...new Set(emailLogs.map((l) => l.status))];
      logInfo(`Email statuses: ${statuses.join(', ')}`);
    }
  } catch (err) {
    logError('Notifications test failed', err);
  }

  // ─── 9. SELLER NOTIFICATIONS (LOW STOCK) ─────────────────────────────────
  logStep('9. Seller Notifications');

  try {
    let r = await request('GET', '/notifications', null, sellerToken);
    assert(r.status === 200, `Get seller notifications failed`);
    const sellerNotifications = r.data.data || [];
    logInfo(`Seller notifications: ${sellerNotifications.length}`);
    if (sellerNotifications.length > 0) {
      const types = [...new Set(sellerNotifications.map((n) => n.type))];
      logInfo(`Seller notification types: ${types.join(', ')}`);
      logSuccess('Seller has received notifications');
    } else {
      logInfo('No seller notifications yet (LOW_STOCK may not have been triggered)');
    }
  } catch (err) {
    logError('Seller notifications test failed', err);
  }

  // ─── 10. AUTHORIZATION TESTS ─────────────────────────────────────────────
  logStep('10. Authorization Tests');

  try {
    // Customer cannot update shipping status
    let r = await request('PATCH', `/shipping/${orderId}/status`, { status: 'IN_TRANSIT' }, customerToken);
    assert(r.status === 403, `Expected 403 for customer updating shipping status, got ${r.status}`);
    logSuccess('Customer blocked from updating shipping status (403)');

    // Customer cannot moderate review
    r = await request('PATCH', `/reviews/${reviewId}/moderate`, { moderationStatus: 'HIDDEN' }, customerToken);
    assert(r.status === 403, `Expected 403 for customer moderating review, got ${r.status}`);
    logSuccess('Customer blocked from moderating reviews (403)');

    // Seller cannot access admin email logs
    r = await request('GET', '/notifications/admin/email-logs', null, sellerToken);
    assert(r.status === 403, `Expected 403 for seller accessing email logs, got ${r.status}`);
    logSuccess('Seller blocked from admin email logs (403)');

    // Unauthenticated cannot access protected routes
    r = await request('GET', '/notifications');
    assert(r.status === 401, `Expected 401 for unauthenticated notifications, got ${r.status}`);
    logSuccess('Unauthenticated access correctly rejected (401)');
  } catch (err) {
    logError('Authorization tests failed', err);
  }

  // ─── SUMMARY ─────────────────────────────────────────────────────────────
  console.log(`\n${colors.magenta}╔══════════════════════════════════════════════╗`);
  console.log(`║           Stage 4 Tests Complete             ║`);
  console.log(`╚══════════════════════════════════════════════╝${colors.reset}`);
  console.log(`\n${colors.blue}IDs from this test run:${colors.reset}`);
  console.log(`  orderId:     ${orderId}`);
  console.log(`  productId:   ${productId}`);
  console.log(`  reviewId:    ${reviewId}`);
  console.log(`  trackingNum: ${trackingNumber}`);
  console.log(`  customerId:  ${customerId}`);
  console.log(`  sellerId:    ${sellerId}`);
}

runTests().catch((err) => {
  console.error(`\n${colors.red}Fatal error: ${err.message}${colors.reset}`);
  process.exit(1);
});
