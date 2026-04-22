import { AppShell } from "@/components/app-shell";
import { Card, CardDescription, CardTitle } from "@supplychain/ui";

export default function InventoryPage() {
  return (
    <AppShell currentPath="/inventory">
      <Card className="space-y-3">
        <CardTitle>Inventory optimization</CardTitle>
        <CardDescription>
          Reorder point calculations, safety stock, EOQ, and projected stockout monitoring are exposed through this module.
        </CardDescription>
      </Card>
    </AppShell>
  );
}

