/**
 * The weekly Sabbath is not an annual date rule — it recurs every week and
 * cycles through an ordered "track" of entries. These helpers turn a calendar
 * date into (a) the Sabbath that opens its week and (b) which track entry
 * applies. The same math is mirrored in the client app (see web.ts) so the
 * dashboard can recompute it live for any date.
 */

const DAY = 86_400_000;

function isoToUtc(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function utcToIso(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/**
 * The Sabbath date on or before `iso` — i.e. the most recent occurrence of the
 * Sabbath weekday, which is the one that "opens" the week containing `iso`.
 */
export function sabbathOnOrBefore(iso: string, weekday: number): string {
  const ms = isoToUtc(iso);
  const back = ((new Date(ms).getUTCDay() - weekday) % 7 + 7) % 7;
  return utcToIso(ms - back * DAY);
}

/**
 * The Sabbath date on or after `iso` — i.e. the next occurrence of the Sabbath
 * weekday, or `iso` itself if it already falls on that weekday. This is what the
 * dashboard shows: mid-week, the *upcoming* Sabbath rather than the past one.
 */
export function sabbathOnOrAfter(iso: string, weekday: number): string {
  const ms = isoToUtc(iso);
  const fwd = ((weekday - new Date(ms).getUTCDay()) % 7 + 7) % 7;
  return utcToIso(ms + fwd * DAY);
}

/** Whole weeks between two Sabbath dates (may be negative). */
export function weeksSinceEpoch(sabbathIso: string, epochIso: string): number {
  return Math.round((isoToUtc(sabbathIso) - isoToUtc(epochIso)) / (7 * DAY));
}

/** Zero-based index into a track of length `len` for the given Sabbath date. */
export function trackIndex(sabbathIso: string, epochIso: string, len: number): number {
  if (len <= 0) return -1;
  const w = weeksSinceEpoch(sabbathIso, epochIso);
  return ((w % len) + len) % len;
}

/** Every Sabbath date (inclusive) from the first on/after `fromIso` to `toIso`. */
export function sabbathDatesBetween(fromIso: string, toIso: string, weekday: number): string[] {
  const out: string[] = [];
  // First Sabbath on or after `fromIso`.
  const startMs = isoToUtc(fromIso);
  const fwd = ((weekday - new Date(startMs).getUTCDay()) % 7 + 7) % 7;
  const endMs = isoToUtc(toIso);
  for (let ms = startMs + fwd * DAY; ms <= endMs; ms += 7 * DAY) out.push(utcToIso(ms));
  return out;
}
