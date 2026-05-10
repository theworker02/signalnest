import { motion } from "framer-motion";
import { Bot, ChevronsLeft, ChevronsRight, Code2, Command, Monitor, Moon, Plus, Search, ShoppingBag, Sun } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { navItems, workspaces } from "../data/mockData";
import { useHardNavigate } from "../lib/hardNavigation";
import { Link } from "../lib/navigation";
import { cn } from "../lib/utils";
import { useAppStore } from "../stores/useAppStore";
import { Button } from "./Button";
import { AgentChat } from "./AgentChat";
import { CommandPalette } from "./CommandPalette";
import { ToastStack } from "./ToastStack";

type AppShellProps = {
  children: ReactNode;
  currentPath: string;
  currentTitle: string;
};

export function AppShell({ children, currentPath, currentTitle }: AppShellProps) {
  const navigate = useHardNavigate();
  const collapsed = useAppStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const setCommandOpen = useAppStore((state) => state.setCommandOpen);
  const setAiAgentOpen = useAppStore((state) => state.setAiAgentOpen);
  const density = useAppStore((state) => state.density);
  const currentUserEmail = useAppStore((state) => state.currentUserEmail);
  const activeWorkspaceId = useAppStore((state) => state.activeWorkspaceId);
  const setActiveWorkspace = useAppStore((state) => state.setActiveWorkspace);
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);

  const current = currentTitle;
  const nextTheme = theme === "dark" ? "light" : theme === "light" ? "system" : "dark";
  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const normalizedKey = event.key.toLowerCase();
      const item =
        navItems.find((navItem) => navItem.shortcut.toLowerCase() === `alt ${normalizedKey}`) ??
        navItems[normalizedKey === "0" ? 9 : Number(normalizedKey) - 1];
      if (!item) return;
      event.preventDefault();
      navigate(item.to);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  return (
    <div className={cn("app-root grain min-h-screen text-slate-100", density === "compact" && "text-[14px]", density === "terminal" && "text-[13px]")}>
      <div className="flex min-h-screen">
        <aside className={cn("shell-chrome sticky top-0 hidden h-screen shrink-0 border-r transition-all duration-300 md:block", collapsed ? "w-[76px]" : "w-[292px]")}>
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
              <Link to="/" className="ui-tooltip grid h-10 w-10 place-items-center rounded-md border border-cyan/30 bg-cyan/10 p-1.5 text-cyan" data-tooltip="Open landing page">
                <img src="/signalnest-icon.svg" alt="SignalNest" className="h-full w-full" />
              </Link>
              {!collapsed && (
                <div className="min-w-0">
                  <div className="font-bold tracking-tight text-white">SignalNest</div>
                </div>
              )}
              <button onClick={toggleSidebar} className="ui-tooltip ml-auto rounded-md p-2 text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Toggle sidebar" data-tooltip="Collapse or expand sidebar">
                {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
              </button>
            </div>
            {!collapsed && (
              <div className="border-b border-white/10 p-3">
                <button
                  onClick={() => setCommandOpen(true)}
                  className="ui-tooltip surface-muted flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left text-sm text-slate-300 transition hover:border-cyan/30 hover:bg-cyan/10"
                  data-tooltip="Search routes, signals, trackers, and records"
                >
                  <Search className="h-4 w-4 text-cyan" />
                  Search signals
                </button>
              </div>
            )}
            <nav className="scrollbar-thin flex-1 overflow-y-auto p-3">
              {!collapsed && <div className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Pinned systems</div>}
              <div className="grid gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={
                      cn(
                        "ui-tooltip group flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition",
                        (item.to === "/app" ? currentPath === "/app" : currentPath === item.to) ? "border-cyan/30 bg-cyan/10 text-white" : "border-transparent text-slate-400 hover:bg-white/[0.055] hover:text-white",
                        collapsed && "justify-center px-2",
                      )
                    }
                    title={collapsed ? item.label : undefined}
                    data-tooltip={item.label}
                    data-tooltip-side={collapsed ? "right" : undefined}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
                  </Link>
                ))}
              </div>
              {!collapsed && (
                <div className="mt-6">
                  <div className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Workspaces</div>
                  <div className="grid gap-1">
                    {workspaces.map((workspace) => (
                      <button
                        key={workspace.id}
                        onClick={() => {
                          setActiveWorkspace(workspace.id);
                          navigate("/app/workspace");
                        }}
                        data-tooltip={`Open ${workspace.name} workspace`}
                        className={`ui-tooltip flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition ${
                          activeWorkspaceId === workspace.id ? "bg-cyan/10 text-white" : "text-slate-400 hover:bg-white/[0.055] hover:text-white"
                        }`}
                      >
                        <span className={cn("activity-dot h-2 w-2 rounded-full", workspace.status === "critical" ? "bg-rose-300 text-rose-300" : workspace.status === "active" ? "bg-cyan text-cyan" : "bg-slate-500 text-slate-500")} />
                        <span className="truncate">{workspace.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </nav>
            <div className="border-t border-white/10 p-3">
              <Button className="w-full" variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => navigate("/app/monitoring")} tooltip="Create a new monitor">
                {!collapsed && "New tracker"}
              </Button>
              {!collapsed && <div className="mt-3 truncate text-xs text-slate-500">{currentUserEmail ?? "No active account"}</div>}
            </div>
          </div>
        </aside>
        <main className="min-w-0 flex-1 pb-32 md:pb-0">
          <header className="shell-chrome sticky top-0 z-30 flex flex-col gap-3 border-b px-4 py-3 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between md:px-6">
            <div className="min-w-0">
              <div className="text-xs text-slate-500">Workspace / {current}</div>
              <h1 className="truncate text-lg font-bold text-white md:text-xl">{current}</h1>
            </div>
            <div className="grid grid-cols-5 gap-2 sm:flex sm:items-center">
              <Link to="/app/skills" className={cn("ui-tooltip inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition", currentPath === "/app/skills" ? "border-cyan/30 bg-cyan/15 text-cyan shadow-glow" : "border-white/10 bg-white/[0.045] text-slate-100 hover:border-cyan/30 hover:bg-white/[0.08]")} data-tooltip="Open the skill marketplace" aria-label="Open skills">
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden lg:inline">Skills</span>
              </Link>
              <Link to="/app/developers" className={cn("ui-tooltip inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition", currentPath === "/app/developers" ? "border-cyan/30 bg-cyan/15 text-cyan shadow-glow" : "border-white/10 bg-white/[0.045] text-slate-100 hover:border-cyan/30 hover:bg-white/[0.08]")} data-tooltip="Manage API keys and developer access" aria-label="Open developers">
                <Code2 className="h-4 w-4" />
                <span className="hidden lg:inline">Developers</span>
              </Link>
              <Button variant="secondary" icon={<Bot className="h-4 w-4" />} onClick={() => setAiAgentOpen(true)} tooltip="Ask the SignalNest AI agent" aria-label="Open AI agent chat">
                <span className="hidden lg:inline">Ask</span>
              </Button>
              <Button variant="secondary" icon={<Command className="h-4 w-4" />} onClick={() => setCommandOpen(true)} tooltip="Open global command and search" aria-label="Open command palette">
                <span className="hidden lg:inline">Command</span>
              </Button>
              <button
                type="button"
                onClick={() => setTheme(nextTheme)}
                className="ui-tooltip inline-flex h-10 w-10 items-center justify-center bg-transparent text-slate-400 transition hover:text-cyan"
                data-tooltip={`Switch to ${nextTheme} theme`}
                aria-label={`Theme: ${theme}. Switch to ${nextTheme} theme`}
              >
                <ThemeIcon className="h-4 w-4" />
              </button>
            </div>
          </header>
          <motion.div key={currentPath} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} className="p-4 md:p-6">
            {children}
          </motion.div>
        </main>
        <nav className="shell-chrome fixed inset-x-0 bottom-0 z-40 w-full overflow-hidden border-t md:hidden">
          <div className="grid grid-cols-5 gap-1 px-2 py-2">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={
                  cn(
                    "flex min-w-0 flex-col items-center justify-center gap-1 rounded-md border px-1.5 py-2 text-[10px] font-semibold transition",
                    (item.to === "/app" ? currentPath === "/app" : currentPath === item.to) ? "border-cyan/30 bg-cyan/10 text-white" : "border-transparent text-slate-400 hover:bg-white/[0.055] hover:text-white",
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
      <AgentChat />
      <CommandPalette />
      <ToastStack />
    </div>
  );
}
