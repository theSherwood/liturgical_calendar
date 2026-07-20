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
}

export const config: Config = {
  timezone: "America/Denver",
  regions: ["US", "UK"],
  yearSpan: { before: 1, after: 5 },
  outDir: "dist",
  familyName: "Sherwood",
  siteUrl: "https://thesherwood.github.io/liturgical_calendar",
};
