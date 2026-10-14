import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '..', '..');
const outDir = path.join(root, 'charts', 'svg');
const dataDir = path.join(root, 'data', 'derived');
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(dataDir, { recursive: true });

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, '课程资料', '侨批可用数据-summary-v3.js'), 'utf8'), sandbox);
const Q = sandbox.window.QIAOPI_DATA;
const C = {
  paper: '#E9E1D2', ink: '#3E3933', slate: '#718083', red: '#9E4435',
  taupe: '#81786D', dust: '#B9A58F', pale: '#D8CFC0', sea: '#C6D2D0', land: '#D8CFC0'
};
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&apos;' }[c]));
const fmt = n => new Intl.NumberFormat('zh-CN').format(n);
const sum = a => a.reduce((x, y) => x + y, 0);
const normSource = s => s === '印尼' ? '印度尼西亚' : s;

const originCoord = {
  '泰国':[100.50,13.75], '新加坡':[103.82,1.35], '马来西亚':[101.69,3.14],
  '印度尼西亚':[106.85,-6.20], '越南':[105.84,21.03], '柬埔寨':[104.92,11.56],
  '香港':[114.17,22.32], '澳大利亚':[151.21,-33.87]
};
const countyCoord = {
  '潮安':[116.63,23.66], '澄海':[116.77,23.47], '揭阳':[116.37,23.55], '饶平':[117.00,23.67],
  '普宁':[116.17,23.30], '汕头':[116.68,23.35], '潮阳':[116.60,23.26], '丰顺':[116.18,23.74],
  '潮州':[116.63,23.66], '广州':[113.26,23.13], '惠来':[116.30,23.03], '诏安':[117.18,23.71],
  '揭西':[115.84,23.43], '大埔':[116.70,24.35]
};

const merged = new Map();
for (const row of Q.flows) {
  const source = normSource(row.source);
  const key = `${source}\u0000${row.county}`;
  merged.set(key, { source, county: row.county, count: (merged.get(key)?.count || 0) + row.count });
}
const flows = [...merged.values()];
const knownKnown = flows.filter(d => d.source !== '未知' && d.county !== '未知');
const inExtent = ([lon, lat]) => lon >= 95 && lon <= 123 && lat >= -8 && lat <= 32;
const mapFlows = knownKnown.filter(d => originCoord[d.source] && countyCoord[d.county] && inExtent(originCoord[d.source]) && inExtent(countyCoord[d.county]));
const mappedTotal = sum(mapFlows.map(d => d.count));
const sourceTotals = Object.fromEntries([...new Set(mapFlows.map(d => d.source))].map(s => [s, sum(mapFlows.filter(d => d.source === s).map(d => d.count))]));
const countyTotals = Object.fromEntries([...new Set(mapFlows.map(d => d.county))].map(c => [c, sum(mapFlows.filter(d => d.county === c).map(d => d.count))]));
const sampleCount = sum(mapFlows.filter(d => d.source === '新加坡' && d.county === '潮安').map(d => d.count));

const topo = JSON.parse(fs.readFileSync(path.join(root, '课程资料', '潮汐邮路-assets', 'countries-110m.json'), 'utf8'));
const transform = topo.transform;
const decoded = [];
for (const arc of topo.arcs) {
  let x = 0, y = 0;
  decoded.push(arc.map(([dx, dy]) => { x += dx; y += dy; return [x * transform.scale[0] + transform.translate[0], y * transform.scale[1] + transform.translate[1]]; }));
}
const arcPoints = id => id >= 0 ? decoded[id] : [...decoded[~id]].reverse();

