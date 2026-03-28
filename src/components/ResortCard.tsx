import { Resort } from "@/data/resorts";
import { Snowflake, Thermometer, Wind, Mountain, ArrowUpCircle, TrendingUp } from "lucide-react";

interface ResortCardProps {
  resort: Resort;
  onClick: (resort: Resort) => void;
}

const statusStyles = {
  open: "bg-alpine/20 text-alpine-foreground",
  closed: "bg-destructive/20 text-destructive",
  limited: "bg-warning/20 text-warning",
};

const conditionIcons: Record<string, string> = {
  Powder: "❄️",
  "Packed Powder": "🏔️",
  Groomed: "✨",
  "Spring Conditions": "☀️",
  Icy: "🧊",
};

export function ResortCard({ resort, onClick }: ResortCardProps) {
  const { stats } = resort;
  const liftsPercent = Math.round((stats.lifts.open / stats.lifts.total) * 100);
  const runsPercent = Math.round((stats.runs.open / stats.runs.total) * 100);

  return (
    <button
      onClick={() => onClick(resort)}
      className="w-full text-left rounded-lg bg-card border border-border p-4 sm:p-5 transition-all duration-300 card-glow hover:border-primary/40 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-ring"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <h3 className="font-display font-semibold text-foreground text-base sm:text-lg truncate">
            {resort.name}
          </h3>
          <p className="text-muted-foreground text-xs mt-0.5">
            {resort.location}, {resort.state}
          </p>
        </div>
        <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusStyles[resort.status]}`}>
          {resort.status}
        </span>
      </div>

      {/* Snow highlight */}
      {stats.newSnow24h > 0 && (
        <div className="flex items-center gap-1.5 mb-3 px-2 py-1.5 rounded-md bg-primary/10 border border-primary/20">
          <Snowflake className="w-3.5 h-3.5 text-primary animate-pulse-glow" />
          <span className="text-xs font-medium text-primary">
            {stats.newSnow24h}" new in 24h
          </span>
          <span className="text-[10px] text-muted-foreground ml-1">
            ({stats.newSnow48h}" in 48h)
          </span>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2.5 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Mountain className="w-3.5 h-3.5 text-primary/70" />
          <span>{stats.snowDepth}" base</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Thermometer className="w-3.5 h-3.5 text-primary/70" />
          <span>{stats.temperature.summit}°F summit</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <ArrowUpCircle className="w-3.5 h-3.5 text-primary/70" />
          <span>{stats.lifts.open}/{stats.lifts.total} lifts</span>
          <div className="flex-1 h-1 rounded-full bg-secondary ml-1">
            <div className="h-full rounded-full bg-primary/60" style={{ width: `${liftsPercent}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <TrendingUp className="w-3.5 h-3.5 text-primary/70" />
          <span>{stats.runs.open}/{stats.runs.total} runs</span>
          <div className="flex-1 h-1 rounded-full bg-secondary ml-1">
            <div className="h-full rounded-full bg-primary/60" style={{ width: `${runsPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border">
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
          <Wind className="w-3 h-3" />
          <span>{stats.wind}</span>
        </div>
        <span className="text-xs">
          {conditionIcons[stats.conditions] || "⛷️"} {stats.conditions}
        </span>
      </div>
    </button>
  );
}
