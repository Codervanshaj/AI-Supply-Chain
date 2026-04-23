"use client";

import { startTransition, useState } from "react";
import { postIngestionEvent, runForecasts } from "@/lib/api";
import { Badge, Button, Card, CardDescription, CardTitle } from "@supplychain/ui";

export function AdminConsole() {
  const [forecastStatus, setForecastStatus] = useState<string>("Idle");
  const [ingestionStatus, setIngestionStatus] = useState<string>("Idle");
  const [lastEvent, setLastEvent] = useState<string>("No event posted yet.");
  const [running, setRunning] = useState(false);

  function triggerForecastRun() {
    setRunning(true);
    startTransition(async () => {
      try {
        const result = await runForecasts();
        setForecastStatus(`Ran ${result.forecasts.length} forecasts successfully.`);
      } catch {
        setForecastStatus("Forecast run failed. Check Railway API logs.");
      } finally {
        setRunning(false);
      }
    });
  }

  function sendDemoEvent() {
    setRunning(true);
    startTransition(async () => {
      try {
        const payload = {
          entity: "inventory_snapshot",
          payload: {
            sku: "VALVE-100",
            location: "BLR-DC",
            onHand: 91,
            reserved: 21,
            source: "admin-demo-action",
          },
        };
        const result = await postIngestionEvent(payload);
        setIngestionStatus(`Event accepted for ${result.entity}.`);
        setLastEvent(JSON.stringify(result.payload));
      } catch {
        setIngestionStatus("Ingestion event failed. Check API connectivity.");
      } finally {
        setRunning(false);
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Forecast control</CardTitle>
            <CardDescription>
              Trigger a live forecast run through the API instead of looking at a static admin screen.
            </CardDescription>
          </div>
          <Badge variant="info">Action</Badge>
        </div>
        <Button disabled={running} onClick={triggerForecastRun}>
          {running ? "Running..." : "Run forecast job"}
        </Button>
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">{forecastStatus}</div>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Ingestion test</CardTitle>
            <CardDescription>
              Post a demo event into the ingestion API to verify the app is wired end to end.
            </CardDescription>
          </div>
          <Badge variant="warning">Live API</Badge>
        </div>
        <Button disabled={running} onClick={sendDemoEvent} variant="secondary">
          {running ? "Posting..." : "Send demo ingestion event"}
        </Button>
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">{ingestionStatus}</div>
        <div className="rounded-2xl border border-slate-100 p-4 text-xs text-slate-500">{lastEvent}</div>
      </Card>
    </div>
  );
}
