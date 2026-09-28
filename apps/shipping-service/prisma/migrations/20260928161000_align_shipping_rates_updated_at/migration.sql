-- `20260928130000_add_verified_rate_management` added `updated_at` with a
-- DEFAULT so existing rows could be backfilled under NOT NULL. The Prisma
-- schema declares the column `@updatedAt` (application-maintained, no database
-- default), so every fresh deploy reported drift. Existing rows keep their
-- backfilled values; only the column default is removed.
ALTER TABLE "shipping_rates" ALTER COLUMN "updated_at" DROP DEFAULT;
