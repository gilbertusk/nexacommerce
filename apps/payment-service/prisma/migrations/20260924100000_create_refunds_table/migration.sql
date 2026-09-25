CREATE TABLE IF NOT EXISTS "refunds" (
  "id" TEXT NOT NULL,
  "payment_id" TEXT NOT NULL,
  "order_id" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "reason" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "processed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "refunds_payment_id_status_idx" ON "refunds"("payment_id", "status");
CREATE INDEX IF NOT EXISTS "refunds_order_id_idx" ON "refunds"("order_id");
