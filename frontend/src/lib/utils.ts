import { clsx, type ClassValue } from "clsx";
import type { SignalEvent } from "../types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function severityClass(severity: SignalEvent["severity"]) {
  return {
    low: "text-cyan border-cyan/25 bg-cyan/10",
    medium: "text-blue border-blue/25 bg-blue/10",
    high: "text-amber border-amber/25 bg-amber/10",
    critical: "text-rose-300 border-rose-300/25 bg-rose-400/10",
  }[severity];
}

export function sparklinePath(values: number[], width = 150, height = 46) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1 || 1)) * width;
      const y = height - ((value - min) / span) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}
