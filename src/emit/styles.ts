/**
 * ONE stylesheet, shared by the website and the print/PDF output. The `@media
 * print` and `@page` rules at the bottom are what the PDF pass uses; everything
 * above styles the screen. Theme-aware (light/dark) for the web.
 */
export const styles = `
:root {
  --bg: #fbf9f4;
  --surface: #ffffff;
  --ink: #24211c;
  --muted: #6b6558;
  --line: #e7e1d5;
  --accent: #7a5c3e;
  --season-winter: #4f6d7a;
  --season-spring: #6a8d3f;
  --season-summer: #c58a2e;
  --season-autumn: #a4562f;
  --shadow: 0 1px 3px rgba(40,32,20,.06), 0 8px 24px rgba(40,32,20,.05);
  --serif: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
  --sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #17150f; --surface: #201d16; --ink: #ece7dc; --muted: #a49c8b;
    --line: #34301f; --accent: #c9a678;
    --season-winter: #8fb3c4; --season-spring: #a7c56f;
    --season-summer: #e6b45f; --season-autumn: #d98a5f;
    --shadow: 0 1px 3px rgba(0,0,0,.3), 0 8px 24px rgba(0,0,0,.35);
  }
}

* { box-sizing: border-box; }
body {
  margin: 0; background: var(--bg); color: var(--ink);
  font-family: var(--serif); line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
.wrap { max-width: 900px; margin: 0 auto; padding: clamp(1.2rem, 4vw, 3rem); }

header.masthead { text-align: center; padding: .6rem 0 1rem; border-bottom: 2px solid var(--line); margin-bottom: 1.6rem; }
header.masthead h1 { font-size: clamp(1.35rem, 3.2vw, 1.9rem); margin: 0 0 .3rem; letter-spacing: .01em; }
header.masthead p { color: var(--muted); font-family: var(--sans); font-size: .95rem; margin: 0; }
.subscribe { display: flex; gap: .6rem; justify-content: center; flex-wrap: wrap; margin-top: 1.1rem; font-family: var(--sans); }
.subscribe a, .subscribe button { font-family: var(--sans); font-size: .85rem; text-decoration: none; color: var(--accent); background: var(--surface); border: 1px solid var(--line); border-radius: 999px; padding: .35rem .9rem; cursor: pointer; }
.subscribe a:hover, .subscribe button:hover { border-color: var(--accent); }
.subscribe .subscribe-primary { background: var(--accent); color: var(--surface); border-color: var(--accent); font-weight: 600; }

/* Subscribe help panel (revealed by the Subscribe button) */
.subpanel { max-width: 34rem; margin: 1rem auto 0; text-align: left; font-family: var(--sans); background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 1rem 1.2rem; box-shadow: var(--shadow); }
.subpanel[hidden] { display: none; }
.subintro { font-size: .85rem; color: var(--ink); margin: 0 0 .6rem; }
.suburl { display: flex; gap: .4rem; }
.suburl input { flex: 1; min-width: 0; font: inherit; font-size: .82rem; color: var(--ink); background: var(--bg); border: 1px solid var(--line); border-radius: 8px; padding: .4rem .6rem; }
.suburl button { font-family: var(--sans); font-size: .82rem; cursor: pointer; color: var(--surface); background: var(--accent); border: 1px solid var(--accent); border-radius: 8px; padding: .4rem .8rem; font-weight: 600; white-space: nowrap; }
.subhow { list-style: none; padding: 0; margin: .8rem 0 0; font-size: .82rem; color: var(--muted); }
.subhow li { padding: .25rem 0; border-top: 1px dotted var(--line); }
.subhow li:first-child { border-top: 0; }
.subhow strong { color: var(--ink); font-weight: 600; }
.subhow a { color: var(--accent); text-decoration: underline; text-underline-offset: 2px; }
.subnote { font-size: .76rem; color: var(--muted); margin: .8rem 0 0; }
.subnote code { font-family: ui-monospace, monospace; font-size: .95em; }
@media print { .subscribe, .subpanel { display: none; } }

/* ── Interactive controls (date picker, search, category chips) ── */
.controls { display: flex; flex-direction: column; gap: .75rem; margin: 0 0 2.2rem; }
.date-nav { display: flex; gap: .4rem; align-items: center; font-family: var(--sans); flex-wrap: wrap; }
.date-nav input[type="date"], #search {
  font: inherit; font-family: var(--sans); background: var(--surface); color: var(--ink);
  border: 1px solid var(--line); border-radius: 8px; padding: .4rem .6rem;
}
#search { font-size: .9rem; width: 100%; max-width: 22rem; }
.date-nav button, #todayBtn {
  font-family: var(--sans); font-size: .85rem; cursor: pointer; background: var(--surface);
  color: var(--ink); border: 1px solid var(--line); border-radius: 8px; padding: .4rem .65rem; line-height: 1;
}
.date-nav button[data-unit] { font-size: .9rem; padding: .35rem .5rem; letter-spacing: -.06em; font-variant-numeric: tabular-nums; }
#todayBtn { color: var(--accent); font-weight: 600; }
.date-nav button:hover, #todayBtn:hover, .chip:hover { border-color: var(--accent); }
.chips { display: flex; flex-wrap: wrap; gap: .4rem; }
.chip {
  font-family: var(--sans); font-size: .74rem; cursor: pointer; color: var(--muted);
  background: var(--surface); border: 1px solid var(--line); border-radius: 999px; padding: .28rem .75rem;
}
.chip.on { background: var(--accent); color: var(--surface); border-color: var(--accent); }
.chip.util { color: var(--accent); font-weight: 600; }
.yearhead { display: flex; align-items: baseline; gap: .8rem; border-bottom: 2px solid var(--line); margin: 2rem 0 1.2rem; padding-bottom: .4rem; }
.yearhead h2 { margin: 0; font-size: 1.6rem; }
.yearhead .count { font-family: var(--sans); font-size: .8rem; color: var(--muted); }
.today .also { font-family: var(--sans); font-size: .85rem; color: var(--muted); margin: .6rem 0 0; }
.today.empty { border-top-color: var(--line); }
.empty-note { color: var(--muted); font-style: italic; }
@media print { .controls { display: none; } }

/* ── Calendar heatmap (browse by date) ── */
.heatmap-sec { margin: 0 0 2.4rem; }
.heatmap-head { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
.heatmap-head h3 { font-family: var(--sans); text-transform: uppercase; letter-spacing: .1em; font-size: .8rem; color: var(--muted); margin: 0 0 .6rem; }
.hlegend { font-family: var(--sans); font-size: .72rem; color: var(--muted); display: inline-flex; align-items: center; gap: .28rem; }
.hlegend i { width: 11px; height: 11px; border-radius: 2px; display: inline-block; }
.heatmap-wrap { overflow-x: auto; padding-bottom: .4rem; }
#heatmap { display: flex; flex-wrap: wrap; gap: 1rem 1.4rem; }
.hmlabel { font-family: var(--sans); font-size: .7rem; letter-spacing: .04em; color: var(--muted); margin: 0 0 .35rem; }
.hmgrid { display: grid; grid-template-columns: repeat(7, 12px); gap: 3px; }
.hcell { width: 12px; height: 12px; border-radius: 2px; border: 0; padding: 0; }
.hcell.pad { background: transparent; }
button.hcell { cursor: pointer; }
.hcell.lv0, .hlegend i.lv0 { background: var(--line); }
.hcell.lv1, .hlegend i.lv1 { background: color-mix(in srgb, var(--accent) 38%, var(--surface)); }
.hcell.lv2, .hlegend i.lv2 { background: color-mix(in srgb, var(--accent) 68%, var(--surface)); }
.hcell.lv3, .hlegend i.lv3 { background: var(--accent); }
.hcell.sel { outline: 2px solid var(--ink); outline-offset: 1px; }
@media print { .heatmap-sec { display: none; } }

/* ── "On this day" — each holiday as its own card ── */
.onday { margin-bottom: 2.6rem; }
.dayhead { font-family: var(--sans); text-transform: uppercase; letter-spacing: .08em; font-size: .85rem; color: var(--accent); border-bottom: 2px solid var(--line); padding-bottom: .4rem; margin: 0 0 1.2rem; }

.today {
  background: var(--surface); border: 1px solid var(--line); border-radius: 14px;
  padding: 1.5rem 1.6rem; box-shadow: var(--shadow); margin-bottom: 2.5rem;
  border-top: 4px solid var(--accent);
}
.today .eyebrow { font-family: var(--sans); text-transform: uppercase; letter-spacing: .12em; font-size: .72rem; color: var(--muted); margin: 0 0 .4rem; }
.today h2 { margin: 0 0 .2rem; font-size: 1.6rem; }
.today .date { color: var(--muted); font-family: var(--sans); font-size: .9rem; margin-bottom: .8rem; }
.today .blurb { font-style: italic; color: var(--ink); margin: 0; }

.upcoming { margin-bottom: 3rem; }
.upcoming h3, .season h2 { font-family: var(--sans); text-transform: uppercase; letter-spacing: .1em; font-size: .8rem; color: var(--muted); border-bottom: 1px solid var(--line); padding-bottom: .5rem; }
.upcoming ul { list-style: none; padding: 0; margin: 0; }
.upcoming li { border-bottom: 1px dotted var(--line); }
.upcoming .hz { display: flex; gap: 1rem; align-items: baseline; width: 100%; text-align: left; background: none; border: 0; margin: 0; padding: .5rem .35rem; cursor: pointer; font: inherit; color: var(--ink); border-radius: 6px; }
.upcoming .hz:hover { background: color-mix(in srgb, var(--accent) 9%, transparent); }
.upcoming .when { font-family: var(--sans); color: var(--muted); min-width: 6.5rem; font-size: .85rem; }
.upcoming .what strong { font-weight: 600; }
.upcoming .what .bl { color: var(--muted); }
.upcoming h3 .hz-note { font-family: var(--sans); font-weight: 400; text-transform: none; letter-spacing: 0; color: var(--muted); font-size: .72rem; margin-left: .4rem; }

.season { margin-bottom: 2.5rem; }
.season h2 { margin-bottom: .2rem; }
.season.winter h2, .season.winter .season-theme { color: var(--season-winter); }
.season.spring h2, .season.spring .season-theme { color: var(--season-spring); }
.season.summer h2, .season.summer .season-theme { color: var(--season-summer); }
.season.autumn h2, .season.autumn .season-theme { color: var(--season-autumn); }
.season-theme { font-size: 1.35rem; font-weight: 600; margin: 0 0 .15rem; letter-spacing: .01em; }
.season-essence { font-style: italic; color: var(--muted); margin: 0 0 .6rem; }
.season-intro { margin: 0 0 1.4rem; max-width: 60ch; }
.season-intro p { margin: .3rem 0; color: var(--ink); }

.card {
  background: var(--surface); border: 1px solid var(--line); border-radius: 12px;
  padding: 1.1rem 1.3rem; margin-bottom: 1rem; box-shadow: var(--shadow);
  border-left: 4px solid var(--accent);
}
.winter .card { border-left-color: var(--season-winter); }
.spring .card { border-left-color: var(--season-spring); }
.summer .card { border-left-color: var(--season-summer); }
.autumn .card { border-left-color: var(--season-autumn); }

/* Remembrance days read as grave, whatever their season. */
.card.remembrance { border-left-color: #6b7280; background: color-mix(in srgb, var(--surface) 92%, #6b7280); }
.card.remembrance .badge { border-color: #6b7280; color: #6b7280; }
.card.remembrance .title::before { content: "✦ "; color: #6b7280; }
@media (prefers-color-scheme: dark) {
  .card.remembrance { border-left-color: #9aa3b2; background: color-mix(in srgb, var(--surface) 88%, #9aa3b2); }
  .card.remembrance .badge, .card.remembrance .title::before { border-color: #9aa3b2; color: #9aa3b2; }
}

/* The weekly Sabbath — its own quiet colour, set apart from the annual days. */
.sabbath-sec { margin: 1.6rem 0; }
.sabbath-head { font-family: var(--sans); text-transform: uppercase; letter-spacing: .08em; font-size: .85rem; color: #6d64a0; margin: 0 0 .8rem; }
.sabbath-head .hz-note { text-transform: none; letter-spacing: 0; color: var(--muted); font-weight: 400; }
.sab-controls { display: flex; align-items: center; flex-wrap: wrap; gap: .5rem; margin: 0 0 .8rem; font-family: var(--sans); font-size: .82rem; }
.sab-controls label { color: var(--muted); text-transform: uppercase; letter-spacing: .06em; font-size: .72rem; }
.sab-controls input[type="date"] { font: inherit; padding: .25rem .5rem; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); color: var(--ink); }
.sab-controls input[type="date"]:hover { border-color: #6d64a0; }
.sab-controls .sab-hint { color: var(--muted); font-style: italic; }
.sab-theme { font-family: var(--sans); font-size: .8rem; color: #6d64a0; margin: 0 0 .6rem; font-weight: 600; }
@media (prefers-color-scheme: dark) { .sab-theme { color: #a99ee0; } }
.card.sabbath { border-left-color: #6d64a0; border-left-width: 6px; background: color-mix(in srgb, var(--surface) 94%, #6d64a0); }
.card.sabbath .badge { border-color: #6d64a0; color: #6d64a0; }
.card.sabbath .title::before { content: "✧ "; color: #6d64a0; }
@media (prefers-color-scheme: dark) {
  .sabbath-head, .card.sabbath .badge, .card.sabbath .title::before { color: #a99ee0; }
  .card.sabbath { border-left-color: #a99ee0; background: color-mix(in srgb, var(--surface) 88%, #a99ee0); }
  .card.sabbath .badge { border-color: #a99ee0; }
}

.card .head { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; flex-wrap: wrap; }
.card .title { font-size: 1.25rem; font-weight: 600; margin: 0; }
.card .when { font-family: var(--sans); font-size: .82rem; color: var(--muted); white-space: nowrap; }
.card .badge { display: inline-block; font-family: var(--sans); font-size: .68rem; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); border: 1px solid var(--line); border-radius: 999px; padding: .1rem .55rem; margin-top: .35rem; }
.card .blurb { font-style: italic; color: var(--ink); margin: .5rem 0 0; }
/* On the web a card is a <details>; its <summary> is the always-visible header,
   so clicking anywhere on the card expands it. */
details.card > summary { list-style: none; cursor: pointer; display: block; }
details.card > summary::-webkit-details-marker { display: none; }
details.card > summary .blurb { margin-bottom: 0; }
details.card > summary::after { content: "▸ Meaning · observance · reading"; display: block; margin-top: .6rem; font-family: var(--sans); font-size: .78rem; color: var(--accent); user-select: none; }
details.card[open] > summary::after { content: "▾ Hide"; }
details.card > .body { margin-top: .9rem; }
.card .body h4 { font-family: var(--sans); text-transform: uppercase; letter-spacing: .09em; font-size: .72rem; color: var(--muted); margin: 1rem 0 .3rem; }
.card .body p { margin: .2rem 0; }
.card .body blockquote { margin: .5rem 0; padding-left: .9rem; border-left: 2px solid var(--line); color: var(--muted); font-style: italic; }
.card .body blockquote p { margin: 0; }
.card .body blockquote + blockquote { margin-top: .5rem; }
.card .body .reading-note { color: var(--ink); font-style: normal; margin: .5rem 0; }
.card .body .reading p { margin: .5rem 0; }
.card .body .reading a { color: var(--accent); text-decoration: underline; text-underline-offset: 2px; overflow-wrap: anywhere; }
/* The trailing "Sources:" line, set apart. */
/* The Sources block: a "Sources" label followed by a vertical list of links. */
.card .body .reading p:has(strong) { margin: 1.1rem 0 .3rem; padding-top: .7rem; border-top: 1px dotted var(--line); font-family: var(--sans); font-size: .74rem; text-transform: uppercase; letter-spacing: .07em; color: var(--muted); }
.card .body .reading ul { list-style: none; margin: .2rem 0 0; padding-left: 0; font-family: var(--sans); font-size: .84rem; }
.card .body .reading ul li { margin: .3rem 0; padding-left: 1.1rem; position: relative; }
.card .body .reading ul li::before { content: "→"; position: absolute; left: 0; color: var(--muted); }
@media print {
  /* On paper links can't be clicked — show the URL so the reference survives. */
  .card .body .reading a[href^="http"]::after { content: " (" attr(href) ")"; font-size: .82em; color: #555; overflow-wrap: anywhere; }
}

footer { text-align: center; color: var(--muted); font-family: var(--sans); font-size: .8rem; padding: 2rem 0; border-top: 1px solid var(--line); margin-top: 2rem; }

/* ── Print / PDF ─────────────────────────────────────────────────────── */
@page { size: A4; margin: 18mm 16mm; }
@media print {
  :root {
    --bg: #fff; --surface: #fff; --ink: #1a1a1a; --muted: #555; --line: #ccc;
    --shadow: none;
  }
  body { font-size: 10.5pt; }
  .wrap { max-width: none; padding: 0; }
  .today, .upcoming { display: none; }              /* screen-only widgets */
  .card { break-inside: avoid; box-shadow: none; page-break-inside: avoid; }
  .season { break-inside: auto; }
  .season h2 { break-after: avoid; }
  .card details { margin-top: .4rem; }
  .card summary { display: none; }                  /* everything expanded in print */
  .card details > .body { display: block !important; }
  a { color: inherit; text-decoration: none; }
}
`;
