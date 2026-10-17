import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data', 'derived', 'panel-02-sankey-derived-v2-csv.json'), 'utf8'));
const outDir = path.join(root, 'charts', 'svg');
fs.mkdirSync(outDir, { recursive: true });

const C = {
  paper: '#E9E1D2', ink: '#3E3933', slate: '#718083', red: '#9E4435',
  taupe: '#81786D', county: '#687371', dust: '#B9A58F', pale: '#D8CFC0',
  wash: '#F2EDE4', line: '#B9ADA0', sea: '#C5D1CE'
};
const fmt = n => new Intl.NumberFormat('zh-CN').format(n);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
const byKey = (stage, source, target) => data.edges.find(e => e.stage === stage && e.source === source && e.target === target);
const sourceEdges = data.edges.filter(e => e.stage === 'source-office');
const officeEdges = data.edges.filter(e => e.stage === 'office-county');
const total = data.rows;

const totals = { source: Object.fromEntries(data.nodes.source.map(n => [n, 0])), office: Object.fromEntries(data.nodes.office.map(n => [n, 0])), county: Object.fromEntries(data.nodes.county.map(n => [n, 0])) };
for (const e of sourceEdges) { totals.source[e.source] += e.count; totals.office[e.target] += e.count; }
for (const e of officeEdges) totals.county[e.target] += e.count;

const W = 1840, H = 2050;
const plot = { x: 160, width: 1520, topY: 445, officeY: 1000, countyY: 1530, nodeH: 28, gap: 17 };
const layoutRow = (nodes, values, y) => {
  const usable = plot.width - plot.gap * (nodes.length - 1);
  const scale = usable / total;
  const widths = nodes.map(n => Math.max(10, values[n] * scale));
  const used = widths.reduce((a, b) => a + b, 0) + plot.gap * (nodes.length - 1);
  let x = plot.x + (plot.width - used) / 2;
  const out = {};
  nodes.forEach((n, i) => { out[n] = { x, y, w: widths[i], h: plot.nodeH, total: values[n] }; x += widths[i] + plot.gap; });
  return out;
};
const layout = {
  source: layoutRow(data.nodes.source, totals.source, plot.topY),
  office: layoutRow(data.nodes.office, totals.office, plot.officeY),
  county: layoutRow(data.nodes.county, totals.county, plot.countyY)
};
const flowScale = plot.width - plot.gap * (data.nodes.source.length - 1);
const ribbonScale = flowScale / total;

function ribbonPath(x1, y1, x2, y2, h) {
  const dy = (y2 - y1) * 0.42;
  return `M${x1.toFixed(1)},${y1.toFixed(1)} C${x1.toFixed(1)},${(y1 + dy).toFixed(1)} ${x2.toFixed(1)},${(y2 - dy).toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)} L${x2.toFixed(1)},${(y2 + h).toFixed(1)} C${x2.toFixed(1)},${(y2 + h - dy).toFixed(1)} ${x1.toFixed(1)},${(y1 + h + dy).toFixed(1)} ${x1.toFixed(1)},${(y1 + h).toFixed(1)} Z`;
}

const edgeOffsets = (edges, leftColumn, rightColumn) => {
  const left = Object.fromEntries(data.nodes[leftColumn].map(n => [n, 0]));
  const right = Object.fromEntries(data.nodes[rightColumn].map(n => [n, 0]));
  const ordered = [...edges].sort((a, b) => layout[leftColumn][a.source].x - layout[leftColumn][b.source].x || layout[rightColumn][a.target].x - layout[rightColumn][b.target].x);
  const out = new Map();
  for (const e of ordered) {
    const h = Math.max(1.4, e.count * ribbonScale);
    const sx = layout[leftColumn][e.source].x + left[e.source];
    const tx = layout[rightColumn][e.target].x + right[e.target];
    const sy = layout[leftColumn][e.source].y + layout[leftColumn][e.source].h;
    const ty = layout[rightColumn][e.target].y;
    out.set(`${e.stage}|${e.source}|${e.target}`, { sx, tx, sy, ty, h, e });
    left[e.source] += h; right[e.target] += h;
  }
  return out;
};
const sourceOfficeOffsets = edgeOffsets(sourceEdges, 'source', 'office');
const officeCountyOffsets = edgeOffsets(officeEdges, 'office', 'county');
const topSourceOffice = new Set([...sourceEdges].sort((a, b) => b.count - a.count).slice(0, 18).map(e => `${e.source}|${e.target}`));
const topOfficeCounty = new Set([...officeEdges].sort((a, b) => b.count - a.count).slice(0, 18).map(e => `${e.source}|${e.target}`));

