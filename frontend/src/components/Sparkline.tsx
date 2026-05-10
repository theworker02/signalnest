import { sparklinePath } from "../lib/utils";

export function Sparkline({ values, color = "#4ad7ff" }: { values: number[]; color?: string }) {
  const path = sparklinePath(values);
  return (
    <svg viewBox="0 0 150 46" className="h-12 w-full overflow-visible" role="img" aria-label="Activity sparkline">
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d={`${path} L 150 46 L 0 46 Z`} fill={color} opacity="0.08" />
    </svg>
  );
}
