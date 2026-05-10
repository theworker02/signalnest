import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  icon?: ReactNode;
  tooltip?: string;
}

export function Button({ className, variant = "secondary", icon, children, tooltip, title, ...props }: ButtonProps) {
  const ariaLabel = typeof props["aria-label"] === "string" ? props["aria-label"] : undefined;
  const textLabel = typeof children === "string" ? children : undefined;
  const tooltipText = tooltip ?? (typeof title === "string" ? title : undefined) ?? ariaLabel ?? textLabel;

  return (
    <button
      className={cn(
        "ui-tooltip inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "accent-shadow border-cyan/30 bg-cyan/15 text-cyan hover:bg-cyan/20",
        variant === "secondary" && "surface-muted border text-slate-100 hover:border-cyan/30 hover:bg-white/[0.08]",
        variant === "ghost" && "border-transparent bg-transparent text-slate-300 hover:bg-white/[0.06] hover:text-white",
        variant === "danger" && "border-rose-300/20 bg-rose-400/10 text-rose-200 hover:bg-rose-400/15",
        className,
      )}
      data-tooltip={tooltipText}
      title={title}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
