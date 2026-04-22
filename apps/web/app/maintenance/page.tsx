import { AppShell } from "@/components/app-shell";
import { PredictionStack } from "@/components/tables";
import { getMaintenancePredictions } from "@/lib/api";
import { Card, CardDescription, CardTitle, MetricCard } from "@supplychain/ui";

export default async function MaintenancePage() {
  const maintenance = await getMaintenancePredictions();

  return (
    <AppShell currentPath="/maintenance">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            title="Monitored assets"
            value={String(maintenance.length)}
            delta="Scored assets"
            description="Assets currently tracked by the maintenance model."
            tone="info"
          />
          <MetricCard
            title="High failure risk"
            value={String(maintenance.filter((item) => item.riskLevel === "high" || item.riskLevel === "critical").length)}
            delta="Preventive action"
            description="Assets requiring urgent intervention."
            tone="critical"
          />
          <MetricCard
            title="Peak failure probability"
            value={`${Math.round(Math.max(...maintenance.map((item) => item.failureProbability), 0) * 100)}%`}
            delta="Most exposed asset"
            description="Highest predicted failure likelihood."
            tone="warning"
          />
        </div>
        <Card className="space-y-3">
          <CardTitle>Predictive maintenance</CardTitle>
          <CardDescription>
            Live failure-risk results and suggested next actions are now shown here.
          </CardDescription>
        </Card>
        <PredictionStack
          title="Asset risk watchlist"
          description="Most exposed assets from the live predictive maintenance service."
          rows={maintenance}
        />
      </div>
    </AppShell>
  );
}
