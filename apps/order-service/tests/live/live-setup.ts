/**
 * Runs before tests/setup.ts for the live suite. Service config reads
 * RABBITMQ_URL at import time, so the disposable vhost name is fixed here and
 * the vhost itself is created in the suite's beforeAll.
 */
import { acceptanceVhostName, liveAmqpUrl } from '@nexacommerce/test-utils';

const vhost = acceptanceVhostName('phase3-order-live');
process.env.PHASE3_ORDER_VHOST = vhost;
process.env.RABBITMQ_URL = liveAmqpUrl(vhost);
process.env.ORDER_OUTBOX_POLL_INTERVAL_MS = '500';
