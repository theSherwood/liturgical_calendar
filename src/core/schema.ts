import { z } from "zod";

/**
 * The schema for a holiday's YAML frontmatter. Every file in `content/` is
 * validated against this at load time, so a malformed entry fails the build
 * loudly instead of silently producing a wrong calendar.
 */

// ---- Date rules (a tagged union) -------------------------------------------

const fixedRule = z.object({
  type: z.literal("fixed"),
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),
});

const nthWeekdayRule = z.object({
  type: z.literal("nthWeekday"),
  month: z.number().int().min(1).max(12),
  /** 0 = Sunday … 6 = Saturday (JS getDay convention). */
  weekday: z.number().int().min(0).max(6),
  /** 1..5 for "nth", or -1 for "last". */
  n: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(-1)]),
});

const easterRule = z.object({
  type: z.literal("easter"),
  /** Days offset from Easter Sunday (e.g. -2 = Good Friday, +1 = Easter Monday). */
  offset: z.number().int().default(0),
});

export const ASTRONOMICAL_EVENTS = [
  "marchEquinox",
  "juneSolstice",
  "septemberEquinox",
  "decemberSolstice",
] as const;

const astronomicalRule = z.object({
  type: z.literal("astronomical"),
  event: z.enum(ASTRONOMICAL_EVENTS),
  /** Optional whole-day offset applied after resolving the instant. */
  offset: z.number().int().default(0),
});

const lunarRule = z.object({
  type: z.literal("lunar"),
  phase: z.enum(["new", "full"]),
  /** Anchor the search at this solar event... */
  anchor: z.enum(ASTRONOMICAL_EVENTS),
  /** ...then take the Nth occurrence of `phase` on/after it (1 = first). */
  count: z.number().int().min(1).default(1),
  offset: z.number().int().default(0),
});

// Feb 29 — resolves to the 29th only in leap years, and is skipped entirely in
// common years (a plain fixed Feb-29 would silently roll to Mar 1).
const leapDayRule = z.object({
  type: z.literal("leapDay"),
});

// `relative` references another rule by inlining it, so it stays self-contained.
type RuleInput = z.input<typeof baseRule> | { type: "relative"; offset: number; base: RuleInput };
type RuleOutput = z.output<typeof baseRule> | { type: "relative"; offset: number; base: RuleOutput };

const baseRule = z.discriminatedUnion("type", [
  fixedRule,
  nthWeekdayRule,
  easterRule,
  astronomicalRule,
  lunarRule,
  leapDayRule,
]);

export const dateRuleSchema: z.ZodType<RuleOutput, z.ZodTypeDef, RuleInput> = z.lazy(() =>
  z.union([
    baseRule,
    z.object({
      type: z.literal("relative"),
      offset: z.number().int(),
      base: dateRuleSchema,
    }),
  ]),
) as z.ZodType<RuleOutput, z.ZodTypeDef, RuleInput>;

export type DateRule = RuleOutput;

// ---- Holiday frontmatter ---------------------------------------------------

export const CATEGORIES = [
  "seasonal",
  "modern",
  "christian",
  "literature",
  "roman",
  "greek",
  "norse",
  "celtic",
  "mesopotamian",
  "egyptian",
  "persian",
  "science",
  "rationalist",
  "remembrance",
  "progress",
  "history",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const SEASONS = ["winter", "spring", "summer", "autumn"] as const;
export type Season = (typeof SEASONS)[number];

export const TONES = ["joyful", "solemn", "playful", "reflective", "festive", "cozy"] as const;

export const frontmatterSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, "id must be kebab-case"),
  title: z.string().min(1),
  category: z.enum(CATEGORIES),
  region: z.enum(["US", "UK", "both"]).default("both"),
  season: z.enum(SEASONS),
  dateRule: dateRuleSchema,
  /** Multi-day festivals (e.g. Saturnalia). Defaults to a single day. */
  durationDays: z.number().int().min(1).default(1),
  tags: z.array(z.string()).default([]),
  tone: z.enum(TONES).default("reflective"),
  /** One-line summary used in compact views and the .ics title tooltip. */
  blurb: z.string().min(1),
  /** Optional: a short attribution / historical origin note. */
  origin: z.string().optional(),
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;

// ---- Season themes ---------------------------------------------------------

/** Frontmatter for a season's theme file (content/seasons/<season>.md). */
export const seasonMetaSchema = z.object({
  season: z.enum(SEASONS),
  /** The season's themed name, e.g. "The Long Dark & the Returning Light". */
  title: z.string().min(1),
  /** A one-line essence of the season's mood. */
  blurb: z.string().min(1),
});

export type SeasonMeta = z.infer<typeof seasonMetaSchema>;

// ---- Sabbath track ---------------------------------------------------------

/**
 * Frontmatter for a weekly Sabbath entry (content/sabbath/<slug>.md). Unlike a
 * holiday, a Sabbath entry has no date rule or season — it's one rung in an
 * ordered, repeating weekly track, selected by its position in the rotation.
 */
export const sabbathEntrySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, "id must be kebab-case"),
  title: z.string().min(1),
  /** Position in the rotation (1-based); entries cycle in this order. */
  order: z.number().int().min(1),
  /** Which seasonal block of the reading plan this entry belongs to. */
  season: z.enum(SEASONS),
  /** One-line summary used in compact views. */
  blurb: z.string().min(1),
  tone: z.enum(TONES).default("reflective"),
  tags: z.array(z.string()).default([]),
});

export type SabbathMeta = z.infer<typeof sabbathEntrySchema>;
