-- CreateTable
CREATE TABLE "shipping_quotes" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "destination" JSONB NOT NULL,
    "shipments" JSONB NOT NULL,
    "total_cost" DECIMAL(12,2) NOT NULL,
    "cart_hash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "consumed_at" TIMESTAMP(3),
    "consumed_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shipping_quotes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "shipping_quotes_customer_id_status_idx" ON "shipping_quotes"("customer_id", "status");

-- CreateIndex
CREATE INDEX "shipping_quotes_expires_at_idx" ON "shipping_quotes"("expires_at");

-- A quote may be consumed by at most one order.
CREATE UNIQUE INDEX "shipping_quotes_consumed_by_key" ON "shipping_quotes"("consumed_by") WHERE "consumed_by" IS NOT NULL;
