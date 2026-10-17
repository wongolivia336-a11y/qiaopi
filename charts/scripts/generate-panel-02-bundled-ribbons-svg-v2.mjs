import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('charts/svg/panel-02-bundled-ribbons-v2.svg');
const W = 2950;
const H = 3404.3;

// P02 is a three-stage relationship field: source country -> remittance office -> receiving county.
// Width at the node ends remains proportional to the real record count. The intermediate
// contractions are intentionally editorial: they create a woven reading rhythm without
// introducing a second quantitative meaning.
const stageEdges = [
  { source: 832, office: 2077, count: 17735, fill: '#7E898A', opacity: .48, pinch: .42, pinch2: .63, bow: 210 },
  { source: 832, office: 1348, count: 5759, fill: '#8D887F', opacity: .36, pinch: .55, pinch2: .38, bow: -120 },
  { source: 1694, office: 1348, count: 4974, fill: '#8D887F', opacity: .36, pinch: .42, pinch2: .66, bow: 165 },
  { source: 1694, office: 2077, count: 4630, fill: '#A2A19B', opacity: .30, pinch: .64, pinch2: .42, bow: -190 },
  { source: 2183, office: 2077, count: 2340, fill: '#7E898A', opacity: .34, pinch: .40, pinch2: .70, bow: 125 },
  { source: 1694, office: 414, count: 1530, fill: '#B75245', opacity: .46, pinch: .58, pinch2: .36, bow: -150 },
  { source: 1694, office: 493, count: 1220, fill: '#8D887F', opacity: .32, pinch: .39, pinch2: .65, bow: 105 },
  { source: 1694, office: 563, count: 1136, fill: '#8D887F', opacity: .30, pinch: .58, pinch2: .38, bow: -80 },
  { source: 1694, office: 690, count: 974, fill: '#8D887F', opacity: .29, pinch: .42, pinch2: .68, bow: 80 },
  { source: 832, office: 974, count: 773, fill: '#8D887F', opacity: .29, pinch: .52, pinch2: .34, bow: -105 },
  { source: 2183, office: 808, count: 876, fill: '#A2A19B', opacity: .28, pinch: .43, pinch2: .67, bow: 160 },
  { source: 2183, office: 1348, count: 1333, fill: '#8D887F', opacity: .30, pinch: .60, pinch2: .41, bow: -170 },
  { source: 2183, office: 1072, count: 328, fill: '#A2A19B', opacity: .24, pinch: .42, pinch2: .66, bow: 95 },
  { source: 832, office: 750, count: 1, fill: '#A2A19B', opacity: .22, pinch: .55, pinch2: .45, bow: 65 },
  { source: 1694, office: 920, count: 742, fill: '#8D887F', opacity: .27, pinch: .40, pinch2: .60, bow: -130 },
  { source: 1694, office: 866, count: 835, fill: '#8D887F', opacity: .27, pinch: .62, pinch2: .40, bow: 115 },
];

const triads = [
  { office: 2077, county: 1798, count: 9483, fill: '#7E898A', opacity: .46, pinch: .40, pinch2: .66, bow: -230 },
  { office: 2077, county: 914, count: 5806, fill: '#7E898A', opacity: .37, pinch: .52, pinch2: .39, bow: 170 },
  { office: 1348, county: 914, count: 3980, fill: '#8D887F', opacity: .38, pinch: .42, pinch2: .68, bow: -135 },
  { office: 2077, county: 914, count: 3637, fill: '#A2A19B', opacity: .30, pinch: .64, pinch2: .42, bow: -95 },
  { office: 1348, county: 1798, count: 2724, fill: '#8D887F', opacity: .32, pinch: .56, pinch2: .38, bow: 185 },
  { office: 2077, county: 914, count: 1923, fill: '#7E898A', opacity: .30, pinch: .40, pinch2: .65, bow: 80 },
  { office: 1348, county: 914, count: 1917, fill: '#8D887F', opacity: .28, pinch: .62, pinch2: .42, bow: 120 },
  { office: 414, county: 914, count: 1267, fill: '#B75245', opacity: .78, pinch: .38, pinch2: .64, bow: 110 },
  { office: 493, county: 914, count: 1014, fill: '#8D887F', opacity: .27, pinch: .56, pinch2: .36, bow: -75 },
  { office: 1348, county: 914, count: 779, fill: '#8D887F', opacity: .26, pinch: .41, pinch2: .67, bow: -55 },
  { office: 750, county: 914, count: 766, fill: '#8D887F', opacity: .26, pinch: .59, pinch2: .40, bow: 155 },
  { office: 690, county: 914, count: 752, fill: '#8D887F', opacity: .26, pinch: .43, pinch2: .64, bow: -120 },
  { office: 2077, county: 2263, count: 748, fill: '#A2A19B', opacity: .26, pinch: .60, pinch2: .38, bow: 140 },
  { office: 1348, county: 1798, count: 730, fill: '#8D887F', opacity: .25, pinch: .42, pinch2: .65, bow: 95 },
  { office: 563, county: 914, count: 713, fill: '#8D887F', opacity: .25, pinch: .54, pinch2: .39, bow: -90 },
  { office: 1348, county: 2320, count: 669, fill: '#A2A19B', opacity: .24, pinch: .41, pinch2: .61, bow: -140 },
  { office: 808, county: 914, count: 656, fill: '#8D887F', opacity: .24, pinch: .62, pinch2: .41, bow: 125 },
  { office: 2077, county: 2320, count: 617, fill: '#A2A19B', opacity: .23, pinch: .39, pinch2: .66, bow: 185 },
];

