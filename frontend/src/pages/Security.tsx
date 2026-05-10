import { Fingerprint, KeyRound, MonitorSmartphone, ShieldCheck } from "lucide-react";
import { Button } from "../components/Button";
import { PageIntro } from "../components/PageIntro";
import { useAppStore } from "../stores/useAppStore";

export function Security() {
  const mfaEnabled = useAppStore((state) => state.mfaEnabled);
  const toggleMfa = useAppStore((state) => state.toggleMfa);
  const securitySessions = useAppStore((state) => state.securitySessions);
  const securityLog = useAppStore((state) => state.securityLog);
  const revokeSession = useAppStore((state) => state.revokeSession);
  return (
    <div className="grid gap-4">
      <PageIntro
        eyebrow="Security"
        title="Manage sessions, MFA, devices, and audit posture."
        body="MFA, session revocation, and audit entries update immediately so the page behaves like an account control center."
        action={<Button variant="primary" icon={<KeyRound className="h-4 w-4" />} onClick={toggleMfa}>{mfaEnabled ? "Disable MFA" : "Enable MFA"}</Button>}
      />
      <div className="grid gap-4 xl:grid-cols-[1fr_.85fr]">
      <section className="panel rounded-lg p-4">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-cyan">Security center</div>
            <h2 className="text-2xl font-black text-white">Sessions, MFA, devices, audit logs</h2>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ["MFA", mfaEnabled ? "Enabled" : "Disabled", ShieldCheck],
            ["JWT rotation", "12 min access", KeyRound],
            ["Active devices", `${securitySessions.length} sessions`, MonitorSmartphone],
          ].map(([label, value, Icon]) => (
            <div key={label as string} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <Icon className="mb-4 h-5 w-5 text-cyan" />
              <div className="text-sm text-slate-400">{label as string}</div>
              <div className="mt-1 text-xl font-black text-white">{value as string}</div>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {securitySessions.map((session) => (
            <div key={session} className="flex items-center gap-3 rounded-md border border-white/10 bg-black/20 p-3">
              <MonitorSmartphone className="h-4 w-4 text-cyan" />
              <span className="text-sm text-slate-300">{session}</span>
              <Button className="ml-auto min-h-8 px-2 text-xs" variant="danger" onClick={() => revokeSession(session)}>Revoke</Button>
            </div>
          ))}
          {securitySessions.length === 0 && <div className="rounded-md border border-amber/20 bg-amber/10 p-3 text-sm text-amber">No active sessions remain in this local model.</div>}
        </div>
        <div className="mt-5 grid gap-2">
          {securityLog.map((item, index) => (
            <div key={item} className="rounded-md border border-white/10 bg-black/20 p-3 text-sm text-slate-300">
              <span className="mr-3 text-slate-500">#{index + 1}</span>{item}
            </div>
          ))}
        </div>
      </section>
      <aside className="panel rounded-lg p-4">
        <Fingerprint className="mb-4 h-5 w-5 text-amber" />
        <h3 className="font-bold text-white">Production hardening checklist</h3>
        <div className="mt-4 grid gap-2">
          {["Argon2 password hashing", "CSRF token validation", "Helmet secure headers", "Zod request schemas", "Redis-backed rate limits", "Audit log persistence", "Refresh token family revocation"].map((item) => (
            <div key={item} className="rounded border border-emerald-300/15 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">{item}</div>
          ))}
        </div>
      </aside>
      </div>
    </div>
  );
}
