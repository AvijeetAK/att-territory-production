"""
BI_ATT Territory Intelligence Platform - Clean-Room Geospatial Seed Script
=========================================================================
Generates 120 synthetic B2B businesses adhering to Overture Maps Foundation
schema (CDLA-Permissive-2.0), public BGP/ASN routing, FCC BDC H3 hexagon bins,
and CCPA/TCPA pre-masked contact data across 3 US Regions, 6 Sub-regions, and
9 Sub-sub-regions (including indoor mall micro-kiosks and suites).
"""

import sys
import random
import hashlib
from pathlib import Path
from typing import List, Dict, Any

# Ensure backend root is on PYTHONPATH
BACKEND_DIR = Path(__file__).parent
sys.path.insert(0, str(BACKEND_DIR))

from database import init_clean_room_db, get_db_connection, SQLITE_DB_PATH
from engine import calculate_outside_in_requirements
from models import SizeTier, PhoneLineType, DncStatus

# Set deterministic random seed for repeatable, audited data generation
random.seed(42)

# Hierarchy definition: 3 Regions -> 6 Sub-Regions -> 9 Sub-Sub-Regions
REGIONS_HIERARCHY = [
    # Region 1: Texas
    {
        "id": 1,
        "state_name": "Texas",
        "state_code": "TX",
        "sub_region_name": "Austin Metro (Travis County)",
        "sub_sub_region_name": "Downtown Austin (78701)",
        "center_lat": 30.2672,
        "center_lng": -97.7431,
        "default_zoom": 15,
        "is_mall": False,
        "h3_hex": "882681e041fffff",
        "area_code": "512",
        "city": "Austin",
        "zip_code": "78701"
    },
    {
        "id": 2,
        "state_name": "Texas",
        "state_code": "TX",
        "sub_region_name": "Austin Metro (Travis County)",
        "sub_sub_region_name": "The Domain Shopping Center (78758 - Mall Complex)",
        "center_lat": 30.4021,
        "center_lng": -97.7259,
        "default_zoom": 17,
        "is_mall": True,
        "mall_name": "The Domain Shopping Center",
        "h3_hex": "882681a257fffff",
        "area_code": "512",
        "city": "Austin",
        "zip_code": "78758"
    },
    {
        "id": 3,
        "state_name": "Texas",
        "state_code": "TX",
        "sub_region_name": "Austin East & Tech Corridor",
        "sub_sub_region_name": "East Austin Innovation District (78702)",
        "center_lat": 30.2625,
        "center_lng": -97.7230,
        "default_zoom": 15,
        "is_mall": False,
        "h3_hex": "882681e047fffff",
        "area_code": "512",
        "city": "Austin",
        "zip_code": "78702"
    },

    # Region 2: California
    {
        "id": 4,
        "state_name": "California",
        "state_code": "CA",
        "sub_region_name": "Silicon Valley / San Jose",
        "sub_sub_region_name": "Downtown San Jose (95113)",
        "center_lat": 37.3382,
        "center_lng": -121.8863,
        "default_zoom": 15,
        "is_mall": False,
        "h3_hex": "8828308281fffff",
        "area_code": "408",
        "city": "San Jose",
        "zip_code": "95113"
    },
    {
        "id": 5,
        "state_name": "California",
        "state_code": "CA",
        "sub_region_name": "Silicon Valley / San Jose",
        "sub_sub_region_name": "Westfield Valley Fair Mall (95050 - Mall Complex)",
        "center_lat": 37.3257,
        "center_lng": -121.9449,
        "default_zoom": 17,
        "is_mall": True,
        "mall_name": "Westfield Valley Fair Mall",
        "h3_hex": "88283082b7fffff",
        "area_code": "408",
        "city": "Santa Clara",
        "zip_code": "95050"
    },
    {
        "id": 6,
        "state_name": "California",
        "state_code": "CA",
        "sub_region_name": "Santa Clara High-Tech Corridor",
        "sub_sub_region_name": "Santana Row Commercial District (95128)",
        "center_lat": 37.3215,
        "center_lng": -121.9479,
        "default_zoom": 16,
        "is_mall": False,
        "h3_hex": "88283082b3fffff",
        "area_code": "408",
        "city": "San Jose",
        "zip_code": "95128"
    },

    # Region 3: Georgia
    {
        "id": 7,
        "state_name": "Georgia",
        "state_code": "GA",
        "sub_region_name": "Atlanta Metro",
        "sub_sub_region_name": "Midtown Atlanta (30309)",
        "center_lat": 33.7838,
        "center_lng": -84.3831,
        "default_zoom": 15,
        "is_mall": False,
        "h3_hex": "8844cd5527fffff",
        "area_code": "404",
        "city": "Atlanta",
        "zip_code": "30309"
    },
    {
        "id": 8,
        "state_name": "Georgia",
        "state_code": "GA",
        "sub_region_name": "Atlanta Metro",
        "sub_sub_region_name": "Lenox Square Mall (30326 - Mall Complex)",
        "center_lat": 33.8463,
        "center_lng": -84.3621,
        "default_zoom": 17,
        "is_mall": True,
        "mall_name": "Lenox Square Mall",
        "h3_hex": "8844cd556bfffff",
        "area_code": "404",
        "city": "Atlanta",
        "zip_code": "30326"
    },
    {
        "id": 9,
        "state_name": "Georgia",
        "state_code": "GA",
        "sub_region_name": "Buckhead Financial & Tech District",
        "sub_sub_region_name": "Buckhead Village Commercial District (30305)",
        "center_lat": 33.8398,
        "center_lng": -84.3792,
        "default_zoom": 16,
        "is_mall": False,
        "h3_hex": "8844cd5567fffff",
        "area_code": "404",
        "city": "Atlanta",
        "zip_code": "30305"
    }
]

