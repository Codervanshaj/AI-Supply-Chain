from datetime import date
from typing import Any, Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class ErrorPayload(BaseModel):
    code: str
    message: str


class ApiEnvelope(BaseModel, Generic[T]):
    data: T
    meta: dict[str, Any] | None = None
    errors: list[ErrorPayload] | None = None


class HealthResponse(BaseModel):
    status: str
    environment: str


class MetricItem(BaseModel):
    title: str
    value: str
    delta: str
    description: str
    tone: str


class SeriesPoint(BaseModel):
    period: str
    forecast: float
    actual: float


class RiskPoint(BaseModel):
    name: str
    value: float


class DashboardSummaryResponse(BaseModel):
    metrics: list[MetricItem]
    demandSeries: list[SeriesPoint]
    riskBreakdown: list[RiskPoint]


class ReorderRecommendation(BaseModel):
    productId: str
    productName: str
    sku: str
    urgency: str
    recommendedQuantity: int
    projectedStockoutDate: str
    reasoning: str
    confidence: float


class SupplierRiskFactor(BaseModel):
    name: str
    score: float
    explanation: str


class SupplierRiskScore(BaseModel):
    supplierId: str
    supplierName: str
    riskScore: float
    riskLevel: str
    factors: list[SupplierRiskFactor]
    recommendation: str


class ShipmentDelayPrediction(BaseModel):
    shipmentId: str
    shipmentNumber: str
    delayProbability: float
    riskLevel: str
    reasoning: str
    recommendation: str


class AssetFailurePrediction(BaseModel):
    assetId: str
    assetName: str
    failureProbability: float
    riskLevel: str
    explanation: str
    nextAction: str


class DashboardInsightsResponse(BaseModel):
    inventory: list[ReorderRecommendation]
    suppliers: list[SupplierRiskScore]
    logistics: list[ShipmentDelayPrediction]
    maintenance: list[AssetFailurePrediction]


class ForecastResult(BaseModel):
    productId: str
    locationId: str
    horizonDays: int
    predictedDemand: float
    lowerBound: float
    upperBound: float
    modelType: str
    confidence: float
    explanation: dict[str, Any] = Field(default_factory=dict)


class ForecastRunResponse(BaseModel):
    forecasts: list[ForecastResult]


class AIQueryRequest(BaseModel):
    query: str
    scope: dict[str, list[str]] | None = None


class AIQueryResponse(BaseModel):
    answer: str


class IngestionEventRequest(BaseModel):
    entity: str
    payload: dict[str, Any]


class ReportItem(BaseModel):
    id: str
    name: str
    reportType: str
    generatedAt: date
    status: str

