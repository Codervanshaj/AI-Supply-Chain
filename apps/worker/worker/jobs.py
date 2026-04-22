from datetime import datetime

import httpx

from worker.config import settings


def refresh_forecasts() -> dict:
    with httpx.Client(timeout=30.0) as client:
        response = client.post(f"{settings.api_base_url}/forecast/run")
        response.raise_for_status()
    return {"job": "refresh_forecasts", "executed_at": datetime.utcnow().isoformat()}


def generate_weekly_report() -> dict:
    with httpx.Client(timeout=30.0) as client:
        response = client.post(
            f"{settings.api_base_url}/ai/query",
            json={"query": "Generate a weekly executive summary with key actions."},
        )
        response.raise_for_status()
    return {"job": "generate_weekly_report", "executed_at": datetime.utcnow().isoformat()}

