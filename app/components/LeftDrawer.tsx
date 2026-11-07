"use client";

import React from "react";
import { Business, RegionState, SubRegion, SubSubRegion } from "../types";
import {
  ChevronRight,
  Search,
  RotateCcw,
  Building2,
} from "lucide-react";

interface LeftDrawerProps {
  region: RegionState;
  subRegion: SubRegion;
  subSubRegion: SubSubRegion;
  allSubSubBusinesses: Business[];
  filteredBusinesses: Business[];
  ispFilter: "ALL" | "ATT_ONLY" | "NON_ATT_ONLY";
  onIspFilterChange: (filter: "ALL" | "ATT_ONLY" | "NON_ATT_ONLY") => void;
  selectedTiers: string[];
  onToggleTier: (tier: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  selectedBusinessId: string | null;
  onSelectBusiness: (business: Business) => void;
  onChangeRegion: () => void;
}

export default function LeftDrawer({
  region,
  subRegion,
  subSubRegion,
  allSubSubBusinesses,
  filteredBusinesses,
  ispFilter,
  onIspFilterChange,
  selectedTiers,
  onToggleTier,
  searchQuery,
  onSearchQueryChange,
  selectedBusinessId,
  onSelectBusiness,
  onChangeRegion,
}: LeftDrawerProps) {
  // Counts derived from the active sub-sub-region
  const totalCount = allSubSubBusinesses.length;
  const attCount = allSubSubBusinesses.filter((b) => Boolean(b.is_att_customer)).length;
  const nonAttCount = allSubSubBusinesses.filter((b) => !b.is_att_customer).length;

  return (
    <aside className="w-[400px] h-full flex flex-col bg-[#FAF7F2] border-r-[1.5px] border-[#DED6C6] shadow-cutout-lg z-20 select-none">
      {/* Header & Breadcrumb */}
      <div className="p-4 border-b-[1.5px] border-[#DED6C6] bg-[#FAF7F2] shrink-0 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] font-mono font-semibold text-[#655E54] truncate max-w-[280px]">
            <span>{region.state_code}</span>
            <ChevronRight className="w-3 h-3 text-[#9C9488]" />
            <span className="truncate">{subRegion.sub_region_name.split("(")[0].trim()}</span>
            <ChevronRight className="w-3 h-3 text-[#9C9488]" />
            <span className="text-[#C84B31] font-bold truncate">
              {subSubRegion.name.split("(")[0].trim()}
            </span>
          </div>

          <button
            onClick={onChangeRegion}
            className="text-[11px] font-semibold text-[#655E54] hover:text-[#C84B31] bg-[#E8E2D5] hover:bg-[#DED6C6] px-2.5 py-1 rounded border border-[#DED6C6] flex items-center gap-1 transition-colors"
            title="Change Territory"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Change</span>
          </button>
        </div>

        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-serif font-bold text-[#1C1917] tracking-tight truncate">
            {subSubRegion.name}
          </h2>
          <span className="text-xs font-mono font-bold text-[#655E54] bg-[#E8E2D5] px-2 py-0.5 rounded border border-[#DED6C6]">
            {filteredBusinesses.length} Active Pins
          </span>
        </div>

        {/* Search input in a recessed well */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#9C9488] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search business, mall kiosk, NAICS..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="w-full bg-[#E8E2D5] border border-[#DED6C6] rounded-md pl-9 pr-3 py-1.5 text-xs text-[#1C1917] placeholder-[#9C9488] font-medium focus:outline-none focus:border-[#C84B31] shadow-inner transition-colors"
          />
        </div>

        {/* Target Leads & ISP Segmented Filter Track */}
        <div className="cutout-well p-1 rounded-md flex items-center gap-1 text-[11px] font-semibold">
          {/* Button 1: All Businesses */}
          <button
            onClick={() => onIspFilterChange("ALL")}
            className={`flex-1 py-1.5 px-1 rounded transition-all text-center ${
              ispFilter === "ALL"
                ? "bg-[#FAF7F2] text-[#1C1917] shadow-cutout-sm font-bold border border-[#DED6C6]"
                : "text-[#655E54] hover:text-[#1C1917]"
            }`}
          >
            All ({totalCount})
          </button>

          {/* Button 2: Using AT&T */}
          <button
            onClick={() => onIspFilterChange("ATT_ONLY")}
            className={`flex-1 py-1.5 px-1 rounded transition-all text-center flex items-center justify-center gap-1 ${
              ispFilter === "ATT_ONLY"
                ? "bg-[#0077B6] text-[#FAF7F2] shadow-sm font-bold"
                : "text-[#0077B6] hover:bg-[#E8E2D5]"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#0077B6] inline-block border border-white" />
            <span>Using AT&amp;T ({attCount})</span>
          </button>

          {/* Button 3: Target Leads */}
          <button
            onClick={() => onIspFilterChange("NON_ATT_ONLY")}
            className={`flex-1 py-1.5 px-1 rounded transition-all text-center flex flex-col items-center justify-center ${
              ispFilter === "NON_ATT_ONLY"
                ? "bg-[#C84B31] text-[#FAF7F2] shadow-sm font-bold"
                : "text-[#C84B31] hover:bg-[#E8E2D5]"
            }`}
            title="Not Using AT&T — Ready to Pitch"
          >
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#C84B31] inline-block border border-white" />
              <span>Target Leads ({nonAttCount})</span>
            </div>
          </button>
        </div>

        {/* Active Filter Subtitle Indicator */}
        {ispFilter === "NON_ATT_ONLY" && (
          <div className="text-[10px] font-mono text-[#C84B31] bg-[#FDF2E9] px-2 py-0.5 rounded border border-[#FADBD8] text-center font-bold">
            Target Leads Only — Zero AT&amp;T Pins Rendered
          </div>
        )}

        {/* Size Tier Chips */}
        <div className="flex items-center gap-1.5 pt-0.5">
          {[
            { id: "MICRO", label: "Micro", color: "#D9822B" },
            { id: "SMALL", label: "Small", color: "#2E7D5B" },
            { id: "MEDIUM", label: "Medium", color: "#6D4C7D" },
            { id: "LARGE", label: "Large", color: "#B8332A" },
          ].map((t) => {
            const isSelected = selectedTiers.includes(t.id);
            return (
              <button
                key={t.id}
                onClick={() => onToggleTier(t.id)}
                className={`flex-1 py-1 px-1.5 rounded text-[10px] font-mono font-bold tracking-tight border transition-all flex items-center justify-center gap-1 ${
                  isSelected
                    ? "bg-[#FAF7F2] text-[#1C1917] border-[#DED6C6] shadow-cutout-sm"
                    : "bg-[#E8E2D5] text-[#9C9488] border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: t.color }}
                />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Business Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredBusinesses.length === 0 ? (
          <div className="p-8 text-center text-[#655E54] cutout-card rounded-lg my-4">
            <Building2 className="w-8 h-8 text-[#9C9488] mx-auto mb-2 opacity-50" />
            <p className="text-sm font-serif font-bold text-[#1C1917]">No territory POIs match criteria</p>
            <p className="text-xs text-[#655E54] mt-1">Try resetting the ISP or size tier filters.</p>
          </div>
        ) : (
          filteredBusinesses.map((b) => {
            const isSelected = b.overture_gers_id === selectedBusinessId;

            // Pin & Ribbon Color
            let ribbonColor = "#D9822B"; // Ochre Gold
            if (b.is_att_customer) {
              ribbonColor = "#0077B6"; // Cerulean Ink
            } else if (b.size_tier === "SMALL") {
              ribbonColor = "#2E7D5B"; // Botanical Sage
            } else if (b.size_tier === "MEDIUM") {
              ribbonColor = "#6D4C7D"; // Plum Aubergine
            } else if (b.size_tier === "LARGE") {
              ribbonColor = "#B8332A"; // Crimson Clay
            }

            return (
              <div
                key={b.overture_gers_id}
                onClick={() => onSelectBusiness(b)}
                className={`group relative rounded-lg border-[1.5px] cursor-pointer transition-all duration-150 overflow-hidden ${
                  isSelected
                    ? "bg-[#FAF7F2] border-[#C84B31] shadow-cutout translate-x-1"
                    : "bg-[#FAF7F2] border-[#DED6C6] shadow-cutout-sm hover:border-[#C84B31] hover:shadow-cutout"
                }`}
              >
                {/* Left Color Ribbon */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5"
                  style={{ backgroundColor: ribbonColor }}
                />

                <div className="p-3.5 pl-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-[#1C1917] truncate leading-tight group-hover:text-[#C84B31] transition-colors">
                          {b.business_name}
                        </span>
                        {/* Commercial Status Badges: AT&T CONNECTED vs TARGET LEAD */}
                        {b.is_att_customer ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#E8F4FC] text-[#0077B6] border border-[#BDE0FE]">
                            AT&amp;T CONNECTED
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#FDF2E9] text-[#C84B31] border border-[#FADBD8]">
                            TARGET LEAD
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-[#655E54] mt-0.5 truncate">
                        {b.industry_category}
                      </div>
                    </div>

                    {/* Conversion Probability Badge */}
                    <div className="shrink-0 text-right">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          b.conversion_score_pct >= 80
                            ? "bg-[#2E7D5B]/10 text-[#2E7D5B] border-[#2E7D5B]/30"
                            : b.conversion_score_pct >= 60
                            ? "bg-[#D9822B]/10 text-[#D9822B] border-[#D9822B]/30"
                            : "bg-[#655E54]/10 text-[#655E54] border-[#655E54]/30"
                        }`}
                      >
                        {b.conversion_score_pct}% Match
                      </span>
                    </div>
                  </div>

                  {/* Mall Unit Badge if indoor sub-unit */}
                  {b.floor_unit && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#E8E2D5] text-[#1C1917] border border-[#DED6C6]">
                      <Building2 className="w-3 h-3 text-[#C84B31]" />
                      <span>{b.floor_unit}</span>
                      {b.parent_mall_name && (
                        <span className="text-[#655E54]">• {b.parent_mall_name}</span>
                      )}
                    </div>
                  )}

                  {/* Metrics Row */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#E8E2D5] text-[11px]">
                    <div className="flex items-center gap-1 font-mono text-[#655E54]">
                      <span className="text-[#9C9488]">ISP:</span>
                      <span className="font-semibold text-[#1C1917] truncate max-w-[150px]">
                        {b.current_isp_name.split("(")[0].trim()}
                      </span>
                    </div>

                    {/* Tabular Monospace Bandwidth Pill */}
                    <div className="font-mono text-[11px] font-bold text-[#1C1917] bg-[#E8E2D5] px-2 py-0.5 rounded border border-[#DED6C6]">
                      {b.modeled_bandwidth_mbps} Mbps
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Drawer Footer Legal Provenance Stamped Strip */}
      <div className="p-3 border-t-[1.5px] border-[#DED6C6] bg-[#E8E2D5] text-[10px] text-[#655E54] flex items-center justify-between font-mono">
        <span>Overture CDLA-2.0</span>
        <span>•</span>
        <span>Outside-In Non-CPNI</span>
        <span>•</span>
        <span>Public ASN</span>
      </div>
    </aside>
  );
}
