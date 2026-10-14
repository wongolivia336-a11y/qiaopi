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
const C = { paper:'#E9E1D2', ink:'#3E3933', slate:'#718083', red:'#9E4435', taupe:'#81786D', dust:'#B9A58F', pale:'#D8CFC0', sea:'#C6D2D0', land:'#D8CFC0' };
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const fmt = n => new Intl.NumberFormat('zh-CN').format(n);
const sum = a => a.reduce((x,y)=>x+y,0);
const normSource = s => s === '印尼' ? '印度尼西亚' : s;

const origins = {
  '泰国':[100.50,13.75], '新加坡':[103.82,1.35], '马来西亚':[101.69,3.14],
  '印度尼西亚':[106.85,-6.20], '越南':[105.84,21.03], '柬埔寨':[104.92,11.56], '香港':[114.17,22.32]
};
const counties = {
  '潮安':[116.63,23.66], '澄海':[116.77,23.47], '揭阳':[116.37,23.55], '饶平':[117.00,23.67],
  '普宁':[116.17,23.30], '汕头':[116.68,23.35], '潮阳':[116.60,23.26], '丰顺':[116.18,23.74],
  '广州':[113.26,23.13], '惠来':[116.30,23.03], '诏安':[117.18,23.71], '揭西':[115.84,23.43], '大埔':[116.70,24.35]
};
const merged = new Map();
for (const row of Q.flows) {
  const source = normSource(row.source);
  const key = `${source}\u0000${row.county}`;
  merged.set(key, {source, county:row.county, count:(merged.get(key)?.count || 0)+row.count});
}
const flows = [...merged.values()];
const known = flows.filter(d=>d.source!=='未知' && d.county!=='未知');
const mapFlows = known.filter(d=>origins[d.source] && counties[d.county]);
const sourceTotals = Object.fromEntries(Object.keys(origins).map(s=>[s,sum(mapFlows.filter(d=>d.source===s).map(d=>d.count))]));
const countyTotals = Object.fromEntries(Object.keys(counties).map(c=>[c,sum(mapFlows.filter(d=>d.county===c).map(d=>d.count))]).filter(([,v])=>v>0));
const sourceOrder = Object.entries(sourceTotals).sort((a,b)=>b[1]-a[1]);
const countyOrder = Object.entries(countyTotals).sort((a,b)=>b[1]-a[1]);
const topCounty = source => {
  const rows = mapFlows.filter(d=>d.source===source).sort((a,b)=>b.count-a.count);
  return rows[0] || {county:'—',count:0};
};
const sampleCount = sum(mapFlows.filter(d=>d.source==='新加坡'&&d.county==='潮安').map(d=>d.count));

