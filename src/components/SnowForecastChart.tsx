import { useEffect, useState } from "react";
import { ResortMeta } from "@/data/resorts";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Loader2, CloudSnow } from "lucide-react";

interface ForecastDay {
  date: string;
  label: string;
  snowfall: number;
}

function cmToInches(cm: number): number {
  return Math.round(cm / 2.54 * 10) / 10;
}

function feetToMeters(ft: number): number {
  return Math.round(ft * 0.3048);
}

async function fetchForecast(resort: ResortMeta): Promise<ForecastDay[]> {
  const elev = feetToMeters(resort.elevation.summit);
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${resort.lat}&longitude=${resort.lon}&elevation=${elev}&daily=snowfall_sum&forecast_days=5&past_days=2&temperature_unit=celsius&precipitation_unit=mm`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();

  const days: ForecastDay[] = [];
  const today = new Date().toISOString().split("T")[0];

  for (let i = 0; i < (data.daily?.time?.length ?? 0); i++) {
    const dateStr = data.daily.time[i];
    const snowCm = data.daily.snowfall_sum[i] ?? 0;
    const d = new Date(dateStr + "T12:00:00");
    const isToday = dateStr === today;
    const isPast = dateStr < today;
    const label = isToday
      ? "Today"
      : isPast
        ? d.toLocaleDateString("en-US", { weekday: "short" })
        : d.toLocaleDateString("en-US", { weekday: "short" });

    days.push({
      date: dateStr,
      label,
      snowfall: cmToInches(snowCm),
    });
  }

  return days;
}

function getBarColor(snowfall: number, date: string): string {
  const today = new Date().toISOString().split("T")[0];
  const isPast = date < today;
  if (isPast) return "hsl(215, 15%, 35%)";
  if (snowfall >= 6) return "hsl(200, 80%, 55%)";
  if (snowfall >= 2) return "hsl(195, 90%, 65%)";
  if (snowfall > 0) return "hsl(160, 50%, 45%)";
  return "hsl(215, 15%, 25%)";
}

export function SnowForecastChart({ resort }: { resort: ResortMeta }) {
  const [data, setData] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchForecast(resort).then((d) => {
      setData(d);
      setLoading(false);
    });
  }, [resort.id]);

  if (loading) {
    return (
      <section className="rounded-lg bg-card border border-border p-4">
        <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Snow Forecast</h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  const maxSnow = Math.max(...data.map((d) => d.snowfall), 1);

  return (
    <section className="rounded-lg bg-card border border-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <CloudSnow className="w-4 h-4 text-primary/70" />
        <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider">7-Day Snowfall</h2>
      </div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
            <XAxis
              dataKey="label"
              tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={[0, Math.max(maxSnow * 1.2, 1)]}
              tickFormatter={(v: number) => `${v}"`}
            />
            <Tooltip
              cursor={false}
              contentStyle={{
                background: "hsl(220, 18%, 13%)",
                border: "1px solid hsl(220, 15%, 20%)",
                borderRadius: "0.5rem",
                fontSize: 12,
                color: "hsl(210, 20%, 95%)",
              }}
              formatter={(value: number) => [`${value}"`, "Snowfall"]}
              labelFormatter={(label: string) => label}
            />
            <Bar dataKey="snowfall" radius={[4, 4, 0, 0]} maxBarSize={36}>
              {data.map((entry, index) => (
                <Cell key={index} fill={getBarColor(entry.snowfall, entry.date)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-3 mt-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background: "hsl(200, 80%, 55%)" }} />6"+</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background: "hsl(195, 90%, 65%)" }} />2-6"</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background: "hsl(160, 50%, 45%)" }} />&lt;2"</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background: "hsl(215, 15%, 35%)" }} />Past</span>
      </div>
    </section>
  );
}
