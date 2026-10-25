/**
 * Runs before tests/setup.ts for the HA suite: Order Service connects to the
 * 3-node TLS cluster as the least-privilege `order-service` user, listing every
 * node, and only verifies (never declares) the topology.
 */
import { haEnv } from '@nexacommerce/test-utils';

process.env.RABBITMQ_URL = haEnv('HA_RABBITMQ_ORDER_URLS');
process.env.RABBITMQ_TLS_CA_FILE = haEnv('HA_CA_FILE');
process.env.RABBITMQ_TOPOLOGY_MODE = 'verify';
process.env.ORDER_OUTBOX_POLL_INTERVAL_MS = '500';
