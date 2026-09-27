#!/usr/bin/env node
/**
 * Karigor Decore - placeholder asset generator (dev tool)
 * -------------------------------------------------------
 * Generates brand-styled placeholder SVGs referenced by the database seed:
 *   - public/seed-images/*.svg   (48 files used by backend/src/seed/data.js)
 *   - public/favicon.svg
 *
 * Usage:  npm run generate:placeholders
 * Safe to re-run - existing files are simply overwritten.
 * Replace the generated files with real photography from the admin dashboard.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const SEED_DIR = path.join(PUBLIC_DIR, 'seed-images');

const W = 1200;
const H = 900;
const BRONZE = '#ad8b52';

// ---------------------------------------------------------------------------
// Themes
// ---------------------------------------------------------------------------
const THEMES = {
  light: {
    bgA: '#fbfaf7',
    bgB: '#efe9dc',
    grid: 'rgba(22,23,27,0.05)',
    stroke: '#23242a',
    strokeSoft: 'rgba(22,23,27,0.38)',
    glassA: 'rgba(203,222,229,0.85)',
    glassB: 'rgba(233,241,244,0.85)',
    dim: 'rgba(22,23,27,0.08)',
    text: '#1d1e23',
    textSoft: 'rgba(29,30,35,0.55)',
  },
  dark: {
    bgA: '#202127',
    bgB: '#141519',
    grid: 'rgba(244,240,232,0.05)',
    stroke: '#e9e3d6',
    strokeSoft: 'rgba(244,240,232,0.42)',
    glassA: 'rgba(244,240,232,0.10)',
    glassB: 'rgba(244,240,232,0.04)',
    dim: 'rgba(244,240,232,0.10)',
    text: '#f4f0e8',
    textSoft: 'rgba(244,240,232,0.60)',
  },
};

// ---------------------------------------------------------------------------
// Tiny SVG string helpers
// ---------------------------------------------------------------------------
const rect = (x, y, w, h, attrs = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${attrs}/>`;
const line = (x1, y1, x2, y2, attrs = '') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${attrs}/>`;
const circle = (cx, cy, r, attrs = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" ${attrs}/>`;
const poly = (points, attrs = '') => `<polygon points="${points}" ${attrs}/>`;
const polyline = (points, attrs = '') => `<polyline points="${points}" ${attrs}/>`;
const pathEl = (d, attrs = '') => `<path d="${d}" ${attrs}/>`;
const glass = (x, y, w, h, rx = 0) => rect(x, y, w, h, `rx="${rx}" fill="url(#glassGrad)"`);
const shine = (x, y, w, h, o = 0.26) => {
  const s = Math.min(w, h) * 0.55;
  return poly(
    `${x + w},${y} ${x + w - s},${y} ${x + w * 0.2},${y + h} ${x},${y + h}`,
    `fill="rgba(255,255,255,${o})"`
  );
};
const ground = (t, cx = 600, rx = 460) =>
  `<ellipse cx="${cx}" cy="752" rx="${rx}" ry="16" fill="${t.dim}"/>`;

const escapeXml = (str) =>
  str.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

function frostDots(x, y, w, h, color) {
  let out = '';
  for (let r = 0; r < Math.floor(h / 42); r += 1)
    for (let c = 0; c < Math.floor(w / 42); c += 1)
      out += circle(x + 21 + c * 42, y + 21 + r * 42, 2.4, `fill="${color}"`);
  return out;
}

// ---------------------------------------------------------------------------
// Product motifs (light theme)
// ---------------------------------------------------------------------------
function slidingWindow(v, t) {
  const x = 180;
  const y = 150;
  const w = 840;
  const h = 560;
  const panes = v >= 3 ? 4 : v === 2 ? 3 : 2;
  const pw = w / panes;
  let s = ground(t);
  for (let i = 0; i < panes; i += 1) s += glass(x + i * pw, y, pw, h);
  s += shine(x, y, w, h);
  for (let i = 1; i < panes; i += 1)
    s += line(x + i * pw, y, x + i * pw, y + h, `stroke="${t.stroke}" stroke-width="10"`);
  s += rect(x, y, w, h, `fill="none" stroke="${t.stroke}" stroke-width="16"`);
  for (let i = 0; i < panes; i += 1)
    s += rect(x + i * pw + 9, y + 9, pw - 18, h - 18, `fill="none" stroke="${t.strokeSoft}" stroke-width="3"`);
  const cy = y + h / 2;
  for (let i = 0; i < panes; i += 1) {
    const cx = x + i * pw + pw / 2;
    const dir = i % 2 === 0 ? 1 : -1;
    s += pathEl(
      `M ${cx - 16 * dir} ${cy - 17} l ${16 * dir} 17 l ${-16 * dir} 17`,
      `fill="none" stroke="${BRONZE}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"`
    );
    s += pathEl(
      `M ${cx + 6 * dir} ${cy - 17} l ${16 * dir} 17 l ${-16 * dir} 17`,
      `fill="none" stroke="${BRONZE}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"`
    );
  }
  s += rect(x - 46, y + h + 10, w + 92, 24, `fill="${t.stroke}"`);
  s += rect(x - 62, y + h + 42, w + 124, 12, `rx="6" fill="${t.dim}"`);
  return s;
}

function casementWindow(v, t) {
  const x = 200;
  const y = 140;
  const w = 800;
  const h = 580;
  const topH = 130;
  const gap = 14;
  const by = y + topH + gap;
  const bh = h - topH - gap;
  const bW = (w - 12) / 2;
  const bars = v === 2 ? 2 : 1;
  let s = ground(t);
  // top awning sashes
  const tW = (w - 10) / 2;
  s += glass(x, y, tW, topH) + glass(x + tW + 10, y, tW, topH) + shine(x, y, w, topH, 0.18);
  s += line(x + tW + 5, y, x + tW + 5, y + topH, `stroke="${t.stroke}" stroke-width="10"`);
  // bottom casement sashes
  s += glass(x, by, bW, bh) + glass(x + bW + 12, by, bW, bh) + shine(x, by, w, bh, 0.22);
  for (let side = 0; side < 2; side += 1) {
    const sx = side === 0 ? x : x + bW + 12;
    for (let b = 1; b <= bars; b += 1) {
      const byy = by + (bh / (bars + 1)) * b;
      s += line(sx, byy, sx + bW, byy, `stroke="${t.strokeSoft}" stroke-width="5"`);
    }
    s += rect(sx + 7, by + 7, bW - 14, bh - 14, `fill="none" stroke="${t.strokeSoft}" stroke-width="3"`);
  }
  s += rect(x, y, w, h, `fill="none" stroke="${t.stroke}" stroke-width="16"`);
  s += line(x, y + topH + gap / 2, x + w, y + topH + gap / 2, `stroke="${t.stroke}" stroke-width="12"`);
  s += line(x + bW + 6, by, x + bW + 6, by + bh, `stroke="${t.stroke}" stroke-width="12"`);
  s += rect(x + bW - 3, by + bh / 2 - 40, 12, 80, `rx="6" fill="${BRONZE}"`);
  s += rect(x - 46, y + h + 10, w + 92, 24, `fill="${t.stroke}"`);
  s += rect(x - 62, y + h + 42, w + 124, 12, `rx="6" fill="${t.dim}"`);
  return s;
}

function aluDoor(v, t) {
  const x = 430;
  const y = 120;
  const w = 340;
  const h = 640;
  let s = ground(t, 600, 300);
  s += glass(x, y, w, h);
  const slotH = 96;
  const top = y + 70;
  for (let i = 0; i < 3; i += 1) {
    const sy = top + i * (slotH + 34);
    s += rect(x + 40, sy, w - 80, slotH, `fill="rgba(255,255,255,0.18)" stroke="${t.strokeSoft}" stroke-width="3"`);
  }
  s += shine(x, y, w, h, 0.18);
  s += rect(x, y, w, h, `fill="none" stroke="${t.stroke}" stroke-width="16"`);
  s += rect(x + 26, y + 24, w - 52, h - 48, `fill="none" stroke="${t.strokeSoft}" stroke-width="3"`);
  s += rect(x + w - 46, y + h / 2 - 60, 14, 120, `rx="7" fill="${BRONZE}"`);
  s += rect(x + 30, y + h - 96, w - 60, 44, `fill="${t.dim}"`);
  return s;
}

function framelessDoor(v, t) {
  const drawSlab = (x, y, w, h) => {
    let g = glass(x, y, w, h);
    g += shine(x, y, w, h, 0.2);
    g += line(x + 8, y, x + 8, y + h, `stroke="${t.strokeSoft}" stroke-width="2"`);
    g += line(x, y + h - 8, x + w, y + h - 8, `stroke="${t.strokeSoft}" stroke-width="2"`);
    g += rect(x, y, w, h, `fill="none" stroke="${t.stroke}" stroke-width="7"`);
    return g;
  };
  let s = ground(t, 600, 380);
  if (v === 2) {
    s += drawSlab(400, 170, 190, 560);
    s += drawSlab(612, 170, 190, 560);
    s += glass(400, 108, 402, 44);
    s += rect(400, 108, 402, 44, `fill="none" stroke="${t.stroke}" stroke-width="7"`);
    s += rect(596, 380, 10, 150, `rx="5" fill="${BRONZE}"`);
    s += rect(610, 380, 10, 150, `rx="5" fill="${BRONZE}"`);
  } else {
    const x = 470;
    const y = 130;
    const w = 260;
    const h = 620;
    s += drawSlab(x, y, w, h);
    s += pathEl(`M ${x + w} ${y + h} A ${w} ${w} 0 0 0 ${x} ${y + h - w}`, `fill="none" stroke="${t.strokeSoft}" stroke-width="3" stroke-dasharray="12 9"`);
    s += rect(x + w - 40, y + h / 2 - 80, 12, 160, `rx="6" fill="${BRONZE}"`);
    s += rect(x + w / 2 - 20, y - 10, 40, 16, `fill="${t.stroke}"`);
    s += rect(x + w / 2 - 26, y + h + 6, 52, 16, `rx="4" fill="${t.stroke}"`);
  }
  return s;
}

function glassSheet(v, t) {
  const x = 380;
  const y = 230;
  const w = 520;
  const h = 440;
  const c = 26;
  let s = ground(t);
  s += rect(300, 160, 520, 480, `rx="10" fill="${t.dim}" stroke="${t.strokeSoft}" stroke-width="3"`);
  s += poly(
    `${x + c},${y} ${x + w - c},${y} ${x + w},${y + c} ${x + w},${y + h - c} ${x + w - c},${y + h} ${x + c},${y + h} ${x},${y + h - c} ${x},${y + c}`,
    `fill="url(#glassGrad)" stroke="${t.stroke}" stroke-width="7" stroke-linejoin="round"`
  );
  s += shine(x, y, w, h, 0.24);
  s += line(x + 10, y + 2, x + 10, y + h - 2, `stroke="${t.strokeSoft}" stroke-width="2"`);
  s += line(x + 2, y + h - 10, x + w - 2, y + h - 10, `stroke="${t.strokeSoft}" stroke-width="2"`);
  const bracket = (bx, by, dx, dy) =>
    polyline(`${bx + 40 * dx},${by} ${bx},${by} ${bx},${by + 40 * dy}`, `fill="none" stroke="${BRONZE}" stroke-width="7" stroke-linecap="round"`);
  s += bracket(x, y, 1, 1) + bracket(x + w, y, -1, 1) + bracket(x + w, y + h, -1, -1) + bracket(x, y + h, 1, -1);
  if (v === 2) s += rect(760, 600, 200, 110, `rx="8" fill="${t.dim}" stroke="${t.strokeSoft}" stroke-width="3"`);
  return s;
}

function frostedGlass(v, t) {
  const x = 320;
  const y = 170;
  const w = 560;
  const h = 520;
  let s = ground(t);
  s += glass(x, y, w, h);
  const fw = w * 0.46;
  s += rect(x, y, fw, h, `fill="rgba(255,255,255,0.42)"`);
  s += frostDots(x + 10, y + 10, fw - 20, h - 20, t.strokeSoft);
  s += shine(x + fw, y, w - fw, h, 0.22);
  s += line(x + fw, y, x + fw, y + h, `stroke="${t.stroke}" stroke-width="6" stroke-dasharray="14 10"`);
  s += rect(x, y, w, h, `fill="none" stroke="${t.stroke}" stroke-width="9"`);
  s += poly(`${x + w - 90},${y} ${x + w},${y} ${x + w},${y + 90}`, `fill="${BRONZE}" opacity="0.9"`);
  for (let i = 0; i < 5; i += 1) s += circle(x + 60 + i * 110, y + h + 34, 6, `fill="${t.strokeSoft}"`);
  return s;
}

function profiles(v, t) {
  const section = (x, y, w, h, rot) => {
    let g = `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})">`;
    g += rect(x, y, w, h, `rx="10" fill="${t.dim}" stroke="${t.stroke}" stroke-width="7"`);
    g += rect(x + 22, y + 22, w - 44, h - 44, `rx="6" fill="none" stroke="${t.strokeSoft}" stroke-width="4"`);
    g += line(x + w / 2, y + 10, x + w / 2, y + h - 10, `stroke="${t.strokeSoft}" stroke-width="3"`);
    g += line(x + 10, y + h / 2, x + w - 10, y + h / 2, `stroke="${t.strokeSoft}" stroke-width="3"`);
    g += '</g>';
    return g;
  };
  let s = ground(t);
  s += section(180, 210, 320, 180, -4);
  s += section(560, 170, 260, 150, 3);
  s += section(880, 240, 220, 130, -6);
  s += poly('230,620 950,580 1030,660 320,706', `fill="url(#glassGrad)" stroke="${t.stroke}" stroke-width="6" stroke-linejoin="round"`);
  for (let i = 1; i <= 4; i += 1) {
    const f = i / 5;
    s += line(230 + 90 * f, 620 + 86 * f, 950 + 80 * f, 580 + 80 * f, `stroke="${t.strokeSoft}" stroke-width="3"`);
  }
  s += line(230, 620, 320, 706, `stroke="${BRONZE}" stroke-width="6"`);
  return s;
}

function acpPanel(v, t) {
  const x = 290;
  const y = 230;
  const w = 620;
  const h = 430;
  let s = rect(430, 140, 560, 400, `rx="8" fill="${t.dim}" opacity="0.55"`);
  s += rect(x, y, w, h, `rx="8" fill="${t.dim}" stroke="${t.stroke}" stroke-width="8"`);
  s += rect(x + 16, y + 16, w - 32, h - 32, `rx="4" fill="none" stroke="${t.strokeSoft}" stroke-width="3" stroke-dasharray="16 10"`);
  [
    [x + 34, y + 34],
    [x + w - 34, y + 34],
    [x + 34, y + h - 34],
    [x + w - 34, y + h - 34],
  ].forEach(([sx, sy]) => {
    s += circle(sx, sy, 9, `fill="none" stroke="${t.stroke}" stroke-width="4"`);
    s += line(sx - 6, sy, sx + 6, sy, `stroke="${t.stroke}" stroke-width="3"`);
  });
  s += line(x + 40, y + h / 2, x + w - 40, y + h / 2, `stroke="${BRONZE}" stroke-width="4" opacity="0.55"`);
  s += polyline(`${x + w + 30},${y + 46} ${x + w + 110},${y + 46} ${x + w + 110},${y + 126}`, `fill="none" stroke="${BRONZE}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"`);
  s += rect(270, 700, 660, 10, `rx="5" fill="${t.dim}"`);
  return s;
}

function partition(v, t) {
  const x = 160;
  const y = 150;
  const w = 880;
  const h = 560;
  const bays = v === 2 ? 4 : 3;
  const bw = w / bays;
  const di = Math.floor(bays / 2);
  let s = ground(t);
  for (let i = 0; i < bays; i += 1) s += glass(x + i * bw, y, bw, h);
  s += rect(x, y + h * 0.42, w, 96, `fill="rgba(255,255,255,0.3)"`);
  s += line(x, y + h * 0.42 + 48, x + w, y + h * 0.42 + 48, `stroke="${t.strokeSoft}" stroke-width="3" stroke-dasharray="12 8"`);
  s += rect(x + di * bw + 8, y + 8, bw - 16, h - 16, `fill="rgba(22,23,27,0.10)" stroke="${t.strokeSoft}" stroke-width="3"`);
  s += rect(x + di * bw + bw - 52, y + h * 0.5, 10, 120, `rx="5" fill="${BRONZE}"`);
  s += circle(x + di * bw + bw / 2, y + 26, 6, `fill="${t.stroke}"`);
  for (let i = 0; i <= bays; i += 1) s += rect(x + i * bw - 6, y, 12, h, `fill="${t.stroke}"`);
  s += rect(x - 24, y - 26, w + 48, 18, `fill="${t.stroke}"`);
  s += rect(x - 24, y + h + 8, w + 48, 16, `fill="${t.stroke}"`);
  s += rect(x - 24, y + h + 34, w + 48, 10, `rx="5" fill="${t.dim}"`);
  return s;
}

function foldingPartition(v, t) {
  const y = 190;
  const h = 470;
  const pw = 178;
  const n = 4;
  const x0 = 208;
  const skew = 30;
  let s = rect(150, y - 30, 900, 18, `fill="${t.stroke}"`);
  for (let i = 0; i < n; i += 1) {
    const xa = x0 + i * (pw + 6);
    const sx = i % 2 === 0 ? skew : -skew;
    s += poly(
      `${xa + sx},${y} ${xa + pw + sx},${y} ${xa + pw},${y + h} ${xa},${y + h}`,
      `fill="url(#glassGrad)" stroke="${t.stroke}" stroke-width="6" stroke-linejoin="round"`
    );
    s += circle(xa + pw / 2 + sx / 2, y - 12, 9, `fill="${t.stroke}"`);
  }
  s += rect(760 + pw - 30, y + h / 2 - 60, 10, 120, `rx="5" fill="${BRONZE}"`);
  s += line(150, y + h + 26, 1050, y + h + 26, `stroke="${t.stroke}" stroke-width="8"`);
  s += rect(150, y + h + 46, 900, 12, `rx="6" fill="${t.dim}"`);
  return s;
}

function wallPanel(v, t) {
  const x0 = 220;
  const y = 190;
  const h = 470;
  const sw = 100;
  const gap = 10;
  const n = 7;
  let s = '';
  for (let i = 0; i < n; i += 1) {
    const x = x0 + i * (sw + gap);
    s += rect(x, y, sw, h, `rx="4" fill="${i % 2 === 0 ? 'rgba(22,23,27,0.07)' : 'url(#glassGrad)'}" stroke="${t.strokeSoft}" stroke-width="3"`);
    s += line(x + sw / 2, y + 14, x + sw / 2, y + h - 14, `stroke="${t.strokeSoft}" stroke-width="2" opacity="0.6"`);
  }
  s += line(x0 - 20, y + h * 0.48, x0 + n * (sw + gap) - gap + 20, y + h * 0.48, `stroke="${t.strokeSoft}" stroke-width="4"`);
  s += rect(x0 - 20, y - 26, n * (sw + gap) - gap + 40, 8, `rx="4" fill="${BRONZE}"`);
  s += rect(x0 - 20, y - 36, n * (sw + gap) - gap + 40, 22, `rx="11" fill="${BRONZE}" opacity="0.16"`);
  s += rect(x0 - 6, y + h + 10, n * (sw + gap) - gap + 12, 12, `rx="6" fill="${t.dim}"`);
  return s;
}

function ceiling(v, t) {
  const x = 270;
  const y = 200;
  const w = 660;
  const h = 460;
  let s = rect(x, y, w, h, `rx="10" fill="${t.dim}" stroke="${t.stroke}" stroke-width="9"`);
  s += rect(x + 70, y + 70, w - 140, h - 140, `rx="26" fill="url(#glassGrad)" stroke="${t.stroke}" stroke-width="5"`);
  s += line(x, y, x + 70, y + 70, `stroke="${t.strokeSoft}" stroke-width="3"`);
  s += line(x + w, y, x + w - 70, y + 70, `stroke="${t.strokeSoft}" stroke-width="3"`);
  s += line(x, y + h, x + 70, y + h - 70, `stroke="${t.strokeSoft}" stroke-width="3"`);
  s += line(x + w, y + h, x + w - 70, y + h - 70, `stroke="${t.strokeSoft}" stroke-width="3"`);
  [0.3, 0.7].forEach((fy) => {
    [x + 140, x + w / 2, x + w - 140].forEach((cx) => {
      s += circle(cx, y + h * fy, 17, `fill="none" stroke="${BRONZE}" stroke-width="5"`);
      s += circle(cx, y + h * fy, 6, `fill="${BRONZE}"`);
    });
  });
  s += circle(x + w / 2, y + h / 2, 30, `fill="none" stroke="${t.stroke}" stroke-width="6"`);
  s += line(x + w / 2 - 44, y + h / 2, x + w / 2 + 44, y + h / 2, `stroke="${t.stroke}" stroke-width="4"`);
  s += line(x + w / 2, y + h / 2 - 44, x + w / 2, y + h / 2 + 44, `stroke="${t.stroke}" stroke-width="4"`);
  return s;
}

function customWindow(v, t) {
  let s = '';
  if (v === 2) {
    const yT = 220;
    const yB = 650;
    s += poly('340,262 480,220 480,650 340,692', `fill="url(#glassGrad)" stroke="${t.stroke}" stroke-width="8" stroke-linejoin="round"`);
    s += poly('720,220 860,262 860,692 720,650', `fill="url(#glassGrad)" stroke="${t.stroke}" stroke-width="8" stroke-linejoin="round"`);
    s += rect(488, yT - 12, 224, yB - yT + 24, `fill="url(#glassGrad)"`);
    s += shine(488, yT - 12, 224, yB - yT + 24, 0.22);
    s += line(600, yT - 12, 600, yB + 12, `stroke="${t.strokeSoft}" stroke-width="4"`);
    s += rect(488, yT - 12, 224, yB - yT + 24, `fill="none" stroke="${t.stroke}" stroke-width="9"`);
    s += pathEl('M500 700 A 190 190 0 0 1 352 700', `fill="none" stroke="${BRONZE}" stroke-width="4" stroke-dasharray="10 8"`);
    s += pathEl('M700 700 A 190 190 0 0 0 848 700', `fill="none" stroke="${BRONZE}" stroke-width="4" stroke-dasharray="10 8"`);
    s += rect(320, 700, 560, 18, `rx="9" fill="${t.dim}"`);
  } else {
    const x = 350;
    const w = 500;
    const yS = 430;
    const yB = 650;
    s += pathEl(`M${x} ${yB} L${x} ${yS} A250 250 0 0 1 ${x + w} ${yS} L${x + w} ${yB} Z`, `fill="url(#glassGrad)"`);
    s += shine(x, yS, w, yB - yS, 0.2);
    s += pathEl(`M${x} ${yB} L${x} ${yS} A250 250 0 0 1 ${x + w} ${yS} L${x + w} ${yB} Z`, `fill="none" stroke="${t.stroke}" stroke-width="14"`);
    s += line(x + w / 3, yS, x + w / 3, yB, `stroke="${t.stroke}" stroke-width="8"`);
    s += line(x + (2 * w) / 3, yS, x + (2 * w) / 3, yB, `stroke="${t.stroke}" stroke-width="8"`);
    s += line(600, 180, 600, yS, `stroke="${t.stroke}" stroke-width="8"`);
    s += line(600, yS, 423, 253, `stroke="${t.strokeSoft}" stroke-width="6"`);
    s += line(600, yS, 777, 253, `stroke="${t.strokeSoft}" stroke-width="6"`);
    s += line(x, yS, x + w, yS, `stroke="${t.stroke}" stroke-width="8"`);
    s += rect(x - 46, yB + 10, w + 92, 24, `fill="${t.stroke}"`);
    s += rect(300, 694, 600, 12, `rx="6" fill="${t.dim}"`);
  }
  return s;
}

function railing(v, t) {
  const y = 380;
  const h = 300;
  const posts = [200, 580, 960];
  let s = '';
  for (let i = 0; i < posts.length - 1; i += 1) {
    const x1 = posts[i] + 12;
    const x2 = posts[i + 1] - 12;
    s += rect(x1, y + 26, x2 - x1, h - 70, `fill="url(#glassGrad)" stroke="${t.strokeSoft}" stroke-width="3"`);
    s += shine(x1, y + 26, x2 - x1, h - 70, 0.18);
    const mid = (x1 + x2) / 2;
    s += rect(mid - 16, y + h - 44, 32, 44, `fill="${t.stroke}"`);
  }
  s += rect(150, y, 900, 28, `rx="14" fill="${t.stroke}"`);
  s += line(170, y + 14, 1030, y + 14, `stroke="${BRONZE}" stroke-width="4" opacity="0.7"`);
  posts.forEach((px) => {
    s += rect(px - 9, y + 14, 18, h - 14, `fill="${t.stroke}"`);
  });
  s += rect(150, y + h + 6, 900, 12, `rx="6" fill="${t.dim}"`);
  return s;
}

// ---------------------------------------------------------------------------
// Project motifs (light theme)
// ---------------------------------------------------------------------------
function house(v, t) {
  const bx = 320;
  const by = 350;
  const bw = 560;
  const bh = 310;
  const cols = v === 2 ? 4 : 3;
  const cw = 84;
  const ch = 96;
  const gx = (bw - cols * cw) / (cols + 1);
  let s = circle(985, 210, 54, `fill="none" stroke="${BRONZE}" stroke-width="6"`);
  // tree
  s += rect(196, 560, 12, 100, `fill="${t.strokeSoft}"`);
  s += circle(202, 520, 62, `fill="${t.dim}"`);
  // optional upper floor
  if (v === 3) {
    s += rect(400, 236, 400, 114, `fill="${t.dim}" stroke="${t.stroke}" stroke-width="8"`);
    for (let i = 0; i < 3; i += 1)
      s += rect(444 + i * 120, 262, 72, 62, `fill="url(#glassGrad)" stroke="${t.strokeSoft}" stroke-width="3"`);
    s += rect(280, 216, 640, 20, `fill="${t.stroke}"`);
  }
  // main volume
  s += rect(bx, by, bw, bh, `fill="${t.dim}" stroke="${t.stroke}" stroke-width="9"`);
  s += rect(bx - 26, by - 28, bw + 52, 26, `fill="${t.stroke}"`);
  // windows
  for (let r = 0; r < 2; r += 1)
    for (let c = 0; c < cols; c += 1) {
      const wx = bx + gx + c * (cw + gx);
      const wy = by + 66 + r * (ch + 44);
      s += rect(wx, wy, cw, ch, `fill="url(#glassGrad)" stroke="${t.stroke}" stroke-width="5"`);
      s += line(wx + cw / 2, wy, wx + cw / 2, wy + ch, `stroke="${t.strokeSoft}" stroke-width="3"`);
    }
  // entry
  s += rect(560, by + bh - 64, 120, 64, `fill="url(#glassGrad)" stroke="${t.stroke}" stroke-width="6"`);
  s += rect(614, by + bh - 40, 8, 40, `rx="4" fill="${BRONZE}"`);
  s += rect(240, 664, 720, 12, `rx="6" fill="${t.dim}"`);
  return s;
}

function luxuryHouse(v, t) {
  const x = 280;
  const y = 260;
  const w = 640;
  const h = 440;
  const cols = v === 2 ? 6 : 5;
  const cw = w / cols;
  let s = circle(980, 200, 46, `fill="none" stroke="${BRONZE}" stroke-width="6"`);
  for (let i = 0; i < cols; i += 1) {
    s += glass(x + i * cw, y + 20, cw, h - 40);
    s += shine(x + i * cw, y + 20, cw, h - 40, 0.1);
  }
  for (let i = 1; i < cols; i += 1)
    s += line(x + i * cw, y + 20, x + i * cw, y + h - 20, `stroke="${t.strokeSoft}" stroke-width="4"`);
  s += rect(x - 20, y + h / 2 - 12, w + 40, 24, `fill="${t.stroke}"`);
  s += rect(x - (v === 2 ? 80 : 30), y - 14, w + (v === 2 ? 80 : 60), 34, `fill="${t.stroke}"`);
  s += rect(x - 40, y + h + 6, w + 80, 22, `rx="6" fill="${t.dim}"`);
  return s;
}

function storefront(v, t) {
  const x = 170;
  const w = 860;
  const yB = 690;
  const bays = v === 2 ? 5 : 4;
  const bw = w / bays;
  let s = rect(x, 150, w, 120, `fill="${t.dim}" stroke="${t.strokeSoft}" stroke-width="3"`);
  for (let i = 0; i < bays * 2; i += 1)
    s += line(x + (i + 1) * (w / (bays * 2)), 156, x + (i + 1) * (w / (bays * 2)), 264, `stroke="${t.strokeSoft}" stroke-width="2"`);
  s += rect(x, 268, w, 10, `fill="${BRONZE}" opacity="0.85"`);
  for (let i = 0; i < bays; i += 1) {
    s += glass(x + i * bw + 6, 284, bw - 12, yB - 284);
    s += shine(x + i * bw + 6, 284, bw - 12, yB - 284, 0.12);
  }
  const dx = x + (bays - 1) * bw + 6;
  const dw = bw - 12;
  s += rect(dx, 284, dw, yB - 284, `fill="rgba(22,23,27,0.1)" stroke="${t.stroke}" stroke-width="6"`);
  s += line(dx + dw / 2, 300, dx + dw / 2, yB, `stroke="${t.stroke}" stroke-width="6"`);
  s += rect(dx + dw / 2 - 16, 470, 9, 110, `rx="4" fill="${BRONZE}"`);
  s += rect(dx + dw / 2 + 7, 470, 9, 110, `rx="4" fill="${BRONZE}"`);
  for (let i = 1; i < bays; i += 1) s += rect(x + i * bw - 5, 284, 10, yB - 284, `fill="${t.stroke}"`);
  s += rect(x, 284, w, yB - 284, `fill="none" stroke="${t.stroke}" stroke-width="10"`);
  s += rect(x - 10, yB + 6, w + 20, 18, `rx="6" fill="${t.dim}"`);
  return s;
}

function tower(v, t) {
  const x = 430;
  const y = 120;
  const w = 340;
  const h = 570;
  const cols = 3;
  const rows = 9;
  const cw = 78;
  const chh = 40;
  const gx = (w - cols * cw) / (cols + 1);
  let s = rect(230, 470, 180, 220, `fill="${t.dim}" stroke="${t.strokeSoft}" stroke-width="4"`);
  s += rect(790, 520, 180, 170, `fill="${t.dim}" stroke="${t.strokeSoft}" stroke-width="4"`);
  for (let r = 0; r < 3; r += 1)
    for (let c = 0; c < 2; c += 1) {
      s += rect(252 + c * 84, 496 + r * 62, 60, 40, `fill="url(#glassGrad)" stroke="${t.strokeSoft}" stroke-width="2"`);
      s += rect(812 + c * 84, 546 + r * 46, 60, 30, `fill="url(#glassGrad)" stroke="${t.strokeSoft}" stroke-width="2"`);
    }
  s += rect(x, y, w, h, `fill="${t.dim}" stroke="${t.stroke}" stroke-width="9"`);
  s += rect(x - 18, y - 20, w + 36, 22, `fill="${t.stroke}"`);
  for (let r = 0; r < rows; r += 1)
    for (let c = 0; c < cols; c += 1) {
      const wx = x + gx + c * (cw + gx);
      const wy = y + 40 + r * 56;
      s += rect(wx, wy, cw, chh, `fill="url(#glassGrad)" stroke="${t.strokeSoft}" stroke-width="2"`);
      s += line(wx + cw / 2, wy, wx + cw / 2, wy + chh, `stroke="${t.strokeSoft}" stroke-width="2"`);
    }
  s += rect(x, y, 46, h, `fill="rgba(22,23,27,0.12)"`);
  s += rect(180, 694, 840, 12, `rx="6" fill="${t.dim}"`);
  return s;
}

function officeScene(v, t) {
  const bays = v === 3 ? 4 : 3;
  const x = 220;
  const y = 150;
  const w = 760;
  const h = 420;
  const bw = w / bays;
  let s = '';
  for (let i = 0; i < bays; i += 1) s += glass(x + i * bw, y, bw, h);
  s += rect(x, y + h * 0.38, w, 70, `fill="rgba(255,255,255,0.28)"`);
  for (let i = 1; i < bays; i += 1) s += rect(x + i * bw - 5, y, 10, h, `fill="${t.stroke}"`);
  s += rect(x, y, w, h, `fill="none" stroke="${t.stroke}" stroke-width="12"`);
  s += rect(x - 20, y - 22, w + 40, 16, `fill="${t.stroke}"`);
  s += rect(x + 14, y + 20, bw - 28, h - 40, `fill="rgba(22,23,27,0.08)" stroke="${t.strokeSoft}" stroke-width="3"`);
  s += rect(x + bw - 54, y + 180, 9, 96, `rx="4" fill="${BRONZE}"`);
  const desks = v === 3 ? 3 : 2;
  for (let i = 0; i < desks; i += 1) {
    const dx = 300 + i * 220;
    s += rect(dx, 600, 180, 16, `rx="6" fill="${t.stroke}"`);
    s += rect(dx + 14, 616, 10, 46, `fill="${t.stroke}"`);
    s += rect(dx + 156, 616, 10, 46, `fill="${t.stroke}"`);
    s += rect(dx + 58, 566, 64, 34, `rx="6" fill="none" stroke="${t.stroke}" stroke-width="5"`);
  }
  s += rect(x - 20, 662, w + 40, 10, `rx="5" fill="${t.dim}"`);
  return s;
}

function doorsScene(v, t) {
  const doors = v === 2 ? 2 : 3;
  let s = rect(180, 140, 840, 110, `fill="${t.dim}" stroke="${t.strokeSoft}" stroke-width="3"`);
  for (let i = 0; i < 6; i += 1) s += line(300 + i * 116, 140, 300 + i * 116, 250, `stroke="${t.strokeSoft}" stroke-width="2"`);
  s += rect(180, 254, 840, 10, `fill="${BRONZE}" opacity="0.8"`);
  const dw = 200;
  const gap = 60;
  const total = doors * dw + (doors - 1) * gap;
  const startX = 600 - total / 2;
  for (let i = 0; i < doors; i += 1) {
    const dx = startX + i * (dw + gap);
    s += glass(dx, 300, dw, 360);
    s += rect(dx + 16, 320, dw - 32, 150, `fill="rgba(255,255,255,0.16)" stroke="${t.strokeSoft}" stroke-width="3"`);
    s += shine(dx, 300, dw, 360, 0.14);
    s += line(dx + dw / 2, 316, dx + dw / 2, 644, `stroke="${t.strokeSoft}" stroke-width="4"`);
    s += rect(dx + dw / 2 - 30, 460, 8, 90, `rx="4" fill="${BRONZE}"`);
    s += rect(dx + dw / 2 + 22, 460, 8, 90, `rx="4" fill="${BRONZE}"`);
    s += rect(dx, 300, dw, 360, `fill="none" stroke="${t.stroke}" stroke-width="11"`);
  }
  s += rect(startX - 40, 672, total + 80, 16, `rx="8" fill="${t.dim}"`);
  return s;
}

function interiorScene(v, t) {
  const strips = v === 2 ? 7 : 6;
  const x0 = 280;
  const wTop = 640;
  const y = 180;
  const h = 400;
  const sw = wTop / strips;
  let s = '';
  for (let i = 0; i < strips; i += 1)
    s += rect(x0 + i * sw, y, sw, h, `fill="${i % 2 === 0 ? 'rgba(22,23,27,0.08)' : 'url(#glassGrad)'}" stroke="${t.strokeSoft}" stroke-width="2"`);
  s += rect(548, 240, 104, 120, `fill="${t.dim}" stroke="${BRONZE}" stroke-width="5"`);
  s += polyline('566,336 600,282 626,318 644,300', `fill="none" stroke="${t.strokeSoft}" stroke-width="4"`);
  const pn = v === 2 ? 4 : 3;
  for (let i = 0; i < pn; i += 1) {
    const px = 360 + i * (480 / (pn - 1));
    s += line(px, 120, px, 250, `stroke="${t.strokeSoft}" stroke-width="4"`);
    s += poly(`${px - 26},250 ${px + 26},250 ${px + 16},286 ${px - 16},286`, `fill="${t.stroke}"`);
    s += circle(px, 300, 10, `fill="${BRONZE}" opacity="0.9"`);
  }
  s += rect(492, 392, 216, 56, `rx="16" fill="url(#glassGrad)" stroke="${t.stroke}" stroke-width="8"`);
  s += line(600, 392, 600, 448, `stroke="${t.strokeSoft}" stroke-width="3"`);
  s += rect(472, 448, 256, 56, `rx="14" fill="url(#glassGrad)" stroke="${t.stroke}" stroke-width="8"`);
  s += rect(452, 414, 44, 92, `rx="12" fill="${t.stroke}"`);
  s += rect(704, 414, 44, 92, `rx="12" fill="${t.stroke}"`);
  s += rect(486, 540, 14, 30, `fill="${t.stroke}"`);
  s += rect(700, 540, 14, 30, `fill="${t.stroke}"`);
  s += rect(240, 578, 720, 10, `rx="5" fill="${t.dim}"`);
  return s;
}

// ---------------------------------------------------------------------------
// Homepage motifs
// ---------------------------------------------------------------------------
function hero(v, t) {
  const towers = [
    [280, 260, 260, 540],
    [560, 170, 250, 630],
    [830, 320, 200, 480],
  ];
  const lit = [
    [320, 300], [400, 340], [480, 300], [340, 420], [460, 460],
    [610, 220], [690, 260], [760, 210], [640, 340], [720, 420], [670, 520], [750, 560],
    [870, 380], [930, 430], [900, 520], [960, 570],
  ];
  let s = circle(180, 210, 110, `fill="${BRONZE}" opacity="0.10"`);
  s += circle(180, 210, 62, `fill="${BRONZE}" opacity="0.85"`);
  towers.forEach(([x, y, w, h]) => {
    s += rect(x, y, w, h, `fill="rgba(244,240,232,0.05)" stroke="${t.strokeSoft}" stroke-width="3"`);
    for (let mx = x + 60; mx < x + w; mx += 60)
      s += line(mx, y + 14, mx, y + h, `stroke="rgba(244,240,232,0.14)" stroke-width="2"`);
    for (let my = y + 56; my < y + h; my += 56)
      s += line(x, my, x + w, my, `stroke="rgba(244,240,232,0.10)" stroke-width="2"`);
  });
  lit.forEach(([lx, ly]) => {
    s += rect(lx, ly, 26, 16, `rx="2" fill="${BRONZE}" opacity="0.9"`);
  });
  s += rect(120, 800, 960, 4, `fill="${BRONZE}" opacity="0.5"`);
  s += rect(120, 804, 960, 40, `fill="rgba(0,0,0,0.35)"`);
  return s;
}

function workshop(v, t) {
  let s = rect(250, 180, 280, 200, `fill="${t.dim}" stroke="${t.strokeSoft}" stroke-width="4"`);
  for (let r = 0; r < 4; r += 1)
    for (let c = 0; c < 6; c += 1) s += circle(282 + c * 42, 214 + r * 42, 3.5, `fill="${BRONZE}" opacity="0.8"`);
  s += line(770, 120, 770, 240, `stroke="${t.strokeSoft}" stroke-width="4"`);
  s += poly('730,240 810,240 796,280 744,280', `fill="${t.stroke}"`);
  s += circle(770, 296, 12, `fill="${BRONZE}" opacity="0.9"`);
  s += circle(770, 310, 34, `fill="${BRONZE}" opacity="0.12"`);
  s += rect(430, 340, 330, 200, `fill="url(#glassGrad)" stroke="${t.stroke}" stroke-width="10"`);
  s += shine(430, 340, 330, 200, 0.18);
  s += line(595, 340, 595, 540, `stroke="${t.stroke}" stroke-width="8"`);
  s += line(430, 440, 760, 440, `stroke="${t.stroke}" stroke-width="6"`);
  for (let i = 0; i < 4; i += 1)
    s += rect(292, 532 - i * 14, 140, 8, `rx="4" fill="${i % 2 === 0 ? BRONZE : t.stroke}" opacity="${i % 2 === 0 ? 0.85 : 0.7}"`);
  s += rect(220, 540, 760, 34, `rx="6" fill="${t.stroke}"`);
  s += rect(272, 574, 24, 106, `fill="${t.stroke}"`);
  s += rect(904, 574, 24, 106, `fill="${t.stroke}"`);
  s += rect(180, 684, 840, 10, `rx="5" fill="${t.dim}"`);
  return s;
}

// ---------------------------------------------------------------------------
// Service medallion motifs (dark theme)
// ---------------------------------------------------------------------------
function medallion(t, inner) {
  let s = circle(600, 400, 252, `fill="none" stroke="${BRONZE}" stroke-width="7" opacity="0.95"`);
  s += circle(600, 400, 212, `fill="none" stroke="${t.strokeSoft}" stroke-width="3" stroke-dasharray="2 10" stroke-linecap="round"`);
  return s + inner;
}

function svcFabricate(v, t) {
  let s = circle(600, 400, 92, `fill="none" stroke="${t.stroke}" stroke-width="9"`);
  for (let i = 0; i < 8; i += 1) {
    s += `<g transform="rotate(${i * 45} 600 400)">${rect(586, 272, 28, 34, `rx="5" fill="none" stroke="${t.stroke}" stroke-width="8"`)}</g>`;
  }
  s += circle(600, 400, 30, `fill="none" stroke="${BRONZE}" stroke-width="9"`);
  s += line(600, 400, 600, 336, `stroke="${BRONZE}" stroke-width="8"`);
  s += line(680, 460, 745, 525, `stroke="${t.stroke}" stroke-width="11" stroke-linecap="round"`);
  s += line(753, 533, 771, 551, `stroke="${BRONZE}" stroke-width="15" stroke-linecap="round"`);
  return medallion(t, s);
}

function svcWindow(v, t) {
  let s = pathEl('M516 246 l 30 26 l -30 26', `fill="none" stroke="${BRONZE}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"`);
  s += glass(460, 300, 280, 200, 8);
  s += shine(460, 300, 280, 200, 0.18);
  s += rect(460, 300, 280, 200, `rx="8" fill="none" stroke="${t.stroke}" stroke-width="10"`);
  s += line(600, 300, 600, 500, `stroke="${t.stroke}" stroke-width="8"`);
  s += line(460, 400, 740, 400, `stroke="${t.stroke}" stroke-width="8"`);
  s += rect(430, 512, 340, 16, `rx="8" fill="${t.stroke}"`);
  return medallion(t, s);
}

function svcGlass(v, t) {
  let s = poly('600,262 762,400 600,538 438,400', `fill="url(#glassGrad)" stroke="${t.stroke}" stroke-width="9" stroke-linejoin="round"`);
  s += line(540, 400, 600, 340, `stroke="${BRONZE}" stroke-width="6" stroke-linecap="round"`);
  s += pathEl('M600 546 C 584 576 572 592 600 612 C 628 592 616 576 600 546 Z', `fill="none" stroke="${t.stroke}" stroke-width="7" stroke-linejoin="round"`);
  s += pathEl('M556 632 q 22 12 44 0', `fill="none" stroke="${t.strokeSoft}" stroke-width="5" stroke-linecap="round"`);
  return medallion(t, s);
}

function svcDesign(v, t) {
  let s = circle(600, 268, 15, `fill="none" stroke="${BRONZE}" stroke-width="8"`);
  s += line(600, 283, 522, 560, `stroke="${t.stroke}" stroke-width="11" stroke-linecap="round"`);
  s += line(600, 283, 678, 560, `stroke="${t.stroke}" stroke-width="11" stroke-linecap="round"`);
  s += pathEl('M522 566 A 170 170 0 0 0 678 566', `fill="none" stroke="${BRONZE}" stroke-width="5" stroke-dasharray="10 9"`);
  s += polyline('700,470 760,470 760,530', `fill="none" stroke="${t.strokeSoft}" stroke-width="5" stroke-linejoin="round"`);
  return medallion(t, s);
}

function svcDoor(v, t) {
  let s = rect(520, 258, 160, 300, `rx="6" fill="url(#glassGrad)" stroke="${t.stroke}" stroke-width="10"`);
  s += rect(540, 278, 120, 130, `fill="rgba(255,255,255,0.15)" stroke="${t.strokeSoft}" stroke-width="3"`);
  s += circle(660, 420, 9, `fill="${BRONZE}"`);
  s += rect(534, 460, 132, 74, `fill="${t.dim}"`);
  s += pathEl('M520 558 A 160 160 0 0 1 680 398', `fill="none" stroke="${BRONZE}" stroke-width="4" stroke-dasharray="9 8"`);
  return medallion(t, s);
}

function svcPartition(v, t) {
  let s = rect(470, 272, 104, 268, `fill="url(#glassGrad)" stroke="${t.stroke}" stroke-width="8"`);
  s += rect(626, 272, 104, 268, `fill="url(#glassGrad)" stroke="${t.stroke}" stroke-width="8"`);
  for (let r = 0; r < 7; r += 1)
    for (let c = 0; c < 3; c += 1) s += circle(646 + c * 32, 296 + r * 36, 2.6, `fill="${t.strokeSoft}"`);
  s += rect(440, 252, 320, 12, `rx="6" fill="${t.stroke}"`);
  s += rect(440, 548, 320, 12, `rx="6" fill="${t.stroke}"`);
  s += line(600, 272, 600, 540, `stroke="${BRONZE}" stroke-width="4" stroke-dasharray="8 7"`);
  return medallion(t, s);
}

function svcOffice(v, t) {
  let s = rect(490, 280, 220, 150, `rx="8" fill="url(#glassGrad)" stroke="${t.stroke}" stroke-width="10"`);
  s += polyline('528,392 566,352 598,376 636,330 672,358', `fill="none" stroke="${BRONZE}" stroke-width="6" stroke-linejoin="round"`);
  s += rect(588, 430, 24, 38, `fill="${t.stroke}"`);
  s += rect(540, 468, 120, 12, `rx="6" fill="${t.stroke}"`);
  s += rect(430, 480, 340, 16, `rx="8" fill="${t.stroke}"`);
  return medallion(t, s);
}

function svcShower(v, t) {
  let s = rect(492, 262, 44, 296, `fill="url(#glassGrad)" stroke="${t.stroke}" stroke-width="7"`);
  s += rect(486, 292, 10, 26, `fill="${BRONZE}"`);
  s += rect(486, 496, 10, 26, `fill="${BRONZE}"`);
  s += line(556, 262, 690, 262, `stroke="${t.stroke}" stroke-width="10" stroke-linecap="round"`);
  s += rect(676, 252, 104, 20, `rx="10" fill="none" stroke="${t.stroke}" stroke-width="9"`);
  [700, 730, 760].forEach((dx) => {
    s += line(dx, 296, dx, 430, `stroke="${BRONZE}" stroke-width="5" stroke-dasharray="3 18" stroke-linecap="round"`);
  });
  s += line(470, 566, 780, 566, `stroke="${t.stroke}" stroke-width="8" stroke-linecap="round"`);
  s += rect(608, 558, 44, 8, `rx="4" fill="${t.dim}"`);
  return medallion(t, s);
}

function svcInterior(v, t) {
  let s = rect(548, 240, 104, 120, `fill="${t.dim}" stroke="${BRONZE}" stroke-width="5"`);
  s += polyline('566,336 600,282 626,318 644,300', `fill="none" stroke="${t.strokeSoft}" stroke-width="4"`);
  s += rect(492, 392, 216, 56, `rx="16" fill="url(#glassGrad)" stroke="${t.stroke}" stroke-width="8"`);
  s += line(600, 392, 600, 448, `stroke="${t.strokeSoft}" stroke-width="3"`);
  s += rect(472, 448, 256, 56, `rx="14" fill="url(#glassGrad)" stroke="${t.stroke}" stroke-width="8"`);
  s += rect(452, 414, 44, 92, `rx="12" fill="${t.stroke}"`);
  s += rect(704, 414, 44, 92, `rx="12" fill="${t.stroke}"`);
  s += rect(486, 540, 14, 30, `fill="${t.stroke}"`);
  s += rect(700, 540, 14, 30, `fill="${t.stroke}"`);
  return medallion(t, s);
}

function svcCustom(v, t) {
  const sparklePath = 'M600 246 C 612 330 634 352 716 380 C 634 408 612 430 600 514 C 588 430 566 408 484 380 C 566 352 588 330 600 246 Z';
  let s = pathEl(sparklePath, `fill="rgba(244,240,232,0.08)" stroke="${t.stroke}" stroke-width="8" stroke-linejoin="round"`);
  s += `<g transform="translate(730,272) scale(0.42) translate(-600,-380)">${pathEl(sparklePath, `fill="${BRONZE}"`)}</g>`;
  s += line(488, 590, 566, 590, `stroke="${BRONZE}" stroke-width="8" stroke-linecap="round"`);
  s += line(596, 590, 700, 590, `stroke="${BRONZE}" stroke-width="8" stroke-linecap="round"`);
  s += line(730, 590, 748, 590, `stroke="${BRONZE}" stroke-width="8" stroke-linecap="round"`);
  return medallion(t, s);
}

const MOTIF_FNS = {
  slidingWindow,
  casementWindow,
  aluDoor,
  framelessDoor,
  glassSheet,
  frostedGlass,
  profiles,
  acpPanel,
  partition,
  foldingPartition,
  wallPanel,
  ceiling,
  customWindow,
  railing,
  house,
  luxuryHouse,
  storefront,
  tower,
  officeScene,
  doorsScene,
  interiorScene,
  hero,
  workshop,
  svcFabricate,
  svcWindow,
  svcGlass,
  svcDesign,
  svcDoor,
  svcPartition,
  svcOffice,
  svcShower,
  svcInterior,
  svcCustom,
};

// ---------------------------------------------------------------------------
// Image inventory - must match backend/src/seed/data.js and seed.js
// ---------------------------------------------------------------------------
const IMAGES = [
  // Products (20)
  ['product-aluminum-sliding-window', 'slidingWindow'],
  ['product-aluminum-sliding-window-2', 'slidingWindow'],
  ['product-aluminum-sliding-window-3', 'slidingWindow'],
  ['product-upvc-casement-window', 'casementWindow'],
  ['product-upvc-casement-window-2', 'casementWindow'],
  ['product-aluminum-casement-door', 'aluDoor'],
  ['product-frameless-glass-door', 'framelessDoor'],
  ['product-frameless-glass-door-2', 'framelessDoor'],
  ['product-toughened-glass', 'glassSheet'],
  ['product-frosted-glass', 'frostedGlass'],
  ['product-aluminum-profiles', 'profiles'],
  ['product-acp-panel', 'acpPanel'],
  ['product-office-partition', 'partition'],
  ['product-office-partition-2', 'partition'],
  ['product-sliding-folding-partition', 'foldingPartition'],
  ['product-wall-panel', 'wallPanel'],
  ['product-gypsum-ceiling', 'ceiling'],
  ['product-custom-window', 'customWindow'],
  ['product-custom-window-2', 'customWindow'],
  ['product-glass-railing', 'railing'],
  // Services (10) - image name is derived from the service icon in seed.js
  ['service-fabricate', 'svcFabricate'],
  ['service-window', 'svcWindow'],
  ['service-glass', 'svcGlass'],
  ['service-design', 'svcDesign'],
  ['service-door', 'svcDoor'],
  ['service-partition', 'svcPartition'],
  ['service-office', 'svcOffice'],
  ['service-shower', 'svcShower'],
  ['service-interior', 'svcInterior'],
  ['service-custom', 'svcCustom'],
  // Projects (16)
  ['project-residential-windows', 'house'],
  ['project-residential-windows-2', 'house'],
  ['project-residential-windows-3', 'house'],
  ['project-office-partition', 'officeScene'],
  ['project-office-partition-2', 'officeScene'],
  ['project-office-partition-3', 'officeScene'],
  ['project-aluminum-doors', 'doorsScene'],
  ['project-aluminum-doors-2', 'doorsScene'],
  ['project-luxury-home-windows', 'luxuryHouse'],
  ['project-luxury-home-windows-2', 'luxuryHouse'],
  ['project-showroom-facade', 'storefront'],
  ['project-showroom-facade-2', 'storefront'],
  ['project-apartment-windows', 'tower'],
  ['project-hotel-interior', 'interiorScene'],
  ['project-hotel-interior-2', 'interiorScene'],
  ['project-hotel-interior-3', 'interiorScene'],
  // Homepage (2)
  ['hero-architecture', 'hero'],
  ['about-workshop', 'workshop'],
];

const LABEL_OVERRIDES = {
  'service-fabricate': 'Aluminum Fabrication',
  'service-window': 'Window Installation',
  'service-glass': 'Glass Installation',
  'service-design': 'Custom Window Design',
  'service-door': 'Custom Door Design',
  'service-partition': 'Glass Partition Installation',
  'service-office': 'Office Glass Solutions',
  'service-shower': 'Shower Glass Solutions',
  'service-interior': 'Interior Decoration',
  'service-custom': 'Custom Fabrication',
  'hero-architecture': 'Modern Architecture',
  'about-workshop': 'Our Fabrication Workshop',
};

function themeFor(name) {
  return name.startsWith('service-') || name === 'hero-architecture' ? THEMES.dark : THEMES.light;
}

function labelFor(name, variant) {
  const base = name.replace(/-[23]$/, '');
  let label = LABEL_OVERRIDES[base];
  if (!label) {
    label = base
      .replace(/^(product|service|project)-/, '')
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace(/\bUpvc\b/g, 'UPVC')
      .replace(/\bAcp\b/g, 'ACP');
  }
  if (variant > 1) label += ` - View ${variant}`;
  return label;
}

// ---------------------------------------------------------------------------
// SVG assembly
// ---------------------------------------------------------------------------
function buildSvg({ name, motif, variant, index, total }) {
  const fn = MOTIF_FNS[motif];
  if (!fn) throw new Error(`Unknown motif "${motif}" for image "${name}"`);
  const t = themeFor(name);
  const label = labelFor(name, variant);
  const body = fn(variant, t);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${escapeXml(label)} - Karigor Decore placeholder image">
  <title>${escapeXml(label)} - Karigor Decore placeholder</title>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${t.bgA}"/>
      <stop offset="1" stop-color="${t.bgB}"/>
    </linearGradient>
    <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${t.glassA}"/>
      <stop offset="1" stop-color="${t.glassB}"/>
    </linearGradient>
    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M60 0H0V60" fill="none" stroke="${t.grid}" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  ${body}
  <g font-family="'Sora','Inter',system-ui,sans-serif">
    <rect x="70" y="806" width="46" height="7" rx="3.5" fill="${BRONZE}"/>
    <text x="70" y="858" font-size="30" font-weight="600" fill="${t.text}">${escapeXml(label)}</text>
    <text x="1130" y="858" font-size="21" fill="${t.textSoft}" text-anchor="end">Karigor Decore - placeholder ${String(index).padStart(2, '0')} / ${total}</text>
  </g>
</svg>
`;
}

const FAVICON = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="Karigor Decore">
  <rect width="64" height="64" rx="14" fill="#16171b"/>
  <path d="M23 17v30M41 17L25.5 32.5 42 48" fill="none" stroke="#f4f0e8" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="45" y="14" width="7" height="7" rx="1.6" fill="#ad8b52"/>
</svg>
`;

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
fs.mkdirSync(SEED_DIR, { recursive: true });
const total = IMAGES.length;
IMAGES.forEach(([name, motif], i) => {
  const variantMatch = name.match(/-([23])$/);
  const variant = variantMatch ? parseInt(variantMatch[1], 10) : 1;
  const svg = buildSvg({ name, motif, variant, index: i + 1, total });
  fs.writeFileSync(path.join(SEED_DIR, `${name}.svg`), svg, 'utf8');
});
fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.svg'), FAVICON, 'utf8');

console.log(`[placeholders] Wrote ${total} seed images to public/seed-images/`);
console.log('[placeholders] Wrote public/favicon.svg');
