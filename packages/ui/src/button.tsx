import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "./utils";

const variants = {
  primary: "bg-slate-900 text-white hover:bg-slate-800",
  secondary: "bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50",
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
        "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

