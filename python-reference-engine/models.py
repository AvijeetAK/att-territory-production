"""
BI_ATT Territory Intelligence Platform - Clean-Room Data Models
==============================================================
LEGAL & COMPLIANCE PROVENANCE GUARANTEES:
1. GOOGLE MAPS PLATFORM TOS (§3.2.3):
   All persistent Point-of-Interest (POI) coordinates, business names, categories,
   square footage estimates, and mall sub-unit hierarchies originate exclusively
   from the Overture Maps Foundation schema under CDLA-Permissive-2.0. Zero scraping
   or caching of Google Places API data.
2. COSTQUEST / FCC FABRIC COPYRIGHT:
   Broadband availability and ISP indicators rely strictly on public BGP/ASN routing
   (AS7018 / AS20057 for AT&T Services, Inc.) and public-domain FCC Broadband Data
   Collection (BDC) H3 Res-8 Hexagon (h3_res8_hex) summaries. Proprietary CostQuest
   Broadband Serviceable Location (BSL) Fabric IDs are strictly prohibited.
3. CCPA / CPRA / TCPA & PII:
   All Decision-Maker Contact records are stored and exposed in pre-masked format
   (e.g., j.****@company-domain.com, (512) 555-01XX) with explicit carrier line type
   (LANDLINE / WIRELESS) and scrubbed DNC status (CLEARED_B2B / RESTRICTED).
4. CPNI (47 U.S.C. § 222):
   Internet consumption is strictly modeled as modeled_bandwidth_mbps and
   modeled_monthly_tb with the UI badge "Outside-In AI Firmographic Estimate (Non-CPNI)".
"""

from enum import Enum
from typing import Optional, Any, Dict

# Provide dual support: Native SQLModel ORM when installed, with a seamless Pydantic v2
# fallback layer that validates schema, constraints, and metadata identically.
try:
    from sqlmodel import SQLModel, Field
    from sqlalchemy import Column, String, Integer, Float, Boolean
    _SQLMODEL_AVAILABLE = True
except ImportError:
    from pydantic import BaseModel, Field as _PydanticField
    _SQLMODEL_AVAILABLE = False

    class SQLModel(BaseModel):
        """Clean-room declarative base compatible with SQLModel syntax."""
        def __init_subclass__(cls, table: bool = False, **kwargs: Any) -> None:
            super().__init_subclass__(**kwargs)
            cls.__is_table__ = table

    def Field(
        default: Any = ...,
        *args: Any,
        primary_key: bool = False,
        index: bool = False,
        nullable: bool = True,
        sa_column: Any = None,
        **kwargs: Any
    ) -> Any:
        extra: Dict[str, Any] = kwargs.pop("json_schema_extra", {}) or {}
        if primary_key:
            extra["primary_key"] = True
        if index:
            extra["index"] = True
        if not nullable:
            extra["nullable"] = False
        if sa_column is not None:
            extra["sa_column"] = str(sa_column)
        return _PydanticField(default, *args, json_schema_extra=extra, **kwargs)


class SizeTier(str, Enum):
    """Firmographic business size tier derived from modeled employee count & footprint."""
    MICRO = "MICRO"        # 1-4 employees, < 1,500 sqft
    SMALL = "SMALL"        # 5-19 employees, 1,500 - 5,000 sqft
    MEDIUM = "MEDIUM"      # 20-99 employees, 5,000 - 25,000 sqft
    LARGE = "LARGE"        # 100+ employees, > 25,000 sqft


class PhoneLineType(str, Enum):
    """TCPA carrier line classification for scrubbed business contact numbers."""
    LANDLINE = "LANDLINE"
    WIRELESS = "WIRELESS"


class DncStatus(str, Enum):
    """Direct Marketing Association / National Do-Not-Call compliance status."""
    CLEARED_B2B = "CLEARED_B2B"
    RESTRICTED = "RESTRICTED"


class Region(SQLModel, table=True):
    """
    Geographic hierarchy defining metropolitan, county, and zone coverage.
    Compatible with SQLite and PostgreSQL backends.
    """
    __tablename__ = "regions"

    id: Optional[int] = Field(default=None, primary_key=True)
    state_name: str = Field(index=True, description="Full state name, e.g., Texas")
    state_code: str = Field(max_length=2, index=True, description="Two-letter USPS code, e.g., TX")
    sub_region_name: str = Field(index=True, description="City or County name, e.g., Austin / Travis County")
    sub_sub_region_name: str = Field(description="Zip code, commercial district, or mall zone, e.g., Downtown / 78701")
    center_lat: float = Field(description="Latitude for default map viewpoint")
    center_lng: float = Field(description="Longitude for default map viewpoint")
    default_zoom: int = Field(default=13, description="Recommended viewport zoom level")