// These spans are read back from the editable endpoint rails in Figma (309:221,
// 309:240, 309:269). A ribbon's endpoint is a sub-segment of the corresponding
// rail, so its width is count / nodeTotal * railWidth rather than an arbitrary
// visual stroke width.
const sourceRails = new Map([
  [832, { x0: 357.74, x1: 1306.16, total: 24274 }],
  [1694, { x0: 1331.13, x1: 2056.26, total: 18558 }],
  [2183, { x0: 2081.22, x1: 2285.00, total: 5216 }],
]);

const officeRails = new Map([
  [414, { x0: 385.77, x1: 443.18, total: 1568 }],
  [493, { x0: 468.14, x1: 517.50, total: 1349 }],
  [563, { x0: 542.35, x1: 584.44, total: 1150 }],
  [690, { x0: 671.69, x1: 707.77, total: 987 }],
  [750, { x0: 732.73, x1: 767.68, total: 955 }],
  [808, { x0: 792.64, x1: 825.20, total: 890 }],
  [866, { x0: 850.17, x1: 880.80, total: 839 }],
  [920, { x0: 905.76, x1: 934.47, total: 785 }],
  [974, { x0: 959.43, x1: 987.80, total: 777 }],
  [1072, { x0: 1060.75, x1: 1083.10, total: 610 }],
  [1348, { x0: 1108.07, x1: 1588.47, total: 13133 }],
  [2077, { x0: 1613.42, x1: 2541.54, total: 25374 }],
]);

const countyRails = new Map([
  [914, { x0: 381.46, x1: 1446.52, total: 27258 }],
  [1798, { x0: 1471.37, x1: 2124.23, total: 16709 }],
  [2263, { x0: 2234.63, x1: 2290.91, total: 1441 }],
  [2320, { x0: 2315.86, x1: 2354.78, total: 996 }],
]);

function nearestRail(rawX, rails) {
  return [...rails.entries()].reduce((best, entry) => {
    const distance = Math.abs(entry[0] - rawX);
    return !best || distance < best.distance ? { key: entry[0], rail: entry[1], distance } : best;
  }, null);
}

function assignSlots(items, key, rails, slotKey) {
  const groups = new Map();
  for (const item of items) {
    const match = nearestRail(item[key], rails);
    if (!match) throw new Error(`No endpoint rail for ${key}=${item[key]}`);
    item[`${slotKey}Rail`] = match;
    if (!groups.has(match.key)) groups.set(match.key, []);
    groups.get(match.key).push(item);
  }
  for (const [railKey, groupItems] of groups.entries()) {
    const rail = rails.get(railKey);
    const group = groupItems.slice().sort((a, b) => b.count - a.count);
    const railWidth = rail.x1 - rail.x0;
    const widths = group.map(item => Math.max(1.5, item.count / rail.total * railWidth));
    const visibleWidth = widths.reduce((sum, value) => sum + value, 0);
    let cursor = rail.x0 + Math.max(0, (railWidth - visibleWidth) / 2);
    group.forEach((item, index) => {
      const w = widths[index];
      item[slotKey] = { x: cursor + w / 2, width: w };
      cursor += w;
    });
  }
}

