// Full-width neofetch card. Age comes from the BIRTHDATE env (YYYY-MM-DD, kept in a repo secret)
// so the date itself never lands in this public repo. Usage: BIRTHDATE=... node about.mjs <out.svg>
//: pixel-art K beside the info, and a last prompt that types and erases the intro (SMIL, works inside <img>)
import { writeFileSync } from 'node:fs';
const MONO = `'Cascadia Code', Consolas, 'SFMono-Regular', Menlo, 'Liberation Mono', monospace`;
const [, , OUT = "assets/about-v4.svg"] = process.argv;
const BIRTH = process.env.BIRTHDATE;
if (!/^\d{4}-\d{2}-\d{2}$/.test(BIRTH || "")) { console.log("BIRTHDATE not set, keeping the current card"); process.exit(0); }
const age = (() => {
  const [y, m, d] = BIRTH.split("-").map(Number), now = new Date();
  const had = now.getUTCMonth() + 1 > m || (now.getUTCMonth() + 1 === m && now.getUTCDate() >= d);
  return now.getUTCFullYear() - y - (had ? 0 : 1);
})();
const FS = 15, CW = 9; // font size and forced per-character advance (textLength keeps it exact)

const rows = [
  ['OS', 'Computer Engineering @ Insper (2023 – 2028)'],
  ['Host', 'São Paulo, Brazil'],
  ['Uptime', `${age} years`],
  ['Shell', 'Python · C · TypeScript · Java · SQL'],
  ['Focus', 'Cloud · Data · Cybersecurity · AI'],
  ['Certs', 'Google Cybersecurity · AWS Cloud Foundations · Cisco'],
  ['Locale', 'pt-BR (native) · en-US (C1) · de-DE (B1)'],
  ['Lived in', 'USA (4 years) · Canada (exchange)'],
];
const ART = ['X....X', 'X...X.', 'X..X..', 'XXX...', 'X..X..', 'X...X.', 'X....X'];
const MSGS = ["Hi, I'm Lucas", 'Computer Engineering @ Insper', 'Take your time.'];

const W = 900, X1 = 28, X0 = 290, TOP = 140, LH = 25;
const SW_Y = TOP + rows.length * LH - 8;
const H = SW_Y + 74;
const PROMPT_Y = H - 24, PX = X1 + 18 * CW; // "lucas@kamikawa:~$ " is 18 characters

// Timeline: type each message, hold, erase, pause
const TYPE = 0.075, ERASE = 0.035, HOLD = 1.8, PAUSE = 0.5;
const ev = []; let t = 0;
MSGS.forEach((m, i) => {
  for (let k = 0; k <= m.length; k++) { ev.push([t, i, k]); t += TYPE; }
  t += HOLD - TYPE;
  for (let k = m.length - 1; k >= 0; k--) { t += ERASE; ev.push([t, i, k]); }
  t += PAUSE;
});
const T = t;
const keyTimes = ev.map(e => (e[0] / T).toFixed(5)).join(';');
const clipAnim = i => ev.map(([, m, k]) => (m === i ? k * CW : 0)).join(';');
const curAnim = ev.map(([, , k]) => PX + k * CW).join(';');
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/'/g, '&#39;');

const rowsSvg = rows.map(([k, v], i) =>
  `<text x="${X0}" y="${TOP + i * LH}" class="row l" style="animation-delay:${(0.3 + i * 0.1).toFixed(2)}s"><tspan class="k">${k}</tspan><tspan class="v">: ${v}</tspan></text>`).join('\n  ');
const cell = 24, step = 28, ax = 60, ay = 96;
const artSvg = ART.flatMap((l, r) => [...l].map((ch, c) => ch === 'X'
  ? `<rect x="${ax + c * step}" y="${ay + r * step}" width="${cell}" height="${cell}" rx="4" fill="url(#artg)" class="px" style="animation-delay:${((r + c) * 0.05).toFixed(2)}s"/>`
  : `<rect x="${ax + c * step}" y="${ay + r * step}" width="${cell}" height="${cell}" rx="4" fill="rgba(255,255,255,0.025)"/>`)).join('\n  ');
const swatches = ['#070a11', '#12192a', '#1a2237', '#222e48', '#2f4a78', '#5b7db1', '#7a9cc6', '#c9d1d9']
  .map((c, i) => `<rect x="${X0 + i * 30}" y="${SW_Y}" width="30" height="14" fill="${c}"/>`).join('');
