ALTER TABLE "payment_webhook_logs" ADD COLUMN IF NOT EXISTS "event_key" TEXT;

UPDATE "payment_webhook_logs"
SET "event_key" = "id"
WHERE "event_key" IS NULL;

ALTER TABLE "payment_webhook_logs" ALTER COLUMN "event_key" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "payment_webhook_logs_event_key_key" ON "payment_webhook_logs"("event_key");
