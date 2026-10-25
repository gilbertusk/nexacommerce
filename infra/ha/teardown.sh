#!/usr/bin/env bash
# Stop and delete only the HA staging project (containers, network, volumes)
# and its generated secrets.
set -euo pipefail
cd "$(dirname "$0")"
docker compose -f docker-compose.ha.yml down -v --remove-orphans
rm -rf .generated
