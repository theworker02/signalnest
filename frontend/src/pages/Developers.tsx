import { BarChart3, Boxes, Braces, CheckCircle2, Clipboard, CreditCard, ExternalLink, FileText, Grid2X2, KeyRound, ShieldCheck, Trash2, Webhook } from "lucide-react";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { useHardNavigate } from "../lib/hardNavigation";
import { createDeveloperSubscriptionCheckout } from "../lib/api";
import { useAppStore } from "../stores/useAppStore";

const scopeOptions = [
  { id: "trackers:read", label: "Read trackers" },
  { id: "trackers:write", label: "Manage trackers" },
  { id: "alerts:write", label: "Create alerts" },
  { id: "vault:write", label: "Write vault items" },
  { id: "webhooks:write", label: "Manage webhooks" },
];

const webhookEventOptions = [
  { id: "tracker.changed", label: "Tracker changed" },
  { id: "alert.triggered", label: "Alert triggered" },
  { id: "vault.created", label: "Vault item created" },
  { id: "skill.installed", label: "Skill installed" },
  { id: "workspace.saved", label: "Workspace saved" },
];

const tabs = ["Overview", "API Keys", "Webhooks", "Analytics", "Request Log", "Environment variables"] as const;
type DeveloperTab = (typeof tabs)[number];

const hiddenSecretHint = (value?: string) => (value ? `secret-hidden-${value.slice(-6)}` : "Secret hidden");

type DeveloperSubscriptionCheckout = {
  checkoutUrl: string;
  paymentLinkId?: string;
  amountCents: number;
  cadence: string;
  live?: boolean;
};

const quickstartCode = `import { SignalNestClient } from "@signalnest/sdk";

const signalnest = new SignalNestClient({
  apiKey: "YOUR_API_KEY",
});

const tracker = await signalnest.trackers.create({
  title: "Competitor pricing page",
  source: "https://example.com/pricing",
  kind: "website",
  interval: "5m",
});

await signalnest.alerts.create({
  trackerId: tracker.id,
  condition: "text_delta > 12 OR outage = true",
});`;

