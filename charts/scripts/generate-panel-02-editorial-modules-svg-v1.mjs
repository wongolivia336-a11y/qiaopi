import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '..', '..');
const outDir = path.join(root, 'charts', 'svg');
fs.mkdirSync(outDir, { recursive: true });

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, '课程资料', '侨批可用数据-summary-v3.js'), 'utf8'), sandbox);
const Q = sandbox.window.QIAOPI_DATA;

// P02 editorial palette: brighter than the previous dark slate, while keeping the
// brick-red sample path as the only strong accent.
const C = {
  paper: '#F7F3EB', ink: '#30383A', slate: '#91A6AA', slateDeep: '#789296',
  slatePale: '#C7D2D1', red: '#C86556', redPale: '#E4B0A5',
  taupe: '#A9A298', taupePale: '#D7D0C6', land: '#D9DFDD', sea: '#F0F3F0'
};
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&apos;' }[c]));
const fmt = n => new Intl.NumberFormat('zh-CN').format(n);
const sum = a => a.reduce((x, y) => x + y, 0);
const normSource = s => s === '印尼' ? '印度尼西亚' : s;

const sourceCoords = {
  '泰国': [100.50, 13.75], '新加坡': [103.82, 1.35], '马来西亚': [101.69, 3.14],
  '印度尼西亚': [106.85, -6.20], '越南': [105.84, 21.03], '香港': [114.17, 22.32]
};
const countyCoords = {
  '潮安': [116.63, 23.66], '澄海': [116.77, 23.47], '揭阳': [116.37, 23.55],
  '饶平': [117.00, 23.67], '普宁': [116.17, 23.30], '汕头': [116.68, 23.35],
  '潮阳': [116.60, 23.26], '丰顺': [116.18, 23.74], '惠来': [116.30, 23.03],
  '诏安': [117.18, 23.71], '揭西': [115.84, 23.43], '大埔': [116.70, 24.35]
};
const home = [116.67, 23.45];

const rows = Q.flows.map(row => ({ ...row, source: normSource(row.source) }));
const sourceTotals = new Map();
const countyTotals = new Map();
for (const row of rows) {
  sourceTotals.set(row.source, (sourceTotals.get(row.source) || 0) + row.count);
  countyTotals.set(row.county, (countyTotals.get(row.county) || 0) + row.count);
}
const sourceOrder = [...sourceTotals.entries()].filter(([name]) => sourceCoords[name]).sort((a, b) => b[1] - a[1]);
const countyOrder = [...countyTotals.entries()].filter(([name]) => countyCoords[name]).sort((a, b) => b[1] - a[1]);

const topo = JSON.parse(fs.readFileSync(path.join(root, '课程资料', '潮汐邮路-assets', 'countries-110m.json'), 'utf8'));
const tr = topo.transform;
const decoded = [];
for (const arc of topo.arcs) {
  let x = 0, y = 0;
  decoded.push(arc.map(([dx, dy]) => { x += dx; y += dy; return [x * tr.scale[0] + tr.translate[0], y * tr.scale[1] + tr.translate[1]]; }));
}
const arcPoints = id => id >= 0 ? decoded[id] : [...decoded[~id]].reverse();
const geometries = topo.objects[Object.keys(topo.objects)[0]].geometries;

