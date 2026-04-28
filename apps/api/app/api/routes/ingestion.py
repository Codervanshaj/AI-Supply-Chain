from fastapi import APIRouter, UploadFile
from sqlalchemy.orm import Session

from app.core.deps import DbSession, RequestContext, RequestCtx
from app.schemas import ApiEnvelope, IngestionEventRequest
from app.services.integration import ingest_event, parse_upload_content

router = APIRouter()


@router.post("/upload", response_model=ApiEnvelope[dict])
async def upload_file(
    file: UploadFile,
    db: Session = DbSession,
    context: RequestContext = RequestCtx,
):
    content = await file.read()
    records = parse_upload_content(content, file.filename)

    processed = 0
    entities: dict[str, int] = {}
    for row in records:
        entity = str(row.get("entity", "")).strip().lower()
        payload = row.get("payload", {})
        if not entity or not isinstance(payload, dict):
            continue
        ingest_event(db, context.org_slug, entity, payload)
        entities[entity] = entities.get(entity, 0) + 1
        processed += 1

    db.commit()
    return ApiEnvelope(
        data={
            "filename": file.filename,
            "bytes": len(content),
            "status": "processed",
            "processed": processed,
            "entities": entities,
        }
    )


@router.post("/events", response_model=ApiEnvelope[dict])
def ingest(payload: IngestionEventRequest, db: Session = DbSession, context: RequestContext = RequestCtx):
    result = ingest_event(db, context.org_slug, payload.entity, payload.payload)
    db.commit()
    return ApiEnvelope(data={"status": "accepted", **result})