export function Developers() {
  const navigate = useHardNavigate();
  const credentials = useAppStore((state) => state.apiCredentials ?? []);
  const webhooks = useAppStore((state) => state.webhooks ?? []);
  const developerSubscriptionStatus = useAppStore((state) => state.developerSubscriptionStatus ?? "free");
  const securityLog = useAppStore((state) => state.securityLog ?? []);
  const activityLog = useAppStore((state) => state.activityLog ?? []);
  const generateApiCredential = useAppStore((state) => state.generateApiCredential);
  const revokeApiCredential = useAppStore((state) => state.revokeApiCredential);
  const setDeveloperSubscriptionStatus = useAppStore((state) => state.setDeveloperSubscriptionStatus);
  const generateWebhook = useAppStore((state) => state.generateWebhook);
  const revokeWebhook = useAppStore((state) => state.revokeWebhook);
  const toggleWebhookStatus = useAppStore((state) => state.toggleWebhookStatus);
  const addActivity = useAppStore((state) => state.addActivity);
  const pushToast = useAppStore((state) => state.pushToast);
  const [activeTab, setActiveTab] = useState<DeveloperTab>("Overview");
  const [label, setLabel] = useState("SignalNest automation key");
  const [selectedScopes, setSelectedScopes] = useState(["trackers:read", "trackers:write", "alerts:write"]);
  const [oneTimeSecrets, setOneTimeSecrets] = useState<Record<string, string>>({});
  const [webhookLabel, setWebhookLabel] = useState("SignalNest event bridge");
  const [webhookUrl, setWebhookUrl] = useState("https://example.com/signalnest/webhook");
  const [selectedEvents, setSelectedEvents] = useState(["tracker.changed", "alert.triggered"]);
  const [oneTimeWebhookSecrets, setOneTimeWebhookSecrets] = useState<Record<string, string>>({});
  const [subscriptionCheckout, setSubscriptionCheckout] = useState<DeveloperSubscriptionCheckout | null>(null);
  const [subscriptionBusy, setSubscriptionBusy] = useState(false);
  const latestCredential = useMemo(() => credentials[0], [credentials]);
  const latestWebhook = useMemo(() => webhooks[0], [webhooks]);
  const apiKeyLimitReached = credentials.length >= 1 && developerSubscriptionStatus !== "active";
  const requestRows = [...securityLog, ...activityLog].slice(0, 9);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("developer_subscription") !== "returned") return;
    setDeveloperSubscriptionStatus("active");
    pushToast({ title: "Developer Pro active", body: "Additional API keys are unlocked for this account.", tone: "success" });
    window.history.replaceState({}, "", "/app/developers");
  }, [pushToast, setDeveloperSubscriptionStatus]);

  function toggleScope(scope: string) {
    setSelectedScopes((current) => (current.includes(scope) ? current.filter((item) => item !== scope) : [...current, scope]));
  }

  function toggleWebhookEvent(eventName: string) {
    setSelectedEvents((current) => (current.includes(eventName) ? current.filter((item) => item !== eventName) : [...current, eventName]));
  }

  async function beginDeveloperSubscription() {
    try {
      setSubscriptionBusy(true);
      const checkout = await createDeveloperSubscriptionCheckout();
      setSubscriptionCheckout(checkout);
      setDeveloperSubscriptionStatus("checkout_pending");
      setActiveTab("API Keys");
      pushToast({
        title: checkout.live ? "Developer Pro checkout ready" : "Live subscription checkout disabled",
        body: checkout.live ? "$10/month hosted checkout is ready." : "Set billing link settings in backend/.env to enable live billing.",
        tone: checkout.live ? "success" : "warning",
      });
    } catch (error) {
      pushToast({
        title: "Subscription checkout unavailable",
        body: error instanceof Error ? error.message : "Developer Pro checkout could not be created.",
        tone: "warning",
      });
    } finally {
      setSubscriptionBusy(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!label.trim() || selectedScopes.length === 0) return;
    if (apiKeyLimitReached) {
      void beginDeveloperSubscription();
      return;
    }
    const credential = generateApiCredential(label.trim(), selectedScopes);
    setOneTimeSecrets((current) => ({ ...current, [credential.id]: credential.secret }));
    setLabel("SignalNest automation key");
  }

  function submitWebhook(event: FormEvent) {
    event.preventDefault();
    if (!webhookLabel.trim() || !webhookUrl.trim() || selectedEvents.length === 0) return;
    const webhook = generateWebhook(webhookLabel.trim(), webhookUrl.trim(), selectedEvents);
    setOneTimeWebhookSecrets((current) => ({ ...current, [webhook.id]: webhook.signingSecret }));
    setWebhookLabel("SignalNest event bridge");
  }

  function startRealtimeDemo() {
    addActivity("Realtime demo event: tracker.changed delivered in 112ms");
    addActivity("Realtime demo event: webhook.delivery.succeeded");
    addActivity("Realtime demo event: alert.triggered from pricing monitor");
    setActiveTab("Request Log");
    pushToast({ title: "Demo stream started", body: "Realtime API events were added to the request log.", tone: "success" });
  }

  async function copyValue(value: string | undefined, title: string) {
    if (!value) return;
    await navigator.clipboard?.writeText(value);
    pushToast({ title, body: "Copied to clipboard.", tone: "success" });
  }

  return (
    <div className="grid min-w-0 gap-7">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
        <div className="min-w-0">
          <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-white">Developers</h1>
          <nav className="mt-4 flex max-w-full flex-wrap gap-1 pb-1">
            {tabs.map((tab) => <TabButton key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)}>{tab}</TabButton>)}
          </nav>
        </div>
        <div className="flex gap-2">
          <DevButton onClick={() => navigate("/app/pricing-api")}>API Pricing <ExternalLink className="h-3.5 w-3.5" /></DevButton>
          <DevButton onClick={() => navigate("/app/developers/docs")}>Documentation <ExternalLink className="h-3.5 w-3.5" /></DevButton>
        </div>
      </header>

      {activeTab === "Overview" && (
        <div className="grid gap-8">
          <section className="panel flex flex-wrap items-center justify-between gap-4 rounded-lg p-2">
            <div className="flex min-w-0 items-center gap-4">
              <div className="grid h-[78px] w-[92px] shrink-0 place-items-center overflow-hidden rounded-md bg-[radial-gradient(circle_at_20%_20%,#00e5ff,transparent_28%),radial-gradient(circle_at_80%_80%,#ffb15f,transparent_34%),linear-gradient(135deg,#05070a,#1e293b)] text-[9px] font-semibold text-white">
                SignalNest Realtime
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-white">Try SignalNest Realtime v2</div>
                <p className="max-w-2xl text-sm leading-5 text-slate-400">Stream tracker changes, alert events, and webhook deliveries with low-latency workspace synchronization.</p>
              </div>
            </div>
            <DevButton className="mr-4" onClick={startRealtimeDemo}>Try the demo</DevButton>
          </section>

          <section className="panel grid gap-6 rounded-lg p-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-center">
            <div>
              <h2 className="text-lg font-semibold text-white">Developer quickstart</h2>
              <p className="mt-4 text-sm leading-6 text-slate-400">Learn the basics and make your first authenticated request with the SignalNest API.</p>
              <button className="mt-4 rounded-md bg-cyan/15 px-4 py-2 text-sm font-semibold text-cyan transition hover:bg-cyan/20" onClick={() => setActiveTab("API Keys")}>Get started</button>
            </div>
            <CodePanel code={quickstartCode} onCopy={() => void copyValue(quickstartCode, "Quickstart copied")} />
          </section>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <section>
              <h2 className="mb-4 text-lg font-semibold text-white">Usage</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <StatCard label="API keys" value={`${credentials.length}/1 free`} icon={<KeyRound className="h-5 w-5" />} />
                <StatCard label="Webhooks" value={String(webhooks.length)} icon={<Webhook className="h-5 w-5" />} />
                <StatCard label="Plan" value={developerSubscriptionStatus === "active" ? "Pro" : "$0"} icon={<CreditCard className="h-5 w-5" />} />
                <StatCard label="Events logged" value={String(requestRows.length)} icon={<BarChart3 className="h-5 w-5" />} />
              </div>
            </section>
            <section>
              <h2 className="mb-4 text-lg font-semibold text-white">Quick Links</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <QuickLink icon={<KeyRound className="h-5 w-5" />} label="Create an API Key" onClick={() => setActiveTab("API Keys")} />
                <QuickLink icon={<Grid2X2 className="h-5 w-5" />} label="Manage webhooks" onClick={() => setActiveTab("Webhooks")} />
                <QuickLink icon={<FileText className="h-5 w-5" />} label="View request log" onClick={() => setActiveTab("Request Log")} />
                <QuickLink icon={<Boxes className="h-5 w-5" />} label="Environment variables" onClick={() => setActiveTab("Environment variables")} />
              </div>
            </section>
          </div>
        </div>
      )}

      {activeTab === "API Keys" && (
        <div className="grid gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
          <SectionCard title="Create API key" icon={<KeyRound className="h-5 w-5" />}>
            <form onSubmit={submit} className="grid gap-4">
              <label className="block text-sm">
                <span className="mb-2 block text-slate-400">Credential label</span>
                <input id="api-key-label" value={label} onChange={(event) => setLabel(event.target.value)} className="w-full rounded-md border border-white/10 bg-black/25 px-3 py-2 text-white outline-none focus:border-cyan/40" />
              </label>
              <div>
                <div className="mb-2 text-sm text-slate-400">Scopes</div>
                <div className="grid gap-2">
                  {scopeOptions.map((scope) => {
                    const active = selectedScopes.includes(scope.id);
                    return (
                      <button key={scope.id} type="button" onClick={() => toggleScope(scope.id)} className={`flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition ${active ? "border-cyan/30 bg-cyan/10 text-white" : "border-white/10 bg-white/[0.035] text-slate-400 hover:border-cyan/30 hover:text-white"}`}>
                        <span>{scope.label}</span>
                        {active && <CheckCircle2 className="h-4 w-4 text-cyan" />}
                      </button>
                    );
                  })}
                </div>
              </div>
              {credentials.length > 0 && (
                <div className={`rounded-md border p-3 text-sm ${developerSubscriptionStatus === "active" ? "border-cyan/20 bg-cyan/10 text-cyan" : "border-amber/20 bg-amber/10 text-amber"}`}>
                  <div className="font-semibold">{developerSubscriptionStatus === "active" ? "Developer Pro active" : "Free API key limit reached"}</div>
                  <p className="mt-1 leading-5 text-slate-400">{developerSubscriptionStatus === "active" ? "This account can generate additional API keys." : "Each account includes one free API key. Additional keys require Developer Pro at $10/month."}</p>
                </div>
              )}
              <button className="rounded-md border border-cyan/30 bg-cyan/15 px-4 py-2 text-sm font-semibold text-cyan disabled:cursor-not-allowed disabled:opacity-50" type="submit" disabled={!label.trim() || selectedScopes.length === 0 || subscriptionBusy}>
                {apiKeyLimitReached ? (subscriptionBusy ? "Creating checkout..." : "Subscribe for $10/month") : "Generate API key and secret"}
              </button>
            </form>
            {apiKeyLimitReached && <SubscriptionPanel checkout={subscriptionCheckout} busy={subscriptionBusy} begin={beginDeveloperSubscription} />}
          </SectionCard>

          <SectionCard title="API Keys" icon={<Braces className="h-5 w-5" />}>
            <div className="grid gap-3">
              {latestCredential && (
                <div className="rounded-lg border border-cyan/20 bg-cyan/10 p-3">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><ShieldCheck className="h-4 w-4 text-cyan" /> Latest credential</div>
                  <CredentialRow label="API key" value={latestCredential.key} onCopy={() => copyValue(latestCredential.key, "API key copied")} />
                  <CredentialRow label="API secret" value={oneTimeSecrets[latestCredential.id] ?? hiddenSecretHint(latestCredential.secretHint ?? latestCredential.secret)} muted={!oneTimeSecrets[latestCredential.id]} onCopy={() => copyValue(oneTimeSecrets[latestCredential.id], "API secret copied")} />
                </div>
              )}
              {credentials.map((credential) => (
                <div key={credential.id} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-white">{credential.label}</div>
                      <div className="mt-1 text-xs text-slate-500">Created {credential.createdAt} / Last used {credential.lastUsed}</div>
                    </div>
                    <DevButton danger onClick={() => revokeApiCredential(credential.id)}><Trash2 className="h-3.5 w-3.5" /> Revoke</DevButton>
                  </div>
                  <div className="mt-4 grid gap-2 xl:grid-cols-2">
                    <CredentialRow label="Key" value={credential.key} onCopy={() => copyValue(credential.key, "API key copied")} />
                    <CredentialRow label="Secret" value={oneTimeSecrets[credential.id] ?? hiddenSecretHint(credential.secretHint ?? credential.secret)} muted={!oneTimeSecrets[credential.id]} onCopy={() => copyValue(oneTimeSecrets[credential.id], "API secret copied")} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">{credential.scopes.map((scope) => <span key={scope} className="rounded border border-cyan/20 bg-cyan/10 px-2 py-1 text-xs text-cyan">{scope}</span>)}</div>
                </div>
              ))}
              {credentials.length === 0 && <EmptyState text="No API keys yet. Generate your one free key to connect external tools." />}
            </div>
          </SectionCard>
        </div>
      )}

      {activeTab === "Webhooks" && (
        <div className="grid gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
          <SectionCard title="Create webhook" icon={<Webhook className="h-5 w-5" />}>
            <form onSubmit={submitWebhook} className="grid gap-4">
              <label className="block text-sm"><span className="mb-2 block text-slate-400">Webhook label</span><input value={webhookLabel} onChange={(event) => setWebhookLabel(event.target.value)} className="w-full rounded-md border border-white/10 bg-black/25 px-3 py-2 text-white outline-none focus:border-cyan/40" /></label>
              <label className="block text-sm"><span className="mb-2 block text-slate-400">Delivery URL</span><input value={webhookUrl} onChange={(event) => setWebhookUrl(event.target.value)} className="w-full rounded-md border border-white/10 bg-black/25 px-3 py-2 text-white outline-none focus:border-cyan/40" /></label>
              <div>
                <div className="mb-2 text-sm text-slate-400">Events</div>
                <div className="grid gap-2">
                  {webhookEventOptions.map((eventOption) => {
                    const active = selectedEvents.includes(eventOption.id);
                    return <button key={eventOption.id} type="button" onClick={() => toggleWebhookEvent(eventOption.id)} className={`flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition ${active ? "border-cyan/30 bg-cyan/10 text-white" : "border-white/10 bg-white/[0.035] text-slate-400 hover:border-cyan/30 hover:text-white"}`}><span>{eventOption.label}</span>{active && <CheckCircle2 className="h-4 w-4 text-cyan" />}</button>;
                  })}
                </div>
              </div>
              <button className="rounded-md border border-cyan/30 bg-cyan/15 px-4 py-2 text-sm font-semibold text-cyan disabled:cursor-not-allowed disabled:opacity-50" type="submit" disabled={!webhookLabel.trim() || !webhookUrl.trim() || selectedEvents.length === 0}>Generate webhook secret</button>
            </form>
          </SectionCard>
          <SectionCard title="Webhook endpoints" icon={<Webhook className="h-5 w-5" />}>
            <div className="grid gap-3">
              {latestWebhook && (
                <div className="rounded-lg border border-cyan/20 bg-cyan/10 p-3">
                  <div className="mb-3 text-sm font-semibold text-white">Latest webhook</div>
                  <CredentialRow label="Endpoint URL" value={latestWebhook.url} onCopy={() => copyValue(latestWebhook.url, "Webhook URL copied")} />
                  <CredentialRow label="Signing secret" value={oneTimeWebhookSecrets[latestWebhook.id] ?? hiddenSecretHint(latestWebhook.signingSecretHint)} muted={!oneTimeWebhookSecrets[latestWebhook.id]} onCopy={() => copyValue(oneTimeWebhookSecrets[latestWebhook.id], "Webhook signing secret copied")} />
                </div>
              )}
              {webhooks.map((webhook) => (
                <div key={webhook.id} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0"><div className="font-semibold text-white">{webhook.label}</div><div className="mt-1 truncate text-xs text-slate-500">{webhook.url}</div><div className="mt-1 text-xs text-slate-500">Created {webhook.createdAt}</div></div>
                    <div className="flex gap-2"><DevButton onClick={() => toggleWebhookStatus(webhook.id)}>{webhook.status}</DevButton><DevButton danger onClick={() => revokeWebhook(webhook.id)}><Trash2 className="h-3.5 w-3.5" /> Revoke</DevButton></div>
                  </div>
                  <div className="mt-4 grid gap-2 xl:grid-cols-2">
                    <CredentialRow label="Signing secret" value={oneTimeWebhookSecrets[webhook.id] ?? hiddenSecretHint(webhook.signingSecretHint)} muted={!oneTimeWebhookSecrets[webhook.id]} onCopy={() => copyValue(oneTimeWebhookSecrets[webhook.id], "Webhook signing secret copied")} />
                    <CredentialRow label="Delivery URL" value={webhook.url} onCopy={() => copyValue(webhook.url, "Webhook URL copied")} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">{webhook.events.map((eventName) => <span key={eventName} className="rounded border border-cyan/20 bg-cyan/10 px-2 py-1 text-xs text-cyan">{eventName}</span>)}</div>
                </div>
              ))}
              {webhooks.length === 0 && <EmptyState text="No webhooks yet. Generate one to push events into external systems." />}
            </div>
          </SectionCard>
        </div>
      )}

      {activeTab === "Analytics" && <AnalyticsSection credentials={credentials.length} webhooks={webhooks.length} subscription={developerSubscriptionStatus} requests={requestRows.length} />}
      {activeTab === "Request Log" && <RequestLogSection rows={requestRows} />}
      {activeTab === "Environment variables" && <EnvironmentSection />}
    </div>
  );
}

