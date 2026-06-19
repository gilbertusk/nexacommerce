import dotenv from 'dotenv';
import path from 'path';

// Load variables from root .env if it exists
dotenv.config({ path: path.join(__dirname, '../../../../.env') });
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT_PRODUCT_SERVICE || '3003', 10),
  databaseUrl: process.env.DATABASE_URL,
};
