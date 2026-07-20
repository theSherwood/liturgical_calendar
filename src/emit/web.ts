import { formatInTimeZone } from "date-fns-tz";
import type { Config } from "../config.js";
import type { Holiday } from "../core/load.js";
import { resolveYear, type ResolvedHoliday } from "../core/resolve.js";
import { SEASONS } from "../core/schema.js";
import {
  CATEGORY_LABELS,
  SEASON_LABELS,
  formatDate,
  formatShort,
  parseSections,
} from "./util.js";
import { styles } from "./styles.js";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const paras = (s: string) =>
  s
    .split(/\n{2,}/)
    .map((p) => `<p>${esc(p.trim())}</p>`)
    .join("");

function readingHtml(reading: string): string {
  const text = reading.replace(/^>\s?/gm, "").trim();
  return `<blockquote>${esc(text)}</blockquote>`;
}

function bodyHtml(r: ResolvedHoliday): string {
  const { meaning, observance, reading } = parseSections(r.holiday.body);
  return `<div class="body">
    <h4>Meaning</h4>${paras(meaning)}
    <h4>Observance</h4>${paras(observance)}
    <h4>Reading</h4>${readingHtml(reading)}
  </div>`;
}

/** A single holiday card. `open` forces the detail section expanded (print). */
function renderCard(r: ResolvedHoliday, open: boolean): string {
  const m = r.holiday.meta;
  const details = open
    ? `<div class="body-wrap">${bodyHtml(r)}</div>`
    : `<details><summary>Meaning, observance &amp; reading</summary>${bodyHtml(r)}</details>`;
  return `<article class="card">
    <div class="head">
      <h3 class="title">${esc(m.title)}</h3>
      <div class="when">${formatDate(r)}</div>
    </div>
    <div class="badge">${CATEGORY_LABELS[m.category]}</div>
    <p class="blurb">${esc(m.blurb)}</p>
    ${details}
  </article>`;
}

function seasonSections(resolved: ResolvedHoliday[], open: boolean): string {
  return SEASONS.map((season) => {
    const inSeason = resolved.filter((r) => r.holiday.meta.season === season);
    if (inSeason.length === 0) return "";
    return `<section class="season ${season}">
      <h2>${SEASON_LABELS[season]}</h2>
      ${inSeason.map((r) => renderCard(r, open)).join("\n")}
    </section>`;
  }).join("\n");
}

function todayInTz(config: Config): { year: number; iso: string } {
  const iso = formatInTimeZone(new Date(), config.timezone, "yyyy-MM-dd");
  return { year: Number(iso.slice(0, 4)), iso };
}

function page(title: string, bodyInner: string, bodyClass = ""): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<style>${styles}</style>
</head>
<body class="${bodyClass}">
<div class="wrap">
${bodyInner}
</div>
</body>
</html>`;
}

/** The interactive website (index.html): today, upcoming, and the full year. */
export function renderSite(holidays: Holiday[], config: Config): string {
  const { year, iso } = todayInTz(config);
  const thisYear = resolveYear(holidays, year, config);
  const nextYear = resolveYear(holidays, year + 1, config);
  const timeline = [...thisYear, ...nextYear];

  const todayMs = Date.parse(`${iso}T00:00:00Z`);
  const todays = timeline.filter((r) => {
    const s = r.start.getTime();
    return todayMs >= s && todayMs < s + r.durationDays * 86_400_000;
  });
  const upcoming = timeline.filter((r) => r.start.getTime() > todayMs).slice(0, 6);

  const feature = todays[0] ?? upcoming[0];
  const featureBlock = feature
    ? `<section class="today">
        <p class="eyebrow">${todays.length ? "Today" : "Coming up"}</p>
        <h2>${esc(feature.holiday.meta.title)}</h2>
        <div class="date">${formatDate(feature, true)} · ${CATEGORY_LABELS[feature.holiday.meta.category]}</div>
        <p class="blurb">${esc(feature.holiday.meta.blurb)}</p>
      </section>`
    : "";

  const upcomingBlock = upcoming.length
    ? `<section class="upcoming">
        <h3>On the horizon</h3>
        <ul>${upcoming
          .map(
            (r) => `<li>
              <span class="when">${formatShort(r)}</span>
              <span class="what"><strong>${esc(r.holiday.meta.title)}</strong> — <span>${esc(r.holiday.meta.blurb)}</span></span>
            </li>`,
          )
          .join("")}</ul>
      </section>`
    : "";

  const inner = `
<header class="masthead">
  <h1>The ${esc(config.familyName)} Family Calendar</h1>
  <p>A secular liturgical year · ${thisYear.length} observances · ${year}</p>
</header>
${featureBlock}
${upcomingBlock}
${seasonSections(thisYear, false)}
<footer>Generated from a single source of truth · dates shown for ${year} (${config.timezone})</footer>`;

  return page(`The ${config.familyName} Family Calendar`, inner);
}

/** The print/PDF layout: the full year, everything expanded, page-break aware. */
export function renderPrint(holidays: Holiday[], config: Config): string {
  const { year } = todayInTz(config);
  const thisYear = resolveYear(holidays, year, config);
  const inner = `
<header class="masthead">
  <h1>The ${esc(config.familyName)} Family Calendar</h1>
  <p>A secular liturgical year · ${year}</p>
</header>
${seasonSections(thisYear, true)}
<footer>The ${esc(config.familyName)} family liturgical calendar · ${year}</footer>`;
  return page(`The ${config.familyName} Family Calendar — ${year}`, inner, "print");
}
