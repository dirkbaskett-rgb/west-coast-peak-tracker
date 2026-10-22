import { describe, expect, it } from "vitest";
import { currentSnowDepth } from "@/lib/api";

const now = new Date("2026-10-22T04:34:00Z");

describe("current snow depth in inches", () => {
  it("converts meters to inches using the current hour, not a future forecast", () => {
    expect(currentSnowDepth({
      time: ["2026-10-22T03:00", "2026-10-22T04:00", "2026-10-22T05:00"],
      snow_depth: [0.254, 0.508, 1.016],
    }, now)).toBe(20);
  });

  it("preserves a measured zero depth", () => {
    expect(currentSnowDepth({ time: ["2026-10-22T04:00"], snow_depth: [0] }, now)).toBe(0);
  });

  it("does not turn missing depth into zero", () => {
    expect(currentSnowDepth({ time: ["2026-10-22T04:00"], snow_depth: [null] }, now)).toBeNull();
    expect(currentSnowDepth(undefined, now)).toBeNull();
  });

  it("rejects outdated or future-only depth", () => {
    expect(currentSnowDepth({ time: ["2026-10-21T04:00"], snow_depth: [1] }, now)).toBeNull();
    expect(currentSnowDepth({ time: ["2026-10-22T05:00"], snow_depth: [1] }, now)).toBeNull();
  });
});