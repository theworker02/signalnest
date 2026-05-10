import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from "lucide-react";
import { useEffect } from "react";
import { useAppStore } from "../stores/useAppStore";
import type { ToastMessage } from "../types";

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  danger: XCircle,
};

const tones: Record<ToastMessage["tone"], string> = {
  info: "border-cyan/25 bg-cyan/10 text-cyan",
  success: "border-emerald-300/25 bg-emerald-400/10 text-emerald-200",
  warning: "border-amber/25 bg-amber/10 text-amber",
  danger: "border-rose-300/25 bg-rose-400/10 text-rose-200",
};

export function ToastStack() {
  const toasts = useAppStore((state) => state.toasts);
  const dismissToast = useAppStore((state) => state.dismissToast);
  const notificationDurationMs = useAppStore((state) => state.notificationDurationMs ?? 4000);

  return (
    <div className="fixed bottom-4 right-4 z-[60] grid w-[min(380px,calc(100vw-2rem))] gap-2">
      <AnimatePresence>
        {toasts.map((toast) => <ToastCard key={toast.id} toast={toast} durationMs={notificationDurationMs} onDismiss={dismissToast} />)}
      </AnimatePresence>
    </div>
  );
}

function ToastCard({ toast, durationMs, onDismiss }: { toast: ToastMessage; durationMs: number; onDismiss: (id: string) => void }) {
  const Icon = icons[toast.tone];

  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), durationMs);
    return () => window.clearTimeout(timer);
  }, [durationMs, onDismiss, toast.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      className={`rounded-lg border p-3 shadow-glow ${tones[toast.tone]}`}
    >
      <div className="flex gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="font-bold text-white">{toast.title}</div>
          {toast.body && <div className="mt-1 text-sm leading-5 text-slate-300">{toast.body}</div>}
        </div>
        <button onClick={() => onDismiss(toast.id)} className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Dismiss notification">
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
