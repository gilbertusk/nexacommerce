import dotenv from 'dotenv';
import path from 'path';
import { assertProductionSecret } from '@nexacommerce/common';

dotenv.config({ path: path.join(__dirname, '../../../../.env') });
dotenv.config();

const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
assertProductionSecret('RABBITMQ_URL', rabbitmqUrl, ['amqp://guest:guest@localhost:5672']);

export const config = {
  port: parseInt(process.env.PORT_PRODUCT_SERVICE || '3003', 10),
  databaseUrl: process.env.DATABASE_URL,
  rabbitmqUrl,
  reviewServiceUrl: process.env.REVIEW_SERVICE_URL || 'http://localhost:3010',
};
