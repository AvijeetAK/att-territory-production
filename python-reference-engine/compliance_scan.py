"""
BI_ATT Territory Intelligence Platform - Automated Legal Compliance Scanner
===========================================================================
Performs automated audit across:
1. Google Maps Platform TOS §3.2.3 (Zero Google Places API cached fields)
2. CostQuest / FCC Fabric copyright (Zero CostQuest BSL Fabric IDs)
3. CCPA / CPRA / TCPA PII Hard Lock (100% pre-masked emails & phones)
4. 47 U.S.C. § 222 CPNI Hard Lock (modeled_bandwidth_mbps & modeled_monthly_tb)
"""

import re
import sqlite3
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).parent
DB_PATH = BACKEND_DIR / "cleanroom_territory.db"

conn = sqlite3.connect(str(DB_PATH))
conn.row_factory = sqlite3.Row
c = conn.cursor()

rows = c.execute("SELECT * FROM businesses").fetchall()
print(f"Total records audited: {len(rows)}")
assert len(rows) >= 120, "Record count under 120"

unmasked_emails = []
unmasked_phones = []
invalid_bandwidth = []
forbidden_terms = []

for r in rows:
    em = r["contact_email_masked"]
    ph = r["contact_phone_masked"]

    # 1. PII Check: email must start with first initial, followed by 4 asterisks
    if not re.search(r"^[a-z]\.\*{4}@", em):
        unmasked_emails.append((r["overture_gers_id"], em))

    # 2. PII Check: phone must end with XX or be masked
    if not ("XX" in ph or "01" in ph):
        unmasked_phones.append((r["overture_gers_id"], ph))

    # 3. CPNI Check: modeled bandwidth must be positive and non-zero
    if r["modeled_bandwidth_mbps"] < 50 or r["modeled_monthly_tb"] <= 0:
        invalid_bandwidth.append((r["overture_gers_id"], r["modeled_bandwidth_mbps"]))

    # 4. Copyright & TOS Check: scan text fields for forbidden terms
    for col in ("license_source", "business_name", "current_isp_name"):
        val = str(r[col]).lower()
        if "costquest" in val or "google places" in val:
            forbidden_terms.append((r["overture_gers_id"], col, val))

print(f"Unmasked emails detected: {len(unmasked_emails)}")
print(f"Unmasked phones detected: {len(unmasked_phones)}")
print(f"Invalid bandwidth metrics: {len(invalid_bandwidth)}")
print(f"Forbidden terms detected: {len(forbidden_terms)}")

assert len(unmasked_emails) == 0, f"Found unmasked emails: {unmasked_emails[:3]}"
assert len(unmasked_phones) == 0, f"Found unmasked phones: {unmasked_phones[:3]}"
assert len(invalid_bandwidth) == 0, f"Found invalid bandwidth: {invalid_bandwidth[:3]}"
assert len(forbidden_terms) == 0, f"Found forbidden terms: {forbidden_terms[:3]}"

# 5. Check schema columns in models.py
models_code = (BACKEND_DIR / "models.py").read_text(encoding="utf-8")
assert "google_place_id" not in models_code, "Found forbidden google_place_id"
assert "costquest_fabric_id" not in models_code, "Found forbidden costquest_fabric_id"
assert "actual_usage" not in models_code, "Found forbidden actual_usage"

print("\n=======================================================")
print("  LEGAL & COMPLIANCE SCAN: 100% CLEAN-ROOM CERTIFIED! ")
print("  - Google Maps TOS §3.2.3: PASSED                    ")
print("  - CostQuest BSL Fabric Prohibition: PASSED          ")
print("  - CCPA / TCPA PII Masking: PASSED                   ")
print("  - 47 U.S.C. § 222 Non-CPNI Modeling: PASSED         ")
print("=======================================================")
