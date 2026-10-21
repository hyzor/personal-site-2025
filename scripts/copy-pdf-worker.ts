import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const pdfjsDistPath = path.dirname(require.resolve("pdfjs-dist/package.json"));
const source = path.join(pdfjsDistPath, "build", "pdf.worker.mjs");
const destination = path.resolve("public", "pdf.worker.mjs");

if (!fs.existsSync(source)) {
  throw new Error(`PDF.js worker not found at ${source}`);
}

fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.copyFileSync(source, destination);
