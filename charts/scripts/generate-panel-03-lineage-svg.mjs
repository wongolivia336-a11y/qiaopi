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
  taupe: '#81786D', dust: '#B9A58F', pale: '#D8CFC0', white: '#F5F0E7'
};
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
const fmt = n => new Intl.NumberFormat('zh-CN').format(n);
const rows = Q.senderCounty.map(d => ({ sender: String(d.sender), county: String(d.county), count: Number(d.count), start: d.start == null ? null : Number(d.start), end: d.end == null ? null : Number(d.end) }));
const knownRows = rows.filter(d => Number.isFinite(d.start) && Number.isFinite(d.end)).sort((a, b) => b.count - a.count);
const missingRows = rows.filter(d => !Number.isFinite(d.start) || !Number.isFinite(d.end)).sort((a, b) => b.count - a.count);
const ordered = [...knownRows, ...missingRows];
const totalCount = rows.reduce((s, d) => s + d.count, 0);
const intervalYears = knownRows.map(d => d.end - d.start);
const avgSpan = intervalYears.length ? intervalYears.reduce((s, d) => s + d, 0) / intervalYears.length : 0;
const countyColors = { '潮安': C.slate, '澄海': C.taupe, '揭阳': C.dust, '汕头': '#9A9082', '未知': C.pale };
const xMin = 1925, xMax = 2020;
const W = 2180, H = 1510;
const x0 = 480, x1 = 1915, y0 = 330, rowH = 32;
const plotH = ordered.length * rowH;
const x = year => x0 + ((year - xMin) / (xMax - xMin)) * (x1 - x0);
const radius = count => 5 + Math.sqrt(count / Math.max(...rows.map(d => d.count))) * 8;
const rowY = i => y0 + i * rowH + rowH / 2;

const derived = {
  schema_version: 'qiaopi-panel-03-lineage-derived/v1',
  source: '课程资料/侨批可用数据-summary-v3.js',
  generated: '2026-10-13',
  unit: '组合记录条数；覆盖区间单位为年份',
  fields: ['senderCounty.sender', 'senderCounty.county', 'senderCounty.count', 'senderCounty.start', 'senderCounty.end'],
  rows: ordered.map(d => ({ ...d, coverage_years: Number.isFinite(d.start) && Number.isFinite(d.end) ? d.end - d.start : null })),
  audit: {
    total_records_in_sender_county_rows: totalCount,
    combination_rows: rows.length,
    known_interval_rows: knownRows.length,
    missing_interval_rows: missingRows.length,
    average_known_interval_years: Number(avgSpan.toFixed(1)),
    interval_rule: '摘要端点只表示该组合最早/最晚记录年份；未提供逐年集合，不能把区间内每一年都解释为连续通信。',
    identity_rule: '寄批人字段来自公开字段级摘要；公开展出前需单独核验授权，不把组合直接解释为家谱或家庭关系。'
  }
};
fs.writeFileSync(path.join(dataDir, 'panel-03-lineage-derived-v1.json'), JSON.stringify(derived, null, 2) + '\n');

