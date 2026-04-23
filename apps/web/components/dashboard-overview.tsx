import { DemandChart, RiskBreakdownChart } from "@/components/charts";
import { AssistantPanel } from "@/components/assistant-panel";
import { InventoryTable, PredictionStack, SupplierRiskTable } from "@/components/tables";
import { getDashboardInsights, getDashboardSummary } from "@/lib/api";
import { Card, CardDescription, CardTitle, MetricCard } from "@supplychain/ui";

export async function DashboardOverview() {
  const [summary, insights] = await Promise.all([
    getDashboardSummary(),
    getDashboardInsights(),
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-slate-950 px-6 py-8 text-white">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">
              Production-ready control tower
            </div>
            <h2 className="max-w-3xl text-4xl font-semibold tracking-tight">
              Forecast earlier, replenish smarter, and explain every AI recommendation with traceable business context.
            </h2>
            <p className="max-w-2xl text-sm text-slate-300">
              SupplyPilot unifies planning, supplier monitoring, logistics prediction, and predictive maintenance inside one multi-tenant SaaS stack.
            </p>
          </div>
          <Card className="bg-white/10 text-white shadow-none ring-1 ring-white/10">
            <CardTitle className="text-white">Today&apos;s AI brief</CardTitle>
            <CardDescription className="text-slate-300">
              Stockout risk is concentrated in industrial valves, two suppliers need action, and west-coast inbound lead time drift increased again.
            </CardDescription>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary.metrics.map((metric) => (
          <MetricCard
            key={metric.title}
            delta={metric.delta}
            description={metric.description}
            title={metric.title}
            tone={metric.tone as "neutral" | "info" | "warning" | "critical" | "success"}
            value={metric.value}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="mb-4">
            <CardTitle>Demand forecast accuracy and trend</CardTitle>
            <CardDescription>Actual demand versus model forecast over the latest six periods.</CardDescription>
          </div>
          <DemandChart data={summary.demandSeries} />
        </Card>
        <Card>
          <div className="mb-4">
            <CardTitle>Risk composition</CardTitle>
            <CardDescription>Distribution of critical alerts by operational pillar.</CardDescription>
          </div>
          <RiskBreakdownChart data={summary.riskBreakdown} />
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <InventoryTable rows={insights.inventory} />
        <SupplierRiskTable rows={insights.suppliers} />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <PredictionStack
          description="Shipments most likely to miss SLA commitments."
          rows={insights.logistics}
          title="Logistics prediction"
        />
        <PredictionStack
          description="Assets likely to fail without preventive action."
          rows={insights.maintenance}
          title="Predictive maintenance"
        />
        <AssistantPanel />
      </section>
    </div>
  );
}
