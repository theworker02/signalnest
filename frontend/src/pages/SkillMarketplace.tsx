import { AnimatePresence, motion } from "framer-motion";
import { Braces, CheckCircle2, Code2, Download, LockKeyhole, Plus, Search, ShieldCheck, Sparkles, Wand2, X } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Button } from "../components/Button";
import { PageIntro } from "../components/PageIntro";
import { Link } from "../lib/navigation";
import { scanSkillScript, type SkillScriptLanguage } from "../lib/skillSecurity";
import { useAppStore } from "../stores/useAppStore";

type MarketplaceSkill = {
  id: string;
  name: string;
  kind: string;
  tags: string[];
  body: string;
  cadence: string;
  verification: string;
};

const marketplaceSkills: MarketplaceSkill[] = [
  { id: "local-civic-watch", name: "Local Civic Watch", kind: "Civic", tags: ["permits", "transit", "alerts"], cadence: "1h", verification: "Public feed freshness", body: "Bundle city alerts, council agendas, transit advisories, and permit feeds." },
  { id: "newsletter-harvester", name: "Newsletter Harvester", kind: "Research", tags: ["RSS", "email", "archive"], cadence: "manual", verification: "Local archive indexing", body: "Save newsletters, RSS issues, and annotated research clippings into the vault." },
  { id: "public-safety-bundle", name: "Public Safety Bundle", kind: "Local", tags: ["FEMA", "USGS", "alerts"], cadence: "15m", verification: "Official emergency feeds", body: "Add earthquake, disaster declaration, severe weather, and public safety alerts." },
  { id: "open-data-importer", name: "Open Data Importer", kind: "Data", tags: ["CSV", "JSON", "public data"], cadence: "manual", verification: "Schema validation", body: "Import public datasets and turn them into refreshable boards and vault records." },
  { id: "grant-opportunity-watch", name: "Grant Opportunity Watch", kind: "Government", tags: ["grants", "RFP", "funding"], cadence: "6h", verification: "Official portal freshness", body: "Monitor grant portals, RFP feeds, award notices, and deadline changes for saved topics." },
  { id: "academic-paper-radar", name: "Academic Paper Radar", kind: "Research", tags: ["arXiv", "PubMed", "citations"], cadence: "12h", verification: "DOI and preprint matching", body: "Follow new papers, citations, authors, labs, and topic clusters across research indexes." },
  { id: "restaurant-inspection-feed", name: "Restaurant Inspection Feed", kind: "Local", tags: ["health", "restaurants", "city"], cadence: "24h", verification: "Municipal data timestamps", body: "Track inspection scores, violations, closures, and neighborhood food safety updates." },
  { id: "school-district-alerts", name: "School District Alerts", kind: "Local", tags: ["schools", "closures", "boards"], cadence: "30m", verification: "District feed freshness", body: "Monitor closures, board agendas, policy updates, calendar changes, and emergency notices." },
  { id: "airport-ground-stop-watch", name: "Airport Ground Stop Watch", kind: "Travel", tags: ["FAA", "airports", "delays"], cadence: "5m", verification: "FAA advisory freshness", body: "Monitor ground stops, delay programs, airport advisories, and severe-weather travel disruptions." },
  { id: "museum-gallery-calendar", name: "Museum Gallery Calendar", kind: "Culture", tags: ["museum", "gallery", "events"], cadence: "24h", verification: "Event page diff", body: "Track exhibitions, gallery openings, artist talks, ticket windows, and local culture calendars." },
  { id: "open-source-maintainer-feed", name: "Open Source Maintainer Feed", kind: "Developer", tags: ["GitHub", "maintainers", "OSS"], cadence: "2h", verification: "Repo event dedupe", body: "Follow maintainer releases, issue spikes, security threads, governance changes, and contributor activity." },
  { id: "product-recall-monitor", name: "Product Recall Monitor", kind: "Safety", tags: ["recalls", "CPSC", "FDA"], cadence: "12h", verification: "Official recall feed checks", body: "Monitor consumer, food, vehicle, medical, and product recalls from official sources." },
  { id: "conference-cfp-tracker", name: "Conference CFP Tracker", kind: "Career", tags: ["CFP", "events", "speaking"], cadence: "24h", verification: "Deadline and page diff", body: "Track call-for-proposals, agenda releases, speaker announcements, and conference deadline changes." },
  { id: "local-roadwork-map", name: "Local Roadwork Map", kind: "Local", tags: ["traffic", "roadwork", "DOT"], cadence: "1h", verification: "DOT feed freshness", body: "Track road closures, construction permits, detours, transit impacts, and neighborhood infrastructure work." },
  { id: "public-meeting-minutes", name: "Public Meeting Minutes", kind: "Civic", tags: ["minutes", "council", "boards"], cadence: "24h", verification: "Agenda and minutes diff", body: "Monitor local meeting agendas, minutes, votes, attachments, and public comment deadlines." },
  { id: "satellite-launch-window", name: "Satellite Launch Window", kind: "Aerospace", tags: ["launch", "space", "weather"], cadence: "1h", verification: "Launch schedule quorum", body: "Monitor launch windows, scrub notices, payload updates, weather constraints, and livestream availability." },
  { id: "cve-radar", name: "CVE Radar", kind: "Security", tags: ["CVE", "CISA", "exploit"], cadence: "15m", verification: "Official advisory quorum", body: "Track exploited vulnerabilities, critical NVD records, vendor advisories, and proof-of-concept chatter." },
  { id: "price-sentinel", name: "Price Sentinel", kind: "Commerce", tags: ["pricing", "retail", "diff"], cadence: "30m", verification: "Price string and DOM diff", body: "Watch competitor pricing, retail inventory, limited drops, currency changes, and checkout page movement." },
  { id: "repo-pulse", name: "Repo Pulse", kind: "Developer", tags: ["GitHub", "release", "advisory"], cadence: "20m", verification: "Release and advisory dedupe", body: "Monitor releases, issue surges, security advisories, maintainer changes, and repository velocity spikes." },
  { id: "weather-operations", name: "Weather Operations", kind: "Weather", tags: ["NOAA", "AQI", "utility"], cadence: "10m", verification: "Official weather source freshness", body: "Combine severe alerts, pressure changes, AQI thresholds, utility outages, transit disruption, and local closures." },
  { id: "market-cluster", name: "Market Cluster", kind: "Finance", tags: ["stocks", "macro", "rates"], cadence: "5m", verification: "Ticker and macro source quorum", body: "Track watchlist moves, treasury yields, earnings notices, commodities, options anomalies, and sector news clusters." },
  { id: "domain-tls-guard", name: "Domain TLS Guard", kind: "Security", tags: ["DNS", "TLS", "WHOIS"], cadence: "1h", verification: "Certificate transparency check", body: "Watch DNS records, certificate expiry, WHOIS changes, subdomain drift, and suspicious lookalike domains." },
  { id: "vendor-risk-watch", name: "Vendor Risk Watch", kind: "Compliance", tags: ["SOC2", "subprocessors", "privacy"], cadence: "12h", verification: "Vendor page diff", body: "Monitor vendor security pages, subprocessor lists, compliance notices, SOC reports, and incident postmortems." },
  { id: "api-schema-sentinel", name: "API Schema Sentinel", kind: "Developer", tags: ["OpenAPI", "GraphQL", "SDK"], cadence: "30m", verification: "Schema diff validation", body: "Detect OpenAPI changes, GraphQL introspection drift, SDK releases, deprecations, and documentation movement." },
  { id: "external-api-bridge", name: "External API Bridge", kind: "API Connector", tags: ["REST", "JSON", "webhook"], cadence: "10m", verification: "HTTP status and JSON schema checks", body: "Call third-party REST APIs, normalize JSON responses, detect status changes, and emit workspace alerts when returned fields cross thresholds." },
  { id: "weather-api-fusion", name: "Weather API Fusion", kind: "API Connector", tags: ["weather", "NOAA", "OpenWeather"], cadence: "10m", verification: "Multi-provider response quorum", body: "Query multiple weather APIs, compare forecast deltas, pressure movement, AQI values, and severe alert payloads before creating a signal." },
  { id: "brand-defense-kit", name: "Brand Defense Kit", kind: "Brand", tags: ["mentions", "phishing", "reputation"], cadence: "30m", verification: "Keyword and domain matching", body: "Watch brand mentions, executive name spikes, phishing domains, impersonation attempts, and press wire updates." },
  { id: "product-launch-radar", name: "Product Launch Radar", kind: "Product", tags: ["launch", "changelog", "competitor"], cadence: "20m", verification: "Launch source dedupe", body: "Track product launches, changelogs, landing page CTA changes, app rankings, and community velocity." },
  { id: "court-docket-watch", name: "Court Docket Watch", kind: "Legal", tags: ["court", "filings", "opinions"], cadence: "6h", verification: "Docket timestamp freshness", body: "Monitor docket updates, opinions, class actions, enforcement actions, and litigation calendar changes." },
  { id: "biotech-signal-watch", name: "Biotech Signal Watch", kind: "Health", tags: ["FDA", "clinical", "trials"], cadence: "6h", verification: "Official health portal checks", body: "Track clinical trial updates, FDA decisions, drug shortages, recall notices, and biotech regulatory milestones." },
  { id: "supply-chain-drift", name: "Supply Chain Drift", kind: "Logistics", tags: ["ports", "rail", "customs"], cadence: "1h", verification: "Transport feed quorum", body: "Watch port congestion, rail interruptions, import detentions, warehouse labor notices, and logistics advisories." },
  { id: "energy-grid-watch", name: "Energy Grid Watch", kind: "Energy", tags: ["grid", "ISO", "utilities"], cadence: "15m", verification: "Grid operator feed freshness", body: "Monitor grid emergencies, ISO power price spikes, fuel moves, utility outage maps, and capacity warnings." },
  { id: "creator-media-monitor", name: "Creator Media Monitor", kind: "Media", tags: ["YouTube", "podcast", "newsletter"], cadence: "1h", verification: "Feed and upload checks", body: "Track channel uploads, podcast guest mentions, newsletter sponsors, livestream schedules, and audience trend shifts." },
  { id: "procurement-war-room", name: "Procurement War Room", kind: "Government", tags: ["RFP", "awards", "contracts"], cadence: "6h", verification: "Portal document diff", body: "Follow tender releases, bid amendments, contract awards, public notices, and grant deadline changes." },
  { id: "real-estate-local-radar", name: "Real Estate Local Radar", kind: "Local", tags: ["zoning", "permits", "housing"], cadence: "12h", verification: "Municipal record freshness", body: "Monitor zoning board applications, building permits, property tax assessments, rental pricing, and development agendas." },
  { id: "telecom-outage-mesh", name: "Telecom Outage Mesh", kind: "Infrastructure", tags: ["telecom", "fiber", "maintenance"], cadence: "15m", verification: "Status and regional report quorum", body: "Track regional telecom outages, fiber maintenance windows, carrier advisories, and latency reports." },
  { id: "sports-market-pulse", name: "Sports Market Pulse", kind: "Sports", tags: ["injury", "odds", "schedule"], cadence: "15m", verification: "Line and report freshness", body: "Monitor injury reports, live odds movement, schedule changes, weather impacts, and lineup announcements." },
  { id: "election-civic-feed", name: "Election Civic Feed", kind: "Civic", tags: ["elections", "filings", "results"], cadence: "30m", verification: "Official election source checks", body: "Track result feeds, campaign finance filings, public comment deadlines, ballot notices, and election office updates." },
  { id: "patent-ip-watch", name: "Patent IP Watch", kind: "Legal", tags: ["patent", "trademark", "IP"], cadence: "24h", verification: "Filing and assignee match", body: "Monitor patent publications, assignee changes, trademark filings, opposition records, and competitor IP movement." },
  { id: "defi-risk-radar", name: "DeFi Risk Radar", kind: "Crypto", tags: ["DeFi", "audit", "exploit"], cadence: "10m", verification: "Security source quorum", body: "Watch bridge exploit alerts, governance proposals, audit releases, listing notices, and smart contract incident chatter." },
  { id: "restaurant-hospitality-watch", name: "Restaurant Hospitality Watch", kind: "Local", tags: ["inspection", "reservations", "events"], cadence: "12h", verification: "Municipal and booking source freshness", body: "Track health inspection scores, reservation openings, venue events, local closures, and neighborhood demand signals." },
  { id: "education-policy-watch", name: "Education Policy Watch", kind: "Education", tags: ["schools", "boards", "policy"], cadence: "12h", verification: "District and board feed diff", body: "Monitor school board agendas, policy updates, closure notices, calendars, and public meeting attachments." },
  { id: "ai-release-intelligence", name: "AI Release Intelligence", kind: "AI", tags: ["models", "papers", "benchmarks"], cadence: "20m", verification: "Release and paper dedupe", body: "Track model launches, benchmark posts, arXiv clusters, GitHub drops, provider status, and documentation changes." },
  { id: "cloud-capacity-watch", name: "Cloud Capacity Watch", kind: "Infrastructure", tags: ["cloud", "capacity", "regions"], cadence: "10m", verification: "Cloud status and region checks", body: "Watch region capacity warnings, cloud pricing changes, status components, maintenance windows, and quota notices." },
  { id: "social-trend-breakout", name: "Social Trend Breakout", kind: "Trends", tags: ["Reddit", "HN", "keywords"], cadence: "15m", verification: "Velocity and baseline comparison", body: "Detect keyword anomalies, subreddit velocity, Hacker News movement, creator spikes, and emerging topic clusters." },
  { id: "travel-document-watch", name: "Travel Document Watch", kind: "Travel", tags: ["visa", "passport", "appointments"], cadence: "30m", verification: "Slot availability checks", body: "Track visa slot openings, passport appointment changes, embassy notices, airline route changes, and hotel availability." },
  { id: "privacy-policy-guard", name: "Privacy Policy Guard", kind: "Compliance", tags: ["privacy", "legal", "diff"], cadence: "12h", verification: "Legal text diff", body: "Watch privacy policy updates, data residency notices, retention language, cookie policy shifts, and subprocessor changes." },
  { id: "hardware-drop-hunter", name: "Hardware Drop Hunter", kind: "Hardware", tags: ["GPU", "inventory", "retail"], cadence: "5m", verification: "Inventory and price source checks", body: "Monitor GPU drops, component inventory, console restocks, price movement, and limited supply alerts." },
  { id: "price-watcher-retail", name: "Retail Price Watcher", kind: "Price Watcher", tags: ["price", "retail", "discount"], cadence: "15m", verification: "Price text and checkout DOM diff", body: "Watch retail product pages for price drops, coupon changes, bundle offers, stock returns, and limited-time sale windows." },
  { id: "price-watcher-saas", name: "SaaS Price Watcher", kind: "Price Watcher", tags: ["pricing", "saas", "competitor"], cadence: "1h", verification: "Plan table and billing copy diff", body: "Track competitor pricing pages, plan limits, trial CTAs, annual discount copy, add-on fees, and enterprise packaging shifts." },
  { id: "price-watcher-flights", name: "Flight Fare Watcher", kind: "Price Watcher", tags: ["travel", "flights", "fare"], cadence: "30m", verification: "Route fare and availability checks", body: "Monitor flight fare changes, route availability, fare class openings, baggage fee updates, and schedule-linked price movement." },
  { id: "price-watcher-hotels", name: "Hotel Rate Watcher", kind: "Price Watcher", tags: ["travel", "hotel", "rates"], cadence: "1h", verification: "Nightly rate and room availability diff", body: "Watch hotel nightly rates, room-type availability, loyalty award pricing, resort fees, and cancellation policy changes." },
  { id: "price-watcher-hardware", name: "Hardware Price Watcher", kind: "Price Watcher", tags: ["hardware", "gpu", "components"], cadence: "5m", verification: "Retailer inventory and price quorum", body: "Track GPUs, CPUs, laptops, consoles, and creator hardware for restocks, markdowns, scalper spikes, and bundle pricing." },
  { id: "price-watcher-grocery", name: "Grocery Price Watcher", kind: "Price Watcher", tags: ["grocery", "local", "inflation"], cadence: "12h", verification: "Store listing and circular diff", body: "Monitor grocery staples, weekly circulars, local store availability, loyalty discounts, and recurring basket price movement." },
  { id: "price-watcher-energy", name: "Energy Price Watcher", kind: "Price Watcher", tags: ["energy", "fuel", "utilities"], cadence: "1h", verification: "Commodity and utility source checks", body: "Watch fuel prices, electricity market spikes, natural gas notices, utility tariff changes, and grid-linked energy costs." },
  { id: "price-watcher-marketplace", name: "Marketplace Listing Watcher", kind: "Price Watcher", tags: ["marketplace", "resale", "listing"], cadence: "20m", verification: "Listing title, price, and availability diff", body: "Track resale marketplace listings, auction price changes, newly posted items, sold status, seller edits, and local deal windows." },
  { id: "price-watcher-domain", name: "Domain Price Watcher", kind: "Price Watcher", tags: ["domain", "auction", "renewal"], cadence: "6h", verification: "Registrar and auction listing checks", body: "Monitor domain auction bids, registrar renewal pricing, premium listing changes, expiration windows, and aftermarket availability." },
  { id: "price-watcher-subscription", name: "Subscription Fee Watcher", kind: "Price Watcher", tags: ["subscription", "billing", "consumer"], cadence: "24h", verification: "Terms and billing page diff", body: "Watch consumer subscription services for monthly fee changes, annual plan shifts, add-on pricing, bundle changes, and cancellation policy updates." },
  { id: "price-watcher-crypto", name: "Crypto Price Watcher", kind: "Price Watcher", tags: ["crypto", "volatility", "exchange"], cadence: "1m", verification: "Exchange price and spread quorum", body: "Track crypto asset moves, stablecoin peg drift, exchange listing prices, spread anomalies, and high-volatility threshold events." },
  { id: "price-watcher-ticket", name: "Ticket Price Watcher", kind: "Price Watcher", tags: ["tickets", "events", "availability"], cadence: "10m", verification: "Ticket listing and seat map diff", body: "Monitor concert, sports, theater, and festival tickets for price drops, seat releases, resale changes, and sold-out reversals." },
];

