import Link from "next/link";
import { ArrowRight, Bot, Boxes, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Badge, Button, Card, CardDescription, CardTitle } from "@supplychain/ui";

export default function LandingPage() {
  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  return (
    <main className="min-h-screen bg-hero-grid px-4 py-6">
      <div className="mx-auto max-w-[1400px] space-y-8">
        <section className="rounded-[2rem] border border-slate-200 bg-white/80 p-5 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">
                AI Supply Chain Platform
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 lg:text-5xl">
                Turn your supply chain data into decisions, forecasts, and actions.
              </h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <SignedIn>
                <Link href="/dashboard">
                  <Button className="gap-2">
                    Open Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </SignedIn>
              <SignedOut>
                {clerkEnabled ? (
                  <>
                    <SignInButton mode="modal">
                      <Button>Sign in</Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button variant="secondary">Create account</Button>
                    </SignUpButton>
                  </>
                ) : (
                  <Link href="/dashboard">
                    <Button className="gap-2">
                      Enter Demo Workspace
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </SignedOut>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <Card className="overflow-hidden bg-slate-950 text-white">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                <Badge variant="info" className="bg-white/10 text-sky-200">
                  Live planning, risk, logistics, and maintenance
                </Badge>
                <h2 className="text-4xl font-semibold tracking-tight">
                  One control tower for demand, inventory, supplier risk, logistics, and AI copiloting.
                </h2>
                <p className="max-w-2xl text-sm text-slate-300">
                  The product now includes a public landing page, protected dashboard, live API-backed module pages,
                  assistant mode visibility, and admin actions for operational workflows.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link href="/dashboard">
                    <Button className="gap-2">
                      View dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/assistant">
                    <Button variant="secondary">Try assistant</Button>
                  </Link>
                </div>
              </div>
              <div className="space-y-3 rounded-[1.5rem] bg-white/10 p-5">
                {[
                  "Live dashboards backed by Railway API",
                  "Forecast and ingestion actions from admin",
                  "OpenAI/fallback assistant status visibility",
                  "Clerk-ready auth with public landing page",
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-100">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </Card>
          <div className="grid gap-4">
            {[
              {
                icon: Bot,
                title: "AI Assistant",
                body: "Explains predictions, highlights risk, and now shows whether responses are coming from live OpenAI or fallback mode.",
              },
              {
                icon: Boxes,
                title: "Operational Modules",
                body: "Forecasting, inventory, suppliers, logistics, maintenance, and reports now display live backend-fed content.",
              },
              {
                icon: Truck,
                title: "Execution Layer",
                body: "Admin includes trigger actions so the app feels operational instead of just a static dashboard shell.",
              },
              {
                icon: ShieldCheck,
                title: "Secure Entry",
                body: "Public homepage first. Clerk-protected workspace second. Demo mode still works when auth is not configured.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="space-y-3">
                  <Icon className="h-5 w-5 text-sky-600" />
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.body}</CardDescription>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="space-y-3">
            <CardTitle>Start Here</CardTitle>
            <CardDescription>
              Use the landing page as the public entry point. Send authenticated users into the workspace.
            </CardDescription>
          </Card>
          <Card className="space-y-3">
            <CardTitle>Use Real Data</CardTitle>
            <CardDescription>
              Tabs now read from the API and show live module data whenever Railway is reachable.
            </CardDescription>
          </Card>
          <Card className="space-y-3">
            <CardTitle>Operate the App</CardTitle>
            <CardDescription>
              Admin now supports live actions like forecast runs and ingestion event posting.
            </CardDescription>
          </Card>
        </section>
      </div>
    </main>
  );
}
