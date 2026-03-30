import { useMemo } from "react";
import { ResortMeta, LiveConditions } from "@/data/resorts";
import { Snowflake, ChevronRight } from "lucide-react";

type PowderAlertProps = {
  resorts: ResortMeta[];
  conditions: Map<string, LiveConditions>;
  onSelectResort: (resort: ResortMeta) => void;
};

type PowderEntry = {
  resort: ResortMeta;
  snow24h: number;
  snow48h: number;
  snow72h: number;
  best: number;
  label: string;
};

export const PowderAlert = ({ resorts, conditions, onSelectResort }: PowderAlertProps) => {
  const alerts = useMemo<PowderEntry[]>(() => {
    return resorts
      .map((r) => {
        const c = conditions.get(r.id);
        if (!c) return null;
        const { snowfall24h: snow24h, snowfall48h: snow48h, snowfall72h: snow72h } = c;
        // Trigger if any window has 6+ inches
        const best = Math.max(snow24h, snow48h, snow72h);
        if (best < 6) return null;
        const label =
          snow24h >= 6 ? `${snow24h.toFixed(0)}" in 24h` :
          snow48h >= 6 ? `${snow48h.toFixed(0)}" in 48h` :
          `${snow72h.toFixed(0)}" in 72h`;
        return { resort: r, snow24h, snow48h, snow72h, best, label };
      })
      .filter(Boolean)
      .sort((a, b) => b!.best - a!.best) as PowderEntry[];
  }, [resorts, conditions]);

  if (alerts.length === 0) return null;

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Snowflake className="w-4 h-4 text-primary animate-pulse" />
        <span className="text-xs font-display font-semibold text-primary uppercase tracking-wide">
          Powder Alert — {alerts.length} resort{alerts.length > 1 ? "s" : ""}
        </span>
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {alerts.map(({ resort, label, best }) => (
          <button
            key={resort.id}
            onClick={() => onSelectResort(resort)}
            className="shrink-0 flex items-center gap-2 rounded-md bg-card border border-border px-3 py-2 hover:border-primary/40 transition-colors group"
          >
            <div className="text-left">
              <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                {resort.name}
              </p>
              <p className="text-[10px] text-gradient-ice font-semibold">{label}</p>
            </div>
            <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
};
