import { incrementCounter, setGauge } from "./metrics.js";
import { trackerStore, type ApiTracker } from "./repository.js";

export type TrackerRunResult = {
  tracker: ApiTracker;
  changed: boolean;
  previousHealth: number;
  nextHealth: number;
  lagSeconds: number;
};

export function runTrackerCheck(trackerId: string, now = new Date()): TrackerRunResult | null {
  const tracker = trackerStore.find((item) => item.id === trackerId && !item.archived && item.enabled);
  if (!tracker) return null;

  const previousHealth = tracker.health;
  const jitter = seededDelta(`${tracker.id}:${now.getUTCMinutes()}`);
  const nextHealth = Math.max(1, Math.min(100, previousHealth + jitter));
  const lastCheck = tracker.lastCheckedAt ? new Date(tracker.lastCheckedAt).getTime() : new Date(tracker.updatedAt).getTime();
  const lagSeconds = Math.max(0, Math.round((now.getTime() - lastCheck) / 1000 - tracker.intervalSeconds));

  tracker.health = nextHealth;
  tracker.lastCheckedAt = now.toISOString();
  tracker.updatedAt = tracker.lastCheckedAt;

  incrementCounter("signalnest_tracker_refresh_total");
  setGauge("signalnest_tracker_lag_seconds", lagSeconds);
  setGauge("signalnest_active_trackers", trackerStore.filter((item) => item.enabled && !item.archived).length);

  return {
    tracker,
    changed: Math.abs(nextHealth - previousHealth) >= 3,
    previousHealth,
    nextHealth,
    lagSeconds,
  };
}

export function runDueTrackerChecks(now = new Date()) {
  return trackerStore
    .filter((tracker) => tracker.enabled && !tracker.archived)
    .map((tracker) => runTrackerCheck(tracker.id, now))
    .filter((result): result is TrackerRunResult => Boolean(result));
}

function seededDelta(input: string) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return (hash % 9) - 4;
}
