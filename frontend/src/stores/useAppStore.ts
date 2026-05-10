import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AlertRule, Density, Theme, ToastMessage, Tracker, VaultItem } from "../types";
import { alerts, signalEvents, trackers, vaultItems } from "../data/mockData";

const createToast = (toast: Omit<ToastMessage, "id">): ToastMessage => ({
  ...toast,
  id: `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`,
});

const randomToken = (prefix: string, bytes = 24) => {
  const values = new Uint8Array(bytes);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(values);
  } else {
    values.forEach((_, index) => {
      values[index] = Math.floor(Math.random() * 256);
    });
  }
  return `${prefix}_${Array.from(values, (value) => value.toString(16).padStart(2, "0")).join("")}`;
};

const maskSecret = (secret: string) => `secret-hidden-${secret.slice(-6)}`;

interface WorkspaceLayout {
  left: number;
  right: number;
  bottom: boolean;
}

interface ApiCredential {
  id: string;
  label: string;
  key: string;
  secretHint: string;
  secret?: string;
  createdAt: string;
  lastUsed: string;
  scopes: string[];
}

interface WebhookEndpoint {
  id: string;
  label: string;
  url: string;
  events: string[];
  signingSecretHint: string;
  createdAt: string;
  status: "active" | "paused";
}

type RefreshCadence = "manual" | "30s" | "1m" | "5m";
type DefaultLanding = "dashboard" | "monitoring" | "workspace" | "analytics";
type DigestMode = "realtime" | "hourly" | "daily";
type WorkspaceMode = "overview" | "investigation" | "presentation";
type DeveloperSubscriptionStatus = "free" | "checkout_pending" | "active";

type SkillProvision = {
  trackers: Array<Pick<Tracker, "title" | "kind" | "source" | "interval" | "severity" | "tags">>;
  alerts: Array<Pick<AlertRule, "name" | "condition" | "priority" | "muteWindow">>;
  vault: Pick<VaultItem, "title" | "collection" | "tags" | "excerpt">;
};

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const sparklineForSkill = (seed: string) => {
  const base = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 28;
  return [42, 46, 51, 49, 55, 58, 63, 61, 67, 72].map((value, index) => Math.min(99, value + ((base + index) % 9)));
};

