import { AnimatePresence, motion } from "framer-motion";
import { Bot, Gauge, RadioTower, Send, Sparkles, User, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { signalEvents, trackers } from "../data/mockData";
import { useAppStore } from "../stores/useAppStore";
import { Button } from "./Button";

type ChatMessage = {
  id: string;
  role: "agent" | "user";
  body: string;
};

const suggestions = [
  "What should I monitor next?",
  "Summarize current risks",
  "Help me create a weather alert",
  "Explain API pricing",
];

function agentReply(prompt: string) {
  const text = prompt.toLowerCase();
  const activeTrackers = trackers.filter((tracker) => !tracker.archived);
  const highRisk = activeTrackers.filter((tracker) => ["high", "critical"].includes(tracker.severity));

  if (text.includes("weather") || text.includes("barometer") || text.includes("pressure")) {
    return "For weather operations, I would watch NOAA active alerts, AQI station changes, FAA ground stops, utility outage feeds, and pressure movement. Start with a high-priority alert when pressure falls quickly while flood, wind, or transit signals are also active.";
  }

  if (text.includes("risk") || text.includes("summarize") || text.includes("status")) {
    return `Current workspace read: ${activeTrackers.length} active monitors, ${highRisk.length} elevated sources, and ${signalEvents.length} recent events in the stream. I would triage critical outage/weather items first, then review medium-severity product and policy changes.`;
  }

  if (text.includes("pricing") || text.includes("api")) {
    return "API pricing should stay separate from the free extension marketplace. Keep developer pricing on the API pricing page, and keep marketplace installs free with no checkout path.";
  }

  if (text.includes("monitor") || text.includes("track")) {
    return "A strong monitor needs a source, refresh interval, priority, and tags. Useful examples: official alert feeds, status pages, release feeds, public datasets, regulatory pages, outage maps, weather APIs, and high-value competitor pages.";
  }

  if (text.includes("alert")) {
    return "A production alert should include a clear condition, priority, mute window, escalation target, and a short reason. Example: pressure_delta <= -2 hPa AND flood_risk >= medium, priority high, mute window never.";
  }

  return "I can help plan monitors, alerts, weather signals, developer docs, API usage, and workspace cleanup. Tell me the source or outcome you care about, and I will turn it into a concrete SignalNest workflow.";
}

export function AgentChat() {
  const open = useAppStore((state) => state.aiAgentOpen);
  const setOpen = useAppStore((state) => state.setAiAgentOpen);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "agent",
      body: "I am your SignalNest agent. Ask me to plan monitors, summarize live risk, draft alerts, or explain how the workspace should be configured.",
    },
  ]);
  const listRef = useRef<HTMLDivElement>(null);
  const messageIndex = useRef(0);
  const responseTimer = useRef<number | null>(null);

  const contextStats = useMemo(() => {
    const active = trackers.filter((tracker) => !tracker.archived);
    const critical = active.filter((tracker) => tracker.severity === "critical").length;
    return [
      { label: "Active monitors", value: String(active.length), icon: RadioTower },
      { label: "Critical", value: String(critical), icon: Gauge },
      { label: "Events", value: String(signalEvents.length), icon: Sparkles },
    ];
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    return () => {
      if (responseTimer.current) window.clearTimeout(responseTimer.current);
    };
  }, []);

  function sendMessage(value = input) {
    const prompt = value.trim();
    if (!prompt || typing) return;
    messageIndex.current += 1;
    const userMessage: ChatMessage = { id: `user-${messageIndex.current}`, role: "user", body: prompt };
    const replyIndex = messageIndex.current;
    setMessages((items) => [...items, userMessage]);
    setInput("");
    setTyping(true);

    if (responseTimer.current) window.clearTimeout(responseTimer.current);
    const delay = Math.min(1450, Math.max(620, prompt.length * 18));
    responseTimer.current = window.setTimeout(() => {
      const response: ChatMessage = { id: `agent-${replyIndex}`, role: "agent", body: agentReply(prompt) };
      setMessages((items) => [...items, response]);
      setTyping(false);
      responseTimer.current = null;
    }, delay);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    sendMessage();
  }

  function addLocalModeNote() {
    if (typing) return;
    messageIndex.current += 1;
    const replyIndex = messageIndex.current;
    setTyping(true);
    responseTimer.current = window.setTimeout(() => {
      setMessages((items) => [
        ...items,
        {
          id: `agent-mode-${replyIndex}`,
          role: "agent",
          body: `Local workspace mode is active. I am reading the current UI dataset: ${contextStats[0].value} monitors, ${contextStats[1].value} critical signals, and ${contextStats[2].value} recent events. No remote model call is required for these operational suggestions.`,
        },
      ]);
      setTyping(false);
      responseTimer.current = null;
    }, 720);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-3 pb-3 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.16 } }}
        >
          <motion.section
            className="panel modal-sheen flex h-[min(720px,92vh)] w-full max-w-4xl flex-col overflow-hidden rounded-xl"
            role="dialog"
            aria-modal="true"
            aria-label="SignalNest AI agent chat"
            initial={{ opacity: 0, y: 28, scale: 0.97, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 18, scale: 0.98, filter: "blur(6px)" }}
            transition={{ type: "spring", stiffness: 360, damping: 32, mass: 0.8 }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-cyan/25 bg-cyan/10 text-cyan">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white">SignalNest Agent</div>
                  <div className="flex min-w-0 items-center gap-2 truncate text-xs text-slate-500">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${typing ? "loading-pulse bg-cyan" : "bg-emerald-300"}`} />
                    <span className="truncate">{typing ? "Composing an operational answer..." : "Workspace-aware assistant for monitors, alerts, docs, and signal workflows"}</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" icon={<X className="h-4 w-4" />} onClick={() => setOpen(false)} aria-label="Close agent chat" />
            </div>

            <div className="grid min-h-0 flex-1 lg:grid-cols-[230px_minmax(0,1fr)]">
              <aside className="hidden border-r border-white/10 p-3 lg:block">
                <div className="grid gap-2">
                  {contextStats.map((stat) => (
                    <div key={stat.label} className="rounded-md border border-white/10 bg-black/20 p-3">
                      <stat.icon className="mb-3 h-4 w-4 text-cyan" />
                      <div className="text-xs text-slate-500">{stat.label}</div>
                      <div className="mt-1 text-2xl font-black text-white">{stat.value}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 rounded-md border border-white/10 bg-white/[0.035] p-3 text-xs leading-5 text-slate-400">
                  Local agent mode is active. Responses are generated from the current SignalNest workspace context and UI data.
                </div>
              </aside>

              <div className="flex min-h-0 flex-col">
                <div ref={listRef} className="scrollbar-thin flex-1 overflow-y-auto p-4">
                  <div className="grid gap-3">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.18 }}
                      >
                        {message.role === "agent" && (
                          <div className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-md border border-cyan/25 bg-cyan/10 text-cyan">
                            <Bot className="h-4 w-4" />
                          </div>
                        )}
                        <div className={`max-w-[78%] rounded-lg border px-3 py-2 text-sm leading-6 ${message.role === "user" ? "border-cyan/25 bg-cyan/10 text-white" : "border-white/10 bg-white/[0.045] text-slate-200"}`}>
                          {message.body}
                        </div>
                        {message.role === "user" && (
                          <div className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-md border border-white/10 bg-white/[0.045] text-slate-300">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                    {typing && (
                      <motion.div
                        className="flex justify-start gap-3"
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.16 }}
                      >
                        <div className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-md border border-cyan/25 bg-cyan/10 text-cyan">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/[0.045] px-3 py-2 text-sm text-slate-300">
                          <div className="flex items-center gap-2">
                            <span>typing</span>
                            <span className="flex items-center gap-1" aria-label="Agent is typing">
                              <span className="agent-typing-dot" />
                              <span className="agent-typing-dot [animation-delay:120ms]" />
                              <span className="agent-typing-dot [animation-delay:240ms]" />
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="border-t border-white/10 p-3">
                  <div className="mb-3 flex flex-wrap gap-2">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => sendMessage(suggestion)}
                        disabled={typing}
                        className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-cyan/30 hover:text-cyan disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                  <form onSubmit={submit} className="flex gap-2">
                    <input
                      autoFocus
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      className="min-w-0 flex-1 rounded-md border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
                      placeholder={typing ? "SignalNest Agent is typing..." : "Ask the agent about monitors, alerts, docs, or weather signals..."}
                      disabled={typing}
                    />
                    <Button type="submit" variant="primary" icon={<Send className="h-4 w-4" />} disabled={!input.trim() || typing} tooltip="Send message">
                      <span className="hidden sm:inline">Send</span>
                    </Button>
                  </form>
                  <button
                    type="button"
                    onClick={addLocalModeNote}
                    disabled={typing}
                    className="mt-2 text-xs font-semibold text-slate-500 transition hover:text-cyan disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Local workspace agent
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
