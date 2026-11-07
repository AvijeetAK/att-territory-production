"""
BI_ATT Territory Intelligence Platform - Deterministic Calculation Engine
========================================================================
Statutory Non-CPNI Outside-In Analytical Engine & Commercial AT&T Catalog.

LEGAL NOTICE:
All bandwidth, volume, and tier figures are deterministic calculations based
solely on external firmographic indicators (employee count, square footage, NAICS
vertical, public BGP/ASN routing, and FCC BDC public fiber hexagon presence).
Zero proprietary network traffic, DPI, CDR, or customer telemetry is utilized.
"""

from typing import Dict, Any, Union
from models import SizeTier, DncStatus

# Official AT&T Business Commercial Fiber & Dedicated Internet Catalog
ATT_PLANS: Dict[str, Dict[str, Any]] = {
    "ATT_FIBER_300": {
        "id": "ATT_FIBER_300",
        "name": "AT&T Business Fiber 300 Mbps Symmetric",
        "speed_download_mbps": 300,
        "speed_upload_mbps": 300,
        "is_symmetric": True,
        "monthly_rate_usd": 65.00,
        "ideal_for": "MICRO / Mall Kiosks / 1-4 employees",
        "target_size_tier": "MICRO",
        "service_type": "Broadband Fiber (FTTB / FTTP)",
        "sla": "99.9% Best-Effort Commercial Availability",
        "features": [
            "Synchronous 300/300 Mbps speed",
            "Unlimited business data (No throttling)",
            "Standard Wi-Fi 6 Business Gateway",
            "24/7 technical customer support"
        ]
    },
    "ATT_FIBER_500": {
        "id": "ATT_FIBER_500",
        "name": "AT&T Business Fiber 500 Mbps Symmetric + 5G Backup",
        "speed_download_mbps": 500,
        "speed_upload_mbps": 500,
        "is_symmetric": True,
        "monthly_rate_usd": 125.00,
        "ideal_for": "SMALL / 5-15 employees",
        "target_size_tier": "SMALL",
        "service_type": "Broadband Fiber with Cellular Failover",
        "sla": "99.9% Commercial Availability + Automatic Cellular Failover",
        "features": [
            "Synchronous 500/500 Mbps speed",
            "AT&T Wireless Broadband 5G Automatic Backup",
            "Zero downtime switchover protection",
            "AT&T Dynamic Defense cyber protection"
        ]
    },
    "ATT_FIBER_1G": {
        "id": "ATT_FIBER_1G",
        "name": "AT&T Business Fiber 1 Gbps Symmetric + Static IP",
        "speed_download_mbps": 1000,
        "speed_upload_mbps": 1000,
        "is_symmetric": True,
        "monthly_rate_usd": 180.00,
        "ideal_for": "SMALL/MEDIUM / 16-40 employees",
        "target_size_tier": "SMALL",
        "service_type": "High-Throughput Commercial Fiber",
        "sla": "99.9% Commercial Availability + Static IP Pool",
        "features": [
            "Synchronous 1000/1000 Mbps gigabit throughput",
            "Block of 5 Static IPs included for VPN & POS hosts",
            "Enhanced commercial Wi-Fi 6E dual-mesh hardware",
            "Priority repair routing within 4 hours"
        ]
    },
    "ATT_FIBER_2G_5G": {
        "id": "ATT_FIBER_2G_5G",
        "name": "AT&T Business Fiber 2 Gbps / 5 Gbps Symmetric",
        "speed_download_mbps": 2000,
        "speed_upload_mbps": 2000,
        "is_symmetric": True,
        "monthly_rate_usd": 325.00,
        "ideal_for": "MEDIUM / 41-100 employees",
        "target_size_tier": "MEDIUM",
        "service_type": "Hyper-Gig Enterprise Fiber",
        "sla": "99.95% Commercial SLA + Proactive Performance Monitoring",
        "features": [
            "2 to 5 Gbps symmetrical line capacity",
            "Multi-gigabit 10G-ready optical network terminal (ONT)",
            "Dedicated BGP sub-allocation and static subnet",
            "Support for 100+ concurrent VoIP, video conferencing & POS lines"
        ]
    },
    "ATT_ADI_10G": {
        "id": "ATT_ADI_10G",
        "name": "AT&T Dedicated Internet (ADI) up to 10 Gbps + 99.99% SLA + Managed SD-WAN",
        "speed_download_mbps": 10000,
        "speed_upload_mbps": 10000,
        "is_symmetric": True,
        "monthly_rate_usd": 1450.00,
        "ideal_for": "LARGE / 100+ employees",
        "target_size_tier": "LARGE",
        "service_type": "Dedicated Internet Access (ADI)",
        "sla": "99.99% Guaranteed Availability with Financial Credit Backing",
        "features": [
            "Symmetrical dedicated bandwidth with zero oversubscription",
            "Strict latency (< 37ms) and jitter (< 1ms) guarantees",
            "Managed Cisco/Meraki SD-WAN edge router included",
            "24/7/365 Dedicated Network Operations Center (NOC) escalation"
        ]
    }
}

# Color palettes for cartographic markers
PIN_COLORS: Dict[str, str] = {
    "ATT_CUSTOMER": "#00A8E0",  # AT&T Blue (Override)
    "MICRO": "#F59E0B",         # Amber
    "SMALL": "#10B981",         # Green
    "MEDIUM": "#8B5CF6",        # Purple
    "LARGE": "#EF4444"          # Red
}

# Legacy coaxial / cable ISP signatures
LEGACY_COAX_KEYWORDS = (
    "comcast", "spectrum", "charter", "cox", "optimum", "altice",
    "xfinity", "mediacom", "breezeline", "suddenlink", "midco",
    "cable", "coax", "docsis"
)

