import { Archive, ImagePlus, ListFilter, Trash2, Upload } from "lucide-react";
import { ChangeEvent, useMemo, useRef, useState } from "react";
import { Button } from "../components/Button";
import { PageIntro } from "../components/PageIntro";
import { useAppStore } from "../stores/useAppStore";
import type { VaultItem } from "../types";

export function ResearchVault() {
  const vaultItems = useAppStore((state) => state.vaultItems);
  const addVaultItem = useAppStore((state) => state.addVaultItem);
  const updateVaultItem = useAppStore((state) => state.updateVaultItem);
  const deleteVaultItem = useAppStore((state) => state.deleteVaultItem);
  const captureSnapshot = useAppStore((state) => state.captureSnapshot);
  const pushToast = useAppStore((state) => state.pushToast);
  const [query, setQuery] = useState("");
  const [collection, setCollection] = useState("All");
  const [selectedId, setSelectedId] = useState(vaultItems[0]?.id ?? "");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const collections = useMemo(() => ["All", ...Array.from(new Set(vaultItems.map((item) => item.collection)))], [vaultItems]);
  const filtered = useMemo(
    () =>
      vaultItems.filter((item) => {
        const matchesCollection = collection === "All" || item.collection === collection;
        const matchesQuery = `${item.title} ${item.tags.join(" ")} ${item.collection}`.toLowerCase().includes(query.toLowerCase());
        return matchesCollection && matchesQuery;
      }),
    [collection, query, vaultItems],
  );
  const selectedItem = vaultItems.find((item) => item.id === selectedId) ?? filtered[0];

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    addVaultItem({
      id: `vault-${Date.now()}`,
      title: file.name,
      kind: file.type.startsWith("image/") ? "image" : "bookmark",
      collection: "Uploads",
      tags: ["upload", file.name.split(".").pop() ?? "file"],
      updated: "Just now",
      excerpt: `${Math.round(file.size / 1024)} KB uploaded into the local research vault index.`,
    });
    pushToast({ title: "Vault item uploaded", body: file.name, tone: "success" });
    event.target.value = "";
  }

  function addNote() {
    if (!noteTitle.trim() || !noteBody.trim()) return;
    const item: VaultItem = {
      id: `vault-${Date.now()}`,
      title: noteTitle.trim(),
      kind: "note",
      collection: collection === "All" ? "Market notes" : collection,
      tags: ["note", "manual"],
      updated: "Just now",
      excerpt: noteBody.trim(),
    };
    addVaultItem(item);
    setSelectedId(item.id);
    setNoteTitle("");
    setNoteBody("");
    pushToast({ title: "Note saved", body: item.title, tone: "success" });
  }

  return (
    <div className="grid gap-4">
      <PageIntro
        eyebrow="Research Vault"
        title="Save, filter, inspect, and annotate evidence."
        body="Collection filters, uploads, snapshots, manual notes, and item actions all update the local vault index immediately."
      />
      <div className="grid gap-4 xl:grid-cols-[280px_1fr_360px]">
      <aside className="panel rounded-lg p-4">
        <div className="mb-4 flex items-center gap-2 font-bold text-white"><Archive className="h-4 w-4 text-cyan" /> Collections</div>
        {collections.map((item) => (
          <button key={item} onClick={() => setCollection(item)} className={`mb-1 flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition ${collection === item ? "bg-cyan/10 text-cyan" : "text-slate-400 hover:bg-white/[0.055] hover:text-white"}`}>
            {item}<span className="text-xs text-slate-600">{item === "All" ? vaultItems.length : vaultItems.filter((record) => record.collection === item).length}</span>
          </button>
        ))}
        <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
        <Button className="mt-4 w-full" variant="secondary" icon={<Upload className="h-4 w-4" />} onClick={() => fileRef.current?.click()}>Upload</Button>
        <div className="mt-4 rounded-md border border-white/10 bg-white/[0.035] p-3">
          <div className="mb-3 text-sm font-bold text-white">Quick note</div>
          <input value={noteTitle} onChange={(event) => setNoteTitle(event.target.value)} className="mb-2 w-full rounded-md border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-cyan/40" placeholder="Note title" />
          <textarea value={noteBody} onChange={(event) => setNoteBody(event.target.value)} className="mb-2 min-h-24 w-full rounded-md border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-cyan/40" placeholder="What did you learn?" />
          <Button className="w-full" variant="primary" onClick={addNote} disabled={!noteTitle.trim() || !noteBody.trim()}>Save note</Button>
        </div>
      </aside>
      <section className="grid gap-4">
        <div className="panel flex flex-wrap items-center gap-3 rounded-lg p-4">
          <ListFilter className="h-4 w-4 text-cyan" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-slate-500" placeholder="Filter vault by title, collection, or tag" />
          <Button variant="primary" icon={<ImagePlus className="h-4 w-4" />} onClick={captureSnapshot}>Capture snapshot</Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <article key={item.id} className={`panel rounded-lg p-4 transition hover:-translate-y-1 hover:border-cyan/30 ${selectedItem?.id === item.id ? "border-cyan/30 bg-cyan/5" : ""}`}>
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-slate-400">{item.kind}</span>
                <span className="text-xs text-slate-500">{item.updated}</span>
              </div>
              <button onClick={() => setSelectedId(item.id)} className="text-left font-bold text-white hover:text-cyan">{item.title}</button>
              <p className="mt-2 text-sm leading-6 text-slate-400">{item.excerpt}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.tags.map((tag) => <span key={tag} className="rounded border border-cyan/20 bg-cyan/10 px-2 py-1 text-xs text-cyan">#{tag}</span>)}
              </div>
            </article>
          ))}
        </div>
        {filtered.length === 0 && <div className="panel rounded-lg p-4 text-sm text-slate-400">No vault records match this filter.</div>}
      </section>
      <aside className="panel rounded-lg p-4">
        <h3 className="mb-2 font-bold text-white">Inspector</h3>
        {selectedItem ? (
          <div className="grid gap-3">
            <div className="rounded-md border border-white/10 bg-black/20 p-3">
              <div className="text-xs uppercase text-slate-500">{selectedItem.kind} / {selectedItem.collection}</div>
              <div className="mt-2 font-bold text-white">{selectedItem.title}</div>
              <p className="mt-2 text-sm leading-6 text-slate-400">{selectedItem.excerpt}</p>
            </div>
            <Button variant="secondary" onClick={() => updateVaultItem(selectedItem.id, { tags: Array.from(new Set([...selectedItem.tags, "reviewed"])) })}>Mark reviewed</Button>
            <Button variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={() => deleteVaultItem(selectedItem.id)}>Delete item</Button>
          </div>
        ) : (
          <p className="text-sm text-slate-400">Select a vault record to inspect it.</p>
        )}
      </aside>
      </div>
    </div>
  );
}
