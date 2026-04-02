import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ResortMeta, LiveConditions } from "@/data/resorts";

interface ResortMapProps {
  resorts: ResortMeta[];
  conditions: Map<string, LiveConditions>;
  onSelectResort: (resort: ResortMeta) => void;
  onNavigate?: (panel: 0 | 1) => void;
}

function snowColor(inches: number): string {
  if (inches >= 12) return "hsl(210, 80%, 35%)";   // dark blue
  if (inches >= 6) return "hsl(210, 70%, 50%)";    // blue
  if (inches >= 1) return "hsl(210, 60%, 70%)";    // light blue
  if (inches > 0) return "hsl(0, 0%, 92%)";        // white / trace
  return "hsl(215, 15%, 40%)";                      // muted - no snow
}

function snowLabel(inches: number): string {
  if (inches >= 12) return "12\"+ DEEP POWDER";
  if (inches >= 6) return "6-12\" POWDER";
  if (inches >= 1) return "1-6\" FRESH";
  if (inches > 0) return "< 1\" TRACE";
  return "NO NEW SNOW";
}

function createMarkerIcon(color: string, size: number = 12) {
  return L.divIcon({
    className: "",
    iconSize: [size * 2, size * 2],
    iconAnchor: [size, size],
    popupAnchor: [0, -size],
    html: `<div style="
      width: ${size * 2}px;
      height: ${size * 2}px;
      border-radius: 50%;
      background: ${color};
      border: 2px solid hsl(220, 20%, 10%);
      box-shadow: 0 0 8px ${color}80;
      cursor: pointer;
    "></div>`,
  });
}

export function ResortMap({ resorts, conditions, onSelectResort, onNavigate }: ResortMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [45.5, -115],
      zoom: 5,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 13,
      minZoom: 4,
    }).addTo(map);

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    resorts.forEach((resort) => {
      const cond = conditions.get(resort.id);
      const snow = cond?.snowfall24h ?? 0;
      const color = snowColor(snow);
      const size = snow >= 12 ? 16 : snow >= 6 ? 14 : 12;

      const marker = L.marker([resort.lat, resort.lon], {
        icon: createMarkerIcon(color, size),
      });

      const popupContent = `
        <div style="font-family: 'Space Grotesk', sans-serif; color: hsl(210,20%,95%); min-width: 140px;">
          <div style="font-weight: 600; font-size: 13px; margin-bottom: 4px;">${resort.name}</div>
          <div style="font-size: 11px; color: hsl(215,15%,55%); margin-bottom: 6px;">${resort.state}</div>
          ${cond ? `
            <div style="display: flex; gap: 12px; font-size: 11px; margin-bottom: 4px;">
              <span>❄️ ${snow}" 24h</span>
              <span>🌡 ${cond.temperature != null ? cond.temperature + "°F" : "—"}</span>
            </div>
            ${cond.lifts ? `<div style="font-size: 11px;">🚡 ${cond.lifts.open}/${cond.lifts.total} lifts</div>` : ""}
          ` : `<div style="font-size: 11px; color: hsl(215,15%,55%);">Loading...</div>`}
          <div style="font-size: 10px; margin-top: 6px; color: hsl(200,80%,55%); cursor: pointer;" class="mc-map-detail" data-id="${resort.id}">View details →</div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: "mc-map-popup",
        closeButton: false,
      });

      marker.addTo(map);
    });
  }, [resorts, conditions, onSelectResort]);

  // Handle "View details" clicks inside popups
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("mc-map-detail")) {
        const id = target.dataset.id;
        const resort = resorts.find((r) => r.id === id);
        if (resort) onSelectResort(resort);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [resorts, onSelectResort]);

  const legendItems = [
    { label: '12"+', color: "hsl(210, 80%, 35%)" },
    { label: '6-12"', color: "hsl(210, 70%, 50%)" },
    { label: '1-6"', color: "hsl(210, 60%, 70%)" },
    { label: "Trace", color: "hsl(0, 0%, 92%)" },
    { label: "None", color: "hsl(215, 15%, 40%)" },
  ];

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="absolute inset-0" />

      {/* Navigation tabs */}
      {onNavigate && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex gap-3">
          <button
            onClick={() => onNavigate(1)}
            className="px-6 py-3.5 rounded-lg bg-card/90 backdrop-blur-sm border border-border text-base font-medium text-foreground/80 hover:text-primary hover:border-primary/40 transition-colors"
          >
            Resorts
          </button>
          <button
            onClick={() => onNavigate(0)}
            className="px-6 py-3.5 rounded-lg bg-card/90 backdrop-blur-sm border border-border text-base font-medium text-foreground/80 hover:text-primary hover:border-primary/40 transition-colors"
          >
            Trip Planner
          </button>
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-3 left-3 z-[1000] rounded-lg bg-card/90 backdrop-blur-sm border border-border p-4">
        <p className="text-sm font-semibold text-foreground uppercase tracking-wider mb-2.5">24h Snowfall</p>
        <div className="space-y-1.5">
          {legendItems.map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2.5">
              <span
                className="w-4 h-4 rounded-full shrink-0"
                style={{ background: color, boxShadow: `0 0 6px ${color}60` }}
              />
              <span className="text-sm text-foreground/80">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