const yearTicks = [1925, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020].map(year => {
  const xx = x(year);
  return `<g data-year-tick="${year}"><line x1="${xx.toFixed(1)}" x2="${xx.toFixed(1)}" y1="${y0 - 22}" y2="${y0 + plotH}" stroke="${C.dust}" stroke-opacity=".50" stroke-dasharray="2 8"/><text class="axis" x="${xx.toFixed(1)}" y="${y0 - 38}" text-anchor="middle">${year}</text></g>`;
}).join('');
const rowLabels = ordered.map((d, i) => {
  const yy = rowY(i);
  const color = countyColors[d.county] || C.slate;
  const unknown = !Number.isFinite(d.start) || !Number.isFinite(d.end);
  return `<g id="row-${i + 1}" data-sender="${esc(d.sender)}" data-county="${esc(d.county)}" data-count="${d.count}"><text class="row-label" x="85" y="${(yy + 5).toFixed(1)}">${esc(d.sender)} · ${esc(d.county)}</text><text class="row-count" x="425" y="${(yy + 5).toFixed(1)}" text-anchor="end">${fmt(d.count)} 条</text>${unknown ? `<rect x="${x0}" y="${(yy - 9).toFixed(1)}" width="150" height="18" rx="3" fill="${C.red}" fill-opacity=".10" stroke="${C.red}" stroke-dasharray="4 3"/><text class="missing" x="${x0 + 75}" y="${(yy + 5).toFixed(1)}" text-anchor="middle">日期缺失</text><title>${d.sender} · ${d.county}：${fmt(d.count)} 条；摘要未提供起止年份</title>` : `<line x1="${x(d.start).toFixed(1)}" x2="${x(d.end).toFixed(1)}" y1="${yy.toFixed(1)}" y2="${yy.toFixed(1)}" stroke="${color}" stroke-width="10" stroke-linecap="round" stroke-opacity=".66"/><circle cx="${x(d.start).toFixed(1)}" cy="${yy.toFixed(1)}" r="${radius(d.count).toFixed(1)}" fill="${color}" stroke="${C.paper}" stroke-width="2"/><circle cx="${x(d.end).toFixed(1)}" cy="${yy.toFixed(1)}" r="${radius(d.count).toFixed(1)}" fill="${color}" stroke="${C.paper}" stroke-width="2"/><text class="endpoint" x="${(x(d.start) - 8).toFixed(1)}" y="${(yy - 13).toFixed(1)}" text-anchor="end">${d.start}</text><text class="endpoint" x="${(x(d.end) + 8).toFixed(1)}" y="${(yy - 13).toFixed(1)}">${d.end}</text><title>${d.sender} · ${d.county}：${fmt(d.count)} 条；摘要首年 ${d.start}，末年 ${d.end}；区间 ${d.end - d.start} 年</title>`}</g>`;
}).join('');

