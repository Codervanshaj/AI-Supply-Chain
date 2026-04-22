import type { PropsWithChildren } from "react";
import { cn } from "./utils";

export function Card({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.4)] backdrop-blur",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <h3 className={cn("text-base font-semibold tracking-tight text-slate-900", className)}>
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return <p className={cn("text-sm text-slate-500", className)}>{children}</p>;
}

