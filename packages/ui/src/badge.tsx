import type { PropsWithChildren } from "react";
import { cn } from "./utils";

const variants = {
  neutral: "bg-white/8 text-slate-200 ring-1 ring-white/10",
  info: "bg-cyan-400/12 text-cyan-200 ring-1 ring-cyan-300/15",
  warning: "bg-amber-400/12 text-amber-200 ring-1 ring-amber-300/15",
  critical: "bg-rose-400/12 text-rose-200 ring-1 ring-rose-300/15",
  success: "bg-emerald-400/12 text-emerald-200 ring-1 ring-emerald-300/15",
};

export function Badge({
  children,
  variant = "neutral",
  className,
}: PropsWithChildren<{
  variant?: keyof typeof variants;
  className?: string;
}>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium backdrop-blur",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