const W = 2200, H = 1460;
const plot = { x: 84, y: 236, w: 1510, h: 800 };
const proj = ([lon, lat]) => [plot.x + (lon - 95) / 28 * plot.w, plot.y + (32 - lat) / 40 * plot.h];
const ringPath = ids => {
  const points = ids.flatMap((id, i) => arcPoints(id).slice(i ? 1 : 0));
  if (!points.length) return '';
  return points.map((p, i) => `${i ? 'L' : 'M'}${proj(p)[0].toFixed(1)},${proj(p)[1].toFixed(1)}`).join(' ') + ' Z';
};
const geometries = topo.objects[Object.keys(topo.objects)[0]].geometries;
const landPaths = [];
for (const g of geometries) {
  const polys = g.type === 'Polygon' ? [g.arcs] : g.type === 'MultiPolygon' ? g.arcs : [];
  for (const poly of polys) {
    const rings = poly.map(ringPath).filter(Boolean);
    if (rings.length) landPaths.push(rings.join(' '));
  }
}

const routePath = (a, b) => {
  const [x1, y1] = proj(a), [x2, y2] = proj(b);
  const dx = Math.abs(x2 - x1);
  const cy = Math.min(y1, y2) - Math.min(140, 60 + dx * 0.10);
  return `M${x1.toFixed(1)},${y1.toFixed(1)} C${(x1 + dx * .32).toFixed(1)},${cy.toFixed(1)} ${(x2 - dx * .32).toFixed(1)},${cy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`;
};

const sourceOrder = Object.entries(sourceTotals).sort((a,b) => b[1]-a[1]);
const countyOrder = Object.entries(countyTotals).sort((a,b) => b[1]-a[1]);
const maxEdge = Math.max(...mapFlows.map(d => d.count));
const edgeWidth = d => (0.75 + 7.5 * Math.sqrt(d.count / maxEdge)).toFixed(2);
const allEdges = [...mapFlows].sort((a,b) => a.count - b.count).map(d => `<path d="${routePath(originCoord[d.source], countyCoord[d.county])}" fill="none" stroke="${C.slate}" stroke-width="${edgeWidth(d)}" stroke-opacity="${(0.16 + 0.28 * Math.sqrt(d.count / maxEdge)).toFixed(2)}"/>`).join('');
const focusEdges = [...mapFlows].sort((a,b) => b.count - a.count).slice(0, 12).map(d => `<path data-key="${esc(d.source)}|${esc(d.county)}" d="${routePath(originCoord[d.source], countyCoord[d.county])}" fill="none" stroke="${C.slate}" stroke-width="${(Number(edgeWidth(d)) + 1.2).toFixed(2)}" stroke-opacity=".58"/>`).join('');

const sourceNode = sourceOrder.map(([name, total], i) => {
  const [x, y] = proj(originCoord[name]);
  const r = 12 + 20 * Math.sqrt(total / sourceOrder[0][1]);
  const align = x < 330 ? 'start' : 'end';
  const tx = x < 330 ? x + r + 18 : x - r - 18;
  const lineX = x < 330 ? tx - 8 : tx + 8;
  return `<g id="source-${esc(name)}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r+7).toFixed(1)}" fill="none" stroke="${C.slate}" stroke-opacity=".24" stroke-width="2"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${name === '新加坡' ? C.red : C.slate}" fill-opacity=".92" stroke="${C.paper}" stroke-width="3"/><line x1="${x + (x < 330 ? r : -r)}" y1="${y}" x2="${lineX}" y2="${y}" stroke="${C.taupe}" stroke-width="1"/><text class="nodeLabel" x="${tx}" y="${y-4}" text-anchor="${align}">${esc(name)}</text><text class="nodeValue" x="${tx}" y="${y+22}" text-anchor="${align}">${fmt(total)} 条</text></g>`;
}).join('');

const mapCountyNodes = countyOrder.map(([name, total]) => {
  const [x, y] = proj(countyCoord[name]);
  const r = 5 + 16 * Math.sqrt(total / countyOrder[0][1]);
  return `<g id="map-county-${esc(name)}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r+4).toFixed(1)}" fill="none" stroke="${C.red}" stroke-opacity="${name === '潮安' ? '.65' : '.18'}" stroke-width="1.4"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${name === '潮安' ? C.red : C.taupe}" fill-opacity=".9"/></g>`;
}).join('');

