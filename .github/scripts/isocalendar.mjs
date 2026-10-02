// Draws an isometric contributions calendar in the portfolio's navy palette.
// Reads the public contributions page, so it needs no token. Usage: node isocalendar.mjs <user> <out.svg>
import { writeFileSync } from 'node:fs';

const [, , USER = 'lucaskmk', OUT = 'assets/isocalendar.svg'] = process.argv;
const html = await (await fetch(`https://github.com/users/${USER}/contributions`)).text();

// Each day cell carries its date, level and an id; the matching tooltip holds the count
const counts = {};
for (const m of html.matchAll(/for="(contribution-day-component-[\d-]+)"[^>]*>(\d+|No) contributions?/g)) {
  counts[m[1]] = m[2] === 'No' ? 0 : +m[2];
}
const days = [...html.matchAll(/data-date="(\d{4}-\d{2}-\d{2})" id="(contribution-day-component-(\d+)-(\d+))" data-level="(\d)"/g)]
  .map(m => ({ date: m[1], day: +m[3], week: +m[4], level: +m[5], count: counts[m[2]] ?? 0 }))
  .sort((a, b) => a.date.localeCompare(b.date));
if (days.length < 300) throw new Error(`only ${days.length} days parsed, page layout may have changed`);

// Stats shown in the corner
const total = days.reduce((s, d) => s + d.count, 0);
const best = days.reduce((b, d) => (d.count > b.count ? d : b), days[0]);
let streak = 0;
for (let i = days.length - 1; i >= 0; i--) {
  if (days[i].count > 0) streak++;
  else if (i === days.length - 1) continue; // today may still be empty
  else break;
}
const avg = (total / days.length).toFixed(2);

// Oblique projection sized for a stats-row card: weeks step right (and slightly down), weekdays step down-left
const WV = [7.2, 1.7], DV = [-4.6, 3.6];
const maxCount = Math.max(1, ...days.map(d => d.count));
const height = d => (d.count ? 2 + Math.round(Math.sqrt(d.count / maxCount) * 30) : 1);
const TOP = ['#1b2233', '#1a2a4a', '#2f4a78', '#5b7db1', '#9bb8e0'];
const shade = (hex, k) => '#' + [1, 3, 5].map(i => Math.round(parseInt(hex.slice(i, i + 2), 16) * k).toString(16).padStart(2, '0')).join('');

const W = 495, H = 195;
// Cubes are drawn from the origin; the whole trail is then centered on its real bounding box
const OX = 0, OY = 0, box = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
const grow = (...ps) => ps.forEach(([x, y]) => { box.x0 = Math.min(box.x0, x); box.x1 = Math.max(box.x1, x); box.y0 = Math.min(box.y0, y); box.y1 = Math.max(box.y1, y); });
const pt = (x, y) => `${x.toFixed(1)},${y.toFixed(1)}`;
const cube = d => {
  const x = OX + d.week * WV[0] + d.day * DV[0], y = OY + d.week * WV[1] + d.day * DV[1] - height(d), h = height(d), c = TOP[d.level];
  const p0 = [x, y], p1 = [x + WV[0], y + WV[1]], p2 = [p1[0] + DV[0], p1[1] + DV[1]], p3 = [x + DV[0], y + DV[1]];
  grow(p0, p1, p2, p3, [p2[0], p2[1] + h], [p3[0], p3[1] + h]);
  const top = `M${pt(...p0)} L${pt(...p1)} L${pt(...p2)} L${pt(...p3)} Z`;
  const front = `M${pt(...p3)} L${pt(...p2)} L${pt(p2[0], p2[1] + h)} L${pt(p3[0], p3[1] + h)} Z`;
  const side = `M${pt(...p1)} L${pt(...p2)} L${pt(p2[0], p2[1] + h)} L${pt(p1[0], p1[1] + h)} Z`;
  return `<g class="c" style="animation-delay:${(d.week * 0.025).toFixed(3)}s"><title>${d.count} on ${d.date}</title><path d="${front}" fill="${shade(c, 0.72)}"/><path d="${side}" fill="${shade(c, 0.55)}"/><path d="${top}" fill="${c}"/></g>`;
};
// Paint back to front
const cubes = [...days].sort((a, b) => a.day - b.day || a.week - b.week).map(cube).join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Isometric contributions calendar: ${total} contributions in the last year">
  <style>
    .c { animation: rise .6s cubic-bezier(.2,.7,.2,1) both; }
    @keyframes rise { from { opacity: 0; transform: translateY(-14px) } to { opacity: 1; transform: none } }
    @media (prefers-reduced-motion: reduce) { .c { animation: none } }
  </style>
  <rect width="${W}" height="${H}" rx="12" fill="#070a11"/>
  <g transform="translate(${((W - (box.x1 - box.x0)) / 2 - box.x0).toFixed(1)} ${((H - (box.y1 - box.y0)) / 2 - box.y0).toFixed(1)})">${cubes}</g>
</svg>
`;
writeFileSync(OUT, svg);
console.log(`${days.length} days, ${total} contributions, best ${best.count} on ${best.date}, streak ${streak}`);
