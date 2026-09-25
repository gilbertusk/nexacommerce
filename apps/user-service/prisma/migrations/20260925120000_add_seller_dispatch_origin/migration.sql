-- AlterTable: structured dispatch origin for per-seller shipping quotes.
-- Nullable by design: a seller without a verified origin must block checkout
-- rather than fall back to an assumed warehouse location.
ALTER TABLE "seller_profiles" ADD COLUMN "origin_city" TEXT;
ALTER TABLE "seller_profiles" ADD COLUMN "origin_province" TEXT;
ALTER TABLE "seller_profiles" ADD COLUMN "origin_verified_at" TIMESTAMP(3);
