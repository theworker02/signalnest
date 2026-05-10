import { useMutation, useQuery } from "@tanstack/react-query";
import { Filter, Plus, RefreshCw, Search, Trash2, Wand2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "../components/Button";
import { PageIntro } from "../components/PageIntro";
import { Sparkline } from "../components/Sparkline";
import * as api from "../lib/api";
import { severityClass } from "../lib/utils";
import { useAppStore } from "../stores/useAppStore";
import type { Tracker, TrackerKind } from "../types";

const kinds: TrackerKind[] = ["website", "rss", "api", "github", "news", "stock", "weather", "outage", "keyword", "subreddit"];
const monitorTemplates: Array<{ title: string; kind: TrackerKind; source: string; tags: string[] }> = [
  { title: "SaaS pricing page", kind: "website", source: "https://example.com/pricing", tags: ["pricing", "website"] },
  { title: "GitHub release watcher", kind: "github", source: "github.com/org/repo/releases", tags: ["github", "release"] },
  { title: "Cloud status feed", kind: "outage", source: "status.example.com/history.rss", tags: ["outage", "status"] },
  { title: "Keyword trend radar", kind: "keyword", source: "\"product launch\" OR \"security incident\"", tags: ["trend", "keyword"] },
  { title: "Local weather alerts", kind: "weather", source: "api.weather.gov/alerts/active", tags: ["weather", "local"] },
  { title: "Subreddit activity spike", kind: "subreddit", source: "r/technology hot + rising", tags: ["reddit", "community"] },
  { title: "CVE exploit watch", kind: "api", source: "services.nvd.nist.gov/rest/json/cves/2.0?cvssV3Severity=CRITICAL", tags: ["security", "cve"] },
  { title: "SEC filing radar", kind: "rss", source: "sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=8-K&output=atom", tags: ["sec", "filings"] },
  { title: "Terms policy diff", kind: "website", source: "https://example.com/legal/terms", tags: ["legal", "compliance"] },
  { title: "Package supply-chain drift", kind: "api", source: "registry.npmjs.org/package/latest + pypi.org/pypi/package/json", tags: ["supply-chain", "packages"] },
  { title: "Domain and TLS guard", kind: "website", source: "whois + DNS + certificate transparency", tags: ["domain", "tls"] },
  { title: "Flight disruption net", kind: "rss", source: "faa.gov/air_traffic/status + airport advisories", tags: ["travel", "faa"] },
  { title: "Public safety bundle", kind: "rss", source: "FEMA + USGS + NOAA emergency feeds", tags: ["public-safety", "alerts"] },
  { title: "App store rank watch", kind: "website", source: "apps.apple.com + play.google.com listing snapshots", tags: ["app-store", "rankings"] },
  { title: "Grant opportunity watch", kind: "rss", source: "grants.gov/search-results-detail + agency feeds", tags: ["grants", "rfp"] },
  { title: "Hardware stock radar", kind: "website", source: "retailer inventory and price pages", tags: ["hardware", "inventory"] },
];

export function Monitoring() {
  const trackers = useAppStore((state) => state.trackers);
  const setTrackers = useAppStore((state) => state.setTrackers);
  const addTracker = useAppStore((state) => state.addTracker);
  const updateTracker = useAppStore((state) => state.updateTracker);
  const archiveTracker = useAppStore((state) => state.archiveTracker);
  const refreshTrackerLocal = useAppStore((state) => state.refreshTracker);
  const reorderTrackers = useAppStore((state) => state.reorderTrackers);
  const pushToast = useAppStore((state) => state.pushToast);
  const [dragged, setDragged] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<TrackerKind>("website");
  const [source, setSource] = useState("");
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<TrackerKind | "all">("all");
  const [sortMode, setSortMode] = useState<"priority" | "health" | "recent">("priority");
  const trackerQuery = useQuery({
    queryKey: ["trackers"],
    queryFn: api.listTrackers,
    retry: false,
  });
  const createMutation = useMutation({ mutationFn: api.createTracker });
  const refreshMutation = useMutation({ mutationFn: api.refreshTracker });
  const archiveMutation = useMutation({ mutationFn: api.archiveTracker });

  useEffect(() => {
    if (trackerQuery.data) setTrackers(trackerQuery.data);
  }, [setTrackers, trackerQuery.data]);

  async function createTracker(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !source.trim()) return;
    const localTracker: Tracker = {
      id: `trk-${Date.now()}`,
      title: title.trim(),
      kind,
      source: source.trim(),
      interval: "5m",
      health: 100,
      delta: 0,
      severity: "low",
      tags: [kind, "custom"],
      sparkline: [30, 32, 35, 34, 39, 41, 43, 45, 48, 50],
      timeline: [],
    };
    try {
      const tracker = await createMutation.mutateAsync({
        title: title.trim(),
        kind,
        source: source.trim(),
        intervalSeconds: 300,
        tags: [kind, "custom"],
      });
      addTracker(tracker);
      pushToast({ title: "Monitor created", body: `${tracker.title} was created through the SignalNest API.`, tone: "success" });
    } catch {
      addTracker(localTracker);
      pushToast({ title: "Monitor created offline", body: `${localTracker.title} was saved locally because the API was unavailable.`, tone: "warning" });
    }
    setTitle("");
    setSource("");
  }

  async function refresh(id: string) {
    setRefreshing(id);
    try {
      const tracker = await refreshMutation.mutateAsync(id);
      updateTracker(tracker);
      pushToast({ title: "Monitor refreshed", body: `${tracker.title} was refreshed through the API.`, tone: "info" });
    } catch {
      refreshTrackerLocal(id);
    }
    window.setTimeout(() => setRefreshing(null), 700);
  }

  async function archive(id: string) {
    try {
      const tracker = await archiveMutation.mutateAsync(id);
      updateTracker(tracker);
      pushToast({ title: "Tracker archived", body: `${tracker.title} was archived through the API.`, tone: "success" });
    } catch {
      archiveTracker(id);
    }
  }

  const activeTrackers = trackers.filter((tracker) => !tracker.archived);
  const filteredTrackers = activeTrackers
    .filter((tracker) => kindFilter === "all" || tracker.kind === kindFilter)
    .filter((tracker) => {
      const term = query.trim().toLowerCase();
      if (!term) return true;
      return [tracker.title, tracker.kind, tracker.source, ...tracker.tags].some((value) => value.toLowerCase().includes(term));
    })
    .sort((a, b) => {
      if (sortMode === "health") return a.health - b.health;
      if (sortMode === "recent") return Number(Boolean(b.lastChecked)) - Number(Boolean(a.lastChecked));
      const rank = { critical: 0, high: 1, medium: 2, low: 3 };
      return rank[a.severity] - rank[b.severity] || a.health - b.health;
    });

  function applyTemplate(template: (typeof monitorTemplates)[number]) {
    setTitle(template.title);
    setKind(template.kind);
    setSource(template.source);
    pushToast({ title: "Template loaded", body: `${template.title} is ready to customize.`, tone: "info" });
  }

  return (
    <div className="grid gap-4">
      <PageIntro
        eyebrow="Live Monitoring"
        title="Create and refresh monitors."
        body="Create a monitor from a URL, feed, repo, stock, outage source, or keyword. Refresh checks the source through the API when available and falls back to local recovery mode."
      />
      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,340px)_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
      <div className="grid min-w-0 content-start gap-4 overflow-hidden">
      <form onSubmit={createTracker} className="panel min-w-0 overflow-hidden rounded-lg p-4">
        <h2 className="mb-1 text-lg font-bold text-white">Create monitor</h2>
        <p className="mb-5 text-sm leading-6 text-slate-400">Track a source with interval refresh, change history, tags, and alert-ready state.</p>
        <label className="mb-3 block text-sm">
          <span className="mb-2 block text-slate-400">Signal name</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} className="w-full min-w-0 rounded-md border border-white/10 bg-black/25 px-3 py-2 text-white outline-none focus:border-cyan/40" placeholder="Competitor pricing page" />
        </label>
        <label className="mb-3 block text-sm">
          <span className="mb-2 block text-slate-400">Source</span>
          <input value={source} onChange={(event) => setSource(event.target.value)} className="w-full min-w-0 rounded-md border border-white/10 bg-black/25 px-3 py-2 text-white outline-none focus:border-cyan/40" placeholder="https://example.com/pricing" />
        </label>
        <label className="mb-5 block text-sm">
          <span className="mb-2 block text-slate-400">Kind</span>
          <select value={kind} onChange={(event) => setKind(event.target.value as TrackerKind)} className="w-full min-w-0 rounded-md border border-white/10 bg-black/25 px-3 py-2 text-white outline-none focus:border-cyan/40">
            {kinds.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <Button variant="primary" className="w-full" icon={<Plus className="h-4 w-4" />} type="submit" disabled={!title.trim() || !source.trim()}>Add monitor</Button>
      </form>

      <section className="panel min-w-0 overflow-hidden rounded-lg p-4">
        <div className="mb-4 flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-cyan" />
          <h2 className="font-bold text-white">Starter templates</h2>
        </div>
        <div className="grid gap-2">
          {monitorTemplates.map((template) => (
            <button
              key={`${template.kind}-${template.title}`}
              type="button"
              onClick={() => applyTemplate(template)}
              className="ui-tooltip rounded-md border border-white/10 bg-white/[0.035] px-3 py-2 text-left transition hover:border-cyan/30 hover:bg-cyan/10"
              data-tooltip={`Load ${template.kind} monitor template`}
            >
              <div className="text-sm font-bold text-white">{template.title}</div>
              <div className="mt-1 truncate text-xs text-slate-500">{template.source}</div>
            </button>
          ))}
        </div>
      </section>
      </div>

      <section className="grid min-w-0 content-start gap-3 overflow-hidden">
        <div className="panel min-w-0 overflow-hidden rounded-lg p-4">
          <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_180px_160px]">
            <label className="flex min-w-0 items-center gap-2 rounded-md border border-white/10 bg-black/25 px-3 py-2 text-sm">
              <Search className="h-4 w-4 text-slate-500" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-slate-500" placeholder="Search monitors, sources, or tags" />
            </label>
            <label className="flex items-center gap-2 rounded-md border border-white/10 bg-black/25 px-3 py-2 text-sm">
              <Filter className="h-4 w-4 text-slate-500" />
              <select value={kindFilter} onChange={(event) => setKindFilter(event.target.value as TrackerKind | "all")} className="min-w-0 flex-1 bg-transparent text-white outline-none">
                <option value="all">All kinds</option>
                {kinds.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <select value={sortMode} onChange={(event) => setSortMode(event.target.value as typeof sortMode)} className="rounded-md border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none">
              <option value="priority">Priority</option>
              <option value="health">Lowest health</option>
              <option value="recent">Recently checked</option>
            </select>
          </div>
          <div className="mt-3 text-xs text-slate-500">{filteredTrackers.length} of {activeTrackers.length} active monitors visible</div>
        </div>
        {trackerQuery.isError && (
        <div className="min-w-0 rounded-md border border-amber/25 bg-amber/10 px-4 py-3 text-sm text-amber">
            API offline. Monitoring changes will continue in local recovery mode.
          </div>
        )}
        {filteredTrackers.map((tracker) => (
          <article
            key={tracker.id}
            draggable
            onDragStart={() => setDragged(tracker.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (dragged) reorderTrackers(dragged, tracker.id);
              setDragged(null);
            }}
            className="panel min-w-0 overflow-hidden rounded-lg p-4 transition hover:border-cyan/30"
          >
            <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(160px,230px)_auto] lg:items-center">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-white">{tracker.title}</h3>
                  <span className={`rounded border px-2 py-0.5 text-[11px] ${severityClass(tracker.severity)}`}>{tracker.severity}</span>
                </div>
                <div className="break-words text-sm text-slate-400">
                  {tracker.kind} · {tracker.source} · refresh {tracker.interval}
                  {tracker.lastChecked ? ` · checked ${tracker.lastChecked}` : ""}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tracker.tags.map((tag) => <span key={tag} className="rounded border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-slate-400">#{tag}</span>)}
                </div>
              </div>
              <div className="min-w-0">
                <Sparkline values={tracker.sparkline} />
              </div>
              <div className="flex shrink-0 items-center justify-end gap-2">
                <Button variant="secondary" icon={<RefreshCw className={`h-4 w-4 ${refreshing === tracker.id ? "animate-spin" : ""}`} />} onClick={() => refresh(tracker.id)}>Refresh</Button>
                <Button variant="ghost" icon={<Trash2 className="h-4 w-4" />} onClick={() => void archive(tracker.id)} aria-label="Archive tracker" />
              </div>
            </div>
          </article>
        ))}
        {activeTrackers.length === 0 && (
          <div className="panel rounded-lg p-8 text-center text-slate-400">
            No active monitors remain. Create one from the panel on the left.
          </div>
        )}
        {activeTrackers.length > 0 && filteredTrackers.length === 0 && (
          <div className="panel rounded-lg p-8 text-center text-slate-400">
            No monitors match this filter. Clear the search or switch signal type.
          </div>
        )}
      </section>
      </div>
    </div>
  );
}
