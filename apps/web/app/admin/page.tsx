import { AppShell } from "@/components/app-shell";
import { Card, CardDescription, CardTitle } from "@supplychain/ui";

export default function AdminPage() {
  return (
    <AppShell currentPath="/admin">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-3">
          <CardTitle>Tenant admin</CardTitle>
          <CardDescription>
            Organization settings, members, roles, API ingestion keys, and audit history would be managed here.
          </CardDescription>
        </Card>
        <Card className="space-y-3">
          <CardTitle>Ops controls</CardTitle>
          <CardDescription>
            Model retraining, report generation, dataset seeding, and pipeline status controls would be surfaced here.
          </CardDescription>
        </Card>
      </div>
    </AppShell>
  );
}

