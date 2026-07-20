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

header.masthead { text-align: center; padding: 2rem 0 1rem; border-bottom: 2px solid var(--line); margin-bottom: 2rem; }
header.masthead h1 { font-size: clamp(1.8rem, 5vw, 2.8rem); margin: 0 0 .3rem; letter-spacing: .01em; }
header.masthead p { color: var(--muted); font-family: var(--sans); font-size: .95rem; margin: 0; }

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
.upcoming li { display: flex; gap: 1rem; padding: .5rem 0; border-bottom: 1px dotted var(--line); font-size: .98rem; }
.upcoming li .when { font-family: var(--sans); color: var(--muted); min-width: 6.5rem; font-size: .85rem; padding-top: .15rem; }
.upcoming li .what strong { font-weight: 600; }
.upcoming li .what span { color: var(--muted); }

.season { margin-bottom: 2.5rem; }
.season h2 { margin-bottom: 1rem; }
.season.winter h2 { color: var(--season-winter); }
.season.spring h2 { color: var(--season-spring); }
.season.summer h2 { color: var(--season-summer); }
.season.autumn h2 { color: var(--season-autumn); }

.card {
  background: var(--surface); border: 1px solid var(--line); border-radius: 12px;
  padding: 1.1rem 1.3rem; margin-bottom: 1rem; box-shadow: var(--shadow);
  border-left: 4px solid var(--accent);
}
.winter .card { border-left-color: var(--season-winter); }
.spring .card { border-left-color: var(--season-spring); }
.summer .card { border-left-color: var(--season-summer); }
.autumn .card { border-left-color: var(--season-autumn); }

.card .head { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; flex-wrap: wrap; }
.card .title { font-size: 1.25rem; font-weight: 600; margin: 0; }
.card .when { font-family: var(--sans); font-size: .82rem; color: var(--muted); white-space: nowrap; }
.card .badge { display: inline-block; font-family: var(--sans); font-size: .68rem; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); border: 1px solid var(--line); border-radius: 999px; padding: .1rem .55rem; margin-top: .35rem; }
.card .blurb { font-style: italic; color: var(--ink); margin: .5rem 0 0; }
.card details { margin-top: .6rem; }
.card summary { cursor: pointer; font-family: var(--sans); font-size: .8rem; color: var(--accent); list-style: none; user-select: none; }
.card summary::-webkit-details-marker { display: none; }
.card summary::before { content: "▸ "; }
.card details[open] summary::before { content: "▾ "; }
.card .body h4 { font-family: var(--sans); text-transform: uppercase; letter-spacing: .09em; font-size: .72rem; color: var(--muted); margin: 1rem 0 .3rem; }
.card .body p { margin: .2rem 0; }
.card .body blockquote { margin: .4rem 0 0; padding-left: .9rem; border-left: 2px solid var(--line); color: var(--muted); font-style: italic; }

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
