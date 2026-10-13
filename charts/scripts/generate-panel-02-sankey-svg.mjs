import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data', 'derived', 'panel-02-sankey-derived-v1.json'), 'utf8'));
const outDir = path.join(root, 'charts', 'svg');
fs.mkdirSync(outDir, { recursive: true });

const C = { paper: '#E9E1D2', ink: '#27231F', slate: '#718083', red: '#9E4435', taupe: '#81786D', dust: '#B9A58F', pale: '#D8CFC0' };
const fmt = n => new Intl.NumberFormat('zh-CN').format(n);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
const sourceEdges = data.edges.filter(d => d.stage === 'source-office');
const officeEdges = data.edges.filter(d => d.stage === 'office-county');
const sourceTotals = Object.fromEntries(data.nodes.source.map(n => [n, 0]));
const officeTotals = Object.fromEntries(data.nodes.office.map(n => [n, 0]));
const countyTotals = Object.fromEntries(data.nodes.county.map(n => [n, 0]));
for (const e of sourceEdges) { sourceTotals[e.source] += e.count; officeTotals[e.target] += e.count; }
for (const e of officeEdges) countyTotals[e.target] += e.count;

const W = 1600, H = 1500, plotTop = 285, plotBottom = 1215, nodeW = 34, gap = 20;
const X = { source: 120, office: 705, county: 1310 };
const total = data.rows;
const scale = (plotBottom - plotTop - gap * 7) / total;

function columnLayout(nodes, totals) {
  const used = nodes.reduce((sum, n) => sum + totals[n] * scale, 0) + gap * (nodes.length - 1);
  let y = plotTop + (plotBottom - plotTop - used) / 2;
  const out = {};
  for (const n of nodes) { const h = Math.max(2.4, totals[n] * scale); out[n] = { y, h, total: totals[n] }; y += h + gap; }
  return out;
}

const layout = {
  source: columnLayout(data.nodes.source, sourceTotals),
  office: columnLayout(data.nodes.office, officeTotals),
  county: columnLayout(data.nodes.county, countyTotals),
};

function linkPath(x1, y1, x2, y2, h) {
  const bend = Math.min(230, (x2 - x1) * 0.46);
  return `M${x1},${y1} C${x1 + bend},${y1} ${x2 - bend},${y2} ${x2},${y2} L${x2},${y2 + h} C${x2 - bend},${y2 + h} ${x1 + bend},${y1 + h} ${x1},${y1 + h} Z`;
}

function renderLinks(edges, leftColumn, rightColumn, groupId) {
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
    const fill = sample ? C.red : C.slate;
    // Preserve exact width while reducing the visual fog created by dozens of
    // low-volume links. A larger relation gets a slightly darker archival ink.
    const opacity = sample ? 0.72 : Math.min(0.34, 0.10 + Math.log10(e.count + 1) * 0.055);
    parts.push(`<path data-key="${esc(e.source)}|${esc(e.target)}" d="${linkPath(X[leftColumn] + nodeW, sy, X[rightColumn], ty, h)}" fill="${fill}" fill-opacity="${opacity.toFixed(3)}" stroke="${sample ? C.red : 'none'}" stroke-opacity="${sample ? 0.2 : 0}"><title>${esc(e.source)} → ${esc(e.target)}：${fmt(e.count)} 条</title></path>`);
  }
  return `<g id="${groupId}">${parts.join('')}</g>`;
}

function renderNodes(column, nodes, totals, color) {
  return `<g id="sankey-nodes-${column}">${nodes.map(n => {
    const item = layout[column][n];
    const missing = n.startsWith('未记录');
    const fill = missing ? C.pale : color;
    const stroke = missing ? C.taupe : C.paper;
    const textX = column === 'source' ? X[column] - 16 : X[column] + nodeW + 16;
    const anchor = column === 'source' ? 'end' : 'start';
    const dash = missing ? ' stroke-dasharray="4 4"' : '';
    return `<g data-node="${esc(n)}"><rect x="${X[column]}" y="${item.y.toFixed(1)}" width="${nodeW}" height="${item.h.toFixed(1)}" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="2"${dash}/><text class="label" x="${textX}" y="${(item.y + Math.min(22, item.h) + 3).toFixed(1)}" text-anchor="${anchor}">${esc(n)}</text><text class="small" x="${textX}" y="${(item.y + Math.min(42, item.h + 20)).toFixed(1)}" text-anchor="${anchor}">${fmt(totals[n])} 条</text></g>`;
  }).join('')}</g>`;
}

