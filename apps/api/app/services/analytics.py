from datetime import date, timedelta
from statistics import mean

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import (
    Asset,
    DemandObservation,
    ForecastRecord,
    InventorySnapshot,
    Location,
    Organization,
    Product,
    Shipment,
    Supplier,
)
from app.schemas import (
    AssetFailurePrediction,
    DashboardInsightsResponse,
    DashboardSummaryResponse,
    ForecastResult,
    MetricItem,
    ReorderRecommendation,
    RiskPoint,
    SeriesPoint,
    ShipmentDelayPrediction,
    SupplierRiskFactor,
    SupplierRiskScore,
)


def _risk_level(score: float) -> str:
    if score >= 0.8:
        return "critical"
    if score >= 0.6:
        return "high"
    if score >= 0.35:
        return "medium"
    return "low"


def get_org(session: Session, org_slug: str) -> Organization:
    return session.scalar(select(Organization).where(Organization.slug == org_slug))


def get_forecasts(session: Session, org_id: str) -> list[ForecastResult]:
    products = {item.id: item for item in session.scalars(select(Product).where(Product.org_id == org_id)).all()}
    locations = {item.id: item for item in session.scalars(select(Location).where(Location.org_id == org_id)).all()}
    records = session.scalars(select(ForecastRecord).where(ForecastRecord.org_id == org_id)).all()
    return [
        ForecastResult(
            productId=record.product_id,
            productName=products[record.product_id].name,
            sku=products[record.product_id].sku,
            locationId=record.location_id,
            locationName=locations[record.location_id].name,
            horizonDays=record.horizon_days,
            predictedDemand=record.predicted_demand,
            lowerBound=record.lower_bound,
            upperBound=record.upper_bound,
            modelType=record.model_type,
            confidence=record.confidence,
            explanation=record.explanation,
        )
        for record in records
    ]


def build_inventory_recommendations(session: Session, org_id: str) -> list[ReorderRecommendation]:
    products = {item.id: item for item in session.scalars(select(Product).where(Product.org_id == org_id)).all()}
    forecasts = {item.product_id: item for item in session.scalars(select(ForecastRecord).where(ForecastRecord.org_id == org_id)).all()}
    snapshots = session.scalars(select(InventorySnapshot).where(InventorySnapshot.org_id == org_id)).all()

    recommendations: list[ReorderRecommendation] = []
    for snapshot in snapshots:
        product = products[snapshot.product_id]
        forecast = forecasts.get(snapshot.product_id)
        predicted_monthly = forecast.predicted_demand if forecast else snapshot.on_hand * 1.2
        daily_demand = predicted_monthly / 30
        safety_stock = int(daily_demand * product.lead_time_days * 0.35)
        reorder_point = int(daily_demand * product.lead_time_days + safety_stock)
        available = snapshot.on_hand - snapshot.reserved + snapshot.in_transit
        quantity = max(0, reorder_point * 2 - available)
        risk_score = min(1.0, max(0.1, (reorder_point - available) / max(reorder_point, 1) + 0.4))
        stockout_date = date.today() + timedelta(days=max(2, int(max(1, available) / max(daily_demand, 1))))
        recommendations.append(
            ReorderRecommendation(
                productId=product.id,
                productName=product.name,
                sku=product.sku,
                urgency=_risk_level(risk_score),
                recommendedQuantity=quantity,
                projectedStockoutDate=stockout_date.isoformat(),
                reasoning=(
                    f"Projected demand is {predicted_monthly:.0f} units over the next 30 days with "
                    f"{product.lead_time_days}-day lead time and safety stock of {safety_stock}."
                ),
                confidence=forecast.confidence if forecast else 0.72,
            )
        )
    return sorted(recommendations, key=lambda item: item.confidence, reverse=True)


def build_supplier_risk(session: Session, org_id: str) -> list[SupplierRiskScore]:
    suppliers = session.scalars(select(Supplier).where(Supplier.org_id == org_id)).all()
    output: list[SupplierRiskScore] = []
    for supplier in suppliers:
        risk_score = (
            supplier.delay_rate * 0.25
            + supplier.defect_rate * 0.2
            + (1 - supplier.fill_rate) * 0.2
            + supplier.price_volatility * 0.15
            + supplier.dispute_frequency * 0.1
            + supplier.dependency_concentration * 0.1
        )
        factors = [
            SupplierRiskFactor(
                name="Delays",
                score=round(supplier.delay_rate * 100, 1),
                explanation="Recent delivery misses are lifting inbound variability.",
            ),
            SupplierRiskFactor(
                name="Quality",
                score=round(supplier.defect_rate * 100, 1),
                explanation="Defect leakage raises inspection and replacement cost.",
            ),
            SupplierRiskFactor(
                name="Dependency",
                score=round(supplier.dependency_concentration * 100, 1),
                explanation="High spend concentration increases switching risk.",
            ),
        ]
        output.append(
            SupplierRiskScore(
                supplierId=supplier.id,
                supplierName=supplier.name,
                riskScore=round(risk_score * 100, 1),
                riskLevel=_risk_level(risk_score),
                factors=factors,
                recommendation=(
                    "Build alternate capacity and tighten inbound quality review."
                    if risk_score > 0.6
                    else "Monitor on-time performance and maintain contingency coverage."
                ),
            )
        )
    return sorted(output, key=lambda item: item.riskScore, reverse=True)


