import type {
  AIQueryRequest,
  ApiEnvelope,
  AssetFailurePrediction,
  ReorderRecommendation,
  ShipmentDelayPrediction,
  SupplierRiskScore,
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
  try {
    const payload: AIQueryRequest = { query };
    const data = await fetcher<{ answer: string }>("/ai/query", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return data.answer;
  } catch {
    return "Inventory is the fastest lever right now: reorder VALVE-100, monitor Apex Components closely, and escalate SHP-1801 because inbound variability is compounding stockout risk.";
  }
}
