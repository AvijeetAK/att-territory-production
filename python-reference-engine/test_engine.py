"""
BI_ATT Territory Intelligence Platform - Calculation Engine Unit Tests
======================================================================
Validates deterministic calculations across all 5 commercial tiers,
pin color assignments, non-CPNI bandwidth formulas, and conversion scores.
"""

import sys
from pathlib import Path

# Ensure backend root is on PYTHONPATH
sys.path.insert(0, str(Path(__file__).parent))

from engine import calculate_outside_in_requirements, ATT_PLANS, PIN_COLORS
from models import SizeTier, DncStatus


def test_att_plans_catalog() -> None:
    """Verifies all 5 commercial plans are properly configured."""
    required_plans = [
        "ATT_FIBER_300",
        "ATT_FIBER_500",
        "ATT_FIBER_1G",
        "ATT_FIBER_2G_5G",
        "ATT_ADI_10G"
    ]
    for plan_id in required_plans:
        assert plan_id in ATT_PLANS, f"Missing plan: {plan_id}"
        plan = ATT_PLANS[plan_id]
        assert plan["is_symmetric"] is True
        assert plan["speed_download_mbps"] > 0
        assert plan["monthly_rate_usd"] > 0
        assert "sla" in plan
    print("✓ test_att_plans_catalog PASSED")


def test_micro_tier() -> None:
    """Tests MICRO business (Mall Kiosk, 2 employees, 300 sqft)."""
    res = calculate_outside_in_requirements(
        employee_count=2,
        sqft=300,
        industry_category="Mall Kiosk / Apparel Boutique",
        is_att_customer=False,
        fcc_fiber_hex_available=False,
        current_isp_name="Spectrum Business Cable",
        dnc_status=DncStatus.CLEARED_B2B
    )
    assert res["size_tier"] == SizeTier.MICRO
    assert res["pin_color"] == PIN_COLORS["MICRO"]  # Amber (#F59E0B)
    assert res["recommended_att_plan_id"] == "ATT_FIBER_300"
    assert res["modeled_bandwidth_mbps"] >= 50
    assert res["modeled_monthly_tb"] == round(res["modeled_bandwidth_mbps"] * 0.0032, 2)
    print("✓ test_micro_tier PASSED")


def test_small_tier() -> None:
    """Tests SMALL business (Retail / Cafe, 12 employees, 2,500 sqft)."""
    res = calculate_outside_in_requirements(
        employee_count=12,
        sqft=2500,
        industry_category="Retail Cafe / Restaurant",
        is_att_customer=False,
        fcc_fiber_hex_available=True,
        current_isp_name="Comcast Business Coax",
        dnc_status=DncStatus.CLEARED_B2B
    )
    assert res["size_tier"] == SizeTier.SMALL
    assert res["pin_color"] == PIN_COLORS["SMALL"]  # Green (#10B981)
    assert res["recommended_att_plan_id"] == "ATT_FIBER_500"
    # Bandwidth: 12 * 15 + (2500 / 100) * 2 = 180 + 50 = 230 Mbps (min 50)
    assert res["modeled_bandwidth_mbps"] == 230
    assert res["modeled_monthly_tb"] == 0.74
    print("✓ test_small_tier PASSED")


def test_small_medium_high_throughput() -> None:
    """Tests SMALL business with high throughput demanding 1 Gbps."""
    res = calculate_outside_in_requirements(
        employee_count=20,
        sqft=6000,
        industry_category="Healthcare / Medical Clinic",
        is_att_customer=False,
        fcc_fiber_hex_available=True,
        current_isp_name="Charter Cable",
        dnc_status=DncStatus.CLEARED_B2B
    )
    assert res["size_tier"] == SizeTier.SMALL
    # Bandwidth: 20 * 25 + (6000 / 100) * 2 = 500 + 120 = 620 Mbps
    assert res["modeled_bandwidth_mbps"] == 620
    assert res["recommended_att_plan_id"] == "ATT_FIBER_1G"
    print("✓ test_small_medium_high_throughput PASSED")


