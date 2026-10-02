// Hand-picked "Most Used Languages" card, styled like the other stats cards (300x195).
// Edit LANGS (name, relative weight, GitHub linguist color) and run: node .github/scripts/languages.mjs
import { writeFileSync } from 'node:fs';

const LANGS = [
  ['Python', 30, '#3572A5'],
  ['C', 20, '#555555'],
  ['Java', 15, '#b07219'],
  ['SQL', 12, '#e38c00'],
  ['TypeScript', 8, '#3178c6'],
  ['JavaScript', 6, '#f1e05a'],
  ['C++', 5, '#f34b7d'],
  ['VHDL', 4, '#adb2cb'],
];

const FONT = `'Segoe UI', Ubuntu, 'Helvetica Neue', Sans-Serif`;
const W = 300, H = 195, X = 25, BW = W - 50, BY = 55;
const total = LANGS.reduce((s, [, w]) => s + w, 0);

let x = X;
const segs = LANGS.map(([name, w, c]) => {
  const width = (w / total) * BW, seg = `<rect x="${x.toFixed(2)}" y="${BY}" width="${width.toFixed(2)}" height="8" fill="${c}"><title>${name}</title></rect>`;
  x += width;
  return seg;
}).join('');

const legend = LANGS.map(([name, , c], i) => {
  const col = i % 2, row = Math.floor(i / 2), lx = X + col * 130, ly = 88 + row * 25;
  return `<g class="item" style="animation-delay:${(0.2 + i * 0.08).toFixed(2)}s"><circle cx="${lx + 5}" cy="${ly - 4}" r="5" fill="${c}"/><text x="${lx + 17}" y="${ly}" class="name">${name}</text></g>`;
}).join('\n  ');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Most used languages: ${LANGS.map(l => l[0]).join(', ')}">
  <defs><clipPath id="bar"><rect x="${X}" y="${BY}" width="${BW}" height="8" rx="4"/></clipPath></defs>
  <style>
    .title { font: 600 18px ${FONT}; fill: #7a9cc6; }
    .name { font: 400 12px ${FONT}; fill: #c9d1d9; }
    .item { animation: in .4s ease-out both; }
    .grow { animation: grow .9s cubic-bezier(.2,.7,.2,1) both; transform-origin: ${X}px 0; }
    @keyframes in { from { opacity: 0 } to { opacity: 1 } }
    @keyframes grow { from { transform: scaleX(0) } to { transform: none } }
    @media (prefers-reduced-motion: reduce) { .item, .grow { animation: none } }
  </style>
  <rect width="${W}" height="${H}" rx="12" fill="#070a11"/>
  <text x="${X}" y="35" class="title">Most Used Languages</text>
  <g clip-path="url(#bar)"><g class="grow">${segs}</g></g>
  ${legend}
</svg>
`;
writeFileSync('assets/languages-card.svg', svg);
console.log('languages card:', LANGS.map(l => l[0]).join(', '));
