ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "return_received_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "return_received_by" TEXT,
  ADD COLUMN IF NOT EXISTS "return_receipt_note" VARCHAR(1000);
