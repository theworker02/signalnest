import type { Tracker, TrackerKind } from "../types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:4040/api";

type ApiTracker = {
  id: string;
  title: string;
  kind: TrackerKind;
  source: string;
  intervalSeconds: number;
  tags: string[];
  health: number;
  archived: boolean;
  lastCheckedAt?: string;
};

export type CreateTrackerInput = {
  title: string;
  kind: TrackerKind;
  source: string;
  intervalSeconds: number;
  tags: string[];
};

export async function listTrackers() {
  const response = await fetch(`${API_URL}/trackers`);
  if (!response.ok) throw new Error(`Failed to load trackers: ${response.status}`);
  const payload = (await response.json()) as { data: ApiTracker[] };
  return payload.data.map(apiTrackerToTracker);
}

export async function createTracker(input: CreateTrackerInput) {
  const response = await fetch(`${API_URL}/trackers`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error(`Failed to create tracker: ${response.status}`);
  const payload = (await response.json()) as { data: ApiTracker };
  return apiTrackerToTracker(payload.data);
}

export async function refreshTracker(id: string) {
  const response = await fetch(`${API_URL}/trackers/${id}/refresh`, { method: "POST" });
  if (!response.ok) throw new Error(`Failed to refresh tracker: ${response.status}`);
  const payload = (await response.json()) as { data: ApiTracker };
  return apiTrackerToTracker(payload.data);
}

export async function archiveTracker(id: string) {
  const response = await fetch(`${API_URL}/trackers/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ archived: true }),
  });
  if (!response.ok) throw new Error(`Failed to archive tracker: ${response.status}`);
  const payload = (await response.json()) as { data: ApiTracker };
  return apiTrackerToTracker(payload.data);
}

export async function createSkillCheckout(input: { skillId: string; skillName: string; amountCents: number; currency?: string }) {
  const response = await fetch(`${API_URL}/checkout/skill`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      ...input,
      currency: input.currency ?? "USD",
      returnUrl: `${window.location.origin}/app/skills?checkout=returned&skill=${encodeURIComponent(input.skillId)}`,
    }),
  });
  const payload = (await response.json()) as { data?: { checkoutUrl: string; paymentLinkId?: string; orderId?: string; live?: boolean }; error?: string; details?: string };
  if (!response.ok || !payload.data?.checkoutUrl) {
    throw new Error(payload.details ?? payload.error ?? `Failed to create checkout: ${response.status}`);
  }
  return payload.data;
}

export async function createDeveloperSubscriptionCheckout() {
  const response = await fetch(`${API_URL}/checkout/developer-subscription`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      returnUrl: `${window.location.origin}/app/developers?developer_subscription=returned`,
    }),
  });
  const payload = (await response.json()) as { data?: { checkoutUrl: string; paymentLinkId?: string; orderId?: string; amountCents: number; cadence: string; live?: boolean }; error?: string; details?: string };
  if (!response.ok || !payload.data?.checkoutUrl) {
    throw new Error(payload.details ?? payload.error ?? `Failed to create developer subscription checkout: ${response.status}`);
  }
  return payload.data;
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error(`Failed to login: ${response.status}`);
  return (await response.json()) as {
    data: {
      user: { id: string; email: string; mfaEnabled: boolean };
      accessToken: string;
      refreshToken: string;
    };
  };
}

function apiTrackerToTracker(tracker: ApiTracker): Tracker {
  const intervalMinutes = Math.max(1, Math.round(tracker.intervalSeconds / 60));
  return {
    id: tracker.id,
    title: tracker.title,
    kind: tracker.kind,
    source: tracker.source,
    interval: intervalMinutes === 1 ? "1m" : `${intervalMinutes}m`,
    health: tracker.health,
    delta: 0,
    severity: tracker.health < 70 ? "high" : tracker.health < 85 ? "medium" : "low",
    tags: tracker.tags,
    sparkline: [tracker.health - 4, tracker.health - 2, tracker.health, tracker.health - 1, tracker.health].map((value) => Math.max(1, Math.min(100, value))),
    timeline: [],
    archived: tracker.archived,
    lastChecked: tracker.lastCheckedAt ? new Date(tracker.lastCheckedAt).toLocaleTimeString() : undefined,
  };
}
