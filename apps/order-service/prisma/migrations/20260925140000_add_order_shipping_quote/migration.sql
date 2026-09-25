-- AlterTable: bind an order to the server-issued shipping quote it was priced
-- from, and record the per-seller split-shipment breakdown.
ALTER TABLE "orders" ADD COLUMN "shipping_quote_id" TEXT;
ALTER TABLE "orders" ADD COLUMN "shipment_breakdown" JSONB;

-- A quote may price at most one order.
CREATE UNIQUE INDEX "orders_shipping_quote_id_key" ON "orders"("shipping_quote_id");
