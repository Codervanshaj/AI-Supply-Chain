import { AppShell } from "@/components/app-shell";
import { Card, CardDescription, CardTitle } from "@supplychain/ui";

export default function ReportsPage() {
  return (
    <AppShell currentPath="/reports">
      <Card className="space-y-3">
        <CardTitle>Reports and exports</CardTitle>
        <CardDescription>
          Weekly AI summaries, operational report packs, and downloadable exports are queued and tracked here.
        </CardDescription>
      </Card>
    </AppShell>
  );
}

