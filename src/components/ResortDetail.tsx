import { Resort } from "@/data/resorts";
import { ArrowLeft, ExternalLink, Snowflake, Thermometer, Wind, Mountain, ArrowUpCircle, TrendingUp, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResortDetailProps {
  resort: Resort;
  onBack: () => void;
}

export function ResortDetail({ resort, onBack }: ResortDetailProps) {
  const { stats, elevation } = resort;
  const liftsPercent = Math.round((stats.lifts.open / stats.lifts.total) * 100);
  const runsPercent = Math.round((stats.runs.open / stats.runs.total) * 100);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="font-display font-bold text-foreground text-lg truncate">{resort.name}</h1>
            <p className="text-xs text-muted-foreground">{resort.location}, {resort.state}, {resort.country}</p>
          </div>
          <a href={resort.website} target="_blank" rel="noopener noreferrer"
            className="shrink-0 text-muted-foreground hover:text-primary transition-colors">
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Snow Alert */}
        {stats.newSnow24h > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <Snowflake className="w-5 h-5 text-primary animate-pulse-glow" />
            <div>
              <p className="text-sm font-semibold text-primary">{stats.newSnow24h}" fresh in 24h</p>
              <p className="text-xs text-muted-foreground">{stats.newSnow48h}" in 48h • {stats.conditions}</p>
            </div>
          </div>
        )}

        {/* Snow & Weather */}
        <section className="rounded-lg bg-card border border-border p-4">
          <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Snow & Weather</h2>
          <div className="grid grid-cols-2 gap-4">
            <Stat icon={<Mountain className="w-4 h-4" />} label="Snow Depth" value={`${stats.snowDepth}"`} />
            <Stat icon={<Snowflake className="w-4 h-4" />} label="24h Snowfall" value={`${stats.newSnow24h}"`} />
            <Stat icon={<Thermometer className="w-4 h-4" />} label="Base Temp" value={`${stats.temperature.base}°F`} />
            <Stat icon={<Thermometer className="w-4 h-4" />} label="Summit Temp" value={`${stats.temperature.summit}°F`} />
            <Stat icon={<Wind className="w-4 h-4" />} label="Wind" value={stats.wind} />
            <Stat icon={<Ruler className="w-4 h-4" />} label="Conditions" value={stats.conditions} />
          </div>
        </section>

        {/* Terrain */}
        <section className="rounded-lg bg-card border border-border p-4">
          <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Terrain Status</h2>
          <div className="space-y-4">
            <ProgressStat
              icon={<ArrowUpCircle className="w-4 h-4" />}
              label="Lifts"
              open={stats.lifts.open}
              total={stats.lifts.total}
              percent={liftsPercent}
            />
            <ProgressStat
              icon={<TrendingUp className="w-4 h-4" />}
              label="Runs"
              open={stats.runs.open}
              total={stats.runs.total}
              percent={runsPercent}
            />
          </div>
        </section>

        {/* Elevation */}
        <section className="rounded-lg bg-card border border-border p-4">
          <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Elevation</h2>
          <div className="flex items-end justify-between text-center">
            <div>
              <p className="text-2xl font-display font-bold text-foreground">{elevation.base.toLocaleString()}'</p>
              <p className="text-xs text-muted-foreground mt-1">Base</p>
            </div>
            <div className="flex-1 mx-4 h-px bg-gradient-to-r from-border via-primary/30 to-border" />
            <div>
              <p className="text-2xl font-display font-bold text-gradient-ice">{elevation.summit.toLocaleString()}'</p>
              <p className="text-xs text-muted-foreground mt-1">Summit</p>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-2">
            {(elevation.summit - elevation.base).toLocaleString()}' vertical drop
          </p>
        </section>

        <Button variant="outline" className="w-full" asChild>
          <a href={resort.website} target="_blank" rel="noopener noreferrer">
            Visit {resort.name} Website
            <ExternalLink className="w-3.5 h-3.5 ml-2" />
          </a>
        </Button>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="text-primary/70 mt-0.5">{icon}</div>
      <div>
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

function ProgressStat({ icon, label, open, total, percent }: { icon: React.ReactNode; label: string; open: number; total: number; percent: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <span className="text-primary/70">{icon}</span>
          <span className="text-sm">{label}</span>
        </div>
        <span className="text-sm font-medium text-foreground">{open} / {total}</span>
      </div>
      <div className="h-2 rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
