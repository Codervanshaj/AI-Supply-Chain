from fastapi import APIRouter
from sqlalchemy.orm import Session

from app.core.deps import DbSession, RequestContext, RequestCtx
from app.schemas import ApiEnvelope, SupplierRiskScore
from app.services.analytics import build_supplier_risk, get_org

router = APIRouter()


@router.get("/risk", response_model=ApiEnvelope[list[SupplierRiskScore]])
def get_supplier_risk(db: Session = DbSession, context: RequestContext = RequestCtx):
    org = get_org(db, context.org_slug)
    return ApiEnvelope(data=build_supplier_risk(db, org.id))

