"use client";

import { startTransition, useState } from "react";
import { postIngestionEvent, runForecasts, uploadIngestionFile } from "@/lib/api";
import { Badge, Button, Card, CardDescription, CardTitle } from "@supplychain/ui";

const DEFAULT_EVENT = {
  sku: "VALVE-100",
  location: "BLR-DC",
  onHand: 91,
  reserved: 21,
  inTransit: 10,
  snapshotDate: "2026-04-28",
  source: "erp-sync",
};

export function AdminConsole() {
  const [forecastStatus, setForecastStatus] = useState<string>("Idle");
  const [ingestionStatus, setIngestionStatus] = useState<string>("Idle");
  const [uploadStatus, setUploadStatus] = useState<string>("No file uploaded yet.");
  const [lastEvent, setLastEvent] = useState<string>("No event posted yet.");
  const [entity, setEntity] = useState("inventory_snapshot");
  const [eventPayload, setEventPayload] = useState(JSON.stringify(DEFAULT_EVENT, null, 2));
  const [running, setRunning] = useState(false);

  function triggerForecastRun() {
    setRunning(true);
    startTransition(async () => {
      try {
        const result = await runForecasts();
        setForecastStatus(`Ran ${result.forecasts.length} forecasts successfully.`);
      } catch (error) {
        setForecastStatus(error instanceof Error ? error.message : "Forecast run failed. Check Railway API logs.");
      } finally {
        setRunning(false);
      }
    });
  }

  function sendEvent() {
    setRunning(true);
    startTransition(async () => {
      try {
        const parsed = JSON.parse(eventPayload) as Record<string, unknown>;
        const result = await postIngestionEvent({ entity, payload: parsed });
        setIngestionStatus(`Event ${result.operation} completed for ${result.entity} (${result.recordId}).`);
        setLastEvent(JSON.stringify(parsed, null, 2));
      } catch (error) {
        setIngestionStatus(error instanceof Error ? error.message : "Ingestion event failed. Check API connectivity.");
      } finally {
        setRunning(false);
      }
    });
  }

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setRunning(true);
    startTransition(async () => {
      try {
        const result = await uploadIngestionFile(file);
        setUploadStatus(
          `Processed ${result.processed} events from ${result.filename} (${result.bytes} bytes). Entities: ${JSON.stringify(result.entities)}.`,
        );
      } catch (error) {
        setUploadStatus(error instanceof Error ? error.message : "Upload failed.");
      } finally {
        setRunning(false);
      }
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Card className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Planning jobs</CardTitle>
            <CardDescription>
              Trigger a fresh forecasting cycle and push the latest planner outputs back into the workspace.
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
            <CardTitle>ERP event ingestion</CardTitle>
            <CardDescription>
              Post structured operational events from ERP, WMS, or OMS and persist them in the control-tower data model.
            </CardDescription>
          </div>
          <Badge variant="warning">Live API</Badge>
        </div>
        <select
          className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-white outline-none"
          onChange={(event) => setEntity(event.target.value)}
          value={entity}
        >
          <option value="inventory_snapshot">inventory_snapshot</option>
          <option value="product_master">product_master</option>
          <option value="demand_observation">demand_observation</option>
          <option value="supplier">supplier</option>
          <option value="shipment">shipment</option>
        </select>
        <textarea
          className="h-48 rounded-2xl border border-white/8 bg-white/5 px-4 py-3 font-mono text-xs text-white outline-none"
          onChange={(event) => setEventPayload(event.target.value)}
          value={eventPayload}
        />
        <Button disabled={running} onClick={sendEvent} variant="secondary">
          {running ? "Posting..." : "Send ingestion event"}
        </Button>
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">{ingestionStatus}</div>
        <pre className="overflow-auto rounded-2xl border border-slate-100 p-4 text-xs text-slate-500">{lastEvent}</pre>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>JSON / NDJSON intake</CardTitle>
            <CardDescription>
              Upload JSON arrays or newline-delimited JSON files to bulk ingest ERP events in one operation.
            </CardDescription>
          </div>
          <Badge variant="success">Upload</Badge>
        </div>
        <label className="rounded-2xl border border-dashed border-white/14 bg-white/5 px-4 py-8 text-center text-sm text-slate-300">
          <input accept="application/json,.json,.ndjson" className="hidden" onChange={handleFileUpload} type="file" />
          Choose JSON or NDJSON file
        </label>
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">{uploadStatus}</div>
      </Card>
    </div>
  );
}
