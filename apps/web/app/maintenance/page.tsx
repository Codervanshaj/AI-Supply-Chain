import { AppShell } from "@/components/app-shell";
import { Card, CardDescription, CardTitle } from "@supplychain/ui";

export default function MaintenancePage() {
  return (
    <AppShell currentPath="/maintenance">
      <Card className="space-y-3">
        <CardTitle>Predictive maintenance</CardTitle>
        <CardDescription>
          Failure risk models, maintenance prioritization, and asset health explanations appear in this workspace.
        </CardDescription>
      </Card>
    </AppShell>
  );
}