# Business archetypes for non-mall commercial zones
COMMERCIAL_TEMPLATES = [
    {"name": "Vanguard Software Solutions", "naics": "541511", "category": "Technology Software", "emp_range": (30, 85), "sqft_per_emp": 200, "street": "Congress Ave"},
    {"name": "Pinnacle Capital Partners", "naics": "523930", "category": "Financial Services", "emp_range": (15, 60), "sqft_per_emp": 250, "street": "Commerce St"},
    {"name": "Helix Clinical Genomics", "naics": "621111", "category": "Healthcare Medical", "emp_range": (20, 95), "sqft_per_emp": 300, "street": "Lavaca St"},
    {"name": "Apex Legal Advocates", "naics": "541110", "category": "Legal Services", "emp_range": (10, 45), "sqft_per_emp": 280, "street": "Guadalupe St"},
    {"name": "BlueShift Digital Creative", "naics": "541810", "category": "Media Advertising", "emp_range": (15, 50), "sqft_per_emp": 180, "street": "Colorado St"},
    {"name": "Starlight Artisan Bistro", "naics": "722511", "category": "Retail Restaurant", "emp_range": (12, 35), "sqft_per_emp": 120, "street": "Main St"},
    {"name": "Urban Pulse Fitness Studio", "naics": "713940", "category": "Commercial Services", "emp_range": (6, 20), "sqft_per_emp": 350, "street": "Market St"},
    {"name": "TerraForm Environmental Eng", "naics": "541330", "category": "Engineering Services", "emp_range": (25, 110), "sqft_per_emp": 220, "street": "Innovation Way"},
    {"name": "Solstice Wealth Advisors", "naics": "523110", "category": "Financial Services", "emp_range": (8, 30), "sqft_per_emp": 260, "street": "Financial Row"},
    {"name": "QuantumCore AI Labs", "naics": "541715", "category": "Technology Software", "emp_range": (40, 160), "sqft_per_emp": 210, "street": "Tech Parkway"},
    {"name": "Redwood Dental Specialists", "naics": "621210", "category": "Healthcare Medical", "emp_range": (8, 25), "sqft_per_emp": 220, "street": "Center St"},
    {"name": "Velocity Logistics Hub", "naics": "488510", "category": "Transportation Logistics", "emp_range": (35, 120), "sqft_per_emp": 400, "street": "Freight Ave"}
]

