import dotenv from 'dotenv';
import path from 'path';
import { assertProductionSecret } from '@nexacommerce/common';

// Load environmental variables from root folder if present
dotenv.config({ path: path.join(__dirname, '../../../../.env') });
dotenv.config();

const jwtSecret = process.env.JWT_SECRET || 'my-super-secret-local-key';
assertProductionSecret('JWT_SECRET', jwtSecret, [
  'my-super-secret-local-key',
  'super-secret-key-change-in-production',
  'supersecretjwtkey123',
]);
const corsOrigins = assertProductionSecret(
  'CORS_ORIGINS',
  process.env.CORS_ORIGINS,
).split(',').map((origin) => origin.trim()).filter(Boolean);
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
assertProductionSecret('REDIS_URL', redisUrl, ['redis://localhost:6379']);

export const config = {
  port: parseInt(process.env.PORT_API_GATEWAY || '3000', 10),
  authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  productServiceUrl: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3003',
  userServiceUrl: process.env.USER_SERVICE_URL || 'http://localhost:3002',
  inventoryServiceUrl: process.env.INVENTORY_SERVICE_URL || 'http://localhost:3007',
  cartServiceUrl: process.env.CART_SERVICE_URL || 'http://localhost:3004',
  orderServiceUrl: process.env.ORDER_SERVICE_URL || 'http://localhost:3005',
  paymentServiceUrl: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3006',
  voucherServiceUrl: process.env.VOUCHER_SERVICE_URL || 'http://localhost:3008',
  shippingServiceUrl: process.env.SHIPPING_SERVICE_URL || 'http://localhost:3009',
  reviewServiceUrl: process.env.REVIEW_SERVICE_URL || 'http://localhost:3010',
  notificationServiceUrl: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3011',
  analyticsServiceUrl: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3012',
  jwtSecret,
  redisUrl,
  allowedOrigins: corsOrigins.length > 0
    ? corsOrigins
    : ['http://localhost:3020', 'http://localhost:3021', 'http://localhost:3022'],
};