const svgHead = (w, h, title, desc) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc">
<title id="title">${esc(title)}</title><desc id="desc">${esc(desc)}</desc>
<style>text{font-family:"Noto Sans SC","Microsoft YaHei",sans-serif;fill:${C.ink}}.caps{font-size:12px;letter-spacing:1.8px;fill:${C.taupe}}.title{font-size:26px;font-weight:700}.label{font-size:16px;font-weight:700}.value{font-size:12px;fill:${C.taupe}}.note{font-size:11px;fill:${C.taupe}}.axis{font-size:10px;fill:${C.taupe}}.hair{vector-effect:non-scaling-stroke}</style>`;

const ringPath = (ids, proj) => {
  const pts = ids.flatMap((id, i) => arcPoints(id).slice(i ? 1 : 0));
  return pts.length ? pts.map((p, i) => `${i ? 'L' : 'M'}${proj(p)[0].toFixed(1)},${proj(p)[1].toFixed(1)}`).join(' ') + ' Z' : '';
};
const routePath = (a, b, proj) => {
  const [x1, y1] = proj(a), [x2, y2] = proj(b), dx = Math.abs(x2 - x1);
  const cy = Math.min(y1, y2) - Math.min(100, 26 + dx * 0.08);
  return `M${x1.toFixed(1)},${y1.toFixed(1)} C${(x1 + dx * .34).toFixed(1)},${cy.toFixed(1)} ${(x2 - dx * .34).toFixed(1)},${cy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`;
};
const landPaths = proj => geometries.flatMap(g => {
  const polys = g.type === 'Polygon' ? [g.arcs] : g.type === 'MultiPolygon' ? g.arcs : [];
  return polys.map(poly => poly.map(ring => ringPath(ring, proj)).filter(Boolean).join(' ')).filter(Boolean);
});

// Module 1: source-side South-East Asia locator. It is a locator map, not a
// distance encoding; the ribbons remain the only quantitative flow encoding.
{
  const W = 1280, H = 520, plot = { x: 42, y: 86, w: 1196, h: 354 };
  const proj = ([lon, lat]) => [plot.x + (lon - 94) / 28 * plot.w, plot.y + (28 - lat) / 44 * plot.h];
  const lands = landPaths(proj);
  const topSources = sourceOrder.slice(0, 6);
  const max = topSources[0]?.[1] || 1;
  const routes = topSources.map(([name, value]) => {
    const p = sourceCoords[name], [x, y] = proj(p), r = 5 + 12 * Math.sqrt(value / max);
    return `<g id="source-${esc(name)}"><path id="route-${esc(name)}" d="${routePath(p, home, proj)}" fill="none" stroke="${name === '新加坡' ? C.red : C.slateDeep}" stroke-width="${name === '新加坡' ? 3.4 : 1.6}" stroke-opacity="${name === '新加坡' ? .78 : .36}" stroke-linecap="round"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r + 7).toFixed(1)}" fill="none" stroke="${name === '新加坡' ? C.red : C.slate}" stroke-opacity=".34" stroke-width="1.2" stroke-dasharray="2 5"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${name === '新加坡' ? C.red : C.slate}" fill-opacity=".92"/><text class="label" x="${(x + 18).toFixed(1)}" y="${(y - 8).toFixed(1)}">${esc(name)}</text><text class="value" x="${(x + 18).toFixed(1)}" y="${(y + 12).toFixed(1)}">${fmt(value)} 条</text></g>`;
  }).join('');
  const svg = `${svgHead(W, H, 'P02 来源地地图模块', '南洋来源地定位图。路线为聚合关系示意，圆点半径表达来源记录量。')}<defs><clipPath id="map-clip"><rect x="${plot.x}" y="${plot.y}" width="${plot.w}" height="${plot.h}"/></clipPath></defs><rect id="background" width="${W}" height="${H}" fill="${C.paper}"/><text class="caps" x="42" y="36">SOURCE LOCATOR / 南洋·寄出地</text><text class="title" x="42" y="68">从南洋寄出，批信沿着哪些出发地进入网络？</text><g id="map-module" clip-path="url(#map-clip)"><rect x="${plot.x}" y="${plot.y}" width="${plot.w}" height="${plot.h}" fill="${C.sea}" stroke="${C.slatePale}"/><g id="grid">${[100,110,120].map(lon => { const [x] = proj([lon, 0]); return `<line x1="${x}" x2="${x}" y1="${plot.y}" y2="${plot.y + plot.h}" stroke="${C.slatePale}" stroke-dasharray="2 8"/><text class="axis" x="${x}" y="${plot.y + plot.h - 10}" text-anchor="middle">${lon}°E</text>`; }).join('')}</g><g id="map-land">${lands.map(d => `<path d="${d}" fill="${C.land}" fill-opacity=".72" stroke="${C.slate}" stroke-opacity=".26" stroke-width=".7"/>`).join('')}</g><g id="routes">${routes}</g><g id="home-node"><circle cx="${proj(home)[0]}" cy="${proj(home)[1]}" r="18" fill="${C.paper}" fill-opacity=".85" stroke="${C.red}" stroke-width="1.5"/><circle cx="${proj(home)[0]}" cy="${proj(home)[1]}" r="6" fill="${C.red}"/><text class="label" x="${proj(home)[0] + 26}" y="${proj(home)[1] - 3}">潮汕</text><text class="value" x="${proj(home)[0] + 26}" y="${proj(home)[1] + 16}">收批地</text></g></g><g id="map-note"><line x1="42" x2="150" y1="484" y2="484" stroke="${C.red}" stroke-width="3"/><text class="note" x="164" y="488">砖红：叙事样本路径；灰蓝：全库聚合关系；地图仅作两端定位</text></g></svg>`;
  fs.writeFileSync(path.join(outDir, 'panel-02-map-southeast-asia-v2.svg'), svg);
}

// Module 2: county-side locator. It is intentionally a lighter, modular map
// that can sit below the county rail without competing with the Sankey.
{
  const W = 1280, H = 500, plot = { x: 42, y: 78, w: 1196, h: 348 };
  const proj = ([lon, lat]) => [plot.x + (lon - 113.8) / 4.2 * plot.w, plot.y + (25.1 - lat) / 2.9 * plot.h];
  const lands = landPaths(proj);
  const counties = countyOrder.filter(([name]) => countyCoords[name]).slice(0, 10);
  const max = counties[0]?.[1] || 1;
  const nodes = counties.map(([name, value], i) => {
    const [x, y] = proj(countyCoords[name]), r = 7 + 19 * Math.sqrt(value / max), isHero = name === '潮安';
    return `<g id="county-${esc(name)}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r + 8).toFixed(1)}" fill="none" stroke="${isHero ? C.red : C.slate}" stroke-opacity=".25" stroke-width="1.2" stroke-dasharray="2 5"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${isHero ? C.red : C.slate}" fill-opacity=".88"/><text class="label" x="${(x + 18).toFixed(1)}" y="${(y - 4).toFixed(1)}">${esc(name)}</text><text class="value" x="${(x + 18).toFixed(1)}" y="${(y + 16).toFixed(1)}">${fmt(value)} 条</text></g>`;
  }).join('');
  const svg = `${svgHead(W, H, 'P02 潮汕收批县地图模块', '潮汕收批县定位图。圆点半径表达收批县记录量，行政边界为定位底图。')}<defs><clipPath id="county-clip"><rect x="${plot.x}" y="${plot.y}" width="${plot.w}" height="${plot.h}"/></clipPath></defs><rect id="background" width="${W}" height="${H}" fill="${C.paper}"/><text class="caps" x="42" y="32">COUNTY LOCATOR / 潮汕·收批县</text><text class="title" x="42" y="64">批信落地后，哪些县成为收批端的密集节点？</text><g id="map-module" clip-path="url(#county-clip)"><rect x="${plot.x}" y="${plot.y}" width="${plot.w}" height="${plot.h}" fill="${C.sea}" stroke="${C.slatePale}"/><g id="map-land">${lands.map(d => `<path d="${d}" fill="${C.land}" fill-opacity=".76" stroke="${C.slate}" stroke-opacity=".3" stroke-width=".75"/>`).join('')}</g><g id="county-nodes">${nodes}</g></g><g id="map-note"><line x1="42" x2="150" y1="468" y2="468" stroke="${C.red}" stroke-width="3"/><text class="note" x="164" y="472">圆点面积只编码记录量，不把县域面积或地理距离混入桑基图</text></g></svg>`;
  fs.writeFileSync(path.join(outDir, 'panel-02-map-chaoshan-v2.svg'), svg);
}

