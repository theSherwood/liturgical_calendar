import type { Config } from "../config.js";
import { resolveRule, type CalendarDate } from "./dateRules.js";
import type { Holiday } from "./load.js";

export interface ResolvedHoliday {
  holiday: Holiday;
  year: number;
  /** First day of the observance. */
  date: CalendarDate;
  /** JS Date at UTC midnight of `date` — convenient for sorting / formatting. */
  start: Date;
  /** Number of days the observance spans (>= 1). */
  durationDays: number;
}

function toUtcMidnight(d: CalendarDate): Date {
  return new Date(Date.UTC(d.year, d.month - 1, d.day));
}

/** Should this holiday appear for a family observing the given regions? */
export function appliesToRegion(holiday: Holiday, regions: Config["regions"]): boolean {
  return holiday.meta.region === "both" || regions.includes(holiday.meta.region);
}

/** Resolve every applicable holiday for a single year, sorted chronologically. */
export function resolveYear(holidays: Holiday[], year: number, config: Config): ResolvedHoliday[] {
  const resolved: ResolvedHoliday[] = [];
  for (const holiday of holidays) {
    if (!appliesToRegion(holiday, config.regions)) continue;
    const date = resolveRule(holiday.meta.dateRule, year, config.timezone);
    resolved.push({
      holiday,
      year,
      date,
      start: toUtcMidnight(date),
      durationDays: holiday.meta.durationDays,
    });
  }
  resolved.sort((a, b) => a.start.getTime() - b.start.getTime());
  return resolved;
}

/** Resolve across the whole configured year span. */
export function resolveSpan(holidays: Holiday[], config: Config): ResolvedHoliday[] {
  const now = new Date();
  const base = now.getUTCFullYear();
  const out: ResolvedHoliday[] = [];
  for (let y = base - config.yearSpan.before; y <= base + config.yearSpan.after; y++) {
    out.push(...resolveYear(holidays, y, config));
  }
  return out;
}
