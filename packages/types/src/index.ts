export type UserRole = "owner" | "manager" | "analyst" | "operator" | "viewer";

export interface ApiEnvelope<T> {
  data: T;
  meta?: Record<string, unknown>;
  errors?: { code: string; message: string }[];
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  orgId: string;
  sku: string;
  name: string;
  category: string;
  unitCost: number;
  leadTimeDays: number;
  serviceLevelTarget: number;
}

export interface Location {
  id: string;
  orgId: string;
  code: string;
  name: string;
  region: string;
}

export interface Supplier {
  id: string;
  orgId: string;
  name: string;
  region: string;
  category: string;
}

export interface Shipment {
  id: string;
  orgId: string;
  shipmentNumber: string;
  carrier: string;
  route: string;
  mode: string;
  plannedDeliveryDate: string;
  actualDeliveryDate?: string | null;
}

export interface Asset {
  id: string;
  orgId: string;
  code: string;
  name: string;
  locationId: string;
  runtimeHours: number;
}

export interface DemandObservation {
  productId: string;
  locationId: string;
  observedAt: string;
  quantity: number;
}

export interface ForecastResult {
  productId: string;
  locationId: string;
  horizonDays: number;
  predictedDemand: number;
  lowerBound: number;
  upperBound: number;
  modelType: string;
  confidence: number;
}

export interface ForecastExplanation {
  productId: string;
  drivers: { feature: string; impact: number; explanation: string }[];
  narrative: string;
}

export interface InventoryPolicy {
  productId: string;
  reorderPoint: number;
  safetyStock: number;
  economicOrderQuantity: number;
}

export interface ReorderRecommendation {
  productId: string;
  productName: string;
  sku: string;
  urgency: "low" | "medium" | "high" | "critical";
  recommendedQuantity: number;
  projectedStockoutDate: string;
  reasoning: string;
  confidence: number;
}

export interface SupplierRiskFactor {
  name: string;
  score: number;
  explanation: string;
}

export interface SupplierRiskScore {
  supplierId: string;
  supplierName: string;
  riskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  factors: SupplierRiskFactor[];
  recommendation: string;
}

export interface ShipmentDelayPrediction {
  shipmentId: string;
  shipmentNumber: string;
  delayProbability: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  reasoning: string;
  recommendation: string;
}

export interface AssetFailurePrediction {
  assetId: string;
  assetName: string;
  failureProbability: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  explanation: string;
  nextAction: string;
}

export interface AIInsight {
  title: string;
  summary: string;
  severity: "info" | "warning" | "critical";
}

export interface AIActionRecommendation {
  action: string;
  owner: string;
  rationale: string;
  priority: "low" | "medium" | "high";
}

export interface AIContextPack {
  dashboard: Record<string, unknown>;
  forecast: ForecastResult[];
  inventory: ReorderRecommendation[];
  suppliers: SupplierRiskScore[];
  logistics: ShipmentDelayPrediction[];
  maintenance: AssetFailurePrediction[];
}

export interface AIQueryRequest {
  query: string;
  scope?: {
    productIds?: string[];
    supplierIds?: string[];
    locationIds?: string[];
  };
}

export interface ForecastDriver {
  feature: string;
  impact?: number;
  explanation?: string;
}

export interface ForecastApiResult {
  productId: string;
  locationId: string;
  horizonDays: number;
  predictedDemand: number;
  lowerBound: number;
  upperBound: number;
  modelType: string;
  confidence: number;
  explanation: {
    drivers?: ForecastDriver[];
    narrative?: string;
  };
}

export interface ReportItem {
  id: string;
  name: string;
  reportType: string;
  generatedAt: string;
  status: string;
}

export interface SystemStatus {
  apiStatus: string;
  environment: string;
  openaiConfigured: boolean;
  clerkConfigured: boolean;
  databaseConfigured: boolean;
  redisConfigured: boolean;
}
