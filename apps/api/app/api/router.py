from fastapi import APIRouter

from app.api.routes import ai, auth, dashboard, forecast, health, ingestion, inventory, logistics, maintenance, reports, suppliers

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(forecast.router, prefix="/forecast", tags=["forecast"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
api_router.include_router(suppliers.router, prefix="/suppliers", tags=["suppliers"])
api_router.include_router(logistics.router, prefix="/logistics", tags=["logistics"])
api_router.include_router(maintenance.router, prefix="/maintenance", tags=["maintenance"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(ingestion.router, prefix="/ingestion", tags=["ingestion"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])

