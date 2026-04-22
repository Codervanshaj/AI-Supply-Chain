from fastapi import APIRouter

from app.core.config import settings
from app.schemas import ApiEnvelope, HealthResponse

router = APIRouter()


@router.get("/health", response_model=ApiEnvelope[HealthResponse])
def healthcheck():
    return ApiEnvelope(data=HealthResponse(status="ok", environment=settings.environment))