def test_medium_tier() -> None:
    """Tests MEDIUM business (Tech Software Office, 50 employees, 12,000 sqft)."""
    res = calculate_outside_in_requirements(
        employee_count=50,
        sqft=12000,
        industry_category="Software Technology",
        is_att_customer=False,
        fcc_fiber_hex_available=True,
        current_isp_name="Cox Communications",
        dnc_status=DncStatus.CLEARED_B2B
    )
    assert res["size_tier"] == SizeTier.MEDIUM
    assert res["pin_color"] == PIN_COLORS["MEDIUM"]  # Purple (#8B5CF6)
    # Bandwidth: 50 * 25 + 240 = 1490 Mbps -> ATT_FIBER_2G_5G
    assert res["recommended_att_plan_id"] == "ATT_FIBER_2G_5G"
    print("✓ test_medium_tier PASSED")


def test_large_tier_adi() -> None:
    """Tests LARGE enterprise (Financial Headquarters, 150 employees, 35,000 sqft)."""
    res = calculate_outside_in_requirements(
        employee_count=150,
        sqft=35000,
        industry_category="Financial Investment Banking",
        is_att_customer=False,
        fcc_fiber_hex_available=True,
        current_isp_name="Lumen Fiber",
        dnc_status=DncStatus.CLEARED_B2B
    )
    assert res["size_tier"] == SizeTier.LARGE
    assert res["pin_color"] == PIN_COLORS["LARGE"]  # Red (#EF4444)
    assert res["recommended_att_plan_id"] == "ATT_ADI_10G"
    print("✓ test_large_tier_adi PASSED")


def test_att_customer_color_override() -> None:
    """Verifies that an existing AT&T customer ALWAYS gets AT&T Blue."""
    res = calculate_outside_in_requirements(
        employee_count=300,
        sqft=80000,
        industry_category="Healthcare",
        is_att_customer=True,
        fcc_fiber_hex_available=True,
        current_isp_name="AT&T Services, Inc. (AS7018)",
        dnc_status=DncStatus.CLEARED_B2B
    )
    assert res["size_tier"] == SizeTier.LARGE
    assert res["pin_color"] == PIN_COLORS["ATT_CUSTOMER"]  # Strictly #00A8E0
    # Upsell score range: 40 to 65
    assert 40 <= res["conversion_score_pct"] <= 65
    print("✓ test_att_customer_color_override PASSED")


def test_conversion_score_weightings() -> None:
    """Verifies off-net conversion score weighted components."""
    # Max score case: 35 (FCC) + 25 (Coax) + 20 (High Vert) + 15 (DNC) = 95
    max_res = calculate_outside_in_requirements(
        employee_count=10,
        sqft=2000,
        industry_category="Technology Software",
        is_att_customer=False,
        fcc_fiber_hex_available=True,
        current_isp_name="Comcast Cable Communications",
        dnc_status=DncStatus.CLEARED_B2B
    )
    assert max_res["conversion_score_pct"] == 95

    # Partial score case: 35 (FCC) + 0 (Fiber ISP) + 20 (Finance) + 0 (Restricted DNC) = 55
    part_res = calculate_outside_in_requirements(
        employee_count=10,
        sqft=2000,
        industry_category="Finance",
        is_att_customer=False,
        fcc_fiber_hex_available=True,
        current_isp_name="Verizon Fios Fiber",
        dnc_status=DncStatus.RESTRICTED
    )
    assert part_res["conversion_score_pct"] == 55

    # Zero score case: 0 (No FCC) + 0 (Fiber) + 0 (Warehouse) + 0 (Restricted) = 0
    zero_res = calculate_outside_in_requirements(
        employee_count=10,
        sqft=2000,
        industry_category="Warehousing / Storage",
        is_att_customer=False,
        fcc_fiber_hex_available=False,
        current_isp_name="Zayo Dedicated Fiber",
        dnc_status=DncStatus.RESTRICTED
    )
    assert zero_res["conversion_score_pct"] == 0
    print("✓ test_conversion_score_weightings PASSED")


if __name__ == "__main__":
    print("Running BI_ATT Deterministic Engine Unit Tests...")
    test_att_plans_catalog()
    test_micro_tier()
    test_small_tier()
    test_small_medium_high_throughput()
    test_medium_tier()
    test_large_tier_adi()
    test_att_customer_color_override()
    test_conversion_score_weightings()
    print("\nALL 8 UNIT TEST SUITES PASSED SUCCESSFULLY (100%)!")

