"use client";

import React, { useState, useEffect } from "react";
import { RegionState, SubRegion, SubSubRegion, Business } from "./types";
import { FALLBACK_HIERARCHY, FALLBACK_BUSINESSES } from "./fallbackData";
import MapCanvas from "./components/MapCanvas";
import CentralModal from "./components/CentralModal";
import LeftDrawer from "./components/LeftDrawer";
import DetailFlyout from "./components/DetailFlyout";
import LegalProvenanceModal from "./components/LegalProvenanceModal";
import { ShieldCheck, Compass, Radio } from "lucide-react";

// Default United States Continental Viewpoint (State 1)
const US_CONTINENTAL_CENTER = {
  lat: 39.8283,
  lng: -98.5795,
};
const US_CONTINENTAL_ZOOM = 4;

export default function AppHome() {
  // Territory data
  const [hierarchy, setHierarchy] = useState<RegionState[]>(FALLBACK_HIERARCHY);
  const [allBusinesses, setAllBusinesses] = useState<Business[]>(FALLBACK_BUSINESSES);

  // UI Workflow States: 1 (Search Modal), 2 (Split-Screen Drawer), 3 (Detail Flyout)
  const [isState1Open, setIsState1Open] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<RegionState>(FALLBACK_HIERARCHY[0]);
  const [selectedSubRegion, setSelectedSubRegion] = useState<SubRegion>(
    FALLBACK_HIERARCHY[0].sub_regions[0]
  );
  const [selectedSubSubRegion, setSelectedSubSubRegion] = useState<SubSubRegion>(
    FALLBACK_HIERARCHY[0].sub_regions[0].sub_sub_regions[0]
  );

  // Active Map Viewpoint
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(US_CONTINENTAL_CENTER);
  const [mapZoom, setMapZoom] = useState<number>(US_CONTINENTAL_ZOOM);

  // Selected Business (State 3 Detail Flyout)
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  // Legal & Provenance Shield Modal
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);

  // Synchronized Filter State (Shared between LeftDrawer and MapCanvas)
  const [ispFilter, setIspFilter] = useState<"ALL" | "ATT_ONLY" | "NON_ATT_ONLY">("ALL");
  const [selectedTiers, setSelectedTiers] = useState<string[]>(["MICRO", "SMALL", "MEDIUM", "LARGE"]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch live API data on mount (with automatic fallback to embedded clean-room seed data)
  useEffect(() => {
    async function loadData() {
      try {
        const [hierRes, bizRes] = await Promise.all([
          fetch("/api/hierarchy"),
          fetch("/api/businesses"),
        ]);

        if (hierRes.ok) {
          const hData = await hierRes.json();
          if (hData.hierarchy && hData.hierarchy.length > 0) {
            setHierarchy(hData.hierarchy);
          }
        }

        if (bizRes.ok) {
          const bData = await bizRes.json();
          if (bData.businesses && bData.businesses.length > 0) {
            setAllBusinesses(bData.businesses);
          }
        }
      } catch (err) {
        console.info("Using embedded clean-room fallback dataset (offline standalone mode).");
      }
    }

    loadData();
  }, []);

  // Filter businesses belonging to the active sub-sub-region
  const activeSubSubBusinesses = React.useMemo(() => {
    if (isState1Open) return allBusinesses;

    const nameLower = selectedSubSubRegion.name.toLowerCase();
    const isMall = selectedSubSubRegion.is_mall;

    return allBusinesses.filter((b) => {
      if (isMall && b.parent_mall_name) {
        return (
          nameLower.includes(b.parent_mall_name.toLowerCase()) ||
          (b.parent_mall_name.toLowerCase().includes("domain") && nameLower.includes("domain")) ||
          (b.parent_mall_name.toLowerCase().includes("valley fair") && nameLower.includes("valley fair")) ||
          (b.parent_mall_name.toLowerCase().includes("lenox") && nameLower.includes("lenox"))
        );
      }
      return b.state === selectedRegion.state_code;
    });
  }, [allBusinesses, isState1Open, selectedSubSubRegion, selectedRegion]);

  // Businesses strictly filtered by ISP filter + Size Tiers + Search Query
  // Synchronized in real time between Left Drawer and Right Map Canvas
  const filteredBusinesses = React.useMemo(() => {
    return activeSubSubBusinesses.filter((b) => {
      // 1. ISP filter
      if (ispFilter === "ATT_ONLY" && !b.is_att_customer) return false;
      if (ispFilter === "NON_ATT_ONLY" && b.is_att_customer) return false;

      // 2. Tier filter
      if (!selectedTiers.includes(b.size_tier)) return false;

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = b.business_name.toLowerCase().includes(q);
        const matchesCategory = b.industry_category.toLowerCase().includes(q);
        const matchesMall = b.parent_mall_name?.toLowerCase().includes(q);
        const matchesIsp = b.current_isp_name.toLowerCase().includes(q);
        if (!matchesName && !matchesCategory && !matchesMall && !matchesIsp) return false;
      }

      return true;
    });
  }, [activeSubSubBusinesses, ispFilter, selectedTiers, searchQuery]);

  // Transition from State 1 to State 2
  const handleAnalyzeTerritory = (
    subSub: SubSubRegion,
    sub: SubRegion,
    reg: RegionState
  ) => {
    setSelectedRegion(reg);
    setSelectedSubRegion(sub);
    setSelectedSubSubRegion(subSub);

    // Reset filters to full view for newly selected territory
    setIspFilter("ALL");
    setSelectedTiers(["MICRO", "SMALL", "MEDIUM", "LARGE"]);
    setSearchQuery("");

    // Zoom real map smoothly into sub-sub-region coordinates
    setMapCenter({ lat: subSub.center_lat, lng: subSub.center_lng });
    setMapZoom(subSub.default_zoom);

    // Close State 1 modal, activating State 2 split-screen drawer
    setIsState1Open(false);
    setSelectedBusiness(null);
  };

  // Return to State 1
  const handleChangeRegion = () => {
    setIsState1Open(true);
    setSelectedBusiness(null);
    setMapCenter(US_CONTINENTAL_CENTER);
    setMapZoom(US_CONTINENTAL_ZOOM);
  };

  // Open State 3 Detail Flyout
  const handleSelectBusiness = (biz: Business) => {
    setSelectedBusiness(biz);
    // Pan slightly to center marker
    setMapCenter({ lat: biz.latitude, lng: biz.longitude });
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#F3EFE6] text-[#1C1917] overflow-hidden font-sans">
      {/* Top Application Header: Stitched Cream Cardstock */}
      <header className="h-14 border-b-[1.5px] border-[#DED6C6] bg-[#FAF7F2] px-5 flex items-center justify-between z-40 shrink-0 shadow-sm">
        <div className="flex items-center space-x-3">
          {/* Terracotta Stamp Monogram */}
          <div className="h-9 w-9 rounded-lg bg-[#C84B31] border-[1.5px] border-[#8F2D19] flex items-center justify-center font-serif font-bold text-white text-xs shadow-stamp-pressed tracking-wider">
            AT&amp;T
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-base text-[#1C1917] tracking-tight">
                AT&amp;T Territory Intelligence
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#E8E2D5] text-[#655E54] border border-[#DED6C6] uppercase">
                Tactile Cartography
              </span>
            </div>
          </div>
        </div>

        {/* Top Compliance Badge: Embossed Botanical Sage Shield */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLegalModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#E8E2D5] border-[1.5px] border-[#2E7D5B] text-[#2E7D5B] text-xs font-semibold shadow-cutout-sm transition-all transform hover:scale-[1.01] active:translate-y-[1px] cursor-pointer"
            title="Inspect 100% Clean-Room Legal Provenance Matrix"
          >
            <ShieldCheck className="w-4 h-4 text-[#2E7D5B] shrink-0" />
            <span className="hidden sm:inline font-mono font-bold text-[11px]">
              100% Clean-Room Compliant: Overture + Public ASN + Non-CPNI
            </span>
            <span className="sm:hidden font-mono font-bold text-[11px]">Compliance Shield</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Full-Bleed Real Street & Satellite Map Canvas (Always Mounted in Background) */}
        <div className="absolute inset-0 w-full h-full z-0">
          <MapCanvas
            center={mapCenter}
            zoom={mapZoom}
            markers={isState1Open ? allBusinesses.slice(0, 30) : filteredBusinesses}
            selectedMarkerId={selectedBusiness?.overture_gers_id || null}
            onSelectMarker={handleSelectBusiness}
          />
        </div>

        {/* STATE 2: Left Business List Drawer (400px) */}
        {!isState1Open && (
          <LeftDrawer
            region={selectedRegion}
            subRegion={selectedSubRegion}
            subSubRegion={selectedSubSubRegion}
            allSubSubBusinesses={activeSubSubBusinesses}
            filteredBusinesses={filteredBusinesses}
            ispFilter={ispFilter}
            onIspFilterChange={setIspFilter}
            selectedTiers={selectedTiers}
            onToggleTier={(tier) => {
              setSelectedTiers((prev) =>
                prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier]
              );
            }}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            selectedBusinessId={selectedBusiness?.overture_gers_id || null}
            onSelectBusiness={handleSelectBusiness}
            onChangeRegion={handleChangeRegion}
          />
        )}

        {/* STATE 3: Adjacent Secondary Detail & Pitch Flyout Card (420px docked at left: 416px) */}
        {!isState1Open && selectedBusiness && (
          <DetailFlyout
            business={selectedBusiness}
            onClose={() => setSelectedBusiness(null)}
          />
        )}

        {/* STATE 1: Central Floating Multi-Layered Paper Folder Modal */}
        {isState1Open && (
          <CentralModal
            hierarchy={hierarchy}
            onAnalyzeTerritory={handleAnalyzeTerritory}
          />
        )}

        {/* Legal & Data Provenance Shield Modal */}
        <LegalProvenanceModal
          isOpen={isLegalModalOpen}
          onClose={() => setIsLegalModalOpen(false)}
        />
      </div>
    </div>
  );
}