function TabButton({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return <button onClick={onClick} className={`whitespace-nowrap rounded-md px-3 py-2 text-sm transition ${active ? "border border-cyan/30 bg-cyan/10 font-semibold text-white" : "text-slate-400 hover:bg-white/[0.055] hover:text-white"}`}>{children}</button>;
}

function DevButton({ children, onClick, className = "", danger }: { children: ReactNode; onClick?: () => void; className?: string; danger?: boolean }) {
  return <button onClick={onClick} className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md border px-3 text-sm font-medium transition ${danger ? "border-rose-300/20 bg-rose-400/10 text-rose-200 hover:bg-rose-400/15" : "border-white/10 bg-white/[0.045] text-slate-100 hover:border-cyan/30 hover:bg-white/[0.08]"} ${className}`}>{children}</button>;
}

function SectionCard({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return <section className="panel rounded-lg p-5"><div className="mb-5 flex items-center gap-2 font-semibold text-white">{icon}{title}</div>{children}</section>;
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return <div className="panel rounded-lg p-5"><div className="mb-4 grid h-10 w-10 place-items-center rounded-md border border-cyan/20 bg-cyan/10 text-cyan">{icon}</div><div className="text-sm text-slate-400">{label}</div><div className="mt-1 text-3xl font-semibold tracking-[-0.03em] text-white">{value}</div></div>;
}

function QuickLink({ label, icon, onClick }: { label: string; icon: ReactNode; onClick: () => void }) {
  return <button onClick={onClick} className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.035] p-4 text-left font-semibold text-white transition hover:border-cyan/30 hover:bg-cyan/10"><span className="text-cyan">{icon}</span>{label}</button>;
}

function CodePanel({ code, onCopy }: { code: string; onCopy: () => void }) {
  const lines = code.split("\n");
  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-white/10 bg-[#070a10]">
      <div className="flex justify-end border-b border-white/10 px-3 py-2"><DevButton onClick={onCopy}><Clipboard className="h-3.5 w-3.5" /></DevButton></div>
      <pre className="max-h-[330px] overflow-auto p-0 text-[13px] leading-6 text-cyan"><code>{lines.map((line, index) => <div key={`${index}-${line}`} className="grid grid-cols-[34px_minmax(0,1fr)]"><span className="select-none border-r border-white/10 pr-2 text-right text-slate-600">{index + 1}</span><span className="px-3">{line || " "}</span></div>)}</code></pre>
      <div className="flex justify-end border-t border-white/10 px-3 py-2"><DevButton>JavaScript</DevButton></div>
    </div>
  );
}

function CredentialRow({ label, value, muted, onCopy }: { label: string; value: string; muted?: boolean; onCopy: () => void }) {
  return (
    <div className="mb-2 min-w-0 rounded-md border border-white/10 bg-black/25 p-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</div>
      <div className="flex min-w-0 items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded bg-white/[0.04] px-2 py-1 text-xs text-cyan">{muted ? `${value} / hidden after creation` : value}</code>
        <button className="rounded-md border border-white/10 bg-white/[0.04] p-2 text-slate-200 disabled:cursor-not-allowed disabled:opacity-40" onClick={onCopy} disabled={muted} aria-label={`Copy ${label}`}><Clipboard className="h-3.5 w-3.5" /></button>
      </div>
    </div>
  );
}

function SubscriptionPanel({ checkout, busy, begin }: { checkout: DeveloperSubscriptionCheckout | null; busy: boolean; begin: () => Promise<void> }) {
  return (
    <div className="mt-4 rounded-md border border-amber/20 bg-amber/10 p-3 text-sm">
      <div className="font-semibold text-amber">Developer Pro required</div>
      <p className="mt-1 leading-5 text-slate-400">Additional API keys require the $10/month Developer Pro plan.</p>
      {checkout ? (
        <DevButton className="mt-3 w-full" onClick={() => window.open(checkout.checkoutUrl, "_blank", "noopener,noreferrer")}>{checkout.live ? "Continue to checkout" : "Live checkout disabled"} <ExternalLink className="h-3.5 w-3.5" /></DevButton>
      ) : (
        <DevButton className="mt-3 w-full" onClick={() => void begin()}>{busy ? "Creating checkout..." : "Prepare checkout"}</DevButton>
      )}
    </div>
  );
}

function AnalyticsSection({ credentials, webhooks, subscription, requests }: { credentials: number; webhooks: number; subscription: string; requests: number }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      <StatCard label="API keys" value={String(credentials)} icon={<KeyRound className="h-5 w-5" />} />
      <StatCard label="Webhook endpoints" value={String(webhooks)} icon={<Webhook className="h-5 w-5" />} />
      <StatCard label="Plan state" value={subscription === "active" ? "Pro" : "Free"} icon={<CreditCard className="h-5 w-5" />} />
      <StatCard label="Recent events" value={String(requests)} icon={<BarChart3 className="h-5 w-5" />} />
    </div>
  );
}

function RequestLogSection({ rows }: { rows: string[] }) {
  return <SectionCard title="Request Log" icon={<FileText className="h-5 w-5" />}><div className="grid gap-2">{rows.map((row, index) => <div key={`${row}-${index}`} className="grid gap-1 rounded-md border border-white/10 bg-white/[0.035] p-3 sm:grid-cols-[130px_minmax(0,1fr)_80px]"><span className="text-xs text-slate-500">Just now</span><span className="truncate text-sm text-white">{row}</span><span className="text-xs font-semibold text-emerald-200">200 OK</span></div>)}{rows.length === 0 && <EmptyState text="No developer requests have been logged yet." />}</div></SectionCard>;
}

function EnvironmentSection() {
  const variables = [
    ["VITE_API_URL", "Frontend API base URL", "frontend/.env"],
    ["BILLING_ENABLE_LIVE_CHECKOUT", "Enable hosted billing handoff", "backend/.env"],
    ["BILLING_PROVIDER_NAME", "Billing provider display name", "backend/.env"],
    ["BILLING_SKILL_CHECKOUT_URL", "Paid skill checkout URL", "backend/.env"],
    ["BILLING_DEVELOPER_SUBSCRIPTION_URL", "$10/month subscription checkout URL", "backend/.env"],
    ["JWT_ACCESS_SECRET", "Access token signing secret", "backend/.env"],
    ["JWT_REFRESH_SECRET", "Refresh token signing secret", "backend/.env"],
  ];
  return <SectionCard title="Environment variables" icon={<Boxes className="h-5 w-5" />}><div className="grid gap-3">{variables.map(([name, detail, file]) => <div key={name} className="rounded-lg border border-white/10 bg-white/[0.035] p-4"><div className="font-mono text-sm font-semibold text-white">{name}</div><div className="mt-1 text-sm text-slate-400">{detail}</div><div className="mt-2 inline-flex rounded border border-cyan/20 bg-cyan/10 px-2 py-1 text-xs text-cyan">{file}</div></div>)}</div></SectionCard>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-lg border border-white/10 bg-white/[0.035] p-5 text-sm text-slate-400">{text}</div>;
}
