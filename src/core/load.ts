import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { frontmatterSchema, type Frontmatter } from "./schema.js";

export interface Holiday {
  meta: Frontmatter;
  /** The Markdown body (Meaning / Observance / Reading sections). */
  body: string;
  /** Source file path, for error messages. */
  source: string;
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (entry.endsWith(".md")) out.push(full);
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
