#!/usr/bin/env bash
# Build and start the HA staging topology, then provision least-privilege
# users and the production queue topology. Generates fresh random secrets and
# a private CA on every run into infra/ha/.generated (git-ignored). Never prints
# a password; the test environment is written to .generated/ha.env.
set -euo pipefail
cd "$(dirname "$0")"
GEN=.generated
rm -rf "$GEN"
mkdir -p "$GEN/tls" "$GEN/redis"
secret() { openssl rand -hex 24; }

RMQ_ADMIN_PASS=$(secret); RMQ_COOKIE=$(openssl rand -hex 32)
REDIS_ADMIN_PASS=$(secret); REDIS_REPL_PASS=$(secret); REDIS_SENTINEL_AUTH=$(secret)
SENTINEL_CLIENT_PASS=$(secret); GATEWAY_PASS=$(secret); CART_PASS=$(secret)

# ── Private CA and one server certificate with every node's name and IP ──
openssl req -x509 -newkey rsa:2048 -nodes -days 7 -subj "/CN=nexacommerce-ha-staging-ca" \
  -keyout "$GEN/tls/ca-key.pem" -out "$GEN/tls/ca.pem" 2>/dev/null
cat > "$GEN/tls/san.cnf" <<CNF
[req]
distinguished_name=dn
[dn]
[ext]
subjectAltName=DNS:rmq-1,DNS:rmq-2,DNS:rmq-3,DNS:redis-primary,DNS:localhost,IP:127.0.0.1,IP:172.29.10.11,IP:172.29.10.12,IP:172.29.10.13,IP:172.29.10.21,IP:172.29.10.22,IP:172.29.10.23,IP:172.29.10.31,IP:172.29.10.32,IP:172.29.10.33
extendedKeyUsage=serverAuth,clientAuth
CNF
openssl req -newkey rsa:2048 -nodes -subj "/CN=nexacommerce-ha-node" \
  -keyout "$GEN/tls/server-key.pem" -out "$GEN/tls/server.csr" 2>/dev/null
openssl x509 -req -in "$GEN/tls/server.csr" -CA "$GEN/tls/ca.pem" -CAkey "$GEN/tls/ca-key.pem" \
  -CAcreateserial -days 7 -extfile "$GEN/tls/san.cnf" -extensions ext -out "$GEN/tls/server.pem" 2>/dev/null
