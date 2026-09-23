#!/bin/bash
set -e

echo "Running migrations for all services..."

services=("auth-service" "user-service" "product-service" "inventory-service" "order-service" "payment-service" "voucher-service" "shipping-service" "review-service" "notification-service" "analytics-service")

for service in "${services[@]}"; do
  schema_path="apps/$service/prisma/schema.prisma"
  if [ -f "$schema_path" ]; then
    echo "--------------------------------------------------"
    echo "Migrating: $service"
    echo "--------------------------------------------------"
    (cd "apps/$service" && npx prisma migrate deploy)
  fi
done

echo "All migrations complete."
