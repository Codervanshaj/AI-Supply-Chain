from __future__ import annotations

import json
from datetime import date
from typing import Any

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import (
    DemandObservation,
    InventorySnapshot,
    Location,
    Organization,
    Product,
    Shipment,
    Supplier,
)

SUPPORTED_ENTITIES = {
    "product_master",
    "inventory_snapshot",
    "demand_observation",
    "supplier",
    "shipment",
}


def _require(payload: dict[str, Any], key: str) -> Any:
    value = payload.get(key)
    if value is None or value == "":
        raise HTTPException(status_code=422, detail=f"Missing required field: {key}")
    return value


def _get_or_create_org(session: Session, org_slug: str) -> Organization:
    org = session.scalar(select(Organization).where(Organization.slug == org_slug))
    if org:
        return org
    org = Organization(slug=org_slug, name=org_slug.replace("-", " ").title())
    session.add(org)
    session.flush()
    return org


def _get_or_create_location(session: Session, org_id: str, code: str) -> Location:
    location = session.scalar(select(Location).where(Location.org_id == org_id, Location.code == code))
    if location:
        return location
    location = Location(org_id=org_id, code=code, name=code, region="Unknown")
    session.add(location)
    session.flush()
    return location


def _get_or_create_product(session: Session, org_id: str, sku: str, defaults: dict[str, Any] | None = None) -> Product:
    product = session.scalar(select(Product).where(Product.org_id == org_id, Product.sku == sku))
    if product:
        return product
    defaults = defaults or {}
    product = Product(
        org_id=org_id,
        sku=sku,
        name=defaults.get("name", sku),
        category=defaults.get("category", "Uncategorized"),
        unit_cost=float(defaults.get("unit_cost", 0)),
        lead_time_days=int(defaults.get("lead_time_days", 14)),
        service_level_target=float(defaults.get("service_level_target", 0.95)),
    )
    session.add(product)
    session.flush()
    return product


def _get_or_create_supplier(session: Session, org_id: str, name: str) -> Supplier:
    supplier = session.scalar(select(Supplier).where(Supplier.org_id == org_id, Supplier.name == name))
    if supplier:
        return supplier
    supplier = Supplier(org_id=org_id, name=name, region="Unknown", category="General")
    session.add(supplier)
    session.flush()
    return supplier


