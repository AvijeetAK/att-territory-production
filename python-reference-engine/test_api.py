"""
BI_ATT Territory Intelligence Platform - API & Endpoints Unit Test Suite
========================================================================
Validates all REST endpoints using TestClient:
1. GET /api/hierarchy
2. GET /api/businesses (with and without query filters)
3. POST /api/audit/reveal-contact/{overture_gers_id} (success & 404)
4. GET /api/health
"""

import sys
from pathlib import Path

# Ensure backend root is on PYTHONPATH
BACKEND_DIR = Path(__file__).parent
sys.path.insert(0, str(BACKEND_DIR))

from main import app, TestClient


def test_hierarchy_endpoint() -> None:
    """Validates GET /api/hierarchy returns complete nested tree."""
    client = TestClient(app)
    response = client.get("/api/hierarchy")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert data["total_states"] == 3
    assert len(data["hierarchy"]) == 3

    # Check state names
    state_names = [s["state_name"] for s in data["hierarchy"]]
    assert "Texas" in state_names
    assert "California" in state_names
    assert "Georgia" in state_names

    # Check mall detection in sub-sub-regions
    found_mall = False
    for st in data["hierarchy"]:
        for sub in st["sub_regions"]:
            for ss in sub["sub_sub_regions"]:
                assert "center_lat" in ss
                assert "center_lng" in ss
                assert "default_zoom" in ss
                if ss["is_mall"]:
                    found_mall = True
    assert found_mall is True
    print("✓ test_hierarchy_endpoint PASSED")


def test_businesses_endpoint() -> None:
    """Validates GET /api/businesses with various query parameters."""
    client = TestClient(app)

    # 1. No filters: returns all 120 businesses
    res_all = client.get("/api/businesses")
    assert res_all.status_code == 200
    data_all = res_all.json()
    assert data_all["status"] == "SUCCESS"
    assert data_all["total_results"] == 120
    assert len(data_all["businesses"]) == 120

    # Check enrichment of first record
    first_biz = data_all["businesses"][0]
    assert "recommended_att_plan" in first_biz
    assert "pin_color_hex" in first_biz
    assert "compliance_metadata" in first_biz
    assert first_biz["compliance_metadata"]["costquest_bsl_fabric_free"] is True
    assert first_biz["compliance_metadata"]["google_maps_cached_fields"] is False

    # 2. Filter: ATT_ONLY
    res_att = client.get("/api/businesses?att_filter=ATT_ONLY")
    data_att = res_att.json()
    assert data_att["total_results"] == 40
    for b in data_att["businesses"]:
        assert b["is_att_customer"] == 1
        assert b["pin_color_hex"] == "#00A8E0"  # AT&T Blue

    # 3. Filter: NON_ATT_ONLY
    res_non_att = client.get("/api/businesses?att_filter=NON_ATT_ONLY")
    data_non_att = res_non_att.json()
    assert data_non_att["total_results"] == 80
    for b in data_non_att["businesses"]:
        assert b["is_att_customer"] == 0

    # 4. Filter: State TX
    res_tx = client.get("/api/businesses?state=TX")
    data_tx = res_tx.json()
    assert data_tx["total_results"] > 0
    for b in data_tx["businesses"]:
        assert b["state"] == "TX"

    # 5. Filter: Size tiers MICRO,SMALL
    res_micro_small = client.get("/api/businesses?size_tiers=MICRO,SMALL")
    data_ms = res_micro_small.json()
    for b in data_ms["businesses"]:
        assert b["size_tier"] in ("MICRO", "SMALL")

    print("✓ test_businesses_endpoint PASSED")


def test_audit_reveal_contact_endpoint() -> None:
    """Validates POST /api/audit/reveal-contact/{overture_gers_id}."""
    client = TestClient(app)

    # Fetch a valid GERS ID from the businesses endpoint
    res_biz = client.get("/api/businesses")
    biz_list = res_biz.json()["businesses"]
    valid_gers_id = biz_list[0]["overture_gers_id"]

    # 1. Success case
    res_audit = client.post(f"/api/audit/reveal-contact/{valid_gers_id}")
    assert res_audit.status_code == 200, f"Expected 200, got {res_audit.status_code}"
    audit_data = res_audit.json()
    assert audit_data["overture_gers_id"] == valid_gers_id
    assert audit_data["audit_log_id"].startswith("AUDIT-TCPA-")
    assert "timestamp_utc" in audit_data
    assert "revealed_contact" in audit_data
    assert "@" in audit_data["revealed_contact"]["direct_email"]
    assert "XX" not in audit_data["revealed_contact"]["direct_phone"]
    assert "compliance" in audit_data["regulatory_notice"].lower() or "tcpa" in audit_data["regulatory_notice"].lower()

    # 2. 404 Not Found case
    res_404 = client.post("/api/audit/reveal-contact/non_existent_gers_id_99999")
    assert res_404.status_code == 404, f"Expected 404, got {res_404.status_code}"

    print("✓ test_audit_reveal_contact_endpoint PASSED")


def test_health_endpoint() -> None:
    """Validates GET /api/health."""
    client = TestClient(app)
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "HEALTHY"
    print("✓ test_health_endpoint PASSED")


if __name__ == "__main__":
    print("Running BI_ATT FastAPI REST Service Tests...")
    test_hierarchy_endpoint()
    test_businesses_endpoint()
    test_audit_reveal_contact_endpoint()
    test_health_endpoint()
    print("\nALL 4 API TEST SUITES PASSED SUCCESSFULLY (100%)!")

