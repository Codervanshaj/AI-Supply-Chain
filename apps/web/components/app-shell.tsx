import Link from "next/link";
import { Bot, Boxes, ChartColumnIncreasing, Package, ShieldAlert, Truck, Wrench } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { cn } from "@supplychain/ui";

const nav = [
  { href: "/", label: "Overview", icon: ChartColumnIncreasing },
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
    <div className="min-h-screen bg-hero-grid">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="rounded-[2rem] border border-white/60 bg-slate-950 p-6 text-slate-50 shadow-2xl">
          <div className="mb-8">
            <div className="mb-3 inline-flex rounded-full bg-sky-400/20 px-3 py-1 text-xs font-semibold text-sky-200">
              AI Supply Chain Control Tower
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">SupplyPilot</h1>
            <p className="mt-2 text-sm text-slate-400">
              Predict demand, optimize inventory, explain risk, and act faster.
            </p>
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
                    active ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white",
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
        <main className="rounded-[2rem] border border-slate-200/80 bg-white/70 p-4 backdrop-blur lg:p-6">
          <div className="mb-6 flex items-center justify-end">
            {clerkEnabled ? (
              <>
                <SignedIn>
                  <UserButton />
                </SignedIn>
                <SignedOut>
                  <div className="flex items-center gap-3">
                    <SignInButton mode="modal">
                      <button className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-medium text-white">
                        Sign in
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-slate-900 ring-1 ring-slate-200">
                        Create account
                      </button>
                    </SignUpButton>
                  </div>
                </SignedOut>
              </>
            ) : (
              <div className="rounded-full bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600">
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
