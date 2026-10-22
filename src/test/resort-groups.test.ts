import { describe, it, expect } from "vitest";
import { resorts, resortGroups, groupsForResort } from "@/data/resorts";

describe("Canadian Rockies group", () => {
  const group = resortGroups.find((g) => g.id === "canadian-rockies");

  it("exists and contains exactly the four requested resorts", () => {
    expect(group).toBeTruthy();
    expect(group!.resortIds).toEqual(["kicking-horse", "panorama", "banff-sunshine", "lake-louise"]);
  });

  it("every member id resolves to the expected resort name", () => {
    const names = group!.resortIds.map((id) => resorts.find((r) => r.id === id)?.name);
    expect(names).toEqual(["Kicking Horse", "Panorama", "Banff Sunshine", "Lake Louise"]);
  });

  it("flags members and not non-members", () => {
    expect(groupsForResort("lake-louise").map((g) => g.id)).toContain("canadian-rockies");
    expect(groupsForResort("revelstoke")).toEqual([]);
  });
});
