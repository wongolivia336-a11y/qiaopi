import fs from 'node:fs';
import path from 'node:path';

// Build P02's flow contract directly from the supplied cleaned CSV.
// The raw CSV stays outside the repository; only aggregate, field-level outputs
// are written under data/derived.

const [, , inputB, inputA, outDirArg] = process.argv;
if (!inputB || !inputA || !outDirArg) {
  throw new Error('Usage: node derive-panel-02-sankey-csv-v2.mjs <B.csv> <A.csv> <out-dir>');
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n') { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = ''; }
    else field += ch;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function readCsv(file) {
  const matrix = parseCsv(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
  const header = matrix.shift().map(v => v.trim());
  return matrix.filter(r => r.some(v => String(v ?? '').trim() !== '')).map(values => {
    const record = {};
    header.forEach((key, i) => { record[key] = String(values[i] ?? '').trim(); });
    return record;
  });
}

const B = readCsv(inputB);
const A = readCsv(inputA);
const get = (row, ...keys) => keys.map(k => row[k]).find(v => v && v.trim()) || '';
const missing = (value, label) => value ? value.trim() : label;
const sourceMap = new Map([
  ['印尼', '印度尼西亚'], ['中国香港', '香港'], ['中国', '中国内地']
]);
const normalizeSource = row => sourceMap.get(get(row, '寄批国家地区_统一', '寄批国家或地区')) || get(row, '寄批国家地区_统一', '寄批国家或地区') || '未记录来源';
const normalizeOffice = row => get(row, '批局主体名', '批局完整名称') || '未记录批局';
const normalizeCounty = row => get(row, '收批县域_统一', '收批县') || '未记录收批县';

const counter = values => {
  const out = new Map();
  for (const value of values) out.set(value, (out.get(value) || 0) + 1);
  return out;
};
const sortedCounter = c => [...c.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-CN'));
const topKnown = (c, n, missingLabel) => sortedCounter(c).filter(([k]) => k !== missingLabel).slice(0, n).map(([k]) => k);
const collapse = (value, keep, missingLabel, otherLabel) => value === missingLabel ? missingLabel : (keep.includes(value) ? value : otherLabel);

const records = B.map(row => {
  const source = normalizeSource(row);
  const office = normalizeOffice(row);
  const county = normalizeCounty(row);
  return {
    eid: get(row, 'EID'), source, office, county,
    multiOffice: /[;；、|]/.test(office)
  };
});
const sourceRaw = counter(records.map(r => r.source));
const officeRaw = counter(records.map(r => r.office));
const countyRaw = counter(records.map(r => r.county));
const sourceKeep = topKnown(sourceRaw, 7, '未记录来源');
const officeKeep = topKnown(officeRaw, 12, '未记录批局');
const countyKeep = topKnown(countyRaw, 7, '未记录收批县');
const sourceOther = '其他来源';
const officeOther = '其他批局';
const countyOther = '其他收批县';
const nodes = {
  source: [...sourceKeep, sourceOther, '未记录来源'],
  office: [...officeKeep, officeOther, '未记录批局'],
  county: [...countyKeep, countyOther, '未记录收批县']
};

const edgeCounter = () => new Map();
const sourceOffice = edgeCounter();
const officeCounty = edgeCounter();
const triple = edgeCounter();
const key = (a, b) => `${a}\u0000${b}`;
const tripleKey = (a, b, c) => `${a}\u0000${b}\u0000${c}`;
for (const row of records) {
  const source = collapse(row.source, sourceKeep, '未记录来源', sourceOther);
  const office = collapse(row.office, officeKeep, '未记录批局', officeOther);
  const county = collapse(row.county, countyKeep, '未记录收批县', countyOther);
  sourceOffice.set(key(source, office), (sourceOffice.get(key(source, office)) || 0) + 1);
  officeCounty.set(key(office, county), (officeCounty.get(key(office, county)) || 0) + 1);
  triple.set(tripleKey(source, office, county), (triple.get(tripleKey(source, office, county)) || 0) + 1);
}
const toEdges = (map, stage) => [...map.entries()].map(([compound, count]) => {
  const [source, target] = compound.split('\u0000');
  return { stage, source, target, count };
}).sort((a, b) => a.stage.localeCompare(b.stage) || a.source.localeCompare(b.source, 'zh-CN') || a.target.localeCompare(b.target, 'zh-CN'));
const edges = [...toEdges(sourceOffice, 'source-office'), ...toEdges(officeCounty, 'office-county')];
const tripleRows = [...triple.entries()].map(([compound, count]) => {
  const [source, office, county] = compound.split('\u0000');
  return { source, office, county, count };
}).sort((a, b) => b.count - a.count || a.source.localeCompare(b.source, 'zh-CN'));
const sample = tripleRows.find(d => d.source === '新加坡' && d.office === '万益成' && d.county === '潮安') || { source: '新加坡', office: '万益成', county: '潮安', count: 0 };
const complete = records.filter(r => ![r.source, r.office, r.county].some(v => v.startsWith('未记录')));
const multiOffice = records.filter(r => r.multiOffice);
const titleA = new Set(A.map(r => r['题名']).filter(Boolean));
const titleB = new Set(B.map(r => r['题名']).filter(Boolean));
const titleIntersection = [...titleA].filter(t => titleB.has(t));

const derived = {
  schema_version: 'qiaopi-panel-02-sankey-derived/v2-csv',
  source_files: {
    flow: 'B_人物字段清洗后.csv',
    person_context: 'A_人物字段清洗后.csv'
  },
  unit: '侨批记录条数',
  rows: records.length,
  columns_used: ['寄批国家地区_统一', '寄批国家或地区', '批局主体名', '批局完整名称', '收批县域_统一', '收批县'],
  normalization: {
    source_aliases: Object.fromEntries(sourceMap),
    office_rule: '优先使用批局主体名，缺失时回退批局完整名称；分号串列保留为复合批局键，不推断其先后顺序。',
    county_rule: '优先使用收批县域_统一，缺失时回退收批县。'
  },
  display_rules: {
    source_top_n: sourceKeep.length,
    office_top_n: officeKeep.length,
    county_top_n: countyKeep.length,
    collapsed_labels: [sourceOther, officeOther, countyOther],
    missing_labels: ['未记录来源', '未记录批局', '未记录收批县']
  },
  nodes,
  raw_totals: { source: Object.fromEntries(sourceRaw), office: Object.fromEntries(officeRaw), county: Object.fromEntries(countyRaw) },
  edges,
  triples_top: tripleRows.slice(0, 80),
  sample_path: { ...sample, label: '叙事样本路径 · 新加坡 → 万益成 → 潮安' },
  quality: {
    complete_source_office_county: complete.length,
    missing_source: sourceRaw.get('未记录来源') || 0,
    missing_office: officeRaw.get('未记录批局') || 0,
    missing_county: countyRaw.get('未记录收批县') || 0,
    multi_office_rows: multiOffice.length,
    A_rows: A.length,
    B_rows: B.length,
    exact_title_intersection_A_B: titleIntersection.length,
    A_B_join_status: 'not_joined_no_stable_crosswalk'
  }
};

const outDir = path.resolve(outDirArg);
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'panel-02-sankey-derived-v2-csv.json'), JSON.stringify(derived, null, 2) + '\n');
const csv = ['stage,source,target,count', ...edges.map(e => [e.stage, e.source, e.target, e.count].map(v => `"${String(v).replaceAll('"', '""')}"`).join(','))].join('\n') + '\n';
fs.writeFileSync(path.join(outDir, 'panel-02-sankey-edges-v2-csv.csv'), '\uFEFF' + csv);
fs.writeFileSync(path.join(outDir, 'panel-02-sankey-triples-v2-csv.csv'), '\uFEFF' + ['source,office,county,count', ...tripleRows.map(e => [e.source, e.office, e.county, e.count].map(v => `"${String(v).replaceAll('"', '""')}"`).join(','))].join('\n') + '\n');
console.log(JSON.stringify({ rows: records.length, complete: complete.length, multiOffice: multiOffice.length, sample: sample.count, edges: edges.length, exactTitleIntersection: titleIntersection.length }));


