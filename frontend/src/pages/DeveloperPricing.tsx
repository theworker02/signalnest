import { ArrowUpRight, Check, Cpu, CreditCard, DatabaseZap, KeyRound, LockKeyhole, RadioTower, ShieldCheck, Webhook } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useHardNavigate } from "../lib/hardNavigation";
import { Link } from "../lib/navigation";
import { createDeveloperSubscriptionCheckout } from "../lib/api";
import { useAppStore } from "../stores/useAppStore";

const pricingCards: Array<{ name: string; kind: string; price: string; unit: string; credits: string; badge?: string; tone: string; features: string[]; action: "free" | "checkout" | "contact" }> = [
  {
    name: "Free",
    kind: "Explore the API",
    price: "$0",
    unit: "forever",
    credits: "10k credits / month",
    tone: "from-cyan/20 via-white/[0.045] to-white/[0.018]",
    features: ["API access", "Text to speech", "Speech to text", "Voice changer", "Community voices"],
    action: "free",
  },
  {
    name: "Starter",
    kind: "Launch prototypes",
    price: "$5",
    unit: "per month",
    credits: "30k credits / month",
    tone: "from-sky-400/20 via-white/[0.045] to-white/[0.018]",
    features: ["Everything in Free", "Commercial license", "Instant voice cloning", "Higher concurrency", "Usage analytics"],
    action: "checkout",
  },
  {
    name: "Creator",
    kind: "Creator workflows",
    price: "$22",
    unit: "per month",
    credits: "100k credits / month",
    badge: "Popular",
    tone: "from-amber/30 via-white/[0.055] to-white/[0.018]",
    features: ["Professional voice cloning", "Long-form generation", "Projects access", "Dubbing tools", "Priority processing"],
    action: "checkout",
  },
  {
    name: "Pro",
    kind: "Production teams",
    price: "$99",
    unit: "per month",
    credits: "500k credits / month",
    tone: "from-violet/25 via-white/[0.05] to-white/[0.018]",
    features: ["More seats", "Higher quality exports", "Expanded API limits", "Usage dashboard", "Commercial production"],
    action: "checkout",
  },
  {
    name: "Scale",
    kind: "High-volume apps",
    price: "$330",
    unit: "per month",
    credits: "2M credits / month",
    tone: "from-emerald-400/20 via-white/[0.045] to-white/[0.018]",
    features: ["Scale usage rates", "Priority support", "Large batch jobs", "Advanced voices", "Team collaboration"],
    action: "contact",
  },
  {
    name: "Business",
    kind: "Growing companies",
    price: "$1,320",
    unit: "per month",
    credits: "11M+ credits / month",
    tone: "from-rose-400/20 via-white/[0.045] to-white/[0.018]",
    features: ["Admin controls", "Enterprise-grade usage", "Premium support", "Team management", "Security controls"],
    action: "contact",
  },
  {
    name: "Enterprise",
    kind: "Custom deployment",
    price: "Custom",
    unit: "annual contract",
    credits: "Tailored credit volume",
    tone: "from-slate-300/20 via-white/[0.045] to-white/[0.018]",
    features: ["Custom usage terms", "SSO and procurement", "Dedicated support", "Custom security review", "Volume pricing"],
    action: "contact",
  },
];

