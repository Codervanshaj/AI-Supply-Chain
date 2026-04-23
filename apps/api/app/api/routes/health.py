from fastapi import APIRouter

from app.core.config import settings
from app.schemas import ApiEnvelope, HealthResponse, SystemStatusResponse

router = APIRouter()


@router.get("/health", response_model=ApiEnvelope[HealthResponse])
def healthcheck():
    return ApiEnvelope(data=HealthResponse(status="ok", environment=settings.environment))


@router.get("/health/status", response_model=ApiEnvelope[SystemStatusResponse])
def system_status():
    return ApiEnvelope(
        data=SystemStatusResponse(
            apiStatus="ok",
            environment=settings.environment,
            openaiConfigured=bool(settings.openai_api_key),
            geminiConfigured=bool(settings.gemini_api_key),
            clerkConfigured=bool(settings.clerk_secret_key),
            databaseConfigured=bool(settings.database_url),
            redisConfigured=bool(settings.redis_url),
        )
    )
