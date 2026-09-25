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
