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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function fetcher<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  }).catch(() => null);

  if (!response || !response.ok) {
    throw new Error(`Failed to fetch ${path}`);
  }

  const payload = (await response.json()) as ApiEnvelope<T>;
  return payload.data;
}

export async function getDashboardSummary() {
  try {
    return await fetcher<{
      metrics: { title: string; value: string; delta: string; description: string; tone: string }[];
      demandSeries: { period: string; forecast: number; actual: number }[];
      riskBreakdown: { name: string; value: number }[];
    }>("/dashboard/summary");
  } catch {
    return {
      metrics: [
        {
          title: "Forecast confidence",
          value: "84%",
          delta: "+4.8%",
          description: "Average confidence across active forecast runs.",
          tone: "success",
        },
        {
          title: "Stockout risk",
          value: "2",
          delta: "-2 urgent SKUs",
          description: "Forecast-adjusted products inside risk window.",
          tone: "warning",
        },
        {
          title: "Supplier risk",
          value: "63",
          delta: "highest supplier score",
          description: "Top vendor risk score across strategic suppliers.",
          tone: "critical",
        },
        {
          title: "Maintenance risk",
          value: "79%",
          delta: "+1 at-risk asset",
          description: "Highest failure probability in monitored assets.",
          tone: "warning",
        },
      ],
      demandSeries: [
        { period: "W1", actual: 110, forecast: 114 },
        { period: "W2", actual: 121, forecast: 126 },
        { period: "W3", actual: 129, forecast: 133 },
        { period: "W4", actual: 135, forecast: 141 },
        { period: "W5", actual: 148, forecast: 153 },
        { period: "W6", actual: 152, forecast: 158 },
      ],
      riskBreakdown: [
        { name: "Inventory", value: 2 },
        { name: "Suppliers", value: 1 },
        { name: "Logistics", value: 2 },
        { name: "Maintenance", value: 1 },
      ],
    };
  }
}

export async function getDashboardInsights() {
  try {
    return await fetcher<{
      inventory: ReorderRecommendation[];
      suppliers: SupplierRiskScore[];
      logistics: ShipmentDelayPrediction[];
      maintenance: AssetFailurePrediction[];
    }>("/dashboard/insights");
  } catch {
    const inventory: ReorderRecommendation[] = [
      {
        productId: "1",
        productName: "Industrial Valve Assembly",
        sku: "VALVE-100",
        urgency: "critical",
        recommendedQuantity: 172,
        projectedStockoutDate: "2026-05-03",
        reasoning: "Available stock is below the forecast-adjusted reorder window.",
        confidence: 0.87,
      },
      {
        productId: "2",
        productName: "Hydraulic Pump Core",
        sku: "PUMP-450",
        urgency: "high",
        recommendedQuantity: 94,
        projectedStockoutDate: "2026-05-10",
        reasoning: "Lead time and service level target require replenishment acceleration.",
        confidence: 0.81,
      },
    ];
    const suppliers: SupplierRiskScore[] = [
      {
        supplierId: "1",
        supplierName: "Apex Components",
        riskScore: 63,
        riskLevel: "high",
        factors: [],
        recommendation: "Build alternate capacity and tighten inbound quality review.",
      },
    ];
    const logistics: ShipmentDelayPrediction[] = [
      {
        shipmentId: "1",
        shipmentNumber: "SHP-1801",
        delayProbability: 0.72,
        riskLevel: "high",
        reasoning: "Route variance and supplier delay patterns point to inbound drift.",
        recommendation: "Escalate carrier check-ins and pull contingency inventory forward.",
      },
    ];
    const maintenance: AssetFailurePrediction[] = [
      {
        assetId: "1",
        assetName: "Packaging Robot 09",
        failureProbability: 0.79,
        riskLevel: "high",
        explanation: "Runtime, downtime, and anomaly score are all elevated.",
        nextAction: "Schedule preventive inspection within 48 hours.",
      },
    ];
    return {
      inventory,
      suppliers,
      logistics,
      maintenance,
    };
  }
}

export async function queryAssistant(query: string) {
  const payload: AIQueryRequest = { query };
  return fetcher<{ answer: string; mode: string }>("/ai/query", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getForecasts() {
  try {
    return await fetcher<{ forecasts: ForecastApiResult[] }>("/forecast");
  } catch {
    return {
      forecasts: [
        {
          productId: "VALVE-100",
          locationId: "BLR-DC",
          horizonDays: 30,
          predictedDemand: 166,
          lowerBound: 151,
          upperBound: 179,
          modelType: "ensemble",
          confidence: 0.87,
          explanation: {
            narrative: "Demand is rising with stable seasonal recurrence and higher regional pull-through.",
            drivers: [
              { feature: "seasonality", impact: 0.38, explanation: "Recurring weekly pattern remains strong." },
              { feature: "recent trend", impact: 0.29, explanation: "Recent observed demand has trended upward." },
            ],
          },
        },
      ],
    };
  }
}

export async function getInventoryRecommendations() {
  try {
    return await fetcher<ReorderRecommendation[]>("/inventory/recommendations");
  } catch {
    return (await getDashboardInsights()).inventory;
  }
}

export async function getSupplierRisk() {
  try {
    return await fetcher<SupplierRiskScore[]>("/suppliers/risk");
  } catch {
    return (await getDashboardInsights()).suppliers;
  }
}

export async function getLogisticsPredictions() {
  try {
    return await fetcher<ShipmentDelayPrediction[]>("/logistics/predictions");
  } catch {
    return (await getDashboardInsights()).logistics;
  }
}

export async function getMaintenancePredictions() {
  try {
    return await fetcher<AssetFailurePrediction[]>("/maintenance/predictions");
  } catch {
    return (await getDashboardInsights()).maintenance;
  }
}

export async function getReports() {
  try {
    return await fetcher<ReportItem[]>("/reports");
  } catch {
    return [
      {
        id: "weekly-brief",
        name: "Weekly Executive Brief",
        reportType: "executive",
        generatedAt: "2026-04-23",
        status: "ready",
      },
      {
        id: "risk-pack",
        name: "Supplier Risk Deep Dive",
        reportType: "supplier",
        generatedAt: "2026-04-22",
        status: "ready",
      },
    ];
  }
}

export async function getSystemStatus() {
  try {
    return await fetcher<SystemStatus>("/health/status");
  } catch {
    return {
      apiStatus: "degraded",
      environment: "unknown",
      openaiConfigured: false,
      clerkConfigured: Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY),
      databaseConfigured: false,
      redisConfigured: false,
    };
  }
}

export async function runForecasts() {
  return fetcher<{ forecasts: ForecastApiResult[] }>("/forecast/run", {
    method: "POST",
  });
}

export async function postIngestionEvent(payload: {
  entity: string;
  payload: Record<string, unknown>;
}) {
  return fetcher<{ status: string; entity: string; payload: Record<string, unknown> }>("/ingestion/events", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
