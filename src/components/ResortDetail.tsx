import { ResortMeta, LiveConditions } from "@/data/resorts";
import { ArrowLeft, ExternalLink, Snowflake, Thermometer, Wind, Mountain, ArrowUpCircle, CloudSnow, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SnowForecastChart } from "@/components/SnowForecastChart";

interface ResortDetailProps {
  resort: ResortMeta;
  conditions: LiveConditions | undefined;
  onBack: () => void;
}

export function ResortDetail({ resort, conditions, onBack }: ResortDetailProps) {
  const { elevation } = resort;

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
        {!conditions ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg bg-card border border-border p-4 space-y-3">
                <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
                <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
                <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Snow Alert */}
            {conditions.snowfall24h > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Snowflake className="w-5 h-5 text-primary animate-pulse-glow" />
                <div>
                  <p className="text-sm font-semibold text-primary">{conditions.snowfall24h}" fresh in 24h</p>
                  <p className="text-xs text-muted-foreground">{conditions.snowfall48h}" in 48h • {conditions.conditions}</p>
                </div>
              </div>
            )}

            {/* Weather */}
            <section className="rounded-lg bg-card border border-border p-4">
              <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Current Weather</h2>
              <div className="grid grid-cols-2 gap-4">
                <Stat icon={<Thermometer className="w-4 h-4" />} label="Temperature" value={conditions.temperature != null ? `${conditions.temperature}°F` : "N/A"} />
                <Stat icon={<Wind className="w-4 h-4" />} label="Wind Speed" value={conditions.windSpeed != null ? `${conditions.windSpeed} mph` : "N/A"} />
                <Stat icon={<Snowflake className="w-4 h-4" />} label="24h Snowfall" value={`${conditions.snowfall24h}"`} />
                <Stat icon={<CloudSnow className="w-4 h-4" />} label="Conditions" value={conditions.conditions} />
              </div>
            </section>

            {/* Lift Status */}
            {conditions.lifts && (
              <section className="rounded-lg bg-card border border-border p-4">
                <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Lift Status</h2>
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <ArrowUpCircle className="w-4 h-4 text-primary/70" />
                      <span className="text-sm">Lifts Open</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{conditions.lifts.open} / {conditions.lifts.total}</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${conditions.lifts.total > 0 ? Math.round((conditions.lifts.open / conditions.lifts.total) * 100) : 0}%` }}
                    />
                  </div>
                </div>

                {/* Individual lifts */}
                {conditions.liftDetails && (
                  <div className="space-y-1.5 mt-3 pt-3 border-t border-border">
                    {Object.entries(conditions.liftDetails).map(([name, status]) => (
                      <div key={name} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground truncate mr-2">{name}</span>
                        <span className={`shrink-0 font-medium ${
                          status === "open" ? "text-alpine-foreground" :
                          status === "hold" ? "text-warning" :
                          "text-muted-foreground"
                        }`}>
                          {status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {!conditions.lifts && (
              <section className="rounded-lg bg-card border border-border p-4">
                <p className="text-sm text-muted-foreground text-center">
                  Live lift data not available for this resort.
                  <a href={resort.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                    Check their website →
                  </a>
                </p>
              </section>
            )}

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
          </>
        )}

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
