import type {
  AIQueryRequest,
  ApiEnvelope,
  AssetFailurePrediction,
  ForecastApiResult,
  ReorderRecommendation,
  ReportItem,
  ShipmentDelayPrediction,
  SupplierRiskScore,
  SystemStatus,
} from "@supplychain/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function fetcher<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  }).catch(() => null);

  if (!response || !response.ok) {
    const errorText = response ? await response.text().catch(() => "") : "";
    throw new Error(errorText || `Failed to fetch ${path}`);
  }

  const payload = (await response.json()) as ApiEnvelope<T>;
  return payload.data;
}

async function appFetcher<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && !(init?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, {
    ...init,
    headers,
  }).catch(() => null);

  if (!response || !response.ok) {
    const contentType = response?.headers.get("Content-Type") ?? "";
    if (response && contentType.includes("application/json")) {
      const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
      const message = payload?.errors?.[0]?.message;
      throw new Error(message || `Failed to fetch ${path}`);
    }
    const errorText = response ? await response.text().catch(() => "") : "";
    throw new Error(errorText || `Failed to fetch ${path}`);
  }

  const payload = (await response.json()) as ApiEnvelope<T>;
  return payload.data;
}

export function getDashboardSummary() {
  return fetcher<{
    metrics: { title: string; value: string; delta: string; description: string; tone: string }[];
    demandSeries: { period: string; forecast: number; actual: number }[];
    riskBreakdown: { name: string; value: number }[];
  }>("/dashboard/summary");
}

export function getDashboardInsights() {
  return fetcher<{
    inventory: ReorderRecommendation[];
    suppliers: SupplierRiskScore[];
    logistics: ShipmentDelayPrediction[];
    maintenance: AssetFailurePrediction[];
  }>("/dashboard/insights");
}

export async function queryAssistant(query: string) {
  const payload: AIQueryRequest = { query };
  return appFetcher<{ answer: string; mode: string }>("/api/ai/query", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getForecasts() {
  return fetcher<{ forecasts: ForecastApiResult[] }>("/forecast");
}

export function getInventoryRecommendations() {
  return fetcher<ReorderRecommendation[]>("/inventory/recommendations");
}

export function getSupplierRisk() {
  return fetcher<SupplierRiskScore[]>("/suppliers/risk");
}

export function getLogisticsPredictions() {
  return fetcher<ShipmentDelayPrediction[]>("/logistics/predictions");
}

export function getMaintenancePredictions() {
  return fetcher<AssetFailurePrediction[]>("/maintenance/predictions");
}

export function getReports() {
  return fetcher<ReportItem[]>("/reports");
}

export function getSystemStatus() {
  return fetcher<SystemStatus>("/health/status");
}

export async function runForecasts() {
  return appFetcher<{ forecasts: ForecastApiResult[] }>("/api/forecast/run", {
    method: "POST",
  });
}

export async function postIngestionEvent(payload: {
  entity: string;
  payload: Record<string, unknown>;
}) {
  return appFetcher<{ status: string; entity: string; recordId: string; operation: string }>("/api/ingestion/events", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function uploadIngestionFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/ingestion/upload", {
    method: "POST",
    body: formData,
  }).catch(() => null);

  if (!response || !response.ok) {
    const errorText = response ? await response.text().catch(() => "") : "";
    throw new Error(errorText || "File upload failed.");
  }

  const payload = (await response.json()) as ApiEnvelope<{
    filename: string;
    bytes: number;
    status: string;
    processed: number;
    entities: Record<string, number>;
  }>;
  return payload.data;
}
