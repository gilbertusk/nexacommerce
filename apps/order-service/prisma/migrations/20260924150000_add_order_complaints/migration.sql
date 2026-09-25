CREATE TABLE IF NOT EXISTS "order_complaints" (
  "id" TEXT NOT NULL,
  "order_id" TEXT NOT NULL,
  "customer_id" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "description" VARCHAR(2000) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "admin_note" VARCHAR(1000),
  "resolved_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "order_complaints_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "order_complaints_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "order_complaints_order_id_customer_id_key"
  ON "order_complaints"("order_id", "customer_id");
CREATE INDEX IF NOT EXISTS "order_complaints_status_created_at_idx"
  ON "order_complaints"("status", "created_at");
