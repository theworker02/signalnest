import {
  BellRing,
  BookOpen,
  Boxes,
  ChevronDown,
  Code2,
  Copy,
  ExternalLink,
  FileJson,
  FileText,
  Gauge,
  GitBranch,
  Github,
  KeyRound,
  Menu,
  MonitorDot,
  Search,
  ShieldCheck,
  Sparkles,
  Terminal,
  Webhook,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ReactNode, useMemo, useState } from "react";
import { Link } from "../lib/navigation";
import { useAppStore } from "../stores/useAppStore";

type DocsPageId =
  | "quickstart"
  | "api-keys"
  | "webhooks"
  | "trackers"
  | "change-detection"
  | "alerts"
  | "research-vault"
  | "skills"
  | "workspaces"
  | "authentication"
  | "rate-limits"
  | "pagination"
  | "errors"
  | "api-reference"
  | "cli"
  | "sdk"
  | "changelog";

type DocArticle = {
  eyebrow: string;
  title: string;
  summary: string;
  skillCommand?: string;
  sections: Array<{ id: string; title: string; body: ReactNode }>;
};

type SidebarItem = [label: string, page: DocsPageId, Icon: LucideIcon];

const topNav: Array<[label: string, page: DocsPageId]> = [
  ["Overview", "quickstart"],
  ["Monitoring API", "trackers"],
  ["Webhooks", "webhooks"],
  ["Skills", "skills"],
  ["API reference", "api-reference"],
  ["Changelog", "changelog"],
];

const sidebarSections: Array<{ title: string; items: SidebarItem[] }> = [
  {
    title: "Get started",
    items: [
      ["Quickstart", "quickstart", Terminal],
      ["API keys", "api-keys", KeyRound],
      ["Webhooks", "webhooks", Webhook],
    ],
  },
  {
    title: "Tutorials",
    items: [
      ["Website trackers", "trackers", MonitorDot],
      ["Change detection", "change-detection", Zap],
      ["Alerts", "alerts", BellRing],
      ["Research vault", "research-vault", FileText],
      ["Skill automation", "skills", Sparkles],
      ["Workspace sync", "workspaces", Boxes],
    ],
  },
  {
    title: "Concepts",
    items: [
      ["Authentication", "authentication", ShieldCheck],
      ["Rate limits", "rate-limits", Gauge],
      ["Pagination", "pagination", FileJson],
      ["Errors", "errors", GitBranch],
    ],
  },
  {
    title: "Reference",
    items: [
      ["API reference", "api-reference", Code2],
      ["CLI", "cli", Terminal],
      ["TypeScript SDK", "sdk", BookOpen],
      ["Changelog", "changelog", FileText],
    ],
  },
];

const quickstartCode = `import { SignalNestClient } from "@signalnest/sdk";

const signalnest = new SignalNestClient({
  baseUrl: "http://127.0.0.1:4040/api",
  apiKey: process.env.SIGNALNEST_API_KEY,
});

const tracker = await signalnest.trackers.create({
  title: "Competitor pricing page",
  kind: "website",
  source: "https://example.com/pricing",
  intervalSeconds: 300,
  tags: ["pricing", "competitor"],
});

console.log(tracker);`;

