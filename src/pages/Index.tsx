import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { resorts, ResortMeta, LiveConditions } from "@/data/resorts";
import { fetchAllResortConditions } from "@/lib/api";
import { ResortCard } from "@/components/ResortCard";
import { ResortDetail } from "@/components/ResortDetail";
import { ResortMap } from "@/components/ResortMap";
import { PowderAlert } from "@/components/PowderAlert";
import { useFavorites } from "@/hooks/use-favorites";
import { Search, Snowflake, SlidersHorizontal, RefreshCw, Loader2, Map as MapIcon, List, Car } from "lucide-react";
import heroImage from "@/assets/hero-mountains.jpg";
import { TripPlanner } from "@/components/TripPlanner";

type SortOption = "name" | "snow" | "temp";

const Index = () => {
  const [selectedResort, setSelectedResort] = useState<ResortMeta | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("snow");
  const [countryFilter, setCountryFilter] = useState<"all" | "USA" | "Canada">("all");
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const [conditions, setConditions] = useState<Map<string, LiveConditions>>(new Map());
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activePanel, setActivePanel] = useState<0 | 1 | 2>(1); // 0=trips, 1=list, 2=map
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const loadConditions = async () => {
    setLoading(true);
    try {
      const data = await fetchAllResortConditions(resorts);
      setConditions(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to load conditions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConditions();
    const interval = setInterval(loadConditions, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Scroll snap observer for 3 panels
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      const ratio = el.scrollLeft / el.clientWidth;
      if (ratio < 0.5) setActivePanel(0);
      else if (ratio < 1.5) setActivePanel(1);
      else setActivePanel(2);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Start on panel 1 (list) on mount
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) el.scrollLeft = el.clientWidth;
  }, []);

  const scrollToPanel = useCallback((panel: 0 | 1) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTo({ left: panel * el.clientWidth, behavior: "smooth" });
  }, []);

  const filtered = useMemo(() => {
    let list = resorts.filter((r) => {
      const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.state.toLowerCase().includes(search.toLowerCase()) ||
        r.location.toLowerCase().includes(search.toLowerCase());
      const matchCountry = countryFilter === "all" || r.country === countryFilter;
      return matchSearch && matchCountry;
    });

    list = [...list].sort((a, b) => {
      const ca = conditions.get(a.id);
      const cb = conditions.get(b.id);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "snow") return (cb?.snowfall24h || 0) - (ca?.snowfall24h || 0);
      if (sortBy === "temp") return (ca?.temperature ?? 999) - (cb?.temperature ?? 999);
      return 0;
    });

    // Pin favorites to top
    const favs = list.filter((r) => favorites.has(r.id));
    const rest = list.filter((r) => !favorites.has(r.id));
    return [...favs, ...rest];
  }, [search, sortBy, countryFilter, conditions, favorites]);

  const snowResorts = Array.from(conditions.values()).filter((c) => c.snowfall24h > 0).length;

  if (selectedResort) {
    return (
      <ResortDetail
        resort={selectedResort}
        conditions={conditions.get(selectedResort.id)}
        onBack={() => setSelectedResort(null)}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Swipeable panels */}
      <div
        ref={scrollContainerRef}
        className="flex-1 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
      >
        {/* Panel 1: List View */}
        <div className="w-full shrink-0 snap-center overflow-y-auto" style={{ scrollSnapAlign: "center" }}>
          {/* Hero */}
          <div className="relative h-48 sm:h-56 overflow-hidden">
            <img src={heroImage} alt="Mountain panorama" className="w-full h-full object-cover" width={1920} height={640} />
            <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-2 mb-1">
                  <Snowflake className="w-5 h-5 text-primary" />
                  <h1 className="font-display font-bold text-xl sm:text-2xl text-foreground">Mountain Collective</h1>
                </div>
                <p className="text-xs text-muted-foreground">26/27 Season • North America • Live Data</p>
              </div>
            </div>
          </div>

          {/* Quick Stats + Refresh */}
          <div className="max-w-4xl mx-auto px-4 mt-2">
            <div className="flex items-center gap-2 mb-2 justify-end">
              <button
                onClick={loadConditions}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : "Loading..."}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-lg bg-card border border-border p-2.5 sm:p-3 text-center">
                <p className="text-lg sm:text-xl font-display font-bold text-gradient-ice">{resorts.length}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Resorts</p>
              </div>
              <div className="rounded-lg bg-card border border-border p-2.5 sm:p-3 text-center">
                <p className="text-lg sm:text-xl font-display font-bold text-gradient-ice">{snowResorts}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Reporting Snow</p>
              </div>
              <div className="rounded-lg bg-card border border-border p-2.5 sm:p-3 text-center">
                <p className="text-lg sm:text-xl font-display font-bold text-gradient-ice">
                  {Array.from(conditions.values()).filter((c) => c.lifts && c.lifts.open > 0).length}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Lifts Running</p>
              </div>
            </div>
          </div>

          {/* Powder Alerts */}
          <div className="max-w-4xl mx-auto px-4 mt-3">
            <PowderAlert resorts={resorts} conditions={conditions} onSelectResort={setSelectedResort} />
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
              {([
                { key: "snow" as const, label: "Fresh Snow" },
                { key: "temp" as const, label: "Coldest" },
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
          <div className="max-w-4xl mx-auto px-4 mt-4 pb-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map((resort) => (
                <ResortCard
                  key={resort.id}
                  resort={resort}
                  conditions={conditions.get(resort.id)}
                  onClick={setSelectedResort}
                  isFavorite={isFavorite(resort.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-12">No resorts found</p>
            )}
          </div>
        </div>

        {/* Panel 2: Map View */}
        <div className="w-full shrink-0 snap-center" style={{ scrollSnapAlign: "center" }}>
          <ResortMap
            resorts={resorts}
            conditions={conditions}
            onSelectResort={setSelectedResort}
          />
        </div>
      </div>

      {/* Floating toggle button */}
      <button
        onClick={() => scrollToPanel(activePanel === 0 ? 1 : 0)}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-30 flex items-center gap-1.5 px-3 py-2.5 rounded-full bg-card border border-border shadow-lg text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        {activePanel === 0 ? (
          <>
            <MapIcon className="w-4 h-4" />
          </>
        ) : (
          <>
            <List className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
};

export default Index;
