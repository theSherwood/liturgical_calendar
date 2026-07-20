import { describe, expect, it } from "vitest";
import { easterSunday, resolveRule } from "../src/core/dateRules.js";
import type { DateRule } from "../src/core/schema.js";

const TZ = "America/Denver";
const fmt = (r: DateRule, year: number) => {
  const d = resolveRule(r, year, TZ);
  return `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
};

describe("easter computus", () => {
  it.each([
    [2024, "2024-03-31"],
    [2025, "2025-04-20"],
    [2026, "2026-04-05"],
    [2027, "2027-03-28"],
  ])("Easter %i is %s", (year, expected) => {
    const d = easterSunday(year);
    const got = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    expect(got).toBe(expected);
  });

  it("Good Friday is two days before Easter", () => {
    expect(fmt({ type: "easter", offset: -2 }, 2026)).toBe("2026-04-03");
  });
});

describe("fixed", () => {
  it("Petrov Day is Sep 26", () => {
    expect(fmt({ type: "fixed", month: 9, day: 26 }, 2026)).toBe("2026-09-26");
  });
});

describe("nthWeekday", () => {
  it("US Thanksgiving 2026 (4th Thu Nov) is Nov 26", () => {
    expect(fmt({ type: "nthWeekday", month: 11, weekday: 4, n: 4 }, 2026)).toBe("2026-11-26");
  });
  it("Ada Lovelace Day (2nd Tue Oct) is Oct 14 in 2025, Oct 13 in 2026", () => {
    const rule: DateRule = { type: "nthWeekday", month: 10, weekday: 2, n: 2 };
    expect(fmt(rule, 2025)).toBe("2025-10-14");
    expect(fmt(rule, 2026)).toBe("2026-10-13");
  });
  it("Last Monday of May 2026 (Memorial Day) is May 25", () => {
    expect(fmt({ type: "nthWeekday", month: 5, weekday: 1, n: -1 }, 2026)).toBe("2026-05-25");
  });
});

describe("astronomical", () => {
  it("December solstice 2025 falls on Dec 21 (Mountain Time)", () => {
    expect(fmt({ type: "astronomical", event: "decemberSolstice", offset: 0 }, 2025)).toBe("2025-12-21");
  });
  it("March equinox 2026 falls on Mar 20 (Mountain Time)", () => {
    expect(fmt({ type: "astronomical", event: "marchEquinox", offset: 0 }, 2026)).toBe("2026-03-20");
  });
});

describe("lunar", () => {
  it("first new moon after the March equinox 2026 lands in spring", () => {
    const rule: DateRule = { type: "lunar", phase: "new", anchor: "marchEquinox", count: 1, offset: 0 };
    const d = resolveRule(rule, 2026, TZ);
    expect(d.month).toBeGreaterThanOrEqual(3);
    expect(d.month).toBeLessThanOrEqual(4);
  });
});

describe("relative", () => {
  it("day after a fixed date", () => {
    const rule: DateRule = { type: "relative", offset: 1, base: { type: "fixed", month: 12, day: 31 } };
    expect(fmt(rule, 2026)).toBe("2027-01-01");
  });
});
