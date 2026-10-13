import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data', 'derived', 'panel-03-annual-confidence-derived-v1.json'), 'utf8'));
const outDir = path.join(root, 'charts', 'svg');
fs.mkdirSync(outDir, { recursive: true });

const C = { paper:'#E9E1D2', ink:'#3E3933', body:'#5F5850', slate:'#718083', red:'#9E4435', taupe:'#81786D', dust:'#B9A58F', pale:'#D8CFC0', wash:'#F2EDE4' };
const W=2100,H=1200,fmt=n=>new Intl.NumberFormat('zh-CN').format(n);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const rows=data.rows.filter(d=>d.year>=1915 && d.year<=2020);
const minYear=1915,maxYear=2020,x0=180,x1=1910,baseY=640,scaleX=(x1-x0)/(maxYear-minYear),maxCount=Math.max(...rows.map(d=>d.count)),heightScale=155/Math.sqrt(maxCount);
const xFor=y=>x0+(y-minYear)*scaleX;
const hFor=n=>Math.max(1,Math.sqrt(n)*heightScale);

function contiguousSegments(items){
  const out=[]; let seg=[]; let prev=null;
  for(const d of items){ if(prev!==null && d.year!==prev+1){if(seg.length) out.push(seg); seg=[];} seg.push(d); prev=d.year; }
  if(seg.length) out.push(seg); return out;
}
function ribbonPath(seg, value, stacked=false){
  const top=seg.map(d=>`${xFor(d.year).toFixed(1)},${(baseY-(stacked?hFor(d.direct):0)-hFor(d[value])).toFixed(1)}`).join(' L');
  const bottom=[...seg].reverse().map(d=>`${xFor(d.year).toFixed(1)},${(baseY-(stacked?hFor(d.direct):0)).toFixed(1)}`).join(' L');
  return `M${top} L${bottom} Z`;
}
function confidencePath(seg){
  return `M${seg.map(d=>`${xFor(d.year).toFixed(1)},${(930-(d.direct_rate*220)).toFixed(1)}`).join(' L')}`;
}
const segments=contiguousSegments(rows);
const directPaths=segments.map(seg=>`<path data-segment="${seg[0].year}-${seg.at(-1).year}" d="${ribbonPath(seg,'direct')}" fill="${C.slate}" fill-opacity=".44"><title>直读日期：${seg[0].year}–${seg.at(-1).year}</title></path>`).join('');
const inferredPaths=segments.map(seg=>`<path data-segment="${seg[0].year}-${seg.at(-1).year}" d="${ribbonPath(seg,'inferred',true)}" fill="${C.taupe}" fill-opacity=".24"><title>推断/待核日期：${seg[0].year}–${seg.at(-1).year}</title></path>`).join('');
// A thin direct-rate thread sits below the ribbon, so count and confidence are
// visually connected but never share one unlabelled axis.
const confidence=segments.map(seg=>`<path data-segment="${seg[0].year}-${seg.at(-1).year}" d="${confidencePath(seg)}" fill="none" stroke="${C.slate}" stroke-width="3" stroke-opacity=".78" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
const peakYears=[...rows].sort((a,b)=>b.count-a.count).slice(0,3);
const peakMarks=peakYears.map(d=>{const x=xFor(d.year), y=baseY-hFor(d.count)-18; return `<g data-year="${d.year}"><line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${(y+10).toFixed(1)}" y2="${(baseY+18).toFixed(1)}" stroke="${C.red}" stroke-opacity=".42" stroke-dasharray="4 7"/><circle cx="${x.toFixed(1)}" cy="${(baseY-hFor(d.count)).toFixed(1)}" r="7" fill="${C.red}"/><text class="callout" x="${(x+14).toFixed(1)}" y="${y.toFixed(1)}">${d.year} · ${fmt(d.count)} 条</text></g>`;}).join('');
const yearTicks=[1915,1930,1945,1960,1975,1990,2005,2020].map(y=>`<g><line x1="${xFor(y).toFixed(1)}" x2="${xFor(y).toFixed(1)}" y1="${baseY+24}" y2="${baseY+42}" stroke="${C.dust}"/><text class="axis" x="${xFor(y).toFixed(1)}" y="${baseY+68}" text-anchor="middle">${y}</text></g>`).join('');
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc">
<title id="title">时间留下了厚薄不同的痕迹</title><desc id="desc">年度记录量以纸带厚度表达，日期直读与推断待核以不同灰度分层；下方细线表达直读日期比例。</desc>
<style>text{font-family:"Noto Sans SC","Microsoft YaHei",sans-serif;fill:${C.ink}}.title{font-size:44px;font-weight:700}.sub{font-size:20px;fill:${C.body}}.eyebrow{font-size:14px;letter-spacing:2px;fill:#6B625A}.axis{font-size:14px;fill:#6B625A}.callout{font-size:16px;font-weight:700;fill:${C.red}}.note{font-size:16px;fill:${C.body}}.tiny{font-size:12px;fill:#7A7067}.metric{font-size:31px;font-weight:700}</style>
<rect id="background" width="${W}" height="${H}" fill="${C.paper}"/>
<g id="chart-title"><text class="eyebrow" x="78" y="70">P03 / ARCHIVE TIME RIBBON</text><text class="title" x="78" y="124">时间留下了厚薄不同的痕迹</text><text class="sub" x="78" y="162">年度记录量的起伏，与日期可信度的变化并不同步</text><text class="tiny" x="2022" y="70" text-anchor="end">UNIT · 侨批记录条数 / 比例</text></g>
<g id="summary-cards"><rect x="78" y="208" width="430" height="108" rx="8" fill="${C.wash}" stroke="${C.dust}"/><text class="eyebrow" x="104" y="240">全库记录</text><text class="metric" x="104" y="283">${fmt(data.audit.total_records)} 条</text><text class="tiny" x="104" y="304">年度字段可定位：${fmt(data.audit.year_rows_total)} 条</text><rect x="532" y="208" width="430" height="108" rx="8" fill="${C.wash}" stroke="${C.dust}"/><text class="eyebrow" x="558" y="240">无年记录</text><text class="metric" x="558" y="283">${fmt(data.audit.unknown_year_count)} 条</text><text class="tiny" x="558" y="304">不压入任何具体年份</text><rect x="986" y="208" width="540" height="108" rx="8" fill="${C.wash}" stroke="${C.dust}"/><text class="eyebrow" x="1012" y="240">叙事提示</text><text class="note" x="1012" y="275">1950–1970 年代记录带明显变厚；</text><text class="note" x="1012" y="299">2020 年为独立的 ${fmt(rows.find(d=>d.year===2020)?.count||0)} 条摘要行。</text></g>
<g id="count-ribbon"><line x1="${x0}" x2="${x1}" y1="${baseY}" y2="${baseY}" stroke="${C.dust}" stroke-width="1"/><line x1="${x0}" x2="${x1}" y1="${baseY-155}" y2="${baseY-155}" stroke="${C.dust}" stroke-opacity=".26" stroke-dasharray="3 8"/>${inferredPaths}${directPaths}${peakMarks}${yearTicks}<text class="axis" x="${x0-24}" y="${baseY+5}" text-anchor="end">0</text><text class="axis" x="${x0-24}" y="${baseY-150}" text-anchor="end">约 1,700</text><text class="axis" x="${x0}" y="${baseY+101}">年份（公历）</text><text class="axis" x="${x0-100}" y="${baseY-74}" transform="rotate(-90 ${x0-100} ${baseY-74})">年度记录条数</text></g>
<g id="confidence-thread"><rect x="${x0}" y="820" width="${x1-x0}" height="220" rx="8" fill="${C.wash}" fill-opacity=".64" stroke="${C.dust}"/><text class="eyebrow" x="${x0+24}" y="855">日期可信度 · 直读比例</text><text class="tiny" x="${x0+24}" y="879">下方细线使用 0–100% 单独坐标；空缺年份保持断开。</text><line x1="${x0}" x2="${x1}" y1="930" y2="930" stroke="${C.dust}" stroke-opacity=".34"/><line x1="${x0}" x2="${x1}" y1="820" y2="820" stroke="${C.dust}" stroke-opacity=".22" stroke-dasharray="3 8"/>${confidence}<text class="axis" x="${x0-24}" y="935" text-anchor="end">0%</text><text class="axis" x="${x0-24}" y="827" text-anchor="end">100%</text><text class="axis" x="${x0}" y="1017">直读日期比例（%）</text></g>
<g id="legend" transform="translate(78 1080)"><rect width="1944" height="68" rx="8" fill="${C.wash}" stroke="${C.dust}"/><rect x="24" y="25" width="48" height="14" rx="5" fill="${C.slate}" fill-opacity=".44"/><text class="note" x="88" y="38">灰蓝纸带＝日期直读记录</text><rect x="360" y="25" width="48" height="14" rx="5" fill="${C.taupe}" fill-opacity=".24"/><text class="note" x="424" y="38">灰褐纸带＝推断 / 待核记录</text><line x1="860" y1="32" x2="908" y2="32" stroke="${C.slate}" stroke-width="3"/><text class="note" x="924" y="38">细线＝直读日期比例</text><text class="tiny" x="1260" y="38">来源：yearStats｜1694 年孤立记录未压入主轴｜不对外部历史事件作因果解释</text></g>
<text class="tiny" x="78" y="1180">数据来源：课程资料/侨批可用数据-summary-v3.js 的 yearStats 字段级摘要；原始 Excel 不上传。可编辑 SVG 分组。</text>
</svg>`;
fs.writeFileSync(path.join(outDir,'panel-03-time-ribbon-v1.svg'),svg);
console.log(JSON.stringify({output:'charts/svg/panel-03-time-ribbon-v1.svg',segments:segments.length,rows:rows.length,unknownYear:data.audit.unknown_year_count}));

