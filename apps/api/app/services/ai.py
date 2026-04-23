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
    query_lower = query.lower()
    top_inventory = context["inventory"][0] if context["inventory"] else None
    top_supplier = context["suppliers"][0] if context["suppliers"] else None
    top_logistics = context["logistics"][0] if context["logistics"] else None
    top_maintenance = context["maintenance"][0] if context["maintenance"] else None
    metric_map = {item["title"].lower(): item for item in context["metrics"]}

    if any(term in query_lower for term in ["reorder", "inventory", "stock", "sku"]):
        return dedent(
            f"""
            Based on the current inventory position, the top reorder candidate is {top_inventory['productName']} ({top_inventory['sku']}).

            - Recommended quantity: {top_inventory['recommendedQuantity']}
            - Urgency: {top_inventory['urgency']}
            - Projected stockout date: {top_inventory['projectedStockoutDate']}
            - Reason: {top_inventory['reasoning']}

            Recommended action: convert this recommendation into a purchase order first, then review the next highest urgency SKU.
            """
        ).strip()

    if any(term in query_lower for term in ["supplier", "vendor", "risk"]):
        return dedent(
            f"""
            The highest supplier risk currently sits with {top_supplier['supplierName']}.

            - Risk score: {top_supplier['riskScore']}
            - Risk level: {top_supplier['riskLevel']}
            - Recommendation: {top_supplier['recommendation']}

            The fastest mitigation is to reduce dependency on this supplier while tightening delivery and quality review.
            """
        ).strip()

    if any(term in query_lower for term in ["delay", "shipment", "logistics", "carrier", "route"]):
        return dedent(
            f"""
            The most exposed shipment right now is {top_logistics['shipmentNumber']}.

            - Delay probability: {top_logistics['delayProbability']}
            - Risk level: {top_logistics['riskLevel']}
            - Reason: {top_logistics['reasoning']}
            - Suggested mitigation: {top_logistics['recommendation']}

            If this lane matters to service level, escalate the carrier and secure contingency inventory now.
            """
        ).strip()

    if any(term in query_lower for term in ["maintenance", "asset", "machine", "failure", "downtime"]):
        return dedent(
            f"""
            The asset needing the fastest preventive action is {top_maintenance['assetName']}.

            - Failure probability: {top_maintenance['failureProbability']}
            - Risk level: {top_maintenance['riskLevel']}
            - Explanation: {top_maintenance['explanation']}
            - Next action: {top_maintenance['nextAction']}

            The operational priority is to inspect this asset before the next downtime window compounds.
            """
        ).strip()

    if any(term in query_lower for term in ["forecast", "demand", "trend", "seasonality"]):
        forecast_confidence = metric_map.get("forecast confidence", {}).get("value", "n/a")
        return dedent(
            f"""
            Demand signals are currently stable enough to plan against.

            - Forecast confidence: {forecast_confidence}
            - The current model view supports near-term replenishment planning.
            - Inventory and supplier actions matter more right now than model uncertainty.

            Best next step: use the Forecasting tab to run a fresh forecast cycle, then compare the what-if scenario before finalizing the buy plan.
            """
        ).strip()

    return dedent(
        f"""
        Based on the current system state, here is the best direct answer I can give for: "{query}"

        - Inventory priority: {top_inventory['sku']} with {top_inventory['recommendedQuantity']} units recommended
        - Supplier attention: {top_supplier['supplierName']} is the highest current supplier risk
        - Logistics watch item: {top_logistics['shipmentNumber']} has the highest shipment delay exposure
        - Maintenance watch item: {top_maintenance['assetName']} is the top preventive maintenance priority

        If you want a more natural, ChatGPT-style answer to open-ended questions, the live OpenAI request needs to succeed. Right now this response is coming from fallback mode using your system data.
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
