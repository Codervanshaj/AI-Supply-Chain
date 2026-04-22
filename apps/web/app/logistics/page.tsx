import { AppShell } from "@/components/app-shell";
import { PredictionStack } from "@/components/tables";
import { getLogisticsPredictions } from "@/lib/api";
import { Card, CardDescription, CardTitle, MetricCard } from "@supplychain/ui";

export default async function LogisticsPage() {
  const logistics = await getLogisticsPredictions();

  return (
    <AppShell currentPath="/logistics">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            title="Tracked shipments"
            value={String(logistics.length)}
            delta="Live predictions"
            description="Shipments currently scored for delay risk."
            tone="info"
          />
          <MetricCard
            title="High risk lanes"
            value={String(logistics.filter((item) => item.riskLevel === "high" || item.riskLevel === "critical").length)}
            delta="Needs follow-up"
            description="Shipments requiring active intervention."
            tone="warning"
          />
          <MetricCard
            title="Peak delay probability"
            value={`${Math.round(Math.max(...logistics.map((item) => item.delayProbability), 0) * 100)}%`}
            delta="Worst lane"
            description="Highest predicted SLA miss risk."
            tone="critical"
          />
        </div>
        <Card className="space-y-3">
          <CardTitle>Logistics prediction</CardTitle>
          <CardDescription>
            Delay probabilities, route risk signals, and recommended mitigations are now live on this page.
          </CardDescription>
        </Card>
        <PredictionStack
          title="Delayed shipment watchlist"
          description="Most exposed shipments from the live prediction service."
          rows={logistics}
        />
      </div>
    </AppShell>
  );
}
