import { lazy, Suspense, useEffect, useState, type ReactElement } from "react";
import { AppShell } from "./components/AppShell";
import { currentPathname, SIGNALNEST_NAVIGATION_EVENT } from "./lib/hardNavigation";
import { useAppStore } from "./stores/useAppStore";

const Alerts = lazy(() => import("./pages/Alerts").then((module) => ({ default: module.Alerts })));
const Analytics = lazy(() => import("./pages/Analytics").then((module) => ({ default: module.Analytics })));
const ChangeEngine = lazy(() => import("./pages/ChangeEngine").then((module) => ({ default: module.ChangeEngine })));
const Dashboard = lazy(() => import("./pages/Dashboard").then((module) => ({ default: module.Dashboard })));
const DeveloperDocs = lazy(() => import("./pages/DeveloperDocs").then((module) => ({ default: module.DeveloperDocs })));
const DeveloperPricing = lazy(() => import("./pages/DeveloperPricing").then((module) => ({ default: module.DeveloperPricing })));
const Developers = lazy(() => import("./pages/Developers").then((module) => ({ default: module.Developers })));
const Landing = lazy(() => import("./pages/Landing").then((module) => ({ default: module.Landing })));
const Login = lazy(() => import("./pages/Login").then((module) => ({ default: module.Login })));
const Monitoring = lazy(() => import("./pages/Monitoring").then((module) => ({ default: module.Monitoring })));
const ResearchVault = lazy(() => import("./pages/ResearchVault").then((module) => ({ default: module.ResearchVault })));
const Security = lazy(() => import("./pages/Security").then((module) => ({ default: module.Security })));
const Settings = lazy(() => import("./pages/Settings").then((module) => ({ default: module.Settings })));
const SignalMap = lazy(() => import("./pages/SignalMap").then((module) => ({ default: module.SignalMap })));
const SkillMarketplace = lazy(() => import("./pages/SkillMarketplace").then((module) => ({ default: module.SkillMarketplace })));
const WeatherChanges = lazy(() => import("./pages/WeatherChanges").then((module) => ({ default: module.WeatherChanges })));
const Workspace = lazy(() => import("./pages/Workspace").then((module) => ({ default: module.Workspace })));

type PageDefinition = {
  title: string;
  shell: boolean;
  component: ReactElement;
};

