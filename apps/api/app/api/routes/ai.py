from fastapi import APIRouter
from sqlalchemy.orm import Session

from app.core.deps import DbSession, RequestContext, RequestCtx
from app.schemas import AIQueryRequest, AIQueryResponse, ApiEnvelope
from app.services.ai import answer_query

router = APIRouter()


@router.post("/query", response_model=ApiEnvelope[AIQueryResponse])
def query_ai(payload: AIQueryRequest, db: Session = DbSession, context: RequestContext = RequestCtx):
    answer = answer_query(db, context.org_slug, context.user_id, payload)
    return ApiEnvelope(data=AIQueryResponse(answer=answer))

