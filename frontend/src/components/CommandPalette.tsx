import Fuse from "fuse.js";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Clock3, Command, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useHardNavigate } from "../lib/hardNavigation";
import { searchableRecords } from "../data/mockData";
import { useAppStore } from "../stores/useAppStore";
import { Button } from "./Button";

const resultVariants = {
  hidden: { opacity: 0, y: 8 },
  show: (index: number) => ({ opacity: 1, y: 0, transition: { delay: index * 0.025, duration: 0.16 } }),
};

export function CommandPalette() {
  const navigate = useHardNavigate();
  const open = useAppStore((state) => state.commandOpen);
  const setOpen = useAppStore((state) => state.setCommandOpen);
  const history = useAppStore((state) => state.searchHistory);
  const addHistory = useAppStore((state) => state.addSearchHistory);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const fuse = useMemo(
    () =>
      new Fuse(searchableRecords, {
        keys: ["title", "type", "tags"],
        threshold: 0.32,
        includeScore: true,
      }),
    [],
  );
  const results = query.trim()
    ? fuse.search(query).slice(0, 8).map((item) => item.item)
    : searchableRecords.slice(0, 8);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActive(0);
    }
  }, [open]);

  function execute(index = active) {
    const record = results[index];
    if (!record) return;
    if (record.id === "toggle-theme") toggleTheme();
    addHistory(query || record.title);
    navigate(record.to);
    setOpen(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-[10vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.16 } }}
        >
          <motion.div
            className="panel modal-sheen w-full max-w-3xl overflow-hidden rounded-xl"
            initial={{ opacity: 0, y: 34, scale: 0.96, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 22, scale: 0.97, filter: "blur(6px)" }}
            transition={{ type: "spring", stiffness: 360, damping: 32, mass: 0.8 }}
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <Search className="h-5 w-5 text-cyan" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setActive((value) => Math.min(results.length - 1, value + 1));
                  }
                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setActive((value) => Math.max(0, value - 1));
                  }
                  if (event.key === "Enter") execute();
                }}
                placeholder="Search routes, trackers, vault, alerts, tags, commands..."
                className="w-full bg-transparent text-base text-white placeholder:text-slate-500 outline-none"
              />
              <Button variant="ghost" icon={<X className="h-4 w-4" />} onClick={() => setOpen(false)} aria-label="Close search" />
            </div>
            <motion.div className="grid gap-2 p-3" initial="hidden" animate="show">
              {results.map((record, index) => (
                <motion.button
                  key={record.id}
                  custom={index}
                  variants={resultVariants}
                  onClick={() => execute(index)}
                  onMouseEnter={() => setActive(index)}
                  className={`flex items-center justify-between rounded-md border px-3 py-3 text-left transition ${
                    index === active ? "border-cyan/30 bg-cyan/10" : "border-transparent hover:bg-white/[0.05]"
                  }`}
                >
                  <span>
                    <span className="block font-semibold text-white">{record.title}</span>
                    <span className="text-xs text-slate-400">{record.type} · {record.tags.join(", ")}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </motion.button>
              ))}
            </motion.div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-2">
                <Command className="h-3.5 w-3.5" />
                <kbd className="keycap">Ctrl</kbd><kbd className="keycap">K</kbd>
                <span>open</span>
                <kbd className="keycap">↑</kbd><kbd className="keycap">↓</kbd>
                <span>move</span>
                <kbd className="keycap">Enter</kbd>
                <span>open result</span>
              </span>
              <span className="inline-flex items-center gap-2"><Clock3 className="h-3.5 w-3.5" /> {history.slice(0, 3).join(" · ")}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
