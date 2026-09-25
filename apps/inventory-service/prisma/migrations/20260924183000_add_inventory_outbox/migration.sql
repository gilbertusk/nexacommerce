CREATE TABLE "outbox_events" (
  "id" TEXT NOT NULL,
  "aggregate_type" TEXT NOT NULL,
  "aggregate_id" TEXT NOT NULL,
  "event_name" TEXT NOT NULL,
  "routing_key" TEXT NOT NULL,
  "event_payload" JSONB NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "available_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "locked_at" TIMESTAMP(3),
  "lock_token" TEXT,
  "published_at" TIMESTAMP(3),
  "last_error" VARCHAR(1000),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "outbox_events_status_available_at_idx"
  ON "outbox_events"("status", "available_at");
CREATE INDEX "outbox_events_locked_at_idx" ON "outbox_events"("locked_at");
CREATE INDEX "outbox_events_aggregate_type_aggregate_id_idx"
  ON "outbox_events"("aggregate_type", "aggregate_id");