assignSlots(stageEdges, 'source', sourceRails, 'sourceSlot');
assignSlots(stageEdges, 'office', officeRails, 'officeSlot');
assignSlots(triads, 'office', officeRails, 'officeSlot');
assignSlots(triads, 'county', countyRails, 'countySlot');

function assignMidFactors(items, startKey, startRails, endKey, endRails) {
  const scores = items.map(item => {
    const start = nearestRail(item[startKey], startRails).rail;
    const end = nearestRail(item[endKey], endRails).rail;
    return Math.min(item.count / start.total, item.count / end.total);
  });
  const maxScore = Math.max(...scores, 0.0001);
  items.forEach((item, index) => {
    // One smooth middle peak, tied to the shared share of the two endpoint nodes.
    item.midFactor = 0.12 + 0.28 * Math.sqrt(scores[index] / maxScore);
  });
}

assignMidFactors(stageEdges, 'source', sourceRails, 'office', officeRails);
assignMidFactors(triads, 'office', officeRails, 'county', countyRails);

const smoothStep = t => t * t * (3 - 2 * t);
const round = value => Number(value.toFixed(2));

function smoothPath(points, moveCommand = 'M') {
  const first = points[0];
  let d = `${moveCommand} ${round(first.x)} ${round(first.y)}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const pPrev = points[i - 1] || p0;
    const pNext = points[i + 2] || p1;
    const c1 = { x: p0.x + (p1.x - pPrev.x) / 6, y: p0.y + (p1.y - pPrev.y) / 6 };
    const c2 = { x: p1.x - (pNext.x - p0.x) / 6, y: p1.y - (pNext.y - p0.y) / 6 };
    d += ` C ${round(c1.x)} ${round(c1.y)}, ${round(c2.x)} ${round(c2.y)}, ${round(p1.x)} ${round(p1.y)}`;
  }
  return d;
}

function fluidRibbon({ x0, y0, x1, y1, w0, w1, fill, opacity, midFactor, bow = 0 }) {
  const dy = y1 - y0;
  const dx = x1 - x0;
  const arc = Math.sign(dx || 1) * Math.min(240, Math.max(70, Math.abs(dx) * 0.16));
  const gentleS = Math.max(-80, Math.min(80, bow * 0.22));
  const tValues = [0, .25, .5, .75, 1];
  const left = [];
  const right = [];
  for (const t of tValues) {
    const eased = smoothStep(t);
    const centerX = x0 + dx * t + arc * Math.sin(Math.PI * t) + gentleS * Math.sin(2 * Math.PI * t);
    const centerY = y0 + dy * t;
    const baseWidth = w0 + (w1 - w0) * eased;
    const middleExpansion = Math.max(w0, w1) * midFactor * Math.sin(Math.PI * t) ** 1.6;
    const width = Math.max(1.5, baseWidth + middleExpansion);
    left.push({ x: centerX - width / 2, y: centerY });
    right.push({ x: centerX + width / 2, y: centerY });
  }
  const d = `${smoothPath(left, 'M')} ${smoothPath(right.reverse(), 'L')} Z`;
  return `<path d="${d}" fill="${fill}" fill-opacity="${opacity}"/>`;
}

const topRibbons = stageEdges.map(e => fluidRibbon({
  x0: e.sourceSlot.x, y0: 921, x1: e.officeSlot.x, y1: 1702,
  w0: e.sourceSlot.width, w1: e.officeSlot.width, midFactor: e.midFactor, bow: e.bow, ...e
})).join('\n');
const bottomRibbons = triads.map(e => fluidRibbon({
  x0: e.officeSlot.x, y0: 1750, x1: e.countySlot.x, y1: 2542,
  w0: e.officeSlot.width, w1: e.countySlot.width, midFactor: e.midFactor, bow: e.bow, ...e
})).join('\n');

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <title>P02 fluid woven ribbons</title>
  <desc>Top source-office edges and office-county triads. Every endpoint is a proportional sub-segment of its editable rail; a single smooth midstream expansion is proportional to the shared endpoint-node share.</desc>
  <g id="fluid-source-office">${topRibbons}</g>
  <g id="fluid-office-county">${bottomRibbons}</g>
</svg>`;

fs.writeFileSync(OUT, svg, 'utf8');
console.log(`wrote ${OUT}`);
