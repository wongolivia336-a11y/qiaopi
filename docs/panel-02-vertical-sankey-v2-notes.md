# P02｜竖向桑基网络 v2（CSV-backed）

## 这次改了什么

P02 的主图由原先横向的 `routeTriples / Sankey v2` 替换为自上而下阅读的竖向编辑 SVG：

`寄出地 → 经手批局 → 收批县`

每一层是横向节点带，带宽与记录数成正比；流带从上层节点穿过批局层落到收批县。这样保留了参考海报中“纵向叙事、横向带宽、档案注释”的视觉节奏，同时避免把三个阶段压成一条横向仪表盘。

## 数据来源和字段

- 主流量表：用户提供的 `B_人物字段清洗后.csv`，50,064 条，使用 `EID`、`寄批国家地区_统一`／`寄批国家或地区`、`批局主体名`／`批局完整名称`、`收批县域_统一`／`收批县`。
- 人物字段审计：用户提供的 `A_人物字段清洗后.csv`，13,578 条。A 与 B 没有稳定跨表键；题名精确重合 7 个唯一值，因此不将 A 的人物边际统计拼成 B 的路线。
- 仓库只提交派生聚合表，不提交原始 CSV。

派生文件：

- `data/derived/panel-02-sankey-derived-v2-csv.json`
- `data/derived/panel-02-sankey-edges-v2-csv.csv`
- `data/derived/panel-02-sankey-triples-v2-csv.csv`

## 事实审计

- 三段字段均可识别：24,068 条。
- 寄批来源缺失：572 条。
- 批局缺失：25,374 条；图面保留 `未记录批局`，不将其解释为某个具体批局。
- 收批县缺失：683 条。
- 批局字段含复合串列：1,601 条；图面保留复合键，不重构其内部中转先后。
- 叙事样本路径：`新加坡 → 万益成 → 潮安`，1,267 条真实组合。砖红只标注这条样本路径，不代表全库总流量。

## SVG 分组

`background`、`paper-grid`、`chart-title`、`map-silhouette`、`stage-headers`、`links-base`、`links-focus`、`nodes-source`、`nodes-office`、`nodes-county`、`sample-path`、`legend`、`missing-audit`、`source-and-notes` 均为独立编辑分组。地图剪影明确标注为装饰，不承载行政边界或坐标事实。

## Figma 状态

- P02 主槽位：`SLOT_P02_NETWORK`（`95:14`）。
- 当前显示：`P02_Threads_Vertical_Sankey_EDITABLE_v2_CSV`（`287:2`）。
- 上一版 CSV 导入：`285:2`，已隐藏归档。
- 原横向 Sankey：`121:2`，已隐藏归档，保留回滚。

## 复现

```powershell
node charts/scripts/derive-panel-02-sankey-csv-v2.mjs `
  "E:\OneDrive\...\B_人物字段清洗后.csv" `
  "E:\OneDrive\...\A_人物字段清洗后.csv" `
  data/derived
node charts/scripts/generate-panel-02-vertical-sankey-svg-v2.mjs
```

Flourish / d3 的贡献只借鉴布局与流带排序逻辑；公开交付仍以仓库中的本地可再生、可导入 Figma 的 SVG 为准。

本 skill 由“躺在废墟里”开发，若公开分发内容请署名或@开发者。


