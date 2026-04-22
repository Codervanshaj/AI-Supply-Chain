import { AppShell } from "@/components/app-shell";
import { getForecasts } from "@/lib/api";
import { Badge, Card, CardDescription, CardTitle } from "@supplychain/ui";

export default async function ForecastingPage() {
  const data = await getForecasts();

  return (
    <AppShell currentPath="/forecasting">
      <div className="space-y-6">
        <Card className="space-y-3">
          <CardTitle>Forecasting workspace</CardTitle>
          <CardDescription>
            Live forecast runs with confidence bands, model type, and explanation drivers from the backend.
          </CardDescription>
        </Card>
        <div className="grid gap-6 lg:grid-cols-2">
          {data.forecasts.map((forecast) => (
            <Card key={`${forecast.productId}-${forecast.locationId}`} className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>{forecast.productId}</CardTitle>
                  <CardDescription>
                    Horizon {forecast.horizonDays} days • {forecast.modelType}
                  </CardDescription>
                </div>
                <Badge variant="info">{Math.round(forecast.confidence * 100)}% confidence</Badge>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="text-slate-500">Predicted</div>
                  <div className="mt-1 text-xl font-semibold text-slate-900">{forecast.predictedDemand}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="text-slate-500">Lower</div>
                  <div className="mt-1 text-xl font-semibold text-slate-900">{forecast.lowerBound}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="text-slate-500">Upper</div>
                  <div className="mt-1 text-xl font-semibold text-slate-900">{forecast.upperBound}</div>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900">Narrative</div>
                <p className="mt-2 text-sm text-slate-600">
                  {forecast.explanation?.narrative ?? "Demand explanation is available through feature drivers below."}
                </p>
              </div>
              <div className="space-y-2">
                {(forecast.explanation?.drivers ?? []).map((driver) => (
                  <div key={driver.feature} className="rounded-2xl border border-slate-100 p-3 text-sm">
                    <div className="font-medium text-slate-900">{driver.feature}</div>
                    <div className="mt-1 text-slate-600">
                      {driver.explanation ?? `Estimated impact ${Math.round((driver.impact ?? 0) * 100)}%.`}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
