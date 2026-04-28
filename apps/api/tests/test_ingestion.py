from fastapi.testclient import TestClient
from sqlalchemy import select

from app.core.database import Base, SessionLocal, engine
from app.main import app
from app.models import InventorySnapshot, Product


def test_ingestion_event_persists_inventory_snapshot():
    Base.metadata.create_all(bind=engine)

    with TestClient(app) as client:
        response = client.post(
            "/ingestion/events",
            json={
                "entity": "inventory_snapshot",
                "payload": {
                    "sku": "ERP-VALVE-1",
                    "location": "DAL-DC",
                    "onHand": 120,
                    "reserved": 5,
                    "inTransit": 30,
                    "snapshotDate": "2026-04-28",
                },
            },
            headers={"x-org-slug": "integration-test-org"},
        )

    assert response.status_code == 200
    assert response.json()["data"]["status"] == "accepted"

    with SessionLocal() as session:
        product = session.scalar(select(Product).where(Product.sku == "ERP-VALVE-1"))
        assert product is not None
        snapshot = session.scalar(
            select(InventorySnapshot).where(InventorySnapshot.product_id == product.id).order_by(InventorySnapshot.created_at.desc())
        )
        assert snapshot is not None
        assert snapshot.on_hand == 120
        assert snapshot.reserved == 5
        assert snapshot.in_transit == 30


def test_upload_ingests_multiple_events():
    Base.metadata.create_all(bind=engine)
    payload = """
[{"entity":"product_master","payload":{"sku":"ERP-SNS-2","name":"Sensor Pack","category":"Electronics","unitCost":22.5,"leadTimeDays":10}},
 {"entity":"inventory_snapshot","payload":{"sku":"ERP-SNS-2","location":"DAL-DC","onHand":44,"reserved":2,"inTransit":6}}]
""".strip()

    with TestClient(app) as client:
        response = client.post(
            "/ingestion/upload",
            files={"file": ("events.json", payload, "application/json")},
            headers={"x-org-slug": "integration-test-org"},
        )

    assert response.status_code == 200
    body = response.json()["data"]
    assert body["status"] == "processed"
    assert body["processed"] == 2
    assert body["entities"]["product_master"] == 1
    assert body["entities"]["inventory_snapshot"] == 1
