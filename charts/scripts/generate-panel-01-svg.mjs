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
const COLORS = { paper:'#E9E1D2', ink:'#27231F', slate:'#718083', red:'#9E4435', taupe:'#81786D', dust:'#B9A58F', pale:'#D8CFC0' };
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const fmt = n => new Intl.NumberFormat('zh-CN').format(n);
const sum = a => a.reduce((x,y)=>x+y,0);
const normSource = s => s === '印尼' ? '印度尼西亚' : s;

const originCoord = {
  '泰国':[100.50,13.75],'新加坡':[103.82,1.35],'马来西亚':[101.69,3.14],
  '印度尼西亚':[106.85,-6.20],'越南':[105.84,21.03],'柬埔寨':[104.92,11.56],
  '香港':[114.17,22.32],'澳大利亚':[151.21,-33.87]
};
const countyCoord = {
  '潮安':[116.63,23.66],'澄海':[116.77,23.47],'揭阳':[116.37,23.55],'饶平':[117.00,23.67],
  '普宁':[116.17,23.30],'汕头':[116.68,23.35],'潮阳':[116.60,23.26],'丰顺':[116.18,23.74],
  '潮州':[116.63,23.66],'广州':[113.26,23.13],'惠来':[116.30,23.03],'诏安':[117.18,23.71],
  '揭西':[115.84,23.43],'大埔':[116.70,24.35]
};

const merged = new Map();
for (const d of Q.flows) {
  const source = normSource(d.source), key = `${source}\u0000${d.county}`;
  merged.set(key, { source, county:d.county, count:(merged.get(key)?.count || 0) + d.count });
}
const flows = [...merged.values()];
const rawFlowTotal = sum(Q.flows.map(d=>d.count));
const knownKnown = flows.filter(d=>d.source !== '未知' && d.county !== '未知');
const inMapExtent = ([lon,lat]) => lon >= 75 && lon <= 122 && lat >= -40 && lat <= 32;
const mapFlows = knownKnown.filter(d=>originCoord[d.source] && countyCoord[d.county] && inMapExtent(originCoord[d.source]) && inMapExtent(countyCoord[d.county]));
const mapTotal = sum(mapFlows.map(d=>d.count));
const sourceTotals = Object.fromEntries([...new Set(mapFlows.map(d=>d.source))].map(k=>[k,sum(mapFlows.filter(d=>d.source===k).map(d=>d.count))]));
const countyTotals = Object.fromEntries([...new Set(mapFlows.map(d=>d.county))].map(k=>[k,sum(mapFlows.filter(d=>d.county===k).map(d=>d.count))]));
const entropy = [...new Set(knownKnown.map(d=>d.county))].map(county => {
  const rows=knownKnown.filter(d=>d.county===county), total=sum(rows.map(d=>d.count)), k=rows.length;
  const h=k<=1?0:-sum(rows.map(d=>{const p=d.count/total;return p*Math.log(p)}))/Math.log(k);
  return { county, known_total:total, unknown_source_count:sum(flows.filter(d=>d.county===county&&d.source==='未知').map(d=>d.count)), k, H_norm:+h.toFixed(6) };
}).filter(d=>d.known_total>=30&&d.k>=2).sort((a,b)=>b.known_total-a.known_total);

const derived = {
  schema_version:'qiaopi-panel-01-derived/v1', source:'课程资料/侨批可用数据-summary-v3.js', generated:'2026-10-12',
  unit:'侨批记录条数', normalization:{source_aliases:{'印尼':'印度尼西亚'}},
  audit:{total_records:Q.total, flows_sum:rawFlowTotal, flows_gap_to_total:Q.total-rawFlowTotal, unknown_source:796, unknown_county:683, unknown_both:548, missing_union:931, mapped_records:mapTotal, mapped_share:+(mapTotal/Q.total).toFixed(6)},
  coordinates:{method:'名称匹配后的城市/县级制图坐标；非 Excel 原始字段，来源待人工补录', origins:originCoord, counties:countyCoord},
  map_flows:mapFlows, source_totals:sourceTotals, county_totals:countyTotals, county_entropy:entropy
};
fs.writeFileSync(path.join(dataDir,'panel-01-derived-v1.json'), JSON.stringify(derived,null,2)+'\n');