const title = '一封批，经过哪些手';
const subtitle = '来源国 → 批局 → 收批县 · 每条带宽＝聚合记录数 · 真实字段级关系，不是人工模拟边';
const sourceOffice = renderLinks(sourceEdges, 'source', 'office', 'sankey-links-source-office');
const officeCounty = renderLinks(officeEdges, 'office', 'county', 'sankey-links-office-county');
const nodes = [
  renderNodes('source', data.nodes.source, sourceTotals, C.slate),
  renderNodes('office', data.nodes.office, officeTotals, C.taupe),
  renderNodes('county', data.nodes.county, countyTotals, C.ink),
].join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc">
<title id="title">${esc(title)}</title><desc id="desc">${esc(subtitle)}</desc>
<style>text{font-family:"Microsoft YaHei","Noto Sans CJK SC",sans-serif;fill:${C.ink}}.title{font-size:42px;font-weight:700}.sub{font-size:20px;fill:#5F5850}.column{font-size:17px;font-weight:700;letter-spacing:2px}.label{font-size:17px}.small{font-size:14px;fill:#5F5850}.note{font-size:15px;fill:#5F5850}.hair{vector-effect:non-scaling-stroke}</style>
<rect id="background" width="${W}" height="${H}" fill="${C.paper}"/>
<g id="chart-title"><text class="title" x="70" y="76">${esc(title)}</text><text class="sub" x="70" y="115">${esc(subtitle)}</text><text class="small" x="1530" y="76" text-anchor="end">CONTRACT · threads / sankey</text></g>
<g id="column-labels"><rect x="70" y="170" width="330" height="72" rx="10" fill="${C.paper}" stroke="${C.dust}"/><rect x="635" y="170" width="330" height="72" rx="10" fill="${C.paper}" stroke="${C.dust}"/><rect x="1200" y="170" width="330" height="72" rx="10" fill="${C.paper}" stroke="${C.dust}"/><text class="column" x="${X.source + nodeW / 2}" y="200" text-anchor="middle">来源国</text><text class="small" x="${X.source + nodeW / 2}" y="222" text-anchor="middle">寄出地 / 记录数</text><text class="column" x="${X.office + nodeW / 2}" y="200" text-anchor="middle">批局名</text><text class="small" x="${X.office + nodeW / 2}" y="222" text-anchor="middle">中转节点 / 记录数</text><text class="column" x="${X.county + nodeW / 2}" y="200" text-anchor="middle">收批县</text><text class="small" x="${X.county + nodeW / 2}" y="222" text-anchor="middle">抵达地 / 记录数</text><line x1="70" x2="1530" y1="255" y2="255" stroke="${C.dust}"/></g>
${sourceOffice}${officeCounty}${nodes}
<g id="annotations"><rect x="70" y="1275" width="1460" height="125" fill="none" stroke="${C.dust}"/><text class="note" x="95" y="1312">砖红带：叙事样本路径，新加坡 → 万益成 → 潮安；该组合在原始记录中出现 ${fmt(data.sample_path.count)} 条，不代表全库总流量。</text><text class="note" x="95" y="1345">缺失：来源国未记录 ${fmt(data.raw_totals.source['未记录来源'])} 条；批局名未记录 ${fmt(data.raw_totals.office['未记录批局'])} 条；收批县未记录 ${fmt(data.raw_totals.county['未记录收批县'])} 条。未知单独保留，不并入具体节点。</text><text class="note" x="95" y="1378">数据来源：本地《侨批可用数据(1).xlsx》字段级聚合；仓库仅保存来源国、批局名、收批县和记录数，不上传原始 Excel。</text></g>
<g id="legend" transform="translate(920 1435)"><rect width="18" height="18" rx="6" fill="${C.slate}" fill-opacity=".45"/><text class="small" x="28" y="14">灰蓝＝全库真实关系</text><rect x="190" width="18" height="18" rx="6" fill="${C.red}" fill-opacity=".66"/><text class="small" x="218" y="14">砖红＝叙事样本路径</text></g>
</svg>\n`;

fs.writeFileSync(path.join(outDir, 'panel-02-threads-sankey-v1.svg'), svg);
console.log(JSON.stringify({ output: 'charts/svg/panel-02-threads-sankey-v1.svg', sourceEdges: sourceEdges.length, officeEdges: officeEdges.length, scale }));

