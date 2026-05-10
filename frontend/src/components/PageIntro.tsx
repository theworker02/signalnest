import type { ReactNode } from "react";

export function PageIntro({
  eyebrow,
  title,
  body,
  action,
}: {
  eyebrow: string;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="panel flex flex-wrap items-start justify-between gap-4 rounded-lg p-4">
      <div className="max-w-3xl">
        <div className="text-sm font-semibold text-cyan">{eyebrow}</div>
        <h2 className="mt-1 text-2xl font-black text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">{body}</p>
      </div>
      {action}
    </div>
  );
}