def build_logistics_predictions(session: Session, org_id: str) -> list[ShipmentDelayPrediction]:
    shipments = session.scalars(select(Shipment).where(Shipment.org_id == org_id)).all()
    suppliers = {item.id: item for item in session.scalars(select(Supplier).where(Supplier.org_id == org_id)).all()}
    predictions: list[ShipmentDelayPrediction] = []
    for shipment in shipments:
        supplier = suppliers[shipment.supplier_id]
        probability = min(
            0.95,
            0.25 + shipment.lead_time_variance * 0.08 + supplier.delay_rate * 0.9 + (0.08 if shipment.mode == "Ocean" else 0.0),
        )
        predictions.append(
            ShipmentDelayPrediction(
                shipmentId=shipment.id,
                shipmentNumber=shipment.shipment_number,
                delayProbability=round(probability, 2),
                riskLevel=_risk_level(probability),
                reasoning=(
                    f"{shipment.route} is exposed to {shipment.lead_time_variance:.1f}-day lead time variance and "
                    f"{supplier.name} has elevated delay frequency."
                ),
                recommendation="Escalate carrier check-ins and pull contingency inventory forward.",
            )
        )
    return predictions


def build_maintenance_predictions(session: Session, org_id: str) -> list[AssetFailurePrediction]:
    assets = session.scalars(select(Asset).where(Asset.org_id == org_id)).all()
    predictions: list[AssetFailurePrediction] = []
    for asset in assets:
        probability = min(
            0.96,
            0.15
            + min(asset.runtime_hours / 3000, 0.3)
            + min(asset.downtime_hours_last_30d / 100, 0.25)
            + min(asset.anomaly_score * 0.35, 0.35)
            + min(asset.last_service_days_ago / 180, 0.15),
        )
        predictions.append(
            AssetFailurePrediction(
                assetId=asset.id,
                assetName=asset.name,
                failureProbability=round(probability, 2),
                riskLevel=_risk_level(probability),
                explanation=(
                    f"Runtime is {asset.runtime_hours:.0f}h, downtime in the last 30 days is "
                    f"{asset.downtime_hours_last_30d:.0f}h, and anomaly score is {asset.anomaly_score:.2f}."
                ),
                nextAction="Schedule preventive inspection within 48 hours and review spares readiness.",
            )
        )
    return predictions


def build_dashboard_summary(session: Session, org_slug: str) -> DashboardSummaryResponse:
    org = get_org(session, org_slug)
    forecasts = get_forecasts(session, org.id)
    inventory = build_inventory_recommendations(session, org.id)
    supplier_risk = build_supplier_risk(session, org.id)
    logistics = build_logistics_predictions(session, org.id)
    maintenance = build_maintenance_predictions(session, org.id)
    demand = session.scalars(select(DemandObservation).where(DemandObservation.org_id == org.id)).all()
    demand_values = [point.quantity for point in demand]

    metrics = [
        MetricItem(
            title="Forecast confidence",
            value=f"{mean(item.confidence for item in forecasts) * 100:.0f}%",
            delta="+4.8%",
            description="Average ensemble confidence across active forecast jobs.",
            tone="success",
        ),
        MetricItem(
            title="Stockout risk",
            value=str(sum(item.urgency in {'high', 'critical'} for item in inventory)),
            delta="-2 urgent SKUs",
            description="Products expected to breach reorder point inside lead time.",
            tone="warning",
        ),
        MetricItem(
            title="Supplier risk",
            value=f"{supplier_risk[0].riskScore:.0f}",
            delta="highest supplier score",
            description="Top supplier risk score across strategic vendors.",
            tone="critical",
        ),
        MetricItem(
            title="Maintenance risk",
            value=f"{max(item.failureProbability for item in maintenance) * 100:.0f}%",
            delta="+1 at-risk asset",
            description="Highest failure probability detected in monitored assets.",
            tone="warning",
        ),
    ]

    demand_series = [
        SeriesPoint(period=f"W{i+1}", actual=value, forecast=value * 1.04)
        for i, value in enumerate(demand_values[-6:])
    ]
    risk_breakdown = [
        RiskPoint(name="Inventory", value=sum(item.urgency in {"critical", "high"} for item in inventory)),
        RiskPoint(name="Suppliers", value=sum(item.riskLevel in {"critical", "high"} for item in supplier_risk)),
        RiskPoint(name="Logistics", value=sum(item.riskLevel in {"critical", "high"} for item in logistics)),
        RiskPoint(name="Maintenance", value=sum(item.riskLevel in {"critical", "high"} for item in maintenance)),
    ]
    return DashboardSummaryResponse(
        metrics=metrics,
        demandSeries=demand_series,
        riskBreakdown=risk_breakdown,
    )


def build_dashboard_insights(session: Session, org_slug: str) -> DashboardInsightsResponse:
    org = get_org(session, org_slug)
    return DashboardInsightsResponse(
        inventory=build_inventory_recommendations(session, org.id),
        suppliers=build_supplier_risk(session, org.id),
        logistics=build_logistics_predictions(session, org.id),
        maintenance=build_maintenance_predictions(session, org.id),
    )
