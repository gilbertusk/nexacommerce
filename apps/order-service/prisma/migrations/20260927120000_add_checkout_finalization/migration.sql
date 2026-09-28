ALTER TABLE "orders"
  ADD COLUMN "checkout_finalized_at" TIMESTAMP(3);

-- Orders that predate this marker completed checkout under the old direct
-- publish flow. Backfill them so they are never mistaken for an interrupted
-- saga and republished by future recovery tooling.
UPDATE "orders"
SET "checkout_finalized_at" = "created_at";

CREATE INDEX "orders_status_checkout_finalized_at_idx"
  ON "orders"("status", "checkout_finalized_at");
