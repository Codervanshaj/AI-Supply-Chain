from datetime import date, timedelta

from fastapi import APIRouter

from app.schemas import ApiEnvelope, ReportItem

router = APIRouter()


@router.get("", response_model=ApiEnvelope[list[ReportItem]])
def list_reports():
    return ApiEnvelope(
        data=[
            ReportItem(
                id="weekly-brief",
                name="Weekly Executive Brief",
                reportType="executive",
                generatedAt=date.today(),
                status="ready",
            ),
            ReportItem(
                id="risk-pack",
                name="Supplier Risk Deep Dive",
                reportType="supplier",
                generatedAt=date.today() - timedelta(days=1),
                status="ready",
            ),
        ]
    )

