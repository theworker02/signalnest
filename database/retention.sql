-- Retention helpers for scheduled maintenance jobs.

DELETE FROM "SignalEvent"
WHERE "createdAt" < now() - interval '180 days'
  AND "severity" IN ('low', 'medium');

DELETE FROM "Snapshot"
WHERE "createdAt" < now() - interval '365 days'
  AND "metadata"->>'pinned' IS DISTINCT FROM 'true';

DELETE FROM "Session"
WHERE "expiresAt" < now()
   OR "revokedAt" < now() - interval '30 days';
