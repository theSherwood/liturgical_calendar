/**
 * Tiny static server for previewing the built site locally: `npm run serve`.
 * Serves dist/site on http://localhost:4321. No dependencies.
 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { config } from "./config.js";

const root = join(config.outDir, "site");
const port = Number(process.env.PORT ?? 4321);
const types: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".ics": "text/calendar",
  ".pdf": "application/pdf",
};

createServer(async (req, res) => {
  try {
    let path = normalize(decodeURIComponent((req.url ?? "/").split("?")[0]));
    if (path === "/" || path.endsWith("/")) path += "index.html";
    const file = join(root, path);
    if (!file.startsWith(root)) {
      res.writeHead(403).end("Forbidden");
      return;
    }
    const data = await readFile(file);
    res.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404).end("Not found");
  }
}).listen(port, () => console.log(`Serving ${root} at http://localhost:${port}`));
