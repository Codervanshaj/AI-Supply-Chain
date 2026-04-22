import { AppShell } from "@/components/app-shell";
import { Card, CardDescription, CardTitle } from "@supplychain/ui";

export default function LogisticsPage() {
  return (
    <AppShell currentPath="/logistics">
      <Card className="space-y-3">
        <CardTitle>Logistics prediction</CardTitle>
        <CardDescription>
          Route-level delay probabilities, carrier risk signals, and SLA breach summaries are managed here.
        </CardDescription>
      </Card>
    </AppShell>
  );
}

