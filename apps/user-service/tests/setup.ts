process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'my-super-secret-local-key';
process.env.DATABASE_URL = 'postgresql://postgres:postgres123@localhost:5445/nexacommerce_db?schema=user_test';
process.env.PORT = '3002';
process.env.RABBITMQ_URL = 'amqp://guest:guest@localhost:5672';
