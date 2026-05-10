import { BellRing, History, Settings, Volume2, VolumeX } from "lucide-react";
import { FormEvent, useState } from "react";
import { Button } from "../components/Button";
import { PageIntro } from "../components/PageIntro";
import { Link } from "../lib/navigation";
import { severityClass } from "../lib/utils";
import { useAppStore } from "../stores/useAppStore";
import type { AlertRule, SignalEvent } from "../types";

const priorities: SignalEvent["severity"][] = ["low", "medium", "high", "critical"];

export function Alerts() {
  const alerts = useAppStore((state) => state.alerts);
  const alertHistory = useAppStore((state) => state.alertHistory);
  const toggleAlert = useAppStore((state) => state.toggleAlert);
  const triggerAlert = useAppStore((state) => state.triggerAlert);
  const addAlert = useAppStore((state) => state.addAlert);
  const audioEnabled = useAppStore((state) => state.audioEnabled);
  const setAudioEnabled = useAppStore((state) => state.setAudioEnabled);
  const pushToast = useAppStore((state) => state.pushToast);
  const [name, setName] = useState("");
  const [condition, setCondition] = useState("");
  const [priority, setPriority] = useState<SignalEvent["severity"]>("medium");
  const [selectedAlertId, setSelectedAlertId] = useState(alerts[0]?.id ?? "");
  const selectedAlert = alerts.find((alert) => alert.id === selectedAlertId) ?? alerts[0];

  async function requestNotifications() {
    if (!("Notification" in globalThis)) {
      pushToast({ title: "Notifications unavailable", body: "This browser does not expose Notification permissions.", tone: "warning" });
      return;
    }
    const permission = await globalThis.Notification.requestPermission();
    pushToast({ title: "Browser alert permission updated", body: `Permission: ${permission}`, tone: permission === "granted" ? "success" : "warning" });
  }

  function createAlert(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !condition.trim()) return;
    const alert: AlertRule = {
      id: `alert-${Date.now()}`,
      name: name.trim(),
      condition: condition.trim(),
      priority,
      enabled: true,
      muteWindow: "Never",
      lastTriggered: "Not yet",
    };
    addAlert(alert);
    setSelectedAlertId(alert.id);
    setName("");
    setCondition("");
    setPriority("medium");
  }

  return (
    <div className="grid gap-4">
      <PageIntro
        eyebrow="Alerts"
        title="Turn monitor events into notifications you can trust."
        body="Alert rules decide when something matters. Browser permission controls whether SignalNest can notify this device. Sound only changes local UI feedback."
      />
      <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
      <section className="grid gap-3">
        <form onSubmit={createAlert} className="panel grid gap-3 rounded-lg p-4 md:grid-cols-[1fr_1.3fr_150px_auto]">
          <input value={name} onChange={(event) => setName(event.target.value)} className="rounded-md border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-cyan/40" placeholder="Alert name" />
          <input value={condition} onChange={(event) => setCondition(event.target.value)} className="rounded-md border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-cyan/40" placeholder="Condition, e.g. health < 70" />
          <select value={priority} onChange={(event) => setPriority(event.target.value as SignalEvent["severity"])} className="rounded-md border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-cyan/40">
            {priorities.map((item) => <option key={item}>{item}</option>)}
          </select>
          <Button variant="primary" type="submit" disabled={!name.trim() || !condition.trim()}>Create rule</Button>
        </form>
        <div className="panel flex flex-wrap items-center justify-between gap-3 rounded-lg p-4">
          <div>
            <div className="text-sm font-semibold text-cyan">Alert rules</div>
            <h2 className="text-2xl font-black text-white">Thresholds, priorities, mute windows</h2>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" icon={audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />} onClick={() => setAudioEnabled(!audioEnabled)}>
              Sound {audioEnabled ? "on" : "off"}
            </Button>
            <Button variant="primary" icon={<BellRing className="h-4 w-4" />} onClick={requestNotifications}>Enable browser alerts</Button>
          </div>
        </div>
        {alerts.map((alert) => (
          <article key={alert.id} className={`panel rounded-lg p-4 transition ${selectedAlert?.id === alert.id ? "border-cyan/35 bg-cyan/[0.04]" : ""}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="font-bold text-white">{alert.name}</h3>
                  <span className={`rounded border px-2 py-0.5 text-[11px] ${severityClass(alert.priority)}`}>{alert.priority}</span>
                </div>
                <code className="rounded border border-white/10 bg-black/25 px-2 py-1 text-xs text-slate-300">{alert.condition}</code>
                <div className="mt-3 text-sm text-slate-400">Mute: {alert.muteWindow} · last triggered {alert.lastTriggered}</div>
              </div>
              <button
                onClick={() => toggleAlert(alert.id)}
                className={`h-7 w-12 rounded-full border p-1 transition ${alert.enabled ? "border-cyan/30 bg-cyan/20" : "border-white/10 bg-white/[0.05]"}`}
                aria-label={`Toggle ${alert.name}`}
              >
                <span className={`block h-5 w-5 rounded-full bg-white transition ${alert.enabled ? "translate-x-5" : ""}`} />
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => triggerAlert(alert.id)}>Test trigger</Button>
              <Button variant="ghost" onClick={() => setSelectedAlertId(alert.id)}>Inspect rule</Button>
            </div>
          </article>
        ))}
      </section>
      <aside className="grid content-start gap-4">
        {selectedAlert && (
          <section className="panel rounded-lg p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-cyan">Selected rule</div>
                <h2 className="mt-1 text-2xl font-black text-white">{selectedAlert.name}</h2>
              </div>
              <span className={`rounded border px-2 py-1 text-xs font-bold ${severityClass(selectedAlert.priority)}`}>{selectedAlert.priority}</span>
            </div>
            <div className="grid gap-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Condition</div>
                <code className="mt-2 block rounded border border-white/10 bg-black/25 px-2 py-1 text-xs text-slate-200">{selectedAlert.condition}</code>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-400">
                <div>
                  <div className="text-xs text-slate-500">Status</div>
                  <div className="font-semibold text-white">{selectedAlert.enabled ? "Enabled" : "Paused"}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Mute window</div>
                  <div className="font-semibold text-white">{selectedAlert.muteWindow}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-slate-500">Last triggered</div>
                  <div className="font-semibold text-white">{selectedAlert.lastTriggered}</div>
                </div>
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Button variant="primary" onClick={() => triggerAlert(selectedAlert.id)}>Run test</Button>
              <Link to="/app/settings" className="ui-tooltip inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.045] px-3 text-sm font-semibold text-slate-100 transition hover:border-cyan/30 hover:bg-white/[0.08]" data-tooltip="Open notification settings">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </div>
          </section>
        )}
        <section className="panel rounded-lg p-4">
          <div className="mb-4 flex items-center gap-2 font-bold text-white"><History className="h-4 w-4 text-amber" /> Alert history</div>
          <div className="grid gap-3">
            {alertHistory.map((event) => (
              <div key={event.id} className="rounded-md border border-white/10 bg-white/[0.035] p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="font-semibold text-white">{event.title}</span>
                  <span className={`rounded border px-2 py-0.5 text-[11px] ${severityClass(event.severity)}`}>{event.severity}</span>
                </div>
                <p className="text-sm leading-6 text-slate-400">{event.summary}</p>
              </div>
            ))}
          </div>
        </section>
      </aside>
      </div>
    </div>
  );
}
