import fs from 'node:fs';
import path from 'node:path';

// Circular / chord alternative for P02. It keeps the same routeTriples data as
// the layered Sankey, but gives the network a circular, archival diagram shape.
const root = path.resolve(import.meta.dirname, '..', '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data', 'derived', 'panel-02-sankey-derived-v1.json'), 'utf8'));
const outDir = path.join(root, 'charts', 'svg');
fs.mkdirSync(outDir, { recursive: true });

const C = {
  paper: '#E9E1D2', ink: '#3E3933', slate: '#718083', red: '#9E4435',
  taupe: '#81786D', county: '#687371', dust: '#B9A58F', pale: '#D8CFC0',
  wash: '#F2EDE4', line: '#B9ADA0'
};
const W = 1900, H = 1500, cx = 950, cy = 790, R = 430;
const fmt = n => new Intl.NumberFormat('zh-CN').format(n);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));

const sourceEdges = data.edges.filter(d => d.stage === 'source-office');
const officeEdges = data.edges.filter(d => d.stage === 'office-county');
const sourceTotals = Object.fromEntries(data.nodes.source.map(n => [n, 0]));
const officeTotals = Object.fromEntries(data.nodes.office.map(n => [n, 0]));
const countyTotals = Object.fromEntries(data.nodes.county.map(n => [n, 0]));
for (const e of sourceEdges) { sourceTotals[e.source] += e.count; officeTotals[e.target] += e.count; }
for (const e of officeEdges) countyTotals[e.target] += e.count;

// Three stage arcs around the circular field. The slight gaps are intentional,
// so the circle reads as a designed instrument rather than a pie chart.
const stageNodes = [
  { key: 'source', label: '来源国', nodes: data.nodes.source, start: 204, end: 304, color: C.slate, totals: sourceTotals },
  { key: 'office', label: '批局', nodes: data.nodes.office, start: 310, end: 50, color: C.taupe, totals: officeTotals },
  { key: 'county', label: '收批县', nodes: data.nodes.county, start: 56, end: 196, color: C.county, totals: countyTotals }
];

function polar(deg, radius = R) {
  const a = deg * Math.PI / 180;
  return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
}
function unwrapEnd(start, end) { return end < start ? end + 360 : end; }
function angleFor(stage, i) {
  const end = unwrapEnd(stage.start, stage.end);
  return stage.nodes.length === 1 ? (stage.start + end) / 2 : stage.start + (end - stage.start) * (i / (stage.nodes.length - 1));
}
const pos = {};
for (const stage of stageNodes) {
  stage.nodes.forEach((node, i) => { pos[`${stage.key}:${node}`] = { angle: angleFor(stage, i), ...polar(angleFor(stage, i)) }; });
}

const topSourceOffice = [...sourceEdges].sort((a, b) => b.count - a.count).slice(0, 12);
const topOfficeCounty = [...officeEdges].sort((a, b) => b.count - a.count).slice(0, 12);
const maxCount = Math.max(...data.edges.map(e => e.count));
const widthFor = count => Math.max(0.65, Math.min(16, 0.65 + Math.sqrt(count / maxCount) * 13));
const opacityFor = count => Math.min(0.30, 0.035 + Math.log10(count + 1) * 0.045);

