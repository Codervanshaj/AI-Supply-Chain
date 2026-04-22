from fastapi import APIRouter
from sqlalchemy.orm import Session

from app.core.deps import DbSession, RequestContext, RequestCtx
from app.schemas import ApiEnvelope, AssetFailurePrediction
from app.services.analytics import build_maintenance_predictions, get_org

router = APIRouter()


@router.get("/predictions", response_model=ApiEnvelope[list[AssetFailurePrediction]])
def get_maintenance_predictions(db: Session = DbSession, context: RequestContext = RequestCtx):
    org = get_org(db, context.org_slug)
    return ApiEnvelope(data=build_maintenance_predictions(db, org.id))

