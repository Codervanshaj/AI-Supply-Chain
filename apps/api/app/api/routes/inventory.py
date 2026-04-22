from fastapi import APIRouter
from sqlalchemy.orm import Session

from app.core.deps import DbSession, RequestContext, RequestCtx
from app.schemas import ApiEnvelope, ReorderRecommendation
from app.services.analytics import build_inventory_recommendations, get_org

router = APIRouter()


@router.get("/recommendations", response_model=ApiEnvelope[list[ReorderRecommendation]])
def get_reorder_recommendations(db: Session = DbSession, context: RequestContext = RequestCtx):
    org = get_org(db, context.org_slug)
    return ApiEnvelope(data=build_inventory_recommendations(db, org.id))

