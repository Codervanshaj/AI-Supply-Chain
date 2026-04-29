import { AppShell } from "@/components/app-shell";
import { InventoryWorkbench } from "@/components/inventory-workbench";
import { InventoryTable } from "@/components/tables";
import { getInventoryRecommendations } from "@/lib/api";
import { Card, CardDescription, CardTitle, MetricCard } from "@supplychain/ui";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const inventory = await getInventoryRecommendations();
  const critical = inventory.filter((item) => item.urgency === "critical").length;

  return (
    <AppShell currentPath="/inventory">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            title="Recommendations"
            value={String(inventory.length)}
            delta="Live queue"
            description="Open reorder recommendations from the optimization service."
            tone="info"
          />
          <MetricCard
            title="Critical SKUs"
            value={String(critical)}
            delta="Needs action"
            description="Items likely to stock out inside the lead-time window."
            tone="critical"
          />
          <MetricCard
            title="Average confidence"
            value={`${Math.round((inventory.reduce((sum, item) => sum + item.confidence, 0) / Math.max(inventory.length, 1)) * 100)}%`}
            delta="Model backed"
            description="Confidence attached to recommendation quality."
            tone="success"
          />
        </div>
        <Card className="space-y-3">
          <CardTitle>Inventory optimization</CardTitle>
          <CardDescription>
            Buyers can filter the action queue and convert recommended quantities into a replenishment plan.
          </CardDescription>
        </Card>
        <InventoryWorkbench rows={inventory} />
        <InventoryTable rows={inventory} />
      </div>
    </AppShell>
  );
}
