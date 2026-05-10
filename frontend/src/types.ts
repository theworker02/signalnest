import type { LucideIcon } from "lucide-react";

export type Theme = "dark" | "light" | "system";
export type Density = "comfortable" | "compact" | "terminal";
export type TrackerKind =
  | "website"
  | "rss"
  | "api"
  | "github"
  | "news"
  | "stock"
  | "weather"
  | "outage"
  | "keyword"
  | "subreddit";

export interface NavItem {
  icon: LucideIcon;
  label: string;
  to: string;
  shortcut: string;
  pinned?: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  status: "active" | "quiet" | "critical";
  boards: string[];
}

export interface SignalEvent {
  id: string;
  title: string;
  source: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: string;
  summary: string;
}

export interface Tracker {
  id: string;
  title: string;
  kind: TrackerKind;
  source: string;
  interval: string;
  health: number;
  delta: number;
  severity: SignalEvent["severity"];
  tags: string[];
  sparkline: number[];
  timeline: SignalEvent[];
  archived?: boolean;
  lastChecked?: string;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  priority: SignalEvent["severity"];
  enabled: boolean;
  muteWindow: string;
  lastTriggered: string;
}

export interface VaultItem {
  id: string;
  title: string;
  kind: "article" | "snapshot" | "note" | "bookmark" | "image";
  collection: string;
  tags: string[];
  updated: string;
  excerpt: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  body?: string;
  tone: "info" | "success" | "warning" | "danger";
}
