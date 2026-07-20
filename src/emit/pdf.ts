import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer";

/**
 * Locate a Chromium binary. Prefers PUPPETEER_EXECUTABLE_PATH, then the
 * Chromium that ships preinstalled in this environment (so we never download).
 */
function resolveChromium(): string | undefined {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;
  const base = "/opt/pw-browsers";
  if (existsSync(base)) {
    const dir = readdirSync(base)
      .filter((d) => d.startsWith("chromium-"))
      .sort()
      .pop();
    if (dir) {
      const candidate = join(base, dir, "chrome-linux", "chrome");
      if (existsSync(candidate)) return candidate;
    }
  }
  return undefined; // fall back to Puppeteer's own bundled browser, if present
}

/** Render print HTML to a PDF buffer using headless Chromium. */
export async function buildPdf(printHtml: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: resolveChromium(),
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(printHtml, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true, // honour the @page size/margins in styles.ts
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
