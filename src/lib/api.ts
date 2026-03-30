import { ResortMeta, LiveConditions } from "@/data/resorts";

const WMO_CONDITIONS: Record<number, string> = {
  0: "Clear", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
  45: "Fog", 48: "Rime Fog",
  51: "Light Drizzle", 53: "Drizzle", 55: "Heavy Drizzle",
  61: "Light Rain", 63: "Rain", 65: "Heavy Rain",
  66: "Freezing Rain", 67: "Heavy Freezing Rain",
  71: "Light Snow", 73: "Snow", 75: "Heavy Snow",
  77: "Snow Grains", 80: "Rain Showers", 81: "Moderate Showers", 82: "Heavy Showers",
  85: "Light Snow Showers", 86: "Heavy Snow Showers",
  95: "Thunderstorm", 96: "Thunderstorm w/ Hail", 99: "Thunderstorm w/ Heavy Hail",
};

function cmToInches(cm: number): number {
  return Math.round(cm / 2.54 * 10) / 10;
}

function celsiusToF(c: number): number {
  return Math.round(c * 9 / 5 + 32);
}

function kmhToMph(kmh: number): number {
  return Math.round(kmh * 0.621371);
}

// Meters to feet for elevation parameter
function feetToMeters(ft: number): number {
  return Math.round(ft * 0.3048);
}

type LiftieResponse = {
  lifts?: {
    status?: Record<string, string>;
    stats?: { open?: number; hold?: number; scheduled?: number; closed?: number };
  };
  weather?: {
    conditions?: string;
    temperature?: { max?: number };
  };
};

type OpenMeteoResponse = {
  current?: {
    temperature_2m?: number;
    wind_speed_10m?: number;
    weather_code?: number;
    snowfall?: number;
  };
  hourly?: {
    time?: string[];
    snowfall?: number[];
  };
};

async function fetchLiftie(slug: string): Promise<LiftieResponse | null> {
  try {
    const res = await fetch(`https://liftie.info/api/resort/${slug}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchOpenMeteo(lat: number, lon: number, summitFt: number): Promise<OpenMeteoResponse | null> {
  try {
    const elev = feetToMeters(summitFt);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&elevation=${elev}&current=temperature_2m,wind_speed_10m,weather_code,snowfall&hourly=snowfall&forecast_days=2&past_days=3&temperature_unit=celsius&wind_speed_unit=kmh&precipitation_unit=mm`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function calcSnowfall(hourly: OpenMeteoResponse["hourly"]): { snow24h: number; snow48h: number; snow72h: number } {
  if (!hourly?.time || !hourly?.snowfall) return { snow24h: 0, snow48h: 0, snow72h: 0 };

  const now = new Date();
  let snow24h = 0;
  let snow48h = 0;
  let snow72h = 0;

  for (let i = 0; i < hourly.time.length; i++) {
    const t = new Date(hourly.time[i]);
    const hoursAgo = (now.getTime() - t.getTime()) / (1000 * 60 * 60);
    const sf = hourly.snowfall[i] || 0;
    if (hoursAgo >= 0 && hoursAgo <= 24) snow24h += sf;
    if (hoursAgo >= 0 && hoursAgo <= 48) snow48h += sf;
    if (hoursAgo >= 0 && hoursAgo <= 72) snow72h += sf;
  }

  return {
    snow24h: cmToInches(snow24h),
    snow48h: cmToInches(snow48h),
    snow72h: cmToInches(snow72h),
  };
}

export async function fetchResortConditions(resort: ResortMeta): Promise<LiveConditions> {
  const [liftie, weather] = await Promise.all([
    resort.liftieSlug ? fetchLiftie(resort.liftieSlug) : Promise.resolve(null),
    fetchOpenMeteo(resort.lat, resort.lon, resort.elevation.summit),
  ]);

  const { snow24h, snow48h, snow72h } = calcSnowfall(weather?.hourly);

  const liftStats = liftie?.lifts?.stats;
  const totalLifts = liftStats
    ? (liftStats.open || 0) + (liftStats.hold || 0) + (liftStats.scheduled || 0) + (liftStats.closed || 0)
    : 0;
  const openLifts = liftStats?.open || 0;

  let status: LiveConditions["status"] = "closed";
  if (openLifts > 0) {
    status = openLifts / totalLifts > 0.5 ? "open" : "limited";
  } else if (!liftie) {
    status = "open"; // default if no lift data
  }

  const weatherCode = weather?.current?.weather_code ?? null;
  const conditions =
    liftie?.weather?.conditions ||
    (weatherCode !== null ? WMO_CONDITIONS[weatherCode] || "Unknown" : "N/A");

  return {
    temperature: weather?.current?.temperature_2m != null ? celsiusToF(weather.current.temperature_2m) : null,
    windSpeed: weather?.current?.wind_speed_10m != null ? kmhToMph(weather.current.wind_speed_10m) : null,
    weatherCode,
    snowfall24h: snow24h,
    snowfall48h: snow48h,
    snowDepth: null, // no free API for snow depth
    conditions,
    lifts: liftie ? { open: openLifts, total: totalLifts } : null,
    liftDetails: liftie?.lifts?.status || null,
    status,
  };
}

export async function fetchAllResortConditions(
  resortList: ResortMeta[]
): Promise<Map<string, LiveConditions>> {
  const results = await Promise.allSettled(
    resortList.map(async (r) => ({
      id: r.id,
      conditions: await fetchResortConditions(r),
    }))
  );

  const map = new Map<string, LiveConditions>();
  for (const result of results) {
    if (result.status === "fulfilled") {
      map.set(result.value.id, result.value.conditions);
    }
  }
  return map;
}
