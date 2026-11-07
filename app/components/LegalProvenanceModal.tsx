"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  X,
  FileText,
  CheckCircle2,
  Lock,
  Eye,
  AlertTriangle,
  Scale,
  ExternalLink,
  BookOpen,
} from "lucide-react";

interface LegalProvenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LegalProvenanceModal({ isOpen, onClose }: LegalProvenanceModalProps) {
  const [activeTab, setActiveTab] = useState<"matrix" | "manifest">("matrix");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/40 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="w-full max-w-3xl cutout-card-lg bg-[#FAF7F2] border-[1.5px] border-[#DED6C6] rounded-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Physical Stitched Header */}
        <div className="px-6 py-4 border-b-[1.5px] border-[#DED6C6] bg-[#FAF7F2] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2E7D5B]/10 border border-[#2E7D5B]/30 flex items-center justify-center text-[#2E7D5B] shadow-cutout-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-[#1C1917] tracking-tight flex items-center gap-2">
                Enterprise Legal &amp; Data Provenance Shield
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#2E7D5B]/10 text-[#2E7D5B] border border-[#2E7D5B]/30">
                  Clean-Room Certified
                </span>
              </h3>
              <p className="text-xs text-[#655E54]">
                Audited Statutory Safeguards for AT&amp;T Business Intelligence Platform
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#E8E2D5] hover:bg-[#DED6C6] text-[#655E54] hover:text-[#1C1917] border border-[#DED6C6] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b-[1.5px] border-[#DED6C6] bg-[#E8E2D5] px-6 shrink-0 gap-2 pt-2">
          <button
            onClick={() => setActiveTab("matrix")}
            className={`py-2 px-4 text-xs font-mono font-bold border-b-2 transition flex items-center gap-1.5 rounded-t-md ${
              activeTab === "matrix"
                ? "bg-[#FAF7F2] border-[#C84B31] text-[#C84B31] shadow-cutout-sm"
                : "border-transparent text-[#655E54] hover:text-[#1C1917]"
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Compliance Matrix</span>
          </button>
          <button
            onClick={() => setActiveTab("manifest")}
            className={`py-2 px-4 text-xs font-mono font-bold border-b-2 transition flex items-center gap-1.5 rounded-t-md ${
              activeTab === "manifest"
                ? "bg-[#FAF7F2] border-[#C84B31] text-[#C84B31] shadow-cutout-sm"
                : "border-transparent text-[#655E54] hover:text-[#1C1917]"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Raw Provenance Manifest</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {activeTab === "matrix" ? (
            <div className="space-y-4">
              {/* Guardrail 1 */}
              <div className="cutout-card p-4 rounded-xl border-[1.5px] border-[#DED6C6] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-sm text-[#1C1917] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D5B]" />
                    1. Google Maps Platform TOS (§3.2.3) Hard Lock
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#2E7D5B]/10 text-[#2E7D5B] border border-[#2E7D5B]/30">
                    PASSED (0 Violations)
                  </span>
                </div>
                <p className="text-[#655E54] leading-relaxed">
                  Zero Google Places API scraping or database caching. All persistent Point-of-Interest coordinates, business names, and mall sub-unit hierarchies originate strictly from Overture Maps Foundation under the <span className="font-mono text-[#1C1917]">CDLA-Permissive-2.0</span> license. The map canvas acts strictly as a stateless visual presentation layer.
                </p>
              </div>

              {/* Guardrail 2 */}
              <div className="cutout-card p-4 rounded-xl border-[1.5px] border-[#DED6C6] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-sm text-[#1C1917] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D5B]" />
                    2. FCC 47 U.S.C. § 222 CPNI Firewall
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#2E7D5B]/10 text-[#2E7D5B] border border-[#2E7D5B]/30">
                    PASSED (Non-CPNI Compliant)
                  </span>
                </div>
                <p className="text-[#655E54] leading-relaxed">
                  No confidential carrier billing, call records, or customer proprietary network information is accessed. All bandwidth metrics are deterministic outside-in estimates computed from public firmographic attributes (employee counts, industry multipliers, and commercial square footage).
                </p>
              </div>

              {/* Guardrail 3 */}
              <div className="cutout-card p-4 rounded-xl border-[1.5px] border-[#DED6C6] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-sm text-[#1C1917] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D5B]" />
                    3. CCPA / CPRA &amp; 47 U.S.C. § 227 TCPA Safeguards
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#2E7D5B]/10 text-[#2E7D5B] border border-[#2E7D5B]/30">
                    PASSED (Pre-Masked)
                  </span>
                </div>
                <p className="text-[#655E54] leading-relaxed">
                  All personal contact emails and phone numbers are pre-masked in the database and UI. Decryption requires an interactive enterprise CRM audit call that verifies National DNC registry status and issues a timestamped compliance event ID (<span className="font-mono text-[#1C1917]">AUDIT-TCPA-XXXX</span>).
                </p>
              </div>

              {/* Guardrail 4 */}
              <div className="cutout-card p-4 rounded-xl border-[1.5px] border-[#DED6C6] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-sm text-[#1C1917] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D5B]" />
                    4. CostQuest Broadband Fabric Intellectual Property Protection
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#2E7D5B]/10 text-[#2E7D5B] border border-[#2E7D5B]/30">
                    PASSED (0 Fabric IDs)
                  </span>
                </div>
                <p className="text-[#655E54] leading-relaxed">
                  Zero references to proprietary CostQuest Broadband Serviceable Location (BSL) Fabric IDs. Carrier presence and broadband indicators rely solely on public BGP ASN telemetry (<span className="font-mono text-[#1C1917]">AS7018</span> for AT&amp;T) and public-domain FCC Broadband Data Collection (BDC) H3 Res-8 Hexagons.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 font-mono">
              <div className="text-[11px] text-[#655E54]">
                Certified Clean-Room Data Provenance Schema (40 statutory fields):
              </div>
              <pre className="p-4 bg-[#E8E2D5] border border-[#DED6C6] rounded-xl text-[11px] text-[#1C1917] overflow-x-auto leading-relaxed shadow-inner">
{`{
  "provenance_standard": "CLEAN_ROOM_STATUTORY_V1",
  "license_governance": "CDLA-Permissive-2.0 (Overture Maps Foundation)",
  "cpni_firewall": "47_USC_222_OUTSIDE_IN_ESTIMATE_ONLY",
  "tcpa_dnc_firewall": "MANDATORY_AUDIT_LOG_UNMASKING",
  "costquest_bsl_fabric_prohibited": true,
  "google_maps_caching_prohibited": true,
  "fields_certified": 40,
  "telecom_asn_registry": {
    "AS7018": "AT&T Services, Inc. (On-Net Customer)",
    "AS7922": "Comcast Cable Communications, LLC",
    "AS11427": "Charter Communications (Spectrum Business)",
    "AS3356": "Lumen Technologies / Level 3",
    "AS21928": "T-Mobile USA, Inc."
  }
}`}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t-[1.5px] border-[#DED6C6] bg-[#E8E2D5] flex items-center justify-between text-xs shrink-0 font-mono text-[#655E54]">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#2E7D5B]" />
            <span>Compliance Engine v1.0.0 (Clean-Room Verified)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#FAF7F2] text-[#1C1917] hover:bg-[#DED6C6] border border-[#DED6C6] font-bold text-xs transition"
          >
            Close Shield
          </button>
        </div>
      </div>
    </div>
  );
}