const skillProvisionFor = (name: string): SkillProvision => {
  const catalog: Record<string, SkillProvision> = {
    "CVE Radar": {
      trackers: [
        { title: "CISA KEV advisories", kind: "rss", source: "cisa.gov/known-exploited-vulnerabilities", interval: "15m", severity: "high", tags: ["skill", "cve", "cisa"] },
        { title: "NVD critical disclosures", kind: "api", source: "services.nvd.nist.gov/rest/json/cves/2.0", interval: "30m", severity: "high", tags: ["skill", "nvd", "security"] },
      ],
      alerts: [{ name: "Critical CVE disclosure", condition: "cvss >= 9 OR known_exploited = true", priority: "critical", muteWindow: "Never" }],
      vault: { title: "CVE Radar operating notes", collection: "Security", tags: ["skill", "cve", "playbook"], excerpt: "Provisioned CVE watchlist sources, exploit thresholds, and triage guidance." },
    },
    "Price Sentinel": {
      trackers: [
        { title: "Competitor pricing page", kind: "website", source: "https://example.com/pricing", interval: "30m", severity: "medium", tags: ["skill", "pricing", "competitor"] },
        { title: "Retail price drop watch", kind: "keyword", source: "price drop OR limited stock", interval: "1h", severity: "medium", tags: ["skill", "retail", "commerce"] },
      ],
      alerts: [{ name: "Pricing threshold movement", condition: "price_delta >= 8% OR currency string changed", priority: "high", muteWindow: "Never" }],
      vault: { title: "Price Sentinel baseline", collection: "Product watch", tags: ["skill", "pricing", "baseline"], excerpt: "Created pricing baseline notes for monitored pages and threshold rules." },
    },
    "Local Civic Watch": {
      trackers: [
        { title: "City council agenda feed", kind: "rss", source: "local.gov/agendas/rss", interval: "1h", severity: "low", tags: ["skill", "civic", "local"] },
        { title: "Transit service alerts", kind: "rss", source: "local transit alerts", interval: "30m", severity: "medium", tags: ["skill", "transit", "local"] },
      ],
      alerts: [{ name: "Local civic alert", condition: "source contains permits OR transit outage", priority: "medium", muteWindow: "11 PM - 6 AM" }],
      vault: { title: "Local Civic Watch folders", collection: "Civic Radar", tags: ["skill", "local", "civic"], excerpt: "Added civic collection structure for permits, transit, and public notices." },
    },
    "Repo Pulse": {
      trackers: [
        { title: "GitHub release monitor", kind: "github", source: "github.com/important/repo/releases", interval: "20m", severity: "medium", tags: ["skill", "github", "release"] },
        { title: "Repository velocity spike", kind: "github", source: "github activity velocity", interval: "30m", severity: "low", tags: ["skill", "repo", "velocity"] },
      ],
      alerts: [{ name: "Repository release or advisory", condition: "release_published = true OR advisory_created = true", priority: "high", muteWindow: "Never" }],
      vault: { title: "Repo Pulse release notes", collection: "Developer", tags: ["skill", "github", "release"], excerpt: "Provisioned release, advisory, and velocity tracking notes." },
    },
    "Weather Operations": {
      trackers: [
        { title: "NOAA severe weather alerts", kind: "weather", source: "api.weather.gov/alerts/active", interval: "10m", severity: "high", tags: ["skill", "weather", "noaa"] },
        { title: "Air quality threshold", kind: "api", source: "AQI station feed", interval: "30m", severity: "medium", tags: ["skill", "aqi", "local"] },
      ],
      alerts: [{ name: "Weather operations threshold", condition: "severity >= warning OR AQI >= 125", priority: "high", muteWindow: "Never" }],
      vault: { title: "Weather Operations briefing", collection: "Local", tags: ["skill", "weather", "operations"], excerpt: "Added weather source plan, AQI thresholds, and local alert notes." },
    },
    "Market Cluster": {
      trackers: [
        { title: "Ticker threshold cluster", kind: "stock", source: "watchlist: NVDA, AMD, MSFT", interval: "5m", severity: "medium", tags: ["skill", "stock", "market"] },
        { title: "Treasury yield movement", kind: "news", source: "macro rates feed", interval: "15m", severity: "medium", tags: ["skill", "macro", "rates"] },
      ],
      alerts: [{ name: "Market cluster breakout", condition: "ticker_delta >= 3% OR yield_delta >= 10bps", priority: "medium", muteWindow: "Market closed" }],
      vault: { title: "Market Cluster watchlist", collection: "Market Watch", tags: ["skill", "finance", "macro"], excerpt: "Provisioned market watchlist notes and macro signal thresholds." },
    },
    "External API Bridge": {
      trackers: [
        { title: "Third-party REST health check", kind: "api", source: "https://api.example.com/status", interval: "10m", severity: "medium", tags: ["skill", "api", "rest"] },
        { title: "JSON threshold response monitor", kind: "api", source: "https://api.example.com/metrics", interval: "10m", severity: "medium", tags: ["skill", "json", "threshold"] },
      ],
      alerts: [{ name: "External API field threshold", condition: "http_status >= 500 OR response.value_delta >= 12%", priority: "high", muteWindow: "Never" }],
      vault: { title: "External API Bridge notes", collection: "Developer", tags: ["skill", "api", "connector"], excerpt: "Provisioned REST API checks, JSON field thresholds, and webhook-ready signal routing." },
    },
    "Weather API Fusion": {
      trackers: [
        { title: "NOAA active alerts API", kind: "api", source: "https://api.weather.gov/alerts/active", interval: "10m", severity: "high", tags: ["skill", "weather", "noaa"] },
        { title: "OpenWeather condition quorum", kind: "api", source: "https://api.openweathermap.org/data/2.5/weather", interval: "10m", severity: "medium", tags: ["skill", "weather", "api"] },
      ],
      alerts: [{ name: "Weather API quorum mismatch", condition: "provider_disagreement = true OR pressure_delta <= -2hPa", priority: "high", muteWindow: "Never" }],
      vault: { title: "Weather API Fusion notes", collection: "Local", tags: ["skill", "weather", "api"], excerpt: "Provisioned multi-provider weather API checks for pressure, AQI, severe alerts, and forecast divergence." },
    },
  };
  const fallbackKind = name.toLowerCase().includes("api") ? "api" : name.toLowerCase().includes("repo") || name.toLowerCase().includes("github") ? "github" : name.toLowerCase().includes("weather") ? "weather" : name.toLowerCase().includes("market") ? "stock" : "rss";
  return (
    catalog[name] ?? {
      trackers: [
        { title: `${name} primary feed`, kind: fallbackKind, source: `${slugify(name)} source bundle`, interval: "30m", severity: "medium", tags: ["skill", slugify(name)] },
        { title: `${name} anomaly monitor`, kind: "keyword", source: `${name} anomaly terms`, interval: "1h", severity: "low", tags: ["skill", "anomaly", slugify(name)] },
      ],
      alerts: [{ name: `${name} signal threshold`, condition: "matched_events >= 3 OR severity >= high", priority: "medium", muteWindow: "Never" }],
      vault: { title: `${name} skill notes`, collection: "Skill Marketplace", tags: ["skill", slugify(name)], excerpt: `Provisioned sources, alert threshold, and research notes for ${name}.` },
    }
  );
};