def ingest_event(session: Session, org_slug: str, entity: str, payload: dict[str, Any]) -> dict[str, Any]:
    normalized_entity = entity.strip().lower()
    if normalized_entity not in SUPPORTED_ENTITIES:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported entity '{entity}'. Supported entities: {', '.join(sorted(SUPPORTED_ENTITIES))}",
        )

    org = _get_or_create_org(session, org_slug)

    if normalized_entity == "product_master":
        sku = str(_require(payload, "sku"))
        product = _get_or_create_product(session, org.id, sku)
        product.name = str(payload.get("name", product.name))
        product.category = str(payload.get("category", product.category))
        if payload.get("unitCost") is not None:
            product.unit_cost = float(payload["unitCost"])
        if payload.get("leadTimeDays") is not None:
            product.lead_time_days = int(payload["leadTimeDays"])
        if payload.get("serviceLevelTarget") is not None:
            product.service_level_target = float(payload["serviceLevelTarget"])
        session.flush()
        return {"entity": normalized_entity, "recordId": product.id, "operation": "upsert"}

    if normalized_entity == "supplier":
        name = str(_require(payload, "name"))
        supplier = _get_or_create_supplier(session, org.id, name)
        supplier.region = str(payload.get("region", supplier.region))
        supplier.category = str(payload.get("category", supplier.category))
        for key, field in {
            "delayRate": "delay_rate",
            "defectRate": "defect_rate",
            "fillRate": "fill_rate",
            "priceVolatility": "price_volatility",
            "disputeFrequency": "dispute_frequency",
            "dependencyConcentration": "dependency_concentration",
        }.items():
            if payload.get(key) is not None:
                setattr(supplier, field, float(payload[key]))
        session.flush()
        return {"entity": normalized_entity, "recordId": supplier.id, "operation": "upsert"}

    if normalized_entity == "inventory_snapshot":
        sku = str(_require(payload, "sku"))
        location_code = str(_require(payload, "location"))
        product = _get_or_create_product(session, org.id, sku)
        location = _get_or_create_location(session, org.id, location_code)
        snapshot = InventorySnapshot(
            org_id=org.id,
            product_id=product.id,
            location_id=location.id,
            on_hand=int(_require(payload, "onHand")),
            reserved=int(payload.get("reserved", 0)),
            in_transit=int(payload.get("inTransit", 0)),
            snapshot_date=date.fromisoformat(str(payload.get("snapshotDate", date.today().isoformat()))),
        )
        session.add(snapshot)
        session.flush()
        return {"entity": normalized_entity, "recordId": snapshot.id, "operation": "insert"}

    if normalized_entity == "demand_observation":
        sku = str(_require(payload, "sku"))
        location_code = str(_require(payload, "location"))
        product = _get_or_create_product(session, org.id, sku)
        location = _get_or_create_location(session, org.id, location_code)
        observation = DemandObservation(
            org_id=org.id,
            product_id=product.id,
            location_id=location.id,
            observed_on=date.fromisoformat(str(_require(payload, "observedOn"))),
            quantity=int(_require(payload, "quantity")),
        )
        session.add(observation)
        session.flush()
        return {"entity": normalized_entity, "recordId": observation.id, "operation": "insert"}

    shipment_number = str(_require(payload, "shipmentNumber"))
    supplier_name = str(_require(payload, "supplierName"))
    supplier = _get_or_create_supplier(session, org.id, supplier_name)
    shipment = session.scalar(
        select(Shipment).where(Shipment.org_id == org.id, Shipment.shipment_number == shipment_number)
    )
    if shipment is None:
        shipment = Shipment(
            org_id=org.id,
            shipment_number=shipment_number,
            carrier=str(payload.get("carrier", "Unknown")),
            route=str(payload.get("route", "Unknown")),
            mode=str(payload.get("mode", "Road")),
            supplier_id=supplier.id,
            planned_delivery_date=date.fromisoformat(str(_require(payload, "plannedDeliveryDate"))),
            actual_delivery_date=(
                date.fromisoformat(str(payload["actualDeliveryDate"])) if payload.get("actualDeliveryDate") else None
            ),
            lead_time_variance=float(payload.get("leadTimeVariance", 0)),
        )
        session.add(shipment)
        operation = "insert"
    else:
        shipment.carrier = str(payload.get("carrier", shipment.carrier))
        shipment.route = str(payload.get("route", shipment.route))
        shipment.mode = str(payload.get("mode", shipment.mode))
        shipment.supplier_id = supplier.id
        if payload.get("plannedDeliveryDate"):
            shipment.planned_delivery_date = date.fromisoformat(str(payload["plannedDeliveryDate"]))
        if payload.get("actualDeliveryDate"):
            shipment.actual_delivery_date = date.fromisoformat(str(payload["actualDeliveryDate"]))
        if payload.get("leadTimeVariance") is not None:
            shipment.lead_time_variance = float(payload["leadTimeVariance"])
        operation = "upsert"

    session.flush()
    return {"entity": normalized_entity, "recordId": shipment.id, "operation": operation}


def parse_upload_content(content: bytes, filename: str | None) -> list[dict[str, Any]]:
    raw = content.decode("utf-8").strip()
    if not raw:
        raise HTTPException(status_code=422, detail="Uploaded file is empty")

    try:
        parsed = json.loads(raw)
        if isinstance(parsed, dict):
            parsed = [parsed]
        if not isinstance(parsed, list):
            raise HTTPException(status_code=422, detail="JSON payload must be an object or an array")
        events: list[dict[str, Any]] = []
        for row in parsed:
            if not isinstance(row, dict):
                raise HTTPException(status_code=422, detail="Each JSON record must be an object")
            events.append(row)
        return events
    except json.JSONDecodeError:
        events: list[dict[str, Any]] = []
        for line in raw.splitlines():
            if not line.strip():
                continue
            row = json.loads(line)
            if not isinstance(row, dict):
                raise HTTPException(status_code=422, detail="Each newline-delimited JSON row must be an object")
            events.append(row)
        if not events:
            raise HTTPException(status_code=422, detail=f"Unable to parse {filename or 'upload'} as JSON or NDJSON")
        return events