const docs: Record<DocsPageId, DocArticle> = {
  quickstart: {
    eyebrow: "Get started",
    title: "SignalNest API quickstart",
    summary: "Learn how to make your first SignalNest API request and create a live tracker from code.",
    skillCommand: "npm run api -- trackers list",
    sections: [
      {
        id: "overview",
        title: "What you will build",
        body: (
          <>
            <p>
              This guide creates a scoped API key, stores it outside your source code, checks backend health, creates a website tracker, refreshes it once, and prepares webhook delivery for future automation.
            </p>
            <TileGrid items={["Generate a scoped key", "Set SIGNALNEST_API_KEY", "Call GET /api/health", "Create a tracker", "Refresh the tracker", "Attach alerts and webhooks"]} />
            <SignalCallout command="npm run api -- health" />
          </>
        ),
      },
      {
        id: "create-key",
        title: "Create an API key",
        body: (
          <>
            <p>
              Open the Developers dashboard and generate your first scoped key. Choose the smallest set of scopes that can complete the job. The secret is shown once, then replaced with a censored hint, so copy it directly into your local environment.
            </p>
            <CodeBlock title=".env" code={`SIGNALNEST_API_URL=http://127.0.0.1:4040/api
SIGNALNEST_API_KEY=sn_live_replace_me`} />
            <LinkButton to="/app/developers">Open Developers</LinkButton>
          </>
        ),
      },
      {
        id: "request",
        title: "Make your first request",
        body: <CodeBlock title="JavaScript" code={quickstartCode} />,
      },
      {
        id: "next",
        title: "Next steps",
        body: (
          <>
            <p>
              After your first tracker works, wire it into the rest of the platform. Most production integrations add a webhook receiver, define alert thresholds, and save important captures into the research vault for auditability.
            </p>
            <TileGrid items={["Add a webhook endpoint", "Tune alert thresholds", "Install a marketplace skill", "Save the source to the research vault", "Create a request log", "Rotate keys on a schedule"]} />
          </>
        ),
      },
    ],
  },
  "api-keys": {
    eyebrow: "Get started",
    title: "API keys",
    summary: "Generate credentials for scripts, custom dashboards, ingestion jobs, and marketplace skills.",
    sections: [
      {
        id: "one-key",
        title: "Free account limit",
        body: (
          <>
            <p>
              Each account can generate one free API key. Additional API keys require Developer Pro at $10/month through the hosted subscription checkout. Treat the free key as a development credential and create separate keys for production jobs once billing is enabled.
            </p>
            <TileGrid items={["Development: local scripts and CLI", "Production: one key per service", "Automation: narrow write scopes", "Incident response: revoke and recreate"]} />
          </>
        ),
      },
      {
        id: "secret-policy",
        title: "One-time secret reveal",
        body: (
          <>
            <p>
              SignalNest only displays API secrets at creation time. After that, the dashboard shows a censored hint so a leaked browser session cannot reveal old credentials. Store secrets in environment variables, CI secrets, or a dedicated secret manager.
            </p>
            <CodeBlock title="Security checklist" code={`Never commit API keys
Never paste secrets into client-side code
Rotate keys after staff or vendor changes
Use one key per integration
Revoke keys immediately after suspected exposure`} />
          </>
        ),
      },
      {
        id: "scopes",
        title: "Scopes",
        body: (
          <>
            <p>
              Scopes control what an API key can do. Read scopes are suitable for dashboards and reports. Write scopes should be limited to automation workers that create trackers, alerts, vault records, or webhook destinations.
            </p>
            <TileGrid items={["trackers:read - list and inspect monitors", "trackers:write - create, update, refresh, archive", "alerts:write - create rules and trigger tests", "vault:write - save evidence and notes", "webhooks:write - manage outbound delivery"]} />
          </>
        ),
      },
    ],
  },
  webhooks: {
    eyebrow: "Get started",
    title: "Webhooks",
    summary: "Push tracker changes, alert events, and skill activity into your own systems.",
    sections: [
      {
        id: "events",
        title: "Event types",
        body: (
          <>
            <p>
              Webhook events are designed to be small, idempotent, and easy to route. Store the event ID before processing so retries do not create duplicate tickets, Slack posts, or database records.
            </p>
            <TileGrid items={["tracker.changed - new source observation", "alert.triggered - rule matched a condition", "vault.created - evidence was saved", "skill.installed - automation pack changed state", "workspace.saved - layout or view persisted", "checkout.returned - billing state changed"]} />
          </>
        ),
      },
      {
        id: "receiver",
        title: "Create a receiver",
        body: (
          <>
            <p>
              A receiver should verify the signature, parse the event type, persist the delivery attempt, and return a 2xx response only after the event has been safely accepted.
            </p>
            <CodeBlock
              title="Node.js"
              code={`app.post("/signalnest/webhook", async (req, res) => {
  const signature = req.headers["x-signalnest-signature"];
  verifySignalNestSignature(req.body, signature, process.env.SIGNALNEST_WEBHOOK_SECRET);
  await routeSignalEvent(req.body);
  res.sendStatus(204);
});`}
            />
          </>
        ),
      },
      {
        id: "retries",
        title: "Retries and delivery",
        body: (
          <>
            <p>
              Production deployments should retry transient failures, store delivery attempts, and require signature verification before processing a payload. Return `400` for malformed events, `401` for invalid signatures, and `5xx` only when retrying could succeed later.
            </p>
            <CodeBlock title="Recommended event log" code={`event_id TEXT UNIQUE
event_type TEXT NOT NULL
received_at TIMESTAMP NOT NULL
signature_valid BOOLEAN NOT NULL
processed_at TIMESTAMP
last_error TEXT`} />
          </>
        ),
      },
    ],
  },
  trackers: {
    eyebrow: "Tutorials",
    title: "Website trackers",
    summary: "Create monitors for pages, APIs, feeds, repositories, stock tickers, outages, weather, and keyword clusters.",
    skillCommand: "npm run api -- trackers refresh --id TRACKER_ID",
    sections: [
      {
        id: "create",
        title: "Create a tracker",
        body: (
          <>
            <p>
              Trackers describe what to watch, how often to inspect it, and how changes should be categorized. For websites, store the canonical URL and tags that explain why the source matters.
            </p>
            <CodeBlock
              title="HTTP"
              code={`POST /api/trackers
{
  "title": "Launch page",
  "kind": "website",
  "source": "https://example.com",
  "intervalSeconds": 300,
  "tags": ["launch", "competitor"]
}`}
            />
          </>
        ),
      },
      {
        id: "supported",
        title: "Supported signal types",
        body: (
          <>
            <p>
              SignalNest treats every source as a signal stream with a common lifecycle: create, refresh, compare, score, alert, archive. This keeps the UI consistent even when the data comes from very different systems.
            </p>
            <TileGrid items={["Website", "RSS", "GitHub", "Weather", "Stocks", "Outages", "Subreddits", "Keywords", "Government alerts", "Product drops"]} />
          </>
        ),
      },
      {
        id: "refresh",
        title: "Manual refresh",
        body: (
          <>
            <p>
              Refreshing a tracker creates a new observation, compares it to the previous baseline, updates health, and may emit `tracker.changed` or `alert.triggered` events.
            </p>
            <CodeBlock title="Terminal" code={`npm run api -- trackers refresh --id TRACKER_ID
npm run api -- trackers list
npm run api -- trackers get --id TRACKER_ID`} />
          </>
        ),
      },
    ],
  },
  "change-detection": {
    eyebrow: "Tutorials",
    title: "Change detection",
    summary: "Compare text, status, price, frequency, and visual movement across monitored sources.",
    sections: [
      {
        id: "signals",
        title: "Detection modes",
        body: (
          <>
            <p>
              Detection modes are normalized into comparable signal attributes. A website can produce text and visual deltas, while APIs and status pages produce status, latency, and health deltas.
            </p>
            <TileGrid items={["text_delta - changed copy or DOM text", "visual_delta - screenshot movement", "status_code - HTTP state", "price_delta - currency or numeric shift", "keyword_velocity - mention acceleration", "source_health - availability score"]} />
          </>
        ),
      },
      {
        id: "conditions",
        title: "Condition examples",
        body: <CodeBlock title="Rules" code={`visual_delta > 12
price_delta >= 8%
severity >= critical AND sources >= 3
status_code != 200 FOR 2 checks`} />,
      },
      {
        id: "snapshots",
        title: "Snapshots",
        body: (
          <>
            <p>
              Snapshots preserve the previous observation so users can inspect before and after states from the Change Engine. Keep snapshot records small in the main database and store large screenshots or HTML captures in object storage when you move beyond local development.
            </p>
            <TileGrid items={["Previous value", "Current value", "Diff summary", "Severity score", "Captured evidence", "Linked alerts"]} />
          </>
        ),
      },
    ],
  },
  alerts: {
    eyebrow: "Tutorials",
    title: "Alerts",
    summary: "Create threshold, outage, keyword, location, price, release, and weather alerts.",
    sections: [
      {
        id: "create",
        title: "Create an alert",
        body: (
          <>
            <p>
              Alerts turn raw tracker changes into decisions. Keep the condition explicit, choose the priority carefully, and include delivery channels only after they have been tested.
            </p>
            <CodeBlock
              title="HTTP"
              code={`POST /api/alerts
{
  "trackerId": "trk_123",
  "priority": "critical",
  "condition": "price_delta >= 8%",
  "channels": ["browser", "webhook"]
}`}
            />
          </>
        ),
      },
      {
        id: "mute",
        title: "Mute windows",
        body: (
          <>
            <p>
              Users can set quiet hours, sound preferences, notification duration, and priority filters from Settings. Critical alerts should bypass low-priority digest settings only when the monitored source is operationally important.
            </p>
            <TileGrid items={["Quiet hours", "Priority threshold", "Browser notifications", "Webhook delivery", "Sound preference", "Digest cadence"]} />
          </>
        ),
      },
    ],
  },
  "research-vault": {
    eyebrow: "Tutorials",
    title: "Research vault",
    summary: "Save articles, links, screenshots, notes, markdown, tags, and archived snapshots.",
    sections: [
      {
        id: "save",
        title: "Save an item",
        body: (
          <>
            <p>
              Vault records are durable notes connected to the evidence behind a signal. Save enough context that another person can understand why the source mattered and what changed.
            </p>
            <CodeBlock
              title="HTTP"
              code={`POST /api/vault/items
{
  "title": "Launch analysis",
  "url": "https://example.com/blog",
  "tags": ["launch", "source"],
  "markdown": "Key observations..."
}`}
            />
          </>
        ),
      },
      {
        id: "sorting",
        title: "Sorting",
        body: (
          <>
            <p>
              The app supports timeline, tag, folder, and activity based sorting so research remains findable inside large workspaces. Use consistent tags for long-running monitoring programs.
            </p>
            <TileGrid items={["Updated recently", "Collection", "Source type", "Severity", "Tag", "Linked tracker"]} />
          </>
        ),
      },
    ],
  },
  skills: {
    eyebrow: "Tutorials",
    title: "Skill automation",
    summary: "Install prebuilt monitoring packs or create custom skills that immediately change the workspace.",
    skillCommand: "npm run api -- skills install hacker-news-radar",
    sections: [
      {
        id: "marketplace",
        title: "Marketplace installs",
        body: (
          <>
            <p>
              Free skills install immediately. Paid skills open a hosted checkout before provisioning the tracker pack. A skill can create trackers, alerts, vault notes, and workspace activity in one guided action.
            </p>
            <TileGrid items={["Monitor pack", "Alert recipe", "Vault template", "Workspace activity", "Checkout handoff", "Install audit event"]} />
          </>
        ),
      },
      {
        id: "custom",
        title: "Custom skills",
        body: (
          <>
            <p>
              Custom skills generate a vault note, starter tracker, and alert rule so the user can see an immediate result. Keep custom skills small: one clear source category, one default rule, and a short explanation of what will be created.
            </p>
            <CodeBlock title="Skill checklist" code={`Define source category
Create starter tracker
Attach default alert
Save setup note to vault
Log install activity`} />
          </>
        ),
      },
      {
        id: "manifest",
        title: "Skill manifest",
        body: <CodeBlock title="skill.json" code={`{
  "name": "Launch Radar",
  "signals": ["website", "rss", "github"],
  "alerts": ["keyword_velocity", "outage"]
}`} />,
      },
    ],
  },
  workspaces: {
    eyebrow: "Tutorials",
    title: "Workspace sync",
    summary: "Synchronize layouts, panels, live cursors, saved views, and activity replay across browser sessions.",
    sections: [
      {
        id: "layouts",
        title: "Layouts",
        body: (
          <>
            <p>
              Saved workspaces describe panel placement, density, active trackers, pinned modules, and default visualizations. Persist only the layout metadata, not transient UI state like hover targets.
            </p>
            <TileGrid items={["Panel visibility", "Default tracker set", "Saved views", "Density", "Privacy mode", "Last snapshot time"]} />
          </>
        ),
      },
      {
        id: "presence",
        title: "Presence",
        body: (
          <>
            <p>
              Realtime collaboration can broadcast cursors, activity markers, and workspace snapshots through WebSockets. Presence events should expire quickly so disconnected browser sessions do not remain visible.
            </p>
            <CodeBlock title="Presence event" code={`{
  "type": "workspace.presence",
  "workspaceId": "frontier",
  "user": "analyst@example.com",
  "expiresInSeconds": 30
}`} />
          </>
        ),
      },
    ],
  },
  authentication: {
    eyebrow: "Concepts",
    title: "Authentication",
    summary: "Understand session tokens, API keys, refresh token rotation, and credential storage.",
    sections: [
      {
        id: "sessions",
        title: "App sessions",
        body: (
          <>
            <p>
              The frontend keeps session state in the app store and the backend exposes hardened auth routes for production deployments. Browser sessions should use short-lived access tokens and refresh tokens with rotation.
            </p>
            <TileGrid items={["Access token", "Refresh token", "MFA state", "Active device", "Audit entry", "Revocation"]} />
          </>
        ),
      },
      {
        id: "bearer",
        title: "Bearer keys",
        body: (
          <>
            <p>
              API clients authenticate with bearer keys. Send the key on every request and never expose it from a browser bundle or public repository.
            </p>
            <CodeBlock title="HTTP" code={`GET /api/trackers
Authorization: Bearer sn_live_key_...
Accept: application/json`} />
          </>
        ),
      },
      {
        id: "mfa",
        title: "MFA",
        body: (
          <>
            <p>
              Production auth should enforce MFA enrollment for developer accounts with billing, API-key access, or administrative permissions. Treat API key creation and revocation as sensitive actions.
            </p>
            <CodeBlock title="Sensitive actions" code={`Generate API key
Reveal one-time secret
Create webhook destination
Start subscription checkout
Revoke active session`} />
          </>
        ),
      },
    ],
  },
  "rate-limits": {
    eyebrow: "Concepts",
    title: "Rate limits",
    summary: "Protect the API with per-key throttling, abuse prevention, and Redis-backed counters.",
    sections: [
      {
        id: "default",
        title: "Default limit",
        body: (
          <>
            <p>
              The developer console advertises 600 requests per minute per key. Production deployments should back this with Redis or another shared counter so limits work across multiple backend instances.
            </p>
            <TileGrid items={["Per API key", "Per IP fallback", "Burst window", "Retry-After header", "Abuse logging", "Upgradeable limits"]} />
          </>
        ),
      },
      {
        id: "headers",
        title: "Headers",
        body: <CodeBlock title="HTTP" code={`X-RateLimit-Limit: 600
X-RateLimit-Remaining: 593
X-RateLimit-Reset: 1778200000
Retry-After: 12`} />,
      },
    ],
  },
  pagination: {
    eyebrow: "Concepts",
    title: "Pagination",
    summary: "Fetch large tracker, alert, vault, and event streams without overloading the interface.",
    sections: [
      {
        id: "cursor",
        title: "Cursor pagination",
        body: (
          <>
            <p>
              Cursor pagination is preferred over page numbers because tracker and alert streams change continuously. Pass the cursor returned by the previous response to continue from the same ordered window.
            </p>
            <CodeBlock title="HTTP" code={`GET /api/trackers?limit=25&cursor=next_abc123

{
  "data": [],
  "pageInfo": {
    "nextCursor": "next_def456",
    "hasMore": true
  }
}`} />
          </>
        ),
      },
      {
        id: "virtualization",
        title: "Interface rendering",
        body: (
          <>
            <p>
              Large lists should use virtualized rendering so dashboards remain responsive on laptops and ultrawide monitors. Avoid fetching more than one or two pages ahead of what the user can inspect.
            </p>
            <TileGrid items={["Sort by updatedAt", "Use stable cursors", "Preserve filters", "Avoid duplicate rows", "Render virtual lists", "Prefetch sparingly"]} />
          </>
        ),
      },
    ],
  },
  errors: {
    eyebrow: "Concepts",
    title: "Errors",
    summary: "Handle validation, auth, billing, rate limit, and upstream source failures consistently.",
    sections: [
      {
        id: "shape",
        title: "Error shape",
        body: (
          <>
            <p>
              All API errors should return a stable machine-readable code, a human-readable message, and a request ID that support can use to trace logs.
            </p>
            <CodeBlock title="JSON" code={`{
  "error": {
    "code": "tracker_source_unreachable",
    "message": "The monitored source did not respond.",
    "requestId": "req_abc123"
  }
}`} />
          </>
        ),
      },
      {
        id: "codes",
        title: "Common codes",
        body: (
          <>
            <p>
              Client code should branch on `error.code`, not on message text. Messages may change for clarity, but codes should remain stable across releases.
            </p>
            <TileGrid items={["unauthorized", "payment_required", "rate_limited", "validation_failed", "source_unreachable", "webhook_signature_invalid", "tracker_not_found", "scope_missing"]} />
          </>
        ),
      },
    ],
  },
  "api-reference": {
    eyebrow: "Reference",
    title: "API reference",
    summary: "Core backend routes used by the SignalNest app, SDK, and CLI.",
    sections: [
      {
        id: "health",
        title: "Health",
        body: (
          <>
            <p>
              Use the health route for deployment checks, local boot diagnostics, and CI smoke tests. It should not require authentication.
            </p>
            <CodeBlock title="HTTP" code={`GET /api/health

{
  "status": "ok",
  "service": "signalnest-api",
  "version": "0.1.0"
}`} />
          </>
        ),
      },
      {
        id: "trackers",
        title: "Trackers",
        body: <CodeBlock title="HTTP" code={`GET /api/trackers
POST /api/trackers
POST /api/trackers/:id/refresh
PATCH /api/trackers/:id
DELETE /api/trackers/:id`} />,
      },
      {
        id: "developer",
        title: "Developer billing",
        body: (
          <>
            <p>
              Developer billing routes create hosted checkout sessions and receive provider return state. Keep billing state server-authoritative and never unlock paid limits based only on query parameters.
            </p>
            <CodeBlock title="HTTP" code={`POST /api/developers/subscription/checkout
GET /api/developers/subscription/status
POST /api/developers/subscription/webhook`} />
          </>
        ),
      },
    ],
  },
  cli: {
    eyebrow: "Reference",
    title: "CLI",
    summary: "Use the SignalNest terminal interface for health checks, tracker reads, and local env setup.",
    sections: [
      {
        id: "install",
        title: "Run locally",
        body: (
          <>
            <p>
              The CLI is useful for quick checks, scripting, and debugging without opening the browser. It reads the same local environment variables as the SDK examples.
            </p>
            <CodeBlock title="Terminal" code={`npm run api -- health
npm run api -- trackers list
npm run api -- trackers refresh --id TRACKER_ID
npm run api -- init-env`} />
          </>
        ),
      },
      {
        id: "download",
        title: "Package command",
        body: (
          <>
            <p>
              The shared workspace exposes the `signalnest` binary so the API client can be run from package scripts or linked locally. Prefer package scripts in teams so everyone uses the same command version.
            </p>
            <CodeBlock title="package.json" code={`{
  "scripts": {
    "signals:health": "signalnest health",
    "signals:list": "signalnest trackers list"
  }
}`} />
          </>
        ),
      },
    ],
  },
  sdk: {
    eyebrow: "Reference",
    title: "TypeScript SDK",
    summary: "Use `@signalnest/sdk` from Node.js tools, scripts, and custom integrations.",
    sections: [
      {
        id: "client",
        title: "Create a client",
        body: (
          <>
            <p>
              Create one client per backend process and reuse it across jobs. Keep the API key in server-side environment variables and pass a base URL explicitly in tests.
            </p>
            <CodeBlock title="TypeScript" code={quickstartCode} />
          </>
        ),
      },
      {
        id: "methods",
        title: "Available methods",
        body: (
          <>
            <p>
              SDK methods mirror the HTTP API and return typed objects. Handle errors with `try/catch` and log request IDs when the backend includes them.
            </p>
            <TileGrid items={["health()", "trackers.list()", "trackers.create()", "trackers.refresh()", "trackers.update()", "alerts.list()", "alerts.create()", "vault.createItem()"]} />
          </>
        ),
      },
      {
        id: "worker",
        title: "Automation worker",
        body: <CodeBlock title="TypeScript" code={`async function refreshCriticalTrackers() {
  const trackers = await signalnest.trackers.list({ tag: "critical" });

  for (const tracker of trackers.data) {
    const result = await signalnest.trackers.refresh(tracker.id);
    if (result.severity === "critical") {
      await signalnest.alerts.create({
        trackerId: tracker.id,
        priority: "critical",
        condition: "manual_refresh = critical",
      });
    }
  }
}`} />,
      },
    ],
  },
  changelog: {
    eyebrow: "Reference",
    title: "Changelog",
    summary: "Recent developer-platform changes.",
    sections: [
      {
        id: "docs",
        title: "Docs experience",
        body: <p>Documentation topics now render as separate routed pages with persistent navigation, page-specific anchors, code examples, and expanded implementation guidance.</p>,
      },
      {
        id: "sdk",
        title: "SDK and CLI",
        body: <p>Added the shared SignalNest SDK, CLI command surface, and root `npm run api -- ...` workflow for scripted access to trackers, health checks, and local environment setup.</p>,
      },
      {
        id: "billing",
        title: "Developer Pro",
        body: <p>Additional API keys are gated behind a $10/month hosted subscription flow. Production deployments should verify subscription state server-side before unlocking limits.</p>,
      },
    ],
  },
};

