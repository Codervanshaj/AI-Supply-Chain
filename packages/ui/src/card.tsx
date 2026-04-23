import type { PropsWithChildren } from "react";
import { cn } from "./utils";

export function Card({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-6 shadow-[0_30px_90px_-45px_rgba(2,12,27,0.85)] backdrop-blur-xl",
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
    <h3 className={cn("text-base font-semibold tracking-tight text-[var(--text-main)]", className)}>
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return <p className={cn("text-sm text-[var(--text-muted)]", className)}>{children}</p>;
}