interface AppState {
  theme: Theme;
  density: Density;
  sidebarCollapsed: boolean;
  commandOpen: boolean;
  aiAgentOpen: boolean;
  trackers: Tracker[];
  alerts: AlertRule[];
  vaultItems: VaultItem[];
  alertHistory: typeof signalEvents;
  toasts: ToastMessage[];
  searchHistory: string[];
  layout: WorkspaceLayout;
  activeWorkspaceId: string;
  activityLog: string[];
  securitySessions: string[];
  securityLog: string[];
  audioEnabled: boolean;
  animationsEnabled: boolean;
  privacyMode: boolean;
  locationServicesEnabled: boolean;
  autoSaveEnabled: boolean;
  notificationDurationMs: number;
  refreshCadence: RefreshCadence;
  defaultLanding: DefaultLanding;
  digestMode: DigestMode;
  workspaceMode: WorkspaceMode;
  workspaceViews: string[];
  installedSkills: string[];
  customSkills: string[];
  apiCredentials: ApiCredential[];
  webhooks: WebhookEndpoint[];
  developerSubscriptionStatus: DeveloperSubscriptionStatus;
  acknowledgedEvents: string[];
  accent: string;
  mfaEnabled: boolean;
  currentUserEmail?: string;
  accessToken?: string;
  refreshToken?: string;
  workspaceSnapshotSavedAt?: string;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setDensity: (density: Density) => void;
  toggleSidebar: () => void;
  setCommandOpen: (open: boolean) => void;
  setAiAgentOpen: (open: boolean) => void;
  pushToast: (toast: Omit<ToastMessage, "id">) => void;
  dismissToast: (id: string) => void;
  addSearchHistory: (query: string) => void;
  acknowledgeEvent: (id: string) => void;
  setTrackers: (trackers: Tracker[]) => void;
  addTracker: (tracker: Tracker) => void;
  updateTracker: (tracker: Tracker) => void;
  archiveTracker: (id: string) => void;
  refreshTracker: (id: string) => void;
  reorderTrackers: (fromId: string, toId: string) => void;
  toggleAlert: (id: string) => void;
  addAlert: (alert: AlertRule) => void;
  triggerAlert: (id: string) => void;
  addVaultItem: (item: VaultItem) => void;
  updateVaultItem: (id: string, patch: Partial<VaultItem>) => void;
  deleteVaultItem: (id: string) => void;
  captureSnapshot: () => void;
  updateLayout: (layout: Partial<WorkspaceLayout>) => void;
  setActiveWorkspace: (id: string) => void;
  addActivity: (entry: string) => void;
  saveWorkspaceSnapshot: () => void;
  setAudioEnabled: (enabled: boolean) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  setPrivacyMode: (enabled: boolean) => void;
  setLocationServicesEnabled: (enabled: boolean) => void;
  setAutoSaveEnabled: (enabled: boolean) => void;
  setNotificationDuration: (durationMs: number) => void;
  setRefreshCadence: (cadence: RefreshCadence) => void;
  setDefaultLanding: (landing: DefaultLanding) => void;
  setDigestMode: (mode: DigestMode) => void;
  setWorkspaceMode: (mode: WorkspaceMode) => void;
  addWorkspaceView: (name: string) => void;
  removeWorkspaceView: (name: string) => void;
  installSkill: (name: string) => void;
  createSkill: (name: string) => void;
  generateApiCredential: (label: string, scopes: string[]) => ApiCredential & { secret: string };
  revokeApiCredential: (id: string) => void;
  setDeveloperSubscriptionStatus: (status: DeveloperSubscriptionStatus) => void;
  generateWebhook: (label: string, url: string, events: string[]) => WebhookEndpoint & { signingSecret: string };
  revokeWebhook: (id: string) => void;
  toggleWebhookStatus: (id: string) => void;
  setAccent: (accent: string) => void;
  resetPreferences: () => void;
  toggleMfa: () => void;
  revokeSession: (session: string) => void;
  setSession: (session: { email: string; mfaEnabled: boolean; accessToken?: string; refreshToken?: string }) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: "dark",
      density: "comfortable",
      sidebarCollapsed: false,
      commandOpen: false,
      aiAgentOpen: false,
      trackers,
      alerts,
      vaultItems,
      alertHistory: signalEvents,
      toasts: [],
      searchHistory: ["pricing", "outage", "github velocity"],
      layout: { left: 34, right: 33, bottom: true },
      activeWorkspaceId: "frontier",
      activityLog: ["Archive boot complete", "Monitoring API connected", "Default workspace loaded"],
      securitySessions: ["Chrome on Windows", "Arc on macOS", "Mobile Safari", "API token: local dev"],
      securityLog: ["Password changed from trusted device", "Refresh token rotated", "New session from Chrome on Windows", "API throttling policy updated"],
      audioEnabled: false,
      animationsEnabled: true,
      privacyMode: false,
      locationServicesEnabled: false,
      autoSaveEnabled: true,
      notificationDurationMs: 4000,
      refreshCadence: "1m",
      defaultLanding: "dashboard",
      digestMode: "realtime",
      workspaceMode: "overview",
      workspaceViews: ["Morning triage", "Incident review", "Research sweep"],
      installedSkills: ["RSS feed monitor", "Website change detector"],
      customSkills: [],
      apiCredentials: [],
      webhooks: [],
      developerSubscriptionStatus: "free",
      acknowledgedEvents: [],
      accent: "#4ad7ff",
      mfaEnabled: true,
      currentUserEmail: undefined,
      toggleTheme: () =>
        set((state) => {
          const theme = state.theme === "dark" ? "light" : state.theme === "light" ? "system" : "dark";
          return {
            theme,
            toasts: [createToast({ title: `${theme[0].toUpperCase()}${theme.slice(1)} theme active`, body: "The workspace palette updated.", tone: "info" }), ...state.toasts].slice(0, 4),
          };
        }),
      setTheme: (theme) =>
        set((state) => ({
          theme,
          toasts: [createToast({ title: `${theme[0].toUpperCase()}${theme.slice(1)} theme active`, body: "The workspace palette updated.", tone: "info" }), ...state.toasts].slice(0, 4),
        })),
      setDensity: (density) =>
        set((state) => ({
          density,
          toasts: [createToast({ title: `${density} density active`, body: "Panel spacing and text rhythm updated.", tone: "info" }), ...state.toasts].slice(0, 4),
        })),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setCommandOpen: (open) => set({ commandOpen: open }),
      setAiAgentOpen: (open) => set({ aiAgentOpen: open }),
      pushToast: (toast) =>
        set((state) => ({
          toasts: [createToast(toast), ...state.toasts].slice(0, 4),
        })),
      dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
      addSearchHistory: (query) =>
        set((state) => ({
          searchHistory: [query, ...state.searchHistory.filter((item) => item !== query)].slice(0, 8),
        })),
      acknowledgeEvent: (id) =>
        set((state) => ({
          acknowledgedEvents: [id, ...(state.acknowledgedEvents ?? []).filter((item) => item !== id)].slice(0, 60),
          activityLog: [`Acknowledged event ${id}`, ...state.activityLog].slice(0, 12),
          toasts: [createToast({ title: "Event acknowledged", body: "The event was removed from the live triage stream.", tone: "success" }), ...state.toasts].slice(0, 4),
        })),
      setTrackers: (trackers) =>
        set((state) => {
          const localSkillTrackers = state.trackers.filter((tracker) => tracker.tags.includes("skill") && !trackers.some((item) => item.id === tracker.id));
          return { trackers: [...localSkillTrackers, ...trackers] };
        }),
      addTracker: (tracker) => set((state) => ({ trackers: [tracker, ...state.trackers] })),
      updateTracker: (tracker) =>
        set((state) => ({
          trackers: state.trackers.map((item) => (item.id === tracker.id ? { ...item, ...tracker } : item)),
        })),
      archiveTracker: (id) =>
        set((state) => ({
          trackers: state.trackers.map((tracker) => (tracker.id === id ? { ...tracker, archived: true } : tracker)),
          toasts: [
            createToast({ title: "Tracker archived", body: "The monitor is hidden from active boards and preserved in history.", tone: "success" }),
            ...state.toasts,
          ].slice(0, 4),
        })),
      refreshTracker: (id) =>
        set((state) => ({
          trackers: state.trackers.map((tracker) => {
            if (tracker.id !== id) return tracker;
            const latest = Math.max(1, Math.min(100, tracker.health + Math.round(Math.random() * 8 - 4)));
            const event = {
              ...signalEvents[Math.floor(Math.random() * signalEvents.length)],
              id: `evt-${Date.now()}`,
              timestamp: "Just now",
              source: tracker.source,
            };
            return {
              ...tracker,
              health: latest,
              delta: latest - tracker.health,
              lastChecked: new Date().toLocaleTimeString(),
              sparkline: [...tracker.sparkline.slice(1), latest],
              timeline: [event, ...tracker.timeline].slice(0, 6),
            };
          }),
          toasts: [
            createToast({ title: "Monitor refreshed", body: "Health, sparkline, and event history were updated.", tone: "info" }),
            ...state.toasts,
          ].slice(0, 4),
        })),
      reorderTrackers: (fromId, toId) =>
        set((state) => {
          const next = [...state.trackers];
          const from = next.findIndex((tracker) => tracker.id === fromId);
          const to = next.findIndex((tracker) => tracker.id === toId);
          if (from < 0 || to < 0) return state;
          const [moved] = next.splice(from, 1);
          next.splice(to, 0, moved);
          return { trackers: next };
        }),
      toggleAlert: (id) =>
        set((state) => ({
          alerts: state.alerts.map((alert) => (alert.id === id ? { ...alert, enabled: !alert.enabled } : alert)),
          toasts: [
            createToast({ title: "Alert rule updated", body: "The alert schedule has been persisted locally.", tone: "success" }),
            ...state.toasts,
          ].slice(0, 4),
        })),
      addAlert: (alert) =>
        set((state) => ({
          alerts: [alert, ...state.alerts],
          activityLog: [`Created alert ${alert.name}`, ...state.activityLog].slice(0, 12),
          toasts: [createToast({ title: "Alert rule created", body: alert.condition, tone: "success" }), ...state.toasts].slice(0, 4),
        })),
      triggerAlert: (id) =>
        set((state) => {
          const alert = state.alerts.find((item) => item.id === id);
          if (!alert) return state;
          const event = {
            ...signalEvents[Math.floor(Math.random() * signalEvents.length)],
            id: `evt-${Date.now()}`,
            title: alert.name,
            severity: alert.priority,
            timestamp: "Just now",
            summary: `Manual test fired for rule: ${alert.condition}`,
          };
          return {
            alerts: state.alerts.map((item) => (item.id === id ? { ...item, lastTriggered: "Just now" } : item)),
            alertHistory: [event, ...state.alertHistory].slice(0, 8),
            activityLog: [`Triggered alert ${alert.name}`, ...state.activityLog].slice(0, 12),
            toasts: [createToast({ title: "Alert fired", body: alert.name, tone: alert.priority === "critical" ? "danger" : "warning" }), ...state.toasts].slice(0, 4),
          };
        }),
      addVaultItem: (item) => set((state) => ({ vaultItems: [item, ...state.vaultItems] })),
      updateVaultItem: (id, patch) =>
        set((state) => ({
          vaultItems: state.vaultItems.map((item) => (item.id === id ? { ...item, ...patch, updated: "Just now" } : item)),
          activityLog: [`Updated vault item ${id}`, ...state.activityLog].slice(0, 12),
        })),
      deleteVaultItem: (id) =>
        set((state) => ({
          vaultItems: state.vaultItems.filter((item) => item.id !== id),
          toasts: [createToast({ title: "Vault item removed", body: "The item was deleted from this local vault.", tone: "warning" }), ...state.toasts].slice(0, 4),
        })),
      captureSnapshot: () =>
        set((state) => ({
          vaultItems: [
            {
              id: `vault-${Date.now()}`,
              title: `Workspace snapshot ${new Date().toLocaleTimeString()}`,
              kind: "snapshot",
              collection: "Product watch",
              tags: ["snapshot", "workspace"],
              updated: "Just now",
              excerpt: "Captured current monitor state, alert posture, and active workspace context.",
            },
            ...state.vaultItems,
          ],
          toasts: [
            createToast({ title: "Snapshot captured", body: "A new archive record was added to the Research Vault.", tone: "success" }),
            ...state.toasts,
          ].slice(0, 4),
        })),
      updateLayout: (layout) => set((state) => ({ layout: { ...state.layout, ...layout } })),
      setActiveWorkspace: (id) =>
        set((state) => ({
          activeWorkspaceId: id,
          activityLog: [`Switched workspace to ${id}`, ...state.activityLog].slice(0, 12),
          toasts: [createToast({ title: "Workspace switched", body: `Now viewing ${id}.`, tone: "info" }), ...state.toasts].slice(0, 4),
        })),
      addActivity: (entry) => set((state) => ({ activityLog: [entry, ...state.activityLog].slice(0, 12) })),
      saveWorkspaceSnapshot: () =>
        set((state) => ({
          workspaceSnapshotSavedAt: new Date().toLocaleTimeString(),
          activityLog: [`Saved layout at ${new Date().toLocaleTimeString()}`, ...state.activityLog].slice(0, 12),
          toasts: [
            createToast({ title: "Workspace layout saved", body: "Panel sizes, bottom rail state, and density preferences were saved.", tone: "success" }),
            ...state.toasts,
          ].slice(0, 4),
        })),
      setAudioEnabled: (audioEnabled) =>
        set((state) => ({
          audioEnabled,
          toasts: [createToast({ title: `Interface sound ${audioEnabled ? "enabled" : "disabled"}`, body: "Local UI feedback preference saved.", tone: "info" }), ...state.toasts].slice(0, 4),
        })),
      setAnimationsEnabled: (animationsEnabled) =>
        set((state) => ({
          animationsEnabled,
          toasts: [createToast({ title: `Motion ${animationsEnabled ? "enabled" : "reduced"}`, body: "Workspace animation preference saved.", tone: "info" }), ...state.toasts].slice(0, 4),
        })),
      setPrivacyMode: (privacyMode) =>
        set((state) => ({
          privacyMode,
          toasts: [createToast({ title: `Privacy mode ${privacyMode ? "enabled" : "disabled"}`, body: "Sensitive labels will be masked in key surfaces.", tone: privacyMode ? "warning" : "info" }), ...state.toasts].slice(0, 4),
        })),
      setLocationServicesEnabled: (locationServicesEnabled) =>
        set((state) => ({
          locationServicesEnabled,
          toasts: [
            createToast({
              title: `Location services ${locationServicesEnabled ? "enabled" : "disabled"}`,
              body: locationServicesEnabled ? "Weather Changes can request this browser location." : "Location-based weather readings are paused.",
              tone: locationServicesEnabled ? "success" : "info",
            }),
            ...state.toasts,
          ].slice(0, 4),
        })),
      setAutoSaveEnabled: (autoSaveEnabled) =>
        set((state) => ({
          autoSaveEnabled,
          toasts: [createToast({ title: `Autosave ${autoSaveEnabled ? "enabled" : "disabled"}`, body: "Workspace layout persistence updated.", tone: "info" }), ...state.toasts].slice(0, 4),
        })),
      setNotificationDuration: (notificationDurationMs) =>
        set((state) => ({
          notificationDurationMs,
          toasts: [createToast({ title: "Notification timing updated", body: `${Math.round(notificationDurationMs / 1000)} seconds`, tone: "success" }), ...state.toasts].slice(0, 4),
        })),
      setRefreshCadence: (refreshCadence) =>
        set((state) => ({
          refreshCadence,
          activityLog: [`Refresh cadence set to ${refreshCadence}`, ...state.activityLog].slice(0, 12),
        })),
      setDefaultLanding: (defaultLanding) =>
        set((state) => ({
          defaultLanding,
          toasts: [createToast({ title: "Default landing updated", body: defaultLanding, tone: "success" }), ...state.toasts].slice(0, 4),
        })),
      setDigestMode: (digestMode) =>
        set((state) => ({
          digestMode,
          toasts: [createToast({ title: "Digest mode updated", body: digestMode, tone: "success" }), ...state.toasts].slice(0, 4),
        })),
      setWorkspaceMode: (workspaceMode) =>
        set((state) => ({
          workspaceMode,
          activityLog: [`Workspace mode set to ${workspaceMode}`, ...state.activityLog].slice(0, 12),
          toasts: [createToast({ title: "Workspace mode changed", body: workspaceMode, tone: "info" }), ...state.toasts].slice(0, 4),
        })),
      addWorkspaceView: (name) =>
        set((state) => ({
          workspaceViews: [name, ...state.workspaceViews.filter((item) => item !== name)].slice(0, 8),
          activityLog: [`Saved workspace view ${name}`, ...state.activityLog].slice(0, 12),
          toasts: [createToast({ title: "Workspace view saved", body: name, tone: "success" }), ...state.toasts].slice(0, 4),
        })),
      removeWorkspaceView: (name) =>
        set((state) => ({
          workspaceViews: state.workspaceViews.filter((item) => item !== name),
          toasts: [createToast({ title: "Workspace view removed", body: name, tone: "warning" }), ...state.toasts].slice(0, 4),
        })),
      installSkill: (name) =>
        set((state) => {
          const provision = skillProvisionFor(name);
          const baseId = `skill-${slugify(name)}`;
          const timestamp = new Date().toLocaleTimeString();
          const provisionedTrackers = provision.trackers
            .map((tracker, index) => ({
              id: `${baseId}-tracker-${index}`,
              ...tracker,
              health: 96 - index * 4,
              delta: 0,
              sparkline: sparklineForSkill(`${name}-${index}`),
              timeline: [
                {
                  id: `${baseId}-event-${index}`,
                  title: `${tracker.title} provisioned`,
                  source: tracker.source,
                  severity: tracker.severity,
                  timestamp: "Just now",
                  summary: `${name} added this source to Live Monitoring.`,
                },
              ],
              lastChecked: timestamp,
            }))
            .filter((tracker) => !state.trackers.some((item) => item.id === tracker.id));
          const provisionedAlerts = provision.alerts
            .map((alert, index) => ({
              id: `${baseId}-alert-${index}`,
              ...alert,
              enabled: true,
              lastTriggered: "Not yet",
            }))
            .filter((alert) => !state.alerts.some((item) => item.id === alert.id));
          const provisionedVaultItem = {
            id: `${baseId}-vault`,
            ...provision.vault,
            kind: "note" as const,
            updated: "Just now",
          };
          const nextVaultItems = state.vaultItems.some((item) => item.id === provisionedVaultItem.id)
            ? state.vaultItems
            : [provisionedVaultItem, ...state.vaultItems];
          const provisionSummary = `${provisionedTrackers.length} monitors, ${provisionedAlerts.length} alerts, ${nextVaultItems === state.vaultItems ? 0 : 1} vault note`;
          return {
            installedSkills: [name, ...state.installedSkills.filter((item) => item !== name)],
            trackers: [...provisionedTrackers, ...state.trackers],
            alerts: [...provisionedAlerts, ...state.alerts],
            vaultItems: nextVaultItems,
            activityLog: [`Installed skill ${name}: ${provisionSummary}`, ...state.activityLog].slice(0, 12),
            toasts: [createToast({ title: "Skill installed and wired", body: `${name}: ${provisionSummary}`, tone: "success" }), ...state.toasts].slice(0, 4),
          };
        }),
      createSkill: (name) =>
        set((state) => {
          const provision = skillProvisionFor(name);
          const baseId = `skill-${slugify(name)}`;
          const tracker = {
            id: `${baseId}-tracker-0`,
            ...provision.trackers[0],
            health: 100,
            delta: 0,
            sparkline: sparklineForSkill(name),
            timeline: [],
            lastChecked: new Date().toLocaleTimeString(),
          };
          const vaultItem = {
            id: `${baseId}-vault`,
            ...provision.vault,
            kind: "note" as const,
            updated: "Just now",
          };
          return {
            customSkills: [name, ...state.customSkills.filter((item) => item !== name)],
            installedSkills: [name, ...state.installedSkills.filter((item) => item !== name)],
            trackers: state.trackers.some((item) => item.id === tracker.id) ? state.trackers : [tracker, ...state.trackers],
            vaultItems: state.vaultItems.some((item) => item.id === vaultItem.id) ? state.vaultItems : [vaultItem, ...state.vaultItems],
            activityLog: [`Created custom skill ${name}: monitor and vault note wired`, ...state.activityLog].slice(0, 12),
            toasts: [createToast({ title: "Custom skill wired", body: `${name} added a monitor and vault note.`, tone: "success" }), ...state.toasts].slice(0, 4),
          };
        }),
      generateApiCredential: (label, scopes) => {
        const secret = randomToken("sn_live_secret", 32);
        const credential = {
          id: `api-${Date.now()}`,
          label,
          key: randomToken("sn_live_key", 18),
          secretHint: maskSecret(secret),
          createdAt: new Date().toLocaleString(),
          lastUsed: "Never",
          scopes,
        };
        set((state) => ({
          apiCredentials: [credential, ...(state.apiCredentials ?? [])],
          securityLog: [`Generated API credential: ${label}`, ...state.securityLog].slice(0, 8),
          activityLog: [`Generated API credential ${label}`, ...state.activityLog].slice(0, 12),
          toasts: [createToast({ title: "API credential generated", body: label, tone: "success" }), ...state.toasts].slice(0, 4),
        }));
        return { ...credential, secret };
      },
      revokeApiCredential: (id) =>
        set((state) => {
          const credential = (state.apiCredentials ?? []).find((item) => item.id === id);
          return {
            apiCredentials: (state.apiCredentials ?? []).filter((item) => item.id !== id),
            securityLog: [`Revoked API credential: ${credential?.label ?? id}`, ...state.securityLog].slice(0, 8),
            toasts: [createToast({ title: "API credential revoked", body: credential?.label ?? id, tone: "warning" }), ...state.toasts].slice(0, 4),
          };
        }),
      setDeveloperSubscriptionStatus: (status) =>
        set((state) => ({
          developerSubscriptionStatus: status,
          securityLog: [`Developer subscription status: ${status.replace("_", " ")}`, ...state.securityLog].slice(0, 8),
          activityLog: [`Developer subscription ${status.replace("_", " ")}`, ...state.activityLog].slice(0, 12),
        })),
      generateWebhook: (label, url, events) => {
        const signingSecret = randomToken("whsec", 32);
        const webhook = {
          id: `webhook-${Date.now()}`,
          label,
          url,
          events,
          signingSecretHint: maskSecret(signingSecret),
          createdAt: new Date().toLocaleString(),
          status: "active" as const,
        };
        set((state) => ({
          webhooks: [webhook, ...(state.webhooks ?? [])],
          securityLog: [`Generated webhook endpoint: ${label}`, ...state.securityLog].slice(0, 8),
          activityLog: [`Generated webhook ${label}`, ...state.activityLog].slice(0, 12),
          toasts: [createToast({ title: "Webhook generated", body: label, tone: "success" }), ...state.toasts].slice(0, 4),
        }));
        return { ...webhook, signingSecret };
      },
      revokeWebhook: (id) =>
        set((state) => {
          const webhook = (state.webhooks ?? []).find((item) => item.id === id);
          return {
            webhooks: (state.webhooks ?? []).filter((item) => item.id !== id),
            securityLog: [`Revoked webhook endpoint: ${webhook?.label ?? id}`, ...state.securityLog].slice(0, 8),
            toasts: [createToast({ title: "Webhook revoked", body: webhook?.label ?? id, tone: "warning" }), ...state.toasts].slice(0, 4),
          };
        }),
      toggleWebhookStatus: (id) =>
        set((state) => ({
          webhooks: (state.webhooks ?? []).map((webhook) => (webhook.id === id ? { ...webhook, status: webhook.status === "active" ? "paused" : "active" } : webhook)),
          toasts: [createToast({ title: "Webhook status updated", body: id, tone: "info" }), ...state.toasts].slice(0, 4),
        })),
      setAccent: (accent) =>
        set((state) => ({
          accent,
          toasts: [createToast({ title: "Accent updated", body: accent, tone: "success" }), ...state.toasts].slice(0, 4),
        })),
      resetPreferences: () =>
        set((state) => ({
          theme: "dark",
          density: "comfortable",
          audioEnabled: false,
          animationsEnabled: true,
          privacyMode: false,
          locationServicesEnabled: false,
          autoSaveEnabled: true,
          notificationDurationMs: 4000,
          refreshCadence: "1m",
          defaultLanding: "dashboard",
          digestMode: "realtime",
          accent: "#4ad7ff",
          toasts: [createToast({ title: "Preferences reset", body: "Theme, density, accent, and sound returned to defaults.", tone: "info" }), ...state.toasts].slice(0, 4),
        })),
      toggleMfa: () =>
        set((state) => ({
          mfaEnabled: !state.mfaEnabled,
          securityLog: [`MFA ${!state.mfaEnabled ? "enabled" : "disabled"}`, ...state.securityLog].slice(0, 8),
          toasts: [
            createToast({ title: !state.mfaEnabled ? "MFA enabled" : "MFA disabled", body: "The security center state was updated.", tone: !state.mfaEnabled ? "success" : "warning" }),
            ...state.toasts,
          ].slice(0, 4),
        })),
      revokeSession: (session) =>
        set((state) => ({
          securitySessions: state.securitySessions.filter((item) => item !== session),
          securityLog: [`Revoked session: ${session}`, ...state.securityLog].slice(0, 8),
          toasts: [createToast({ title: "Session revoked", body: session, tone: "success" }), ...state.toasts].slice(0, 4),
        })),
      setSession: (session) =>
        set({
          currentUserEmail: session.email,
          mfaEnabled: session.mfaEnabled,
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
        }),
    }),
    { name: "signalnest-state" },
  ),
);