# High-bandwidth vertical keywords
HIGH_BANDWIDTH_VERTICALS = (
    "tech", "technology", "software", "medical", "healthcare", "health",
    "finance", "financial", "media", "creative", "multi-pos", "retail",
    "hospital", "clinic", "biotech"
)


def _classify_size_tier(employee_count: int) -> SizeTier:
    """Classifies commercial organization into strict employee size tier."""
    if employee_count <= 4:
        return SizeTier.MICRO
    elif employee_count <= 25:
        return SizeTier.SMALL
    elif employee_count <= 100:
        return SizeTier.MEDIUM
    else:
        return SizeTier.LARGE


def _get_industry_multiplier(industry_category: str) -> int:
    """
    Returns outside-in bandwidth multiplier (Mbps per employee):
    - Tech / Medical / Media / Finance = 25 Mbps/emp
    - Retail / Cafe / Hospitality / Food = 15 Mbps/emp
    - Kiosk / Boutique / Cart = 12 Mbps/emp
    - Fallback = 15 Mbps/emp
    """
    cat = (industry_category or "").lower()

    if any(k in cat for k in ("tech", "software", "medical", "health", "media", "finance", "financial", "biotech")):
        return 25
    elif any(k in cat for k in ("kiosk", "boutique", "stand", "cart", "apparel")):
        return 12
    elif any(k in cat for k in ("retail", "cafe", "restaurant", "hospitality", "food", "bar", "lodging")):
        return 15
    else:
        return 15


def _is_legacy_coax(isp_name: str) -> bool:
    """Identifies whether competitor delivers legacy asymmetric coax/cable."""
    name = (isp_name or "").lower()
    return any(k in name for k in LEGACY_COAX_KEYWORDS)


def _is_high_bandwidth_vertical(industry_category: str) -> bool:
    """Identifies if vertical demands high-throughput symmetrical fiber."""
    cat = (industry_category or "").lower()
    return any(k in cat for k in HIGH_BANDWIDTH_VERTICALS)


def calculate_outside_in_requirements(
    employee_count: int,
    sqft: int,
    industry_category: str,
    is_att_customer: bool,
    fcc_fiber_hex_available: bool,
    current_isp_name: str,
    dnc_status: Union[str, DncStatus]
) -> Dict[str, Any]:
    """
    Deterministic outside-in telecom sizing and propensity scoring engine.
    Calculates size tier, non-CPNI modeled bandwidth, data volume, plan match, and conversion score.
    """
    # 1. Classify Size Tier
    size_tier = _classify_size_tier(employee_count)

    # 2. Determine Pin Color
    if is_att_customer:
        pin_color = PIN_COLORS["ATT_CUSTOMER"]
    else:
        pin_color = PIN_COLORS[size_tier.value]

    # 3. Calculate modeled_bandwidth_mbps (Outside-In Non-CPNI Formula)
    multiplier = _get_industry_multiplier(industry_category)
    calculated_base = (employee_count * multiplier) + int((sqft / 100.0) * 2)
    modeled_bandwidth_mbps = max(50, calculated_base)

    # 4. Calculate modeled_monthly_tb
    modeled_monthly_tb = round(modeled_bandwidth_mbps * 0.0032, 2)

    # 5. Deterministic Plan Matching
    if size_tier == SizeTier.LARGE or modeled_bandwidth_mbps > 2000:
        recommended_att_plan_id = "ATT_ADI_10G"
    elif size_tier == SizeTier.MEDIUM or modeled_bandwidth_mbps > 1000:
        recommended_att_plan_id = "ATT_FIBER_2G_5G"
    elif modeled_bandwidth_mbps > 500:
        recommended_att_plan_id = "ATT_FIBER_1G"
    elif modeled_bandwidth_mbps > 300 or size_tier == SizeTier.SMALL:
        recommended_att_plan_id = "ATT_FIBER_500"
    else:
        recommended_att_plan_id = "ATT_FIBER_300"

    plan_details = ATT_PLANS[recommended_att_plan_id]

    # 6. Calculate Conversion / Upsell Score (0 to 99)
    dnc_str = dnc_status.value if isinstance(dnc_status, DncStatus) else str(dnc_status)
    is_dnc_cleared = (dnc_str == "CLEARED_B2B")
    is_high_vert = _is_high_bandwidth_vertical(industry_category)
    is_coax = _is_legacy_coax(current_isp_name)

    if is_att_customer:
        # Existing Customer Upsell Propensity (40 to 65)
        score = 40
        if fcc_fiber_hex_available:
            score += 10
        if is_high_vert:
            score += 10
        if modeled_bandwidth_mbps > 500:
            score += 5
        conversion_score_pct = min(65, max(40, score))
    else:
        # Off-Net Competitor Win-Back Propensity (0 to 99)
        score = 0
        if fcc_fiber_hex_available:
            score += 35
        if is_coax:
            score += 25
        if is_high_vert:
            score += 20
        if is_dnc_cleared:
            score += 15
        conversion_score_pct = min(99, max(0, score))

    return {
        "size_tier": size_tier,
        "pin_color": pin_color,
        "modeled_bandwidth_mbps": modeled_bandwidth_mbps,
        "modeled_monthly_tb": modeled_monthly_tb,
        "recommended_att_plan_id": recommended_att_plan_id,
        "recommended_plan_name": plan_details["name"],
        "recommended_plan_speed": f"{plan_details['speed_download_mbps']} Mbps",
        "recommended_plan_mrc_usd": plan_details["monthly_rate_usd"],
        "conversion_score_pct": conversion_score_pct,
        "is_coax_competitor": is_coax,
        "is_high_bandwidth_vertical": is_high_vert,
        "statutory_badge": "Outside-In AI Firmographic Estimate (Non-CPNI)"
    }

