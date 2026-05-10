import * as d3 from "d3";
import { Activity, AlertTriangle, BarChart3, Clock3, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../components/Button";
import { PageIntro } from "../components/PageIntro";
import { useAppStore } from "../stores/useAppStore";
import type { Tracker } from "../types";

type HeatmapMetric = "health" | "latency" | "change";

interface HeatCell {
  id: string;
  tracker: Tracker;
  hour: string;
  value: number;
  latency: number;
  change: number;
  status: "healthy" | "watch" | "risk";
}

const hours = ["00", "03", "06", "09", "12", "15", "18", "21"];
const metricOptions: { id: HeatmapMetric; label: string }[] = [
  { id: "health", label: "Health" },
  { id: "latency", label: "Latency" },
  { id: "change", label: "Change" },
];

function statusFor(value: number): HeatCell["status"] {
  if (value >= 75) return "healthy";
  if (value >= 48) return "watch";
  return "risk";
}

function colorFor(cell: HeatCell, metric: HeatmapMetric) {
  if (metric === "latency") {
    const opacity = 0.22 + Math.min(0.68, cell.latency / 1200);
    return `rgba(${cell.latency > 700 ? "244,63,94" : cell.latency > 420 ? "242,184,75" : "74,215,255"}, ${opacity})`;
  }
  if (metric === "change") {
    const opacity = 0.2 + Math.min(0.62, Math.abs(cell.change) / 36);
    return `rgba(${cell.change > 18 ? "242,184,75" : cell.change < -18 ? "244,63,94" : "74,215,255"}, ${opacity})`;
  }
  const opacity = 0.18 + cell.value / 145;
  return `rgba(${cell.value > 74 ? "74,215,255" : cell.value > 47 ? "242,184,75" : "244,63,94"}, ${opacity})`;
}

export function Analytics() {
  const trackers = useAppStore((state) => state.trackers).filter((tracker) => !tracker.archived);
  const refreshTracker = useAppStore((state) => state.refreshTracker);
  const pushToast = useAppStore((state) => state.pushToast);
  const [minimumHealth, setMinimumHealth] = useState(0);
  const [metric, setMetric] = useState<HeatmapMetric>("health");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const visibleTrackers = trackers.filter((tracker) => tracker.health >= minimumHealth);

  const cells = useMemo(() => {
    return visibleTrackers.flatMap((tracker, trackerIndex) =>
      hours.map((hour, hourIndex) => {
        const sparkValue = tracker.sparkline[hourIndex % tracker.sparkline.length] ?? tracker.health;
        const wave = Math.round(Math.sin((hourIndex + trackerIndex) * 0.9) * 10);
        const value = Math.max(4, Math.min(100, Math.round((tracker.health * 0.58 + sparkValue * 0.42 + wave))));
        const latency = Math.max(90, Math.round(900 - value * 6 + trackerIndex * 38 + hourIndex * 14));
        const change = Math.round((sparkValue - tracker.health) + tracker.delta + wave);
        return {
          id: `${tracker.id}-${hour}`,
          tracker,
          hour,
          value,
          latency,
          change,
          status: statusFor(value),
        } satisfies HeatCell;
      }),
    );
  }, [visibleTrackers]);

  const selected = cells.find((cell) => cell.id === selectedId) ?? cells[0];
  const bars = useMemo(() => {
    const scale = d3.scaleLinear().domain([0, 100]).range([0, 100]);
    return visibleTrackers.map((tracker) => ({ ...tracker, width: scale(tracker.health) }));
  }, [visibleTrackers]);
  const summary = useMemo(() => {
    const risky = cells.filter((cell) => cell.status === "risk").length;
    const watch = cells.filter((cell) => cell.status === "watch").length;
    const average = Math.round(cells.reduce((sum, cell) => sum + cell.value, 0) / Math.max(1, cells.length));
    return { risky, watch, average };
  }, [cells]);

  function refreshVisible() {
    visibleTrackers.forEach((tracker) => refreshTracker(tracker.id));
    pushToast({ title: "Analytics refreshed", body: `${visibleTrackers.length} visible monitors recalculated.`, tone: "info" });
  }

  return (
    <div className="grid gap-4">
      <PageIntro
        eyebrow="Analytics"
        title="Inspect monitor health by source and time window."
        body="The heatmap is interactive. Filter weak monitors, switch metrics, select cells for details, and refresh visible monitors from this screen."
        action={<Button variant="primary" icon={<RefreshCw className="h-4 w-4" />} onClick={refreshVisible}>Refresh visible</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <label className="panel rounded-lg p-4">
          <span className="mb-2 block text-sm font-semibold text-white">Minimum health: {minimumHealth}%</span>
          <input type="range" min="0" max="100" value={minimumHealth} onChange={(event) => setMinimumHealth(Number(event.target.value))} className="w-full" />
        </label>
        <div className="panel flex flex-wrap items-center gap-2 rounded-lg p-4">
          {metricOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setMetric(option.id)}
              className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${metric === option.id ? "border-cyan/30 bg-cyan/10 text-cyan" : "border-white/10 text-slate-300 hover:bg-white/[0.06]"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="panel min-w-0 rounded-lg p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-white">Health heatmap</h3>
              <p className="mt-1 text-sm text-slate-400">Rows are monitors. Columns are three-hour buckets across the day.</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded border border-cyan/25 bg-cyan/10 px-2 py-1 text-cyan">healthy</span>
              <span className="rounded border border-amber/25 bg-amber/10 px-2 py-1 text-amber">watch</span>
              <span className="rounded border border-rose-300/25 bg-rose-400/10 px-2 py-1 text-rose-300">risk</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="grid items-center gap-2" style={{ gridTemplateColumns: "190px repeat(8, minmax(56px, 1fr))" }}>
                <div />
                {hours.map((hour) => (
                  <div key={hour} className="text-center text-xs font-semibold text-slate-500">{hour}:00</div>
                ))}
                {visibleTrackers.map((tracker) => (
                  <div key={tracker.id} className="contents">
                    <div className="min-w-0 rounded-md border border-white/10 bg-white/[0.035] px-3 py-2">
                      <div className="truncate text-sm font-semibold text-white">{tracker.title}</div>
                      <div className="truncate text-xs text-slate-500">{tracker.kind} / {tracker.interval}</div>
                    </div>
                    {cells.filter((cell) => cell.tracker.id === tracker.id).map((cell) => (
                      <button
                        key={cell.id}
                        onClick={() => setSelectedId(cell.id)}
                        className={`group relative h-12 rounded-md border transition hover:-translate-y-0.5 hover:border-white/30 ${selected?.id === cell.id ? "border-white/50 ring-2 ring-white/20" : "border-white/10"}`}
                        style={{ background: colorFor(cell, metric) }}
                        title={`${cell.tracker.title} ${cell.hour}:00`}
                        aria-label={`${cell.tracker.title} at ${cell.hour}:00`}
                      >
                        <span className="text-xs font-black text-white drop-shadow">{metric === "latency" ? `${cell.latency}` : metric === "change" ? `${cell.change > 0 ? "+" : ""}${cell.change}` : `${cell.value}`}</span>
                        <span className="absolute inset-x-2 bottom-1 h-0.5 rounded-full bg-white/35 opacity-0 transition group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {visibleTrackers.length === 0 && <div className="mt-4 rounded-md border border-amber/20 bg-amber/10 p-4 text-sm text-amber">No trackers match the current health filter.</div>}
        </section>

        <aside className="grid gap-4">
          <section className="panel rounded-lg p-5">
            <h3 className="mb-4 font-bold text-white">Selected cell</h3>
            {selected ? (
              <div className="grid gap-3">
                <div className="rounded-md border border-white/10 bg-white/[0.035] p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{selected.hour}:00 bucket</div>
                  <div className="mt-2 text-lg font-black text-white">{selected.tracker.title}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded border border-cyan/25 bg-cyan/10 px-2 py-1 text-xs text-cyan">health {selected.value}%</span>
                    <span className="rounded border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-slate-300">{selected.latency}ms</span>
                    <span className="rounded border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-slate-300">{selected.change > 0 ? "+" : ""}{selected.change}% change</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    [Activity, `${summary.average}%`, "avg"],
                    [AlertTriangle, String(summary.risky), "risk"],
                    [Clock3, String(summary.watch), "watch"],
                  ].map(([Icon, value, label]) => (
                    <div key={label as string} className="rounded-md border border-white/10 bg-black/20 p-3">
                      <Icon className="mb-2 h-4 w-4 text-cyan" />
                      <div className="font-black text-white">{value as string}</div>
                      <div className="text-xs text-slate-500">{label as string}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Select a heatmap cell to inspect it.</p>
            )}
          </section>

          <section className="panel rounded-lg p-5">
            <div className="mb-5 flex items-center gap-2 font-bold text-white"><BarChart3 className="h-4 w-4 text-cyan" /> Tracker health</div>
            <div className="grid gap-4">
              {bars.map((bar) => (
                <button key={bar.id} onClick={() => setSelectedId(`${bar.id}-${hours[0]}`)} className="text-left">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-300">{bar.title}</span>
                    <span className="text-slate-500">{bar.health}%</span>
                  </div>
                  <div className="h-2 rounded bg-white/10">
                    <div className="h-full rounded bg-cyan" style={{ width: `${bar.width}%` }} />
                  </div>
                </button>
              ))}
              {bars.length === 0 && <div className="text-sm text-slate-400">No trackers match the current health filter.</div>}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
