export interface AvalancheZone {
  name: string;
  center: string;
  danger: string;
  dangerLevel: number;
  color: string;
  stroke: string;
  fontColor: string;
  link: string;
  travelAdvice: string;
  geometry: GeoJSON.Geometry;
}

export const DANGER_LABELS: Record<number, string> = {
  [-1]: "No Rating",
  0: "No Danger",
  1: "Low",
  2: "Moderate",
  3: "Considerable",
  4: "High",
  5: "Extreme",
};

export const DANGER_COLORS: Record<number, string> = {
  [-1]: "#888888",
  0: "#cccccc",
  1: "#55b64f",
  2: "#f4e500",
  3: "#ff9933",
  4: "#ff0000",
  5: "#000000",
};

export async function fetchAvalancheForecast(): Promise<AvalancheZone[]> {
  try {
    const res = await fetch("https://api.avalanche.org/v2/public/products/map-layer");
    if (!res.ok) return [];
    const data = await res.json();
    return (data.features || []).map((f: any) => ({
      name: f.properties.name,
      center: f.properties.center,
      danger: f.properties.danger,
      dangerLevel: f.properties.danger_level,
      color: f.properties.color,
      stroke: f.properties.stroke,
      fontColor: f.properties.font_color,
      link: f.properties.link,
      travelAdvice: f.properties.travel_advice || "",
      geometry: f.geometry,
    }));
  } catch {
    return [];
  }
}
