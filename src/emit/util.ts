import type { ResolvedHoliday } from "../core/resolve.js";

/** The three prose sections every holiday body carries. */
export interface Sections {
  meaning: string;
  observance: string;
  reading: string;
}

/** Split a holiday's Markdown body into its named sections. */
export function parseSections(body: string): Sections {
  const out: Record<string, string> = {};
  const parts = body.split(/^##\s+(.+)$/m);
  // parts[0] is any preamble (ignored); then [heading, content, heading, content, ...]
  for (let i = 1; i < parts.length; i += 2) {
    const key = parts[i].trim().toLowerCase();
    out[key] = (parts[i + 1] ?? "").trim();
  }
  return { meaning: out.meaning ?? "", observance: out.observance ?? "", reading: out.reading ?? "" };
}

/**
 * Collapse a Markdown section to plain text for the .ics: drop blockquote
 * markers, turn `[label](url)` into `label: url`, and strip bold/italic
 * emphasis, so calendar apps show readable descriptions (and linkify the URLs).
 */
export function toPlainText(s: string): string {
  return s
    .split("\n")
    .map((line) => line.replace(/^>\s?/, "").trim())
    .join("\n")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1: $2") // links → "label: url"
    .replace(/\*\*([^*]+)\*\*/g, "$1") // bold
    .replace(/\*([^*]+)\*/g, "$1") // italic
    .trim();
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** e.g. "Saturday, September 26". Year omitted by default (calendars repeat). */
export function formatDate(r: ResolvedHoliday, withYear = false): string {
  const wd = WEEKDAYS[r.start.getUTCDay()];
  const base = `${wd}, ${MONTHS[r.date.month - 1]} ${r.date.day}`;
  return withYear ? `${base}, ${r.date.year}` : base;
}

/** Short "Sep 26" form for compact lists. */
export function formatShort(r: ResolvedHoliday): string {
  return `${MONTHS[r.date.month - 1].slice(0, 3)} ${r.date.day}`;
}

/**
 * When-label for a card. Single-day → the full date; multi-day festivals →
 * a span from the start date, e.g. "Dec 21 – Jan 1 · 12 days" — the holiday
 * shows once, on its start date, so the label carries the duration.
 */
export function formatWhen(r: ResolvedHoliday): string {
  const dur = r.durationDays || 1;
  if (dur <= 1) return formatDate(r);
  const end = new Date(r.start.getTime() + (dur - 1) * 86_400_000);
  const startShort = `${MONTHS[r.date.month - 1].slice(0, 3)} ${r.date.day}`;
  const endShort = `${MONTHS[end.getUTCMonth()].slice(0, 3)} ${end.getUTCDate()}`;
  return `${startShort} – ${endShort} · ${dur} days`;
}

/** Human label for a category. */
export const CATEGORY_LABELS: Record<string, string> = {
  seasonal: "Seasonal & Sky",
  modern: "Modern & Civic",
  christian: "Christian",
  literature: "Literature & Arts",
  roman: "Roman",
  greek: "Greek",
  norse: "Norse & Germanic",
  celtic: "Celtic",
  mesopotamian: "Mesopotamian",
  egyptian: "Egyptian",
  persian: "Persian",
  science: "Science, Tech & Math",
  rationalist: "Rationalist",
  remembrance: "Remembrance",
  progress: "Liberty & Progress",
  history: "Turning Points",
};

export const SEASON_LABELS: Record<string, string> = {
  winter: "Winter",
  spring: "Spring",
  summer: "Summer",
  autumn: "Autumn",
};