const summaryCards = `<g id="summary-cards"><rect x="80" y="145" width="360" height="108" rx="5" fill="${C.pale}" fill-opacity=".32" stroke="${C.dust}"/><text class="card-label" x="105" y="175">可识别组合</text><text class="card-value" x="105" y="220">${fmt(rows.length)} 行</text><rect x="470" y="145" width="360" height="108" rx="5" fill="${C.pale}" fill-opacity=".32" stroke="${C.dust}"/><text class="card-label" x="495" y="175">有首末年份</text><text class="card-value" x="495" y="220">${fmt(knownRows.length)} 行</text><rect x="860" y="145" width="360" height="108" rx="5" fill="${C.pale}" fill-opacity=".32" stroke="${C.dust}"/><text class="card-label" x="885" y="175">平均覆盖区间</text><text class="card-value" x="885" y="220">${avgSpan.toFixed(1)} 年</text><rect x="1250" y="145" width="665" height="108" rx="5" fill="${C.pale}" fill-opacity=".32" stroke="${C.dust}"/><text class="card-label" x="1275" y="175">读图边界</text><text class="card-note" x="1275" y="205">实线是摘要首末年份，不证明逐年连续；日期缺失行单列</text><text class="card-note" x="1275" y="229">点大小＝组合记录条数；颜色＝收批县类别，不表示关系亲疏</text></g>`;
const legend = `<g id="legend" transform="translate(85 1325)"><text class="small" x="0" y="0">收批县：</text><circle cx="70" cy="-5" r="6" fill="${C.slate}"/><text class="small" x="84" y="0">潮安</text><circle cx="155" cy="-5" r="6" fill="${C.taupe}"/><text class="small" x="169" y="0">澄海</text><circle cx="254" cy="-5" r="6" fill="${C.dust}"/><text class="small" x="268" y="0">揭阳</text><circle cx="348" cy="-5" r="6" fill="#9A9082"/><text class="small" x="362" y="0">汕头</text><rect x="455" y="-12" width="20" height="14" fill="${C.red}" fill-opacity=".10" stroke="${C.red}" stroke-dasharray="4 3"/><text class="small" x="487" y="0">日期缺失，不能画覆盖区间</text><circle cx="760" cy="-5" r="5" fill="${C.slate}"/><circle cx="782" cy="-5" r="9" fill="${C.slate}"/><text class="small" x="800" y="0">点大小＝组合记录条数</text></g>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc">
<title id="title">寄批人—收批县组合的可见覆盖区间</title><desc id="desc">以 senderCounty 摘要行绘制的覆盖区间。实线连接摘要首年与末年，端点圆大小表示组合记录条数；日期缺失的组合不被虚构成时间线。</desc>
<style>text{font-family:"Microsoft YaHei","Noto Sans CJK SC",sans-serif;fill:${C.ink}}.title{font-size:44px;font-weight:700}.sub{font-size:20px;fill:#5F5850}.section{font-size:22px;font-weight:700}.axis{font-size:15px;fill:#5F5850}.small{font-size:15px;fill:#5F5850}.row-label{font-size:16px;fill:${C.ink}}.row-count{font-size:15px;fill:#5F5850}.endpoint{font-size:12px;fill:#5F5850}.missing{font-size:13px;fill:${C.red}}.card-label{font-size:15px;fill:#5F5850}.card-value{font-size:29px;font-weight:700;fill:${C.ink}}.card-note{font-size:14px;fill:#5F5850}.note{font-size:16px;fill:#5F5850}.hair{vector-effect:non-scaling-stroke}</style>
<rect id="background" width="${W}" height="${H}" fill="${C.paper}"/>
<g id="chart-title"><text class="title" x="80" y="78">寄批人—收批县组合的可见覆盖区间</text><text class="sub" x="80" y="116">摘要端点让长期关系浮现，但不把区间内每一年误读为连续通信 · 点大小＝记录条数</text><text class="small" x="2095" y="78" text-anchor="end">CONTRACT · lineage</text></g>
${summaryCards}
<g id="timeline"><text class="section" x="85" y="290">A · 组合时间线（年）</text><text class="small" x="85" y="315">左侧为摘要中的寄批人—收批县组合；右侧实线仅表示最早/最晚年份，单位为公历年</text><g id="year-axis">${yearTicks}</g><line x1="${x0}" x2="${x1}" y1="${y0 - 22}" y2="${y0 - 22}" stroke="${C.ink}"/>${rowLabels}</g>
${legend}
<g id="data-callouts"><rect x="85" y="1370" width="${W - 170}" height="76" rx="6" fill="${C.pale}" fill-opacity=".34" stroke="${C.dust}"/><text class="note" x="110" y="1400">数据事实：${fmt(rows.length)} 个公开摘要组合行，${fmt(knownRows.length)} 行有首末年份，${fmt(missingRows.length)} 行日期缺失；组合行合计 ${fmt(totalCount)} 条。</text><text class="note" x="110" y="1428">限制：当前摘要没有逐年记录集合，不能显示真实断档/恢复；寄批人字段属于可识别字段，公开展出前需核验授权，也不能直接解释为家谱或家庭关系。</text></g>
<g id="source-and-notes"><text class="small" x="85" y="1480">数据来源：课程资料/侨批可用数据-summary-v3.js · senderCounty（字段级摘要）；仓库不上传原始 Excel。SVG 分组：summary-cards / timeline / legend / notes。</text></g>
</svg>\n`;
fs.writeFileSync(path.join(outDir, 'panel-03-lineage-v1.svg'), svg);
console.log(JSON.stringify({ output: 'charts/svg/panel-03-lineage-v1.svg', rows: rows.length, known_interval_rows: knownRows.length, missing_interval_rows: missingRows.length }));

