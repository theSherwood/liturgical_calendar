import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import {
  frontmatterSchema,
  seasonMetaSchema,
  type Frontmatter,
  type Season,
  type SeasonMeta,
} from "./schema.js";

export interface Holiday {
  meta: Frontmatter;
  /** The Markdown body (Meaning / Observance / Reading sections). */
  body: string;
  /** Source file path, for error messages. */
  source: string;
}

/** Subdirectories of content/ that are not holidays. */
const NON_HOLIDAY_DIRS = new Set(["seasons"]);

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (NON_HOLIDAY_DIRS.has(entry)) continue;
      out.push(...walk(full));
    } else if (entry.endsWith(".md")) out.push(full);
  }
  return out;
}

/**
 * Load and validate every holiday under `contentDir`. Throws with a precise,
 * file-attributed message if any frontmatter is malformed or any id repeats.
 */
export function loadHolidays(contentDir: string): Holiday[] {
  const holidays: Holiday[] = [];
  const seen = new Map<string, string>();

  for (const file of walk(contentDir).sort()) {
    const raw = readFileSync(file, "utf8");
    const { data, content } = matter(raw);
    const parsed = frontmatterSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(`Invalid frontmatter in ${file}:\n${parsed.error.toString()}`);
    }
    const meta = parsed.data;
    const prior = seen.get(meta.id);
    if (prior) throw new Error(`Duplicate holiday id "${meta.id}" in ${file} and ${prior}`);
    seen.set(meta.id, file);
    holidays.push({ meta, body: content.trim(), source: file });
  }

  if (holidays.length === 0) throw new Error(`No holidays found under ${contentDir}`);
  return holidays;
}

export interface SeasonDoc {
  meta: SeasonMeta;
  /** Intro prose shown above the season's holidays. */
  body: string;
  source: string;
}

/**
 * Load the four season theme files from `seasonsDir` (content/seasons/*.md),
 * keyed by season. Missing seasons are simply absent from the map, so the site
 * degrades gracefully. Throws on malformed frontmatter or a duplicate season.
 */
export function loadSeasons(seasonsDir: string): Map<Season, SeasonDoc> {
  const seasons = new Map<Season, SeasonDoc>();
  let files: string[];
  try {
    files = readdirSync(seasonsDir).filter((f) => f.endsWith(".md"));
  } catch {
    return seasons; // no seasons directory yet — fine
  }

  for (const name of files.sort()) {
    const file = join(seasonsDir, name);
    const { data, content } = matter(readFileSync(file, "utf8"));
    const parsed = seasonMetaSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(`Invalid season frontmatter in ${file}:\n${parsed.error.toString()}`);
    }
    if (seasons.has(parsed.data.season)) {
      throw new Error(`Duplicate season "${parsed.data.season}" in ${file}`);
    }
    seasons.set(parsed.data.season, { meta: parsed.data, body: content.trim(), source: file });
  }
  return seasons;
}
