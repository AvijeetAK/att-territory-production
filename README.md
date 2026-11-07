# AT&T Territory Intelligence Platform
### B2B Geospatial Telecom Sales Intelligence & Fiber Conversion Prospecting

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=flat&logo=vercel)](https://vercel.com)
[![Next.js 14](https://img.shields.io/badge/Next.js-14_App_Router-black?style=flat&logo=next.js)](https://nextjs.org/)
[![License: CDLA-Permissive-2.0](https://img.shields.io/badge/Data_License-CDLA--Permissive--2.0-blue)](https://cdla.dev/permissive-2-0/)
[![Compliance: Non-CPNI](https://img.shields.io/badge/FCC_Compliance-47_U.S.C._§_222_Non--CPNI-success)](#statutory-compliance--clean-room-architecture)

---

## Executive Summary

The **AT&T Territory Intelligence Platform** is an enterprise-grade, clean-room geospatial sales intelligence application built for telecom sales executives, commercial account managers, and territory planners. It bridges the gap between public geospatial datasets, BGP routing telemetry, and deterministic outside-in commercial fiber demand modeling.

The application operates with zero runtime dependency on external databases or local Python runtimes, packaging a **100% serverless Next.js App Router architecture** with an interactive **Tactile Paper Cutout & Architectural Cartography** interface and live street/satellite cartography.

---

## Architectural Highlights

- **Zero-Config Serverless Deployment**: Fully self-contained Next.js 14 App Router application deployed with one click to Vercel, AWS Amplify, or Docker.
- **Tactile Paper Cutout Design System**: Physical architectural cardstock palette (`#F3EFE6`, `#FAF7F2`), stacked paper edge borders (`1.5px solid #DED6C6`), layered drop shadows, terracotta action stamps (`#C84B31`), and editorial typography (`Fraunces`, `Plus Jakarta Sans`, `JetBrains Mono`).
- **100% Real Interactive Street & Satellite Cartography**: Powered by Leaflet with instant floating layer switching between:
  1. 🗺️ **Warm Editorial Street Map (Default)**: CARTO Voyager with warm paper sepia/contrast filter.
  2. 🏛️ **Architectural Light Map**: CARTO Positron high-contrast cartography.
  3. 🛰️ **Real Satellite & Mall Roof View**: Esri World Imagery high-resolution imagery.
- **Statutory Clean-Room Data Engine**: All 120+ seeded business records, 3 state territories, 6 metro areas, and 9 sub-sub-regions (including indoor shopping mall sub-units) comply with strict federal, state, and platform legal guardrails.

---

## Statutory Compliance & Clean-Room Architecture

Every data attribute and UI element is governed by four non-negotiable statutory guardrails documented in [`COMPLIANCE_MANIFEST.json`](./COMPLIANCE_MANIFEST.json):

```
┌────────────────────────────────────────────────────────────────────────┐
│                      CLEAN-ROOM PROVENANCE MATRIX                      │
├───────────────────────────────────┬────────────────────────────────────┤
│ Legal / Regulatory Standard       │ Implementation Guarantee           │
├───────────────────────────────────┼────────────────────────────────────┤
│ 1. Google Maps Platform TOS §3.2.3│ ZERO Google POI or geocode caching.│
│                                   │ All POIs originate strictly from   │
│                                   │ Overture Maps Foundation GERS.     │
├───────────────────────────────────┼────────────────────────────────────┤
│ 2. FCC 47 U.S.C. § 222 (CPNI)     │ ZERO confidential customer billing │
│                                   │ or call records. Pure outside-in   │
│                                   │ firmographic bandwidth modeling.   │
├───────────────────────────────────┼────────────────────────────────────┤
│ 3. CCPA / CPRA & TCPA 47 U.S.C. §227│ 100% Pre-masked PII in UI and db.│
│                                   │ Mandatory enterprise CRM audit log │
│                                   │ receipt (AUDIT-TCPA-XXXX).         │
├───────────────────────────────────┼────────────────────────────────────┤
│ 4. CostQuest BSL Fabric Copyright │ ZERO CostQuest Fabric IDs. Carrier │
│                                   │ availability verified via public   │
│                                   │ BGP ASN (AS7018) & FCC BDC H3 Hex. │
└───────────────────────────────────┴────────────────────────────────────┘
```

---

## 3-State Interactive Sales Workflow

1. **State 1: Continental US Landing & Dossier Search**
   - Full-bleed interactive continental US street map (`lat: 39.8283, lng: -98.5795, zoom: 4`).
   - Floating architectural folder card with tabbed header and cascading dropdowns (State &rarr; Metro &rarr; District/Mall Zone).
   - Instant smooth fly-to camera zoom into selected target coordinates.

2. **State 2: 400px Left Business List Drawer**
   - Floating cardstock panel docked over the left side of the street map.
   - Breadcrumb navigation, live search input, segmented ISP filter (*All*, *AT&T On-Net*, *Competitors*), and size tier filter chips (*Micro*, *Small*, *Medium*, *Large*).
   - Die-cut index cards with color-coded left ribbons, mall sub-unit badges (`Level 2, Kiosk 204`), and monospace bandwidth pills.

3. **State 3: 420px Adjacent Detail & Pitch Card**
   - Floating paper dossier card docked at `left: 416px` adjacent to the left drawer.
   - Outside-In Non-CPNI intelligence metrics (`modeled_bandwidth_mbps` & `modeled_monthly_tb`).
   - Tactile Conversion Score Gauge (weighted by off-net carrier delta, FCC fiber hex, and firmographic size).
   - Perforated AT&T Commercial Fiber Plan Voucher Box with SLA and pricing.
   - Pre-masked Decision Maker card with interactive CRM unmasking simulation issuing live audit receipt tokens (`AUDIT-TCPA-XXXX`).

---

## Project Structure

```
att-territory-production/
├── app/
│   ├── api/                               # Next.js Serverless API Route Handlers
│   │   ├── audit/reveal-contact/[id]/     # TCPA/CCPA compliance audit receipt generator
│   │   ├── businesses/                    # Filtered territory POI provider
│   │   └── hierarchy/                     # Geographic territory hierarchy tree
│   ├── components/                        # Tactile Paper Cutout React Components
│   │   ├── CentralModal.tsx               # State 1: Architectural folder search card
│   │   ├── DetailFlyout.tsx               # State 3: Adjacent commercial pitch dossier
│   │   ├── LeftDrawer.tsx                 # State 2: 400px cardstock territory POI drawer
│   │   ├── LegalProvenanceModal.tsx       # Live enterprise compliance matrix & manifest
│   │   └── MapCanvas.tsx                  # 100% Real Leaflet street & satellite map
│   ├── globals.css                        # Tactile paper tokens, shadows, and tile filters
│   ├── layout.tsx                         # Google Fonts (Fraunces, Jakarta, Mono) & Leaflet
│   ├── page.tsx                           # 3-State workflow orchestration
│   ├── types.ts                           # Comprehensive TypeScript data contracts
│   └── fallbackData.ts                    # Embedded offline fallback data (120 POIs)
├── lib/
│   └── cleanroomData.ts                   # Serverless data querying & filtering engine
├── data/
│   └── cleanroom_seed.json                # Complete 120-POI clean-room catalog
├── python-reference-engine/               # Reference Python/FastAPI architecture
│   ├── compliance_scan.py                 # Automated 4-guardrail compliance audit script
│   ├── database.py                        # SQLite/PostgreSQL clean-room database engine
│   ├── engine.py                          # Deterministic telecom sizing & conversion engine
│   ├── main.py                            # Reference FastAPI REST service
│   ├── models.py                          # Clean-room Pydantic/SQLModel schema
│   ├── requirements.txt                   # Backend Python dependencies
│   ├── seed_data.py                       # Territory generator across 3 US regions
│   ├── test_api.py                        # REST endpoint test suite
│   └── test_engine.py                     # Deterministic formula test suite
├── .gitignore                             # Clean production ignore rules
├── COMPLIANCE_MANIFEST.json               # 40-field certified provenance catalog
├── package.json                           # Next.js 14 production package manifest
├── tailwind.config.ts                     # Paper, ink, and terracotta theme tokens
├── tsconfig.json                          # Strict TypeScript configuration
└── vercel.json                            # Zero-config Vercel deployment manifest
```

---

## One-Click Deployment to Vercel

### Option 1: Vercel CLI (Recommended)
```bash
npm install -g vercel
cd att-territory-production
vercel
```

### Option 2: Deploy via GitHub / GitLab
1. Push this repository to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_ORG/att-territory-intelligence.git
   git push -u origin main
   ```
2. In the [Vercel Dashboard](https://vercel.com/new), click **Import Project** and select `att-territory-intelligence`.
3. Vercel automatically detects Next.js. Click **Deploy**.

---

## Local Development

```bash
cd att-territory-production
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Reference Python Engine

For enterprise architects reviewing the deterministic calculation engine, the complete reference implementation is located in [`/python-reference-engine`](./python-reference-engine):
- **Bandwidth Formula**: `modeled_bandwidth_mbps = (employee_count * industry_multiplier) + (sqft / 500)`
- **Conversion Scoring**: Weighted composite score incorporating detected carrier ASN delta, FCC fiber availability, and B2B DNC clearance.
- **Automated Compliance Scan**: Run `python python-reference-engine/compliance_scan.py` to audit database records for zero Google POI caching, zero CostQuest IDs, and 100% PII masking.

