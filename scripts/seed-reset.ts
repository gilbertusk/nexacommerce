import { PrismaClient as AuthClient } from '../apps/auth-service/src/generated/client';
import { PrismaClient as UserClient } from '../apps/user-service/src/generated/client';
import { PrismaClient as ProductClient } from '../apps/product-service/src/generated/client';
import { PrismaClient as InventoryClient } from '../apps/inventory-service/src/generated/client';
import { PrismaClient as VoucherClient } from '../apps/voucher-service/src/generated/client';
import { PrismaClient as ShippingClient } from '../apps/shipping-service/src/generated/client';
import { PrismaClient as OrderClient } from '../apps/order-service/src/generated/client';
import { PrismaClient as PaymentClient } from '../apps/payment-service/src/generated/client';
import { PrismaClient as ReviewClient } from '../apps/review-service/src/generated/client';
import { PrismaClient as NotificationClient } from '../apps/notification-service/src/generated/client';
import { PrismaClient as AnalyticsClient } from '../apps/analytics-service/src/generated/client';
import { execSync } from 'child_process';
import path from 'path';

const connectionStrings = {
  auth: 'postgresql://postgres:postgres123@localhost:5445/nexacommerce_db?schema=auth',
  users: 'postgresql://postgres:postgres123@localhost:5445/nexacommerce_db?schema=users',
  products: 'postgresql://postgres:postgres123@localhost:5445/nexacommerce_db?schema=products',
  inventory: 'postgresql://postgres:postgres123@localhost:5445/nexacommerce_db?schema=inventory',
  vouchers: 'postgresql://postgres:postgres123@localhost:5445/nexacommerce_db?schema=vouchers',
  shipping: 'postgresql://postgres:postgres123@localhost:5445/nexacommerce_db?schema=shipping',
  order: 'postgresql://postgres:postgres123@localhost:5445/nexacommerce_db?schema=orders',
  payment: 'postgresql://postgres:postgres123@localhost:5445/nexacommerce_db?schema=payments',
  review: 'postgresql://postgres:postgres123@localhost:5445/nexacommerce_db?schema=reviews',
  notification: 'postgresql://postgres:postgres123@localhost:5445/nexacommerce_db?schema=notifications',
  analytics: 'postgresql://postgres:postgres123@localhost:5445/nexacommerce_db?schema=analytics',
};

async function main() {
  console.log('Resetting databases...');

  const auth = new AuthClient({ datasources: { db: { url: connectionStrings.auth } } });
  const users = new UserClient({ datasources: { db: { url: connectionStrings.users } } });
  const products = new ProductClient({ datasources: { db: { url: connectionStrings.products } } });
  const inventory = new InventoryClient({ datasources: { db: { url: connectionStrings.inventory } } });
  const vouchers = new VoucherClient({ datasources: { db: { url: connectionStrings.vouchers } } });
  const shipping = new ShippingClient({ datasources: { db: { url: connectionStrings.shipping } } });
  const order = new OrderClient({ datasources: { db: { url: connectionStrings.order } } });
  const payment = new PaymentClient({ datasources: { db: { url: connectionStrings.payment } } });
  const review = new ReviewClient({ datasources: { db: { url: connectionStrings.review } } });
  const notification = new NotificationClient({ datasources: { db: { url: connectionStrings.notification } } });
  const analytics = new AnalyticsClient({ datasources: { db: { url: connectionStrings.analytics } } });

  try {
    // Truncate Auth
    console.log('- Truncating Auth Schema...');
    await auth.$executeRawUnsafe('TRUNCATE TABLE "users", "refresh_tokens", "password_reset_tokens", "email_verification_tokens", "login_histories" CASCADE;');

    // Truncate Users
    console.log('- Truncating Users Schema...');
    await users.$executeRawUnsafe('TRUNCATE TABLE "user_profiles", "seller_profiles", "addresses" CASCADE;');

    // Truncate Products
    console.log('- Truncating Products Schema...');
    await products.$executeRawUnsafe('TRUNCATE TABLE "products", "categories", "brands", "product_images" CASCADE;');

    // Truncate Inventory
    console.log('- Truncating Inventory Schema...');
    await inventory.$executeRawUnsafe('TRUNCATE TABLE "inventories", "stock_movements", "stock_reservations" CASCADE;');

    // Truncate Vouchers
    console.log('- Truncating Vouchers Schema...');
    await vouchers.$executeRawUnsafe('TRUNCATE TABLE "vouchers", "voucher_usages" CASCADE;');

    // Truncate Shipping
    console.log('- Truncating Shipping Schema...');
    // We don't truncate couriers or shipping_rates to avoid breaking standard rates/couriers seeded in stage 4,
    // but we do truncate shipping_orders
    await shipping.$executeRawUnsafe('TRUNCATE TABLE "shipping_orders", "shipping_status_histories" CASCADE;');

    // Truncate Orders
    console.log('- Truncating Orders Schema...');
    await order.$executeRawUnsafe('TRUNCATE TABLE "orders", "order_items", "order_status_histories" CASCADE;');

    // Truncate Payments
    console.log('- Truncating Payments Schema...');
    await payment.$executeRawUnsafe('TRUNCATE TABLE "payments", "payment_refunds" CASCADE;');

    // Truncate Reviews
    console.log('- Truncating Reviews Schema...');
    await review.$executeRawUnsafe('TRUNCATE TABLE "reviews", "review_images", "review_reports", "product_rating_summaries" CASCADE;');

    // Truncate Notifications
    console.log('- Truncating Notifications Schema...');
    await notification.$executeRawUnsafe('TRUNCATE TABLE "notifications", "email_logs", "email_templates" CASCADE;');

    // Truncate Analytics
    console.log('- Truncating Analytics Schema...');
    await analytics.$executeRawUnsafe('TRUNCATE TABLE "daily_sales_reports", "monthly_sales_reports", "product_sales_reports", "seller_performance_reports", "payment_reports", "category_performance_reports", "analytics_events" CASCADE;');

    console.log('Reset complete. Triggering seed script...');
    execSync('npm run seed', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  } catch (err) {
    console.error('Error during database reset:', err);
    process.exit(1);
  } finally {
    await auth.$disconnect();
    await users.$disconnect();
    await products.$disconnect();
    await inventory.$disconnect();
    await vouchers.$disconnect();
    await shipping.$disconnect();
    await order.$disconnect();
    await payment.$disconnect();
    await review.$disconnect();
    await notification.$disconnect();
    await analytics.$disconnect();
  }
}

main();
