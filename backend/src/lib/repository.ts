import type { z } from "zod";

export type ApiTracker = {
  id: string;
  title: string;
  kind: "website" | "rss" | "api" | "github" | "news" | "stock" | "weather" | "outage" | "keyword" | "subreddit";
  source: string;
  intervalSeconds: number;
  tags: string[];
  health: number;
  enabled: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  lastCheckedAt?: string;
};

export type ApiAlert = {
  id: string;
  name: string;
  condition: string;
  priority: "low" | "medium" | "high" | "critical";
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ApiUser = {
  id: string;
  email: string;
  passwordHash: string;
  mfaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ApiSession = {
  id: string;
  userId: string;
  refreshToken: string;
  tokenFamilyId: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: string;
  revokedAt?: string;
  createdAt: string;
};

const now = () => new Date().toISOString();

export const trackerStore: ApiTracker[] = [
  {
    id: "trk-arc",
    title: "Arc Browser Releases",
    kind: "website",
    source: "https://arc.net/releases",
    intervalSeconds: 600,
    tags: ["browser", "product"],
    health: 99,
    enabled: true,
    archived: false,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "trk-cdn",
    title: "CDN Outage Mesh",
    kind: "outage",
    source: "status + ping mesh",
    intervalSeconds: 30,
    tags: ["infra", "availability"],
    health: 82,
    enabled: true,
    archived: false,
    createdAt: now(),
    updatedAt: now(),
  },
];

export const alertStore: ApiAlert[] = [
  {
    id: "alert-1",
    name: "Critical outage amplification",
    condition: "severity >= critical AND sources >= 3",
    priority: "critical",
    enabled: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "alert-2",
    name: "Pricing page movement",
    condition: "visual_delta > 12 OR currency_string_changed",
    priority: "high",
    enabled: true,
    createdAt: now(),
    updatedAt: now(),
  },
];

export const userStore: ApiUser[] = [];
export const sessionStore: ApiSession[] = [];

export function paginate<T>(rows: T[], query: { limit?: number; cursor?: string }, getId: (row: T) => string) {
  const limit = Math.min(Math.max(query.limit ?? 25, 1), 100);
  const start = query.cursor ? Math.max(0, rows.findIndex((row) => getId(row) === query.cursor) + 1) : 0;
  const data = rows.slice(start, start + limit);
  const nextCursor = data.length === limit ? getId(data[data.length - 1]) : null;
  return { data, nextCursor };
}

export type InferSchema<T extends z.ZodType> = z.infer<T>;
