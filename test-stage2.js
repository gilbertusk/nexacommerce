const BASE_URL = 'http://localhost:3000/api/v1';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Simple color logger
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
    throw new Error(`${message || 'Assertion failed'}: expected ${expected}, got ${actual}`);
  }
}

async function runTests() {
  logStep('Starting Integration Tests for NexaCommerce Stage 2');
  
  // Wait for services to be fully up
  await sleep(3000);

  let customerToken = null;
  let customerRefreshToken = null;
  let adminToken = null;
  let sellerToken = null;
  let sellerId = null;

  let testProductId = null;
  let testCategoryId = null;
  let testBrandId = null;
  let testImageId = null;
  let orderId = `order-${Date.now()}`;

  // Users info
  const timestamp = Date.now();
  const customerEmail = `customer.${timestamp}@example.com`;
  const sellerEmail = `seller.${timestamp}@example.com`;
  const adminEmail = `admin.${timestamp}@example.com`;
  const password = 'password123';

  try {
    // ----------------------------------------------------
    // 1. GATEWAY HEALTH CHECKS
    // ----------------------------------------------------
    logStep('1. Health Checks');
    const gatewayHealth = await fetch('http://localhost:3000/health').then(r => r.json());
    assertEqual(gatewayHealth.status, 'UP', 'Gateway is not UP');
    logSuccess('Gateway health check passed');

    const authHealth = await fetch('http://localhost:3000/api/v1/auth/health').then(r => r.json());
    assertEqual(authHealth.status, 'UP', 'Auth service is not UP');
    logSuccess('Auth Service health check passed');

    // ----------------------------------------------------
    // 2. AUTH CYCLE
    // ----------------------------------------------------
    logStep('2. Auth & Identity Cycle');

    // Register Customer
    const registerCustomerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Customer', email: customerEmail, password, role: 'CUSTOMER' }),
    }).then(r => r.json());
    
    assert(registerCustomerRes.success, 'Customer registration failed');
    const verifyToken = registerCustomerRes.data.emailVerificationToken;
    assert(verifyToken, 'Verification token not returned in registration response');
    logSuccess('Customer registered successfully');

    // Verify Email
    const verifyEmailRes = await fetch(`${BASE_URL}/auth/verify-email?token=${verifyToken}`, {
      method: 'POST',
    }).then(r => r.json());
    assert(verifyEmailRes.success, 'Email verification failed');
    logSuccess('Customer email verified successfully');

    // Login Customer
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: customerEmail, password }),
    }).then(r => r.json());

    assert(loginRes.success, 'Customer login failed');
    customerToken = loginRes.data.accessToken;
    customerRefreshToken = loginRes.data.refreshToken;
    assert(customerToken && customerRefreshToken, 'Tokens missing');
    logSuccess('Customer login successful');

    // Register Seller & Login
    const registerSellerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Seller', email: sellerEmail, password, role: 'SELLER' }),
    }).then(r => r.json());
    assert(registerSellerRes.success, 'Seller registration failed');
    
    // Verify & Login Seller
    await fetch(`${BASE_URL}/auth/verify-email?token=${registerSellerRes.data.emailVerificationToken}`, { method: 'POST' });
    const sellerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: sellerEmail, password }),
    }).then(r => r.json());
    sellerToken = sellerLoginRes.data.accessToken;
    sellerId = sellerLoginRes.data.user.id;
    logSuccess('Seller registered and logged in successfully');

    // Register Admin & Login
    const registerAdminRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Admin', email: adminEmail, password, role: 'ADMIN' }),
    }).then(r => r.json());
    assert(registerAdminRes.success, 'Admin registration failed');

    await fetch(`${BASE_URL}/auth/verify-email?token=${registerAdminRes.data.emailVerificationToken}`, { method: 'POST' });
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password }),
    }).then(r => r.json());
    adminToken = adminLoginRes.data.accessToken;
    logSuccess('Admin registered and logged in successfully');

    // Check Me endpoint
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    }).then(r => r.json());
    assertEqual(meRes.data.email, customerEmail, 'Me email mismatch');
    logSuccess('GET /auth/me endpoint passed');

    // Forgot / Reset Password flow
    const forgotRes = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: customerEmail }),
    }).then(r => r.json());
    assert(forgotRes.success, 'Forgot password call failed');
    const resetToken = forgotRes.data.resetToken;
    assert(resetToken, 'Reset token is missing');

    const resetRes = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: resetToken, newPassword: 'newpassword123' }),
    }).then(r => r.json());
    assert(resetRes.success, 'Reset password call failed');

    // Login with new credentials
    const loginNewRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: customerEmail, password: 'newpassword123' }),
    }).then(r => r.json());
    assert(loginNewRes.success, 'Login with new password failed');
    customerToken = loginNewRes.data.accessToken;
    customerRefreshToken = loginNewRes.data.refreshToken;
    logSuccess('Forgot & Reset password flow verified successfully');

    // Refresh token rotation (RTR)
    await sleep(1000); // Sleep to ensure iat is different
    const refreshRes = await fetch(`${BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: customerRefreshToken }),
    }).then(r => r.json());
    assert(refreshRes.success, 'Token refresh rotation failed');
    const oldToken = customerToken;
    customerToken = refreshRes.data.accessToken;
    customerRefreshToken = refreshRes.data.refreshToken;
    assert(customerToken !== oldToken, 'Token not rotated');
    logSuccess('Refresh Token Rotation (RTR) verified');

    // ----------------------------------------------------
    // 3. USER PROFILE MANAGEMENT
    // ----------------------------------------------------
    logStep('3. User Profile Management');

    // Update Profile
    const updateProfileRes = await fetch(`${BASE_URL}/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ displayName: 'John Doe', phone: '08123456789', gender: 'MALE' }),
    }).then(r => r.json());
    assert(updateProfileRes.success, 'Update profile failed');
    assertEqual(updateProfileRes.data.displayName, 'John Doe', 'Display name mismatch');
    logSuccess('User profile update verified');

    // Check addresses default setting
    const address1Res = await fetch(`${BASE_URL}/users/me/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        label: 'Home',
        recipientName: 'John',
        phone: '08123',
        street: 'Main Street 1',
        city: 'City A',
        province: 'Prov B',
        postalCode: '12345',
        isDefault: true
      }),
    }).then(r => r.json());
    assert(address1Res.success, 'Address 1 creation failed');
    assertEqual(address1Res.data.isDefault, true, 'First address should be default');

    const address2Res = await fetch(`${BASE_URL}/users/me/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        label: 'Office',
        recipientName: 'John Office',
        phone: '08134',
        street: 'Work Street 2',
        city: 'City B',
        province: 'Prov C',
        postalCode: '54321',
        isDefault: true
      }),
    }).then(r => r.json());
    assert(address2Res.success, 'Address 2 creation failed');
    assertEqual(address2Res.data.isDefault, true, 'Address 2 should be default');

    // Re-fetch address 1 to verify it is no longer default
    const getAddressesRes = await fetch(`${BASE_URL}/users/me/addresses`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    }).then(r => r.json());
    const homeAddress = getAddressesRes.data.find(a => a.label === 'Home');
    assertEqual(homeAddress.isDefault, false, 'Address 1 should have defaults unset');
    logSuccess('Addresses default management verified');

    // Delete address validation: delete default when it's the only one (we have 2, so let's delete 1 first)
    const deleteRes1 = await fetch(`${BASE_URL}/users/me/addresses/${homeAddress.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${customerToken}` }
    }).then(r => r.json());
    assert(deleteRes1.success, 'Deleting non-default address failed');

    // Now delete default (it's default and the only one remaining)
    const deleteRes2 = await fetch(`${BASE_URL}/users/me/addresses/${address2Res.data.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${customerToken}` }
    }).then(r => r.json());
    assert(!deleteRes2.success, 'Should fail to delete default address when it is the only one');
    logSuccess('Address deletion guards verified');

    // Seller Profile Creation
    const sellerProfRes = await fetch(`${BASE_URL}/users/seller-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerToken}`,
      },
      body: JSON.stringify({ storeName: 'My Awesome Store', storeDescription: 'Selling top-notch gears' }),
    }).then(r => r.json());
    assert(sellerProfRes.success, 'Seller profile creation failed');
    assertEqual(sellerProfRes.data.storeName, 'My Awesome Store', 'Store name mismatch');
    logSuccess('Seller profile creation and verification passed');

    // ----------------------------------------------------
    // 4. CATALOG & BRANDS
    // ----------------------------------------------------
    logStep('4. Catalog & Brands');

    // Create Category (Admin Only)
    const catRes = await fetch(`${BASE_URL}/products/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ name: 'Electronics', slug: `electronics-${timestamp}` }),
    }).then(r => r.json());
    assert(catRes.success, 'Category creation failed');
    testCategoryId = catRes.data.id;

    // Create Brand (Admin Only)
    const brandRes = await fetch(`${BASE_URL}/brands`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ name: `Brand X ${timestamp}`, slug: `brand-x-${timestamp}`, logo: 'http://example.com/logo.png' }),
    }).then(r => r.json());
    assert(brandRes.success, 'Brand creation failed');
    testBrandId = brandRes.data.id;
    logSuccess('Category and Brand created successfully');

    // Create Product (Seller)
    const prodRes = await fetch(`${BASE_URL}/products/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerToken}`,
      },
      body: JSON.stringify({
        name: 'Super Gadget Pro',
        slug: `super-gadget-pro-${timestamp}`,
        description: 'Next-gen gadget',
        price: 1500,
        stock: 50,
        categoryId: testCategoryId,
        brandId: testBrandId,
        sku: `SG-PRO-${timestamp}`,
        weight: 200,
      }),
    }).then(r => r.json());
    assert(prodRes.success, 'Product creation failed');
    testProductId = prodRes.data.id;
    logSuccess('Product created successfully');

    // Product Images uploads
    const imgRes = await fetch(`${BASE_URL}/products/products/${testProductId}/images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerToken}`,
      },
      body: JSON.stringify({ url: 'http://example.com/image1.png', alt: 'Main Image', sortOrder: 1, isMain: true }),
    }).then(r => r.json());
    assert(imgRes.success, 'Image upload failed');
    testImageId = imgRes.data.id;
    logSuccess('Product image added successfully');

    // GET products listing with sorting/filters
    const listProducts = await fetch(`${BASE_URL}/products/products?brandId=${testBrandId}&categoryId=${testCategoryId}&sort=price_desc`).then(r => r.json());
    assert(listProducts.success, 'Enhanced product list call failed');
    assert(listProducts.data.items.length > 0, 'No products returned with filters');
    logSuccess('Enhanced products listing and filters verified');

    // ----------------------------------------------------
    // 5. INVENTORY OPERATIONS
    // ----------------------------------------------------
    logStep('5. Inventory Operations');

    // Initialize Inventory (Seller)
    const initInvRes = await fetch(`${BASE_URL}/inventory/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerToken}`,
      },
      body: JSON.stringify({ productId: testProductId, initialStock: 100, lowStockThreshold: 5 }),
    }).then(r => r.json());
    assert(initInvRes.success, 'Inventory initialization failed');
    assertEqual(initInvRes.data.currentStock, 100, 'Initial stock level incorrect');

    // Stock-In (Increase stock levels)
    const stockInRes = await fetch(`${BASE_URL}/inventory/stock-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerToken}`,
      },
      body: JSON.stringify({ productId: testProductId, quantity: 10, note: 'Restock' }),
    }).then(r => r.json());
    assert(stockInRes.success, 'Stock in failed');
    assertEqual(stockInRes.data.currentStock, 110, 'Stock level post stock-in incorrect');

    // Stock-Out (Decrease stock levels)
    const stockOutRes = await fetch(`${BASE_URL}/inventory/stock-out`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerToken}`,
      },
      body: JSON.stringify({ productId: testProductId, quantity: 5 }),
    }).then(r => r.json());
    assert(stockOutRes.success, 'Stock out failed');
    assertEqual(stockOutRes.data.currentStock, 105, 'Stock level post stock-out incorrect');
    logSuccess('Stock adjustments (In / Out) verified');

    // Reserve Stock (Customer)
    const reserveRes = await fetch(`${BASE_URL}/inventory/reserve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        productId: testProductId,
        orderId,
        quantity: 5,
        expiresAt: new Date(Date.now() + 100000).toISOString()
      }),
    }).then(r => r.json());
    assert(reserveRes.success, 'Reservation failed');

    // Check stock level after reserve
    const checkStock1 = await fetch(`${BASE_URL}/inventory/${testProductId}`).then(r => r.json());
    assertEqual(checkStock1.data.reservedStock, 5, 'Reserved stock level incorrect');
    assertEqual(checkStock1.data.availableStock, 100, 'Available stock level incorrect');
    logSuccess('Stock Reservation verified successfully');

    // Confirm Stock (Deduct stock permanently)
    const confirmRes = await fetch(`${BASE_URL}/inventory/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ productId: testProductId, orderId }),
    }).then(r => r.json());
    assert(confirmRes.success, 'Confirmation failed');

    const checkStock2 = await fetch(`${BASE_URL}/inventory/${testProductId}`).then(r => r.json());
    assertEqual(checkStock2.data.currentStock, 100, 'Current stock level incorrect after confirm');
    assertEqual(checkStock2.data.reservedStock, 0, 'Reserved stock level incorrect after confirm');
    assertEqual(checkStock2.data.availableStock, 100, 'Available stock level incorrect after confirm');
    logSuccess('Stock Confirmation verified successfully');

    // Test Reservation Release
    const orderId2 = `order-2-${Date.now()}`;
    await fetch(`${BASE_URL}/inventory/reserve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        productId: testProductId,
        orderId: orderId2,
        quantity: 10,
        expiresAt: new Date(Date.now() + 100000).toISOString()
      }),
    });

    const releaseRes = await fetch(`${BASE_URL}/inventory/release`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ productId: testProductId, orderId: orderId2 }),
    }).then(r => r.json());
    assert(releaseRes.success, 'Release failed');

    const checkStock3 = await fetch(`${BASE_URL}/inventory/${testProductId}`).then(r => r.json());
    assertEqual(checkStock3.data.reservedStock, 0, 'Reserved stock not cleaned after release');
    assertEqual(checkStock3.data.availableStock, 100, 'Available stock not restored after release');
    logSuccess('Stock Release flow verified successfully');

    // ----------------------------------------------------
    // 6. SECURITY & ROLES CHECKS
    // ----------------------------------------------------
    logStep('6. Security Guards & Role Checks');

    // Non-owner updating product images
    const anotherSellerLoginRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Another Seller', email: `another.${timestamp}@example.com`, password, role: 'SELLER' }),
    }).then(r => r.json());
    
    await fetch(`${BASE_URL}/auth/verify-email?token=${anotherSellerLoginRes.data.emailVerificationToken}`, { method: 'POST' });
    const anotherLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `another.${timestamp}@example.com`, password }),
    }).then(r => r.json());
    const anotherSellerToken = anotherLogin.data.accessToken;

    const hackImageRes = await fetch(`${BASE_URL}/products/products/${testProductId}/images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anotherSellerToken}`,
      },
      body: JSON.stringify({ url: 'http://example.com/hacked.png' }),
    }).then(r => r.json());
    
    assertEqual(hackImageRes.success, false, 'Should deny image addition to other seller product');
    logSuccess('Access ownership guard verified (403 Forbidden on write)');

    // 401 unauthorized checks
    const hackHealth = await fetch(`${BASE_URL}/users/me`).then(r => r.json());
    assertEqual(hackHealth.success, false, 'Profile request without token should fail');
    logSuccess('Gateway Authorization Guard verified (401 Unauthorized)');

    // ----------------------------------------------------
    // 7. CLEANUP / SOFT DELETE
    // ----------------------------------------------------
    logStep('7. Cleanup & Soft Delete');

    const deleteProdRes = await fetch(`${BASE_URL}/products/products/${testProductId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${sellerToken}` },
    }).then(r => r.json());
    assert(deleteProdRes.success, 'Soft delete failed');

    // Retrieve details to check status is ARCHIVED
    const finalProduct = await fetch(`${BASE_URL}/products/products/${testProductId}`).then(r => r.json());
    assertEqual(finalProduct.data.status, 'ARCHIVED', 'Product status should be ARCHIVED');
    logSuccess('Product soft-delete verified successfully');

    logStep('All Stage 2 Integration Tests Passed Successfully!');
  } catch (err) {
    logError('Tests execution failed', err);
    process.exit(1);
  }
}

runTests();
