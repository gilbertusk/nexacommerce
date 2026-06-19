import dotenv from 'dotenv';
import path from 'path';

// Load environmental variables from root folder if present
dotenv.config({ path: path.join(__dirname, '../../../../.env') });
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT_API_GATEWAY || '3000', 10),
  authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  productServiceUrl: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3003',
  userServiceUrl: process.env.USER_SERVICE_URL || 'http://localhost:3002',
  inventoryServiceUrl: process.env.INVENTORY_SERVICE_URL || 'http://localhost:3007',
  jwtSecret: process.env.JWT_SECRET || 'my-super-secret-local-key',
};
