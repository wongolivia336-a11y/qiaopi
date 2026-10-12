# 侨批复杂图表工具链 v1

## 结论

可以使用第三方可视化工具，但不建议把原始 Excel 直接上传到公开网站。最稳妥的流程是：本地读取 Excel → 只导出字段级聚合摘要 → 用工具探索图形 → 导出 SVG → 清理图层和文字 → 导入 Figma → 人工完成 A0 排版。

## 工具选择

| 工具 | 最适合 | SVG/Figma 适配 | 本项目用途 |
| --- | --- | --- | --- |
| RAWGraphs | Sankey、Alluvial、Parallel Sets、矩阵/网络探索 | 官方工作流支持导出 open vector SVG；导出的图适合继续在矢量软件中整理 | 首选探索工具；使用字段级 CSV，不上传原始 Excel |
| Flourish | Sankey、Alluvial、交互叙事和快速试错 | Sankey 模板成熟，适合先验证节点顺序和流量结构；最终 SVG 细节需检查授权和导出选项 | 方案比较和交互原型 |
| Datawrapper | 印刷友好的条形、折线、地图和注释 | 支持 SVG/PDF 导出，但 SVG 通常需要付费方案 | 规则图表与出版级快速校样 |
| Tableau | 连接 Excel、筛选、交叉分析和交互 dashboard | 更适合作为分析/核对环境；不是本项目的首选可编辑 SVG 生产工具 | 检查字段、筛选异常、验证总量 |
| Observable / D3 / ECharts | 自定义复杂图、时间序列和关系网络 | 直接生成 SVG，图层命名与数据契约可控 | 当第三方模板无法诚实承载时的可复现生产层 |

## 本轮实际采用

本轮没有把原始 Excel 上传到第三方网站，而是在本地生成：

- `data/derived/panel-02-sankey-derived-v1.json`
- `data/derived/panel-02-sankey-edges-v1.csv`
- `charts/svg/panel-02-threads-sankey-v1.svg`

字段只使用：`来源国`、`批局名`、`收批县`。Sankey 三列为：

`来源国 → 批局名 → 收批县`

节点显示规则：来源国保留前 6 个已知类别，批局保留前 10 个已知类别，收批县保留前 6 个已知类别；其余合并为“其他”，缺失单独保留为“未记录”。所有合并箱仍然保留 50,064 条记录的总量。

叙事路径 `新加坡 → 万益成 → 潮安` 在原始记录中出现 1,267 条，图中使用砖红突出，但标注为“叙事样本路径”，不冒充全库总流量。

## Figma 状态

- `02_SVG Chart Library`：`P02_Threads_Sankey_EDITABLE`
- `03_A0 Triptych`：`SVG_P02_threads-sankey-v1_EDITABLE`
- P02 原 `SLOT_P02_NETWORK` 已隐藏，真实 Sankey SVG 已放入同一区域；`SLOT_P02_FLOW` 仍保留给下一张 office-reach 证据图。

## 数据边界

- 未记录批局共 25,374 条，不可解释为某个具体批局。
- Sankey 带宽按记录数成正比；如果改为极细的 thread 线，才使用平方根线宽。
- 这张图表示字段级聚合关系，不证明每一封信的真实中转先后或物理运输路线。
- 原始 Excel 保持本地，不进入公开仓库。

