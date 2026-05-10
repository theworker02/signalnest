import { Activity, Columns3, EyeOff, LayoutGrid, PanelBottom, Plus, Save, Trash2, Undo2, UsersRound } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Button } from "../components/Button";
import { PageIntro } from "../components/PageIntro";
import { Sparkline } from "../components/Sparkline";
import { workspaces } from "../data/mockData";
import { severityClass } from "../lib/utils";
import { useAppStore } from "../stores/useAppStore";

const workspaceModes = ["overview", "investigation", "presentation"] as const;

export function Workspace() {
  const layout = useAppStore((state) => state.layout);
  const trackers = useAppStore((state) => state.trackers).filter((tracker) => !tracker.archived);
  const updateLayout = useAppStore((state) => state.updateLayout);
  const saveWorkspaceSnapshot = useAppStore((state) => state.saveWorkspaceSnapshot);
  const workspaceSnapshotSavedAt = useAppStore((state) => state.workspaceSnapshotSavedAt);
  const activeWorkspaceId = useAppStore((state) => state.activeWorkspaceId);
  const setActiveWorkspace = useAppStore((state) => state.setActiveWorkspace);
  const activityLog = useAppStore((state) => state.activityLog);
  const workspaceMode = useAppStore((state) => state.workspaceMode);
  const setWorkspaceMode = useAppStore((state) => state.setWorkspaceMode);
  const workspaceViews = useAppStore((state) => state.workspaceViews);
  const addWorkspaceView = useAppStore((state) => state.addWorkspaceView);
  const removeWorkspaceView = useAppStore((state) => state.removeWorkspaceView);
  const addActivity = useAppStore((state) => state.addActivity);
  const pushToast = useAppStore((state) => state.pushToast);
  const autoSaveEnabled = useAppStore((state) => state.autoSaveEnabled);
  const privacyMode = useAppStore((state) => state.privacyMode);
  const activeWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId) ?? workspaces[0];
  const [viewName, setViewName] = useState("");
  const [focusTag, setFocusTag] = useState("all");
  const [selectedPanel, setSelectedPanel] = useState("Monitor surface");

  const tags = useMemo(() => ["all", ...Array.from(new Set(trackers.flatMap((tracker) => tracker.tags)))], [trackers]);
  const visibleTrackers = focusTag === "all" ? trackers : trackers.filter((tracker) => tracker.tags.includes(focusTag));
  const masked = (value: string) => privacyMode ? "Masked source" : value;

  function updateAndAutosave(next: Partial<typeof layout>) {
    updateLayout(next);
    if (autoSaveEnabled) {
      addActivity("Autosaved workspace layout");
      pushToast({ title: "Workspace autosaved", body: "Layout controls were persisted locally.", tone: "success" });
    }
  }

  function saveView(event: FormEvent) {
    event.preventDefault();
    if (!viewName.trim()) return;
    addWorkspaceView(viewName.trim());
    setViewName("");
  }

  return (
    <div className="grid gap-4">
      <PageIntro
        eyebrow="Workspace"
        title="Design an operating room for each topic."
        body="Switch workspaces, change operating modes, resize panels, save named views, filter signals, and replay activity. Layout settings persist locally."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" icon={<Undo2 className="h-4 w-4" />} onClick={() => updateAndAutosave({ left: 34, right: 33, bottom: true })}>Reset</Button>
            <Button variant="primary" icon={<Save className="h-4 w-4" />} onClick={saveWorkspaceSnapshot}>Save layout</Button>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr_1fr]">
        <section className="panel rounded-lg p-4">
          <div className="mb-3 flex items-center gap-2 font-bold text-white"><LayoutGrid className="h-4 w-4 text-cyan" /> Operating mode</div>
          <div className="grid grid-cols-3 gap-2">
            {workspaceModes.map((mode) => (
              <button key={mode} onClick={() => setWorkspaceMode(mode)} className={`rounded-md border px-2 py-2 text-sm font-semibold ${workspaceMode === mode ? "border-cyan/30 bg-cyan/10 text-cyan" : "border-white/10 text-slate-300 hover:bg-white/[0.06]"}`}>{mode}</button>
            ))}
          </div>
        </section>
        <section className="panel rounded-lg p-4">
          <div className="mb-3 flex items-center gap-2 font-bold text-white"><Activity className="h-4 w-4 text-cyan" /> Focus filter</div>
          <select value={focusTag} onChange={(event) => setFocusTag(event.target.value)} className="w-full rounded-md border border-white/10 bg-black/25 px-3 py-2 text-white outline-none">
            {tags.map((tag) => <option key={tag}>{tag}</option>)}
          </select>
        </section>
        <section className="panel rounded-lg p-4">
          <div className="mb-2 flex items-center gap-2 font-bold text-white"><EyeOff className="h-4 w-4 text-cyan" /> Workspace state</div>
          <div className="text-sm leading-6 text-slate-400">
            Autosave {autoSaveEnabled ? "on" : "off"} / privacy {privacyMode ? "masked" : "normal"} / {workspaceSnapshotSavedAt ? `saved ${workspaceSnapshotSavedAt}` : "not saved yet"}
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <label className="panel rounded-lg p-4">
          <span className="mb-2 block text-sm text-slate-400">Left panel width: {layout.left}%</span>
          <input type="range" min="24" max="48" value={layout.left} onChange={(event) => updateAndAutosave({ left: Number(event.target.value) })} className="w-full" />
        </label>
        <label className="panel rounded-lg p-4">
          <span className="mb-2 block text-sm text-slate-400">Right panel width: {layout.right}%</span>
          <input type="range" min="22" max="45" value={layout.right} onChange={(event) => updateAndAutosave({ right: Number(event.target.value) })} className="w-full" />
        </label>
        <button onClick={() => updateAndAutosave({ bottom: !layout.bottom })} className="panel flex items-center gap-3 rounded-lg p-4 text-left hover:border-cyan/30">
          <PanelBottom className="h-5 w-5 text-cyan" />
          <span><span className="block font-bold text-white">Bottom event panel</span><span className="text-sm text-slate-400">{layout.bottom ? "Visible" : "Hidden"}</span></span>
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[300px_1fr_340px]">
        <section className="panel rounded-lg p-4">
          <h3 className="mb-2 font-bold text-white">Workspace switcher</h3>
          <p className="mb-4 text-sm leading-6 text-slate-400">Choose the topic area you want the panels to represent.</p>
          {workspaces.map((workspace) => (
            <button
              key={workspace.id}
              onClick={() => setActiveWorkspace(workspace.id)}
              className={`mb-2 w-full rounded-md border p-3 text-left transition ${
                activeWorkspaceId === workspace.id ? "border-cyan/30 bg-cyan/10" : "border-white/10 bg-white/[0.035] hover:bg-white/[0.06]"
              }`}
            >
              <div className="flex min-w-0 items-center justify-between gap-3">
                <span className="min-w-0 truncate font-semibold text-white">{workspace.name}</span>
                <span className={`shrink-0 rounded border px-2 py-0.5 text-[11px] ${workspace.status === "critical" ? "border-rose-300/25 bg-rose-400/10 text-rose-300" : workspace.status === "active" ? "border-cyan/25 bg-cyan/10 text-cyan" : "border-white/10 bg-white/[0.04] text-slate-400"}`}>{workspace.status}</span>
              </div>
              <div className="mt-1 truncate text-xs text-slate-500">{workspace.boards.join(" / ")}</div>
            </button>
          ))}

          <form onSubmit={saveView} className="mt-5 rounded-md border border-white/10 bg-white/[0.035] p-3">
            <div className="mb-2 font-bold text-white">Save named view</div>
            <div className="flex gap-2">
              <input value={viewName} onChange={(event) => setViewName(event.target.value)} className="min-w-0 flex-1 rounded-md border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none" placeholder="War room" />
              <Button type="submit" variant="primary" icon={<Plus className="h-4 w-4" />} disabled={!viewName.trim()} aria-label="Save named workspace view" />
            </div>
          </form>
        </section>

        <section className="panel rounded-lg p-4">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="mb-1 font-bold text-white">{activeWorkspace.name}</h3>
              <p className="text-sm text-slate-400">{workspaceMode} mode / {visibleTrackers.length} visible monitors</p>
            </div>
            <div className="flex gap-2">
              {["Monitor surface", "Diff console", "Alert desk"].map((panel) => (
                <button key={panel} onClick={() => setSelectedPanel(panel)} className={`rounded-md border px-3 py-2 text-xs font-semibold ${selectedPanel === panel ? "border-cyan/30 bg-cyan/10 text-cyan" : "border-white/10 text-slate-400 hover:bg-white/[0.06]"}`}>{panel}</button>
              ))}
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {visibleTrackers.slice(0, workspaceMode === "presentation" ? 2 : 6).map((tracker) => (
              <div key={tracker.id} className="rounded-md border border-white/10 bg-black/20 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-white">{privacyMode ? "Private monitor" : tracker.title}</div>
                    <div className="text-xs text-slate-500">{masked(tracker.source)}</div>
                  </div>
                  <span className={`rounded border px-2 py-0.5 text-[11px] ${severityClass(tracker.severity)}`}>{tracker.health}%</span>
                </div>
                <Sparkline values={tracker.sparkline} />
              </div>
            ))}
            {visibleTrackers.length === 0 && <div className="rounded-md border border-amber/20 bg-amber/10 p-4 text-sm text-amber">No monitors match this focus filter.</div>}
          </div>
        </section>

        <section className="grid gap-4">
          <div className="panel rounded-lg p-4">
            <h3 className="mb-3 flex items-center gap-2 font-bold text-white"><UsersRound className="h-4 w-4 text-cyan" /> Presence</h3>
            {["Matthias", "Ops desk", "Research"].map((name, index) => (
              <button key={name} onClick={() => addActivity(`${name} focused ${selectedPanel}`)} className="mb-3 flex w-full items-center gap-3 rounded-md border border-white/10 bg-white/[0.035] p-2 text-left hover:border-cyan/30">
                <span className="grid h-8 w-8 place-items-center rounded-full border border-cyan/20 bg-cyan/10 text-xs text-cyan">{name[0]}</span>
                <span className="text-sm text-slate-300">{privacyMode && index === 0 ? "You" : name}</span>
                <span className="ml-auto text-xs text-slate-500">{index === 0 ? "editing" : "viewing"}</span>
              </button>
            ))}
          </div>
          <div className="panel rounded-lg p-4">
            <h3 className="mb-3 flex items-center gap-2 font-bold text-white"><Columns3 className="h-4 w-4 text-cyan" /> Saved views</h3>
            {workspaceViews.map((view) => (
              <div key={view} className="mb-2 flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.035] p-2">
                <button onClick={() => addActivity(`Loaded workspace view ${view}`)} className="min-w-0 flex-1 truncate text-left text-sm text-slate-300 hover:text-white">{view}</button>
                <button onClick={() => removeWorkspaceView(view)} className="rounded p-1 text-slate-500 hover:bg-white/10 hover:text-rose-200" aria-label={`Remove ${view}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {layout.bottom && (
        <section className="panel rounded-lg p-4">
          <h3 className="mb-3 font-bold text-white">Activity replay</h3>
          <div className="grid gap-2 md:grid-cols-4">
            {activityLog.map((entry, index) => <div key={`${entry}-${index}`} className="rounded border border-white/10 bg-white/[0.035] p-3 text-sm text-slate-300">{entry}</div>)}
          </div>
        </section>
      )}
    </div>
  );
}
