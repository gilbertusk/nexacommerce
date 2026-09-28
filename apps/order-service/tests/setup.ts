process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'my-super-secret-local-key';
process.env.DATABASE_URL ??= 'postgresql://postgres:postgres123@localhost:5445/nexacommerce_db?schema=order_test';
process.env.PORT = '3005';
process.env.RABBITMQ_URL ??= 'amqp://guest:guest@localhost:5672';
process.env.INVENTORY_SERVICE_URL = 'http://localhost:3004';
process.env.VOUCHER_SERVICE_URL = 'http://localhost:3007';
process.env.SHIPPING_SERVICE_URL = 'http://localhost:3009';
