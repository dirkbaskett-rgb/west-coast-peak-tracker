import { useState, useRef } from "react";
import { MapPin, Clock, Hotel, Car, Mountain, ChevronRight } from "lucide-react";
import { ResortMeta } from "@/data/resorts";
import { resorts } from "@/data/resorts";

type TripStop = {
  name: string;
  resortId?: string;
  type: "resort" | "town" | "city";
  description: string;
  stayOptions?: string[];
  driveFromPrev?: string;
};

type Trip = {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  bestFor: string;
  stops: TripStop[];
};

const recommendedTrips: Trip[] = [
  {
    id: "utah",
    title: "Utah Powder Circuit",
    subtitle: "Salt Lake City → Cottonwood Canyons → Ogden Valley",
    duration: "5–7 days",
    bestFor: "Deep powder, convenience, variety",
    stops: [
      {
        name: "Salt Lake City",
        type: "city",
        description: "Fly into SLC. 30 min to the canyons. Great base with restaurants & nightlife.",
        stayOptions: ["Downtown SLC hotels", "Airbnb near Cottonwood Heights"],
      },
      {
        name: "Alta",
        resortId: "alta",
        type: "resort",
        description: "Legendary powder. Skiers-only. Steep chutes and wide-open bowls. Average 550\" annual snowfall.",
        stayOptions: ["Alta Lodge (ski-in/ski-out)", "Snowpine Lodge", "Alta Peruvian Lodge"],
        driveFromPrev: "35 min from SLC",
      },
      {
        name: "Snowbird",
        resortId: "snowbird",
        type: "resort",
        description: "Right next to Alta — ride the tram to 11,000'. Long season, massive vertical (3,240').",
        stayOptions: ["The Cliff Lodge", "The Lodge at Snowbird", "Iron Blosam Lodge"],
        driveFromPrev: "2 min from Alta (connected via gate)",
      },
      {
        name: "Snowbasin",
        resortId: "snowbasin",
        type: "resort",
        description: "Uncrowded gem near Ogden. Beautiful lodges, 3,000' vertical. Hosted 2002 Olympic downhill.",
        stayOptions: ["Huntsville hotels/cabins", "Ogden downtown Airbnbs"],
        driveFromPrev: "1 hr 10 min from Cottonwood Canyons",
      },
      {
        name: "Taos Ski Valley (bonus extension)",
        resortId: "taos",
        type: "resort",
        description: "If you have extra days — fly SLC → ABQ (2 hr flight) then drive 2.5 hr to Taos for steep, uncrowded terrain.",
        stayOptions: ["The Blake at Taos Ski Valley", "Taos town Airbnbs"],
        driveFromPrev: "Fly SLC→ABQ + 2.5 hr drive",
      },
    ],
  },
  {
    id: "western-canada",
    title: "Western Canada Road Trip",
    subtitle: "Calgary → Banff → Revelstoke → Sun Peaks",
    duration: "7–10 days",
    bestFor: "Epic scenery, deep snow, Canadian hospitality",
    stops: [
      {
        name: "Calgary",
        type: "city",
        description: "Fly into YYC. Rent a car and head west on the Trans-Canada Highway.",
        stayOptions: ["Downtown Calgary hotels", "Airport hotels for early starts"],
      },
      {
        name: "Banff Sunshine",
        resortId: "banff-sunshine",
        type: "resort",
        description: "Highest base elevation in the Canadian Rockies. Gondola access, 3 mountains, stunning views of the Continental Divide.",
        stayOptions: ["Fairmont Banff Springs", "Banff town hotels/hostels", "Sunshine Mountain Lodge (on-mountain)"],
        driveFromPrev: "1 hr 30 min from Calgary",
      },
      {
        name: "Lake Louise",
        resortId: "lake-louise",
        type: "resort",
        description: "Iconic views of the Canadian Rockies. 4,200 skiable acres. Incredible back bowls and front-side groomers.",
        stayOptions: ["Fairmont Chateau Lake Louise", "Lake Louise Inn", "Banff (40 min drive)"],
        driveFromPrev: "45 min from Banff",
      },
      {
        name: "Revelstoke",
        resortId: "revelstoke",
        type: "resort",
        description: "Longest vertical in North America (5,620'). Legendary powder and cat/heli-skiing options nearby.",
        stayOptions: ["Sutton Place Hotel Revelstoke", "Downtown Revelstoke Airbnbs", "Basecamp Resorts"],
        driveFromPrev: "3 hr from Lake Louise via Trans-Canada Hwy",
      },
      {
        name: "Sun Peaks",
        resortId: "sun-peaks",
        type: "resort",
        description: "Canada's 2nd largest ski area. Ski-in/ski-out village. Quiet and family-friendly with great tree skiing.",
        stayOptions: ["Sun Peaks Grand Hotel", "Village condos & chalets", "Nancy Greene's Cahilty Hotel"],
        driveFromPrev: "3 hr from Revelstoke",
      },
      {
        name: "Panorama (optional add-on)",
        resortId: "panorama",
        type: "resort",
        description: "Detour south from Revelstoke for uncrowded slopes and hot pools. Great intermediate terrain.",
        stayOptions: ["Panorama Springs Lodge", "Ski-in condos in the village"],
        driveFromPrev: "3 hr from Revelstoke (or 3.5 hr from Lake Louise)",
      },
    ],
  },
  {
    id: "idaho-wyoming-montana",
    title: "Idaho → Wyoming → Montana Loop",
    subtitle: "Boise → Sun Valley → Grand Targhee → Jackson Hole → Big Sky",
    duration: "7–10 days",
    bestFor: "Uncrowded powder, big mountains, road trip vibes",
    stops: [
      {
        name: "Boise",
        type: "city",
        description: "Fly into BOI. Affordable flights, great food scene. Stock up and head east on US-20.",
        stayOptions: ["Downtown Boise hotels", "Airport-area hotels for early starts"],
      },
      {
        name: "Sun Valley",
        resortId: "sun-valley",
        type: "resort",
        description: "America's first destination ski resort. 3,400' vertical, perfectly groomed corduroy and challenging bowls on Baldy. Warm-spring base lodge is iconic.",
        stayOptions: ["Sun Valley Lodge (historic)", "Limelight Hotel Ketchum", "Ketchum Airbnbs"],
        driveFromPrev: "2 hr 30 min from Boise via US-20",
      },
      {
        name: "Grand Targhee",
        resortId: "grand-targhee",
        type: "resort",
        description: "\"The other side\" of the Tetons. Averages 500\" of snow annually. Famously uncrowded with incredible tree skiing and Teton views.",
        stayOptions: ["Targhee Lodge (slopeside)", "Driggs/Victor town lodging (12 mi)"],
        driveFromPrev: "3 hr 30 min via ID-75 S → US-26 E",
      },
      {
        name: "Jackson Hole",
        resortId: "jackson-hole",
        type: "resort",
        description: "World-class expert terrain. Corbet's Couloir, 4,139' continuous vertical, and a legendary après scene in Teton Village and Jackson town.",
        stayOptions: ["Four Seasons Teton Village", "Hotel Terra", "Jackson town Airbnbs (15 min)"],
        driveFromPrev: "1 hr 30 min via Teton Pass (or 1 hr via ID-33 in summer)",
      },
      {
        name: "Big Sky",
        resortId: "big-sky",
        type: "resort",
        description: "Biggest skiing in America — 5,800 acres. Lone Mountain tram accesses extreme terrain; lower mountain has endless groomers. Rarely crowded.",
        stayOptions: ["Summit Hotel (ski-in/ski-out)", "Huntley Lodge", "Big Sky town vacation rentals"],
        driveFromPrev: "4 hr 30 min via US-191 N through Yellowstone corridor",
      },
    ],
  },
];

