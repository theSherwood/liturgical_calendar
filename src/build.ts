/**
 * Build orchestrator: load the single source of truth once, then emit every
 * output. `--only=ics|web|pdf` limits the run (handy while iterating).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { config } from "./config.js";
import { loadHolidays, loadSabbath, loadSeasons } from "./core/load.js";
import { buildIcs } from "./emit/ics.js";
import { buildPdf } from "./emit/pdf.js";
import { renderPrint, renderSite } from "./emit/web.js";

const only = process.argv.find((a) => a.startsWith("--only="))?.split("=")[1];
const want = (name: string) => !only || only === name;

async function main() {
  const holidays = loadHolidays("content");
  const seasons = loadSeasons("content/seasons");
  const sabbathTrack = loadSabbath("content/sabbath");
  console.log(`Loaded ${holidays.length} holidays, ${seasons.size} season themes, ${sabbathTrack.length} Sabbath entries.`);

  const outDir = config.outDir;
  const siteDir = join(outDir, "site");
  mkdirSync(siteDir, { recursive: true });

  if (want("ics")) {
    const ics = buildIcs(holidays, sabbathTrack, config);
    writeFileSync(join(outDir, "calendar.ics"), ics, "utf8");
    const events = (ics.match(/BEGIN:VEVENT/g) ?? []).length;
    console.log(`✓ .ics    → ${join(outDir, "calendar.ics")} (${events} events)`);
  }

  let printHtml = "";
  if (want("web") || want("pdf")) {
    printHtml = renderPrint(holidays, seasons, config);
  }

  if (want("web")) {
    writeFileSync(join(siteDir, "index.html"), renderSite(holidays, seasons, sabbathTrack, config), "utf8");
    writeFileSync(join(siteDir, "print.html"), printHtml, "utf8");
    console.log(`✓ web    → ${join(siteDir, "index.html")}`);
  }

  if (want("pdf")) {
    const pdf = await buildPdf(printHtml);
    writeFileSync(join(outDir, "calendar.pdf"), pdf);
    console.log(`✓ pdf    → ${join(outDir, "calendar.pdf")} (${(pdf.length / 1024).toFixed(0)} KB)`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
