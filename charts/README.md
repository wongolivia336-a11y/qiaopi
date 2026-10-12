# 侨批 SVG 图表清单

`qiaopi-chart-manifest-v1.json` 是三张 A0 海报的图表生产清单。它不是视觉稿，也不是新的数据源；它把每个图表的“可说主张、真实字段、视觉编码、单位、图例和不确定性”固定下来，供 D3/SVG 生成和 Figma 复刻共同使用。

## 文件关系

```text
侨批可用数据.xlsx                 # 本地原始数据，不上传
课程资料/侨批可用数据-summary-v3.js  # 发布版聚合摘要：window.QIAOPI_DATA
docs/qiaopi-data-contracts-v1.md   # 数据边界、公式和审计结论
charts/qiaopi-chart-manifest-v1.json # 每个拟制图表的契约
charts/README.md                    # 使用与校验说明
```

## 三联海报映射

| 海报 | 主图 | 辅助证据 |
|---|---|---|
| 01 此岸｜起信 | `map-route` | `source-county-matrix`、`entropy-profile` |
| 02 中途｜经批局 | `threads` | `office-reach` |
| 03 彼岸｜抵达 | `annual-confidence` | `calendar-heat`、`lineage` |

八个正式图表都必须从 `window.QIAOPI_DATA` 的真实表生成。PNG 只承担信封、印泥、照片、港口等档案物件；标题、数字、坐标轴、图例、地图线和数据点必须由 SVG/Figma 重绘。

## 状态含义

- `keep`：字段和图形逻辑已经足够明确，可直接生成第一版 SVG，但仍需通过视觉 QA。
- `keep-with-audit`：可以保留，但需执行清洗、缺失值、坐标或轴标注审计。
- `rebuild-required`：当前 HTML 不能直接复用，需从真实摘要表重写绘图逻辑。
- `deferred-conceptual`：目前没有数据支撑，只能作为概念旁注，不能进入正式数据图。
- `deferred-implementation`：有候选数据表，但当前实现使用了人工/模拟形状，必须替换。
- `deferred-statistical`：字段存在，但还没有独立、可解释的统计问题；先不占用 A0 版面。

## 生成 SVG 的硬性规则

每个 SVG 必须至少包含：

1. 图表标题和一句可验证的 claim；
2. 所有坐标轴的名称、单位和方向；
3. 颜色、线宽、面积的图例；
4. 数据来源和摘要版本；
5. `未知`、无年、推断待核等不确定性说明；
6. 不把端点关系写成真实海上航线，不把记录数写成人数、金额或航次；
7. 使用 manifest 中列出的 `source_table` 和 `fields_used`，禁止临时创造没有来源的字段。

## 最小校验方式

### 1. 校验 JSON 语法

在仓库根目录运行：

```powershell
node -e "JSON.parse(require('fs').readFileSync('charts/qiaopi-chart-manifest-v1.json','utf8')); console.log('manifest JSON OK')"
```

### 2. 校验 source table 是否存在

```powershell
node -e "const fs=require('fs');global.window={};eval(fs.readFileSync('课程资料/侨批可用数据-summary-v3.js','utf8'));const m=JSON.parse(fs.readFileSync('charts/qiaopi-chart-manifest-v1.json','utf8'));const keys=new Set(Object.keys(window.QIAOPI_DATA));const refs=[...m.charts,...m.deferred].map(x=>x.source_table).filter(Boolean);const bad=refs.filter(x=>!keys.has(x));if(bad.length)throw new Error('Unknown source_table: '+bad.join(', '));console.log('source tables OK')"
```

### 3. 人工核验每个 SVG

- `source_table` 与 manifest 一致；
- 图形的最大/最小值能从摘要回算；
- 所有轴和图例与 `encodings` 一致；
- `未知`、无年和推断待核没有被悄悄删除；
- 生成日期、摘要文件名和数据版本写入 SVG 的 `<metadata>` 或旁注；
- 在 Figma 中缩放到 A0 实际阅读距离后，标签仍可读。

## 当前明确暂缓的图

`compare`、`radial`、`scatter` 已保留在 manifest 的 `deferred` 数组中，目的是留下审计痕迹，不是建议继续放进海报：

- `compare` 没有数值字段，属于概念占位；
- `radial` 当前代码用 46 条人工循环边，不能称为真实网络；
- `scatter` 虽有字段，但尚未证明会揭示独立于 `annual-confidence` 的数据事实。

正式 SVG 生成前，应先让数据审计通过，再将图表导入 Figma。不要从 AI 整页图片反向描摹数据。