const sampleSO = '新加坡|万益成';
const sampleOC = '万益成|潮安';
const renderLinks = (offsets, leftColumn, rightColumn, groupId, mode) => {
  const edges = leftColumn === 'source' ? sourceEdges : officeEdges;
  const paths = [];
  for (const e of edges) {
    const k = `${e.stage}|${e.source}|${e.target}`;
    const pos = offsets.get(k);
    const sample = (leftColumn === 'source' ? sampleSO : sampleOC) === `${e.source}|${e.target}`;
    const focus = leftColumn === 'source' ? topSourceOffice.has(`${e.source}|${e.target}`) : topOfficeCounty.has(`${e.source}|${e.target}`);
    if (mode === 'focus' && !focus && !sample) continue;
    if (mode === 'base' && (focus || sample)) continue;
    const fill = sample ? C.red : (leftColumn === 'source' ? C.slate : C.taupe);
    const opacity = sample ? 0.68 : (mode === 'focus' ? 0.36 : 0.065);
    const stroke = mode === 'focus' ? (sample ? C.red : C.taupe) : 'none';
    const strokeOpacity = mode === 'focus' ? (sample ? 0.9 : 0.42) : 0;
    const strokeWidth = mode === 'focus' ? (sample ? 2.2 : 0.8) : 0;
    paths.push(`<path data-key="${esc(e.source)}|${esc(e.target)}" data-count="${e.count}" data-stage="${e.stage}" d="${ribbonPath(pos.sx, pos.sy, pos.tx, pos.ty, pos.h)}" fill="${fill}" fill-opacity="${opacity}" stroke="${stroke}" stroke-opacity="${strokeOpacity}" stroke-width="${strokeWidth}"><title>${esc(e.source)} → ${esc(e.target)}：${fmt(e.count)} 条${sample ? ' · 叙事样本路径' : ''}</title></path>`);
  }
  return `<g id="${groupId}" data-layer="${mode}">${paths.join('')}</g>`;
};

const nodeFill = (column, n) => n.startsWith('未记录') ? C.pale : (column === 'source' ? C.slate : (column === 'office' ? (n === '万益成' ? C.red : C.taupe) : C.county));
const nodeStroke = (column, n) => (n === '新加坡' || n === '万益成' || n === '潮安') ? C.red : (n.startsWith('未记录') ? C.taupe : C.paper);
const renderNodes = (column, nodes, groupId) => `<g id="${groupId}">${nodes.map(n => {
  const p = layout[column][n];
  const missing = n.startsWith('未记录');
  const focus = n === '新加坡' || n === '万益成' || n === '潮安';
  const pct = (totals[column][n] / total * 100).toFixed(1);
  const label = column === 'source' ? `<text class="node-label source-label" x="${(p.x + p.w / 2).toFixed(1)}" y="${(p.y - 18).toFixed(1)}" text-anchor="middle" transform="rotate(-32 ${(p.x + p.w / 2).toFixed(1)} ${(p.y - 18).toFixed(1)})">${esc(n)}</text><text class="node-value" x="${(p.x + p.w / 2).toFixed(1)}" y="${(p.y - 4).toFixed(1)}" text-anchor="middle">${fmt(totals[column][n])} · ${pct}%</text>`
    : column === 'county' ? `<text class="node-label" x="${(p.x + p.w / 2).toFixed(1)}" y="${(p.y + p.h + 28).toFixed(1)}" text-anchor="middle">${esc(n)}</text><text class="node-value" x="${(p.x + p.w / 2).toFixed(1)}" y="${(p.y + p.h + 45).toFixed(1)}" text-anchor="middle">${fmt(totals[column][n])} · ${pct}%</text>`
    : `<text class="office-label" x="${(p.x + p.w / 2).toFixed(1)}" y="${(p.y + p.h + 24).toFixed(1)}" text-anchor="middle" transform="rotate(-52 ${(p.x + p.w / 2).toFixed(1)} ${(p.y + p.h + 24).toFixed(1)})">${esc(n)}</text>`;
  return `<g data-node="${esc(n)}" data-total="${totals[column][n]}"><rect x="${p.x.toFixed(1)}" y="${p.y.toFixed(1)}" width="${p.w.toFixed(1)}" height="${p.h}" rx="${focus ? 9 : 5}" fill="${nodeFill(column, n)}" fill-opacity="${missing ? '.7' : '.88'}" stroke="${nodeStroke(column, n)}" stroke-width="${focus ? 2.6 : 1.2}"${missing ? ' stroke-dasharray="5 5"' : ''}/>${label}</g>`;
}).join('')}</g>`;