const insetX = 1650, insetY = 250, insetW = 480, insetH = 785;
const insetCenter = [1890, 635];
const insetRows = countyOrder.slice(0, 8);
const insetNodes = insetRows.map(([name, total], i) => {
  const angle = -Math.PI * .78 + i * (Math.PI * 1.56 / Math.max(1, insetRows.length - 1));
  const x = insetCenter[0] + Math.cos(angle) * 145;
  const y = insetCenter[1] + Math.sin(angle) * 255;
  const r = 9 + 24 * Math.sqrt(total / insetRows[0][1]);
  const anchor = x < insetCenter[0] ? 'end' : 'start';
  const tx = x + (x < insetCenter[0] ? -r - 16 : r + 16);
  return {name, total, x, y, r, anchor, tx};
});
const insetLines = insetNodes.map(n => `<line x1="${insetCenter[0]}" y1="${insetCenter[1]}" x2="${n.x.toFixed(1)}" y2="${n.y.toFixed(1)}" stroke="${C.dust}" stroke-width="1" stroke-opacity=".8"/>`).join('');
const insetMarks = insetNodes.map(n => `<g id="inset-${esc(n.name)}"><circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${(n.r+7).toFixed(1)}" fill="none" stroke="${n.name === '潮安' ? C.red : C.slate}" stroke-opacity=".26" stroke-width="1.5"/><circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${n.r.toFixed(1)}" fill="${n.name === '潮安' ? C.red : C.slate}"/><text class="insetLabel" x="${n.tx.toFixed(1)}" y="${(n.y-4).toFixed(1)}" text-anchor="${n.anchor}">${esc(n.name)}</text><text class="insetValue" x="${n.tx.toFixed(1)}" y="${(n.y+17).toFixed(1)}" text-anchor="${n.anchor}">${fmt(n.total)} 条</text></g>`).join('');

const grid = [];
for (let lon = 100; lon <= 120; lon += 10) { const [x] = proj([lon, 0]); grid.push(`<line x1="${x}" x2="${x}" y1="${plot.y}" y2="${plot.y+plot.h}" stroke="${C.dust}" stroke-dasharray="2 10"/><text class="axis" x="${x}" y="${plot.y+plot.h+34}" text-anchor="middle">${lon}°E</text>`); }
for (let lat = 0; lat <= 30; lat += 10) { const [, y] = proj([100, lat]); grid.push(`<line x1="${plot.x}" x2="${plot.x+plot.w}" y1="${y}" y2="${y}" stroke="${C.dust}" stroke-dasharray="2 10"/><text class="axis" x="${plot.x-16}" y="${y+5}" text-anchor="end">${lat === 0 ? '0°' : `${lat}°N`}</text>`); }

