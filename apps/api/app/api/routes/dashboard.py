from fastapi import APIRouter
from sqlalchemy.orm import Session

from app.core.deps import DbSession, RequestContext, RequestCtx
from app.schemas import ApiEnvelope, DashboardInsightsResponse, DashboardSummaryResponse
from app.services.analytics import build_dashboard_insights, build_dashboard_summary

router = APIRouter()


@router.get("/summary", response_model=ApiEnvelope[DashboardSummaryResponse])
def get_summary(db: Session = DbSession, context: RequestContext = RequestCtx):
    return ApiEnvelope(data=build_dashboard_summary(db, context.org_slug))


@router.get("/insights", response_model=ApiEnvelope[DashboardInsightsResponse])
def get_insights(db: Session = DbSession, context: RequestContext = RequestCtx):
    return ApiEnvelope(data=build_dashboard_insights(db, context.org_slug))

