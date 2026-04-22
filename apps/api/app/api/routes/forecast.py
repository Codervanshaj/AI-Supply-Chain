from fastapi import APIRouter
from sqlalchemy.orm import Session

from app.core.deps import DbSession, RequestContext, RequestCtx
from app.schemas import ApiEnvelope, ForecastRunResponse
from app.services.analytics import get_forecasts, get_org
from app.services.forecasting import run_forecast_pipeline

router = APIRouter()


@router.get("", response_model=ApiEnvelope[ForecastRunResponse])
def get_current_forecasts(db: Session = DbSession, context: RequestContext = RequestCtx):
    org = get_org(db, context.org_slug)
    return ApiEnvelope(data=ForecastRunResponse(forecasts=get_forecasts(db, org.id)))


@router.post("/run", response_model=ApiEnvelope[ForecastRunResponse])
def run_forecasts(db: Session = DbSession, context: RequestContext = RequestCtx):
    results = run_forecast_pipeline(db, context.org_slug)
    return ApiEnvelope(data=ForecastRunResponse(forecasts=results))