export function DeveloperDocs() {
  const requestedSlug = window.location.pathname.split("/").filter(Boolean).at(-1);
  const requestedPage = requestedSlug as DocsPageId | undefined;
  const currentPage = requestedPage ?? "quickstart";
  const article = docs[currentPage];
  const pushToast = useAppStore((state) => state.pushToast);
  const setAiAgentOpen = useAppStore((state) => state.setAiAgentOpen);
  const [query, setQuery] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const visibleSections = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return sidebarSections;
    return sidebarSections
      .map((section) => ({
        ...section,
        items: section.items.filter(([label, page]) => label.toLowerCase().includes(term) || docs[page].summary.toLowerCase().includes(term)),
      }))
      .filter((section) => section.items.length > 0);
  }, [query]);

  if (!requestedSlug || requestedSlug === "docs" || !article) {
    window.location.replace("/app/developers/docs/quickstart");
    return null;
  }

  async function copy(value: string, title: string) {
    await navigator.clipboard?.writeText(value);
    pushToast({ title, body: "Copied to clipboard.", tone: "success" });
  }

  function docsLink(page: DocsPageId) {
    return `/app/developers/docs/${page}`;
  }

  return (
    <div className="-m-4 min-h-[calc(100vh-73px)] overflow-hidden bg-[#070809] text-white md:-m-6">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070809]/95 backdrop-blur">
        <div className="flex min-h-14 items-center gap-3 px-4 lg:px-8">
          <Link to="/app/developers" className="hidden rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:border-cyan/30 hover:text-white sm:inline-flex" aria-label="Back to developer dashboard">
            Developers
          </Link>
          <button className="ml-auto rounded-lg border border-white/10 p-2 text-slate-300 lg:hidden" onClick={() => setMobileNavOpen(true)} aria-label="Open documentation navigation">
            <Menu className="h-4 w-4" />
          </button>
          <div className="mx-auto hidden w-full max-w-[560px] items-center gap-2 rounded-lg border border-white/15 bg-white/[0.035] px-3 py-2 text-sm text-slate-400 md:flex">
            <Search className="h-4 w-4" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-slate-500" placeholder="Search documentation" />
            <span className="rounded border border-white/10 px-1.5 py-0.5 text-xs">/</span>
          </div>
          <button type="button" onClick={() => setAiAgentOpen(true)} className="hidden rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan/30 hover:text-cyan md:inline-flex">
            Ask <Sparkles className="ml-1 h-3.5 w-3.5" />
          </button>
          <details className="group relative hidden lg:block">
            <summary className="flex cursor-pointer list-none items-center gap-1 text-sm text-slate-300 transition hover:text-white">
              Connect <ChevronDown className="h-3.5 w-3.5 transition group-open:rotate-180" />
            </summary>
            <div className="absolute right-0 top-8 z-40 w-48 overflow-hidden rounded-xl border border-white/10 bg-[#090a0c]/95 p-1 shadow-2xl shadow-black/40 backdrop-blur">
              <Link to="/app/monitoring" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06] hover:text-white">
                <Github className="h-4 w-4 text-slate-500" />
                GitHub monitors
              </Link>
              <Link to="/app/developers/docs/webhooks" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06] hover:text-white">
                <Webhook className="h-4 w-4 text-slate-500" />
                Webhooks
              </Link>
            </div>
          </details>
          <Link to="/app/pricing-api" className="hidden text-sm text-slate-300 transition hover:text-white lg:block">API Pricing</Link>
          <Link to="/login" className="hidden rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-slate-200 sm:inline-flex">Sign up</Link>
        </div>
        <nav className="flex gap-7 overflow-x-auto px-4 py-3 text-sm font-semibold text-slate-300 lg:px-8">
          {topNav.map(([label, page]) => (
            <Link key={page} to={docsLink(page)} className={`whitespace-nowrap border-b-2 pb-3 transition hover:text-white ${page === currentPage ? "border-white text-white" : "border-transparent"}`}>
              {label}
            </Link>
          ))}
        </nav>
      </header>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden">
          <div className="h-full w-[min(360px,88vw)] overflow-y-auto border-r border-white/10 bg-[#08090b] p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="font-bold text-white">Documentation</div>
              <button onClick={() => setMobileNavOpen(false)} className="rounded-lg border border-white/10 p-2 text-slate-300" aria-label="Close documentation navigation">
                <X className="h-4 w-4" />
              </button>
            </div>
            <DocsSidebar sections={visibleSections} currentPage={currentPage} onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_240px]">
        <aside className="hidden min-h-[calc(100vh-112px)] border-r border-white/10 bg-[#08090b] p-5 lg:block">
          <DocsSidebar sections={visibleSections} currentPage={currentPage} />
        </aside>

        <main className="min-w-0 bg-[#1f1f20] px-5 py-8 md:px-10 xl:px-20">
          <article className="mx-auto max-w-[820px]">
            <div className="mb-5 text-sm font-bold text-slate-400">{article.eyebrow}</div>
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="min-w-0">
                <h1 className="max-w-3xl text-4xl font-black tracking-[-0.04em] text-white md:text-5xl">{article.title}</h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-white">{article.summary}</p>
              </div>
              <button onClick={() => void copy(`${location.origin}${docsLink(currentPage)}`, "Documentation link copied")} className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-slate-300 transition hover:border-cyan/30 hover:text-cyan">
                <Copy className="h-4 w-4" />
                Copy page
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {article.skillCommand && (
              <div className="mt-8">
                <SignalCallout command={article.skillCommand} />
              </div>
            )}

            <div className="mt-12 grid gap-12">
              {article.sections.map((section, index) => (
                <DocsStep key={section.id} id={section.id} number={String(index + 1)} title={section.title}>
                  {section.body}
                </DocsStep>
              ))}
            </div>
          </article>
        </main>

        <aside className="hidden border-l border-white/10 bg-[#1f1f20] p-8 xl:block">
          <div className="sticky top-36">
            <div className="mb-4 text-sm font-bold text-slate-400">On this page</div>
            <div className="grid gap-3 border-l border-white/15 pl-4 text-sm">
              {article.sections.map((section, index) => (
                <button key={section.id} onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "start" })} className={`text-left transition hover:text-white ${index === 0 ? "font-semibold text-white" : "text-slate-400"}`}>
                  {section.title}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="fixed bottom-4 right-4 z-40 hidden w-64 rounded-xl border border-white/10 bg-[#090a0c] p-3 shadow-2xl md:block">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
          <Sparkles className="h-4 w-4 text-cyan" /> Need help?
        </div>
        <button type="button" onClick={() => setAiAgentOpen(true)} className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black">
          Ask anything <Sparkles className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function DocsSidebar({ sections, currentPage, onNavigate }: { sections: Array<{ title: string; items: SidebarItem[] }>; currentPage: DocsPageId; onNavigate?: () => void }) {
  return (
    <div className="grid gap-8">
      {sections.map((section) => (
        <div key={section.title}>
          <div className="mb-3 text-xs font-bold text-slate-400">{section.title}</div>
          <div className="grid gap-1">
            {section.items.map(([label, page, Icon]) => (
              <Link
                key={page}
                to={`/app/developers/docs/${page}`}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-lg px-2 py-2 text-left text-sm transition ${
                  page === currentPage ? "bg-white/[0.08] font-semibold text-white" : "text-slate-300 hover:bg-white/[0.055] hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 text-slate-500" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function DocsStep({ id, number, title, children }: { id: string; number: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="relative scroll-mt-32 border-l border-white/15 pl-7">
      <div className="absolute -left-3 top-0 grid h-6 w-6 place-items-center rounded-md border border-white/15 bg-[#1f1f20] text-sm text-slate-300">{number}</div>
      <h2 className="text-2xl font-black tracking-[-0.03em] text-white">{title}</h2>
      <div className="mt-4 grid gap-4 text-base leading-7 text-white">{children}</div>
    </section>
  );
}

function CodeBlock({ title, code }: { title: string; code: string }) {
  const pushToast = useAppStore((state) => state.pushToast);
  async function copyCode() {
    await navigator.clipboard?.writeText(code);
    pushToast({ title: `${title} copied`, body: "Copied to clipboard.", tone: "success" });
  }
  const lines = code.split("\n");
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#111]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <span className="font-mono text-xs font-semibold text-slate-300">{title}</span>
        <button onClick={copyCode} className="rounded-md p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-cyan" aria-label={`Copy ${title}`}>
          <Copy className="h-4 w-4" />
        </button>
      </div>
      <pre className="overflow-auto text-sm leading-6 text-cyan">
        <code>
          {lines.map((line, index) => (
            <span key={`${index}-${line}`} className="grid grid-cols-[42px_minmax(0,1fr)]">
              <span className="select-none border-r border-white/10 pr-3 text-right text-slate-600">{index + 1}</span>
              <span className="px-4">{line || " "}</span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

function SignalCallout({ command }: { command: string }) {
  return (
    <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-5">
      <div className="flex items-start gap-3 text-sm text-emerald-200">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="min-w-0 flex-1">
          <span className="font-semibold">Use the SignalNest API from your terminal:</span>
          <div className="mt-4 overflow-x-auto rounded-lg border border-white/10 bg-black/25 px-4 py-3 font-mono text-sm text-emerald-100">$ {command}</div>
        </div>
      </div>
    </div>
  );
}

function TileGrid({ items }: { items: string[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item} className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 font-mono text-sm text-cyan">
          {item}
        </div>
      ))}
    </div>
  );
}

function LinkButton({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-cyan/30 bg-cyan/15 px-4 text-sm font-semibold text-cyan transition hover:bg-cyan/20">
      {children} <ExternalLink className="h-3.5 w-3.5" />
    </Link>
  );
}
