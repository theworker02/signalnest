import { motion } from "framer-motion";
import { Diff, Eye, FileText, Gauge, History, Play } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../components/Button";
import { PageIntro } from "../components/PageIntro";
import { signalEvents } from "../data/mockData";
import { severityClass } from "../lib/utils";
import { useAppStore } from "../stores/useAppStore";

const scenarios = [
  {
    id: "pricing",
    title: "Pricing page",
    before: ["Free plan includes 3 boards", "Team plan starts at $18", "Audit logs on enterprise", "Status badge below fold"],
    after: ["Free plan includes 2 boards", "Team plan starts at $24", "Audit logs on business and enterprise", "Status badge beside CTA"],
  },
  {
    id: "status",
    title: "Status page",
    before: ["All regions operational", "API latency p95 142ms", "No active incidents", "Last update 9:12 PM"],
    after: ["US-East degraded", "API latency p95 831ms", "Incident opened for edge routing", "Last update just now"],
  },
  {
    id: "release",
    title: "Release notes",
    before: ["Version 4.1.0 stable", "No breaking changes", "Graph rendering unchanged", "Plugin API private beta"],
    after: ["Version 4.2.0 stable", "Workspace schema migrated", "Graph rendering moved to worker", "Plugin API public preview"],
  },
];

export function ChangeEngine() {
  const captureSnapshot = useAppStore((state) => state.captureSnapshot);
  const pushToast = useAppStore((state) => state.pushToast);
  const addActivity = useAppStore((state) => state.addActivity);
  const [scenarioId, setScenarioId] = useState(scenarios[0].id);
  const [threshold, setThreshold] = useState(12);
  const [mode, setMode] = useState<"text" | "visual">("text");
  const [lastRun, setLastRun] = useState("Not run yet");
  const scenario = scenarios.find((item) => item.id === scenarioId) ?? scenarios[0];
  const changedLines = useMemo(() => scenario.after.filter((line, index) => line !== scenario.before[index]), [scenario]);
  const visualShift = Math.min(42, threshold + changedLines.length * 4);

  function runComparison() {
    const timestamp = new Date().toLocaleTimeString();
    setLastRun(timestamp);
    addActivity(`Ran ${mode} comparison for ${scenario.title}`);
    pushToast({ title: "Comparison complete", body: `${changedLines.length} changes detected at ${timestamp}.`, tone: changedLines.length ? "warning" : "success" });
  }

  return (
    <div className="grid gap-4">
      <PageIntro
        eyebrow="Change Engine"
        title="See exactly what changed between two snapshots."
        body="The left column is the older capture. The right column is the newer capture. Archive this diff to save it into the Research Vault as evidence."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" icon={<Play className="h-4 w-4" />} onClick={runComparison}>Run comparison</Button>
            <Button variant="primary" icon={<Eye className="h-4 w-4" />} onClick={captureSnapshot}>Archive this diff</Button>
          </div>
        }
      />
      <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
      <section className="panel rounded-lg p-4">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-amber">Change detection</div>
            <h2 className="text-2xl font-black text-white">{scenario.title} {mode} delta</h2>
          </div>
        </div>
        <div className="mb-5 grid gap-3 md:grid-cols-3">
          <label className="rounded-md border border-white/10 bg-white/[0.035] p-3">
            <span className="mb-2 block text-xs font-semibold text-slate-400">Scenario</span>
            <select value={scenarioId} onChange={(event) => setScenarioId(event.target.value)} className="w-full rounded-md border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-cyan/40">
              {scenarios.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
            </select>
          </label>
          <label className="rounded-md border border-white/10 bg-white/[0.035] p-3">
            <span className="mb-2 block text-xs font-semibold text-slate-400">Threshold: {threshold}%</span>
            <input type="range" min="4" max="32" value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} className="w-full" />
          </label>
          <div className="rounded-md border border-white/10 bg-white/[0.035] p-3">
            <span className="mb-2 block text-xs font-semibold text-slate-400">Mode</span>
            <div className="grid grid-cols-2 gap-2">
              {(["text", "visual"] as const).map((item) => (
                <button key={item} onClick={() => setMode(item)} className={`rounded-md border px-3 py-2 text-sm font-semibold ${mode === item ? "border-cyan/30 bg-cyan/10 text-cyan" : "border-white/10 text-slate-300"}`}>{item}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-black/20 p-4">
            <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-300"><FileText className="h-4 w-4" /> Before</div>
            <div className="grid gap-2">
              {scenario.before.map((line) => <div key={line} className="rounded border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-slate-300">{line}</div>)}
            </div>
          </div>
          <div className="rounded-lg border border-cyan/20 bg-cyan/5 p-4">
            <div className="mb-4 flex items-center gap-2 text-sm font-bold text-cyan"><Diff className="h-4 w-4" /> After</div>
            <div className="grid gap-2">
              {scenario.after.map((line, index) => (
                <motion.div key={line} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.08 }} className="rounded border border-cyan/20 bg-cyan/10 px-3 py-2 text-sm text-cyan">
                  {line}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {[
            ["Text edits", String(changedLines.length)],
            ["Visual shift", `${visualShift}%`],
            ["Severity", visualShift >= threshold ? "High" : "Low"],
            ["Last run", lastRun],
          ].map(([label, value]) => (
            <div key={label} className="rounded-md border border-white/10 bg-white/[0.04] p-4">
              <div className="text-xs text-slate-500">{label}</div>
              <div className="mt-1 text-2xl font-black text-white">{value}</div>
            </div>
          ))}
        </div>
      </section>
      <aside className="grid gap-4">
        <div className="panel rounded-lg p-4">
          <div className="mb-4 flex items-center gap-2 font-bold"><History className="h-4 w-4 text-cyan" /> Change timeline</div>
          <div className="grid gap-3">
            {signalEvents.map((event) => (
              <div key={event.id} className="border-l border-white/10 pl-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-white">{event.title}</span>
                  <span className={`rounded border px-2 py-0.5 text-[11px] ${severityClass(event.severity)}`}>{event.severity}</span>
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-400">{event.summary}</p>
                <div className="mt-1 text-xs text-slate-500">{event.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel rounded-lg p-4">
          <Gauge className="mb-4 h-5 w-5 text-amber" />
          <h3 className="font-bold text-white">Trigger policy</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">Notify when currency strings, CTA labels, HTTP health, or visual layout deltas cross configured thresholds.</p>
        </div>
      </aside>
      </div>
    </div>
  );
}
