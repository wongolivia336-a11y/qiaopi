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
const yearMin = 1915;
const yearMax = 2020;
const years = Array.from({ length: yearMax - yearMin + 1 }, (_, i) => yearMin + i);
const rows = Q.calendar.map(d => ({ year: Number(d.year), month: Number(d.month), count: Number(d.count) }));
const earlyRows = rows.filter(d => d.year < yearMin);
const unknownMonthRows = rows.filter(d => d.year >= yearMin && d.year <= yearMax && d.month === 0);
const displayRows = rows.filter(d => d.year >= yearMin && d.year <= yearMax && d.month >= 1 && d.month <= 12);
const cellMap = new Map(displayRows.map(d => [`${d.year}-${d.month}`, d.count]));
const displayTotal = displayRows.reduce((s, d) => s + d.count, 0);
const maxCount = Math.max(...displayRows.map(d => d.count));
const knownYears = new Set(displayRows.map(d => d.year));
const missingCells = years.length * 12 - displayRows.length;
const monthTotals = Array.from({ length: 12 }, (_, i) => displayRows.filter(d => d.month === i + 1).reduce((s, d) => s + d.count, 0));
const yearTotals = years.map(year => ({ year, count: displayRows.filter(d => d.year === year).reduce((s, d) => s + d.count, 0) }));

const derived = {
  schema_version: 'qiaopi-panel-03-calendar-derived/v1',
  source: '课程资料/侨批可用数据-summary-v3.js',
  generated: '2026-10-13',
  unit: '侨批记录条数',
  fields: ['calendar.year', 'calendar.month', 'calendar.count'],
  main_year_range: [yearMin, yearMax],
  rows: displayRows,
  month_totals: monthTotals.map((count, i) => ({ month: i + 1, count })),
  year_totals: yearTotals,
  audit: {
    total_records: Q.total,
    display_total: displayTotal,
    display_rows: displayRows.length,
    missing_cells: missingCells,
    known_years: knownYears.size,
    excluded_early_rows: earlyRows,
    unknown_month_rows: unknownMonthRows,
    unknown_month_count: unknownMonthRows.reduce((s, d) => s + d.count, 0),
    missing_rule: '摘要中没有出现的年月组合保留为空白 NA，不强制改写为零；空白不等于现实中没有寄信。'
  }
};
fs.writeFileSync(path.join(dataDir, 'panel-03-calendar-derived-v1.json'), JSON.stringify(derived, null, 2) + '\n');

