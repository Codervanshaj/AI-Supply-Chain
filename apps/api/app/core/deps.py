from dataclasses import dataclass

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.core.database import get_db


@dataclass
class RequestContext:
    org_slug: str
    user_role: str
    user_id: str


def get_request_context(
    x_org_slug: str | None = Header(default="demo-org"),
    x_user_role: str | None = Header(default="owner"),
    x_user_id: str | None = Header(default="demo-user"),
) -> RequestContext:
    return RequestContext(
        org_slug=x_org_slug or "demo-org",
        user_role=x_user_role or "owner",
        user_id=x_user_id or "demo-user",
    )


DbSession = Depends(get_db)
RequestCtx = Depends(get_request_context)

