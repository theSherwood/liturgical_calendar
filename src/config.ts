/**
 * Global configuration for the calendar build.
 *
 * The family leans US culturally (Mormon background → Mountain Time is the
 * sensible default for localizing astronomical instants), but everything here
 * is meant to be tweaked freely.
 */
export interface Config {
  /** IANA timezone used to localize astronomical instants (solstices, moon phases) to a calendar date. */
  timezone: string;
  /** Which regions' holidays to include. A US/UK family keeps both; `both`-tagged holidays always appear. */
  regions: Array<"US" | "UK">;
  /** The calendar "resolves" every holiday for each year in this inclusive span. */
  yearSpan: { before: number; after: number };
  /** Output directory for generated artifacts. */
  outDir: string;
  /** Family name, shown in titles. */
  familyName: string;
  /** Public base URL where the site is hosted (no trailing slash). Powers the subscribe links. */
  siteUrl: string;
  /** The weekly Sabbath track. */
  sabbath: {
    /** Which weekday the Sabbath falls on: 0 = Sunday … 6 = Saturday. */
    weekday: number;
    /**
     * A reference Sabbath date (ISO `YYYY-MM-DD`) that marks week 0 of the track.
     * The track entry for any week is chosen by counting whole weeks from here,
     * so changing this rotates *which* entry lands on a given week.
     */
    epoch: string;
  };
}

export const config: Config = {
  timezone: "America/Denver",
  regions: ["US", "UK"],
  yearSpan: { before: 1, after: 5 },
  outDir: "dist",
  familyName: "Sherwood",
  siteUrl: "https://thesherwood.github.io/liturgical_calendar",
  sabbath: { weekday: 0, epoch: "2026-07-26" },
};