const W = 2100, H = 1410;
const x0 = 170, y0 = 315, cellW = 13.1, cellH = 38;
const heatW = years.length * cellW, heatH = 12 * cellH;
const x1 = x0 + heatW;
const y1 = y0 + heatH;
const opacityFor = value => value <= 0 ? 0 : (value / maxCount <= .08 ? .18 : value / maxCount <= .2 ? .34 : value / maxCount <= .42 ? .52 : value / maxCount <= .7 ? .70 : .88);
const monthName = i => `${i + 1}月`;
const heatCells = years.map((year, yi) => Array.from({ length: 12 }, (_, mi) => {
  const value = cellMap.get(`${year}-${mi + 1}`) || 0;
  const xx = x0 + yi * cellW;
  const yy = y0 + mi * cellH;
  const isMissing = !cellMap.has(`${year}-${mi + 1}`);
  const high = value > maxCount * .7;
  return `<g id="cell-${year}-${mi + 1}" data-year="${year}" data-month="${mi + 1}" data-missing="${isMissing}"><rect x="${xx.toFixed(1)}" y="${yy.toFixed(1)}" width="${(cellW - 1.4).toFixed(1)}" height="${(cellH - 1.4).toFixed(1)}" rx="1.5" fill="${isMissing ? C.paper : high ? C.red : C.slate}" fill-opacity="${isMissing ? '.18' : opacityFor(value)}" stroke="${isMissing ? C.dust : C.white}" stroke-opacity="${isMissing ? '.62' : '.35'}" stroke-width=".6"><title>${year}年 ${mi + 1}月：${isMissing ? '摘要无该年月组合' : `${fmt(value)} 条`}</title></rect></g>`;
})).join('');
const monthLabels = Array.from({ length: 12 }, (_, i) => `<text class="axis" x="${x0 - 18}" y="${(y0 + i * cellH + 25).toFixed(1)}" text-anchor="end">${monthName(i)}</text>`).join('');
const yearLabelYears = years.filter(y => y === yearMin || y === yearMax || y % 5 === 0);
const yearLabels = yearLabelYears.map(year => {
  const xx = x0 + (year - yearMin) * cellW + cellW / 2;
  return `<g data-year-tick="${year}"><line x1="${xx.toFixed(1)}" x2="${xx.toFixed(1)}" y1="${y1 + 7}" y2="${y1 + 16}" stroke="${C.ink}" stroke-width=".8"/><text class="axis" transform="translate(${xx.toFixed(1)} ${y1 + 40}) rotate(-55)" text-anchor="end">${year}</text></g>`;
}).join('');
const annualSparkMax = Math.max(...yearTotals.map(d => d.count));
const sparkY = value => 205 - (value / annualSparkMax) * 85;
const sparkPoints = yearTotals.map(d => `${(x0 + (d.year - yearMin) * cellW + cellW / 2).toFixed(1)},${sparkY(d.count).toFixed(1)}`).join(' ');
const sparkDots = yearTotals.filter(d => d.count > 0).map(d => `<circle cx="${(x0 + (d.year - yearMin) * cellW + cellW / 2).toFixed(1)}" cy="${sparkY(d.count).toFixed(1)}" r="${d.count === annualSparkMax ? 4 : 2}" fill="${d.count === annualSparkMax ? C.red : C.slate}"/>`).join('');
const monthBars = monthTotals.map((count, i) => {
  const yy = 1120 + i * 17;
  const width = (count / Math.max(...monthTotals)) * 235;
  return `<g id="month-total-${i + 1}" data-month="${i + 1}"><text class="small" x="1510" y="${yy + 11}" text-anchor="end">${i + 1}月</text><rect x="1528" y="${yy}" width="235" height="11" rx="2" fill="${C.pale}"/><rect x="1528" y="${yy}" width="${width.toFixed(1)}" height="11" rx="2" fill="${i === 1 || i === 4 ? C.red : C.taupe}" fill-opacity="${i === 1 || i === 4 ? '.66' : '.58'}"/><text class="small" x="1780" y="${yy + 11}">${fmt(count)}</text></g>`;
}).join('');
const legend = `<g id="legend" transform="translate(170 1045)"><text class="small" x="0" y="0">色深＝该年月组合记录条数（分段透明度；不使用连续渐变）</text><rect x="0" y="18" width="24" height="18" fill="${C.slate}" fill-opacity=".18"/><rect x="30" y="18" width="24" height="18" fill="${C.slate}" fill-opacity=".34"/><rect x="60" y="18" width="24" height="18" fill="${C.slate}" fill-opacity=".52"/><rect x="90" y="18" width="24" height="18" fill="${C.slate}" fill-opacity=".70"/><rect x="120" y="18" width="24" height="18" fill="${C.slate}" fill-opacity=".88"/><text class="small" x="155" y="32">较少</text><rect x="225" y="18" width="24" height="18" fill="${C.red}" fill-opacity=".72"/><text class="small" x="260" y="32">高值提示（超过显示最大值 70%）</text><rect x="520" y="18" width="24" height="18" fill="${C.paper}" stroke="${C.dust}"/><text class="small" x="555" y="32">空白＝摘要中无该组合 / NA</text></g>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc">
<title id="title">年月记录密度：档案里的季节性空白</title><desc id="desc">1915至2020年年月组合热力图。色深表示摘要中的侨批记录条数，空白保留为缺失值；上方为年度总量折线，右侧为月份总量。</desc>
<style>text{font-family:"Microsoft YaHei","Noto Sans CJK SC",sans-serif;fill:${C.ink}}.title{font-size:44px;font-weight:700}.sub{font-size:20px;fill:#5F5850}.section{font-size:22px;font-weight:700}.axis{font-size:15px;fill:#5F5850}.small{font-size:15px;fill:#5F5850}.note{font-size:16px;fill:#5F5850}.hair{vector-effect:non-scaling-stroke}</style>
<rect id="background" width="${W}" height="${H}" fill="${C.paper}"/>
<g id="chart-title"><text class="title" x="80" y="78">年月记录密度：档案里的季节性空白</text><text class="sub" x="80" y="116">热力图保留未出现的年月组合 · 上方看年度总量 · 右侧看月份总量 · 主轴 ${yearMin}–${yearMax}</text><text class="small" x="2015" y="78" text-anchor="end">CONTRACT · calendar-heat</text></g>
<g id="annual-strip"><text class="section" x="${x0}" y="165">A · 年度总量折线（条）</text><text class="small" x="${x0}" y="190">只连接每年摘要中出现的年月记录；没有记录的年份保留在时间轴上</text><line x1="${x0}" x2="${x1}" y1="205" y2="205" stroke="${C.dust}"/><polyline points="${sparkPoints}" fill="none" stroke="${C.slate}" stroke-width="3" stroke-linejoin="round" class="hair"/>${sparkDots}<text class="small" x="${x1 + 16}" y="${sparkY(yearTotals[yearTotals.length - 1].count) + 5}">${fmt(yearTotals[yearTotals.length - 1].count)} 条</text></g>
<g id="heatmap"><text class="section" x="${x0}" y="270">B · 年 × 月记录矩阵</text><text class="small" x="${x0}" y="292">单位：每格记录条数；月份字段来自公开摘要的 calendar 聚合，不补齐未出现的组合</text><g id="month-axis">${monthLabels}</g><g id="cells">${heatCells}</g><line x1="${x0}" x2="${x0}" y1="${y0}" y2="${y1}" stroke="${C.ink}"/><line x1="${x0}" x2="${x1}" y1="${y1}" y2="${y1}" stroke="${C.ink}"/>${yearLabels}</g>
<g id="month-profile"><text class="section" x="1510" y="1078">C · 月份总量（条）</text><text class="small" x="1510" y="1100">跨年份合计，帮助读者读出热力图的行方向</text>${monthBars}</g>
${legend}
<g id="data-callouts"><rect x="170" y="1215" width="${W - 340}" height="82" rx="6" fill="${C.pale}" fill-opacity=".34" stroke="${C.dust}"/><text class="note" x="195" y="1245">显示区间内：${fmt(displayTotal)} 条、${fmt(displayRows.length)} 个已出现的年月组合；${fmt(missingCells)} 个组合为空白 NA；${fmt(years.length - knownYears.size)} 个年份没有任何已出现组合。</text><text class="note" x="195" y="1275">限制：空白只表示摘要没有该年月组合，不等于现实中没有寄信；另有 ${fmt(unknownMonthRows.reduce((s, d) => s + d.count, 0))} 条记录年份已知但月份未知（month=0），${earlyRows.length ? `以及主轴外 ${fmt(earlyRows.reduce((s, d) => s + d.count, 0))} 条早期记录，均未压入年月格。` : ''}</text></g>
<g id="source-and-notes"><text class="small" x="170" y="1340">数据来源：课程资料/侨批可用数据-summary-v3.js · calendar（字段级摘要）；仓库不上传原始 Excel。SVG 分组：annual-strip / heatmap / month-profile / legend / notes。</text><text class="small" x="170" y="1368">口径：颜色为分段透明度而非连续渐变；砖红只标记显示区间内相对高值，不代表叙事路线。</text></g>
</svg>\n`;
fs.writeFileSync(path.join(outDir, 'panel-03-calendar-heat-v1.svg'), svg);
console.log(JSON.stringify({ output: 'charts/svg/panel-03-calendar-heat-v1.svg', display_total: displayTotal, missing_cells: missingCells, max_count: maxCount }));

