import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data', 'derived', 'office-reach-derived-v1.json'), 'utf8'));
const outDir = path.join(root, 'charts', 'svg');
fs.mkdirSync(outDir, { recursive: true });

const C = { paper: '#E9E1D2', ink: '#3E3933', slate: '#718083', red: '#9E4435', taupe: '#81786D', dust: '#B9A58F', pale: '#D8CFC0' };
const fmt = n => new Intl.NumberFormat('zh-CN').format(n);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
const rows = data.top_offices;
const W = 1600, H = 1100;
const y0 = 265, rowH = 50;
const left = { x: 430, w: 560, max: Math.max(...rows.map(d => d.records)) };
const right = { x: 1150, w: 280, max: Math.max(...rows.map(d => d.known_county_count)) };
const barWidth = v => left.w * v / left.max;
const dotX = v => right.x + right.w * v / right.max;

const grid = [0, 5000, 10000, 15000, 20000].map(v => {
  const x = left.x + left.w * v / left.max;
  return `<line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${y0 - 35}" y2="${y0 + rows.length * rowH - 18}" stroke="${C.dust}" stroke-dasharray="3 7"/><text class="axis" x="${x.toFixed(1)}" y="${y0 + rows.length * rowH + 15}" text-anchor="middle">${fmt(v)}</text>`;
}).join('');
const countyTicks = [0, 2, 4, 6, 8].map(v => {
  const x = dotX(v);
  return `<line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${y0 - 35}" y2="${y0 + rows.length * rowH - 18}" stroke="${C.dust}" stroke-dasharray="3 7"/><text class="axis" x="${x.toFixed(1)}" y="${y0 + rows.length * rowH + 15}" text-anchor="middle">${v}</text>`;
}).join('');

const marks = rows.map((d, i) => {
  const y = y0 + i * rowH;
  const highlight = d.office === '万益成';
  const fill = highlight ? C.red : C.slate;
  const x2 = left.x + barWidth(d.records);
  const cx = dotX(d.known_county_count);
  return `<g data-office="${esc(d.office)}"><text class="label" x="${left.x - 22}" y="${y + 6}" text-anchor="end">${esc(d.office)}</text><rect x="${left.x}" y="${y - 14}" width="${barWidth(d.records).toFixed(1)}" height="20" rx="8" fill="${fill}" fill-opacity="${highlight ? '.72' : '.52'}"/><text class="small" x="${Math.min(x2 + 12, right.x - 145).toFixed(1)}" y="${y + 2}">${fmt(d.records)} 条</text><line x1="${right.x}" x2="${cx.toFixed(1)}" y1="${y - 4}" y2="${y - 4}" stroke="${highlight ? C.red : C.taupe}" stroke-width="4" stroke-linecap="round"/><circle cx="${cx.toFixed(1)}" cy="${y - 4}" r="8" fill="${highlight ? C.red : C.taupe}"/><text class="value" x="${(cx + 16).toFixed(1)}" y="${y + 2}">${d.known_county_count} 个</text><title>${esc(d.office)}：${fmt(d.records)} 条；已知收批县 ${d.known_county_count} 个</title></g>`;
}).join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc">
<title id="title">批局连接的县域广度并不相同</title><desc id="desc">按批局记录量排序；灰蓝横条＝记录条数，右侧点位＝已知收批县类别数，两个指标分开编码。</desc>
<style>text{font-family:"Microsoft YaHei","Noto Sans CJK SC",sans-serif;fill:${C.ink}}.title{font-size:42px;font-weight:700}.sub{font-size:20px;fill:#5F5850}.axis{font-size:15px;fill:#5F5850}.label{font-size:20px}.small{font-size:16px;fill:#5F5850}.value{font-size:17px;font-weight:700}.note{font-size:15px;fill:#5F5850}.column{font-size:17px;font-weight:700;letter-spacing:2px}</style>
<rect id="background" width="${W}" height="${H}" fill="${C.paper}"/>
<g id="chart-title"><text class="title" x="70" y="76">批局连接的县域广度并不相同</text><text class="sub" x="70" y="115">批局记录量与已知收批县覆盖范围分开编码 · 排除“未记录批局”后取前 12 个批局</text><text class="small" x="1530" y="76" text-anchor="end">CONTRACT · office-reach</text></g>
<g id="column-labels"><text class="column" x="${left.x + left.w / 2}" y="190" text-anchor="middle">可识别记录量</text><text class="small" x="${left.x + left.w / 2}" y="218" text-anchor="middle">单位：条</text><text class="column" x="${right.x + right.w / 2}" y="190" text-anchor="middle">已知收批县覆盖</text><text class="small" x="${right.x + right.w / 2}" y="218" text-anchor="middle">单位：个类别</text><line x1="70" x2="1530" y1="238" y2="238" stroke="${C.dust}"/></g>
<g id="axes-and-grid">${grid}${countyTicks}</g><g id="office-reach-marks">${marks}</g>
<g id="legend" transform="translate(70 890)"><rect width="18" height="18" rx="6" fill="${C.slate}" fill-opacity=".52"/><text class="small" x="28" y="14">灰蓝条＝批局可识别记录量</text><circle cx="260" cy="9" r="8" fill="${C.taupe}"/><text class="small" x="280" y="14">灰褐点＝已知收批县类别数</text><rect x="570" width="18" height="18" rx="6" fill="${C.red}" fill-opacity=".72"/><text class="small" x="598" y="14">砖红＝叙事样本涉及批局：万益成</text></g>
<g id="annotations"><rect x="70" y="945" width="1460" height="90" fill="none" stroke="${C.dust}"/><text class="note" x="95" y="978">批局总量与县域覆盖不是同一个指标：记录多，不等于覆盖县域更广；覆盖县数只统计字段中可识别的收批县类别。</text><text class="note" x="95" y="1008">缺失：批局字段未记录 ${fmt(data.missing.office_rows)} 条；收批县字段未记录 ${fmt(data.missing.county_rows)} 条。未知项未并入具体批局或县域。</text></g>
<g id="source-and-notes"><text class="small" x="70" y="1070">数据来源：本地《侨批可用数据(1).xlsx》字段级聚合；仓库仅保存批局、收批县和记录数，不上传原始 Excel。</text></g>
</svg>\n`;

fs.writeFileSync(path.join(outDir, 'panel-02-office-reach-v1.svg'), svg);
console.log(JSON.stringify({ output: 'charts/svg/panel-02-office-reach-v1.svg', rows: rows.length, missingOffice: data.missing.office_rows }));