function edgePath(a, b, bow = 0) {
  const p1 = pos[`${a.stage === 'source-office' ? 'source' : 'office'}:${a.source}`];
  const p2 = pos[`${a.stage === 'source-office' ? 'office' : 'county'}:${a.target}`];
  const m = polar((p1.angle + p2.angle) / 2 + bow, 118 + Math.abs(p1.angle - p2.angle) * 0.24);
  return `M${p1.x.toFixed(1)},${p1.y.toFixed(1)} Q${m.x.toFixed(1)},${m.y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
}
function renderEdges(edges, id, mode = 'base') {
  const selected = mode === 'focus' ? edges : data.edges;
  const sourceSet = new Set(topSourceOffice.map(e => `${e.stage}|${e.source}|${e.target}`));
  const officeSet = new Set(topOfficeCounty.map(e => `${e.stage}|${e.source}|${e.target}`));
  const parts = [];
  for (const e of selected) {
    const key = `${e.stage}|${e.source}|${e.target}`;
    const isFocus = sourceSet.has(key) || officeSet.has(key);
    if (mode === 'base' && isFocus) continue;
    if (mode === 'focus' && !isFocus) continue;
    const sample = (e.source === '新加坡' && e.target === '万益成') || (e.source === '万益成' && e.target === '潮安');
    const stroke = sample ? C.red : (e.stage === 'source-office' ? C.slate : C.taupe);
    const opacity = sample ? 0.78 : (mode === 'focus' ? 0.48 : opacityFor(e.count));
    const width = sample ? 13 : (mode === 'focus' ? widthFor(e.count) : Math.max(0.45, widthFor(e.count) * 0.48));
    const bow = e.stage === 'source-office' ? -8 : 8;
    parts.push(`<path data-key="${esc(key)}" data-count="${e.count}" d="${edgePath(e, e, bow)}" fill="none" stroke="${stroke}" stroke-opacity="${opacity.toFixed(3)}" stroke-width="${width.toFixed(2)}" stroke-linecap="round"><title>${esc(e.source)} → ${esc(e.target)}：${fmt(e.count)} 条</title></path>`);
  }
  return `<g id="${id}" data-layer="${mode}">${parts.join('')}</g>`;
}

function arcPath(start, end, radius) {
  const p1 = polar(start, radius); const p2 = polar(end, radius);
  const large = unwrapEnd(start, end) - start > 180 ? 1 : 0;
  return `M${p1.x.toFixed(1)},${p1.y.toFixed(1)} A${radius},${radius} 0 ${large} 1 ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
}
function renderStageArc(stage) {
  const end = unwrapEnd(stage.start, stage.end);
  const total = stage.nodes.reduce((s, n) => s + stage.totals[n], 0);
  return `<g id="stage-arc-${stage.key}"><path d="${arcPath(stage.start, end, R)}" fill="none" stroke="${C.pale}" stroke-width="25"/><path d="${arcPath(stage.start, end, R)}" fill="none" stroke="${stage.color}" stroke-opacity=".55" stroke-width="10"/><text class="stage" x="${polar((stage.start + end) / 2, R + 66).x.toFixed(1)}" y="${(polar((stage.start + end) / 2, R + 66).y + 5).toFixed(1)}" text-anchor="middle">${stage.label}</text><text class="tiny" x="${polar((stage.start + end) / 2, R + 88).x.toFixed(1)}" y="${(polar((stage.start + end) / 2, R + 88).y + 4).toFixed(1)}" text-anchor="middle">${fmt(total)} 条</text>${stage.nodes.map((n, i) => { const p = pos[`${stage.key}:${n}`]; const missing = n.startsWith('未记录'); const focus = n === '新加坡' || n === '万益成' || n === '潮安'; return `<g data-node="${esc(n)}" data-total="${stage.totals[n]}"><circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${focus ? 15 : 11}" fill="${missing ? C.pale : (focus ? C.red : stage.color)}" fill-opacity="${missing ? '.75' : '.9'}" stroke="${missing || focus ? C.red : C.paper}" stroke-width="${focus ? 3 : 2}"${missing ? ' stroke-dasharray="4 3"' : ''}/><text class="node" x="${polar(p.angle, R + 30).x.toFixed(1)}" y="${(polar(p.angle, R + 30).y + 4).toFixed(1)}" text-anchor="middle">${esc(n)}</text></g>`; }).join('')}</g>`;
}