// Module 3: evidence bars. The bars use the same units as the Sankey rails,
// so the side evidence reads as a small chart rather than a stack of cards.
{
  const W = 900, H = 500, groups = [
    { id: 'source-top4', title: '来源国家 TOP 4', entries: sourceOrder.slice(0, 4), color: C.slate },
    { id: 'office-top4', title: '经手批局 TOP 4', entries: [['未记录批局', 25374], ['其他批局', 13133], ['万益成', 1568], ['祥泰隆', 1349]], color: C.taupe },
    { id: 'county-top4', title: '收批县 TOP 4', entries: countyOrder.slice(0, 4), color: C.red }
  ];
  const groupMarkup = groups.map((g, gi) => {
    const y0 = 22 + gi * 156, max = Math.max(...g.entries.map(([, v]) => v));
    const bars = g.entries.map(([label, value], i) => { const y = y0 + 48 + i * 23, w = 360 * value / max, hero = gi === 2 && i === 0; return `<g id="${esc(g.id)}-${i}"><circle cx="38" cy="${y - 4}" r="5" fill="${hero ? C.red : g.color}" fill-opacity=".9"/><text class="label" x="56" y="${y}">${esc(label)}</text><rect x="190" y="${y - 14}" width="360" height="9" rx="4.5" fill="${C.taupePale}"/><rect x="190" y="${y - 14}" width="${w.toFixed(1)}" height="9" rx="4.5" fill="${hero ? C.red : g.color}" fill-opacity=".9"/><text class="value" x="580" y="${y}">${fmt(value)}</text></g>`; }).join('');
    return `<g id="${g.id}"><text class="caps" x="38" y="${y0 + 16}">${esc(g.title)}</text><line x1="38" x2="720" y1="${y0 + 28}" y2="${y0 + 28}" stroke="${C.slatePale}"/>${bars}</g>`;
  }).join('');
  const svg = `${svgHead(W, H, 'P02 三端 Top4 证据条', '来源、批局与收批县的 Top4 横向条形图，条长与记录量成正比。')}<rect id="background" width="${W}" height="${H}" fill="${C.paper}"/><text class="caps" x="38" y="16">EVIDENCE BARS / 三端证据</text>${groupMarkup}<text class="note" x="38" y="490">条长 ∝ 记录量；与主图端线共用同一计数口径。未记录与其他保留为字段边界。</text></svg>`;
  fs.writeFileSync(path.join(outDir, 'panel-02-top4-mini-bars-v2.svg'), svg);
}

console.log(JSON.stringify({
  outputs: [
    'charts/svg/panel-02-map-southeast-asia-v2.svg',
    'charts/svg/panel-02-map-chaoshan-v2.svg',
    'charts/svg/panel-02-top4-mini-bars-v2.svg'
  ],
  palette: C,
  sourceTop4: sourceOrder.slice(0, 4),
  countyTop4: countyOrder.slice(0, 4)
}, null, 2));
