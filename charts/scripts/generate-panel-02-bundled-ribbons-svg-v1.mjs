import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('charts/svg/panel-02-bundled-ribbons-v1.svg');
const W = 2950;
const H = 3404.3;

// Coordinates match the editable P02 hero frame (309:2).
// Widths are linear in the aggregate count: width = count * 0.0065.
// The full relationship field remains in Figma as the low-opacity base layer;
// these ribbons only surface the highest-signal stage edges/triads.
const stageEdges = [
  { source: 832, office: 2077, count: 17735, fill: '#7E898A', opacity: .52 },
  { source: 832, office: 1348, count: 5759, fill: '#8D887F', opacity: .38 },
  { source: 1694, office: 1348, count: 4974, fill: '#8D887F', opacity: .38 },
  { source: 1694, office: 2077, count: 4630, fill: '#A2A19B', opacity: .30 },
  { source: 2183, office: 2077, count: 2340, fill: '#7E898A', opacity: .36 },
  { source: 1694, office: 414, count: 1530, fill: '#B75245', opacity: .44 },
  { source: 1694, office: 493, count: 1220, fill: '#8D887F', opacity: .34 },
  { source: 1694, office: 690, count: 974, fill: '#8D887F', opacity: .30 },
  { source: 1694, office: 563, count: 1136, fill: '#8D887F', opacity: .30 },
  { source: 832, office: 974, count: 773, fill: '#8D887F', opacity: .30 },
];

const triads = [
  { office: 2077, county: 1798, count: 9483, fill: '#7E898A', opacity: .50 },
  { office: 2077, county: 914, count: 5806, fill: '#7E898A', opacity: .40 },
  { office: 1348, county: 914, count: 3980, fill: '#8D887F', opacity: .42 },
  { office: 2077, county: 914, count: 3637, fill: '#A2A19B', opacity: .32 },
  { office: 1348, county: 1798, count: 2724, fill: '#8D887F', opacity: .34 },
  { office: 2077, county: 914, count: 1923, fill: '#7E898A', opacity: .32 },
  { office: 1348, county: 914, count: 1917, fill: '#8D887F', opacity: .30 },
  { office: 414, county: 914, count: 1267, fill: '#B75245', opacity: .78 },
  { office: 493, county: 914, count: 1014, fill: '#8D887F', opacity: .28 },
  { office: 1348, county: 914, count: 779, fill: '#8D887F', opacity: .26 },
];

const width = count => Math.max(5, count * 0.0065);

function ribbon({ x0, y0, x1, y1, count, fill, opacity, bend = 0.48 }) {
  const w = width(count);
  const half = w / 2;
  const dy = y1 - y0;
  const c1 = y0 + dy * bend;
  const c2 = y1 - dy * bend;
  return `<path d="M ${x0 - half} ${y0} C ${x0 - half} ${c1}, ${x1 - half} ${c2}, ${x1 - half} ${y1} L ${x1 + half} ${y1} C ${x1 + half} ${c2}, ${x0 + half} ${c1}, ${x0 + half} ${y0} Z" fill="${fill}" fill-opacity="${opacity}"/>`;
}

const topRibbons = stageEdges.map(e => ribbon({ x0: e.source, y0: 921, x1: e.office, y1: 1702, count: e.count, fill: e.fill, opacity: e.opacity })).join('\n');
const bottomRibbons = triads.map(e => ribbon({ x0: e.office, y0: 1750, x1: e.county, y1: 2542, count: e.count, fill: e.fill, opacity: e.opacity })).join('\n');

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <title>P02 bundled ribbons</title>
  <desc>Top aggregated source-office edges and office-county triads. Width is proportional to record count. The complete low-opacity relationship field remains underneath.</desc>
  <g id="bundled-stage-edges">${topRibbons}</g>
  <g id="bundled-triads">${bottomRibbons}</g>
</svg>`;

fs.writeFileSync(OUT, svg, 'utf8');
console.log(`wrote ${OUT}`);
