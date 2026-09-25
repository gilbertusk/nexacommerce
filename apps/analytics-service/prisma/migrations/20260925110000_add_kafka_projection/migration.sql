-- CreateTable
CREATE TABLE "daily_sales_projections" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "total_orders" INTEGER NOT NULL DEFAULT 0,
    "total_completed_orders" INTEGER NOT NULL DEFAULT 0,
    "total_cancelled_orders" INTEGER NOT NULL DEFAULT 0,
    "total_revenue" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_items_sold" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_sales_projections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_sales_projections_date_key" ON "daily_sales_projections"("date");

-- CreateTable
CREATE TABLE "kafka_projection_progress" (
    "id" TEXT NOT NULL,
    "consumer_group" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "partition" INTEGER NOT NULL,
    "last_offset" BIGINT NOT NULL,
    "last_event_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kafka_projection_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kafka_projection_progress_group_topic_partition_key" ON "kafka_projection_progress"("consumer_group", "topic", "partition");