const topo = JSON.parse(fs.readFileSync(path.join(root,'课程资料','潮汐邮路-assets','countries-110m.json'),'utf8'));
const tr = topo.transform, decoded=[];
for(const arc of topo.arcs){let x=0,y=0;decoded.push(arc.map(([dx,dy])=>{x+=dx;y+=dy;return [x*tr.scale[0]+tr.translate[0],y*tr.scale[1]+tr.translate[1]]}))}
const arcPoints=id=>id>=0?decoded[id]:[...decoded[~id]].reverse();
const W=2400,H=1540;
const plot={x:90,y:250,w:1250,h:760};
const proj=([lon,lat])=>[plot.x+(lon-95)/28*plot.w,plot.y+(30-lat)/38*plot.h];
const ringPath=ids=>{const pts=ids.flatMap((id,i)=>arcPoints(id).slice(i?1:0));return pts.length?pts.map((p,i)=>`${i?'L':'M'}${proj(p)[0].toFixed(1)},${proj(p)[1].toFixed(1)}`).join(' ')+' Z':''};
const land=[];const geoms=topo.objects[Object.keys(topo.objects)[0]].geometries;
for(const g of geoms){const ps=g.type==='Polygon'?[g.arcs]:g.type==='MultiPolygon'?g.arcs:[];for(const poly of ps){const rings=poly.map(ringPath).filter(Boolean);if(rings.length)land.push(rings.join(' '));}}
const routePath=(a,b)=>{const [x1,y1]=proj(a),[x2,y2]=proj(b),dx=Math.abs(x2-x1),cy=Math.min(y1,y2)-Math.min(120,50+dx*.08);return `M${x1.toFixed(1)},${y1.toFixed(1)} C${(x1+dx*.32).toFixed(1)},${cy.toFixed(1)} ${(x2-dx*.32).toFixed(1)},${cy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`};
const maxEdge=Math.max(...mapFlows.map(d=>d.count));
const allEdges=[...mapFlows].sort((a,b)=>a.count-b.count).map(d=>`<path d="${routePath(origins[d.source],counties[d.county])}" fill="none" stroke="url(#routeSlate)" stroke-opacity="${(.34+.30*Math.sqrt(d.count/maxEdge)).toFixed(2)}" stroke-width="${(.8+4.2*Math.sqrt(d.count/maxEdge)).toFixed(2)}" stroke-linecap="round"/>`).join('');
const focusEdges=[...mapFlows].sort((a,b)=>b.count-a.count).slice(0,10).map(d=>`<path d="${routePath(origins[d.source],counties[d.county])}" fill="none" stroke="url(#routeFocus)" stroke-opacity=".86" stroke-width="${(1.8+4.8*Math.sqrt(d.count/maxEdge)).toFixed(2)}" stroke-linecap="round"/>`).join('');
const mapNodes=sourceOrder.map(([s,v])=>{const [x,y]=proj(origins[s]),r=12+19*Math.sqrt(v/sourceOrder[0][1]);return `<g id="map-source-${esc(s)}"><circle cx="${x}" cy="${y}" r="${r+10}" fill="none" stroke="${s==='新加坡'?C.red:C.slate}" stroke-opacity=".24" stroke-width="3" stroke-dasharray="3 5"/><circle cx="${x}" cy="${y}" r="${r+3}" fill="${C.paper}" fill-opacity=".76"/><circle cx="${x}" cy="${y}" r="${r}" fill="${s==='新加坡'?C.red:C.slate}" fill-opacity=".9"/><text class="mapLabel" x="${x+20}" y="${y-5}">${esc(s)}</text><text class="mapValue" x="${x+20}" y="${y+18}">${fmt(v)} 条</text></g>`}).join('');
const endpointDots=countyOrder.map(([c,v])=>{const [x,y]=proj(counties[c]),r=4+14*Math.sqrt(v/countyOrder[0][1]);return `<g id="map-county-${esc(c)}"><circle cx="${x}" cy="${y}" r="${r+4}" fill="${C.paper}" fill-opacity=".62" stroke="${c==='潮安'?C.red:C.taupe}" stroke-opacity=".35" stroke-width="2"/><circle cx="${x}" cy="${y}" r="${r}" fill="${c==='潮安'?C.red:C.taupe}" fill-opacity=".9"/></g>`}).join('');

