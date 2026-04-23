from textwrap import dedent

from openai import OpenAI
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import AIConversation, AIMessage
from app.schemas import AIQueryRequest
from app.services.analytics import build_dashboard_insights, build_dashboard_summary, get_org


def build_ai_context(session: Session, org_slug: str) -> dict:
    summary = build_dashboard_summary(session, org_slug)
    insights = build_dashboard_insights(session, org_slug)
    return {
        "metrics": [item.model_dump() for item in summary.metrics],
        "inventory": [item.model_dump() for item in insights.inventory[:5]],
        "suppliers": [item.model_dump() for item in insights.suppliers[:3]],
        "logistics": [item.model_dump() for item in insights.logistics[:3]],
        "maintenance": [item.model_dump() for item in insights.maintenance[:3]],
    }


def _fallback_answer(query: str, context: dict) -> str:
    top_inventory = context["inventory"][0] if context["inventory"] else None
    top_supplier = context["suppliers"][0] if context["suppliers"] else None
    top_logistics = context["logistics"][0] if context["logistics"] else None
    return dedent(
        f"""
        Based on the current system state, here is the grounded recommendation for: "{query}"

        - Inventory: Prioritize {top_inventory['sku']} with recommended reorder quantity of {top_inventory['recommendedQuantity']} because available stock is below the forecast-adjusted reorder window.
        - Suppliers: {top_supplier['supplierName']} is the top risk contributor due to delays and dependency concentration. Build alternate coverage and tighten performance review.
        - Logistics: {top_logistics['shipmentNumber']} has the highest delay exposure. Expedite carrier follow-up and consider pulling contingency inventory.
        - Why this matters: forecast confidence remains healthy, but action speed on replenishment and supplier mitigation will determine whether service levels hold.
        """
    ).strip()


def answer_query(session: Session, org_slug: str, user_id: str, payload: AIQueryRequest) -> tuple[str, str]:
    context = build_ai_context(session, org_slug)
    org = get_org(session, org_slug)
    conversation = AIConversation(org_id=org.id, user_id=user_id, title=payload.query[:80])
    session.add(conversation)
    session.flush()
    session.add(AIMessage(conversation_id=conversation.id, role="user", content=payload.query))

    answer = _fallback_answer(payload.query, context)
    mode = "fallback"
    if settings.openai_api_key:
        try:
            client = OpenAI(api_key=settings.openai_api_key)
            response = client.responses.create(
                model=settings.openai_model,
                input=[
                    {
                        "role": "system",
                        "content": [
                            {
                                "type": "input_text",
                                "text": (
                                    "You are a supply chain operations copilot. Use only the provided structured context. "
                                    "Explain predictions, recommend actions, and include the reason behind each recommendation."
                                ),
                            }
                        ],
                    },
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "input_text",
                                "text": f"Context: {context}\n\nQuestion: {payload.query}",
                            }
                        ],
                    },
                ],
            )
            answer = getattr(response, "output_text", None) or answer
            if getattr(response, "output_text", None):
                mode = "openai"
        except Exception as exc:
            answer = f"{answer}\n\nLive OpenAI request failed, so fallback mode was used. Reason: {exc}"
            mode = "fallback"

    session.add(AIMessage(conversation_id=conversation.id, role="assistant", content=answer))
    session.commit()
    return answer, mode
