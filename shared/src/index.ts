export const SIGNALNEST_SEVERITIES = ["low", "medium", "high", "critical"] as const;
export const SIGNALNEST_TRACKER_KINDS = ["website", "rss", "api", "github", "news", "stock", "weather", "outage", "keyword", "subreddit"] as const;

export type SignalSeverity = (typeof SIGNALNEST_SEVERITIES)[number];
export type SignalTrackerKind = (typeof SIGNALNEST_TRACKER_KINDS)[number];

export type SignalNestClientOptions = {
  apiKey?: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
};

export type SignalNestPage<T> = {
  data: T[];
  nextCursor?: string;
};

export type SignalNestHealth = {
  ok: boolean;
  service: string;
  timestamp: string;
};

export type SignalNestTracker = {
  id: string;
  title: string;
  kind: SignalTrackerKind;
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

export type SignalNestAlert = {
  id: string;
  name: string;
  condition: string;
  priority: SignalSeverity;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateTrackerInput = {
  title: string;
  kind: SignalTrackerKind;
  source: string;
  intervalSeconds?: number;
  tags?: string[];
};

export type CreateAlertInput = {
  name: string;
  condition: string;
  priority: SignalSeverity;
  enabled?: boolean;
};

export class SignalNestApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: unknown,
  ) {
    super(message);
    this.name = "SignalNestApiError";
  }
}

export class SignalNestClient {
  readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: SignalNestClientOptions = {}) {
    this.baseUrl = normalizeBaseUrl(options.baseUrl ?? "http://127.0.0.1:4040/api");
    this.apiKey = options.apiKey;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  health() {
    return this.request<SignalNestHealth>("/health");
  }

  listTrackers(params: { limit?: number; cursor?: string; includeArchived?: boolean } = {}) {
    return this.request<SignalNestPage<SignalNestTracker>>(`/trackers${toQuery(params)}`);
  }

  createTracker(input: CreateTrackerInput) {
    return this.request<{ data: SignalNestTracker }>("/trackers", {
      method: "POST",
      body: JSON.stringify({ intervalSeconds: 300, tags: [], ...input }),
    });
  }

  refreshTracker(id: string) {
    return this.request<{ data: SignalNestTracker }>(`/trackers/${encodeURIComponent(id)}/refresh`, { method: "POST" });
  }

  updateTracker(id: string, input: Partial<CreateTrackerInput> & { archived?: boolean; enabled?: boolean }) {
    return this.request<{ data: SignalNestTracker }>(`/trackers/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  }

  archiveTracker(id: string) {
    return this.updateTracker(id, { archived: true });
  }

  listAlerts(params: { limit?: number; cursor?: string } = {}) {
    return this.request<SignalNestPage<SignalNestAlert>>(`/alerts${toQuery(params)}`);
  }

  createAlert(input: CreateAlertInput) {
    return this.request<{ data: SignalNestAlert }>("/alerts", {
      method: "POST",
      body: JSON.stringify({ enabled: true, ...input }),
    });
  }

  updateAlert(id: string, input: Partial<CreateAlertInput>) {
    return this.request<{ data: SignalNestAlert }>(`/alerts/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  }

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    if (init.body && !headers.has("content-type")) headers.set("content-type", "application/json");
    if (this.apiKey && !headers.has("authorization")) headers.set("authorization", `Bearer ${this.apiKey}`);

    const response = await this.fetchImpl(`${this.baseUrl}${path}`, { ...init, headers });
    const contentType = response.headers.get("content-type") ?? "";
    const body = contentType.includes("application/json") ? await response.json() : await response.text();

    if (!response.ok) {
      const message = typeof body === "object" && body && "error" in body ? String((body as { error: unknown }).error) : `SignalNest API request failed with ${response.status}`;
      throw new SignalNestApiError(message, response.status, body);
    }

    return body as T;
  }
}

const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/+$/, "");

const toQuery = (params: Record<string, string | number | boolean | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) query.set(key, String(value));
  });
  const output = query.toString();
  return output ? `?${output}` : "";
};
