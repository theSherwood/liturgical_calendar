# The Family Liturgical Calendar

A secular "liturgical year" for a family that wants the *shape* a religious
calendar gives to a year — the seasons, the anticipation, the shared rituals —
built instead from its own values: modern civic holidays, ancient festivals
(Greek, Roman, Celtic, Norse, Mesopotamian), science/tech/math days, and
Rationalist community observances like **Petrov Day** and the **Secular
Solstice**.

## Live

- **Dashboard:** https://thesherwood.github.io/liturgical_calendar/
- **Subscribe (feed):** [`webcal://thesherwood.github.io/liturgical_calendar/calendar.ics`](webcal://thesherwood.github.io/liturgical_calendar/calendar.ics) · [download `.ics`](https://thesherwood.github.io/liturgical_calendar/calendar.ics)
- **Printable PDF:** https://thesherwood.github.io/liturgical_calendar/calendar.pdf

It is **one source of truth → three synced outputs**:

| Output | File | Use |
| --- | --- | --- |
| 📆 Subscribable feed | `dist/calendar.ics` | Subscribe on every phone; holidays appear with their meaning & observance |
| 🌐 Website | `dist/site/index.html` | Interactive dashboard: today (in your timezone), jump to any date, filter by category, full-text search (names, themes, tags, and the readings themselves) — plus the whole annotated year by season |
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

There are currently **82 curated observances**. A holiday's `## Reading` can be a
single line or a long, multi-part passage — several stanzas, a litany, framing
prose — and the rationalist entries lean on the LessWrong canon and the
Sequences (the Litany of Gendlin, the Litany of Tarski, and the like).

Alongside the ancient-culture and science threads, two more run through the year:
**Liberty & Progress** (the Abolition of the Slave Trade, the Emancipation
Proclamation, Human Rights Day, the Fall of the Berlin Wall, Magna Carta) — days
that mark humanity getting morally better — and **Turning Points** (the meeting of
the Old and New Worlds in 1492, the Gutenberg Bible, the Gregorian calendar) for
the civilizational pivots, not all of them happy.

Not every day is a celebration. A small **Remembrance** thread (Trinity Day, the
Fall of Constantinople, Holocaust Remembrance, Remembrance Day) marks the solemn
days with a shared grave ritual — a candle, a reading, a minute of silence — and
those cards are styled to read differently from the festive ones.

### The weekly Sabbath

Running underneath the annual year is a **weekly Sabbath** — a secular day of rest
built as an ordered **reading plan**: a 52-week track that plays one entry per week
and loops. It runs through the rationalist/EA canon in four seasonal blocks —
**Winter** *(Foundations of Clear Thinking)*, **Spring** *(Changing Your Mind &
Escaping the Tribe)*, **Summer** *(Acting Well — Altruism & Doing Good)*, and
**Autumn** *(What Is Worth Wanting — Value & the Far Future)* — from *Making Beliefs
Pay Rent* through *Meditations on Moloch* to *Letter from Utopia*. It lives in
[`content/sabbath/`](content/sabbath/), one Markdown file per week (`order:` sets the
sequence, `season:` its block), and it's independent of the annual holidays and their
category filters.

The dashboard shows **"This week's Sabbath"** for whatever date you're viewing, and a
**"Reading plan begins" date picker** lets you slide where entry 1 lands — set it to a
given Sunday and the plan plays forward from there, week by week. That choice persists
(localStorage) and rides in the URL (`?s=YYYY-MM-DD`) so a chosen start is shareable.

The day the Sabbath falls on is set in [`src/config.ts`](src/config.ts)
(`sabbath.weekday`, `0` = Sunday); `sabbath.epoch` is the default plan start and the
one the **`.ics` feed** uses (the dashboard picker only overrides the plan start
in-browser — set `sabbath.epoch` to bake a start into the subscribable feed). The feed
carries one Sabbath event per week with that week's reading.

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
category: rationalist      # seasonal | modern | christian | literature | roman | greek | norse | celtic | mesopotamian | egyptian | persian | science | rationalist | remembrance | progress | history
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
| `leapDay` | *(none)* | Leap Day = Feb 29, present only in leap years |

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

## Hosting & subscribing

A GitHub Actions workflow builds the calendar and deploys it to **GitHub Pages**
on every push to `main`, plus once a year (see the note on the schedule below) and
on demand. It publishes:

- the dashboard at **`https://thesherwood.github.io/liturgical_calendar/`**
- the feed at **`…/calendar.ics`** and the booklet at **`…/calendar.pdf`**

**Activating it (one-time).** The workflow source lives in
[`.github/workflows_src/pages.yml`](.github/workflows_src/pages.yml) rather than
the usual `.github/workflows/`, because the automation credential can't write to
that gated path. Copy it into place from a machine whose git has the `workflow`
scope:

```sh
cp -r .github/workflows_src/. .github/workflows/
git add .github/workflows && git commit -m "Activate Pages deploy" && git push
```

Then **enable Pages** (required — the workflow's token can't do it): **Settings →
Pages → Build and deployment → Source: GitHub Actions**, and re-run the workflow.
Re-copy `workflows_src` → `workflows` whenever the source changes.

**Why only yearly** (not daily): the dashboard is a small client-side app — the
browser computes "today" in the *viewer's* timezone and lets you jump to any date,
filter by category, and search, so the page never goes stale between builds. The
yearly rebuild exists only to roll the forward-looking horizons onward (the `.ics`
spans build-year − 1 … + 5, the embedded dashboard data build-year − 2 … + 8).
Content and code changes still deploy immediately on push.

**Subscribing on phones** — the dashboard's "Subscribe on your phone" button uses
a `webcal://…/calendar.ics` link, which opens straight into Apple/Google Calendar
as a *subscription* (it refreshes on the client's own schedule). Set the public
URL in [`src/config.ts`](src/config.ts) (`siteUrl`) if you move to a custom domain.

### Options for hosting the `.ics`

| Option | How | Notes |
| --- | --- | --- |
| **GitHub Pages** (this repo) | served at `…/calendar.ics` | Free, versioned with the site, refreshed daily by the Action. The natural choice. |
| `webcal://` subscribe link | same URL, `webcal://` scheme | Not separate hosting — just the one-click *subscribe* form of the Pages URL. |
| Raw GitHub URL | `raw.githubusercontent.com/…/calendar.ics` | Works without CI if you commit the file, but served as `text/plain` with a short cache; some calendar apps are fussy. |
| A calendar service / Worker | e.g. a Cloudflare Worker that regenerates on request | Overkill here — the Pages feed already spans current year − 1 … + 5 and rebuilds daily. |

## Roadmap ideas

- A `family` category for birthdays and anniversaries (the model already
  supports it — just add a folder).
- More entries: the curated year is a strong start, not a closed set.
- Make the "Today" panel compute client-side so it's exact between daily builds.
