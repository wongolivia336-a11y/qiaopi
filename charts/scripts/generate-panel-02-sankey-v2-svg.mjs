import fs from 'node:fs';
import path from 'node:path';

// P02 visual upgrade: preserve every real routeTriples edge, but add a
// legibility hierarchy so the poster reads as a dense archival network rather
// than a uniformly dark hairball. All marks remain native SVG groups.
const root = path.resolve(import.meta.dirname, '..', '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data', 'derived', 'panel-02-sankey-derived-v1.json'), 'utf8'));
const outDir = path.join(root, 'charts', 'svg');
fs.mkdirSync(outDir, { recursive: true });

const C = {
  paper: '#E9E1D2', ink: '#3E3933', slate: '#718083', red: '#9E4435',
  taupe: '#81786D', county: '#687371', dust: '#B9A58F', pale: '#D8CFC0',
  wash: '#F2EDE4', line: '#B9ADA0'
};
const fmt = n => new Intl.NumberFormat('zh-CN').format(n);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
const sourceEdges = data.edges.filter(d => d.stage === 'source-office');
const officeEdges = data.edges.filter(d => d.stage === 'office-county');
const sourceTotals = Object.fromEntries(data.nodes.source.map(n => [n, 0]));
const officeTotals = Object.fromEntries(data.nodes.office.map(n => [n, 0]));
const countyTotals = Object.fromEntries(data.nodes.county.map(n => [n, 0]));
for (const e of sourceEdges) { sourceTotals[e.source] += e.count; officeTotals[e.target] += e.count; }
for (const e of officeEdges) countyTotals[e.target] += e.count;

const W = 1900, H = 1650, plotTop = 378, plotBottom = 1192, nodeW = 40, gap = 17;
const X = { source: 150, office: 858, county: 1575 };
const total = data.rows;
const scale = (plotBottom - plotTop - gap * 7) / total;
const totalKnown = sourceEdges.reduce((s, e) => s + e.count, 0);
const topSourceOffice = [...sourceEdges].sort((a, b) => b.count - a.count).slice(0, 16);
const topOfficeCounty = [...officeEdges].sort((a, b) => b.count - a.count).slice(0, 16);

function columnLayout(nodes, totals) {
  const used = nodes.reduce((sum, n) => sum + totals[n] * scale, 0) + gap * (nodes.length - 1);
  let y = plotTop + (plotBottom - plotTop - used) / 2;
  const out = {};
  for (const n of nodes) {
    const h = Math.max(2.6, totals[n] * scale);
    out[n] = { y, h, total: totals[n] };
    y += h + gap;
  }
  return out;
}
const layout = {
  source: columnLayout(data.nodes.source, sourceTotals),
  office: columnLayout(data.nodes.office, officeTotals),
  county: columnLayout(data.nodes.county, countyTotals),
};

function linkPath(x1, y1, x2, y2, h) {
  const bend = Math.min(260, (x2 - x1) * 0.46);
  return `M${x1},${y1} C${x1 + bend},${y1} ${x2 - bend},${y2} ${x2},${y2} L${x2},${y2 + h} C${x2 - bend},${y2 + h} ${x1 + bend},${y1 + h} ${x1},${y1 + h} Z`;
}

