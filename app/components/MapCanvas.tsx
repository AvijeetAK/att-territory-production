"use client";

import React, { useState, useEffect, useRef } from "react";
import { Business } from "../types";
import { Layers, MapPin, Globe, Satellite, Compass, ZoomIn, ZoomOut } from "lucide-react";

declare global {
  interface Window {
    L: any;
  }
}

interface MapCanvasProps {
  center: { lat: number; lng: number };
  zoom: number;
  markers: Business[];
  selectedMarkerId: string | null;
  onSelectMarker: (business: Business) => void;
}

type MapLayerType = "street" | "topo" | "satellite";

export default function MapCanvas({
  center,
  zoom,
  markers,
  selectedMarkerId,
  onSelectMarker,
}: MapCanvasProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const activeTileLayerRef = useRef<any>(null);
  const markersLayerGroupRef = useRef<any>(null);

  const [activeLayer, setActiveLayer] = useState<MapLayerType>("street");
  const [isLeafletReady, setIsLeafletReady] = useState(false);

  // 1. Ensure Leaflet is loaded in browser
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.L) {
      setIsLeafletReady(true);
      return;
    }

    const interval = setInterval(() => {
      if (window.L) {
        setIsLeafletReady(true);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Helper to get key-free, watermark-free tile layer definition
  const getTileLayer = (L: any, layerType: MapLayerType) => {
    if (layerType === "street") {
      // 100% key-free Esri World Street Map with subtle warm architectural paper filter
      return L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, TomTom",
          maxZoom: 19,
          className: "esri-street-paper",
        }
      );
    } else if (layerType === "topo") {
      // 100% key-free Esri World Topographic Map
      return L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri",
          maxZoom: 19,
        }
      );
    } else {
      // 100% key-free Esri World Satellite & Aerial Imagery
      return L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
          maxZoom: 19,
        }
      );
    }
  };

  // 2. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!isLeafletReady || !mapContainerRef.current || mapInstanceRef.current) return;

    const L = window.L;

    // Create map instance
    const map = L.map(mapContainerRef.current, {
      center: [center.lat, center.lng],
      zoom: zoom,
      zoomControl: false,
      attributionControl: false,
    });

    // Add initial tile layer
    const initialTiles = getTileLayer(L, activeLayer);
    initialTiles.addTo(map);
    activeTileLayerRef.current = initialTiles;

    // Create markers layer group
    const markersGroup = L.layerGroup().addTo(map);
    markersLayerGroupRef.current = markersGroup;

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isLeafletReady]);

  // 3. Smooth flyTo animation when Center or Zoom changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([center.lat, center.lng], zoom, {
      duration: 1.6,
      easeLinearity: 0.25,
    });
  }, [center.lat, center.lng, zoom]);

  // 4. Switch Tile Layers when activeLayer changes
  useEffect(() => {
    if (!mapInstanceRef.current || !isLeafletReady) return;
    const L = window.L;

    if (activeTileLayerRef.current) {
      mapInstanceRef.current.removeLayer(activeTileLayerRef.current);
    }

    const newTiles = getTileLayer(L, activeLayer);
    newTiles.addTo(mapInstanceRef.current);
    activeTileLayerRef.current = newTiles;
  }, [activeLayer, isLeafletReady]);

  // 5. Render Custom Paper-Cutout Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerGroupRef.current || !isLeafletReady) return;
    const L = window.L;

    markersLayerGroupRef.current.clearLayers();

    markers.forEach((biz) => {
      const isSelected = biz.overture_gers_id === selectedMarkerId;

      // Color mapping following strict business rules
      let pinColor = "#D9822B"; // Ochre Gold (MICRO)
      if (biz.is_att_customer) {
        pinColor = "#0077B6"; // Cerulean Ink (AT&T On-Net)
      } else if (biz.size_tier === "SMALL") {
        pinColor = "#2E7D5B"; // Botanical Sage
      } else if (biz.size_tier === "MEDIUM") {
        pinColor = "#6D4C7D"; // Plum Aubergine
      } else if (biz.size_tier === "LARGE") {
        pinColor = "#B8332A"; // Crimson Clay
      }

      const iconHtml = `
        <div class="paper-pin-wrapper ${isSelected ? "paper-pin-selected" : ""}" style="width: 32px; height: 38px;">
          <div class="paper-tack-pin">
            <div class="paper-tack-body" style="background-color: ${pinColor}; ${
        isSelected ? "border-color: #C84B31; transform: rotate(-45deg) scale(1.15);" : ""
      }">
              <div class="paper-tack-core"></div>
            </div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "leaflet-paper-pin",
        iconSize: [32, 38],
        iconAnchor: [16, 38],
        popupAnchor: [0, -36],
      });

      const marker = L.marker([biz.latitude, biz.longitude], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : 0,
      });

      // Bind tactile paper tooltip
      const tooltipHtml = `
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 6px 10px; background: #FAF7F2; border: 1.5px solid #DED6C6; border-radius: 6px; box-shadow: 3px 4px 0px #D5CCB9; color: #1C1917;">
          <div style="font-weight: 700; font-size: 13px; line-height: 1.2;">${biz.business_name}</div>
          <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px; font-size: 11px; color: #655E54; font-family: 'JetBrains Mono', monospace;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${pinColor};"></span>
            <span>${biz.modeled_bandwidth_mbps} Mbps</span>
            <span>•</span>
            <span>${biz.size_tier}</span>
            ${biz.floor_unit ? `<span>• ${biz.floor_unit}</span>` : ""}
          </div>
        </div>
      `;

      marker.bindTooltip(tooltipHtml, {
        direction: "top",
        offset: [0, -32],
        opacity: 0.98,
        className: "tactile-paper-tooltip",
      });

      marker.on("click", () => {
        onSelectMarker(biz);
      });

      markersLayerGroupRef.current.addLayer(marker);
    });
  }, [markers, selectedMarkerId, isLeafletReady]);

  // Zoom controls
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-[#F3EFE6] overflow-hidden">
      {/* Real Map Canvas DOM element */}
      <div
        ref={mapContainerRef}
        id="leaflet-street-map-canvas"
        className="absolute inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing"
      />

      {/* Tactile Zoom Stamp Controls (Bottom Right) */}
      <div className="absolute right-6 bottom-24 z-10 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="w-10 h-10 bg-[#FAF7F2] border-[1.5px] border-[#DED6C6] rounded-md shadow-cutout-sm hover:bg-[#F3EFE6] active:translate-y-[1px] active:shadow-none flex items-center justify-center text-[#1C1917] transition-all"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="w-10 h-10 bg-[#FAF7F2] border-[1.5px] border-[#DED6C6] rounded-md shadow-cutout-sm hover:bg-[#F3EFE6] active:translate-y-[1px] active:shadow-none flex items-center justify-center text-[#1C1917] transition-all"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
      </div>

      {/* Floating Map Layer Switcher (Bottom Right Corner) */}
      <div className="absolute right-6 bottom-6 z-10 flex items-center bg-[#FAF7F2] border-[1.5px] border-[#DED6C6] rounded-lg p-1.5 shadow-cutout">
        <div className="flex items-center gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveLayer("street")}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
              activeLayer === "street"
                ? "bg-[#C84B31] text-[#FAF7F2] shadow-stamp-pressed font-bold"
                : "text-[#655E54] hover:bg-[#E8E2D5] hover:text-[#1C1917]"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Editorial Street</span>
          </button>

          <button
            onClick={() => setActiveLayer("topo")}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
              activeLayer === "topo"
                ? "bg-[#C84B31] text-[#FAF7F2] shadow-stamp-pressed font-bold"
                : "text-[#655E54] hover:bg-[#E8E2D5] hover:text-[#1C1917]"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Clean Topographic</span>
          </button>

          <button
            onClick={() => setActiveLayer("satellite")}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
              activeLayer === "satellite"
                ? "bg-[#C84B31] text-[#FAF7F2] shadow-stamp-pressed font-bold"
                : "text-[#655E54] hover:bg-[#E8E2D5] hover:text-[#1C1917]"
            }`}
          >
            <Satellite className="w-3.5 h-3.5" />
            <span>Real Satellite</span>
          </button>
        </div>
      </div>
    </div>
  );
}
