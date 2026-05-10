import { Activity, Archive, ArrowUpRight, Clock3, GitBranch, RefreshCw, ShieldAlert } from "lucide-react";
import { Link } from "../lib/navigation";
import { Button } from "../components/Button";
import { NetworkCanvas } from "../components/NetworkCanvas";
import { Sparkline } from "../components/Sparkline";
import { signalEvents } from "../data/mockData";
import { severityClass } from "../lib/utils";
import { useAppStore } from "../stores/useAppStore";

export function Dashboard() {
  const trackers = useAppStore((state) => state.trackers);
  const alerts = useAppStore((state) => state.alerts);
  const vaultItems = useAppStore((state) => state.vaultItems);
  const acknowledgedEvents = useAppStore((state) => state.acknowledgedEvents ?? []);
  const acknowledgeEvent = useAppStore((state) => state.acknowledgeEvent);
  const setCommandOpen = useAppStore((state) => state.setCommandOpen);
  const refreshTracker = useAppStore((state) => state.refreshTracker);
  const captureSnapshot = useAppStore((state) => state.captureSnapshot);
  const pushToast = useAppStore((state) => state.pushToast);
  const activeTrackers = trackers.filter((tracker) => !tracker.archived);
  const visibleEvents = signalEvents.filter((event) => !acknowledgedEvents.includes(event.id));
  const liveMetrics = [
    { label: "Active monitors", value: String(activeTrackers.length), icon: Activity },
    { label: "Enabled alerts", value: String(alerts.filter((alert) => alert.enabled).length), icon: ShieldAlert },
    { label: "Vault records", value: String(vaultItems.length), icon: Clock3 },
    { label: "Avg health", value: `${Math.round(activeTrackers.reduce((sum, tracker) => sum + tracker.health, 0) / Math.max(1, activeTrackers.length))}%`, icon: GitBranch },
  ];

  function refreshAll() {
    activeTrackers.forEach((tracker) => refreshTracker(tracker.id));
    pushToast({ title: "Dashboard refreshed", body: `${activeTrackers.length} monitors checked locally.`, tone: "info" });
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.55fr_.95fr]">
      <section className="grid gap-4">
        <div className="panel relative min-h-[360px] overflow-hidden rounded-lg p-5">
          <NetworkCanvas className="absolute inset-0 h-full w-full opacity-40" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-cyan">Command center</div>
                <h2 className="mt-2 max-w-2xl text-3xl font-black text-white md:text-5xl">Your monitors, alerts, saved research, and changes in one place.</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Start with Live Monitoring to add sources. Use Alerts for rules, Vault for saved evidence, and Change Engine when a source changes.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={refreshAll}>Refresh all</Button>
                <Button variant="secondary" icon={<Archive className="h-4 w-4" />} onClick={captureSnapshot}>Snapshot</Button>
                <Button variant="primary" icon={<Activity className="h-4 w-4" />} onClick={() => setCommandOpen(true)}>Quick open</Button>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-4">
              {liveMetrics.map((metric) => (
                <div key={metric.label} className="rounded-md border border-white/10 bg-black/25 p-4">
                  <metric.icon className="mb-3 h-4 w-4 text-cyan" />
                  <div className="text-2xl font-black text-white">{metric.value}</div>
                  <div className="mt-1 text-xs text-slate-400">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {activeTrackers.slice(0, 4).map((tracker) => (
            <Link key={tracker.id} to="/app/monitoring" className="panel rounded-lg p-4 transition hover:-translate-y-1 hover:border-cyan/30">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-white">{tracker.title}</div>
                  <div className="text-xs text-slate-500">{tracker.kind} · {tracker.source}</div>
                </div>
                <span className={`rounded border px-2 py-1 text-xs ${severityClass(tracker.severity)}`}>{tracker.severity}</span>
              </div>
              <Sparkline values={tracker.sparkline} />
              <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
                <span>Health {tracker.health}%</span>
                <span>{tracker.delta > 0 ? "+" : ""}{tracker.delta}% delta</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <aside className="grid gap-4">
        <div className="panel rounded-lg p-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Event stream</h3>
            <Clock3 className="h-3.5 w-3.5 text-slate-500" />
          </div>
          <div className="grid gap-2">
            {visibleEvents.map((event) => (
              <div key={event.id} className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-2">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-white">{event.title}</span>
                  <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] leading-none ${severityClass(event.severity)}`}>{event.severity}</span>
                </div>
                <p className="text-xs leading-5 text-slate-400">{event.summary}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="truncate text-[11px] text-slate-500">{event.source} · {event.timestamp}</div>
                  <Button variant="ghost" className="min-h-6 px-1.5 text-[11px]" onClick={() => acknowledgeEvent(event.id)}>Ack</Button>
                </div>
              </div>
            ))}
            {visibleEvents.length === 0 && (
              <div className="rounded-md border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-200">
                Event stream cleared for this session.
              </div>
            )}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
          <Link to="/app/changes" className="panel rounded-lg p-4 transition hover:border-amber/30">
            <ShieldAlert className="mb-4 h-5 w-5 text-amber" />
            <div className="font-bold">Change engine</div>
            <p className="mt-2 text-sm leading-6 text-slate-400">Inspect diffs, visual shifts, outages, pricing changes, frequency, and severity timelines.</p>
          </Link>
          <Link to="/app/map" className="panel rounded-lg p-4 transition hover:border-violet/30">
            <GitBranch className="mb-4 h-5 w-5 text-violet" />
            <div className="font-bold">Signal relationship map</div>
            <p className="mt-2 text-sm leading-6 text-slate-400">Explore live categories, linked entities, influence clusters, and topic proximity.</p>
            <ArrowUpRight className="mt-4 h-4 w-4 text-slate-500" />
          </Link>
        </div>
      </aside>
    </div>
  );
}
