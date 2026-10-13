# 侨批数据可视化：工作流与版本留痕 v1

> 本文件是《一封侨批：抵达之后》项目的协作日志规范。它记录“为什么做、用什么数据、生成了什么、如何复核”，而不是只记录最后一次视觉改稿。

## 1. 本轮目标

- 将三张 A0 海报的结构收敛为“此岸｜起信—中途｜经批局—彼岸｜抵达”。
- 以真实数据生成可编辑 SVG 图表，以 PNG 记录/素材承载物件、照片和纸张质感。
- 在 Figma 中完成最终编排，避免把 AI 生成的整页图直接作为成品。
- 保留一条跨三张海报的代表性侨批叙事线，并与全库统计路径明确区分。
- 让每轮数据、图表、视觉和评审都可以回溯到 GitHub commit。

## 2. 当前仓库基线

- 仓库：`wongolivia336-a11y/qiaopi`
- 分支：`main`
- 本轮开始时基线提交：[`8e2cdfb`](https://github.com/wongolivia336-a11y/qiaopi/commit/8e2cdfb7d3d0f9eb733c39ede326283c72dd3a76)
- 本轮工作日志提交：[`f6f4576`](https://github.com/wongolivia336-a11y/qiaopi/commit/f6f4576905c8b78f71019be4a34bc84377fe0bd3)
- 基线内容：v4 HTML 原型、字段摘要脚本、地图依赖和两项 PNG 资产。
- 原始 Excel 不上传；Excel 只作为本地源文件保存。公开仓库中的摘要脚本必须注明字段来源、处理时间和是否含身份字段。

## 3. 三张海报的工作分层

### 01 此岸｜起信

- 主图：海外来源地 → 潮汕收批县的真实地理流向图。
- 证据图：来源国 × 收批县矩阵、县域集中度/熵值。
- 叙事物件：信封、邮票、港口、南洋地图、代表性起信样本。

### 02 中途｜经批局

- 主图：寄批地 → 批局 → 收批县的三段式 Threads 网络。
- 证据图：批局覆盖范围、批局经营半径、真实连接数量。
- 叙事物件：批局门面、批簿、印泥、过手的人、批局编号。

### 03 彼岸｜抵达

- 主图：年度记录与日期可信度的时间轴。
- 证据图：年 × 月热力图、寄批人—收批县关系时间线、具体家书卡片。
- 叙事物件：乡村/家门、手、家书、回批、木棉花；微观样本必须带 EID 或来源编号。

## 4. 图表数据契约

每一张正式图表在生成前先写清楚以下字段：

```yaml
chart_id: source-county-matrix
claim: 海外来源地与潮汕收批县存在非均衡连接
source: 侨批可用数据.xlsx / 公开字段摘要
unit: 记录数
row: 来源国
column: 收批县
size: 组合记录数
color: 仅用于区分来源国或重点组合
uncertainty: 缺失字段不得被解释为现实中断
```

如果一个图表无法填出 `claim`、`source`、`unit` 和编码方式，它只能作为草图，不进入最终海报。

## 5. 文件组织约定

```text
docs/
├─ qiaopi-worklog-v1.md          # 本文件：过程、决策、提交索引
├─ data-dictionary-v1.md         # 字段定义、缺失值、清洗规则
├─ chart-contracts-v1.md         # 每张图表的数据契约
└─ review-log-v1.md              # 老师/团队评审与取舍

data/
├─ source/                        # 不上传原始 Excel；记录来源位置与授权
└─ derived/                       # 可公开的脱敏/摘要数据

charts/
├─ svg/                           # 可编辑图表：地图、网络、时间轴、热力图
├─ png/                           # 透明局部资产：信封、印泥、照片、纸纹
└─ previews/                      # 浏览器预览与导出检查图

posters/
├─ figma/                         # Figma 导出稿和版本说明
└─ exports/                       # A0 预览图、打印检查图
```

## 6. 每轮提交规则

每次只提交一个可以解释清楚的阶段，建议使用以下前缀：

| 前缀 | 用途 | 示例 |
| --- | --- | --- |
| `data:` | 数据摘要、字典、校验 | `data: add source-county aggregation v1` |
| `chart:` | SVG 图表与契约 | `chart: add source-county matrix svg` |
| `asset:` | PNG、照片、纹理资产 | `asset: add transparent envelope fragments` |
| `layout:` | Figma 结构或海报编排说明 | `layout: refine three-poster grid` |
| `review:` | 评审记录和问题清单 | `review: record teacher feedback on chart claims` |
| `docs:` | 工作流、README、研究说明 | `docs: document reproducible export workflow` |

每个 commit 或 PR 描述至少包含：

1. 本轮改了什么；
2. 数据来自哪里；
3. 哪些内容是统计结果，哪些内容是叙事/视觉素材；
4. 如何验证；
5. 下一轮未解决的问题。

## 7. 多 agent 协作分工

建议一次只让一个 agent 写入同一类文件：

- **数据 agent**：整理字段、聚合、缺失值和校验；只能写 `data/` 与数据文档。
- **图表 agent**：依照契约生成 SVG；不得修改原始数据，不得伪造标签。
- **资产 agent**：生成/处理透明 PNG；不得生成中文数据文字、坐标轴和地图事实。
- **编辑/审稿 agent**：审查故事、图例、信息层级和“数据事实 vs 显性知识”。
- **整合 agent**：把已经复核的资产放入 Figma/HTML，并负责预览导出。

如果多个 agent 同时提出修改，先进入 `docs/review-log-v1.md`，由整合 agent 选择，避免互相覆盖。

## 8. 模型和工具角色

- **高推理模型**：只处理叙事结构、数据事实审查、最终视觉/可读性评审。
- **常规模型**：处理字段清洗、SVG 批量生成、坐标轴/图例、命名、检查脚本。
- **图像生成模型**：只生成非事实性物件与透明局部资产；不生成地图、图表、中文标题或历史数据。
- **Lieflat Charts skill**：用于真实数据图表和报告模板；同一交付物不混用多个色系，成品公开分发时保留开发者署名。
- **Figma**：最后的人工编辑场；标题、图例、标注、材质叠加和裁切在 Figma 中完成。

## 9. 每轮验收清单

- 图表是否有标题、单位、横纵坐标和图例？
- 线宽、面积、颜色是否都能对应到明确字段？
- 代表性叙事线是否被标为样本，不冒充全库流量？
- 真实档案、AI 生成资产和设计性纹理是否有区分？
- 是否存在没有 `claim` 的装饰性图表？
- A0 尺寸导出后，小字、标签和线宽是否仍可读？
- 原始数据是否未被意外上传？
- 预览图是否与 HTML/Figma 的最新版一致？

## 10. 下一轮推荐顺序

1. 先补 `docs/data-dictionary-v1.md` 和 `docs/chart-contracts-v1.md`。
2. 用真实摘要数据生成三张主图 SVG，不先做复杂 PNG 拼贴。
3. 对主图进行数值、单位、标签和打印尺寸检查。
4. 再加入少量透明 PNG 资产，控制素材对图表的遮挡。
5. 在 Figma 里完成三张 A0 的统一网格与跨页叙事线。
6. 导出 PDF/PNG，并把预览图、检查结果和取舍写进 `review-log-v1.md`。

## 11. 版权与公开说明

- 原始 Excel 不进入公开仓库；若公开摘要包含姓名、地址或具体家族字段，应再次确认公开范围。
- 真实档案图、网络地图、外部字体和生成式资产分别记录来源与许可。
- 公开分发使用 Lieflat Charts skill 生成的内容时，保留约定署名：本 skill 由“躺在废墟里”开发，若公开分发内容请署名或 @ 开发者。

## 12. 2026-10-12｜`chart:` 第一面板 SVG v1

- 生成 `map-route`、`source-county-matrix`、`entropy-profile` 三张可编辑 SVG，并保存可复现脚本、派生表与 PNG 预览。
- 数据字段均来自摘要 `flows.source / flows.county / flows.count`；位置使用名称匹配后的外部制图坐标。
- 修复 v4 原型的固定节点半径、矩阵面积非正比、`印尼`别名遗漏、手写伪经纬刻度和熵值口径问题。
- 数据 QA：`total=50,064`，`sum(flows)=50,062`；未知来源 796、未知收批地 683、双端未知 548；差额不做推测，写入三图限制说明。
- 图型：矩阵采用 L4 Arc Matrix；熵图采用 F5 Tick Rows 的横向导轨/直接标签语法；地理流向因 M2/B3/L5 均不能同时表达地理位置与多对多边，登记为库外地图翻译。
- 叙事表述改为“选定的聚合组合/叙事样本”，不称单件档案行程。砖红样本为 `新加坡 → 万益成 → 潮安`，地图只表达新加坡—潮安两端关系。
- 暂缓项不变：`compare` 无数据、`radial` 为人工模拟边、`scatter` 尚未证明独立结论。

## 13. 2026-10-12｜`asset:` 视觉结构素材扩充 v1

- 走查三联海报参考图后，确认当前缺口主要是结构层而非更多具象物件：撕纸边、照片装裱、账页骨架、无字邮戳环、灰蓝底纹和窗格/墙面边角。
- 新增 6 个透明 PNG：`qiaopi-torn-paper-edge-v1`、`qiaopi-photo-mount-frame-v1`、`qiaopi-postmark-rings-v1`、`qiaopi-ledger-fragment-v1`、`qiaopi-blue-wash-texture-v1`、`qiaopi-window-lattice-fragment-v1`。
- 所有新增素材均标注为生成式氛围资产，不承担事实、日期、数量、地名或人物身份；可读中文、地图、统计图和砖红路线继续由人工/Figma/SVG 负责。
- 已上传至 Figma `04_PNG Assets`，统一命名为 `GENERATED/...`；新增节点放置在 y=4000 与 y=5200 两行，便于后续逐一拖入三张 A0。
- 详细走查与组合规则见 `charts/png/qiaopi-visual-asset-audit-v1.md`。

## 14. 2026-10-12｜`layout:` A0 三联拼贴占位 v1

- 在 Figma `03_A0 Triptych` 三张 A0 frame 中建立 `SLOT_*` 图表预留区和 `COLLAGE_*` 素材层，先收敛视觉重心，再导入真实 SVG。
- 采用共享图像哈希重建当前页图片节点，避免跨页面 clone 导致 PNG 不可见；所有图片均可单独移动、缩放、隐藏或替换。
- 此岸放置灰蓝底纹、信封、印泥、木棉和撕纸边；中途放置相片框、批局、邮袋木箱、账页和邮戳环；彼岸放置账页、窗格、写信人、桌面书信、信封和撕纸边。
- 结构截图检查通过：三张 A0 均保留标题区、主图区、次级图表区和说明/家书区的大留白；本轮不导入真实 SVG，不把装饰当作数据。

## 15. 2026-10-12｜`layout:` P01 真实地图 SVG 放置

- 参考图中的大地图不作为生成式 PNG，而是将 `charts/svg/panel-01-map-route-v1.svg` 导入 Figma `03_A0 Triptych`。
- 节点 `98:2` 命名为 `SVG_P01_map-route-v1_EDITABLE`，放入 `A0_01_此岸_起信` 的地图区，保留真实底图、经纬轴、灰蓝全库关系和砖红叙事样本线。
- 参考图中的小型国别/县域剪影仍未伪造；下一轮若需要，将基于真实地理数据提取为独立 SVG 图层。

## 16. 2026-10-12｜`chart:` 从本地 Excel 重建三段式 Sankey

- 读取用户附上的本地 Excel，仅使用 `来源国`、`批局名`、`收批县` 三个字段；原始 Excel 不复制到仓库。
- 生成字段级派生表：`data/derived/panel-02-sankey-derived-v1.json` 与 `data/derived/panel-02-sankey-edges-v1.csv`。
- 生成 `charts/svg/panel-02-threads-sankey-v1.svg`：来源国 → 批局名 → 收批县；带宽按记录数成正比，未知类别单独保留，叙事样本路径 `新加坡 → 万益成 → 潮安` 为 1,267 条真实组合并用砖红标注。
- SVG 已上传到 Figma `02_SVG Chart Library` 与 `03_A0 Triptych`；P02 的 `SLOT_P02_NETWORK` 已由 `SVG_P02_threads-sankey-v1_EDITABLE` 占位替换，`SLOT_P02_FLOW` 继续留给 office-reach。
- 工具评估与外部导出边界见 `docs/qiaopi-chart-toolchain-v1.md`。

## 17. 2026-10-13｜`chart:` 修复 P01 底图并美化 P02 Sankey

- 修复 `generate-panel-01-svg.mjs` 的 TopoJSON 多边形环解码：旧实现把 polygon ring 当作单个 arc id，导致底图路径空白、异常拉伸；新实现按 Polygon / MultiPolygon 的 ring 结构解码。
- P01 地图改为聚焦“南洋—潮汕主航域”（95–123°E、8°S–32°N），不删除原始字段，只避免 3 条澳大利亚记录压缩主要视觉尺度。
- 新增 `潮汕收批地 · 局部展开`，将潮安、澄海、揭阳、饶平、普宁、汕头等县域的名称和记录数拆开显示，并明确标注“位置为阅读性展开，不按比例”。
- P02 Sankey 增加三段栏头、缺失节点虚线边框、按流量动态调整的灰蓝透明度；砖红仍只表达 `新加坡 → 万益成 → 潮安` 叙事样本路径。
- 新 SVG 已重新导入 Figma `03_A0 Triptych`：P01 节点 `P01_Map_Route_EDITABLE_v2`，P02 节点 `P02_Threads_Sankey_EDITABLE_v2`；旧版本保留但隐藏，便于回溯。
- 远程 GitHub 已记录为 `chart:` 提交；当前最新远程提交为 `66d6cc59dcf70cb2cdddb20b0010094bf93be760`。

## 18. 2026-10-13｜`chart:` 降低深色节点重量

- 将 P01 收批县节点从墨黑改为灰褐，并保留砖红外圈作为叙事强调。
- 将 P02 收批县节点从深墨色改为灰蓝，文字墨色同步调整为柔和的深灰褐；灰蓝关系带和砖红样本带的编码不变。
- Figma 中更新为 `P01_Map_Route_EDITABLE_v3_LIGHT` 与 `P02_Threads_Sankey_EDITABLE_v3_LIGHT`，旧版本隐藏保留。

## 19. 2026-10-13｜`chart:` 完成 office-reach 双指标 SVG

- 从本地 Excel 使用 `批局名`、`收批县` 两个字段生成 `data/derived/office-reach-derived-v1.json`。
- 生成 `charts/svg/panel-02-office-reach-v1.svg`：左侧灰蓝横条表达批局可识别记录量，右侧灰褐点位表达已知收批县类别数；两个指标分开编码，不合成为无单位分数。
- 排除“未记录批局”后展示记录量最高的 12 个批局；`万益成` 以砖红强调，因为它是跨面板叙事样本路径中的批局。
- 明确标注：已知收批县数量是字段类别覆盖，不等同经营半径或地理距离；缺失批局与缺失收批县分别列出。


