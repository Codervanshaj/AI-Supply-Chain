import Link from "next/link";
import { Bot, Boxes, ChartColumnIncreasing, Package, ShieldAlert, Truck, Wrench } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { cn } from "@supplychain/ui";

const nav = [
  { href: "/dashboard", label: "Overview", icon: ChartColumnIncreasing },
  { href: "/forecasting", label: "Forecasting", icon: ChartColumnIncreasing },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/suppliers", label: "Suppliers", icon: ShieldAlert },
  { href: "/logistics", label: "Logistics", icon: Truck },
  { href: "/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/reports", label: "Reports", icon: Boxes },
  { href: "/assistant", label: "AI Assistant", icon: Bot },
  { href: "/admin", label: "Admin", icon: Boxes },
];

export function AppShell({
  children,
  currentPath,
}: {
  children: React.ReactNode;
  currentPath: string;
}) {
  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <div className="min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-[1700px] grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-[2rem] border border-white/8 bg-[rgba(4,10,20,0.92)] p-6 text-slate-50 shadow-[0_40px_120px_-50px_rgba(0,0,0,0.9)]">
          <div className="mb-8">
            <div className="mb-3 inline-flex rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200 ring-1 ring-cyan-400/15">
              AI Supply Chain Control Tower
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">SupplyPilot</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Forecast demand, coordinate replenishment, monitor supplier risk, and operate the network from one AI-led workspace.
            </p>
          </div>
          <div className="mb-6 rounded-[1.5rem] border border-white/8 bg-white/5 p-4 text-sm text-slate-300">
            <div className="text-xs uppercase tracking-[0.25em] text-slate-500">Workspace</div>
            <div className="mt-2 font-medium text-white">Operations cockpit</div>
            <div className="mt-2 text-slate-400">Switch from dashboard review into planning and execution workflows.</div>
          </div>
          <nav className="space-y-2">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = currentPath === item.href;
              return (
                <Link
                  key={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                    active
                      ? "bg-cyan-400 text-slate-950 shadow-[0_20px_50px_-24px_rgba(34,211,238,0.7)]"
                      : "text-slate-300 hover:bg-white/8 hover:text-white",
                  )}
                  href={item.href}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="rounded-[2rem] border border-white/8 bg-[rgba(6,13,24,0.72)] p-4 backdrop-blur-xl lg:p-6">
          <div className="mb-6 flex items-center justify-end">
            {clerkEnabled ? (
              <>
                <SignedIn>
                  <UserButton />
                </SignedIn>
                <SignedOut>
                  <div className="flex items-center gap-3">
                    <SignInButton mode="modal">
                      <button className="rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-medium text-slate-950">
                        Sign in
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="rounded-2xl bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 ring-1 ring-white/10">
                        Create account
                      </button>
                    </SignUpButton>
                  </div>
                </SignedOut>
              </>
            ) : (
              <div className="rounded-full bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 ring-1 ring-white/10">
                Clerk auth ready when keys are configured
              </div>
            )}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