# Mall indoor sub-unit archetypes (MICRO and SMALL kiosks, carts, micro-bars, suites)
MALL_INDOOR_TEMPLATES = [
    {"name": "SoleMate Sneaker Kiosk", "naics": "448210", "category": "Retail Boutique", "emp": 2, "sqft": 250, "unit": "Level 1, Kiosk K-12"},
    {"name": "Boba Tea Express", "naics": "722515", "category": "Retail Cafe", "emp": 4, "sqft": 450, "unit": "Level 2, Food Court Unit 208"},
    {"name": "iRepair Phone Micro-Bar", "naics": "811211", "category": "Electronics Repair Kiosk", "emp": 2, "sqft": 180, "unit": "Level 1, Kiosk K-04"},
    {"name": "Glamour Lash & Brow Bar", "naics": "812112", "category": "Personal Services", "emp": 3, "sqft": 350, "unit": "Level 2, Suite 245"},
    {"name": "Aura Gem & Mineral Gallery", "naics": "448310", "category": "Retail Boutique", "emp": 2, "sqft": 280, "unit": "Level 1, Kiosk K-09"},
    {"name": "Pretzel Twist Gourmet Bakery", "naics": "722515", "category": "Retail Cafe", "emp": 3, "sqft": 320, "unit": "Level 1, Space K-15"},
    {"name": "SlickCase Mobile Accessories", "naics": "443142", "category": "Electronics Kiosk", "emp": 2, "sqft": 150, "unit": "Level 2, Center Court K-01"},
    {"name": "Matcha Moon Artisan Teas", "naics": "722515", "category": "Retail Cafe", "emp": 4, "sqft": 520, "unit": "Level 2, Unit 212"},
    {"name": "Luxe Leather Craft Kiosk", "naics": "448320", "category": "Retail Boutique", "emp": 2, "sqft": 220, "unit": "Level 1, Kiosk K-18"},
    {"name": "VR Horizon Arcade Pods", "naics": "713120", "category": "Entertainment Kiosk", "emp": 3, "sqft": 600, "unit": "Level 3, Family Zone 301"},
    {"name": "Urban Threadz Denim Studio", "naics": "448140", "category": "Retail Apparel", "emp": 7, "sqft": 2800, "unit": "Level 1, Suite 114"},
    {"name": "Nordic Watch Co. Showcase", "naics": "448310", "category": "Retail Boutique", "emp": 2, "sqft": 300, "unit": "Level 1, Kiosk K-07"},
    {"name": "K-Beauty Glow Studio", "naics": "446120", "category": "Cosmetics Boutique", "emp": 4, "sqft": 950, "unit": "Level 2, Space 238"},
    {"name": "Espresso Cartel Coffee Bar", "naics": "722515", "category": "Retail Cafe", "emp": 3, "sqft": 280, "unit": "Level 1, Atrium Cart A-02"},
    {"name": "SoundWave Hi-Fi Lounge", "naics": "443142", "category": "Retail Electronics", "emp": 5, "sqft": 1800, "unit": "Level 2, Suite 260"}
]

# Executive roles and synthetic names for CCPA-compliant pre-masked contacts
EXECUTIVE_NAMES = [
    ("Marcus", "Vance", "Managing Partner"),
    ("Elena", "Rostova", "Chief Technology Officer"),
    ("David", "Chen", "Director of IT Operations"),
    ("Sarah", "Jenkins", "VP of Infrastructure"),
    ("Robert", "Kowalski", "General Manager"),
    ("Amara", "Okonkwo", "Chief Information Officer"),
    ("Thomas", "Holloway", "Head of Digital Systems"),
    ("Sophia", "Martinez", "Executive Director"),
    ("Brian", "Fitzgerald", "Store General Manager"),
    ("Rachel", "Goldberg", "Operations Lead")
]

# Competitor ISP pool
COMPETITOR_ISPS = [
    ("AS7922", "Comcast Business"),
    ("AS11427", "Spectrum Business"),
    ("AS3356", "Lumen Technologies"),
    ("AS21928", "T-Mobile 5G Fixed Wireless")
]


def generate_gers_id(seed_str: str) -> str:
    """Generates deterministic 32-character hexadecimal Overture GERS ID."""
    return hashlib.sha256(seed_str.encode("utf-8")).hexdigest()[:32]