const msgsSvg = MSGS.map((m, i) => `<clipPath id="c${i}"><rect x="${PX}" y="${PROMPT_Y - 16}" height="22" width="0"><animate attributeName="width" dur="${T.toFixed(2)}s" repeatCount="indefinite" calcMode="discrete" keyTimes="${keyTimes}" values="${clipAnim(i)}"/></rect></clipPath>
  <text x="${PX}" y="${PROMPT_Y}" class="row msg" clip-path="url(#c${i})" textLength="${m.length * CW}" lengthAdjust="spacingAndGlyphs">${esc(m)}</text>`).join('\n  ');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Terminal card. Hi, I'm Lucas: Computer Engineering at Insper, São Paulo. Focus on cloud, data, cybersecurity and AI.">
  <defs><linearGradient id="artg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7a9cc6"/><stop offset="1" stop-color="#2f4a78"/></linearGradient></defs>
  <style>
    .row { font: 400 ${FS}px ${MONO}; }
    .k { fill: #7a9cc6; font-weight: 700; } .v { fill: #c9d1d9; }
    .msg { fill: #5b7db1; font-weight: 700; }
    .muted { font: 400 12.5px ${MONO}; fill: #6b7280; }
    .l { animation: in .45s ease-out both; }
    .px { animation: pop .4s ease-out both; transform-box: fill-box; transform-origin: center; }
    .cur { animation: blink 1s steps(1) infinite; }
    @keyframes in { from { opacity: 0; transform: translateX(-6px) } to { opacity: 1; transform: none } }
    @keyframes pop { from { opacity: 0; transform: scale(.4) } to { opacity: 1; transform: none } }
    @keyframes blink { 50% { opacity: 0 } }
    @media (prefers-reduced-motion: reduce) { .l, .cur, .px { animation: none } }
  </style>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="12" fill="#0b0f18" stroke="rgba(255,255,255,0.10)"/>
  <path d="M12 0.5 H${W - 12} a11.5 11.5 0 0 1 11.5 11.5 V36 H0.5 V12 a11.5 11.5 0 0 1 11.5 -11.5 Z" fill="#10151f"/>
  <line x1="0.5" y1="36" x2="${W - 0.5}" y2="36" stroke="rgba(255,255,255,0.08)"/>
  <circle cx="22" cy="18" r="6" fill="#ff5f57"/><circle cx="42" cy="18" r="6" fill="#febc2e"/><circle cx="62" cy="18" r="6" fill="#28c840"/>
  <text x="${W / 2}" y="23" class="muted" text-anchor="middle">lucas@kamikawa: ~</text>
  <text x="${X1}" y="68" class="row"><tspan fill="#28c840">lucas@kamikawa</tspan><tspan fill="#c9d1d9">:</tspan><tspan fill="#7a9cc6">~</tspan><tspan fill="#c9d1d9">$ neofetch</tspan></text>
  ${artSvg}
  <text x="${X0}" y="${TOP - 36}" class="row l" style="animation-delay:.2s"><tspan class="k">lucas</tspan><tspan class="v">@</tspan><tspan class="k">kamikawa</tspan></text>
  <text x="${X0}" y="${TOP - 18}" class="row l" fill="#3b4558" style="animation-delay:.25s">──────────────────────</text>
  ${rowsSvg}
  <g class="l" style="animation-delay:1.1s">${swatches}</g>
  <text x="${X1}" y="${PROMPT_Y}" class="row" textLength="${17 * CW}" lengthAdjust="spacingAndGlyphs"><tspan fill="#28c840">lucas@kamikawa</tspan><tspan fill="#c9d1d9">:</tspan><tspan fill="#7a9cc6">~</tspan><tspan fill="#c9d1d9">$</tspan></text>
  ${msgsSvg}
  <rect class="cur" x="${PX}" y="${PROMPT_Y - 13}" width="${CW}" height="17" fill="#c9d1d9"><animate attributeName="x" dur="${T.toFixed(2)}s" repeatCount="indefinite" calcMode="discrete" keyTimes="${keyTimes}" values="${curAnim}"/></rect>
</svg>
`;
writeFileSync(OUT, svg);
console.log(`card ${W}x${H}, uptime ${age} years`);