const total = data.rows;
const sample = data.sample_path;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc">
<title id="title">圆形流向图：来源国、批局与收批县</title><desc id="desc">基于 routeTriples 的圆形弦图替代视图，展示来源—批局—收批县的真实关系。</desc>
<style>text{font-family:"Microsoft YaHei","Noto Sans CJK SC",sans-serif;fill:${C.ink}}.title{font-size:42px;font-weight:700;letter-spacing:1px}.sub{font-size:19px;fill:#5F5850}.stage{font-size:18px;font-weight:700;letter-spacing:3px}.node{font-size:14px}.tiny{font-size:12px;fill:#6B625A}.note{font-size:14px;fill:#6B625A}.eyebrow{font-size:13px;letter-spacing:2px;fill:#6B625A}.metric{font-size:28px;font-weight:700}</style>
<rect id="background" width="${W}" height="${H}" fill="${C.paper}"/>
<g id="chart-title"><text class="title" x="78" y="80">圆形流向图 · 一封批经过哪些手</text><text class="sub" x="78" y="116">来源国 → 批局 → 收批县 · circular chord / archival network view</text><text class="tiny" x="1820" y="80" text-anchor="end">CONTRACT · routeTriples</text></g>
<g id="summary"><rect x="78" y="160" width="1744" height="86" rx="8" fill="${C.wash}" stroke="${C.dust}"/><text class="eyebrow" x="104" y="191">全库记录</text><text class="metric" x="104" y="226">${fmt(total)} 条</text><text class="eyebrow" x="420" y="191">叙事样本</text><text class="metric" x="420" y="226" fill="${C.red}">${fmt(sample.count)} 条</text><text class="note" x="740" y="215">${esc(sample.source)} → ${esc(sample.office)} → ${esc(sample.county)}（真实组合，仅作叙事样本）</text><text class="eyebrow" x="1460" y="191">图例</text><circle cx="1550" cy="217" r="7" fill="${C.slate}"/><text class="note" x="1568" y="222">寄出地</text><circle cx="1650" cy="217" r="7" fill="${C.taupe}"/><text class="note" x="1668" y="222">批局</text><circle cx="1740" cy="217" r="7" fill="${C.county}"/><text class="note" x="1758" y="222">收批县</text></g>
<g id="radial-field"><circle cx="${cx}" cy="${cy}" r="${R - 16}" fill="${C.wash}" fill-opacity=".58" stroke="${C.dust}" stroke-width="1" stroke-dasharray="2 8"/><circle cx="${cx}" cy="${cy}" r="126" fill="${C.paper}" stroke="${C.dust}"/><circle cx="${cx}" cy="${cy}" r="106" fill="none" stroke="${C.pale}" stroke-width="1" stroke-dasharray="3 6"/><text class="eyebrow" x="${cx}" y="${cy - 18}" text-anchor="middle">侨批网络</text><text class="metric" x="${cx}" y="${cy + 25}" text-anchor="middle">${fmt(total)}</text><text class="tiny" x="${cx}" y="${cy + 52}" text-anchor="middle">条记录 · 圆形总览</text></g>
${renderEdges(data.edges, 'chord-links-base', 'base')}${renderEdges(data.edges, 'chord-links-focus', 'focus')}
${stageNodes.map(renderStageArc).join('')}
<g id="annotation" transform="translate(78 1335)"><rect width="1744" height="92" rx="8" fill="${C.wash}" stroke="${C.dust}"/><text class="eyebrow" x="24" y="28">阅读方式</text><text class="note" x="24" y="57">淡线：全部真实聚合关系；加粗线：按记录量筛出的主要关系；砖红：叙事样本路径。圆周节点按来源国、批局、收批县分段排列。</text><text class="tiny" x="24" y="78">“其他”是 Top-N 之外的真实类别合并；“未记录”是字段缺失，不是真实地点。</text><text class="tiny" x="1660" y="78" text-anchor="end">单位：侨批记录条数 · 可编辑 SVG 分组</text></g>
<text class="tiny" x="78" y="1472">数据来源：本地《侨批可用数据(1).xlsx》字段级聚合；使用字段：来源国、批局名、收批县；仓库不保存原始 Excel。${' '}</text>
</svg>`;

const output = path.join(outDir, 'panel-02-circular-chord-v1.svg');
fs.writeFileSync(output, svg);
console.log(JSON.stringify({ output: 'charts/svg/panel-02-circular-chord-v1.svg', baseEdges: data.edges.length, focusEdges: topSourceOffice.length + topOfficeCounty.length }));

