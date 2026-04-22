import type { PropsWithChildren } from "react";
import { cn } from "./utils";

const variants = {
  neutral: "bg-slate-100 text-slate-700",
  info: "bg-sky-100 text-sky-700",
  warning: "bg-amber-100 text-amber-700",
  critical: "bg-rose-100 text-rose-700",
  success: "bg-emerald-100 text-emerald-700",
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
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

