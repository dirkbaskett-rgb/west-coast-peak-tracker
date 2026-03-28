import { ResortMeta, LiveConditions } from "@/data/resorts";
import { Snowflake, Thermometer, Wind, Mountain, ArrowUpCircle, CloudSnow, Star } from "lucide-react";

interface ResortCardProps {
  resort: ResortMeta;
  conditions: LiveConditions | undefined;
  onClick: (resort: ResortMeta) => void;
}

const statusStyles = {
  open: "bg-alpine/20 text-alpine-foreground",
  closed: "bg-destructive/20 text-destructive",
  limited: "bg-warning/20 text-warning",
};

export function ResortCard({ resort, conditions, onClick }: ResortCardProps) {
  const loading = !conditions;

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
        {conditions && (
          <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusStyles[conditions.status]}`}>
            {conditions.status}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
          <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
        </div>
      ) : (
        <>
          {/* Snow highlight */}
          {conditions.snowfall24h > 0 && (
            <div className="flex items-center gap-1.5 mb-3 px-2 py-1.5 rounded-md bg-primary/10 border border-primary/20">
              <Snowflake className="w-3.5 h-3.5 text-primary animate-pulse-glow" />
              <span className="text-xs font-medium text-primary">
                {conditions.snowfall24h}" new in 24h
              </span>
              {conditions.snowfall48h > conditions.snowfall24h && (
                <span className="text-[10px] text-muted-foreground ml-1">
                  ({conditions.snowfall48h}" in 48h)
                </span>
              )}
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Thermometer className="w-3.5 h-3.5 text-primary/70" />
              <span>{conditions.temperature != null ? `${conditions.temperature}°F` : "—"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Wind className="w-3.5 h-3.5 text-primary/70" />
              <span>{conditions.windSpeed != null ? `${conditions.windSpeed} mph` : "—"}</span>
            </div>
            {conditions.lifts && (
              <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
                <ArrowUpCircle className="w-3.5 h-3.5 text-primary/70" />
                <span>{conditions.lifts.open}/{conditions.lifts.total} lifts</span>
                <div className="flex-1 h-1 rounded-full bg-secondary ml-1">
                  <div
                    className="h-full rounded-full bg-primary/60"
                    style={{ width: `${conditions.lifts.total > 0 ? Math.round((conditions.lifts.open / conditions.lifts.total) * 100) : 0}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <Mountain className="w-3 h-3" />
              <span>{resort.elevation.summit.toLocaleString()}'</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <CloudSnow className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">{conditions.conditions}</span>
            </div>
          </div>
        </>
      )}
    </button>
  );
}
