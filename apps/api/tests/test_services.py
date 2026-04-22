from app.services.analytics import _risk_level


def test_risk_level_thresholds():
    assert _risk_level(0.2) == "low"
    assert _risk_level(0.42) == "medium"
    assert _risk_level(0.7) == "high"
    assert _risk_level(0.92) == "critical"

