import { AppShell } from "@/components/app-shell";
import { Card, CardDescription, CardTitle } from "@supplychain/ui";

export default function ForecastingPage() {
  return (
    <AppShell currentPath="/forecasting">
      <Card className="space-y-3">
        <CardTitle>Forecasting workspace</CardTitle>
        <CardDescription>
          Per-SKU and per-location forecasts, confidence intervals, feature drivers, and model freshness controls live here.
        </CardDescription>
      </Card>
    </AppShell>
  );
}

