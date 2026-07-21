import ical, { ICalEventTransparency } from "ical-generator";
import type { Config } from "../config.js";
import type { Holiday, SabbathEntry } from "../core/load.js";
import { resolveSpan } from "../core/resolve.js";
import { sabbathDatesBetween, trackIndex } from "../core/sabbath.js";
import { CATEGORY_LABELS, parseSections, toPlainText } from "./util.js";

/**
 * Build a subscribable .ics feed. Because Easter/solstice/lunar recurrences
 * can't be expressed as RRULEs, we emit an explicit all-day VEVENT for every
 * holiday in every year of the configured span.
 */
export function buildIcs(holidays: Holiday[], sabbathTrack: SabbathEntry[], config: Config): string {
  const cal = ical({
    name: `Family Liturgical Calendar`,
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

  // The weekly Sabbath: an explicit all-day event each week, its content rotating
  // through the track (so a single RRULE won't do — descriptions differ per week).
  if (sabbathTrack.length) {
    const now = new Date();
    const base = now.getUTCFullYear();
    const from = `${base - config.yearSpan.before}-01-01`;
    const to = `${base + config.yearSpan.after}-12-31`;
    for (const iso of sabbathDatesBetween(from, to, config.sabbath.weekday)) {
      const entry = sabbathTrack[trackIndex(iso, config.sabbath.epoch, sabbathTrack.length)];
      const { meaning, observance, reading } = parseSections(entry.body);
      const description = [
        entry.meta.blurb,
        "",
        `MEANING\n${toPlainText(meaning)}`,
        "",
        `OBSERVANCE\n${toPlainText(observance)}`,
        "",
        `READING\n${toPlainText(reading)}`,
        "",
        "— Sabbath",
      ].join("\n");
      const [y, m, d] = iso.split("-").map(Number);
      const start = new Date(Date.UTC(y, m - 1, d));
      cal.createEvent({
        id: `sabbath-${iso}@${config.familyName.toLowerCase()}-liturgical-calendar`,
        start,
        end: new Date(start.getTime() + 86_400_000),
        allDay: true,
        summary: `Sabbath — ${entry.meta.title}`,
        description,
        transparency: ICalEventTransparency.TRANSPARENT,
      });
    }
  }

  return cal.toString();
}