function shell({title,subtitle,body,legend,source,note,contract}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1050" viewBox="0 0 1600 1050" role="img" aria-labelledby="title desc">
<title id="title">${esc(title)}</title><desc id="desc">${esc(subtitle)}</desc>
<style>text{font-family:"Microsoft YaHei","Noto Sans CJK SC",sans-serif;fill:${COLORS.ink}}.title{font-size:42px;font-weight:700}.sub{font-size:20px;fill:#5F5850}.axis{font-size:16px;fill:#5F5850}.label{font-size:18px}.small{font-size:14px;fill:#5F5850}.value{font-size:17px;font-weight:700}.hair{vector-effect:non-scaling-stroke}</style>
<rect id="background" width="1600" height="1050" fill="${COLORS.paper}"/>
<g id="chart-title"><text class="title" x="70" y="72">${esc(title)}</text><text class="sub" x="70" y="110">${esc(subtitle)}</text><text class="small" x="1530" y="72" text-anchor="end">CONTRACT · ${esc(contract)}</text></g>
${body}
<g id="chart-legend">${legend}</g>
<g id="source-and-notes"><line x1="70" x2="1530" y1="966" y2="966" stroke="${COLORS.dust}"/><text class="small" x="70" y="995">数据来源：${esc(source)}</text><text class="small" x="70" y="1021">${esc(note)}</text></g>
</svg>\n`;
}

function mapSvg(){
  // Focus the hero map on the South China Sea / Chaoshan corridor. The three
  // Australian records remain in the data contract but should not flatten the
  // visual scale of the much denser Southeast Asia–South China field.
  const plot={x:90,y:170,w:1420,h:680}, lon0=95,lon1=123,lat0=-8,lat1=32;
  const proj=([lon,lat])=>[plot.x+(lon-lon0)/(lon1-lon0)*plot.w,plot.y+(lat1-lat)/(lat1-lat0)*plot.h];
  const topo=JSON.parse(fs.readFileSync(path.join(root,'课程资料','潮汐邮路-assets','countries-110m.json'),'utf8'));
  const tr=topo.transform, decoded=[];
  for(const arc of topo.arcs){let x=0,y=0;decoded.push(arc.map(([dx,dy])=>{x+=dx;y+=dy;return [x*tr.scale[0]+tr.translate[0],y*tr.scale[1]+tr.translate[1]]}))}
  const arcPts=i=>i>=0?decoded[i]:[...decoded[~i]].reverse();
  // TopoJSON polygon rings are arrays of arc ids. The previous version treated
  // polygon arrays as individual ids, which produced empty and oversized paths.
  const ringPath=ids=>{const pts=ids.flatMap((id,j)=>arcPts(id).slice(j?1:0));if(!pts.length||pts.some((p,i)=>i&&Math.abs(p[0]-pts[i-1][0])>180))return '';return pts.map((p,i)=>`${i?'L':'M'}${proj(p)[0].toFixed(1)},${proj(p)[1].toFixed(1)}`).join(' ')+' Z'};
  const geomPaths=[];
  const obj=topo.objects[Object.keys(topo.objects)[0]];
  for(const g of obj.geometries){
    const polygons=g.type==='Polygon'?[g.arcs]:g.type==='MultiPolygon'?g.arcs:[];
    for(const polygon of polygons){const rings=polygon.map(ringPath).filter(Boolean);if(rings.length)geomPaths.push(rings.join(' '));}
  }
  const grid=[];
  for(let lon=100;lon<=120;lon+=10){const [x]=proj([lon,0]);grid.push(`<line x1="${x}" x2="${x}" y1="${plot.y}" y2="${plot.y+plot.h}" stroke="${COLORS.dust}" stroke-dasharray="3 8"/><text class="axis" x="${x}" y="${plot.y+plot.h+28}" text-anchor="middle">${lon}°E</text>`)}
  for(let lat=0;lat<=30;lat+=10){const [,y]=proj([100,lat]);grid.push(`<line x1="${plot.x}" x2="${plot.x+plot.w}" y1="${y}" y2="${y}" stroke="${COLORS.dust}" stroke-dasharray="3 8"/><text class="axis" x="${plot.x-12}" y="${y+5}" text-anchor="end">${lat===0?'0°':`${lat}°N`}</text>`)}
  const maxEdge=Math.max(...mapFlows.map(d=>d.count)), edgeK=13/Math.sqrt(maxEdge);
  const ordered=[...mapFlows].sort((a,b)=>a.count-b.count);
  const edges=ordered.map(d=>{const [x1,y1]=proj(originCoord[d.source]),[x2,y2]=proj(countyCoord[d.county]);const cx=(x1+x2)/2,cy=Math.min(y1,y2)-60;return `<path data-key="${esc(d.source)}|${esc(d.county)}" d="M${x1.toFixed(1)},${y1.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}" fill="none" stroke="${COLORS.slate}" stroke-width="${(edgeK*Math.sqrt(d.count)).toFixed(2)}" stroke-opacity=".42" class="hair"/>`}).join('');
  const maxNode=Math.max(...Object.values(sourceTotals),...Object.values(countyTotals)), rK=16/Math.sqrt(maxNode);
  const nodes=[];
  const originOffsets={'泰国':[18,-14],'新加坡':[18,22],'马来西亚':[18,-14],'印度尼西亚':[18,22],'越南':[18,-14],'香港':[-18,-16]};
  for(const [name,total] of Object.entries(sourceTotals)){const [x,y]=proj(originCoord[name]),r=Math.max(5,Math.min(26,rK*Math.sqrt(total))),[dx,dy]=originOffsets[name]||[18,-14];nodes.push(`<g data-location="${esc(name)}"><circle cx="${x}" cy="${y}" r="${r.toFixed(2)}" fill="${COLORS.slate}" stroke="${COLORS.paper}" stroke-width="2"/><line x1="${x+r*.72}" y1="${y}" x2="${x+dx-5}" y2="${y+dy-5}" stroke="${COLORS.taupe}" stroke-width="1"/><text class="label" x="${x+dx}" y="${y+dy}">${esc(name)}</text><text class="small" x="${x+dx}" y="${y+dy+18}">${fmt(total)} 条</text></g>`)}
  for(const [name,total] of Object.entries(countyTotals)){const [x,y]=proj(countyCoord[name]),r=Math.max(4,Math.min(22,rK*Math.sqrt(total)));nodes.push(`<g data-location="${esc(name)}"><circle cx="${x}" cy="${y}" r="${r.toFixed(2)}" fill="${COLORS.ink}" stroke="${COLORS.paper}" stroke-width="1.5"/><circle cx="${x}" cy="${y}" r="${(r+5).toFixed(2)}" fill="none" stroke="${COLORS.red}" stroke-opacity=".28" stroke-width="1"/></g>`)}
  const [sx,sy]=proj(originCoord['新加坡']),[tx,ty]=proj(countyCoord['潮安']);
  const countyIndex=Object.entries(countyTotals).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([n,v],i)=>`<circle cx="1225" cy="${538+i*29}" r="${Math.max(3,rK*Math.sqrt(v)).toFixed(2)}" fill="${n==='潮安'?COLORS.red:COLORS.ink}"/><text class="small" x="1250" y="${543+i*29}">${esc(n)} · ${fmt(v)} 条</text>`).join('');
  const cx=(sx+tx)/2,cy=Math.min(sy,ty)-60;
  const insetX=1110,insetY=505,insetW=365,insetH=300;
  const insetRows=Object.entries(countyTotals).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const inset=`<g id="chaoshan-inset"><rect x="${insetX}" y="${insetY}" width="${insetW}" height="${insetH}" rx="8" fill="${COLORS.paper}" fill-opacity=".96" stroke="${COLORS.dust}"/><text class="value" x="${insetX+18}" y="${insetY+28}">潮汕收批地 · 局部展开</text><text class="small" x="${insetX+18}" y="${insetY+49}">保留真实县域名；位置为阅读性展开，不按比例</text>${insetRows.map(([name,total],i)=>{const yy=insetY+78+i*25,rr=Math.max(4,Math.min(16,rK*Math.sqrt(total)));return `<line x1="${insetX+18}" x2="${insetX+48}" y1="${yy}" y2="${yy}" stroke="${COLORS.dust}"/><circle cx="${insetX+62}" cy="${yy}" r="${rr.toFixed(1)}" fill="${name==='潮安'?COLORS.red:COLORS.ink}"/><text class="label" x="${insetX+86}" y="${yy+5}">${esc(name)}</text><text class="small" x="${insetX+235}" y="${yy+5}">${fmt(total)} 条</text>`}).join('')}</g>`;
  const body=`<defs><clipPath id="map-clip"><rect x="${plot.x}" y="${plot.y}" width="${plot.w}" height="${plot.h}"/></clipPath></defs><g id="axes-and-grid">${grid.join('')}<text class="axis" x="800" y="915" text-anchor="middle">经度（°E） · 聚焦南洋—潮汕主航域</text><text class="axis" transform="translate(28 510) rotate(-90)" text-anchor="middle">纬度（°N / °S）</text></g><g id="basemap" clip-path="url(#map-clip)">${geomPaths.map(d=>`<path d="${d}" fill="${COLORS.pale}" stroke="${COLORS.taupe}" stroke-width=".6" class="hair"/>`).join('')}</g><g id="aggregate-routes" clip-path="url(#map-clip)">${edges}</g><g id="narrative-route"><path d="M${sx.toFixed(1)},${sy.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${tx.toFixed(1)},${ty.toFixed(1)}" fill="none" stroke="${COLORS.red}" stroke-width="3" class="hair"/></g><g id="location-nodes">${nodes.join('')}</g>${inset}<g id="county-index" opacity="0"><rect x="1195" y="492" width="270" height="294" fill="${COLORS.paper}" stroke="${COLORS.dust}"/>${countyIndex}</g><g id="narrative-route-label"><line x1="${sx+25}" y1="${sy-25}" x2="${sx+140}" y2="${sy-80}" stroke="${COLORS.red}"/><text class="value" x="${sx+150}" y="${sy-83}" fill="${COLORS.red}">跨面板叙事索引（非数值线宽）</text><text class="small" x="${sx+150}" y="${sy-58}">新加坡 → 万益成 → 潮安；非单件真实航线</text><circle cx="${tx}" cy="${ty}" r="4" fill="${COLORS.red}"/></g>`;
  const legend=`<g transform="translate(820 135)"><path d="M0 0H90" stroke="${COLORS.slate}" stroke-width="7"/><text class="small" x="105" y="5">灰蓝线＝flows 中可定位的聚合端点关系；线宽 ∝ √记录数</text><path d="M0 28H90" stroke="${COLORS.red}" stroke-width="3"/><text class="small" x="105" y="33">砖红线＝跨面板叙事索引；固定线宽，不编码数量</text></g>`;
  return shell({title:'跨海连接并不平均',subtitle:`来源地 → 收批地 · 灰蓝线宽＝记录条数的平方根 · 圆面积＝地点记录总量 · 已绘 ${fmt(mapTotal)} 条`,body,legend,source:'《侨批可用数据》字段级摘要 v3，flows；底图 countries-110m；坐标为名称匹配的制图坐标',note:`缺失/限制：未知来源 796 条、未知收批地 683 条（重叠 548 条）；7 条已知端点未匹配/超出本图范围；flows 合计 ${fmt(rawFlowTotal)}，比全库少 2 条。端点连线不是海上航线。`,contract:'map-route'});
}

function matrixSvg(){
  const sources=[...new Set(knownKnown.map(d=>d.source))].sort((a,b)=>sum(knownKnown.filter(d=>d.source===b).map(d=>d.count))-sum(knownKnown.filter(d=>d.source===a).map(d=>d.count)));
  const counties=[...new Set(knownKnown.map(d=>d.county))].sort((a,b)=>sum(knownKnown.filter(d=>d.county===b).map(d=>d.count))-sum(knownKnown.filter(d=>d.county===a).map(d=>d.count))).slice(0,8);
  const shown=knownKnown.filter(d=>counties.includes(d.county)), shownTotal=sum(shown.map(d=>d.count));
  const x0=330,y0=230,cw=105,rh=72,max=Math.max(...shown.map(d=>d.count)),rk=25/Math.sqrt(max);
  const grid=[];
  const arcY=(i,j)=>y0+j*rh-18*Math.sin(Math.PI*i/(counties.length-1));
  counties.forEach((c,i)=>grid.push(`<text class="axis" transform="translate(${x0+i*cw+4} ${y0-28}) rotate(-48)" text-anchor="start">${esc(c)}</text><line x1="${x0+i*cw}" x2="${x0+i*cw}" y1="${y0}" y2="${y0+sources.length*rh}" stroke="${COLORS.dust}" stroke-dasharray="2 7"/>`));
  sources.forEach((s,j)=>{const ym=y0+j*rh;grid.push(`<text class="label" x="${x0-18}" y="${ym+7}" text-anchor="end">${esc(s)}</text><path d="M${x0},${ym} Q${x0+(counties.length-1)*cw/2},${ym-36} ${x0+(counties.length-1)*cw},${ym}" fill="none" stroke="${COLORS.dust}"/>`)});
  const dots=shown.map(d=>{const i=counties.indexOf(d.county),j=sources.indexOf(d.source),r=rk*Math.sqrt(d.count),sample=d.source==='新加坡'&&d.county==='潮安';return `<g data-key="${esc(d.source)}|${esc(d.county)}"><circle cx="${x0+i*cw}" cy="${arcY(i,j).toFixed(1)}" r="${r.toFixed(2)}" fill="${sample?COLORS.red:COLORS.slate}"/><title>${esc(d.source)} → ${esc(d.county)}：${fmt(d.count)} 条</title></g>`}).join('');
  const sample=shown.find(d=>d.source==='新加坡'&&d.county==='潮安');
  const body=`<g id="axes-and-grid">${grid.join('')}<text class="axis" x="900" y="875" text-anchor="middle">收批县（类别）</text><text class="axis" transform="translate(85 530) rotate(-90)" text-anchor="middle">海外来源地（归一化类别）</text></g><g id="data-bubbles">${dots}</g><g id="annotations"><text class="value" x="1170" y="255" fill="${COLORS.red}">最大组合</text><text class="label" x="1170" y="286">新加坡 → 潮安</text><text class="value" x="1170" y="319">${fmt(sample.count)} 条</text><text class="small" x="1170" y="355">圆半径 ∝ √count</text><text class="small" x="1170" y="378">因此圆面积 ∝ count</text></g>`;
  const legend=`<g transform="translate(1040 700)">${[100,1000,10000].map((v,i)=>`<circle cx="${i*145}" cy="0" r="${(rk*Math.sqrt(v)).toFixed(2)}" fill="none" stroke="${COLORS.slate}"/><text class="small" x="${i*145}" y="55" text-anchor="middle">${fmt(v)} 条</text>`).join('')}<text class="small" x="0" y="92">圆面积＝来源地×收批县组合记录数</text><rect x="0" y="116" width="18" height="18" fill="${COLORS.red}"/><text class="small" x="28" y="130">砖红＝叙事样本组合；其余＝灰蓝统计</text></g>`;
  return shell({title:'少数组合承载了大部分记录',subtitle:`来源国 × 收批地 TOP 8 · 每个圆＝一个聚合组合 · 圆面积＝侨批记录条数 · 覆盖 ${fmt(shownTotal)} 条`,body,legend,source:'《侨批可用数据》字段级摘要 v3，flows；“印尼”已归一为“印度尼西亚”',note:`筛选/缺失：展示记录量最高 8 个已知收批地，排除未知行列；已知双端点共 ${fmt(sum(knownKnown.map(d=>d.count)))} 条。flows 合计 ${fmt(rawFlowTotal)}，与全库差 2 条。`,contract:'source-county-matrix'});
}

function entropySvg(){
  const rows=entropy.slice(0,12),x0=370,x1=1300,y0=210,rh=54;
  const grid=[0,.25,.5,.75,1].map(v=>{const x=x0+(x1-x0)*v;return `<line x1="${x}" x2="${x}" y1="${y0-30}" y2="${y0+rows.length*rh}" stroke="${COLORS.dust}" stroke-dasharray="3 7"/><text class="axis" x="${x}" y="${y0+rows.length*rh+35}" text-anchor="middle">${v.toFixed(2)}</text>`}).join('');
  const marks=rows.map((d,i)=>{const y=y0+i*rh,x=x0+(x1-x0)*d.H_norm,anchor=d.H_norm>.88?'end':'start',vx=d.H_norm>.88?x-18:x+18;const ticks=Array.from({length:21},(_,t)=>{const tx=x0+(x1-x0)*t/20;return `<line x1="${tx}" x2="${tx}" y1="${y-8}" y2="${y+8}" stroke="${t/20<=d.H_norm?COLORS.slate:COLORS.pale}" stroke-width="${t/20<=d.H_norm?5:3}"/>`}).join('');return `<g data-county="${esc(d.county)}"><text class="label" x="${x0-22}" y="${y+6}" text-anchor="end">${esc(d.county)}</text>${ticks}<circle cx="${x}" cy="${y}" r="7" fill="${COLORS.ink}"/><text class="value" x="${vx}" y="${y+6}" text-anchor="${anchor}">${d.H_norm.toFixed(3)}</text><text class="small" x="1510" y="${y+5}" text-anchor="end">n=${fmt(d.known_total)} · k=${d.k} · 未知=${fmt(d.unknown_source_count)}</text></g>`}).join('');
  const body=`<g id="axes-and-grid">${grid}<text class="axis" x="${(x0+x1)/2}" y="${y0+rows.length*rh+72}" text-anchor="middle">归一化来源结构熵 H_norm（0–1，无量纲）</text></g><g id="entropy-bars">${marks}</g><g id="formula"><text class="small" x="370" y="900">H_norm = −Σ pᵢ ln(pᵢ) / ln(k)；pᵢ 为县内各已知来源地记录占比；k 为该县已观察到的归一化已知来源类别数。</text></g>`;
  const legend=`<g transform="translate(1120 120)"><line x1="0" x2="65" y1="0" y2="0" stroke="${COLORS.slate}" stroke-width="8"/><text class="small" x="78" y="5">越左＝更集中</text><line x1="0" x2="65" y1="30" y2="30" stroke="${COLORS.slate}" stroke-width="8"/><circle cx="65" cy="30" r="8" fill="${COLORS.ink}"/><text class="small" x="78" y="35">越右＝更分散</text></g>`;
  return shell({title:'收批地的来源结构集中程度不同',subtitle:'按已知来源计算 · 横向位置与线长＝归一化 Shannon entropy · n＝已知来源记录数 · k＝来源类别数',body,legend,source:'《侨批可用数据》字段级摘要 v3，flows；来源别名先归一化',note:`缺失/限制：未知来源不参与熵值，各行另列；仅展示已知来源记录≥30且 k≥2 的收批地。flows 合计 ${fmt(rawFlowTotal)}，比全库少 2 条。该指标不是人口多样性、文化开放度或移民规模。`,contract:'entropy-profile'});
}

fs.writeFileSync(path.join(outDir,'panel-01-map-route-v1.svg'),mapSvg());
fs.writeFileSync(path.join(outDir,'panel-01-source-county-matrix-v1.svg'),matrixSvg());
fs.writeFileSync(path.join(outDir,'panel-01-entropy-profile-v1.svg'),entropySvg());
console.log(JSON.stringify({outputs:3,rawFlowTotal,mapTotal,entropy:entropy.slice(0,5)},null,2));

