-- One marketplace order may contain one independently fulfilled parcel per
-- seller. Existing rows remain readable with a NULL seller_id; application
-- writes after this migration always provide a real seller id.
ALTER TABLE "shipping_orders" ADD COLUMN "seller_id" TEXT;

DROP INDEX "shipping_orders_order_id_key";

CREATE UNIQUE INDEX "shipping_orders_order_id_seller_id_key"
  ON "shipping_orders"("order_id", "seller_id");
CREATE INDEX "shipping_orders_order_id_idx" ON "shipping_orders"("order_id");
CREATE INDEX "shipping_orders_seller_id_idx" ON "shipping_orders"("seller_id");