const sampleFrom = proj(originCoord['新加坡']);
const sampleTo = proj(countyCoord['潮安']);
const sampleRoute = routePath(originCoord['新加坡'], countyCoord['潮安']);
const legend = `<g id="legend"><line x1="84" x2="154" y1="112" y2="112" stroke="${C.slate}" stroke-width="7"/><text class="legendText" x="104" y="98">灰蓝：全库聚合关系，线宽 ∝ √记录数</text><line x1="510" x2="580" y1="112" y2="112" stroke="${C.red}" stroke-width="5"/><text class="legendText" x="600" y="98">砖红：叙事样本索引，固定线宽</text><circle cx="1050" cy="110" r="8" fill="${C.taupe}"/><text class="legendText" x="1070" y="116">圆面积：地点总记录量</text></g>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc">
<title id="title">跨海连接并不平均：海外来源地与潮汕收批地</title>
<desc id="desc">真实侨批聚合关系地图。灰蓝线表达 flows 中纳入制图的来源地—收批县关系，砖红线仅表达新加坡—潮安叙事样本索引；右侧为潮汕收批县阅读性局部展开。</desc>
<style>
text{font-family:"Noto Sans SC","Microsoft YaHei",sans-serif;fill:${C.ink}}
.title{font-size:48px;font-weight:700;letter-spacing:1px}.sub{font-size:19px;fill:${C.taupe}}.micro{font-size:12px;fill:${C.taupe};letter-spacing:1.2px}.axis{font-size:13px;fill:${C.taupe}}.legendText{font-size:13px;fill:${C.taupe}}.nodeLabel{font-size:18px;font-weight:700}.nodeValue{font-size:13px;fill:${C.taupe}}.insetLabel{font-size:16px;font-weight:700}.insetValue{font-size:12px;fill:${C.taupe}}.cardTitle{font-size:18px;font-weight:700}.cardText{font-size:13px;fill:${C.taupe}}.smallCaps{font-size:11px;letter-spacing:1.6px;fill:${C.taupe}}.value{font-size:23px;font-weight:700}.hair{vector-effect:non-scaling-stroke}
</style>
<rect id="background" width="${W}" height="${H}" fill="${C.paper}"/>
<g id="title-block"><text class="micro" x="84" y="58">01 / 此岸 · 起信</text><text class="title" x="84" y="112">跨海连接并不平均</text><text class="sub" x="84" y="150">来源地 → 收批地 · 灰蓝关系保留全库聚合，砖红只标出一条叙事样本</text><text class="micro" x="2116" y="58" text-anchor="end">CONTRACT · map-route / 50,064 records</text></g>
${legend}
<g id="hero-map"><rect x="${plot.x}" y="${plot.y}" width="${plot.w}" height="${plot.h}" rx="4" fill="${C.sea}" fill-opacity=".54" stroke="${C.dust}" stroke-opacity=".55"/><g id="coordinate-grid">${grid.join('')}</g><g id="basemap">${landPaths.map(d => `<path d="${d}" fill="${C.land}" stroke="${C.taupe}" stroke-width=".6" stroke-opacity=".65"/>`).join('')}</g><g id="all-routes">${allEdges}</g><g id="focus-routes">${focusEdges}</g><g id="sample-route"><path d="${sampleRoute}" fill="none" stroke="${C.red}" stroke-width="5" stroke-linecap="round"/><circle cx="${sampleFrom[0]}" cy="${sampleFrom[1]}" r="6" fill="${C.red}"/><circle cx="${sampleTo[0]}" cy="${sampleTo[1]}" r="6" fill="${C.red}"/></g><g id="source-nodes">${sourceNode}</g><g id="county-nodes">${mapCountyNodes}</g><g id="sample-callout"><line x1="${sampleFrom[0]+28}" y1="${sampleFrom[1]-28}" x2="${sampleFrom[0]+170}" y2="${sampleFrom[1]-96}" stroke="${C.red}" stroke-width="1.5"/><text class="smallCaps" x="${sampleFrom[0]+184}" y="${sampleFrom[1]-99}">NARRATIVE SAMPLE</text><text class="cardTitle" x="${sampleFrom[0]+184}" y="${sampleFrom[1]-73}">新加坡 → 潮安</text><text class="cardText" x="${sampleFrom[0]+184}" y="${sampleFrom[1]-50}">${fmt(sampleCount)} 条聚合记录 · 不是单件真实航线</text></g></g>
<g id="chaoshan-inset"><rect x="${insetX}" y="${insetY}" width="${insetW}" height="${insetH}" rx="4" fill="${C.paper}" fill-opacity=".96" stroke="${C.dust}"/><text class="smallCaps" x="${insetX+28}" y="${insetY+42}">LOCAL DETAIL / CHAOSHAN</text><text class="cardTitle" x="${insetX+28}" y="${insetY+80}">潮汕收批地 · 局部展开</text><text class="cardText" x="${insetX+28}" y="${insetY+108}">节点面积＝记录量；位置为阅读性展开，不按比例</text><circle cx="${insetCenter[0]}" cy="${insetCenter[1]}" r="28" fill="${C.red}" fill-opacity=".92"/><circle cx="${insetCenter[0]}" cy="${insetCenter[1]}" r="39" fill="none" stroke="${C.red}" stroke-opacity=".3"/><text class="cardTitle" x="${insetCenter[0]}" y="${insetCenter[1]+5}" text-anchor="middle" fill="${C.paper}">潮汕</text><text class="cardText" x="${insetCenter[0]}" y="${insetCenter[1]+54}" text-anchor="middle">${fmt(sum(Object.values(countyTotals)))} 条</text><g id="inset-guides">${insetLines}</g><g id="inset-counties">${insetMarks}</g><text class="cardText" x="${insetX+28}" y="${insetY+735}">展开只用于拆开相邻端点标签；不改变主图坐标，也不新增路径。</text></g>
<g id="audit-cards"><rect x="84" y="1090" width="1510" height="250" rx="4" fill="${C.paper}" fill-opacity=".86" stroke="${C.dust}"/><text class="smallCaps" x="116" y="1132">READING NOTE / MAP AUDIT</text><text class="cardTitle" x="116" y="1173">地图不是航线图，而是记录关系的空间索引</text><text class="cardText" x="116" y="1207">灰蓝线只连接来源地与收批县的聚合端点；线宽按 √记录数缩放，避免最大组合吞掉其他路径。</text><text class="cardText" x="116" y="1234">未知来源 796 条、未知收批地 683 条（重叠 548 条）不被伪装成真实地点；flows 合计 ${fmt(sum(Q.flows.map(d=>d.count)))}，比全库少 2 条。</text><line x1="116" x2="1510" y1="1262" y2="1262" stroke="${C.pale}"/><text class="value" x="116" y="1302">${fmt(mappedTotal)}</text><text class="cardText" x="246" y="1302">条可定位的来源—收批地聚合记录</text><text class="value" x="660" y="1302">${sourceOrder.length}</text><text class="cardText" x="730" y="1302">个已知来源类别</text><text class="value" x="1020" y="1302">${countyOrder.length}</text><text class="cardText" x="1100" y="1302">个收批地类别</text></g>
<g id="source-and-notes"><line x1="84" x2="2116" y1="1390" y2="1390" stroke="${C.dust}"/><text class="cardText" x="84" y="1422">数据来源：课程资料/侨批可用数据-summary-v3.js 的 flows.source / flows.count；底图 countries-110m；坐标为名称匹配的制图坐标。</text><text class="cardText" x="84" y="1445">缺失说明：未知字段不等于现实中不存在；端点关系不等同海上航线；本图所有图层均可在 SVG 中独立编辑。</text></g>
</svg>\n`;

fs.writeFileSync(path.join(outDir, 'panel-01-map-route-hero-v1.svg'), svg);
fs.writeFileSync(path.join(dataDir, 'panel-01-map-hero-derived-v1.json'), JSON.stringify({
  schema_version:'qiaopi-panel-01-map-hero-derived/v1', source:'课程资料/侨批可用数据-summary-v3.js', generated:'2026-10-14',
  unit:'侨批记录条数', total_records:Q.total, flows_total:sum(Q.flows.map(d=>d.count)), mapped_records:mappedTotal,
  source_totals:sourceTotals, county_totals:countyTotals, sample_path:{source:'新加坡',county:'潮安',count:sampleCount},
  notes:['主图位置来自外部坐标字典；潮汕局部展开只用于阅读性拆标，不改变坐标。','所有路线均为聚合关系，非逐件真实航线。']
}, null, 2)+'\n');
console.log(JSON.stringify({output:'charts/svg/panel-01-map-route-hero-v1.svg',mappedTotal,sourceCount:sourceOrder.length,countyCount:countyOrder.length,sampleCount},null,2));

