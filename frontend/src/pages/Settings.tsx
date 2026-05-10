import {
  Bell,
  CheckCircle2,
  Code2,
  Database,
  EyeOff,
  Globe2,
  KeyRound,
  LockKeyhole,
  MapPin,
  Monitor,
  Moon,
  Palette,
  RefreshCw,
  RotateCcw,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Volume2,
  VolumeX,
  Webhook,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "../components/Button";
import { PageIntro } from "../components/PageIntro";
import { Link } from "../lib/navigation";
import { useAppStore } from "../stores/useAppStore";
import type { Density, Theme } from "../types";

const densities: Density[] = ["comfortable", "compact", "terminal"];
const themes: Array<{ value: Theme; label: string; icon: LucideIcon; body: string }> = [
  { value: "dark", label: "Dark", icon: Moon, body: "Low-glare command surfaces." },
  { value: "light", label: "Light", icon: Sun, body: "Bright workspace mode." },
  { value: "system", label: "System", icon: Monitor, body: "Match this device." },
];
const accents = ["#4ad7ff", "#5f8cff", "#a58bff", "#f2b84b"];
const refreshCadences = ["manual", "30s", "1m", "5m"] as const;
const landingModes = ["dashboard", "monitoring", "workspace", "analytics"] as const;
const digestModes = ["realtime", "hourly", "daily"] as const;
const workspaceModes = ["overview", "investigation", "presentation"] as const;
const notificationDurations = [3000, 4000, 5000, 8000, 12000] as const;

function titleCase(value: string) {
  return value.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function SettingsSection({ icon: Icon, title, body, children }: { icon: LucideIcon; title: string; body: string; children: React.ReactNode }) {
  return (
    <section className="panel overflow-hidden rounded-lg">
      <div className="border-b border-white/10 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyan/20 bg-cyan/10 text-cyan">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-xl font-black text-white">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">{body}</p>
          </div>
        </div>
      </div>
      <div className="divide-y divide-white/10">{children}</div>
    </section>
  );
}

function SettingRow({ title, body, control }: { title: string; body: string; control: React.ReactNode }) {
  return (
    <div className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(220px,auto)] sm:items-center sm:p-5">
      <div className="min-w-0">
        <div className="font-bold text-white">{title}</div>
        <div className="mt-1 text-sm leading-5 text-slate-400">{body}</div>
      </div>
      <div className="min-w-0 sm:justify-self-end">{control}</div>
    </div>
  );
}

function ToggleControl({ enabled, onToggle, label }: { enabled: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="ui-tooltip inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.035] px-2 py-1 text-sm font-semibold text-slate-300 transition hover:border-cyan/35"
      data-tooltip={label}
      aria-pressed={enabled}
    >
      <span className={`h-6 w-11 rounded-full p-1 transition ${enabled ? "bg-cyan/25" : "bg-white/[0.07]"}`}>
        <span className={`block h-4 w-4 rounded-full bg-white transition ${enabled ? "translate-x-5" : ""}`} />
      </span>
      <span className={enabled ? "text-cyan" : "text-slate-400"}>{enabled ? "On" : "Off"}</span>
    </button>
  );
}

function SegmentedControl<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`ui-tooltip rounded-md border px-3 py-2 text-sm font-semibold transition ${
            value === option ? "border-cyan/35 bg-cyan/10 text-cyan" : "border-white/10 bg-white/[0.025] text-slate-300 hover:bg-white/[0.06]"
          }`}
          data-tooltip={`Set to ${titleCase(String(option))}`}
        >
          {typeof option === "number" ? `${option / 1000}s` : titleCase(option)}
        </button>
      ))}
    </div>
  );
}

function SelectControl<T extends string>({ value, options, onChange }: { value: T; options: readonly T[]; onChange: (value: T) => void }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as T)}
      className="w-full min-w-[220px] rounded-md border border-white/10 bg-black/25 px-3 py-2 text-sm font-semibold text-white outline-none transition focus:border-cyan/40 sm:w-auto"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {titleCase(option)}
        </option>
      ))}
    </select>
  );
}

