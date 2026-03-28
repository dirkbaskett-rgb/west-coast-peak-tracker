import { useState, useMemo } from "react";
import { resorts, Resort } from "@/data/resorts";
import { ResortCard } from "@/components/ResortCard";
import { ResortDetail } from "@/components/ResortDetail";
import { Search, Snowflake, SlidersHorizontal } from "lucide-react";
import heroImage from "@/assets/hero-mountains.jpg";

type SortOption = "name" | "snow" | "newSnow";

const Index = () => {
  const [selectedResort, setSelectedResort] = useState<Resort | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newSnow");
  const [countryFilter, setCountryFilter] = useState<"all" | "USA" | "Canada">("all");

  const filtered = useMemo(() => {
    let list = resorts.filter((r) => {
      const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.state.toLowerCase().includes(search.toLowerCase()) ||
        r.location.toLowerCase().includes(search.toLowerCase());
      const matchCountry = countryFilter === "all" || r.country === countryFilter;
      return matchSearch && matchCountry;
    });

    list.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "snow") return b.stats.snowDepth - a.stats.snowDepth;
      return b.stats.newSnow24h - a.stats.newSnow24h;
    });

    return list;
  }, [search, sortBy, countryFilter]);

  const totalNewSnow = resorts.reduce((sum, r) => sum + r.stats.newSnow24h, 0);
  const avgNewSnow = Math.round(totalNewSnow / resorts.length);
  const powderResorts = resorts.filter((r) => r.stats.newSnow24h >= 6).length;

  if (selectedResort) {
    return <ResortDetail resort={selectedResort} onBack={() => setSelectedResort(null)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative h-48 sm:h-56 overflow-hidden">
        <img
          src={heroImage}
          alt="Mountain panorama"
          className="w-full h-full object-cover"
          width={1920}
          height={640}
        />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-1">
              <Snowflake className="w-5 h-5 text-primary" />
              <h1 className="font-display font-bold text-xl sm:text-2xl text-foreground">
                Mountain Collective
              </h1>
            </div>
            <p className="text-xs text-muted-foreground">26/27 Season • Western North America</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-4xl mx-auto px-4 -mt-2">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="rounded-lg bg-card border border-border p-2.5 sm:p-3 text-center">
            <p className="text-lg sm:text-xl font-display font-bold text-gradient-ice">{resorts.length}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Resorts</p>
          </div>
          <div className="rounded-lg bg-card border border-border p-2.5 sm:p-3 text-center">
            <p className="text-lg sm:text-xl font-display font-bold text-gradient-ice">{avgNewSnow}"</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Avg New Snow</p>
          </div>
          <div className="rounded-lg bg-card border border-border p-2.5 sm:p-3 text-center">
            <p className="text-lg sm:text-xl font-display font-bold text-gradient-ice">{powderResorts}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Powder Days</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-4xl mx-auto px-4 mt-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resorts..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          {/* Country filter */}
          {(["all", "USA", "Canada"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCountryFilter(c)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                countryFilter === c
                  ? "bg-primary/15 border-primary/40 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {c === "all" ? "All" : c}
            </button>
          ))}
          <div className="w-px h-4 bg-border shrink-0" />
          {/* Sort */}
          {([
            { key: "newSnow" as const, label: "Fresh Snow" },
            { key: "snow" as const, label: "Snow Depth" },
            { key: "name" as const, label: "A–Z" },
          ]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                sortBy === key
                  ? "bg-primary/15 border-primary/40 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Resort Grid */}
      <div className="max-w-4xl mx-auto px-4 mt-4 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((resort) => (
            <ResortCard key={resort.id} resort={resort} onClick={setSelectedResort} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-12">No resorts found</p>
        )}
      </div>
    </div>
  );
};

export default Index;
