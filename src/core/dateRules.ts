import * as AstronomyNS from "astronomy-engine";
// astronomy-engine ships as CommonJS. Depending on the loader (tsx/node vs
// vitest/esbuild) the callable exports land either directly on the namespace
// or on `.default`. Pick whichever actually carries the functions.
const Astronomy = (
  typeof (AstronomyNS as { Seasons?: unknown }).Seasons === "function"
    ? AstronomyNS
    : (AstronomyNS as unknown as { default: typeof AstronomyNS }).default
) as typeof AstronomyNS;
import { formatInTimeZone } from "date-fns-tz";
import type { DateRule } from "./schema.js";

/** A timezone-independent calendar date. month is 1..12, day is 1..31. */
export interface CalendarDate {
  year: number;
  month: number;
  day: number;
}

/**
 * Internally we carry each resolved date as a JS Date pinned to **noon UTC**.
 * Noon (not midnight) means whole-day offset arithmetic never trips over a DST
 * boundary or rolls into an adjacent day. All public results are plain
 * CalendarDate objects read straight off the UTC fields.
 */
function utcNoon(year: number, month1to12: number, day: number): Date {
  return new Date(Date.UTC(year, month1to12 - 1, day, 12, 0, 0));
}

function toCalendarDate(d: Date): CalendarDate {
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 86_400_000);
}

/** Convert a real astronomical instant into the calendar date it falls on, in `tz`. */
function instantToUtcNoon(instant: Date, tz: string): Date {
  const [y, m, day] = formatInTimeZone(instant, tz, "yyyy-MM-dd").split("-").map(Number);
  return utcNoon(y, m, day);
}

/**
 * Easter Sunday (Gregorian) via the Anonymous / Meeus–Jones–Butcher algorithm.
 * Returns the UTC-noon date.
 */
export function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = March, 4 = April
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return utcNoon(year, month, day);
}

/** Nth weekday of a month (n = -1 means the last). weekday: 0 = Sun … 6 = Sat. */
function nthWeekday(year: number, month: number, weekday: number, n: number): Date {
  if (n === -1) {
    // Walk back from the last day of the month to the requested weekday.
    const last = new Date(Date.UTC(year, month, 0, 12)); // day 0 of next month = last day
    const back = (last.getUTCDay() - weekday + 7) % 7;
    return addDays(last, -back);
  }
  const first = utcNoon(year, month, 1);
  const forward = (weekday - first.getUTCDay() + 7) % 7;
  return addDays(first, forward + (n - 1) * 7);
}

const seasonInstant: Record<string, (s: ReturnType<typeof Astronomy.Seasons>) => Date> = {
  marchEquinox: (s) => s.mar_equinox.date,
  juneSolstice: (s) => s.jun_solstice.date,
  septemberEquinox: (s) => s.sep_equinox.date,
  decemberSolstice: (s) => s.dec_solstice.date,
};

/**
 * Resolve a date rule to the calendar date it falls on in the given `year`.
 * `tz` localizes astronomical instants; it is irrelevant to purely civil rules.
 */
export function resolveRule(rule: DateRule, year: number, tz: string): CalendarDate {
  return toCalendarDate(resolveToUtcNoon(rule, year, tz));
}

function resolveToUtcNoon(rule: DateRule, year: number, tz: string): Date {
  switch (rule.type) {
    case "fixed":
      return utcNoon(year, rule.month, rule.day);

    case "nthWeekday":
      return nthWeekday(year, rule.month, rule.weekday, rule.n);

    case "easter":
      return addDays(easterSunday(year), rule.offset);

    case "astronomical": {
      const instant = seasonInstant[rule.event](Astronomy.Seasons(year));
      return addDays(instantToUtcNoon(instant, tz), rule.offset);
    }

    case "lunar": {
      const anchor = seasonInstant[rule.anchor](Astronomy.Seasons(year));
      const targetLon = rule.phase === "new" ? 0 : 180;
      let found = Astronomy.SearchMoonPhase(targetLon, anchor, 40);
      // Advance to the Nth occurrence at/after the anchor.
      for (let i = 1; i < rule.count && found; i++) {
        const next = new Date(found.date.getTime() + 86_400_000);
        found = Astronomy.SearchMoonPhase(targetLon, next, 40);
      }
      if (!found) throw new Error(`Could not find lunar phase for rule in ${year}`);
      return addDays(instantToUtcNoon(found.date, tz), rule.offset);
    }

    case "relative":
      return addDays(resolveToUtcNoon(rule.base, year, tz), rule.offset);
  }
}
