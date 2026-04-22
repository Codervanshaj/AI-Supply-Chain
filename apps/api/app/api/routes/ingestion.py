from fastapi import APIRouter, UploadFile

from app.schemas import ApiEnvelope, IngestionEventRequest

router = APIRouter()


@router.post("/upload", response_model=ApiEnvelope[dict])
async def upload_file(file: UploadFile):
    # In production, this would stream to object storage and trigger async normalization.
    content = await file.read()
    return ApiEnvelope(
        data={
            "filename": file.filename,
            "bytes": len(content),
            "status": "queued",
        }
    )


@router.post("/events", response_model=ApiEnvelope[dict])
def ingest_event(payload: IngestionEventRequest):
    return ApiEnvelope(data={"status": "accepted", "entity": payload.entity, "payload": payload.payload})