function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center overflow-hidden bg-ink px-4 text-white grain">
      <div className="w-full max-w-[520px] rounded-xl border border-white/10 bg-black/35 p-4 shadow-2xl backdrop-blur-xl sm:p-5">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-cyan/30 bg-cyan/10 text-cyan">
              <span className="absolute inset-1 rounded-md border border-cyan/20" />
              <span className="absolute h-8 w-8 rounded-full border border-cyan/25 loading-pulse" />
              <span className="relative text-[11px] font-black tracking-[-0.02em]">SN</span>
            </span>
            <div className="min-w-0">
              <div className="text-sm font-black uppercase tracking-[0.22em] text-cyan">SignalNest</div>
              <div className="mt-1 text-sm text-slate-400">Preparing command center</div>
            </div>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-bold text-slate-300">Live</span>
        </div>

        <div className="grid gap-3">
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
            <div className="loading-bar h-full w-1/2 rounded-full bg-cyan" />
          </div>
          <div className="grid gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-3">
            {[72, 88, 58].map((width, index) => (
              <div key={width} className="flex items-center gap-3">
                <span className="h-7 w-7 rounded-md bg-white/[0.07] loading-sheen" />
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <span className="loading-sheen block h-full rounded-full" style={{ width: `${width}%` }} />
                </span>
                <span className={`h-2 rounded-full bg-cyan/30 ${index === 1 ? "w-14" : "w-10"}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

type DefaultLanding = "dashboard" | "monitoring" | "workspace" | "analytics";

function landingPageFor(defaultLanding: DefaultLanding): PageDefinition {
  const pages: Record<DefaultLanding, PageDefinition> = {
    dashboard: { title: "Command Center", shell: true, component: <Dashboard /> },
    monitoring: { title: "Live Monitoring", shell: true, component: <Monitoring /> },
    workspace: { title: "Workspaces", shell: true, component: <Workspace /> },
    analytics: { title: "Analytics", shell: true, component: <Analytics /> },
  };

  return pages[defaultLanding];
}

function resolvePage(pathname: string, defaultLanding: DefaultLanding): PageDefinition {
  if (pathname === "/login" || pathname === "/signup") return { title: pathname === "/signup" ? "Sign up" : "Sign in", shell: false, component: <Login /> };
  if (pathname === "/api-pricing" || pathname === "/pricing.html" || pathname === "/app/pricing-api") return { title: "API Pricing", shell: true, component: <DeveloperPricing /> };
  if (pathname === "/app/developers/docs") return { title: "Developer Docs", shell: true, component: <DeveloperDocs /> };
  if (pathname.startsWith("/app/developers/docs/")) return { title: "Developer Docs", shell: true, component: <DeveloperDocs /> };

  const pages: Record<string, PageDefinition> = {
    "/": { title: "SignalNest", shell: false, component: <Landing /> },
    "/app": landingPageFor(defaultLanding),
    "/app/monitoring": { title: "Live Monitoring", shell: true, component: <Monitoring /> },
    "/app/changes": { title: "Change Engine", shell: true, component: <ChangeEngine /> },
    "/app/weather-changes": { title: "Weather Changes", shell: true, component: <WeatherChanges /> },
    "/app/map": { title: "Signal Map", shell: true, component: <SignalMap /> },
    "/app/vault": { title: "Research Vault", shell: true, component: <ResearchVault /> },
    "/app/alerts": { title: "Alerts", shell: true, component: <Alerts /> },
    "/app/workspace": { title: "Workspaces", shell: true, component: <Workspace /> },
    "/app/analytics": { title: "Analytics", shell: true, component: <Analytics /> },
    "/app/security": { title: "Security", shell: true, component: <Security /> },
    "/app/skills": { title: "Skill Marketplace", shell: true, component: <SkillMarketplace /> },
    "/app/developers": { title: "Developers", shell: true, component: <Developers /> },
    "/app/settings": { title: "Settings", shell: true, component: <Settings /> },
  };

  return pages[pathname] ?? pages["/"];
}

export default function App() {
  const theme = useAppStore((state) => state.theme);
  const accent = useAppStore((state) => state.accent);
  const density = useAppStore((state) => state.density);
  const animationsEnabled = useAppStore((state) => state.animationsEnabled);
  const defaultLanding = useAppStore((state) => state.defaultLanding);
  const [pathname, setPathname] = useState(currentPathname);
  const page = resolvePage(pathname, defaultLanding);

  useEffect(() => {
    const syncPathname = () => setPathname(currentPathname());
    window.addEventListener("popstate", syncPathname);
    window.addEventListener(SIGNALNEST_NAVIGATION_EVENT, syncPathname);
    return () => {
      window.removeEventListener("popstate", syncPathname);
      window.removeEventListener(SIGNALNEST_NAVIGATION_EVENT, syncPathname);
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      const resolvedTheme = theme === "system" ? (media.matches ? "dark" : "light") : theme;
      document.documentElement.dataset.theme = resolvedTheme;
      document.documentElement.dataset.themePreference = theme;
    };

    applyTheme();
    document.documentElement.dataset.density = density;
    document.documentElement.dataset.motion = animationsEnabled ? "on" : "reduced";
    document.documentElement.style.setProperty("--accent", accent);
    media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, [accent, animationsEnabled, density, theme]);

  useEffect(() => {
    document.title = page.title === "SignalNest" ? "SignalNest" : `${page.title} | SignalNest`;
  }, [page.title]);

  return (
    <Suspense fallback={<LoadingScreen />}>
      {page.shell ? (
        <AppShell currentPath={pathname} currentTitle={page.title}>
          {page.component}
        </AppShell>
      ) : (
        page.component
      )}
    </Suspense>
  );
}