function metricCard(x, label, value, note, accent) {
  return `<g class="metric-card"><rect x="${x}" y="232" width="365" height="104" rx="9" fill="${C.wash}" stroke="${C.dust}"/><rect x="${x}" y="232" width="6" height="104" rx="3" fill="${accent}"/><text class="eyebrow" x="${x + 22}" y="260">${esc(label)}</text><text class="metric" x="${x + 22}" y="296">${esc(value)}</text><text class="metric-note" x="${x + 22}" y="320">${esc(note)}</text></g>`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc">
<title id="title">一封批，经过哪些手 · 竖向桑基网络</title><desc id="desc">${esc('B_人物字段清洗后.csv 的来源地、批局主体与收批县三段聚合网络；红色为叙事样本路径，灰蓝与灰褐为全库真实关系。')}</desc>
<style>text{font-family:"Noto Sans SC","Microsoft YaHei",sans-serif;fill:${C.ink}}.title{font-size:42px;font-weight:700;letter-spacing:1px}.sub{font-size:18px;fill:#665E56}.eyebrow{font-size:13px;letter-spacing:2px;fill:#6B625A}.metric{font-size:27px;font-weight:700}.metric-note{font-size:12px;fill:#6B625A}.stage{font-size:18px;font-weight:700;letter-spacing:3px}.stage-en{font-size:11px;letter-spacing:2px;fill:#7A7067}.node-label{font-size:16px;font-weight:600}.source-label{font-size:14px}.node-value{font-size:11px;fill:#6B625A}.office-label{font-size:12px;fill:#5E5650}.note{font-size:14px;fill:#6B625A}.tiny{font-size:11px;fill:#7A7067}.axis{font-size:12px;fill:#7A7067}.hair{vector-effect:non-scaling-stroke}</style>
<rect id="background" width="${W}" height="${H}" fill="${C.paper}"/>
<g id="paper-grid" opacity=".34"><path d="M80 382 H1760 M80 1780 H1760" stroke="${C.line}" stroke-dasharray="2 12"/><path d="M120 390 V1765 M1720 390 V1765" stroke="${C.line}" stroke-dasharray="2 12"/></g>
<g id="chart-title"><text class="title" x="80" y="72">一封批，经过哪些手</text><text class="sub" x="80" y="107">来源地 → 批局 → 收批县 · 50,064 条记录的中介网络</text><text class="tiny" x="1760" y="70" text-anchor="end">P02 / 中途 · 经批局</text><line x1="80" x2="1760" y1="142" y2="142" stroke="${C.line}"/><text class="tiny" x="80" y="165">新数据：B_人物字段清洗后.csv · A 表仅作人物字段审计，不与 B 表强行拼接</text></g>
${metricCard(80, '全库记录', fmt(total) + ' 条', '所有来源、批局、收批县层级', C.taupe)}
${metricCard(465, '三段字段齐全', fmt(data.quality.complete_source_office_county) + ' 条', '来源＋批局＋收批县均可识别', C.slate)}
${metricCard(850, '叙事样本路径', fmt(data.sample_path.count) + ' 条', '新加坡 → 万益成 → 潮安', C.red)}
${metricCard(1235, '批局缺失', fmt(data.quality.missing_office) + ' 条', '不应解释为某个具体批局', C.dust)}
<g id="map-silhouette" opacity=".42"><path d="M88 414 C148 392 192 401 225 427 L249 456 L232 479 L197 468 L173 492 L145 480 L124 502 L98 475 L70 462 Z" fill="${C.sea}" stroke="${C.slate}" stroke-width="1"/><path d="M1568 414 C1622 392 1697 402 1736 438 L1719 466 L1684 456 L1662 487 L1627 477 L1609 501 L1577 476 L1554 455 Z" fill="${C.sea}" stroke="${C.slate}" stroke-width="1"/><text class="tiny" x="88" y="530">南洋来源地 · 剪影装饰</text><text class="tiny" x="1568" y="530">潮汕收批场 · 剪影装饰</text><path d="M109 548 C167 565 190 565 240 548" fill="none" stroke="${C.red}" stroke-opacity=".5" stroke-width="2"/><path d="M1576 548 C1635 565 1687 565 1735 548" fill="none" stroke="${C.red}" stroke-opacity=".5" stroke-width="2"/></g>
<g id="stage-headers"><line x1="${plot.x}" x2="${plot.x + plot.width}" y1="390" y2="390" stroke="${C.line}"/><text class="stage" x="${plot.x}" y="372">寄出地</text><text class="stage-en" x="${plot.x + 80}" y="372">SOURCE</text><text class="stage" x="${plot.x}" y="928">经手批局</text><text class="stage-en" x="${plot.x + 110}" y="928">OFFICE</text><text class="stage" x="${plot.x}" y="1460">收批县</text><text class="stage-en" x="${plot.x + 95}" y="1460">COUNTY</text><line x1="${plot.x}" x2="${plot.x + plot.width}" y1="1770" y2="1770" stroke="${C.line}"/></g>
<g id="links-base">${renderLinks(sourceOfficeOffsets, 'source', 'office', 'links-source-office-base', 'base')}${renderLinks(officeCountyOffsets, 'office', 'county', 'links-office-county-base', 'base')}</g>
<g id="links-focus">${renderLinks(sourceOfficeOffsets, 'source', 'office', 'links-source-office-focus', 'focus')}${renderLinks(officeCountyOffsets, 'office', 'county', 'links-office-county-focus', 'focus')}</g>
${renderNodes('source', data.nodes.source, 'nodes-source')}${renderNodes('office', data.nodes.office, 'nodes-office')}${renderNodes('county', data.nodes.county, 'nodes-county')}
<g id="sample-path"><path d="M${sourceOfficeOffsets.get('source-office|新加坡|万益成').sx.toFixed(1)},${sourceOfficeOffsets.get('source-office|新加坡|万益成').sy.toFixed(1)} C${sourceOfficeOffsets.get('source-office|新加坡|万益成').sx.toFixed(1)},720 ${sourceOfficeOffsets.get('source-office|新加坡|万益成').tx.toFixed(1)},780 ${sourceOfficeOffsets.get('source-office|新加坡|万益成').tx.toFixed(1)},1000" fill="none" stroke="${C.red}" stroke-opacity=".92" stroke-width="2.5" stroke-dasharray="8 7"/><path d="M${officeCountyOffsets.get('office-county|万益成|潮安').sx.toFixed(1)},1028 C${officeCountyOffsets.get('office-county|万益成|潮安').sx.toFixed(1)},1210 ${officeCountyOffsets.get('office-county|万益成|潮安').tx.toFixed(1)},1320 ${officeCountyOffsets.get('office-county|万益成|潮安').tx.toFixed(1)},1530" fill="none" stroke="${C.red}" stroke-opacity=".92" stroke-width="2.5" stroke-dasharray="8 7"/><g transform="translate(1180 742)"><rect width="420" height="92" rx="8" fill="${C.paper}" fill-opacity=".95" stroke="${C.red}"/><text class="eyebrow" x="20" y="26" fill="${C.red}">NARRATIVE SAMPLE · 叙事样本</text><text class="node-label" x="20" y="52">新加坡 → 万益成 → 潮安</text><text class="node-value" x="20" y="73">${fmt(data.sample_path.count)} 条真实组合 · 不代表全库总流量</text></g></g>
<g id="legend" transform="translate(80 1810)"><rect width="1680" height="106" rx="8" fill="${C.wash}" stroke="${C.dust}"/><text class="eyebrow" x="22" y="27">视觉编码 / ENCODING</text><rect x="22" y="46" width="88" height="12" rx="6" fill="${C.slate}" fill-opacity=".2"/><text class="note" x="128" y="57">灰蓝细带：全库真实聚合关系，带宽 ∝ 记录数</text><rect x="620" y="46" width="88" height="12" rx="6" fill="${C.taupe}" fill-opacity=".5"/><text class="note" x="726" y="57">灰褐主流：各阶段记录量排名靠前的关系</text><rect x="1230" y="46" width="88" height="12" rx="6" fill="${C.red}" fill-opacity=".8"/><text class="note" x="1336" y="57">砖红虚线：叙事样本路径</text><text class="tiny" x="22" y="84">缺失值以“未记录”显示；“其他”仅表示 Top-N 之外的真实类别合并，地图剪影仅作装饰，不承担行政边界信息。</text></g>
<g id="missing-audit"><text class="tiny" x="80" y="1954">缺失审计：寄批地未记录 ${fmt(data.quality.missing_source)} 条 · 批局未记录 ${fmt(data.quality.missing_office)} 条 · 收批县未记录 ${fmt(data.quality.missing_county)} 条 · 批局串列 ${fmt(data.quality.multi_office_rows)} 条（未重构先后顺序）</text></g>
<g id="source-and-notes"><text class="tiny" x="80" y="1990">数据来源：B_人物字段清洗后.csv；使用字段：寄批国家地区_统一／寄批国家或地区、批局主体名／批局完整名称、收批县域_统一／收批县。A_人物字段清洗后.csv 与 B 表没有稳定跨表键，未用于补造路径。</text><text class="tiny" x="1760" y="1990" text-anchor="end">单位：侨批记录条数 · 可编辑 SVG 分组 · v2-csv</text></g>
</svg>`;

const output = path.join(outDir, 'panel-02-threads-vertical-sankey-v2.svg');
fs.writeFileSync(output, svg);
console.log(JSON.stringify({ output: 'charts/svg/panel-02-threads-vertical-sankey-v2.svg', sourceEdges: sourceEdges.length, officeEdges: officeEdges.length, sample: data.sample_path.count }));


