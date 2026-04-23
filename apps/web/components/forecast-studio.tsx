"use client";

import { startTransition, useMemo, useState } from "react";
import type { ForecastApiResult } from "@supplychain/types";
import { Badge, Button, Card, CardDescription, CardTitle } from "@supplychain/ui";
import { runForecasts } from "@/lib/api";

export function ForecastStudio({ initialForecasts }: { initialForecasts: ForecastApiResult[] }) {
  const [forecasts, setForecasts] = useState(initialForecasts);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [uplift, setUplift] = useState(8);
  const [seasonality, setSeasonality] = useState(5);
  const [status, setStatus] = useState("Live forecast data loaded.");
  const [running, setRunning] = useState(false);

  const selected = forecasts[Math.min(selectedIndex, Math.max(forecasts.length - 1, 0))];

  const scenario = useMemo(() => {
    if (!selected) {
      return null;
    }
    const multiplier = 1 + uplift / 100 + seasonality / 200;
    const adjusted = Math.round(selected.predictedDemand * multiplier);
    const gap = adjusted - selected.predictedDemand;
    return {
      adjusted,
      gap,
      lower: Math.round(selected.lowerBound * multiplier),
      upper: Math.round(selected.upperBound * multiplier),
    };
  }, [selected, uplift, seasonality]);

  function handleRunForecasts() {
    setRunning(true);
    startTransition(async () => {
      try {
        const result = await runForecasts();
        setForecasts(result.forecasts);
        setStatus(`Forecasts refreshed successfully. ${result.forecasts.length} product-location lanes rescored.`);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Forecast run failed. Check Railway API and browser network logs.");
      } finally {
        setRunning(false);
      }
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Scenario studio</CardTitle>
            <CardDescription>
              Re-run live forecasts and stress test demand assumptions before buyers commit to replenishment.
            </CardDescription>
          </div>
          <Badge variant="info">Planner</Badge>
        </div>
        <Button disabled={running} onClick={handleRunForecasts}>
          {running ? "Refreshing..." : "Run live forecast job"}
        </Button>
        <div className="rounded-2xl bg-white/5 p-4 text-sm text-slate-300 ring-1 ring-white/8">{status}</div>
        <div className="space-y-3">
          {forecasts.map((forecast, index) => (
            <button
              key={`${forecast.productId}-${forecast.locationId}`}
              className={`w-full rounded-2xl border p-4 text-left transition ${
                selectedIndex === index
                  ? "border-cyan-400/40 bg-cyan-400/10"
                  : "border-white/8 bg-white/5 hover:bg-white/8"
              }`}
              onClick={() => setSelectedIndex(index)}
              type="button"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium text-white">{forecast.productName}</div>
                  <div className="mt-1 text-sm text-slate-400">
                    {forecast.sku} • {forecast.locationName} • {forecast.modelType}
                  </div>
                </div>
                <Badge variant="success">{Math.round(forecast.confidence * 100)}%</Badge>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>What-if demand planning</CardTitle>
            <CardDescription>
              Use live forecast outputs as the baseline, then model commercial uplift and seasonal pressure.
            </CardDescription>
          </div>
          <Badge variant="warning">What-if</Badge>
        </div>
        {selected ? (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/8">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Baseline</div>
                <div className="mt-2 text-3xl font-semibold text-white">{selected.predictedDemand}</div>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/8">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Scenario</div>
                <div className="mt-2 text-3xl font-semibold text-cyan-300">{scenario?.adjusted}</div>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/8">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Range</div>
                <div className="mt-2 text-lg font-semibold text-white">
                  {scenario?.lower} - {scenario?.upper}
                </div>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/8">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Delta</div>
                <div className="mt-2 text-3xl font-semibold text-amber-300">{scenario?.gap}</div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <label className="space-y-3">
                <div className="text-sm font-medium text-white">Commercial uplift</div>
                <input
                  className="w-full accent-cyan-400"
                  max={30}
                  min={-10}
                  onChange={(event) => setUplift(Number(event.target.value))}
                  type="range"
                  value={uplift}
                />
                <div className="text-sm text-slate-400">{uplift}% change from campaigns, pricing, or channel expansion</div>
              </label>
              <label className="space-y-3">
                <div className="text-sm font-medium text-white">Seasonality pressure</div>
                <input
                  className="w-full accent-cyan-400"
                  max={25}
                  min={-10}
                  onChange={(event) => setSeasonality(Number(event.target.value))}
                  type="range"
                  value={seasonality}
                />
                <div className="text-sm text-slate-400">{seasonality}% shift from seasonal demand pattern</div>
              </label>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/5 p-5">
              <div className="text-sm font-medium text-white">Planner recommendation</div>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                If this scenario materializes, procurement should plan around <strong>{scenario?.adjusted}</strong> units
                instead of <strong>{selected.predictedDemand}</strong>, review supplier capacity, and refresh reorder
                thresholds before the next planning cycle.
              </p>
            </div>
          </>
        ) : (
          <div className="rounded-2xl bg-white/5 p-4 text-sm text-slate-300">No forecast data is available yet.</div>
        )}
      </Card>
    </div>
  );
}
