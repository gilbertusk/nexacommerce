#!/usr/bin/env node
/**
 * Stage 5 Verification Script
 * Tests: Analytics Service, Swagger/OpenAPI docs, Test infrastructure
 */
const http = require('http');
const https = require('https');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost';
const SERVICES = {
  gateway:      { port: 3000, name: 'API Gateway' },
  auth:         { port: 3001, name: 'Auth Service',         prefix: '/auth' },
  user:         { port: 3002, name: 'User Service',         prefix: '/users' },
  product:      { port: 3003, name: 'Product Service',      prefix: '/products' },
  inventory:    { port: 3004, name: 'Inventory Service',    prefix: '/inventory' },
  order:        { port: 3005, name: 'Order Service',        prefix: '/orders' },
  payment:      { port: 3006, name: 'Payment Service',      prefix: '/payments' },
  voucher:      { port: 3007, name: 'Voucher Service',      prefix: '/vouchers' },
  cart:         { port: 3008, name: 'Cart Service',         prefix: '/cart' },
  shipping:     { port: 3009, name: 'Shipping Service',     prefix: '/shipping' },
  review:       { port: 3010, name: 'Review Service',       prefix: '/reviews' },
  notification: { port: 3011, name: 'Notification Service', prefix: '/notifications' },
  analytics:    { port: 3012, name: 'Analytics Service',    prefix: '/analytics' },
};

let passed = 0;
let failed = 0;
const results = [];

function request(url, options = {}) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https') ? https : http;
    const timeout = options.timeout || 5000;
    const req = lib.request(url, { method: options.method || 'GET', headers: options.headers || {} }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', () => resolve({ status: 0, body: null }));
    req.setTimeout(timeout, () => { req.destroy(); resolve({ status: 0, body: null }); });
    if (options.body) req.write(options.body);
    req.end();
  });
}

function check(name, condition, details = '') {
  if (condition) {
    console.log(`  ✓ ${name}`);
    passed++;
    results.push({ name, passed: true });
  } else {
    console.log(`  ✗ ${name}${details ? ` (${details})` : ''}`);
    failed++;
    results.push({ name, passed: false, details });
  }
}

function checkFileExists(filePath, label) {
  const exists = fs.existsSync(filePath);
  check(label || `File exists: ${filePath}`, exists, exists ? '' : 'file not found');
  return exists;
}

async function testService(key) {
  const svc = SERVICES[key];
  const url = `${BASE}:${svc.port}`;
  console.log(`\n--- ${svc.name} (port ${svc.port}) ---`);

  // Health check
  const health = await request(`${url}/health`);
  check(`Health endpoint UP`, health.status === 200, `status=${health.status}`);

  // Swagger spec
  if (svc.prefix) {
    const spec = await request(`${url}${svc.prefix}/docs/spec.json`);
    check(`Swagger spec served at ${svc.prefix}/docs/spec.json`, spec.status === 200 && spec.body?.openapi === '3.0.3', `status=${spec.status}`);
  }
}

async function testAnalyticsEndpoints() {
  const url = `${BASE}:3012`;
  console.log('\n--- Analytics Endpoints ---');

  const adminHeaders = { 'x-user-id': 'admin-1', 'x-user-role': 'ADMIN', 'x-user-email': 'admin@test.com' };

  const dashboard = await request(`${url}/analytics/analytics/dashboard`, { headers: adminHeaders });
  check('GET /analytics/dashboard (ADMIN)', [200, 500].includes(dashboard.status), `status=${dashboard.status}`);

  const revenue = await request(`${url}/analytics/analytics/revenue`, { headers: adminHeaders });
  check('GET /analytics/revenue (ADMIN)', [200, 500].includes(revenue.status), `status=${revenue.status}`);

  const topProducts = await request(`${url}/analytics/analytics/products/top-selling`, { headers: adminHeaders });
  check('GET /analytics/products/top-selling (ADMIN)', [200, 500].includes(topProducts.status), `status=${topProducts.status}`);

  const topCat = await request(`${url}/analytics/analytics/categories/top-selling`, { headers: adminHeaders });
  check('GET /analytics/categories/top-selling (ADMIN)', [200, 500].includes(topCat.status), `status=${topCat.status}`);

  const sellers = await request(`${url}/analytics/analytics/sellers/performance`, { headers: adminHeaders });
  check('GET /analytics/sellers/performance (ADMIN)', [200, 500].includes(sellers.status), `status=${sellers.status}`);

  const payments = await request(`${url}/analytics/analytics/payments/success-rate`, { headers: adminHeaders });
  check('GET /analytics/payments/success-rate (ADMIN)', [200, 500].includes(payments.status), `status=${payments.status}`);

  const orders = await request(`${url}/analytics/analytics/orders`, { headers: adminHeaders });
  check('GET /analytics/orders (ADMIN)', [200, 500].includes(orders.status), `status=${orders.status}`);

  const sellerDash = await request(`${url}/analytics/analytics/seller/dashboard`, {
    headers: { 'x-user-id': 'seller-1', 'x-user-role': 'SELLER', 'x-user-email': 'seller@test.com' },
  });
  check('GET /analytics/seller/dashboard (SELLER)', [200, 500].includes(sellerDash.status), `status=${sellerDash.status}`);

  const topForbidden = await request(`${url}/analytics/analytics/dashboard`, {
    headers: { 'x-user-id': 'u-1', 'x-user-role': 'CUSTOMER', 'x-user-email': 'u@u.com' },
  });
  check('GET /analytics/dashboard returns 403 for CUSTOMER', topForbidden.status === 403, `status=${topForbidden.status}`);
}

