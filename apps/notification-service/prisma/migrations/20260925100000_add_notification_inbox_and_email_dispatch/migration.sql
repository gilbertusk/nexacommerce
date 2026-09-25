-- AlterTable: give email_logs durable dispatcher claim fields.
ALTER TABLE "email_logs" ADD COLUMN "available_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "email_logs" ADD COLUMN "locked_at" TIMESTAMP(3);
ALTER TABLE "email_logs" ADD COLUMN "lock_token" TEXT;

-- CreateIndex
CREATE INDEX "email_logs_status_available_at_idx" ON "email_logs"("status", "available_at");

-- CreateIndex
CREATE INDEX "email_logs_locked_at_idx" ON "email_logs"("locked_at");

-- CreateTable
CREATE TABLE "inbox_events" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "consumer" TEXT NOT NULL,
    "event_name" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROCESSING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_error" VARCHAR(1000),
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inbox_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inbox_events_event_id_consumer_key" ON "inbox_events"("event_id", "consumer");

-- CreateIndex
CREATE INDEX "inbox_events_consumer_status_idx" ON "inbox_events"("consumer", "status");
