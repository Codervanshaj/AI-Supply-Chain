import uuid
from datetime import date, datetime

from sqlalchemy import JSON, Date, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


def uuid_pk() -> str:
    return str(uuid.uuid4())


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class Organization(Base, TimestampMixin):
    __tablename__ = "organizations"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid_pk)
    name: Mapped[str] = mapped_column(String(255))
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True)


class Product(Base, TimestampMixin):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid_pk)
    org_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"), index=True)
    sku: Mapped[str] = mapped_column(String(64), index=True)
    name: Mapped[str] = mapped_column(String(255))
    category: Mapped[str] = mapped_column(String(100))
    unit_cost: Mapped[float] = mapped_column(Float)
    lead_time_days: Mapped[int] = mapped_column(Integer)
    service_level_target: Mapped[float] = mapped_column(Float, default=0.95)


class Location(Base, TimestampMixin):
    __tablename__ = "locations"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid_pk)
    org_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"), index=True)
    code: Mapped[str] = mapped_column(String(50))
    name: Mapped[str] = mapped_column(String(255))
    region: Mapped[str] = mapped_column(String(100))


class Supplier(Base, TimestampMixin):
    __tablename__ = "suppliers"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid_pk)
    org_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    region: Mapped[str] = mapped_column(String(100))
    category: Mapped[str] = mapped_column(String(100))
    delay_rate: Mapped[float] = mapped_column(Float, default=0)
    defect_rate: Mapped[float] = mapped_column(Float, default=0)
    fill_rate: Mapped[float] = mapped_column(Float, default=1)
    price_volatility: Mapped[float] = mapped_column(Float, default=0)
    dispute_frequency: Mapped[float] = mapped_column(Float, default=0)
    dependency_concentration: Mapped[float] = mapped_column(Float, default=0)


class Shipment(Base, TimestampMixin):
    __tablename__ = "shipments"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid_pk)
    org_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"), index=True)
    shipment_number: Mapped[str] = mapped_column(String(100))
    carrier: Mapped[str] = mapped_column(String(100))
    route: Mapped[str] = mapped_column(String(100))
    mode: Mapped[str] = mapped_column(String(50))
    supplier_id: Mapped[str] = mapped_column(ForeignKey("suppliers.id"))
    planned_delivery_date: Mapped[date] = mapped_column(Date)
    actual_delivery_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    lead_time_variance: Mapped[float] = mapped_column(Float, default=0)


class Asset(Base, TimestampMixin):
    __tablename__ = "assets"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid_pk)
    org_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"), index=True)
    code: Mapped[str] = mapped_column(String(100))
    name: Mapped[str] = mapped_column(String(255))
    location_id: Mapped[str] = mapped_column(ForeignKey("locations.id"))
    runtime_hours: Mapped[float] = mapped_column(Float, default=0)
    downtime_hours_last_30d: Mapped[float] = mapped_column(Float, default=0)
    anomaly_score: Mapped[float] = mapped_column(Float, default=0)
    last_service_days_ago: Mapped[int] = mapped_column(Integer, default=0)


class DemandObservation(Base, TimestampMixin):
    __tablename__ = "demand_observations"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid_pk)
    org_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"), index=True)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"))
    location_id: Mapped[str] = mapped_column(ForeignKey("locations.id"))
    observed_on: Mapped[date] = mapped_column(Date, index=True)
    quantity: Mapped[int] = mapped_column(Integer)


class InventorySnapshot(Base, TimestampMixin):
    __tablename__ = "inventory_snapshots"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid_pk)
    org_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"), index=True)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"))
    location_id: Mapped[str] = mapped_column(ForeignKey("locations.id"))
    on_hand: Mapped[int] = mapped_column(Integer)
    reserved: Mapped[int] = mapped_column(Integer, default=0)
    in_transit: Mapped[int] = mapped_column(Integer, default=0)
    snapshot_date: Mapped[date] = mapped_column(Date)


class ForecastRecord(Base, TimestampMixin):
    __tablename__ = "forecast_records"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid_pk)
    org_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"), index=True)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"))
    location_id: Mapped[str] = mapped_column(ForeignKey("locations.id"))
    horizon_days: Mapped[int] = mapped_column(Integer)
    predicted_demand: Mapped[float] = mapped_column(Float)
    lower_bound: Mapped[float] = mapped_column(Float)
    upper_bound: Mapped[float] = mapped_column(Float)
    confidence: Mapped[float] = mapped_column(Float)
    model_type: Mapped[str] = mapped_column(String(100))
    explanation: Mapped[dict] = mapped_column(JSON, default=dict)


class AIConversation(Base, TimestampMixin):
    __tablename__ = "ai_conversations"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid_pk)
    org_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"), index=True)
    user_id: Mapped[str] = mapped_column(String(255), index=True)
    title: Mapped[str] = mapped_column(String(255), default="AI Session")

    messages: Mapped[list["AIMessage"]] = relationship(back_populates="conversation")


class AIMessage(Base, TimestampMixin):
    __tablename__ = "ai_messages"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid_pk)
    conversation_id: Mapped[str] = mapped_column(ForeignKey("ai_conversations.id"), index=True)
    role: Mapped[str] = mapped_column(String(32))
    content: Mapped[str] = mapped_column(Text)

    conversation: Mapped["AIConversation"] = relationship(back_populates="messages")

