import { AppShell } from "@/components/app-shell";
import { ForecastStudio } from "@/components/forecast-studio";
import { getForecasts } from "@/lib/api";
import { Badge, Card, CardDescription, CardTitle } from "@supplychain/ui";

export default async function ForecastingPage() {
  const data = await getForecasts();

  return (
    <AppShell currentPath="/forecasting">
      <div className="space-y-6">
        <Card className="space-y-3 bg-[linear-gradient(135deg,rgba(12,24,42,0.95),rgba(8,16,29,0.92))]">
          <CardTitle>Forecasting workspace</CardTitle>
          <CardDescription>
            Operations teams can refresh forecast runs, model upside scenarios, and turn predictions into planning inputs.
          </CardDescription>
          <div className="pt-2">
            <Badge variant="info">Live + interactive</Badge>
          </div>
        </Card>
        <ForecastStudio initialForecasts={data.forecasts} />
      </div>
    </AppShell>
  );
}
