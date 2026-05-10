-- Additional production indexes for SignalNest query paths.
-- Prisma owns table creation; this file documents indexes worth applying
-- during a PostgreSQL hardening pass when traffic patterns are known.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trackers_source_trgm
  ON "Tracker" USING gin ("source" gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signal_event_recent_critical
  ON "SignalEvent" ("createdAt" DESC)
  WHERE "severity" IN ('high', 'critical');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_snapshot_tracker_hash_created
  ON "Snapshot" ("trackerId", "contentHash", "createdAt" DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_saved_item_collection_updated
  ON "SavedItem" ("userId", "collection", "updatedAt" DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notification_unread_priority
  ON "Notification" ("priority", "createdAt" DESC)
  WHERE "readAt" IS NULL;