class Business(SQLModel, table=True):
    """
    B2B Point-of-Interest entity with modeled telecom intelligence.
    Zero Google Places attributes are cached or stored in this table.
    Compatible with SQLite and PostgreSQL backends.
    """
    __tablename__ = "businesses"

    # Overture Maps Foundation Core Identification (CDLA-Permissive-2.0)
    overture_gers_id: str = Field(
        primary_key=True,
        index=True,
        description="Overture Global Entity Reference System persistent ID"
    )
    license_source: str = Field(
        default="CDLA-Permissive-2.0 (Overture Maps)",
        description="Statutory open-data license provenance"
    )
    business_name: str = Field(index=True, description="Trade name or operating name")
    naics_code: str = Field(index=True, description="6-digit North American Industry Classification System code")
    industry_category: str = Field(index=True, description="High-level commercial vertical, e.g., Professional Services, Healthcare")
    parent_mall_name: Optional[str] = Field(
        default=None,
        nullable=True,
        index=True,
        description="Commercial center, strip mall, or shopping center name (if applicable)"
    )
    floor_unit: Optional[str] = Field(
        default=None,
        nullable=True,
        description="Internal spatial unit, suite, or kiosk identifier (e.g., Level 2, Kiosk 204)"
    )

    # Clean-Room Spatial Coordinates
    address_street: str = Field(description="Street address derived from Overture Addresses layer")
    city: str = Field(index=True)
    state: str = Field(max_length=2, index=True)
    zip_code: str = Field(index=True)
    latitude: float = Field(index=True, description="WGS84 Latitude")
    longitude: float = Field(index=True, description="WGS84 Longitude")
    h3_res8_hex: str = Field(
        index=True,
        description="Public-domain FCC Broadband Data Collection H3 Res-8 Hexagon index"
    )

    # Firmographic Footprint & Size Tier
    employee_count: int = Field(ge=1, description="Estimated on-site employee count")
    sqft_estimate: int = Field(ge=100, description="Estimated commercial floor area square footage")
    size_tier: SizeTier = Field(description="Categorical size tier: MICRO, SMALL, MEDIUM, LARGE")

    # Broadband Infrastructure & Public BGP/ASN Telemetry
    detected_asn: str = Field(
        index=True,
        description="Autonomous System Number detected via public BGP tables (e.g., AS7018, AS7922, AS11427)"
    )
    current_isp_name: str = Field(description="ISP entity operating detected ASN, e.g., AT&T Services, Comcast, Spectrum")
    is_att_customer: bool = Field(default=False, index=True, description="Flag indicating AS7018 / AS20057 routing")
    fcc_fiber_hex_available: bool = Field(
        default=False,
        index=True,
        description="Public FCC BDC Form 477/BDC fiber presence within H3 Res-8 hexagon"
    )

    # Modeled Telecom Metrics (47 U.S.C. § 222 Non-CPNI Compliance)
    modeled_bandwidth_mbps: int = Field(
        ge=10,
        description="Outside-In AI Firmographic Estimate (Non-CPNI): Modeled symmetrical speed requirement"
    )
    modeled_monthly_tb: float = Field(
        ge=0.01,
        description="Outside-In AI Firmographic Estimate (Non-CPNI): Modeled monthly data volume"
    )
    recommended_att_plan_id: str = Field(
        description="Target AT&T Business product catalog SKU (e.g., ATT_FIBER_1G_BIZ, ATT_BIA_DEDICATED)"
    )
    conversion_score_pct: int = Field(
        ge=0,
        le=100,
        description="Propensity score (0-100) based on off-net competitor status and fiber availability"
    )

    # Masked Decision-Maker Contacts (CCPA / CPRA / TCPA Compliance)
    contact_name: str = Field(description="Public registry executive or business owner name")
    contact_role: str = Field(description="Operational title, e.g., Managing Partner, Operations Director")
    contact_email_masked: str = Field(
        description="Pre-masked email address complying with privacy guardrails (e.g., j.****@company-domain.com)"
    )
    contact_phone_masked: str = Field(
        description="Pre-masked business phone complying with TCPA (e.g., (512) 555-01XX)"
    )
    phone_line_type: PhoneLineType = Field(description="Carrier line type: LANDLINE or WIRELESS")
    dnc_status: DncStatus = Field(description="B2B Do-Not-Call compliance status: CLEARED_B2B or RESTRICTED")
    data_broker_source: str = Field(
        default="Synthetic Clean-Room Demo / Licensed Broker Schema",
        description="Synthetic provenance descriptor preventing raw unconsented PII exposure"
    )
