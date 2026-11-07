"use client";

import React, { useState, useEffect } from "react";
import { RegionState, SubRegion, SubSubRegion } from "../types";
import { MapPin, Search, ChevronRight, ShieldCheck, Compass, Building2, Sparkles } from "lucide-react";

interface CentralModalProps {
  hierarchy: RegionState[];
  onAnalyzeTerritory: (subSubRegion: SubSubRegion, subRegion: SubRegion, region: RegionState) => void;
}

export default function CentralModal({ hierarchy, onAnalyzeTerritory }: CentralModalProps) {
  const [selectedStateCode, setSelectedStateCode] = useState<string>("");
  const [selectedSubRegionName, setSelectedSubRegionName] = useState<string>("");
  const [selectedSubSubRegionId, setSelectedSubSubRegionId] = useState<number | null>(null);

  // Initialize with first region on load
  useEffect(() => {
    if (hierarchy.length > 0 && !selectedStateCode) {
      const firstState = hierarchy[0];
      setSelectedStateCode(firstState.state_code);
      if (firstState.sub_regions.length > 0) {
        const firstSub = firstState.sub_regions[0];
        setSelectedSubRegionName(firstSub.sub_region_name);
        if (firstSub.sub_sub_regions.length > 0) {
          setSelectedSubSubRegionId(firstSub.sub_sub_regions[0].id);
        }
      }
    }
  }, [hierarchy, selectedStateCode]);

  const currentState = hierarchy.find((s) => s.state_code === selectedStateCode) || hierarchy[0];
  const availableSubRegions = currentState?.sub_regions || [];
  const currentSubRegion =
    availableSubRegions.find((r) => r.sub_region_name === selectedSubRegionName) ||
    availableSubRegions[0];
  const availableSubSubRegions = currentSubRegion?.sub_sub_regions || [];
  const currentSubSubRegion =
    availableSubSubRegions.find((ss) => ss.id === selectedSubSubRegionId) ||
    availableSubSubRegions[0];

  const handleStateChange = (code: string) => {
    setSelectedStateCode(code);
    const st = hierarchy.find((s) => s.state_code === code);
    if (st && st.sub_regions.length > 0) {
      const sub = st.sub_regions[0];
      setSelectedSubRegionName(sub.sub_region_name);
      if (sub.sub_sub_regions.length > 0) {
        setSelectedSubSubRegionId(sub.sub_sub_regions[0].id);
      }
    }
  };

  const handleSubRegionChange = (subName: string) => {
    setSelectedSubRegionName(subName);
    const sub = availableSubRegions.find((r) => r.sub_region_name === subName);
    if (sub && sub.sub_sub_regions.length > 0) {
      setSelectedSubSubRegionId(sub.sub_sub_regions[0].id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentSubSubRegion && currentSubRegion && currentState) {
      onAnalyzeTerritory(currentSubSubRegion, currentSubRegion, currentState);
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 z-40 bg-[#1C1917]/25 backdrop-blur-[2px]">
      <div className="w-full max-w-xl animate-in fade-in zoom-in-95 duration-200">
        {/* Physical Top Folder Tab */}
        <div className="flex items-center ml-2">
          <div className="bg-[#E8E2D5] border-t-[1.5px] border-l-[1.5px] border-r-[1.5px] border-[#DED6C6] px-5 py-2 rounded-t-lg flex items-center gap-2 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C84B31]"></span>
            <span className="font-mono text-[11px] font-bold tracking-wider text-[#655E54] uppercase">
              TERRITORY DOSSIER • ARCHITECTURAL SURVEY #AT-2026
            </span>
          </div>
        </div>

        {/* Multi-layered Architectural Folder Card */}
        <div className="cutout-card-lg bg-[#FAF7F2] p-8 rounded-b-xl rounded-tr-xl border-[1.5px] border-[#DED6C6] relative">
          {/* Header */}
          <div className="border-b-[1.5px] border-[#DED6C6] pb-5 mb-6">
            <div className="flex items-center justify-between mb-1.5">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold tracking-wide uppercase bg-[#E8E2D5] text-[#2E7D5B] border border-[#DED6C6]">
                Non-CPNI Clean-Room Intelligence
              </span>
              <span className="text-xs font-mono text-[#9C9488]">
                CRS: WGS-84 / H3-RES8
              </span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-[#1C1917] tracking-tight leading-tight">
              AT&T Territory & Fiber Intelligence
            </h1>
            <p className="text-sm text-[#655E54] mt-1.5 font-sans leading-relaxed">
              Explore deterministic outside-in commercial fiber requirements, on-net customer ASN footprints, and mall sub-unit hierarchies across US metro sectors.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Cascading Selector 1: State / Region */}
            <div className="cutout-well p-3 rounded-lg">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#655E54] mb-1.5">
                1. Select Region (State Territory)
              </label>
              <select
                value={selectedStateCode}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full bg-[#FAF7F2] border-[1.5px] border-[#DED6C6] rounded-md px-3.5 py-2 text-[#1C1917] font-medium text-sm focus:outline-none focus:border-[#C84B31] shadow-inner transition-colors"
              >
                {hierarchy.map((state) => (
                  <option key={state.state_code} value={state.state_code}>
                    {state.state_name} ({state.state_code})
                  </option>
                ))}
              </select>
            </div>

            {/* Cascading Selector 2: Metro / Sub-Region */}
            <div className="cutout-well p-3 rounded-lg">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#655E54] mb-1.5">
                2. Select Sub-Region (Metro / County)
              </label>
              <select
                value={selectedSubRegionName}
                onChange={(e) => handleSubRegionChange(e.target.value)}
                disabled={availableSubRegions.length === 0}
                className="w-full bg-[#FAF7F2] border-[1.5px] border-[#DED6C6] rounded-md px-3.5 py-2 text-[#1C1917] font-medium text-sm focus:outline-none focus:border-[#C84B31] shadow-inner transition-colors disabled:opacity-50"
              >
                {availableSubRegions.map((sub) => (
                  <option key={sub.sub_region_name} value={sub.sub_region_name}>
                    {sub.sub_region_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Cascading Selector 3: District / Sub-Sub-Region */}
            <div className="cutout-well p-3 rounded-lg">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#655E54] mb-1.5 flex items-center justify-between">
                <span>3. Select Sub-Sub-Region (District / Mall Complex)</span>
                {currentSubSubRegion?.is_mall && (
                  <span className="text-[#C84B31] text-[10px] font-mono font-bold uppercase tracking-tight flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Mall Sub-Units
                  </span>
                )}
              </label>
              <select
                value={selectedSubSubRegionId ?? ""}
                onChange={(e) => setSelectedSubSubRegionId(Number(e.target.value))}
                disabled={availableSubSubRegions.length === 0}
                className="w-full bg-[#FAF7F2] border-[1.5px] border-[#DED6C6] rounded-md px-3.5 py-2 text-[#1C1917] font-medium text-sm focus:outline-none focus:border-[#C84B31] shadow-inner transition-colors disabled:opacity-50"
              >
                {availableSubSubRegions.map((ss) => (
                  <option key={ss.id} value={ss.id}>
                    {ss.name} {ss.is_mall ? "(Indoor Shopping Mall Complex)" : "(Commercial District)"}
                  </option>
                ))}
              </select>
            </div>

            {/* Primary Action Button (Terracotta Stamp) */}
            <button
              type="submit"
              className="terracotta-btn w-full py-3.5 px-6 rounded-lg font-bold text-base flex items-center justify-center gap-2 mt-5 tracking-wide"
            >
              <Compass className="w-5 h-5" />
              <span>Analyze Territory & Zoom Map</span>
              <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          </form>

          {/* Footer Metadata */}
          <div className="mt-5 pt-4 border-t-[1.5px] border-[#DED6C6] flex items-center justify-between text-[11px] text-[#655E54]">
            <div className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-[#2E7D5B]" />
              <span>100% Clean-Room Compliant (Overture + Non-CPNI)</span>
            </div>
            <div className="font-mono text-[#9C9488]">
              LAT: {currentSubSubRegion?.center_lat.toFixed(4) || "0.0000"} | LNG: {currentSubSubRegion?.center_lng.toFixed(4) || "0.0000"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
