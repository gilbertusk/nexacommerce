process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'my-super-secret-local-key';
process.env.DATABASE_URL ??= 'postgresql://postgres:postgres123@localhost:5445/nexacommerce_db?schema=shipping_test';
process.env.PORT = '3009';
process.env.RABBITMQ_URL = 'amqp://guest:guest@localhost:5672';
process.env.RAJAONGKIR_API_KEY = 'test-api-key';
