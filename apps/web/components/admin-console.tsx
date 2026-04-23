"use client";

import { startTransition, useState } from "react";
import { postIngestionEvent, runForecasts, uploadIngestionFile } from "@/lib/api";
import { Badge, Button, Card, CardDescription, CardTitle } from "@supplychain/ui";

export function AdminConsole() {
  const [forecastStatus, setForecastStatus] = useState<string>("Idle");
  const [ingestionStatus, setIngestionStatus] = useState<string>("Idle");
  const [uploadStatus, setUploadStatus] = useState<string>("No file uploaded yet.");
  const [lastEvent, setLastEvent] = useState<string>("No event posted yet.");
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
        setUploadStatus(`Uploaded ${result.filename} (${result.bytes} bytes). Status: ${result.status}.`);
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
            <CardTitle>Data event post</CardTitle>
            <CardDescription>
              Send an inventory update into the ingestion API and verify the backend is accepting operational events.
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

      <Card className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>CSV or file intake</CardTitle>
            <CardDescription>
              Upload a file into the ingestion endpoint so teams can validate the intake pipeline from the UI.
            </CardDescription>
          </div>
          <Badge variant="success">Upload</Badge>
        </div>
        <label className="rounded-2xl border border-dashed border-white/14 bg-white/5 px-4 py-8 text-center text-sm text-slate-300">
          <input className="hidden" onChange={handleFileUpload} type="file" />
          Choose a CSV or data file
        </label>
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">{uploadStatus}</div>
      </Card>
    </div>
  );
}
