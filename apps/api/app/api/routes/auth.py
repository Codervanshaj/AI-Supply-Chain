from fastapi import APIRouter

from app.core.deps import RequestContext, RequestCtx
from app.schemas import ApiEnvelope

router = APIRouter()


@router.post("/session/verify", response_model=ApiEnvelope[dict])
def verify_session(context: RequestContext = RequestCtx):
    return ApiEnvelope(
        data={
            "authenticated": True,
            "userId": context.user_id,
            "role": context.user_role,
            "orgSlug": context.org_slug,
        }
    )