interface TripPlannerProps {
  onSelectResort?: (resort: ResortMeta) => void;
}

export const TripPlanner = ({ onSelectResort }: TripPlannerProps) => {
  const handleResortClick = (resortId: string) => {
    const resort = resorts.find((r) => r.id === resortId);
    if (resort && onSelectResort) onSelectResort(resort);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Car className="w-5 h-5 text-primary" />
            <h2 className="font-display font-bold text-xl text-foreground">Trip Planner</h2>
          </div>
          <p className="text-xs text-muted-foreground">Pre-built road trip itineraries with driving times & lodging</p>
        </div>

        <div className="space-y-6">
          {recommendedTrips.map((trip) => (
            <div key={trip.id} className="rounded-xl bg-card border border-border overflow-hidden">
              {/* Trip Header */}
              <div className="p-4 border-b border-border bg-secondary/30">
                <h3 className="font-display font-bold text-lg text-foreground">{trip.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{trip.subtitle}</p>
                <div className="flex gap-3 mt-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                    {trip.duration}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                    {trip.bestFor}
                  </span>
                </div>
              </div>

              {/* Stops */}
              <div className="p-4 space-y-0">
                {trip.stops.map((stop, i) => (
                  <div key={i} className="relative pl-6">
                    {/* Timeline line */}
                    {i < trip.stops.length - 1 && (
                      <div className="absolute left-[9px] top-6 bottom-0 w-px bg-border" />
                    )}
                    {/* Timeline dot */}
                    <div className={`absolute left-0 top-1.5 w-[18px] h-[18px] rounded-full flex items-center justify-center ${
                      stop.type === "resort" ? "bg-primary/20 border border-primary/50" : "bg-secondary border border-border"
                    }`}>
                      {stop.type === "resort" ? (
                        <Mountain className="w-2.5 h-2.5 text-primary" />
                      ) : (
                        <MapPin className="w-2.5 h-2.5 text-muted-foreground" />
                      )}
                    </div>

                    <div className="pb-5">
                      {/* Drive time badge */}
                      {stop.driveFromPrev && (
                        <div className="flex items-center gap-1 mb-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">{stop.driveFromPrev}</span>
                        </div>
                      )}

                      {/* Stop name */}
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-display font-semibold text-sm text-foreground">{stop.name}</h4>
                        {stop.resortId && (
                          <button
                            onClick={() => handleResortClick(stop.resortId!)}
                            className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                          >
                            View <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{stop.description}</p>

                      {/* Stay options */}
                      {stop.stayOptions && (
                        <div className="mt-2">
                          <div className="flex items-center gap-1 mb-1">
                            <Hotel className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Where to stay</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {stop.stayOptions.map((opt, j) => (
                              <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary border border-border text-secondary-foreground">
                                {opt}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-muted-foreground text-center mt-6 pb-8">
          Drive times are estimates and may vary with conditions. Always check road reports in winter.
        </p>
      </div>
    </div>
  );
};
