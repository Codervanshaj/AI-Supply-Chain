import { AppShell } from "@/components/app-shell";
import { Card, CardDescription, CardTitle } from "@supplychain/ui";

export default function SuppliersPage() {
  return (
    <AppShell currentPath="/suppliers">
      <Card className="space-y-3">
        <CardTitle>Supplier intelligence</CardTitle>
        <CardDescription>
          Risk scoring, factor-level explanations, and mitigation recommendations are surfaced here.
        </CardDescription>
      </Card>
    </AppShell>
  );
}