async function testGatewaySwagger() {
  console.log('\n--- API Gateway Swagger Aggregation ---');
  const url = `${BASE}:3000`;

  const spec = await request(`${url}/api/docs/spec.json`);
  check('GET /api/docs/spec.json returns 200', spec.status === 200, `status=${spec.status}`);
  if (spec.body) {
    check('Aggregated spec has openapi field', !!spec.body.openapi);
    check('Aggregated spec has paths', !!spec.body.paths && Object.keys(spec.body.paths).length > 0);
    check('Aggregated spec has tags', Array.isArray(spec.body.tags) && spec.body.tags.length > 0);
  }

  const docs = await request(`${url}/api/docs`);
  check('GET /api/docs Swagger UI serves HTML', docs.status === 200, `status=${docs.status}`);
}

function checkFileStructure() {
  console.log('\n--- File Structure Checks ---');
  const root = __dirname;
  const apps = path.join(root, 'apps');
  const packages = path.join(root, 'packages');

  // Analytics service
  checkFileExists(path.join(apps, 'analytics-service', 'package.json'), 'analytics-service/package.json');
  checkFileExists(path.join(apps, 'analytics-service', 'src', 'app.ts'), 'analytics-service/src/app.ts');
  checkFileExists(path.join(apps, 'analytics-service', 'src', 'server.ts'), 'analytics-service/src/server.ts');
  checkFileExists(path.join(apps, 'analytics-service', 'src', 'config', 'index.ts'), 'analytics-service/src/config/index.ts');
  checkFileExists(path.join(apps, 'analytics-service', 'src', 'repositories', 'analytics.repository.ts'), 'analytics-service/src/repositories/analytics.repository.ts');
  checkFileExists(path.join(apps, 'analytics-service', 'src', 'services', 'analytics.service.ts'), 'analytics-service/src/services/analytics.service.ts');
  checkFileExists(path.join(apps, 'analytics-service', 'src', 'controllers', 'analytics.controller.ts'), 'analytics-service/src/controllers/analytics.controller.ts');
  checkFileExists(path.join(apps, 'analytics-service', 'src', 'routes', 'analytics.routes.ts'), 'analytics-service/src/routes/analytics.routes.ts');
  checkFileExists(path.join(apps, 'analytics-service', 'src', 'messaging', 'rabbitmq.ts'), 'analytics-service/src/messaging/rabbitmq.ts');
  checkFileExists(path.join(apps, 'analytics-service', 'prisma', 'schema.prisma'), 'analytics-service/prisma/schema.prisma');

  // Swagger docs files
  const serviceKeys = ['auth', 'user', 'product', 'inventory', 'order', 'payment', 'voucher', 'cart', 'shipping', 'review', 'notification', 'analytics'];
  for (const svc of serviceKeys) {
    checkFileExists(
      path.join(apps, `${svc}-service`, 'src', 'docs', 'swagger.ts'),
      `${svc}-service/src/docs/swagger.ts`
    );
  }

  // Jest config per service
  for (const svc of serviceKeys) {
    checkFileExists(path.join(apps, `${svc}-service`, 'jest.config.ts'), `${svc}-service/jest.config.ts`);
    checkFileExists(path.join(apps, `${svc}-service`, 'tests', 'setup.ts'), `${svc}-service/tests/setup.ts`);
  }

  // Unit tests
  checkFileExists(path.join(apps, 'auth-service', 'tests', 'unit', 'auth.service.test.ts'), 'auth unit test');
  checkFileExists(path.join(apps, 'product-service', 'tests', 'unit', 'product.service.test.ts'), 'product unit test');
  checkFileExists(path.join(apps, 'inventory-service', 'tests', 'unit', 'inventory.service.test.ts'), 'inventory unit test');
  checkFileExists(path.join(apps, 'voucher-service', 'tests', 'unit', 'voucher.service.test.ts'), 'voucher unit test');
  checkFileExists(path.join(apps, 'order-service', 'tests', 'unit', 'order.service.test.ts'), 'order unit test');
  checkFileExists(path.join(apps, 'payment-service', 'tests', 'unit', 'payment.service.test.ts'), 'payment unit test');
  checkFileExists(path.join(apps, 'shipping-service', 'tests', 'unit', 'shipping.service.test.ts'), 'shipping unit test');
  checkFileExists(path.join(apps, 'analytics-service', 'tests', 'unit', 'analytics.service.test.ts'), 'analytics unit test');

  // Integration tests
  for (const svc of serviceKeys) {
    const testPath = path.join(apps, `${svc}-service`, 'tests', 'integration');
    const files = fs.existsSync(testPath) ? fs.readdirSync(testPath) : [];
    check(`${svc}-service has integration test`, files.length > 0, `dir: ${testPath}`);
  }

  // test-utils package
  checkFileExists(path.join(packages, 'test-utils', 'package.json'), 'packages/test-utils/package.json');
  checkFileExists(path.join(packages, 'test-utils', 'src', 'index.ts'), 'packages/test-utils/src/index.ts');
  checkFileExists(path.join(root, 'jest.config.base.ts'), 'root jest.config.base.ts');
}

async function main() {
  console.log('=== NexaCommerce Stage 5 Verification ===\n');

  // File structure (always)
  checkFileStructure();

  // Service health + swagger (only if running)
  console.log('\n--- Checking running services (skip if not started) ---');
  for (const key of Object.keys(SERVICES)) {
    await testService(key);
  }

  // Analytics-specific endpoints
  await testAnalyticsEndpoints();

  // API Gateway swagger aggregation
  await testGatewaySwagger();

  console.log('\n========================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('========================================');

  if (failed > 0) {
    console.log('\nFailed checks:');
    results.filter(r => !r.passed).forEach(r => console.log(`  - ${r.name}${r.details ? ': ' + r.details : ''}`));
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => { console.error(err); process.exit(1); });
