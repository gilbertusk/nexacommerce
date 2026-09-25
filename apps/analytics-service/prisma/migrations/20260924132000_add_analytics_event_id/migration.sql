ALTER TABLE "analytics_events" ADD COLUMN "event_id" TEXT;

CREATE UNIQUE INDEX "analytics_events_event_id_key"
  ON "analytics_events"("event_id");
