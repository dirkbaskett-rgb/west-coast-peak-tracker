import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ResortMeta, LiveConditions } from "@/data/resorts";
import { AvalancheZone, fetchAvalancheForecast, DANGER_LABELS, DANGER_COLORS } from "@/lib/avalanche";
import { useLargeText } from "@/hooks/use-large-text";
import { LargeTextToggle } from "@/components/LargeTextToggle";

interface ResortMapProps {
  resorts: ResortMeta[];
  conditions: Map<string, LiveConditions>;
  onSelectResort: (resort: ResortMeta) => void;
  onNavigate?: (panel: 0 | 1) => void;
}

function snowColor(inches: number): string {
  if (inches >= 12) return "hsl(210, 80%, 35%)";
  if (inches >= 6) return "hsl(210, 70%, 50%)";
  if (inches >= 1) return "hsl(210, 60%, 70%)";
  if (inches > 0) return "hsl(0, 0%, 92%)";
  return "hsl(215, 15%, 40%)";
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
  const avalancheLayerRef = useRef<L.LayerGroup | null>(null);
  const [showAvalanche, setShowAvalanche] = useState(true);
  const { largeText } = useLargeText();
  const [avalancheZones, setAvalancheZones] = useState<AvalancheZone[]>([]);
  const [avalancheLoading, setAvalancheLoading] = useState(false);

  // Init map
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

    avalancheLayerRef.current = L.layerGroup().addTo(map);

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Fetch avalanche data on first toggle
  useEffect(() => {
    if (showAvalanche && avalancheZones.length === 0 && !avalancheLoading) {
      setAvalancheLoading(true);
      fetchAvalancheForecast().then((zones) => {
        setAvalancheZones(zones);
        setAvalancheLoading(false);
      });
    }
  }, [showAvalanche, avalancheZones.length, avalancheLoading]);

  // Render avalanche overlay
  useEffect(() => {
    const layer = avalancheLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    if (!showAvalanche || avalancheZones.length === 0) return;

    avalancheZones.forEach((zone) => {
      const geoJson = L.geoJSON(zone.geometry as any, {
        style: {
          fillColor: zone.color,
          fillOpacity: 0.35,
          color: zone.stroke,
          weight: 1.5,
          opacity: 0.7,
        },
      });

      geoJson.bindPopup(`
        <div style="font-family: 'Space Grotesk', sans-serif; min-width: 180px;">
          <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">${zone.name}</div>
          <div style="font-size: 12px; color: #666; margin-bottom: 8px;">${zone.center}</div>
          <div style="display: inline-block; padding: 3px 10px; border-radius: 4px; background: ${zone.color}; color: ${zone.fontColor}; font-weight: 600; font-size: 13px; margin-bottom: 6px;">
            ${zone.danger.toUpperCase()} (${zone.dangerLevel >= 0 ? zone.dangerLevel : "—"})
          </div>
          ${zone.travelAdvice ? `<div style="font-size: 11px; color: #555; margin-top: 6px; line-height: 1.4;">${zone.travelAdvice}</div>` : ""}
          <div style="margin-top: 8px;">
            <a href="${zone.link}" target="_blank" rel="noopener" style="font-size: 11px; color: hsl(200, 80%, 45%); text-decoration: none;">Full forecast →</a>
          </div>
        </div>
      `, { maxWidth: 280 });

      geoJson.addTo(layer);
    });
  }, [showAvalanche, avalancheZones]);

  // Resort markers
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

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

  // Handle popup detail clicks
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

  const avalancheLegend = [
    { level: 5, label: "Extreme", color: DANGER_COLORS[5] },
    { level: 4, label: "High", color: DANGER_COLORS[4] },
    { level: 3, label: "Considerable", color: DANGER_COLORS[3] },
    { level: 2, label: "Moderate", color: DANGER_COLORS[2] },
    { level: 1, label: "Low", color: DANGER_COLORS[1] },
  ];

  const textSize = largeText ? "text-lg" : "text-sm";
  const headingSize = largeText ? "text-xl" : "text-sm";
  const dotSize = largeText ? "w-6 h-6" : "w-4 h-4";
  const checkSize = largeText ? "w-4 h-4" : "w-3 h-3";
  const gapSize = largeText ? "gap-3" : "gap-2.5";
  const spaceSize = largeText ? "space-y-2.5" : "space-y-1.5";
  const padSize = largeText ? "p-5" : "p-4";

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

      {/* Accessibility toggle */}
      <div className="absolute top-3 right-3 z-[1000]">
        <LargeTextToggle />
      </div>

      {/* Snowfall Legend */}
      <div className={`absolute top-3 left-3 z-[1000] rounded-lg bg-card/90 backdrop-blur-sm border border-border ${padSize}`}>
        <p className={`${headingSize} font-semibold text-foreground uppercase tracking-wider mb-2.5`}>24h Snowfall</p>
        <div className={spaceSize}>
          {legendItems.map(({ label, color }) => (
            <div key={label} className={`flex items-center ${gapSize}`}>
              <span
                className={`${dotSize} rounded-full shrink-0`}
                style={{ background: color, boxShadow: `0 0 6px ${color}60` }}
              />
              <span className={`${textSize} text-foreground/80`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Avalanche toggle + legend */}
      <div className={`absolute bottom-8 left-3 z-[1000] rounded-lg bg-card/90 backdrop-blur-sm border border-border ${padSize}`}>
        <button
          onClick={() => setShowAvalanche(!showAvalanche)}
          className={`flex items-center gap-2 ${headingSize} font-semibold uppercase tracking-wider mb-1 transition-colors ${
            showAvalanche ? "text-destructive" : "text-foreground"
          }`}
        >
          <span className={`${checkSize} rounded-sm border-2 transition-colors ${
            showAvalanche ? "bg-destructive border-destructive" : "border-foreground/40"
          }`} />
          Avalanche Forecast
        </button>
        {avalancheLoading && (
          <p className={`${textSize} text-muted-foreground mt-1`}>Loading...</p>
        )}
        {showAvalanche && !avalancheLoading && (
          <div className={`${spaceSize} mt-2`}>
            {avalancheLegend.map(({ label, color }) => (
              <div key={label} className={`flex items-center ${gapSize}`}>
                <span
                  className={`${dotSize} rounded shrink-0`}
                  style={{ background: color, opacity: 0.7 }}
                />
                <span className={`${textSize} text-foreground/80`}>{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