const atlasX=1400,atlasY=250,atlasW=900,atlasH=760,cardW=420,cardH=132;
const sourceCards=sourceOrder.map(([s,total],i)=>{
  const col=i%2,row=Math.floor(i/2),x=atlasX+30+col*(cardW+24),y=atlasY+145+row*(cardH+18),top=topCounty(s),full=Math.floor(total/1000),rest=total%1000;
  const dots=[];for(let k=0;k<Math.min(full,24);k++){const dx=x+250+(k%8)*20,dy=y+70+Math.floor(k/8)*20;dots.push(`<circle cx="${dx}" cy="${dy}" r="6.5" fill="${s==='新加坡'?C.red:C.slate}" fill-opacity=".82"/>`)}
  if(rest>0 && full<24){const k=full,dx=x+250+(k%8)*20,dy=y+70+Math.floor(k/8)*20;dots.push(`<circle cx="${dx}" cy="${dy}" r="${(3+3*rest/1000).toFixed(1)}" fill="${s==='新加坡'?C.red:C.slate}" fill-opacity=".46"/>`)}
  return `<g id="origin-card-${esc(s)}"><rect x="${x}" y="${y}" width="${cardW}" height="${cardH}" rx="4" fill="${C.paper}" stroke="${C.pale}"/><rect x="${x}" y="${y}" width="5" height="${cardH}" fill="${s==='新加坡'?C.red:C.slate}" fill-opacity=".82"/><text class="caps" x="${x+22}" y="${y+27}">ORIGIN / ${String(i+1).padStart(2,'0')}</text><text class="cardTitle" x="${x+22}" y="${y+57}">${esc(s)}</text><text class="cardValue" x="${x+22}" y="${y+84}">${fmt(total)} 条</text><text class="cardNote" x="${x+22}" y="${y+111}">主收批地：${esc(top.county)} · ${fmt(top.count)} 条</text><g id="dot-units">${dots.join('')}</g></g>`;
}).join('');

const fieldX=90,fieldY=1085,fieldW=2210,fieldH=300;
const endpointField=countyOrder.slice(0,10).map(([c,v],i)=>{const x=fieldX+90+i*202,y=fieldY+155,r=9+28*Math.sqrt(v/countyOrder[0][1]);return `<g id="receive-${esc(c)}"><line x1="${x}" x2="${x}" y1="${y+45}" y2="${fieldY+242}" stroke="${C.dust}" stroke-dasharray="2 7"/><circle cx="${x}" cy="${y}" r="${r+6}" fill="none" stroke="${c==='潮安'?C.red:C.slate}" stroke-opacity=".24"/><circle cx="${x}" cy="${y}" r="${r}" fill="${c==='潮安'?C.red:C.slate}" fill-opacity=".88"/><text class="fieldLabel" x="${x}" y="${y+78}" text-anchor="middle">${esc(c)}</text><text class="fieldValue" x="${x}" y="${y+99}" text-anchor="middle">${fmt(v)} 条</text></g>`}).join('');

const legend=`<g id="legend"><rect x="930" y="820" width="370" height="150" rx="4" fill="${C.paper}" fill-opacity=".92" stroke="${C.dust}"/><text class="caps" x="952" y="848">LEGEND / 读图</text><line x1="952" x2="1010" y1="878" y2="878" stroke="${C.slate}" stroke-width="2"/><text class="small" x="1026" y="882">灰蓝线：全库聚合流向</text><line x1="952" x2="1010" y1="910" y2="910" stroke="${C.red}" stroke-width="4"/><text class="small" x="1026" y="914">砖红线：叙事样本路径</text><circle cx="964" cy="944" r="8" fill="${C.slate}"/><text class="small" x="986" y="948">圆点面积：记录量</text></g>`;

const grid=[];for(let lon=100;lon<=120;lon+=10){const [x]=proj([lon,0]);grid.push(`<line x1="${x}" x2="${x}" y1="${plot.y}" y2="${plot.y+plot.h}" stroke="${C.dust}" stroke-dasharray="2 9"/><text class="axis" x="${x}" y="${plot.y+plot.h+32}" text-anchor="middle">${lon}°E</text>`)}for(let lat=0;lat<=30;lat+=10){const [,y]=proj([100,lat]);grid.push(`<line x1="${plot.x}" x2="${plot.x+plot.w}" y1="${y}" y2="${y}" stroke="${C.dust}" stroke-dasharray="2 9"/><text class="axis" x="${plot.x-14}" y="${y+4}" text-anchor="end">${lat===0?'0°':`${lat}°N`}</text>`)}