function renderLinks(edges, leftColumn, rightColumn, groupId, mode = 'base') {
  const leftOffset = Object.fromEntries(data.nodes[leftColumn].map(n => [n, 0]));
  const rightOffset = Object.fromEntries(data.nodes[rightColumn].map(n => [n, 0]));
  const ordered = [...edges].sort((a, b) => {
    const leftOrder = data.nodes[leftColumn].indexOf(a.source) - data.nodes[leftColumn].indexOf(b.source);
    return leftOrder || data.nodes[rightColumn].indexOf(a.target) - data.nodes[rightColumn].indexOf(b.target);
  });
  const parts = [];
  for (const e of ordered) {
    const h = Math.max(0.8, e.count * scale);
    const sy = layout[leftColumn][e.source].y + leftOffset[e.source];
    const ty = layout[rightColumn][e.target].y + rightOffset[e.target];
    leftOffset[e.source] += h; rightOffset[e.target] += h;
    const sample = (e.source === '新加坡' && e.target === '万益成') || (e.source === '万益成' && e.target === '潮安');
    const isFocus = (leftColumn === 'source' ? topSourceOffice : topOfficeCounty).some(f => f.source === e.source && f.target === e.target);
    if (mode === 'focus' && !isFocus) continue;
    if (mode === 'base' && isFocus) continue;
    const fill = sample ? C.red : C.slate;
    const opacity = sample ? 0.64 : Math.min(0.28, 0.065 + Math.log10(e.count + 1) * 0.05);
    const stroke = mode === 'focus' ? (sample ? C.red : C.taupe) : 'none';
    const strokeOpacity = mode === 'focus' ? (sample ? 0.76 : 0.28) : 0;
    const strokeWidth = mode === 'focus' ? (sample ? 1.8 : 0.8) : 0;
    parts.push(`<path data-key="${esc(e.source)}|${esc(e.target)}" data-count="${e.count}" data-tier="${mode}" d="${linkPath(X[leftColumn] + nodeW, sy, X[rightColumn], ty, h)}" fill="${fill}" fill-opacity="${opacity.toFixed(3)}" stroke="${stroke}" stroke-opacity="${strokeOpacity}" stroke-width="${strokeWidth}"><title>${esc(e.source)} → ${esc(e.target)}：${fmt(e.count)} 条${isFocus ? ' · 主流路径' : ''}</title></path>`);
  }
  return `<g id="${groupId}" data-layer="${mode}">${parts.join('')}</g>`;
}

function nodeColor(column, n) {
  if (n.startsWith('未记录')) return C.pale;
  if (column === 'source') return C.slate;
  if (column === 'office') return n === '万益成' ? C.red : C.taupe;
  return C.county;
}

function renderNodes(column, nodes, totals) {
  return `<g id="sankey-nodes-${column}">${nodes.map(n => {
    const item = layout[column][n];
    const missing = n.startsWith('未记录');
    const focus = n === '万益成' || n === '潮安' || n === '新加坡';
    const fill = nodeColor(column, n);
    const stroke = missing ? C.taupe : (focus ? C.red : C.paper);
    const textX = column === 'source' ? X[column] - 18 : X[column] + nodeW + 18;
    const anchor = column === 'source' ? 'end' : 'start';
    const dash = missing ? ' stroke-dasharray="5 5"' : '';
    const pct = (totals[n] / total * 100).toFixed(1);
    return `<g data-node="${esc(n)}" data-total="${totals[n]}"><rect x="${X[column]}" y="${item.y.toFixed(1)}" width="${nodeW}" height="${item.h.toFixed(1)}" rx="12" fill="${fill}" fill-opacity="${missing ? '.62' : '.84'}" stroke="${stroke}" stroke-width="${focus ? 2.5 : 1.5}"${dash}/><rect x="${X[column] + 7}" y="${(item.y + 5).toFixed(1)}" width="6" height="${Math.max(0, item.h - 10).toFixed(1)}" rx="3" fill="${C.paper}" fill-opacity=".36"/><text class="label" x="${textX}" y="${(item.y + Math.min(21, item.h) + 3).toFixed(1)}" text-anchor="${anchor}">${esc(n)}</text><text class="small" x="${textX}" y="${(item.y + Math.min(41, item.h + 19)).toFixed(1)}" text-anchor="${anchor}">${fmt(totals[n])} 条 · ${pct}%</text></g>`;
  }).join('')}</g>`;
}

function summaryCard(x, label, value, note, accent = C.slate) {
  return `<g class="summary-card"><rect x="${x}" y="184" width="370" height="120" rx="8" fill="${C.wash}" stroke="${C.dust}"/><rect x="${x}" y="184" width="6" height="120" rx="3" fill="${accent}"/><text class="eyebrow" x="${x + 24}" y="214">${esc(label)}</text><text class="metric" x="${x + 24}" y="254">${esc(value)}</text><text class="card-note" x="${x + 24}" y="280">${esc(note)}</text></g>`;
}

