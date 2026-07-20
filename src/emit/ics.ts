import ical, { ICalEventTransparency } from "ical-generator";
import type { Config } from "../config.js";
import type { Holiday } from "../core/load.js";
import { resolveSpan } from "../core/resolve.js";
import { CATEGORY_LABELS, parseSections, toPlainText } from "./util.js";

/**
 * Build a subscribable .ics feed. Because Easter/solstice/lunar recurrences
 * can't be expressed as RRULEs, we emit an explicit all-day VEVENT for every
 * holiday in every year of the configured span.
 */
export function buildIcs(holidays: Holiday[], config: Config): string {
  const cal = ical({
    name: `${config.familyName} Family Liturgical Calendar`,
    prodId: { company: config.familyName, product: "liturgical-calendar", language: "EN" },
    description: "A secular family calendar of modern, ancient, scientific, and rationalist observances.",
    ttl: 60 * 60 * 24, // clients may refresh daily
  });

  for (const r of resolveSpan(holidays, config)) {
    const { meaning, observance, reading } = parseSections(r.holiday.body);
    const description = [
      r.holiday.meta.blurb,
      "",
      `MEANING\n${toPlainText(meaning)}`,
      "",
      `OBSERVANCE\n${toPlainText(observance)}`,
      "",
      `READING\n${toPlainText(reading)}`,
      "",
      `— ${CATEGORY_LABELS[r.holiday.meta.category]}`,
    ].join("\n");

    // All-day event; iCal DTEND for all-day is exclusive, so add durationDays.
    const start = r.start;
    const end = new Date(start.getTime() + r.durationDays * 86_400_000);

    cal.createEvent({
      id: `${r.holiday.meta.id}-${r.year}@${config.familyName.toLowerCase()}-liturgical-calendar`,
      start,
      end,
      allDay: true,
      summary: r.holiday.meta.title,
      description,
      transparency: ICalEventTransparency.TRANSPARENT, // observances don't "busy" your day
    });
  }

  return cal.toString();
}