const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc">
<title id="title">来源地不是一张点名表，而是一组出发的密度</title><desc id="desc">地图与来源图鉴结合：左侧保留来源地到潮汕收批地的真实聚合空间关系，右侧用每个约一千条记录的圆点拆开七个来源地，底部展示收批地端点展开。</desc>
<defs><linearGradient id="seaWash" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#C6D2D0" stop-opacity=".78"/><stop offset="55%" stop-color="#D8E0DD" stop-opacity=".48"/><stop offset="100%" stop-color="#E9E1D2" stop-opacity=".18"/></linearGradient><linearGradient id="landWash" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#D8CFC0" stop-opacity=".78"/><stop offset="60%" stop-color="#E2D9CA" stop-opacity=".58"/><stop offset="100%" stop-color="#F0E9DF" stop-opacity=".38"/></linearGradient><linearGradient id="routeSlate" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stop-color="#718083" stop-opacity=".2"/><stop offset="45%" stop-color="#718083" stop-opacity=".72"/><stop offset="100%" stop-color="#A9B5B3" stop-opacity=".28"/></linearGradient><linearGradient id="routeFocus" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stop-color="#5C6C70" stop-opacity=".35"/><stop offset="52%" stop-color="#718083" stop-opacity=".88"/><stop offset="100%" stop-color="#A6B2B0" stop-opacity=".42"/></linearGradient><linearGradient id="routeSample" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stop-color="#9E4435" stop-opacity=".62"/><stop offset="55%" stop-color="#B65C48" stop-opacity=".96"/><stop offset="100%" stop-color="#9E4435" stop-opacity=".48"/></linearGradient></defs>
<style>text{font-family:"Noto Sans SC","Microsoft YaHei",sans-serif;fill:${C.ink}}.title{font-size:48px;font-weight:700}.sub{font-size:19px;fill:${C.taupe}}.caps{font-size:11px;letter-spacing:1.6px;fill:${C.taupe}}.axis{font-size:12px;fill:${C.taupe}}.mapLabel{font-size:15px;font-weight:700}.mapValue{font-size:11px;fill:${C.taupe}}.cardTitle{font-size:19px;font-weight:700}.cardValue{font-size:16px;font-weight:700}.cardNote{font-size:11px;fill:${C.taupe}}.fieldLabel{font-size:16px;font-weight:700}.fieldValue{font-size:12px;fill:${C.taupe}}.small{font-size:12px;fill:${C.taupe}}.hair{vector-effect:non-scaling-stroke}</style>
<rect id="background" width="${W}" height="${H}" fill="${C.paper}"/>
<g id="title-block"><text class="caps" x="90" y="62">01 / 此岸 · 起信</text><text class="title" x="90" y="116">来源地不是一张点名表，而是一组出发的密度</text><text class="sub" x="90" y="155">地图保留真实空间关系；来源图鉴把每个出发地拆开，避免被一束弧线压成一个团</text><text class="caps" x="2310" y="62" text-anchor="end">SOURCE ATLAS / 50,064 RECORDS</text></g>
<g id="map-panel"><rect x="90" y="${plot.y}" width="${plot.w}" height="${plot.h}" rx="4" fill="url(#seaWash)" stroke="${C.dust}"/><text class="caps" x="120" y="286">GEOGRAPHIC FIELD / 聚焦南洋—潮汕主航域</text><g id="grid">${grid.join('')}</g><g id="basemap">${land.map(d=>`<path d="${d}" fill="url(#landWash)" stroke="${C.taupe}" stroke-opacity=".42" stroke-width=".55"/>`).join('')}</g><g id="all-routes">${allEdges}</g><g id="focus-routes">${focusEdges}</g><g id="sample-route"><path d="${routePath(origins['新加坡'],counties['潮安'])}" fill="none" stroke="url(#routeSample)" stroke-width="5.2" stroke-linecap="round"/><circle cx="${proj(origins['新加坡'])[0]}" cy="${proj(origins['新加坡'])[1]}" r="7" fill="${C.red}"/><circle cx="${proj(counties['潮安'])[0]}" cy="${proj(counties['潮安'])[1]}" r="7" fill="${C.red}"/></g><g id="source-nodes">${mapNodes}</g><g id="county-nodes">${endpointDots}</g><g id="map-annotation"><line x1="${proj(origins['新加坡'])[0]+25}" y1="${proj(origins['新加坡'])[1]-22}" x2="${proj(origins['新加坡'])[0]+150}" y2="${proj(origins['新加坡'])[1]-80}" stroke="${C.red}" stroke-opacity=".75"/><text class="caps" x="${proj(origins['新加坡'])[0]+166}" y="${proj(origins['新加坡'])[1]-82}">NARRATIVE SAMPLE</text><text class="cardTitle" x="${proj(origins['新加坡'])[0]+166}" y="${proj(origins['新加坡'])[1]-57}">新加坡 → 潮安</text><text class="small" x="${proj(origins['新加坡'])[0]+166}" y="${proj(origins['新加坡'])[1]-36}">${fmt(sampleCount)} 条聚合记录 · 非单件真实航线</text></g>${legend}</g>
<g id="origin-atlas"><rect x="${atlasX}" y="${atlasY}" width="${atlasW}" height="${atlasH}" rx="4" fill="${C.paper}" stroke="${C.dust}"/><text class="caps" x="${atlasX+30}" y="${atlasY+42}">ORIGIN ATLAS / 已知来源结构</text><text class="cardTitle" x="${atlasX+30}" y="${atlasY+80}">七个出发地，七张可读的记录卡</text><text class="small" x="${atlasX+30}" y="${atlasY+108}">每个完整圆点约 1,000 条；残点表示不足 1,000 条的余量</text>${sourceCards}</g>
<g id="receive-field"><rect x="${fieldX}" y="${fieldY}" width="${fieldW}" height="${fieldH}" rx="4" fill="${C.paper}" fill-opacity=".78" stroke="${C.dust}"/><text class="caps" x="${fieldX+30}" y="${fieldY+38}">RECEIVE FIELD / 潮汕收批地</text><text class="cardTitle" x="${fieldX+30}" y="${fieldY+76}">抵达端也要拆开看：记录不是一个红点</text><text class="small" x="${fieldX+30}" y="${fieldY+102}">圆面积＝收批地总记录量；底部横向排列只承担标签避让，不表示新的地理坐标</text>${endpointField}</g>
<g id="source-and-notes"><line x1="90" x2="2310" y1="1450" y2="1450" stroke="${C.dust}"/><text class="small" x="90" y="1480">数据来源：课程资料/侨批可用数据-summary-v3.js 的 flows.source / flows.count；底图 countries-110m；来源点阵是由聚合记录量派生的单位符号。</text><text class="small" x="90" y="1502">限制：未知来源 796 条、未知收批地 683 条（重叠 548 条）；flows 合计 50,062，比全库少 2 条；所有路线均为聚合关系。</text></g>
</svg>\n`;

fs.writeFileSync(path.join(outDir,'panel-01-origin-atlas-v2.svg'),svg);
fs.writeFileSync(path.join(dataDir,'panel-01-origin-atlas-derived-v2.json'),JSON.stringify({
  schema_version:'qiaopi-panel-01-origin-atlas-derived/v2',source:'课程资料/侨批可用数据-summary-v3.js',generated:'2026-10-14',unit:'侨批记录条数',
  source_totals:sourceTotals,county_totals:countyTotals,sample_path:{source:'新加坡',county:'潮安',count:sampleCount},dot_unit:1000,
  notes:['来源点阵由聚合记录量派生，每个完整圆点约 1,000 条；不是逐件记录的空间散点。','底部收批地排列只承担标签避让，不改变县域真实坐标。']
},null,2)+'\n');
console.log(JSON.stringify({output:'charts/svg/panel-01-origin-atlas-v2.svg',sourceTotals,countyCount:countyOrder.length,sampleCount},null,2));