const title = '一封批，经过哪些手';
const subtitle = '来源国 → 批局 → 收批县 · 真实聚合网络的主流、细流与缺失层';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc">
<title id="title">${esc(title)}</title><desc id="desc">${esc(subtitle)}</desc>
<style>text{font-family:"Microsoft YaHei","Noto Sans CJK SC",sans-serif;fill:${C.ink}}.title{font-size:46px;font-weight:700;letter-spacing:1px}.sub{font-size:20px;fill:#5F5850}.eyebrow{font-size:15px;letter-spacing:2px;fill:#6B625A}.metric{font-size:29px;font-weight:700}.card-note{font-size:14px;fill:#6B625A}.column{font-size:18px;font-weight:700;letter-spacing:3px}.label{font-size:17px}.small{font-size:13px;fill:#6B625A}.note{font-size:15px;fill:#6B625A}.tiny{font-size:12px;fill:#7A7067}.hair{vector-effect:non-scaling-stroke}.stage-rule{stroke:${C.line};stroke-dasharray:3 9;stroke-width:1}</style>
<rect id="background" width="${W}" height="${H}" fill="${C.paper}"/>
<g id="chart-title"><text class="title" x="78" y="78">${esc(title)}</text><text class="sub" x="78" y="116">${esc(subtitle)}</text><text class="small" x="1820" y="78" text-anchor="end">CONTRACT · routeTriples / Sankey v2</text></g>
${summaryCard(78, '全库记录', fmt(total) + ' 条', '三段节点总量保留未知类别', C.taupe)}
${summaryCard(472, '可识别三段网络', fmt(totalKnown) + ' 条', '来源—批局边的聚合记录合计', C.slate)}
${summaryCard(866, '叙事样本路径', fmt(data.sample_path.count) + ' 条', '新加坡 → 万益成 → 潮安（真实组合）', C.red)}
${summaryCard(1260, '缺失批局', fmt(data.raw_totals.office['未记录批局']) + ' 条', '不可解释为某个具体批局', C.dust)}
<g id="stage-headers"><rect x="78" y="330" width="1744" height="38" fill="${C.wash}" stroke="${C.dust}"/><text class="column" x="${X.source + nodeW / 2}" y="356" text-anchor="middle">寄出地</text><text class="tiny" x="${X.source + nodeW / 2}" y="347" text-anchor="middle">SOURCE</text><text class="column" x="${X.office + nodeW / 2}" y="356" text-anchor="middle">经手批局</text><text class="tiny" x="${X.office + nodeW / 2}" y="347" text-anchor="middle">OFFICE</text><text class="column" x="${X.county + nodeW / 2}" y="356" text-anchor="middle">收批县</text><text class="tiny" x="${X.county + nodeW / 2}" y="347" text-anchor="middle">COUNTY</text><line class="stage-rule" x1="${X.source + nodeW / 2}" x2="${X.source + nodeW / 2}" y1="368" y2="1218"/><line class="stage-rule" x1="${X.office + nodeW / 2}" x2="${X.office + nodeW / 2}" y1="368" y2="1218"/><line class="stage-rule" x1="${X.county + nodeW / 2}" x2="${X.county + nodeW / 2}" y1="368" y2="1218"/></g>
<g id="sankey-links-base">${renderLinks(sourceEdges, 'source', 'office', 'links-source-office-base', 'base')}${renderLinks(officeEdges, 'office', 'county', 'links-office-county-base', 'base')}</g>
<g id="sankey-links-focus">${renderLinks(sourceEdges, 'source', 'office', 'links-source-office-focus', 'focus')}${renderLinks(officeEdges, 'office', 'county', 'links-office-county-focus', 'focus')}</g>
${renderNodes('source', data.nodes.source, sourceTotals)}${renderNodes('office', data.nodes.office, officeTotals)}${renderNodes('county', data.nodes.county, countyTotals)}
<g id="flow-index" transform="translate(78 1235)"><rect width="1744" height="92" rx="8" fill="${C.wash}" stroke="${C.dust}"/><text class="eyebrow" x="24" y="26">视觉层级 / FLOW INDEX</text><line x1="24" y1="52" x2="88" y2="52" stroke="${C.slate}" stroke-opacity=".18" stroke-width="12"/><text class="note" x="104" y="57">细流：全部真实聚合边，低透明度保留网络复杂度</text><line x1="625" y1="52" x2="690" y2="52" stroke="${C.taupe}" stroke-opacity=".50" stroke-width="12"/><text class="note" x="706" y="57">主流：按记录量排名的前 16 条关系，加细描边便于阅读</text><line x1="1305" y1="52" x2="1370" y2="52" stroke="${C.red}" stroke-opacity=".68" stroke-width="12"/><text class="note" x="1386" y="57">砖红：叙事样本路径，不代表全库总流量</text></g>
<g id="sample-path-inset" transform="translate(78 1360)"><rect width="1080" height="210" rx="8" fill="${C.wash}" stroke="${C.dust}"/><text class="eyebrow" x="24" y="30">叙事样本路径 · 从来源到抵达的局部放大</text><text class="tiny" x="24" y="52">该局部放大只重绘真实组合关系，不添加人工模拟边；数值来自 routeTriples。</text><path d="M210 125 C330 70 390 70 500 125 C610 180 660 180 780 125" fill="none" stroke="${C.red}" stroke-opacity=".28" stroke-width="34"/><circle cx="210" cy="125" r="27" fill="${C.slate}" stroke="${C.paper}" stroke-width="5"/><circle cx="500" cy="125" r="31" fill="${C.red}" stroke="${C.paper}" stroke-width="5"/><circle cx="780" cy="125" r="27" fill="${C.county}" stroke="${C.paper}" stroke-width="5"/><text class="label" x="210" y="178" text-anchor="middle">新加坡</text><text class="small" x="210" y="198" text-anchor="middle">来源国</text><text class="label" x="500" y="178" text-anchor="middle">万益成</text><text class="small" x="500" y="198" text-anchor="middle">批局</text><text class="label" x="780" y="178" text-anchor="middle">潮安</text><text class="small" x="780" y="198" text-anchor="middle">收批县</text><text class="metric" x="970" y="120" text-anchor="middle">${fmt(data.sample_path.count)}</text><text class="small" x="970" y="147" text-anchor="middle">条真实组合</text></g>
<g id="missing-audit" transform="translate(1185 1360)"><rect width="637" height="210" rx="8" fill="${C.wash}" stroke="${C.dust}"/><text class="eyebrow" x="24" y="30">缺失值与聚合边界</text><text class="note" x="24" y="62">来源国未记录：${fmt(data.raw_totals.source['未记录来源'])} 条</text><text class="note" x="24" y="91">批局名未记录：${fmt(data.raw_totals.office['未记录批局'])} 条</text><text class="note" x="24" y="120">收批县未记录：${fmt(data.raw_totals.county['未记录收批县'])} 条</text><text class="tiny" x="24" y="153">“其他”是 Top-N 之外的真实类别合并；</text><text class="tiny" x="24" y="174">“未记录”是字段缺失，不是真实地点。</text></g>
<g id="source-and-notes"><text class="tiny" x="78" y="1602">数据来源：本地《侨批可用数据(1).xlsx》字段级聚合；使用字段：来源国、批局名、收批县；仓库不保存原始 Excel。聚合路径不是逐件中转时间顺序。</text><text class="tiny" x="1822" y="1602" text-anchor="end">单位：侨批记录条数 · 可编辑 SVG 分组</text></g>
</svg>\n`;

const output = path.join(outDir, 'panel-02-threads-sankey-v2.svg');
fs.writeFileSync(output, svg);
console.log(JSON.stringify({ output: 'charts/svg/panel-02-threads-sankey-v2.svg', sourceEdges: sourceEdges.length, officeEdges: officeEdges.length, focusSourceOffice: topSourceOffice.length, focusOfficeCounty: topOfficeCounty.length, scale }));