const defaultSkillCode = `export async function runSkill({ signalnest, emit, input }) {
  const snapshot = await signalnest.fetch(input.source);

  if (snapshot.changed || snapshot.priceDelta > 0.08) {
    await emit.alert({
      priority: "high",
      title: "Custom skill matched",
      summary: snapshot.summary,
    });
  }

  return snapshot;
}`;

const pythonSkillCode = `async def run_skill(signalnest, emit, input):
    snapshot = await signalnest.fetch(input["source"])

    if snapshot.changed or snapshot.price_delta > 0.08:
        await emit.alert({
            "priority": "high",
            "title": "Custom skill matched",
            "summary": snapshot.summary,
        })

    return snapshot`;

const csharpSkillCode = `public async Task<SkillResult> RunSkill(SignalNestClient signalnest, SkillEmitter emit, SkillInput input)
{
    var snapshot = await signalnest.FetchAsync(input.Source);

    if (snapshot.Changed || snapshot.PriceDelta > 0.08m)
    {
        await emit.AlertAsync(new SkillAlert {
            Priority = "high",
            Title = "Custom skill matched",
            Summary = snapshot.Summary
        });
    }

    return snapshot;
}`;

const starterCodeByLanguage: Record<SkillScriptLanguage, string> = {
  javascript: defaultSkillCode,
  python: pythonSkillCode,
  csharp: csharpSkillCode,
};

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function SkillMarketplace() {
  const installedSkills = useAppStore((state) => state.installedSkills);
  const customSkills = useAppStore((state) => state.customSkills);
  const installSkill = useAppStore((state) => state.installSkill);
  const createSkill = useAppStore((state) => state.createSkill);
  const addVaultItem = useAppStore((state) => state.addVaultItem);
  const pushToast = useAppStore((state) => state.pushToast);
  const [query, setQuery] = useState("");
  const [skillName, setSkillName] = useState("");
  const [skillGoal, setSkillGoal] = useState("");
  const [skillLanguage, setSkillLanguage] = useState<SkillScriptLanguage>("javascript");
  const [skillCode, setSkillCode] = useState(defaultSkillCode);
  const [skillTrigger, setSkillTrigger] = useState("schedule");
  const [selectedSkillId, setSelectedSkillId] = useState(marketplaceSkills[0].id);
  const [builderOpen, setBuilderOpen] = useState(true);
  const [securityScan, setSecurityScan] = useState(() => scanSkillScript(defaultSkillCode, "javascript"));

  const filtered = useMemo(
    () => marketplaceSkills.filter((skill) => `${skill.name} ${skill.kind} ${skill.tags.join(" ")} ${skill.body}`.toLowerCase().includes(query.toLowerCase())),
    [query],
  );
  const selectedSkill = useMemo(() => marketplaceSkills.find((skill) => skill.id === selectedSkillId) ?? marketplaceSkills[0], [selectedSkillId]);
  const selectedInstalled = installedSkills.includes(selectedSkill.name);

  function submitCustomSkill(event: FormEvent) {
    event.preventDefault();
    if (!skillName.trim() || !skillGoal.trim()) return;
    const scan = scanSkillScript(skillCode, skillLanguage);
    setSecurityScan(scan);
    if (!scan.safe) {
      pushToast({ title: "Skill blocked by security scan", body: scan.reasons[0], tone: "danger" });
      return;
    }
    createSkill(skillName.trim());
    addVaultItem({
      id: `custom-skill-code-${slugify(skillName)}-${Date.now()}`,
      title: `${skillName.trim()} skill script`,
      kind: "note",
      collection: "Skill Marketplace",
      tags: ["custom-skill", "script", skillTrigger, skillLanguage],
      updated: "Just now",
      excerpt: `${skillGoal.trim()}\n\n${skillCode.trim() || "No script body provided."}`,
    });
    pushToast({ title: "Skill blueprint saved", body: `${skillTrigger} trigger / ${skillGoal.trim()}`, tone: "success" });
    setSkillName("");
    setSkillGoal("");
    setSkillLanguage("javascript");
    setSkillCode(defaultSkillCode);
    setSecurityScan(scanSkillScript(defaultSkillCode, "javascript"));
    setSkillTrigger("schedule");
  }

  function updateSkillLanguage(language: SkillScriptLanguage) {
    setSkillLanguage(language);
    setSkillCode(starterCodeByLanguage[language]);
    setSecurityScan(scanSkillScript(starterCodeByLanguage[language], language));
  }

  function updateSkillCode(code: string) {
    setSkillCode(code);
    setSecurityScan(scanSkillScript(code, skillLanguage));
  }

  function addFreeSkill(skill: MarketplaceSkill) {
    installSkill(skill.name);
    pushToast({ title: "Extension added", body: `${skill.name} is ready to configure.`, tone: "success" });
  }

  function openCustomBuilder() {
    setBuilderOpen(true);
    window.setTimeout(() => document.getElementById("custom-skill-name")?.focus(), 120);
  }

  return (
    <div className="grid gap-4">
      <PageIntro
        eyebrow="Skill Marketplace"
        title="Free extensions for specialized signal packs."
        body="Browse installable extensions that add monitors, alert rules, vault notes, and workflow shortcuts. Everything in this marketplace is free to install."
        action={<Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={openCustomBuilder} tooltip="Start a custom skill blueprint">Create custom skill</Button>}
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <section className="grid gap-4">
          <div className="panel flex items-center gap-3 rounded-lg p-4">
            <Search className="h-4 w-4 text-cyan" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-slate-500" placeholder="Search free extensions by source, category, or use case" />
            <span className="hidden rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-200 sm:inline-flex">Free only</span>
          </div>

          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {filtered.map((skill) => {
              const installed = installedSkills.includes(skill.name);
              return (
                <article key={skill.id} className={`panel rounded-lg p-4 transition hover:-translate-y-1 hover:border-cyan/30 ${selectedSkill.id === skill.id ? "border-cyan/35 bg-cyan/[0.04]" : ""}`}>
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-cyan">{skill.kind}</div>
                      <h3 className="mt-1 text-xl font-black text-white">{skill.name}</h3>
                    </div>
                    <span className="rounded border border-emerald-300/20 bg-emerald-400/10 px-2 py-1 text-xs text-emerald-200">Free</span>
                  </div>
                  <p className="text-sm leading-6 text-slate-400">{skill.body}</p>
                  <div className="mt-4 grid gap-2 rounded-md border border-white/10 bg-black/20 p-3 text-xs text-slate-400">
                    <div className="flex items-center justify-between gap-3"><span>Cadence</span><span className="font-semibold text-white">{skill.cadence}</span></div>
                    <div className="flex items-center justify-between gap-3"><span>Verification</span><span className="text-right font-semibold text-white">{skill.verification}</span></div>
                    <div className="flex items-center justify-between gap-3"><span>Adds</span><span className="text-right font-semibold text-white">monitors, alert, vault note</span></div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {skill.tags.map((tag) => <span key={tag} className="rounded border border-cyan/20 bg-cyan/10 px-2 py-1 text-xs text-cyan">{tag}</span>)}
                  </div>
                  <div className="mt-5 flex gap-2">
                    <Button
                      variant={installed ? "secondary" : "primary"}
                      icon={installed ? <CheckCircle2 className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                      onClick={() => {
                        if (installed) return;
                        addFreeSkill(skill);
                      }}
                      tooltip={installed ? "This extension is already installed" : "Add this free extension to your workspace"}
                    >
                      {installed ? "Installed" : "Add free"}
                    </Button>
                    <Button
                      variant="ghost"
                      icon={<Sparkles className="h-4 w-4" />}
                      onClick={() => setSelectedSkillId(skill.id)}
                      tooltip="Preview what this extension monitors"
                    >
                      Preview
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="grid content-start gap-4">
          <div className="grid gap-4 xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto xl:pr-1">
            <section className="panel rounded-lg p-4">
              <div className="mb-4 flex items-center gap-2 font-bold text-white"><Sparkles className="h-4 w-4 text-cyan" /> Extension preview</div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedSkill.id}
                  initial={{ opacity: 0, y: 14, scale: 0.985, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, scale: 0.99, filter: "blur(6px)" }}
                  transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.div
                    className="rounded-md border border-cyan/20 bg-cyan/[0.06] p-4"
                    initial={{ boxShadow: "0 0 0 rgba(34, 211, 238, 0)" }}
                    animate={{ boxShadow: ["0 0 0 rgba(34, 211, 238, 0)", "0 0 34px rgba(34, 211, 238, 0.16)", "0 0 0 rgba(34, 211, 238, 0)"] }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  >
                    <div className="text-sm font-semibold text-cyan">{selectedSkill.kind}</div>
                    <h2 className="mt-1 text-2xl font-black text-white">{selectedSkill.name}</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{selectedSkill.body}</p>
                  </motion.div>
                  <div className="mt-4 grid gap-2 rounded-md border border-white/10 bg-black/20 p-3 text-xs text-slate-400">
                    <div className="flex items-center justify-between gap-3"><span>Cadence</span><span className="font-semibold text-white">{selectedSkill.cadence}</span></div>
                    <div className="flex items-center justify-between gap-3"><span>Verification</span><span className="text-right font-semibold text-white">{selectedSkill.verification}</span></div>
                    <div className="flex items-center justify-between gap-3"><span>Install state</span><span className="text-right font-semibold text-white">{selectedInstalled ? "Installed" : "Ready"}</span></div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedSkill.tags.map((tag) => <span key={tag} className="rounded border border-cyan/20 bg-cyan/10 px-2 py-1 text-xs text-cyan">{tag}</span>)}
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <Button
                  variant={selectedInstalled ? "secondary" : "primary"}
                  icon={selectedInstalled ? <CheckCircle2 className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                  onClick={() => {
                    if (!selectedInstalled) addFreeSkill(selectedSkill);
                  }}
                  tooltip={selectedInstalled ? "This extension is already installed" : "Add this free extension to your workspace"}
                >
                  {selectedInstalled ? "Installed" : "Add free"}
                </Button>
                <Link to="/app/monitoring" className="ui-tooltip inline-flex min-h-10 items-center justify-center rounded-md border border-white/10 bg-white/[0.045] px-3 text-sm font-semibold text-slate-100 transition hover:border-cyan/30 hover:bg-white/[0.08]" data-tooltip="Open monitoring to configure sources">
                  Configure monitors
                </Link>
              </div>
            </section>

            <section className="panel rounded-lg p-4">
              <div className="mb-4 flex items-center gap-2 font-bold text-white"><ShieldCheck className="h-4 w-4 text-cyan" /> Free extension policy</div>
              <p className="text-sm leading-6 text-slate-400">This marketplace only lists free extensions. Install actions happen inside SignalNest and never open a payment provider.</p>
              <div className="mt-4 grid gap-2 text-xs text-slate-400">
                <div className="rounded border border-white/10 bg-black/20 p-3">Pricing: free extensions only</div>
                <div className="rounded border border-white/10 bg-black/20 p-3">Install flow: local workspace configuration</div>
                <div className="rounded border border-white/10 bg-black/20 p-3">Checkout: disabled and removed from this page</div>
              </div>
            </section>

            <AnimatePresence initial={false}>
              {builderOpen && (
                <motion.form
                  key="custom-skill-builder"
                  onSubmit={submitCustomSkill}
                  className="panel rounded-lg p-4"
                  initial={{ opacity: 0, y: 12, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Wand2 className="h-5 w-5 text-cyan" />
                      <h2 className="text-2xl font-black text-white">Custom skill builder</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBuilderOpen(false)}
                      className="ui-tooltip inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-rose-300/30 hover:bg-rose-400/10 hover:text-rose-100"
                      data-tooltip="Close custom skill builder"
                      aria-label="Close custom skill builder"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <label className="mb-3 block text-sm">
                    <span className="mb-2 block text-slate-400">Skill name</span>
                    <input id="custom-skill-name" value={skillName} onChange={(event) => setSkillName(event.target.value)} className="w-full rounded-md border border-white/10 bg-black/25 px-3 py-2 text-white outline-none" placeholder="Airport disruption watcher" />
                  </label>
                  <label className="mb-3 block text-sm">
                    <span className="mb-2 block text-slate-400">What should it watch?</span>
                    <textarea value={skillGoal} onChange={(event) => setSkillGoal(event.target.value)} className="min-h-28 w-full rounded-md border border-white/10 bg-black/25 px-3 py-2 text-white outline-none" placeholder="Track FAA ground stops, local airport advisories, flight price shifts, and weather alerts." />
                  </label>
                  <label className="mb-3 block text-sm">
                    <span className="mb-2 flex items-center gap-2 text-slate-400"><Code2 className="h-4 w-4 text-cyan" /> Code</span>
                    <div className="mb-2 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
                      <select value={skillLanguage} onChange={(event) => updateSkillLanguage(event.target.value as SkillScriptLanguage)} className="w-full rounded-md border border-white/10 bg-black/25 px-3 py-2 text-white outline-none">
                        <option value="javascript">JavaScript / TypeScript</option>
                        <option value="python">Python</option>
                        <option value="csharp">C#</option>
                      </select>
                      <span className={`rounded-md border px-3 py-2 text-xs font-bold ${securityScan.safe ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-200" : "border-rose-300/20 bg-rose-400/10 text-rose-200"}`}>
                        {securityScan.safe ? "Security scan passed" : "Blocked"}
                      </span>
                    </div>
                    <textarea
                      value={skillCode}
                      onChange={(event) => updateSkillCode(event.target.value)}
                      spellCheck={false}
                      className="min-h-48 w-full resize-y rounded-md border border-white/10 bg-[#05070b] px-3 py-3 font-mono text-xs leading-5 text-cyan outline-none placeholder:text-slate-600"
                      placeholder="Write a JavaScript skill script that fetches sources, checks thresholds, and emits alerts."
                    />
                    <span className="mt-2 block text-xs leading-5 text-slate-500">Saved as a vault note with the custom skill so the agent or operator can review the implementation later.</span>
                    {!securityScan.safe && (
                      <div className="mt-3 rounded-md border border-rose-300/20 bg-rose-400/10 p-3 text-xs leading-5 text-rose-100">
                        <div className="mb-1 font-bold">Security scan blocked this script</div>
                        <ul className="grid gap-1">
                          {securityScan.reasons.map((reason) => <li key={reason}>- {reason}</li>)}
                        </ul>
                      </div>
                    )}
                  </label>
                  <label className="mb-5 block text-sm">
                    <span className="mb-2 block text-slate-400">Trigger style</span>
                    <select value={skillTrigger} onChange={(event) => setSkillTrigger(event.target.value)} className="w-full rounded-md border border-white/10 bg-black/25 px-3 py-2 text-white outline-none">
                      <option value="schedule">Scheduled polling</option>
                      <option value="threshold">Threshold alert</option>
                      <option value="webhook">Webhook event</option>
                      <option value="manual">Manual research workflow</option>
                    </select>
                  </label>
                  <Button className="w-full" variant="primary" type="submit" icon={<Braces className="h-4 w-4" />} disabled={!skillName.trim() || !skillGoal.trim() || !skillCode.trim() || !securityScan.safe} tooltip="Save this skill blueprint locally">Create skill</Button>
                </motion.form>
              )}
            </AnimatePresence>
            {!builderOpen && (
              <button
                type="button"
                onClick={openCustomBuilder}
                className="ui-tooltip rounded-lg border border-dashed border-cyan/25 bg-cyan/[0.04] p-4 text-left text-sm font-bold text-cyan transition hover:border-cyan/45 hover:bg-cyan/[0.08]"
                data-tooltip="Reopen the custom skill builder"
              >
                + Create custom skill
              </button>
            )}
            <section className="panel rounded-lg p-4">
              <div className="mb-4 flex items-center gap-2 font-bold text-white"><LockKeyhole className="h-4 w-4 text-cyan" /> Installed skills</div>
              <div className="grid gap-2">
                {[...installedSkills, ...customSkills.filter((skill) => !installedSkills.includes(skill))].map((skill) => (
                  <div key={skill} className="rounded-md border border-white/10 bg-white/[0.035] p-3 text-sm text-slate-300">{skill}</div>
                ))}
              </div>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}