rm -f "$GEN/tls/ca-key.pem" "$GEN/tls/server.csr" "$GEN/tls/ca.srl"
# Containers run as uid 999; staging-only permissive read on generated files.
chmod 644 "$GEN"/tls/*

# ── RabbitMQ ──
cat > "$GEN/rabbitmq.env" <<ENV
RABBITMQ_SERVER_ADDITIONAL_ERL_ARGS=-setcookie $RMQ_COOKIE
RABBITMQ_CTL_ERL_ARGS=-setcookie $RMQ_COOKIE
RABBITMQ_DEFAULT_USER=ops-admin
RABBITMQ_DEFAULT_PASS=$RMQ_ADMIN_PASS
ENV
cat > "$GEN/rabbitmq.conf" <<CONF
cluster_formation.peer_discovery_backend = classic_config
cluster_formation.classic_config.nodes.1 = rabbit@rmq-1
cluster_formation.classic_config.nodes.2 = rabbit@rmq-2
cluster_formation.classic_config.nodes.3 = rabbit@rmq-3
cluster_partition_handling = pause_minority
net_ticktime = 10
default_queue_type = quorum
listeners.tcp = none
listeners.ssl.default = 5671
ssl_options.cacertfile = /etc/rabbitmq/tls/ca.pem
ssl_options.certfile = /etc/rabbitmq/tls/server.pem
ssl_options.keyfile = /etc/rabbitmq/tls/server-key.pem
ssl_options.verify = verify_none
ssl_options.fail_if_no_peer_cert = false
management.ssl.port = 15671
management.ssl.cacertfile = /etc/rabbitmq/tls/ca.pem
management.ssl.certfile = /etc/rabbitmq/tls/server.pem
management.ssl.keyfile = /etc/rabbitmq/tls/server-key.pem
loopback_users.guest = true
disk_free_limit.absolute = 256MB
CONF

# ── Redis: ACL default-deny, TLS only, noeviction ──
cat > "$GEN/redis/users.acl" <<ACL
user default off
user ops-admin on >$REDIS_ADMIN_PASS ~* &* +@all
user replicator on >$REDIS_REPL_PASS +psync +replconf +ping
user sentinel on >$REDIS_SENTINEL_AUTH allchannels +multi +slaveof +replicaof +ping +exec +subscribe +config|rewrite +role +publish +info +client|setname +client|kill +script|kill
user api-gateway on >$GATEWAY_PASS ~rate-limit:* -@all +@read +@write +@connection -@dangerous +eval +evalsha +role +info
user cart-service on >$CART_PASS ~cart:* -@all +@read +@write +@connection -@dangerous +role +info
ACL
common_redis() {
  cat <<CONF
port 0
tls-port 6379
tls-cert-file /tls/server.pem
tls-key-file /tls/server-key.pem
tls-ca-cert-file /tls/ca.pem
tls-auth-clients no
tls-replication yes
aclfile /conf/users.acl
masteruser replicator
masterauth $REDIS_REPL_PASS
maxmemory 64mb
maxmemory-policy noeviction
appendonly yes
dir /data
CONF
}
common_redis > "$GEN/redis/primary.conf"
{ common_redis; echo "replicaof 172.29.10.21 6379"; } > "$GEN/redis/replica.conf"
cat > "$GEN/redis/sentinel.conf" <<CONF
port 0
tls-port 26379
tls-cert-file /tls/server.pem
tls-key-file /tls/server-key.pem
tls-ca-cert-file /tls/ca.pem
tls-auth-clients no
tls-replication yes
requirepass $SENTINEL_CLIENT_PASS
sentinel sentinel-pass $SENTINEL_CLIENT_PASS
sentinel monitor nexa-primary 172.29.10.21 6379 2
sentinel auth-user nexa-primary sentinel
sentinel auth-pass nexa-primary $REDIS_SENTINEL_AUTH
sentinel down-after-milliseconds nexa-primary 3000
sentinel failover-timeout nexa-primary 10000
sentinel parallel-syncs nexa-primary 1
dir /data
CONF
chmod 644 "$GEN"/redis/* "$GEN"/rabbitmq.*

docker compose -f docker-compose.ha.yml up -d --wait --wait-timeout 240

# ── RabbitMQ: cluster check, users with least privilege, topology ──
ctl() { docker compose -f docker-compose.ha.yml exec -T rmq-1 rabbitmqctl -q "$@"; }
ctl await_online_nodes 3
ctl add_vhost nexacommerce >/dev/null
ctl set_permissions -p nexacommerce ops-admin '.*' '.*' '.*'
ctl delete_user guest >/dev/null 2>&1 || true
declare -A RMQ_PASS
# Each service may publish to the event exchanges and read only its own queues.
provision() {
  local user=$1 read=$2 pass; pass=$(secret)
  ctl add_user "$user" "$pass" >/dev/null
  ctl set_permissions -p nexacommerce "$user" '^$' '^nexacommerce\.events(\.retry|\.dead)?$' "$read"
  RMQ_PASS[$user]=$pass
}
provision order-service '^(order-service\..*|nexacommerce\.events.*)$'
provision notification-service '^(notification-service\..*|nexacommerce\.events.*)$'

cat > "$GEN/ha.env" <<ENV
HA_CA_FILE=$PWD/$GEN/tls/ca.pem
HA_RABBITMQ_ADMIN_URLS=amqps://ops-admin:$RMQ_ADMIN_PASS@172.29.10.11:5671/nexacommerce,amqps://ops-admin:$RMQ_ADMIN_PASS@172.29.10.12:5671/nexacommerce,amqps://ops-admin:$RMQ_ADMIN_PASS@172.29.10.13:5671/nexacommerce
HA_RABBITMQ_ORDER_URLS=amqps://order-service:${RMQ_PASS[order-service]}@172.29.10.11:5671/nexacommerce,amqps://order-service:${RMQ_PASS[order-service]}@172.29.10.12:5671/nexacommerce,amqps://order-service:${RMQ_PASS[order-service]}@172.29.10.13:5671/nexacommerce
HA_RABBITMQ_MANAGEMENT_URL=https://ops-admin:$RMQ_ADMIN_PASS@172.29.10.11:15671
HA_REDIS_SENTINELS=172.29.10.31:26379,172.29.10.32:26379,172.29.10.33:26379
HA_REDIS_SENTINEL_NAME=nexa-primary
HA_REDIS_SENTINEL_PASSWORD=$SENTINEL_CLIENT_PASS
HA_REDIS_GATEWAY_URL=rediss://api-gateway:$GATEWAY_PASS@172.29.10.21:6379
HA_REDIS_CART_URL=rediss://cart-service:$CART_PASS@172.29.10.21:6379
HA_REDIS_ADMIN_URL=rediss://ops-admin:$REDIS_ADMIN_PASS@172.29.10.21:6379
HA_COMPOSE_FILE=$PWD/docker-compose.ha.yml
ENV
chmod 600 "$GEN/ha.env"
echo "HA staging is up. Test environment: infra/ha/$GEN/ha.env"