export function DeveloperPricing() {
  const navigate = useHardNavigate();
  const pushToast = useAppStore((state) => state.pushToast);
  const setDeveloperSubscriptionStatus = useAppStore((state) => state.setDeveloperSubscriptionStatus);
  const developerSubscriptionStatus = useAppStore((state) => state.developerSubscriptionStatus ?? "free");
  const [busyPlan, setBusyPlan] = useState<string | null>(null);

  async function handlePlan(action: "free" | "checkout" | "contact", planName: string) {
    if (action === "free") {
      navigate("/app/developers");
      return;
    }
    if (action === "contact") {
      navigate("/app/developers/docs/api-reference");
      return;
    }
    try {
      setBusyPlan(planName);
      const checkout = await createDeveloperSubscriptionCheckout();
      setDeveloperSubscriptionStatus("checkout_pending");
      pushToast({
        title: checkout.live ? "Developer Pro checkout ready" : "Live checkout disabled",
        body: checkout.live ? "$10/month hosted checkout is ready." : "Set billing link settings in backend/.env to enable live billing.",
        tone: checkout.live ? "success" : "warning",
      });
      window.open(checkout.checkoutUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      pushToast({ title: "Checkout unavailable", body: error instanceof Error ? error.message : "Developer Pro checkout could not be created.", tone: "warning" });
    } finally {
      setBusyPlan(null);
    }
  }

  return (
    <div className="-m-4 min-h-[calc(100vh-73px)] overflow-hidden bg-[#08090b] text-white md:-m-6">
      <header className="border-b border-white/10 bg-[#08090b]/95 px-5 py-4 backdrop-blur md:px-10 xl:px-16">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-5">
          <Link to="/app/developers" className="text-lg font-black tracking-tight text-white">SignalNest</Link>
          <nav className="flex flex-1 flex-wrap gap-5 text-sm font-semibold text-slate-300">
            <Link to="/app/developers/docs/quickstart" className="transition hover:text-white">Docs</Link>
            <Link to="/app/skills" className="transition hover:text-white">Marketplace</Link>
            <Link to="/app/developers/docs/api-reference" className="transition hover:text-white">API reference</Link>
            <Link to="/app/security" className="transition hover:text-white">Security</Link>
          </nav>
          <Link to="/app/developers/docs/api-reference" className="rounded-full border border-white/12 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan/30 hover:text-cyan">Contact sales</Link>
          <Link to="/login" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-slate-200">Log in</Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1180px] px-5 py-14 md:px-10 xl:px-16">
        <section className="mb-12">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan/20 bg-cyan/10 px-3 py-1 text-xs font-semibold text-cyan">
            <CreditCard className="h-3.5 w-3.5" />
            {developerSubscriptionStatus === "active" ? "Developer Pro active" : "ElevenAPI pricing"}
          </div>
          <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.055em] text-white md:text-6xl">API pricing for lifelike voice at every scale</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">A dark, glassy pricing surface modeled on the ElevenLabs grid: free exploration, creator tiers, production scale, business volume, and custom enterprise procurement.</p>
          <div className="mt-8 flex flex-wrap gap-2 text-sm font-semibold">
            {["ElevenAPI", "Text to Speech", "Speech to Text", "Voice Changer"].map((label, index) => (
              <span key={label} className={`rounded-full border px-4 py-2 ${index === 0 ? "border-white bg-white text-black" : "border-white/10 bg-white/[0.035] text-slate-300"}`}>
                {label}
              </span>
            ))}
          </div>
        </section>

        <section className="-mx-5 overflow-x-auto border-y border-white/10 bg-[radial-gradient(circle_at_18%_0%,rgba(0,229,255,0.12),transparent_32%),radial-gradient(circle_at_78%_16%,rgba(255,177,95,0.10),transparent_34%)] px-5 py-4 md:-mx-10 md:px-10 xl:-mx-16 xl:px-16">
          <div className="grid min-w-max grid-flow-col auto-cols-[236px] gap-px">
            {pricingCards.map((plan) => (
              <article key={plan.name} className="grid min-h-[560px] border-x border-white/10 bg-[#090a0c]/88 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
                <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${plan.tone} p-5 shadow-2xl`}>
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                  {plan.badge && <div className="mb-4 inline-flex rounded-full border border-amber/25 bg-amber/15 px-2.5 py-1 text-[11px] font-bold text-amber">{plan.badge}</div>}
                  <div className="mb-16">
                    <h2 className="text-2xl font-semibold tracking-[-0.035em] text-white">{plan.name}</h2>
                    <p className="mt-1 text-sm text-slate-400">{plan.kind}</p>
                  </div>
                  <div className="text-2xl font-semibold text-white">{plan.price}</div>
                  <div className="mt-1 text-sm text-slate-400">{plan.unit}</div>
                  <div className="mt-4 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs font-semibold text-slate-200">{plan.credits}</div>
                </div>

                <button
                  onClick={() => void handlePlan(plan.action, plan.name)}
                  className="mt-4 rounded-full bg-white px-4 py-3 text-sm font-bold text-black transition hover:bg-cyan"
                  disabled={busyPlan === plan.name}
                >
                  {busyPlan === plan.name ? "Preparing..." : plan.action === "contact" ? "Contact sales" : "Get started"}
                </button>

                <div className="mt-8 grid gap-0 text-sm text-slate-200">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 border-b border-dashed border-white/15 py-3">
                      <Check className="h-4 w-4 shrink-0 text-cyan" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 border-b border-white/10 py-8 text-sm text-slate-400 md:grid-cols-4">
          <PricingMetric icon={<KeyRound className="h-4 w-4" />} label="Free API keys" value="1 per account" />
          <PricingMetric icon={<Webhook className="h-4 w-4" />} label="Webhook events" value="Included locally" />
          <PricingMetric icon={<RadioTower className="h-4 w-4" />} label="Realtime events" value="Usage based" />
          <PricingMetric icon={<ShieldCheck className="h-4 w-4" />} label="Billing vendor" value="Hosted checkout" />
        </section>

        <section className="grid gap-4 py-8 md:grid-cols-3">
          <PricingNote icon={<Cpu className="h-5 w-5" />} title="API-first" text="Every plan is designed around real routes, SDK calls, CLI commands, and webhook delivery." />
          <PricingNote icon={<DatabaseZap className="h-5 w-5" />} title="Scales by signal" text="Separate pricing surfaces for API credentials, tracker checks, realtime events, and paid skills." />
          <PricingNote icon={<LockKeyhole className="h-5 w-5" />} title="Secure by default" text="Secrets are shown once, API keys can be revoked, and paid expansion uses vendor checkout." />
        </section>

        <p className="pb-10 text-center text-sm text-slate-500">Prices exclude taxes, levies, marketplace vendor fees, and enterprise contract terms.</p>
      </main>
    </div>
  );
}

function PricingMetric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-cyan">{icon}</span>
      <span>
        <span className="block text-slate-500">{label}</span>
        <span className="font-semibold text-white">{value}</span>
      </span>
    </div>
  );
}

function PricingNote({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-5">
      <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg border border-cyan/20 bg-cyan/10 text-cyan">{icon}</div>
      <div className="font-semibold text-white">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
      <ArrowUpRight className="mt-4 h-4 w-4 text-slate-500" />
    </div>
  );
}