def seed_database() -> Dict[str, Any]:
    """Populates SQLite database with regions and 120 businesses."""
    init_clean_room_db()
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Clear existing seed records
    cursor.execute("DELETE FROM regions;")
    cursor.execute("DELETE FROM businesses;")

    # 2. Insert the 9 Sub-sub-regions
    for reg in REGIONS_HIERARCHY:
        cursor.execute("""
            INSERT INTO regions (
                id, state_name, state_code, sub_region_name, sub_sub_region_name,
                center_lat, center_lng, default_zoom
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        """, (
            reg["id"],
            reg["state_name"],
            reg["state_code"],
            reg["sub_region_name"],
            reg["sub_sub_region_name"],
            reg["center_lat"],
            reg["center_lng"],
            reg["default_zoom"]
        ))

    # 3. Generate 120 businesses distributed across the 9 sub-sub-regions
    # ~13-14 businesses per zone = 120 businesses total
    total_target = 120
    businesses_per_region = [14, 13, 13, 14, 13, 13, 14, 13, 13]  # Sum = 120

    business_records = []
    att_customer_count = 0
    competitor_count = 0
    mall_tenant_count = 0

    business_counter = 0

    for reg_idx, reg in enumerate(REGIONS_HIERARCHY):
        count_for_zone = businesses_per_region[reg_idx]
        is_mall_zone = reg.get("is_mall", False)

        for i in range(count_for_zone):
            business_counter += 1
            gers_seed = f"ov_gers_{reg['state_code']}_{reg['id']}_{i}_{business_counter}"
            gers_id = generate_gers_id(gers_seed)

            # Determine whether AT&T customer: ensure >= 30% overall (approx 36-40 of 120)
            # Cycle through so ~33% are True
            is_att = (business_counter % 3 == 0)
            if is_att:
                detected_asn = "AS7018"
                current_isp = "AT&T Business"
                att_customer_count += 1
            else:
                comp = COMPETITOR_ISPS[(business_counter + i) % len(COMPETITOR_ISPS)]
                detected_asn = comp[0]
                current_isp = comp[1]
                competitor_count += 1

            # Determine Mall Sub-unit vs Commercial Business
            if is_mall_zone:
                # Select from mall templates
                mall_tmpl = MALL_INDOOR_TEMPLATES[i % len(MALL_INDOOR_TEMPLATES)]
                business_name = f"{mall_tmpl['name']}"
                naics_code = mall_tmpl["naics"]
                industry_category = mall_tmpl["category"]
                parent_mall_name = reg["mall_name"]
                floor_unit = mall_tmpl["unit"]
                emp_count = mall_tmpl["emp"]
                sqft = mall_tmpl["sqft"]
                street = f"{reg['center_lat']:0.3f} Mall Boulevard"

                # Jitter coordinates slightly within mall boundary (+/- 0.00015 to 0.0006 deg)
                # so every pin is distinct and clickable
                jitter_lat = (random.random() - 0.5) * 0.0012
                jitter_lng = (random.random() - 0.5) * 0.0012
                lat = round(reg["center_lat"] + jitter_lat, 6)
                lng = round(reg["center_lng"] + jitter_lng, 6)
                mall_tenant_count += 1
            else:
                # Select from standard commercial templates
                comm_tmpl = COMMERCIAL_TEMPLATES[i % len(COMMERCIAL_TEMPLATES)]
                business_name = comm_tmpl["name"]
                if i > len(COMMERCIAL_TEMPLATES):
                    business_name = f"{business_name} #{i+1}"
                naics_code = comm_tmpl["naics"]
                industry_category = comm_tmpl["category"]
                parent_mall_name = None
                floor_unit = f"Suite {100 + (i * 20)}" if i % 2 == 0 else None
                emp_count = random.randint(comm_tmpl["emp_range"][0], comm_tmpl["emp_range"][1])
                sqft = emp_count * comm_tmpl["sqft_per_emp"]
                street = f"{100 + i * 25} {comm_tmpl['street']}"

                # Jitter coordinates within commercial district (+/- 0.002 to 0.007 deg)
                jitter_lat = (random.random() - 0.5) * 0.008
                jitter_lng = (random.random() - 0.5) * 0.008
                lat = round(reg["center_lat"] + jitter_lat, 6)
                lng = round(reg["center_lng"] + jitter_lng, 6)

            # FCC Fiber Availability (80% of urban cores have fiber availability)
            fcc_fiber = (random.random() < 0.82)

            # DMA/TCPA DNC compliance status
            dnc_status = DncStatus.CLEARED_B2B if (i % 4 != 0) else DncStatus.RESTRICTED

            # Calculate deterministic metrics via engine
            calc = calculate_outside_in_requirements(
                employee_count=emp_count,
                sqft=sqft,
                industry_category=industry_category,
                is_att_customer=is_att,
                fcc_fiber_hex_available=fcc_fiber,
                current_isp_name=current_isp,
                dnc_status=dnc_status
            )

            # Executive contact with pre-masked privacy format
            exec_profile = EXECUTIVE_NAMES[(business_counter + i) % len(EXECUTIVE_NAMES)]
            contact_first = exec_profile[0]
            contact_last = exec_profile[1]
            contact_role = exec_profile[2]
            domain_slug = business_name.lower().split()[0].replace("&", "").replace("-", "")

            # CCPA/TCPA Pre-Masked Format: first_initial.****@domain.com, (area) 555-01XX
            contact_email_masked = f"{contact_first[0].lower()}.****@{domain_slug}.com"
            phone_suffix = f"{random.randint(10, 99):02d}"
            contact_phone_masked = f"({reg['area_code']}) 555-01{phone_suffix}"
            phone_type = PhoneLineType.LANDLINE if (i % 3 != 0) else PhoneLineType.WIRELESS

            record = (
                gers_id,
                "CDLA-Permissive-2.0 (Overture Maps)",
                business_name,
                naics_code,
                industry_category,
                parent_mall_name,
                floor_unit,
                street,
                reg["city"],
                reg["state_code"],
                reg["zip_code"],
                lat,
                lng,
                reg["h3_hex"],
                emp_count,
                sqft,
                calc["size_tier"].value,
                detected_asn,
                current_isp,
                1 if is_att else 0,
                1 if fcc_fiber else 0,
                calc["modeled_bandwidth_mbps"],
                calc["modeled_monthly_tb"],
                calc["recommended_att_plan_id"],
                calc["conversion_score_pct"],
                f"{contact_first} {contact_last}",
                contact_role,
                contact_email_masked,
                contact_phone_masked,
                phone_type.value,
                dnc_status.value,
                "Synthetic Clean-Room Demo / Licensed Broker Schema"
            )
            business_records.append(record)

    # 4. Bulk insert into businesses table
    cursor.executemany("""
        INSERT INTO businesses (
            overture_gers_id, license_source, business_name, naics_code, industry_category,
            parent_mall_name, floor_unit, address_street, city, state, zip_code,
            latitude, longitude, h3_res8_hex, employee_count, sqft_estimate, size_tier,
            detected_asn, current_isp_name, is_att_customer, fcc_fiber_hex_available,
            modeled_bandwidth_mbps, modeled_monthly_tb, recommended_att_plan_id,
            conversion_score_pct, contact_name, contact_role, contact_email_masked,
            contact_phone_masked, phone_line_type, dnc_status, data_broker_source
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        );
    """, business_records)

    conn.commit()

    # Query counts for audit verification
    total_regions = cursor.execute("SELECT COUNT(*) FROM regions;").fetchone()[0]
    total_biz = cursor.execute("SELECT COUNT(*) FROM businesses;").fetchone()[0]
    total_att = cursor.execute("SELECT COUNT(*) FROM businesses WHERE is_att_customer = 1;").fetchone()[0]
    total_comp = cursor.execute("SELECT COUNT(*) FROM businesses WHERE is_att_customer = 0;").fetchone()[0]
    total_mall = cursor.execute("SELECT COUNT(*) FROM businesses WHERE parent_mall_name IS NOT NULL;").fetchone()[0]
    sample_contact = cursor.execute("SELECT contact_email_masked, contact_phone_masked FROM businesses LIMIT 1;").fetchone()

    conn.close()

    return {
        "status": "SUCCESS",
        "database_file": str(SQLITE_DB_PATH),
        "total_regions": total_regions,
        "total_businesses": total_biz,
        "att_customer_count": total_att,
        "att_customer_pct": round((total_att / total_biz) * 100, 1),
        "competitor_count": total_comp,
        "competitor_pct": round((total_comp / total_biz) * 100, 1),
        "mall_tenant_count": total_mall,
        "sample_masked_email": sample_contact[0],
        "sample_masked_phone": sample_contact[1]
    }


if __name__ == "__main__":
    print("Seeding Clean-Room Territory Intelligence Database...")
    result = seed_database()
    print("Seed Complete!")
    for k, v in result.items():
        print(f"  {k}: {v}")

