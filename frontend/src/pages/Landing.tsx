import { AnimatePresence, motion } from "framer-motion";
import { Activity, ArrowRight, BellRing, Command, DatabaseZap, GitBranch, Layers3, LockKeyhole, Play, RadioTower, ScanSearch, ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "../lib/navigation";
import { NetworkCanvas } from "../components/NetworkCanvas";
import { capabilityGrid, metricCards, trackers } from "../data/mockData";
import { Sparkline } from "../components/Sparkline";

const intelligenceLayers = [
  {
    icon: ScanSearch,
    title: "Capture",
    detail: "Track websites, RSS feeds, APIs, repos, weather events, outages, prices, release notes, and high-priority keywords from one workspace.",
    meta: "34 source types",
  },
  {
    icon: Activity,
    title: "Detect",
    detail: "Compare current state against snapshots with text deltas, status checks, threshold rules, visual drift markers, and confidence scoring.",
    meta: "Sub-minute checks",
  },
  {
    icon: BellRing,
    title: "Escalate",
    detail: "Route important events into browser notifications, webhook deliveries, workspace timelines, sound cues, and priority-specific alert queues.",
    meta: "Mute schedules",
  },
  {
    icon: DatabaseZap,
    title: "Remember",
    detail: "Archive the sources, diffs, notes, and screenshots that explain why a signal mattered so research stays usable weeks later.",
    meta: "Vault linked",
  },
];

const workspaceDetails = [
  ["Signal boards", "Group live trackers, notes, alerts, map nodes, and timelines into topic-specific operations rooms."],
  ["Change intelligence", "Inspect before and after states, severity, frequency, and snapshot history without leaving the dashboard."],
  ["Skill marketplace", "Install monitoring packs that immediately create trackers, alert rules, vault notes, and workflow activity."],
  ["Developer surface", "Generate API keys, webhooks, CLI commands, and docs for scripted ingestion or custom internal tools."],
];

export function Landing() {
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (!previewOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreviewOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewOpen]);

  return (
    <div className="grain min-h-screen overflow-hidden bg-ink text-white">
      <section className="relative min-h-[92vh] px-5 py-6 md:px-10">
        <NetworkCanvas className="absolute inset-0 h-full w-full opacity-80" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col">
          <nav className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-md border border-cyan/30 bg-cyan/10 p-1.5">
                <img src="/signalnest-icon.svg" alt="SignalNest" className="h-full w-full" />
              </span>
              <span className="font-bold">SignalNest</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link to="/login" className="rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white">Sign in</Link>
              <Link to="/signup" className="rounded-md border border-white/10 bg-white/[0.055] px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.08]">Sign up</Link>
              <Link to="/app" className="inline-flex items-center gap-2 rounded-md border border-cyan/30 bg-cyan/15 px-3 py-2 text-sm font-semibold text-cyan transition hover:bg-cyan/20">
                Open workspace <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </nav>
          <div className="grid min-h-[78vh] items-center gap-10 py-14 lg:grid-cols-[0.95fr_1.05fr]">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
              <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.055] px-3 py-2 text-sm text-slate-300">
                <RadioTower className="h-4 w-4 text-cyan" /> Internet intelligence without a chatbot
              </div>
              <h1 className="max-w-4xl text-5xl font-black leading-[0.96] tracking-tight md:text-7xl xl:text-8xl">SignalNest</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
                A premium command center for monitoring websites, feeds, repos, outages, prices, alerts, research, and the relationships between signals that matter.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/app" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-cyan/30 bg-cyan/15 px-4 font-bold text-cyan shadow-glow transition hover:bg-cyan/20">
                  Launch dashboard <ArrowRight className="h-4 w-4" />
                </Link>
                <button onClick={() => setPreviewOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/10 bg-white/[0.055] px-4 font-semibold text-slate-100 transition hover:bg-white/[0.08]">
                  Watch live service <Play className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
            <motion.div
              id="demo"
              className="panel relative overflow-hidden rounded-lg p-3"
              initial={{ opacity: 0, y: 32, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.75, delay: 0.1 }}
            >
              <div className="grid gap-3 md:grid-cols-2">
                {metricCards.map((metric) => (
                  <div key={metric.label} className="rounded-md border border-white/10 bg-white/[0.04] p-4">
                    <div className="mb-4 flex items-center justify-between text-slate-400">
                      <metric.icon className="h-4 w-4" />
                      <span className="text-xs">{metric.delta}</span>
                    </div>
                    <div className="text-2xl font-black">{metric.value}</div>
                    <div className="text-sm text-slate-400">{metric.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-3">
                {trackers.slice(0, 3).map((tracker) => (
                  <div key={tracker.id} className="rounded-md border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-bold">{tracker.title}</div>
                        <div className="text-xs text-slate-500">{tracker.source} · refresh {tracker.interval}</div>
                      </div>
                      <span className="rounded border border-cyan/25 bg-cyan/10 px-2 py-1 text-xs text-cyan">{tracker.health}%</span>
                    </div>
                    <Sparkline values={tracker.sparkline} />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <AnimatePresence>
        {previewOpen && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={() => setPreviewOpen(false)}
          >
            <motion.div
              className="modal-sheen w-full max-w-5xl overflow-hidden rounded-xl border border-white/10 bg-[#080b11] shadow-2xl"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.97 }}
              transition={{ duration: 0.22 }}
              onMouseDown={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="preview-title"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 md:px-5">
                <div>
                  <div id="preview-title" className="font-bold text-white">SignalNest live service preview</div>
                  <div className="text-xs text-slate-500">Monitoring, signal map, event stream, and dashboard telemetry</div>
                </div>
                <button onClick={() => setPreviewOpen(false)} className="rounded-md border border-white/10 bg-white/[0.04] p-2 text-slate-300 transition hover:bg-white/[0.08] hover:text-white" aria-label="Close preview">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="bg-black">
                <video
                  className="aspect-video w-full bg-black"
                  src="/signalnest-ui-preview.webm"
                  autoPlay
                  controls
                  loop
                  muted
                  playsInline
                  poster="/signalnest-icon.svg"
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-4 md:px-5">
                <p className="text-sm text-slate-400">A generated product preview using SignalNest’s real dashboard surfaces and visual language.</p>
                <div className="flex flex-wrap gap-2">
                  <Link to="/signup" className="inline-flex min-h-10 items-center gap-2 rounded-md border border-white/10 bg-white/[0.055] px-4 text-sm font-bold text-slate-100 transition hover:bg-white/[0.08]">
                    Sign up
                  </Link>
                  <Link to="/app" className="inline-flex min-h-10 items-center gap-2 rounded-md border border-cyan/30 bg-cyan/15 px-4 text-sm font-bold text-cyan transition hover:bg-cyan/20">
                    Open workspace <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <section className="relative border-t border-white/10 px-5 py-16 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="lg:sticky lg:top-8"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-cyan/25 bg-cyan/10 px-3 py-2 text-sm font-semibold text-cyan">
              <Layers3 className="h-4 w-4" /> Operational detail
            </div>
            <h2 className="max-w-xl text-3xl font-black leading-tight tracking-tight md:text-5xl">Built for people who need to know what changed before everyone else does.</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-400">
              SignalNest turns noisy public information into structured boards, durable records, and actionable alerts. Every module is designed to answer the same question: what changed, why does it matter, and what should happen next?
            </p>
            <div className="mt-6 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="mb-3 flex items-center gap-2 font-bold text-white"><GitBranch className="h-4 w-4 text-cyan" /> Relationship aware</div>
                <p className="leading-6 text-slate-400">Connect companies, services, communities, feeds, and incidents into a navigable signal graph.</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="mb-3 flex items-center gap-2 font-bold text-white"><ShieldCheck className="h-4 w-4 text-cyan" /> Accountable history</div>
                <p className="leading-6 text-slate-400">Keep audit trails, snapshots, request logs, and alert history tied to each workspace.</p>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-4">
            {intelligenceLayers.map((layer, index) => (
              <motion.article
                key={layer.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-70px" }}
                transition={{ duration: 0.45, delay: index * 0.04 }}
                className="group rounded-lg border border-white/10 bg-white/[0.035] p-5 transition hover:-translate-y-1 hover:border-cyan/30 hover:bg-white/[0.055]"
              >
                <div className="grid gap-4 sm:grid-cols-[44px_minmax(0,1fr)_auto] sm:items-start">
                  <div className="grid h-11 w-11 place-items-center rounded-md border border-cyan/25 bg-cyan/10 text-cyan shadow-glow">
                    <layer.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-black text-white">{layer.title}</h3>
                      <span className="rounded border border-white/10 bg-black/20 px-2 py-1 text-xs font-semibold text-slate-400">0{index + 1}</span>
                    </div>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{layer.detail}</p>
                  </div>
                  <div className="rounded-md border border-cyan/20 bg-cyan/10 px-3 py-2 text-xs font-bold text-cyan">{layer.meta}</div>
                </div>
              </motion.article>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-70px" }}
              transition={{ duration: 0.5 }}
              className="rounded-lg border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] p-5"
            >
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-cyan">Workspace anatomy</div>
                  <h3 className="mt-1 text-2xl font-black text-white">The same signal can become a tracker, alert, note, node, or API event.</h3>
                </div>
                <Link to="/app/workspace" className="inline-flex min-h-10 items-center gap-2 rounded-md border border-white/10 bg-white/[0.045] px-3 text-sm font-bold text-slate-100 transition hover:border-cyan/30 hover:bg-white/[0.08]">
                  Explore workspace <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {workspaceDetails.map(([title, detail]) => (
                  <div key={title} className="rounded-md border border-white/10 bg-black/20 p-4">
                    <div className="font-bold text-white">{title}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{detail}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <section className="relative border-t border-white/10 px-5 py-16 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="text-sm font-semibold text-cyan">Engineered systems</div>
              <h2 className="mt-2 max-w-3xl text-3xl font-black md:text-5xl">Everything is an inspectable signal, not a feed lost to time.</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-300">
              <Command className="h-4 w-4" /> Keyboard first
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {capabilityGrid.map((item) => (
              <div key={item.title} className="rounded-lg border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-1 hover:border-cyan/25 hover:bg-white/[0.065]">
                <item.icon className="mb-5 h-5 w-5 text-cyan" />
                <h3 className="font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{item.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex items-center justify-between rounded-lg border border-amber/20 bg-amber/10 p-5 text-amber">
            <span className="inline-flex items-center gap-2 font-semibold"><LockKeyhole className="h-5 w-5" /> Hardened by design: MFA, session logs, CSRF, validation, throttling, and audit trails.</span>
            <Link to="/app/security" className="rounded-md border border-amber/30 px-3 py-2 text-sm font-bold hover:bg-amber/10">Review security</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
