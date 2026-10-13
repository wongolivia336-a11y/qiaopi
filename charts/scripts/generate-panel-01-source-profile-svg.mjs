import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data', 'derived', 'panel-01-derived-v1.json'), 'utf8'));
const outDir = path.join(root, 'charts', 'svg');
fs.mkdirSync(outDir, { recursive: true });

const C = { paper:'#E9E1D2', ink:'#3E3933', slate:'#718083', red:'#9E4435', taupe:'#81786D', dust:'#B9A58F', pale:'#D8CFC0', wash:'#F2EDE4' };
const W=820,H=1700,fmt=n=>new Intl.NumberFormat('zh-CN').format(n);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const entries=Object.entries(data.source_totals).sort((a,b)=>b[1]-a[1]);
const max=entries[0][1];
const barW=500, x0=210, y0=350, row=128;
const rows=entries.map(([name,count],i)=>{
  const y=y0+i*row, w=Math.max(5,barW*count/max), pct=(count/data.audit.flows_sum*100).toFixed(1);
  const focus=name==='新加坡';
  return `<g id="source-row-${i}" data-source="${esc(name)}" data-count="${count}"><text class="label" x="${x0-24}" y="${y+31}" text-anchor="end">${esc(name)}</text><rect x="${x0}" y="${y+10}" width="${barW}" height="42" rx="8" fill="${C.pale}"/><rect x="${x0}" y="${y+10}" width="${w.toFixed(1)}" height="42" rx="8" fill="${focus?C.red:C.slate}" fill-opacity="${focus?.86:.72}"/><text class="value" x="${x0+w+16}" y="${y+38}">${fmt(count)} 条</text><text class="pct" x="${x0+w+16}" y="${y+61}">${pct}% of mapped flows</text></g>`;
}).join('');
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc">
<title id="title">海外来源结构</title><desc id="desc">按 flows 字段级聚合统计海外来源地记录量。</desc>
<style>text{font-family:"Noto Sans SC","Microsoft YaHei",sans-serif;fill:${C.ink}}.title{font-size:34px;font-weight:700}.sub{font-size:17px;fill:#5F5850}.eyebrow{font-size:13px;letter-spacing:2px;fill:#6B625A}.label{font-size:19px}.value{font-size:17px;font-weight:700}.pct{font-size:13px;fill:#6B625A}.note{font-size:14px;fill:#6B625A}.tiny{font-size:12px;fill:#7A7067}.axis{font-size:12px;fill:#6B625A}</style>
<rect id="background" width="${W}" height="${H}" fill="${C.paper}"/>
<g id="chart-title"><text class="eyebrow" x="52" y="74">P01 / ORIGIN PROFILE</text><text class="title" x="52" y="124">海外来源结构</text><text class="sub" x="52" y="160">已知来源地按 flows 记录量排序</text><text class="tiny" x="768" y="74" text-anchor="end">单位：侨批记录条数</text></g>
<g id="summary-card"><rect x="52" y="198" width="716" height="96" rx="8" fill="${C.wash}" stroke="${C.dust}"/><text class="eyebrow" x="76" y="228">TOP 1</text><text class="value" x="76" y="264">泰国 · ${fmt(entries[0][1])} 条</text><text class="note" x="400" y="264">已知来源合计 ${fmt(data.audit.flows_sum)} 条；未知来源另列</text></g>
<g id="axis"><line x1="${x0}" y1="${y0-38}" x2="${x0+barW}" y2="${y0-38}" stroke="${C.dust}"/><text class="axis" x="${x0}" y="${y0-52}">0</text><text class="axis" x="${x0+barW}" y="${y0-52}" text-anchor="end">${fmt(max)} 条</text><line x1="${x0+barW/2}" y1="${y0-44}" x2="${x0+barW/2}" y2="${y0+row*entries.length-35}" stroke="${C.dust}" stroke-opacity=".35" stroke-dasharray="3 8"/></g>
<g id="source-bars">${rows}</g>
<g id="legend" transform="translate(52 1320)"><rect width="716" height="218" rx="8" fill="${C.wash}" stroke="${C.dust}"/><text class="eyebrow" x="24" y="34">阅读注记</text><circle cx="34" cy="73" r="8" fill="${C.slate}" fill-opacity=".8"/><text class="note" x="58" y="78">灰蓝条＝已知来源地记录量</text><circle cx="34" cy="109" r="8" fill="${C.red}"/><text class="note" x="58" y="114">砖红条＝叙事起信样本所在来源地（新加坡）</text><text class="note" x="24" y="158">未知来源：${fmt(data.audit.unknown_source)} 条，不压入已知来源排序。</text><text class="tiny" x="24" y="185">flows 合计 ${fmt(data.audit.flows_sum)}，比全库 ${fmt(data.audit.total_records)} 少 ${fmt(data.audit.flows_gap_to_total)} 条；差额不做推测。</text></g>
<text class="tiny" x="52" y="1630">数据来源：课程资料/侨批可用数据-summary-v3.js 的 flows.source / flows.count；不上传原始 Excel。可编辑 SVG 分组。</text>
</svg>`;
fs.writeFileSync(path.join(outDir,'panel-01-source-profile-v1.svg'),svg);
console.log(JSON.stringify({output:'charts/svg/panel-01-source-profile-v1.svg',sources:entries.length,flows:data.audit.flows_sum}));

