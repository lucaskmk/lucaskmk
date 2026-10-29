// Puts the same dark card behind the generated snake, so it looks identical on light and dark GitHub themes.
// Usage: node snake-bg.mjs <snake.svg>
import { readFileSync, writeFileSync } from 'node:fs';

const [, , FILE] = process.argv;
const svg = readFileSync(FILE, 'utf8');
if (svg.includes('data-card-bg')) process.exit(0);

const m = svg.match(/<svg[^>]*viewBox="(-?[\d.]+) (-?[\d.]+) ([\d.]+) ([\d.]+)"[^>]*>/);
if (!m) throw new Error(`no viewBox found in ${FILE}`);
const [open, x, y, w, h] = m;
writeFileSync(FILE, svg.replace(open, `${open}<rect data-card-bg="1" x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="#070a11"/>`));
