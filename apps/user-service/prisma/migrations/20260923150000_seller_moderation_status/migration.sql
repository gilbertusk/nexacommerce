ALTER TABLE "seller_profiles"
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'PENDING';

UPDATE "seller_profiles"
SET "status" = 'ACTIVE'
WHERE "is_verified" = TRUE;
