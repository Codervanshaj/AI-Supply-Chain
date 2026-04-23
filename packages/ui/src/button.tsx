import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "./utils";

const variants = {
  primary: "bg-cyan-400 text-slate-950 hover:bg-cyan-300",
  secondary: "bg-white/5 text-slate-100 ring-1 ring-white/10 hover:bg-white/10",
};

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: keyof typeof variants;
  }
>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
