from datetime import date, timedelta

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


def seed_demo_data(session: Session) -> None:
    org = session.scalar(select(Organization).where(Organization.slug == "demo-org"))
    if org:
        return

    org = Organization(name="Demo Manufacturing Group", slug="demo-org")
    session.add(org)
    session.flush()

    locations = [
        Location(org_id=org.id, code="BLR-DC", name="Bangalore Distribution Hub", region="South"),
        Location(org_id=org.id, code="MUM-DC", name="Mumbai Fulfillment Center", region="West"),
    ]
    session.add_all(locations)
    session.flush()

    products = [
        Product(
            org_id=org.id,
            sku="VALVE-100",
            name="Industrial Valve Assembly",
            category="Components",
            unit_cost=55.0,
            lead_time_days=21,
            service_level_target=0.97,
        ),
        Product(
            org_id=org.id,
            sku="SENSOR-220",
            name="Temperature Sensor Kit",
            category="Electronics",
            unit_cost=18.0,
            lead_time_days=12,
            service_level_target=0.95,
        ),
        Product(
            org_id=org.id,
            sku="PUMP-450",
            name="Hydraulic Pump Core",
            category="Mechanical",
            unit_cost=120.0,
            lead_time_days=28,
            service_level_target=0.98,
        ),
    ]
    session.add_all(products)
    session.flush()

    suppliers = [
        Supplier(
            org_id=org.id,
            name="Apex Components",
            region="India",
            category="Mechanical",
            delay_rate=0.23,
            defect_rate=0.07,
            fill_rate=0.82,
            price_volatility=0.18,
            dispute_frequency=0.08,
            dependency_concentration=0.74,
        ),
        Supplier(
            org_id=org.id,
            name="Nova Sensors",
            region="Singapore",
            category="Electronics",
            delay_rate=0.12,
            defect_rate=0.03,
            fill_rate=0.94,
            price_volatility=0.09,
            dispute_frequency=0.02,
            dependency_concentration=0.49,
        ),
    ]
    session.add_all(suppliers)
    session.flush()

    assets = [
        Asset(
            org_id=org.id,
            code="CNV-01",
            name="Conveyor Line 01",
            location_id=locations[0].id,
            runtime_hours=1850,
            downtime_hours_last_30d=16,
            anomaly_score=0.68,
            last_service_days_ago=52,
        ),
        Asset(
            org_id=org.id,
            code="PKR-09",
            name="Packaging Robot 09",
            location_id=locations[1].id,
            runtime_hours=2230,
            downtime_hours_last_30d=24,
            anomaly_score=0.74,
            last_service_days_ago=63,
        ),
    ]
    session.add_all(assets)
    session.flush()

    today = date.today()
    for offset, quantity in enumerate([110, 121, 129, 135, 148, 152]):
        session.add(
            DemandObservation(
                org_id=org.id,
                product_id=products[0].id,
                location_id=locations[0].id,
                observed_on=today - timedelta(days=35 - offset * 7),
                quantity=quantity,
            )
        )

    inventory = [
        InventorySnapshot(
            org_id=org.id,
            product_id=products[0].id,
            location_id=locations[0].id,
            on_hand=94,
            reserved=18,
            in_transit=40,
            snapshot_date=today,
        ),
        InventorySnapshot(
            org_id=org.id,
            product_id=products[1].id,
            location_id=locations[1].id,
            on_hand=132,
            reserved=20,
            in_transit=24,
            snapshot_date=today,
        ),
        InventorySnapshot(
            org_id=org.id,
            product_id=products[2].id,
            location_id=locations[0].id,
            on_hand=48,
            reserved=12,
            in_transit=6,
            snapshot_date=today,
        ),
    ]
    session.add_all(inventory)

    shipments = [
        Shipment(
            org_id=org.id,
            shipment_number="SHP-1801",
            carrier="BlueDart Freight",
            route="Mumbai-Chennai",
            mode="Road",
            supplier_id=suppliers[0].id,
            planned_delivery_date=today + timedelta(days=2),
            actual_delivery_date=None,
            lead_time_variance=1.8,
        ),
        Shipment(
            org_id=org.id,
            shipment_number="SHP-1802",
            carrier="Maersk",
            route="Singapore-Mumbai",
            mode="Ocean",
            supplier_id=suppliers[1].id,
            planned_delivery_date=today + timedelta(days=6),
            actual_delivery_date=None,
            lead_time_variance=3.4,
        ),
    ]
    session.add_all(shipments)

    forecasts = [
        ForecastRecord(
            org_id=org.id,
            product_id=products[0].id,
            location_id=locations[0].id,
            horizon_days=30,
            predicted_demand=166.0,
            lower_bound=151.0,
            upper_bound=179.0,
            confidence=0.87,
            model_type="ensemble",
            explanation={
                "drivers": [
                    {"feature": "seasonality", "impact": 0.38},
                    {"feature": "recent trend", "impact": 0.29},
                    {"feature": "regional uplift", "impact": 0.15},
                ]
            },
        ),
        ForecastRecord(
            org_id=org.id,
            product_id=products[2].id,
            location_id=locations[0].id,
            horizon_days=30,
            predicted_demand=78.0,
            lower_bound=69.0,
            upper_bound=88.0,
            confidence=0.81,
            model_type="ensemble",
            explanation={
                "drivers": [
                    {"feature": "project demand", "impact": 0.34},
                    {"feature": "supplier lead time", "impact": 0.23},
                ]
            },
        ),
    ]
    session.add_all(forecasts)