function StatusPill({ tone = "neutral", children }: { tone?: "neutral" | "good" | "warning"; children: React.ReactNode }) {
  const styles = {
    neutral: "border-white/10 bg-white/[0.035] text-slate-300",
    good: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
    warning: "border-amber/25 bg-amber/10 text-amber",
  };
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${styles[tone]}`}>{children}</span>;
}

function MetricRow({ icon: Icon, label, value, note }: { icon: LucideIcon; label: string; value: string; note: string }) {
  return (
    <div className="flex items-start gap-3 border-b border-white/10 px-4 py-3 last:border-b-0">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-semibold text-white">{label}</span>
          <span className="text-sm font-bold text-slate-200">{value}</span>
        </div>
        <div className="mt-1 text-sm leading-5 text-slate-400">{note}</div>
      </div>
    </div>
  );
}

export function Settings() {
  const theme = useAppStore((state) => state.theme);
  const density = useAppStore((state) => state.density);
  const audioEnabled = useAppStore((state) => state.audioEnabled);
  const animationsEnabled = useAppStore((state) => state.animationsEnabled);
  const privacyMode = useAppStore((state) => state.privacyMode);
  const locationServicesEnabled = useAppStore((state) => state.locationServicesEnabled);
  const autoSaveEnabled = useAppStore((state) => state.autoSaveEnabled);
  const refreshCadence = useAppStore((state) => state.refreshCadence);
  const defaultLanding = useAppStore((state) => state.defaultLanding);
  const digestMode = useAppStore((state) => state.digestMode);
  const workspaceMode = useAppStore((state) => state.workspaceMode);
  const notificationDurationMs = useAppStore((state) => state.notificationDurationMs ?? 4000);
  const accent = useAppStore((state) => state.accent);
  const activeWorkspaceId = useAppStore((state) => state.activeWorkspaceId);
  const workspaceViews = useAppStore((state) => state.workspaceViews);
  const currentUserEmail = useAppStore((state) => state.currentUserEmail);
  const mfaEnabled = useAppStore((state) => state.mfaEnabled);
  const securitySessions = useAppStore((state) => state.securitySessions);
  const apiCredentials = useAppStore((state) => state.apiCredentials);
  const webhooks = useAppStore((state) => state.webhooks);
  const developerSubscriptionStatus = useAppStore((state) => state.developerSubscriptionStatus);
  const workspaceSnapshotSavedAt = useAppStore((state) => state.workspaceSnapshotSavedAt);
  const installedSkills = useAppStore((state) => state.installedSkills);
  const customSkills = useAppStore((state) => state.customSkills);
  const setTheme = useAppStore((state) => state.setTheme);
  const setDensity = useAppStore((state) => state.setDensity);
  const setAudioEnabled = useAppStore((state) => state.setAudioEnabled);
  const setAnimationsEnabled = useAppStore((state) => state.setAnimationsEnabled);
  const setPrivacyMode = useAppStore((state) => state.setPrivacyMode);
  const setLocationServicesEnabled = useAppStore((state) => state.setLocationServicesEnabled);
  const setAutoSaveEnabled = useAppStore((state) => state.setAutoSaveEnabled);
  const setRefreshCadence = useAppStore((state) => state.setRefreshCadence);
  const setDefaultLanding = useAppStore((state) => state.setDefaultLanding);
  const setDigestMode = useAppStore((state) => state.setDigestMode);
  const setWorkspaceMode = useAppStore((state) => state.setWorkspaceMode);
  const setNotificationDuration = useAppStore((state) => state.setNotificationDuration);
  const setAccent = useAppStore((state) => state.setAccent);
  const resetPreferences = useAppStore((state) => state.resetPreferences);
  const toggleMfa = useAppStore((state) => state.toggleMfa);

  function playPreview() {
    if (!audioEnabled) return;
    const AudioContext = globalThis.AudioContext || (globalThis as typeof globalThis & { webkitAudioContext?: typeof globalThis.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 720;
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.04, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.16);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.18);
  }

  return (
    <div className="grid gap-4">
      <PageIntro
        eyebrow="Settings"
        title="Production controls for the SignalNest workspace."
        body="Tune interface behavior, account security, monitoring defaults, notification policy, and developer platform settings from one operational surface."
        action={
          <Button variant="secondary" icon={<RotateCcw className="h-4 w-4" />} onClick={resetPreferences}>
            Reset preferences
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-4">
          <SettingsSection icon={SlidersHorizontal} title="Appearance and Interface" body="Make the workspace feel right without changing the data model underneath it.">
            <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
              {themes.map(({ value, label, icon: Icon, body }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  className={`rounded-lg border p-4 text-left transition ${
                    theme === value ? "border-cyan/35 bg-cyan/10 text-cyan" : "border-white/10 bg-white/[0.025] text-slate-300 hover:bg-white/[0.06]"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <div className="mt-3 font-black text-white">{label}</div>
                  <div className="mt-1 text-sm leading-5 text-slate-400">{body}</div>
                </button>
              ))}
            </div>
            <SettingRow
              title="Interface density"
              body="Choose how tightly tables, cards, and monitor rows are packed across the app."
              control={<SegmentedControl value={density} options={densities} onChange={setDensity} />}
            />
            <SettingRow
              title="Accent color"
              body="Applies to active states, charts, pricing calls to action, and command surfaces."
              control={
                <div className="flex items-center gap-2">
                  {accents.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setAccent(option)}
                      className={`ui-tooltip h-9 w-9 rounded-md border transition ${option === accent ? "border-white ring-2 ring-white/40" : "border-white/15"}`}
                      style={{ background: option }}
                      aria-label={`Set accent ${option}`}
                      data-tooltip={`Set accent ${option}`}
                    />
                  ))}
                </div>
              }
            />
            <SettingRow
              title="Fluid motion"
              body="Enable hover movement, modal transitions, and status pulses for a more responsive workspace."
              control={<ToggleControl enabled={animationsEnabled} onToggle={() => setAnimationsEnabled(!animationsEnabled)} label="Toggle fluid motion" />}
            />
          </SettingsSection>

          <SettingsSection icon={Zap} title="Workspace Defaults" body="Control the first screen, saved workspace behavior, and daily operating mode.">
            <SettingRow
              title="Default landing"
              body="Where SignalNest should open after a fresh page load or new session."
              control={<SelectControl value={defaultLanding} options={landingModes} onChange={setDefaultLanding} />}
            />
            <SettingRow
              title="Workspace mode"
              body="Adjust the tone of the command center for triage, deeper investigation, or presentation reviews."
              control={<SegmentedControl value={workspaceMode} options={workspaceModes} onChange={setWorkspaceMode} />}
            />
            <SettingRow
              title="Autosave layouts"
              body="Remember panel sizing, workspace arrangement, density, and sidebar posture in this browser."
              control={<ToggleControl enabled={autoSaveEnabled} onToggle={() => setAutoSaveEnabled(!autoSaveEnabled)} label="Toggle autosave layouts" />}
            />
            <SettingRow
              title="Saved workspace views"
              body={workspaceViews.length ? workspaceViews.join(", ") : "No saved views yet."}
              control={<StatusPill>{workspaceViews.length} views</StatusPill>}
            />
          </SettingsSection>

          <SettingsSection icon={RefreshCw} title="Monitoring Defaults" body="Set how often monitored sources should refresh and how SignalNest handles evidence capture.">
            <SettingRow
              title="Refresh cadence"
              body="Default update interval for monitor cards, health scores, and event stream checks."
              control={<SegmentedControl value={refreshCadence} options={refreshCadences} onChange={setRefreshCadence} />}
            />
            <SettingRow title="Signal evaluation" body="DOM checks, keyword scoring, health deltas, and event severity mapping." control={<StatusPill tone="good">Enabled</StatusPill>} />
            <SettingRow title="Evidence capture" body="Store event summaries, source URLs, timestamps, and alert context with each signal." control={<StatusPill tone="good">Local-first</StatusPill>} />
            <SettingRow title="Retention policy" body="Workspace snapshots and event history are retained in browser storage until manually cleared." control={<StatusPill>Persistent</StatusPill>} />
          </SettingsSection>

          <SettingsSection icon={Bell} title="Notifications" body="Tune how visible, audible, and frequent alert feedback should be while you work.">
            <SettingRow title="Digest mode" body="Choose whether alerts arrive immediately or roll up into scheduled summaries." control={<SegmentedControl value={digestMode} options={digestModes} onChange={setDigestMode} />} />
            <SettingRow
              title="Toast duration"
              body={`Notifications currently remain visible for ${Math.round(notificationDurationMs / 1000)} seconds.`}
              control={<SegmentedControl value={notificationDurationMs} options={notificationDurations} onChange={setNotificationDuration} />}
            />
            <SettingRow
              title="Interface sound"
              body="Play a quiet confirmation tone for important local actions."
              control={
                <div className="flex flex-wrap justify-end gap-2">
                  <Button variant={audioEnabled ? "primary" : "secondary"} icon={audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />} onClick={() => setAudioEnabled(!audioEnabled)}>
                    {audioEnabled ? "Sound on" : "Sound off"}
                  </Button>
                  <Button variant="secondary" onClick={playPreview} disabled={!audioEnabled}>
                    Preview
                  </Button>
                </div>
              }
            />
          </SettingsSection>

          <SettingsSection icon={ShieldCheck} title="Security and Privacy" body="Account posture, session visibility, and local redaction controls.">
            <SettingRow title="Account identity" body={currentUserEmail ?? "No authenticated session is connected in this local workspace."} control={<StatusPill>{currentUserEmail ? "Signed in" : "Local"}</StatusPill>} />
            <SettingRow title="Multi-factor authentication" body="Require a second verification step for account access when auth is connected." control={<ToggleControl enabled={mfaEnabled} onToggle={toggleMfa} label="Toggle MFA" />} />
            <SettingRow
              title="Privacy mode"
              body="Mask sensitive account and source labels in shared spaces without changing saved monitor records."
              control={<ToggleControl enabled={privacyMode} onToggle={() => setPrivacyMode(!privacyMode)} label="Toggle privacy mode" />}
            />
            <SettingRow
              title="Location services"
              body="Allow Weather Changes to ask this browser for your current location before loading local pressure and weather readings."
              control={<ToggleControl enabled={locationServicesEnabled} onToggle={() => setLocationServicesEnabled(!locationServicesEnabled)} label="Toggle location services" />}
            />
            <SettingRow title="Active sessions" body={securitySessions.slice(0, 3).join(", ")} control={<StatusPill tone={securitySessions.length > 3 ? "warning" : "good"}>{securitySessions.length} sessions</StatusPill>} />
          </SettingsSection>
        </div>

        <aside className="grid content-start gap-4">
          <section className="panel overflow-hidden rounded-lg">
            <div className="border-b border-white/10 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-cyan">
                <Sparkles className="h-4 w-4" />
                Operating Profile
              </div>
              <h2 className="mt-2 text-xl font-black text-white">Current state</h2>
            </div>
            <MetricRow icon={Globe2} label="Workspace" value={activeWorkspaceId} note={`Landing on ${titleCase(defaultLanding)} in ${titleCase(workspaceMode)} mode.`} />
            <MetricRow icon={Palette} label="Interface" value={titleCase(theme)} note={`${titleCase(density)} density with ${accent} accent.`} />
            <MetricRow icon={RefreshCw} label="Cadence" value={refreshCadence} note={`${titleCase(digestMode)} alerts and ${notificationDurationMs / 1000}s notification windows.`} />
            <MetricRow icon={Save} label="Last snapshot" value={workspaceSnapshotSavedAt ?? "Not saved"} note={autoSaveEnabled ? "Autosave is enabled for layout preferences." : "Autosave is currently disabled."} />
          </section>

          <section className="panel overflow-hidden rounded-lg">
            <div className="border-b border-white/10 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-cyan">
                <Code2 className="h-4 w-4" />
                Developer Platform
              </div>
              <h2 className="mt-2 text-xl font-black text-white">API surface</h2>
            </div>
            <MetricRow icon={KeyRound} label="API keys" value={`${apiCredentials.length}`} note="Live credentials generated from the developer console." />
            <MetricRow icon={Webhook} label="Webhooks" value={`${webhooks.length}`} note="Event delivery endpoints attached to this workspace." />
            <MetricRow icon={Database} label="Subscription" value={titleCase(developerSubscriptionStatus)} note="Controls limits for API pricing and developer access." />
            <div className="grid gap-2 p-4">
              <Link to="/app/developers/docs/quickstart" className="rounded-md border border-white/10 bg-white/[0.035] px-3 py-2 text-sm font-bold text-white transition hover:border-cyan/30">
                Open developer docs
              </Link>
              <Link to="/app/pricing-api" className="rounded-md border border-white/10 bg-white/[0.035] px-3 py-2 text-sm font-bold text-white transition hover:border-cyan/30">
                Review API pricing
              </Link>
            </div>
          </section>

          <section className="panel overflow-hidden rounded-lg">
            <div className="border-b border-white/10 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-cyan">
                <LockKeyhole className="h-4 w-4" />
                Storage and Access
              </div>
              <h2 className="mt-2 text-xl font-black text-white">Local controls</h2>
            </div>
            <MetricRow icon={CheckCircle2} label="Persistence" value="Browser" note="Preferences are stored through the local Zustand persistence layer." />
            <MetricRow icon={EyeOff} label="Redaction" value={privacyMode ? "On" : "Off"} note="Masks sensitive labels across high-visibility surfaces." />
            <MetricRow icon={MapPin} label="Location" value={locationServicesEnabled ? "On" : "Off"} note="Used only by location-aware weather and pressure views." />
            <MetricRow icon={Sparkles} label="Skills" value={`${installedSkills.length + customSkills.length}`} note="Installed and custom skill count in this workspace." />
          </section>
        </aside>
      </div>
    </div>
  );
}
