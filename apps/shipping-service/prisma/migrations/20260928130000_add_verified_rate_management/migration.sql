ALTER TABLE "couriers"
  ADD COLUMN IF NOT EXISTS "created_by" TEXT,
  ADD COLUMN IF NOT EXISTS "updated_by" TEXT;

ALTER TABLE "shipping_rates"
  ADD COLUMN IF NOT EXISTS "created_by" TEXT,
  ADD COLUMN IF NOT EXISTS "updated_by" TEXT,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX IF NOT EXISTS "shipping_rates_route_service_weight_key"
  ON "shipping_rates"("courier_id", "origin_city", "destination_city", "service_code", "weight");

CREATE INDEX IF NOT EXISTS "shipping_rates_origin_city_destination_city_idx"
  ON "shipping_rates"("origin_city", "destination_city");
