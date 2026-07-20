# The Family Liturgical Calendar

A secular "liturgical year" for a family that wants the *shape* a religious
calendar gives to a year — the seasons, the anticipation, the shared rituals —
built instead from its own values: modern civic holidays, ancient festivals
(Greek, Roman, Celtic, Norse, Mesopotamian), science/tech/math days, and
Rationalist community observances like **Petrov Day** and the **Secular
Solstice**.

It is **one source of truth → three synced outputs**:

| Output | File | Use |
| --- | --- | --- |
| 📆 Subscribable feed | `dist/calendar.ics` | Subscribe on every phone; holidays appear with their meaning & observance |
| 🌐 Website | `dist/site/index.html` | "What's today?" plus the whole annotated year, grouped by season |
| 🖨️ Printable calendar | `dist/calendar.pdf` | A year-at-a-glance booklet for the wall or fridge |

All three are generated from the Markdown files in [`content/`](content/). No
output is ever hand-edited.

## The idea

Each holiday is a small Markdown file with structured frontmatter (its date
*rule*, category, season, tone) and a prose body in three parts: **Meaning**,
**Observance**, and a **Reading**. The observance is the point — this is a
calendar of *things the family does*, not just a list of dates.

The year is organized around the eight solar anchor points (solstices,
equinoxes, and the four cross-quarter days — the "Wheel of the Year"), so
holidays fall into natural **seasons**, each with its own theme (defined in
[`content/seasons/`](content/seasons/)): Winter — *The Long Dark & the Returning
Light*; Spring — *Renewal & Beginnings*; Summer — *Abundance & Height*; Autumn —
*Harvest & Remembrance*. Watch what clusters in late December: the Winter
Solstice, Yule, Saturnalia, Newtonmas, Christmas, and the Secular Solstice all
pile up into one high season.

There are currently **65 curated observances**. A holiday's `## Reading` can be a
single line or a long, multi-part passage — several stanzas, a litany, framing
prose — and the rationalist entries lean on the LessWrong canon and the
Sequences (the Litany of Gendlin, the Litany of Tarski, and the like).

## Quick start

```sh
npm install
npm run build      # writes dist/calendar.ics, dist/site/, dist/calendar.pdf
npm run serve      # preview the site at http://localhost:4321
npm test           # verify the date-math engine against known dates
```

Build just one output while iterating: `npm run build:ics` · `build:web` · `build:pdf`.

## Adding or editing a holiday

Create a file under the right category folder in `content/`, e.g.
`content/rationalist/petrov-day.md`:

```markdown
---
id: petrov-day            # unique, kebab-case
title: Petrov Day
category: rationalist      # seasonal | modern | roman | greek | norse | celtic | mesopotamian | science | rationalist
region: both               # both | US | UK
season: autumn             # winter | spring | summer | autumn
dateRule: { type: fixed, month: 9, day: 26 }
tags: [rationalist, nuclear, restraint, hero]
tone: solemn               # joyful | solemn | playful | reflective | festive | cozy
blurb: The day one man's calm judgment quietly saved the world.
# durationDays: 7          # optional, for multi-day festivals
# origin: A short note on where it comes from   # optional
---

## Meaning
Why the day matters…

## Observance
What the family actually does…

## Reading
> A quote or short passage. — Attribution
```

Run `npm run build` again and it appears everywhere. Malformed frontmatter
fails the build with a file-attributed error, so mistakes are caught early.

### Date rules

Most of these holidays don't fall on a fixed date, so each entry stores a
*rule* that resolves to a real date per year:

| `type` | Fields | Example |
| --- | --- | --- |
| `fixed` | `month`, `day` | Christmas, Petrov Day |
| `nthWeekday` | `month`, `weekday` (0=Sun), `n` (1–5, or −1 for last) | US Thanksgiving = 4th Thursday of November |
| `easter` | `offset` (days from Easter Sunday) | Good Friday = `offset: -2` |
| `astronomical` | `event` (`marchEquinox`\|`juneSolstice`\|`septemberEquinox`\|`decemberSolstice`), `offset?` | the solstices & equinoxes, computed precisely |
| `lunar` | `phase` (`new`\|`full`), `anchor` (a solar event), `count?` | Akitu = first new moon after the March equinox |
| `relative` | `offset`, `base` (another rule) | Mothering Sunday = Easter − 21 days |

Astronomical and lunar instants are localized to the timezone in
[`src/config.ts`](src/config.ts) (default US Mountain Time) before being reduced
to a calendar date.

## Configuration

Edit [`src/config.ts`](src/config.ts): the family name, the timezone, which
regions to include (`US`, `UK`, or both), and how many years the `.ics` feed
should span.

## How it fits together

```
content/**.md        ← the single source of truth (one file per holiday)
content/seasons/*.md  ← each season's theme + intro prose
   │
   ▼
src/core/       load + validate (zod) → resolve each date rule for a year
   │
   ├─► src/emit/ics.ts   → dist/calendar.ics   (explicit all-day events per year)
   ├─► src/emit/web.ts   → dist/site/index.html (today · upcoming · the year by season)
   └─► src/emit/pdf.ts   → dist/calendar.pdf    (headless Chromium prints the print layout)
```

To retitle a season or rewrite its intro, edit its file in `content/seasons/`
(frontmatter `season` / `title` / `blurb`, plus the body prose) and rebuild.

The website and the PDF share one stylesheet ([`src/emit/styles.ts`](src/emit/styles.ts)),
so they always look like the same calendar.

## Roadmap ideas

- Publish `dist/` via CI (e.g. GitHub Pages) so the `.ics` has a stable URL to
  subscribe to and the site is always live.
- A `family` category for birthdays and anniversaries (the model already
  supports it — just add a folder).
- More entries: the curated year is a strong start, not a closed set.
