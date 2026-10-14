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

## 20. 2026-10-13｜`chart:` 完成 P03 annual-confidence 时间层叠图

- 从公开字段级摘要 `课程资料/侨批可用数据-summary-v3.js` 的 `yearStats` 重建 `charts/svg/panel-03-annual-confidence-v1.svg`，不读取或上传原始 Excel。
- 上轨以堆叠柱表达年度记录条数：灰蓝＝日期/年份直读，灰褐＝推断/待核；下轨以同一线性年份轴表达两种比例，分别使用 0–100% 刻度，避免条数与百分比共用坐标。
- 主图按 1915–2020 年线性排列；1694 年孤立记录单列说明；无年记录另列，不压入任何具体年份。当前摘要审计值：无年 13,118 条，直读 31,083 条，推断/待核 5,863 条。
- 红色仅用于 2020 年特殊缺失结构提示，不承载叙事路线；外部历史事件竖线不纳入，避免没有史料来源的因果暗示。
- 派生审计表保存为 `data/derived/panel-03-annual-confidence-derived-v1.json`；SVG 具有 `count-panel`、`confidence-panel`、`confidence-lines`、`legend`、`source-and-notes` 等可编辑分组。

## 21. 2026-10-13｜`review:` P01 地图/矩阵/集中度视觉走查

- 走查 `map-route`、`source-county-matrix`、`entropy-profile` 的 SVG 与三联海报参考图：三图均保留标题、单位、轴、图例、数据来源、缺失说明及可编辑分组；地图的县域端点因真实地理位置相邻，使用“潮汕收批地·局部展开”阅读性索引承接密集区域，不把展开位置误写成经纬度。
- 修正 P01 生成脚本的墨色：文字/注释使用柔和深灰褐 `#3E3933`，熵值标记使用灰褐，县域索引与展开点使用灰蓝；清除旧的 `#27231F`/纯黑数据点，避免印刷和 Figma 缩放时形成黑团。
- 地图底图继续使用 `countries-110m.json` 的 TopoJSON 解码结果；坐标范围聚焦 95–123°E、8°S–32°N，仅改变阅读视窗，不改变 `flows.source / flows.county / flows.count` 的记录口径。澳大利亚记录仍在派生审计表中保留，但不被压缩进主航域视觉。
- 视觉复杂度来自真实聚合关系、节点/连线层、局部展开、经纬网格和注释层；不以额外虚构的装饰性线路填充空白。P01 下一步在 Figma 中可叠加轻量纸张/邮戳 PNG，但不能遮挡轴、图例、缺失说明或来源脚注。
- 因原熵图在窄槽位中出现文字密度过高，新增 `charts/scripts/generate-panel-01-entropy-compact-svg.mjs` 与 `charts/svg/panel-01-entropy-profile-compact-v1.svg`，固定为 820×1050 槽位比例；保留公式、n/k/未知来源说明与 10 个真实县域行。

## 22. 2026-10-13｜`chart:` 将 P03 时间图改为横向双面板

- 原 `annual-confidence` 为 1800×1260 竖向双层图，放入 P03 的 2850×760 横向时间槽后缩放过小；新增 `charts/scripts/generate-panel-03-annual-confidence-wide-svg.mjs` 与 `charts/svg/panel-03-annual-confidence-wide-v1.svg`。
- 新版把相同真实字段拆成左右两块：左侧灰蓝/灰褐堆叠柱为年度记录条数，右侧灰蓝/灰褐双线为日期直读/推断待核比例；下方共享年份刻度、图例、无年记录与 1694 年孤立记录说明。
- 仍保留 2020 年砖红提示，但不把它解释为叙事路线；SVG 分组包括 `count-panel`、`confidence-panel`、`confidence-lines`、`legend`、`data-callouts`、`source-and-notes`，可独立编辑。

## 23. 2026-10-13｜`chart:` 补齐 P03 日历热力与关系覆盖证据

- `calendar-heat` 使用 `calendar.year / month / count`：1915–2020 年 × 1–12 月矩阵，36,095 条已知年月记录、865 个已出现组合、407 个 NA 空白组合；850 条年份已知但月份未知的记录另列，不把 NA 当作零。
- `lineage` 使用 `senderCounty.sender / county / count / start / end`：保留 30 个真实寄批人—收批县组合；29 行有首末年份，1 行日期缺失。原始宽版保留在库中，P03 窄栏实际放入 `panel-03-lineage-compact-v1.svg`，避免标签挤压。
- 两图均保留标题、轴、单位、图例、来源和缺失值说明；实线只表达摘要首末年份，不证明区间内逐年连续通信，也不直接把组合解释成家谱。

## 23. 2026-10-13｜`chart:` 完成 P03 calendar-heat 年月密度图

- 从公开字段级摘要 `课程资料/侨批可用数据-summary-v3.js` 的 `calendar.year / calendar.month / calendar.count` 重建 `charts/svg/panel-03-calendar-heat-v1.svg`，并保存 `data/derived/panel-03-calendar-derived-v1.json`；原始 Excel 不读取、不上传。
- 图面用 `1915–2020 × 1–12 月` 的真实年月矩阵，空组合保留为 NA；上方增加年度总量折线，右侧增加跨年份月份总量条，形成参考图所需的密度层/注释层/图例层，而不是单一色块。
- 计算口径：显示区间有 36,095 条、865 个已出现年月组合、407 个空白组合；另有 850 条年份已知但月份未知（`month=0`），以及主轴外早期记录，均单列说明。
- 颜色只使用分段透明度的灰蓝/灰褐和相对高值砖红提示，不使用连续渐变；SVG 分组包括 `annual-strip`、`heatmap`、`month-profile`、`legend`、`data-callouts`、`source-and-notes`。

## 24. 2026-10-13｜`chart:` 完成 P03 lineage 覆盖区间图

- 从公开字段级摘要的 `senderCounty.sender / county / count / start / end` 生成 `charts/svg/panel-03-lineage-v1.svg`，并保存 `data/derived/panel-03-lineage-derived-v1.json`。
- 30 个真实寄批人—收批县组合行全部保留：29 行有首末年份，1 行日期缺失；实线只表达摘要首年与末年，端点圆面积表达组合记录条数，收批县类别用灰蓝/灰褐/尘色区分。
- 图中加入组合数、可识别日期行数、平均覆盖区间、日期缺失提示和时间轴注释，使其在 P03 作为“长期关系证据层”与 annual-confidence、calendar-heat 形成繁复但可核验的证据组。
- 严格注明：摘要不含逐年记录集合，不能把区间解释为连续通信或真实断档；寄批人属于可识别字段，公开展出前需核验授权，也不能直接解释为家谱。

## 25. 2026-10-13｜`chart:` 升级 P02 Sankey 为分层网络 v2

- 新增 `charts/scripts/generate-panel-02-sankey-v2-svg.mjs` 与 `charts/svg/panel-02-threads-sankey-v2.svg`；数据仍来自本地 Excel 的 `来源国`、`批局名`、`收批县` 字段级派生表 `panel-02-sankey-derived-v1.json`，没有增加人工模拟边。
- 视觉上拆成 `sankey-links-base` 与 `sankey-links-focus` 两个可编辑层：全部真实聚合边以浅灰蓝低透明度保留网络繁复度，来源—批局与批局—收批县两段各取真实记录量前 16 条加细描边，形成主流/细流层级；带宽仍按记录条数编码。
- 节点改为轻量档案卡片：阶段导轨、节点总量/占比、未知虚线节点、Top-N “其他”边界和缺失值审计卡均保留；避免黑色重节点与无意义装饰线。
- 新增真实 `新加坡 → 万益成 → 潮安` 局部放大 inset，数值显示 `routeTriples.sample_path.count`，并明确是叙事样本，不是全库总流量；同时保留缺失批局 25,374 条等边界说明。
- manifest 将 `threads` 输出更新为 `panel-02-threads-sankey-v2.svg`，状态为 `upgraded-hierarchical-editable-svg`；P02 中原 v1 可保留隐藏作为回溯版本，v2 作为新版候选。

## 26. 2026-10-13｜`chart:` 增加 P02 圆形弦图替代视图

- 新增 `charts/scripts/generate-panel-02-circular-chord-svg.mjs` 与 `charts/svg/panel-02-circular-chord-v1.svg`；仍使用 `routeTriples` 的真实字段级聚合，不复用旧 radial 的人工循环边。
- 圆周分为来源国、批局、收批县三个阶段段落；淡线保留全部 139 条真实聚合边，重点层突出来源—批局和批局—收批县各前 12 条关系，砖红只表达真实叙事样本 `新加坡 → 万益成 → 潮安`。
- SVG 具有 `chord-links-base`、`chord-links-focus`、`stage-arc-source`、`stage-arc-office`、`stage-arc-county`、`radial-field`、`annotation` 等可编辑分组；圆周位置只表达阶段和类别，不表达地理方向。
- 已导入 Figma `02_SVG Chart Library`（节点 `124:2`），并在 P02 `SLOT_P02_FLOW` 的空白左侧放入紧凑预览（节点 `125:2`），与 office-reach 并列，便于比较直线 Sankey 与圆形网络两种读法。
- manifest 新增 `threads-circular`，状态为 `new-real-data-alternate-view`；原 deferred `radial` 不再作为最终实现依据。

## 27. 2026-10-13｜`chart:` 补充 P01 海外来源结构侧栏并清理三页占位文字

- 新增 `charts/scripts/generate-panel-01-source-profile-svg.mjs` 与 `charts/svg/panel-01-source-profile-v1.svg`；使用公开摘要 `flows.source / flows.count` 聚合 7 个已知来源地，按记录量排序，泰国 24,189 条、新加坡 18,501 条，未知来源 796 条另列。
- P01 新 SVG 导入 `03_A0 Triptych` 右侧空栏，节点 `141:2`，尺寸 `760 × 1,576`；它把原先的大段空白变成可核验的来源结构索引，不添加人工关系。
- 三张 A0 的 `TITLE / 章节信息`、`SVG FLOW DETAIL`、`CAPTION / SOURCE NOTES`、`LETTER / QUOTE` 均已替换为真实中文章节标题、读图说明或明确的待接入家书字段；标题使用 Figma 可编辑文本，字体为 `Noto Sans SC`，避免 SVG 导入后的固定宽度换行看起来像乱码。
- P02 新增“读法二 / 圆形网络与批局覆盖”分隔层；P03 新增“抵达之后 / 时间与关系证据”分隔层；P01 新增“航路注记”与“证据层 / 组合与来源结构”。
- 所有新增文字均不虚构家书原文、人物身份或历史解释；P03 家书区明确保留 EID、日期、寄批人、收批县与授权信息字段，等待人工接入真实样本。

## 28. 2026-10-13｜`chart:` 新增 P03 archival time-ribbon 备选叙事

- 新增 `charts/scripts/generate-panel-03-time-ribbon-svg.mjs` 与 `charts/svg/panel-03-time-ribbon-v1.svg`；数据只来自公开摘要派生表 `data/derived/panel-03-annual-confidence-derived-v1.json`，不读取或上传原始 Excel。
- 纸带主轴保留 1915–2020 的 91 个年度行与 3 个连续年份段；灰蓝层表示 `direct`，灰褐层表示 `inferred`，厚度按 `sqrt(count)` 缩放，细线表达 `direct / count` 的日期直读比例。
- 13,118 条 `unknown_year_count` 不压入任何年份；孤立的 1694 年记录也不伪装成主时间轴连续段。空段只表示当前摘要未覆盖，不等同现实中的通信中断。
- 该图是参考“纸带/档案层叠”视觉的真实数据替代读法，不声称复刻无法稳定访问的外部参考图，也不添加外部历史事件因果解释。SVG 分组包括 `time-ribbon`、`confidence-thread`、`peak-callouts`、`summary-cards`、`legend` 与 `source-and-notes`，保留 Figma 逐组编辑能力。

## 29. 2026-10-14｜`asset:` 补充 P03 连接性 PNG，并完成中段排版修正

- 走查 `03_A0 Triptych` 后确认：P03 的主要缺口不是继续堆人物或建筑，而是日历/关系证据带与家书区之间缺少“档案桌面”的连接层。因此新增 `charts/png/qiaopi-archive-slip-cluster-v1.png` 与 `charts/png/qiaopi-ledger-tab-bundle-v1.png`。
- 两件素材均为透明氛围 PNG，不含可读中文、数字、地图、统计图或人物身份；它们只用于纸条、地址签、装订痕迹和版面边界，不能替代真实档案。
- Figma P03 中段排版：日历节点 `115:2` 放大至 `1840×1040`，关系图 `117:2` 放大至 `820×1040` 并与日历共用 `y=1600` 证据带；家书槽位 `95:31` 上移至 `y=2860`。
- 修复日历 SVG 导入后的中文显示：76 个文本节点统一为 `Noto Sans SC`，标题/注释改为可伸缩文本框，月份汇总字号降为 12；截图复核后，原先的标题换行和月份栏叠字已消失。
- 两件新 PNG 已复制到 `charts/png/` 并写入资产清单；尝试上传 Figma `04_PNG Assets` 时，上传提交端仍返回 Windows Schannel `SEC_E_NO_CREDENTIALS`，因此暂不把失败的上传声称为完成。

## 30. 2026-10-14｜`layout:` P03 新增证据带，补齐版式与缺失项清单

- 走查截图后确认，P03 的“demo 感”主要来自证据图表与家书区之间缺少承接层，而不是缺少更多人物或建筑。于是新增 Figma `P03_EVIDENCE_RAIL`（`156:2`，2860×140）及三个可编辑证据卡片。
- 三张卡片使用真实摘要口径：无年记录 13,118 条、寄批人—收批县关系组合 30 组、家书样本待授权；砖红只做小面积强调，灰蓝承载结构提示，避免黑色重块。
- 新增 `docs/qiaopi-p03-gap-list-v1.md`，把 PNG、SVG、文本、Figma 手工收尾与当前 TLS 阻塞分开列出；明确哪些是“GitHub 已有但未进 Figma”，哪些必须等待真实授权资料。

## 31. 2026-10-14｜`layout:` P03 增加档案目录条与印刷信息层

- 在 P03 底部新增 `P03_CATALOG_FOOTER`（Figma `158:2`，2860×96），将原本靠近出血边的大块留白收束为一条低对比度档案目录条。
- 目录条只放来源、数据规模、缺失日期口径、家书授权状态和版本号；不新增统计事实，也不把生成式素材当作档案。
- 视觉上使用纸色底、灰褐细边、6 px 砖红标记和 Noto Sans SC 小字；截图复核通过，未遮挡写信人、桌面书信、证据卡或底部撕纸边。

## 32. 2026-10-14｜`layout:` P03 增加“证据 → 样本”阅读提示

- 新增 `P03_SAMPLE_TRANSITION_CUE`（Figma `159:2`），收窄至家书左栏上方，避免横跨右侧写信人拼贴。
- 灰褐细线和小砖红圆点只表达阅读顺序；旁注明确“统计证据 → 授权家书样本”，并注明不代表逐年连续通信。
- 该提示不新增数据编码，不替代证据卡、家书字段或真实关系图；截图复核后与家书面板、底部目录条均保持安全间距。

## 33. 2026-10-14｜`layout:` P01 增加地图读法卡，收束地图下方留白

- 走查 P01 截图后确认：地图 SVG 本身的县域端点与局部展开已可读，主要问题是地图槽位下半段留白过大，而不是继续放大地图导致地理比例失真。
- 新增 Figma `P01_MAP_READING_CARD`（`160:2`，2050×360），放在地图 SVG 下方的纸色/灰蓝底纹区域。
- 卡片保留三组真实口径：已知来源 50,062 条与未知来源 796 条另列；`新加坡 → 万益成 → 潮安` 砖红线为叙事样本索引；潮汕端点标签为阅读性局部展开。
- 该卡片不增加新的地图几何、不改变坐标、不把连线写成海上航线；它只把图例、限制说明和视觉读法重新组织成可编辑的三栏档案卡。

## 34. 2026-10-14｜`chart:` P01 Hero Map SVG，替换局部失真地图

- 针对截图中“端点糊成一团、局部像 demo”的问题，新增 `charts/scripts/generate-panel-01-map-hero-svg.mjs`，从公开摘要 `flows.source / flows.county / flows.count` 和现有 TopoJSON 底图重新生成 `charts/svg/panel-01-map-route-hero-v1.svg`。
- 新图保留真实聚合关系，但把视觉系统分成：坐标网格、海陆底图、全量细流、Top-12 主流、砖红叙事样本、来源节点外环、潮汕收批地局部展开、审计卡片与来源脚注。
- 潮汕局部展开明确标注“位置为阅读性展开，不按比例”，只用于拆开相邻端点标签；没有将展开连线冒充真实路线。
- 实际审计值：可定位来源—收批地聚合记录 49,124 条；7 个已知来源类别；14 个收批地类别；`新加坡 → 潮安` 聚合记录 14,505 条。未知来源/收批地与 `flows` 少 2 条的限制继续保留。
- SVG 已上传并嵌入 Figma P01 节点 `163:2`；旧版本和占位槽位隐藏保留。截图复核后，P01 不再是单一地图局部，而是可独立编辑的档案制图板。

## 35. 2026-10-14｜`chart:` P01 Origin Atlas，拆开来源点并改用点阵图册语法

- 用户走查指出旧地图中出发点彼此重叠、地理底图被压缩，参考图更适合采用“点阵地图 + 资料卡片 + 端点索引”的艺术化数据叙事。于是新增 `charts/scripts/generate-panel-01-origin-atlas-svg.mjs`，生成 `charts/svg/panel-01-origin-atlas-v1.svg` 与 `data/derived/panel-01-origin-atlas-derived-v1.json`。
- 该图仍只使用公开摘要 `flows.source / flows.county / flows.count`：可定位来源—收批地聚合记录 49,124 条，7 个已知来源类别，13 个有记录的收批地类别；叙事样本 `新加坡 → 潮安` 为 14,505 条聚合记录。
- 三层视觉语法：左侧真实经纬地理场（灰蓝细流 + Top-10 主流 + 砖红叙事样本），右侧 7 张来源记录卡（完整圆点约 1,000 条，残点为余量），底部 Top-10 收批地端点场（圆面积＝记录量，横向排布只用于标签避让）。
- 参考图的点阵/图册结构只作为视觉语法迁移，不复制其颜色或 3D 效果；本项目继续使用纸色、灰蓝、砖红、灰褐，避免黑色重块、渐变和发光。SVG 新增 `legend`、`source-and-notes` 与缺失值说明，保持可编辑、可追溯。
- Figma 新上传最终版本节点 `169:2`，嵌入 `A0_01_此岸_起信`（`84:10`）并截图复核；旧版本 `166:2`、Hero Map `163:2` 隐藏保留，便于在人工 Figma 评审时切换比较。
- 开源参考策略固定为“借几何/投影/交互方法，不导入黑箱截图”：d3-geo-projection 用于投影实验，mapshaper 用于 TopoJSON 简化，deck.gl ArcLayer / kepler.gl 用于交互探索；公开交付仍以本地可再生的 Figma 可编辑 SVG 为准。

## 36. 2026-10-14｜`review:` P01 Origin Atlas Figma 字体与点阵叠字修正

- A0 实寸走查发现：SVG 导入本身保持可编辑，但 Figma 默认将中文按 Inter 窄文本框处理，来源卡名称出现竖排，且原点阵从卡片左侧起步会与文字重叠。
- 生成脚本将来源卡点阵移至卡片右侧；Figma 节点 `174:2` 的 89 个文本节点统一加载并切换为 `Noto Sans SC`，设置 `WIDTH_AND_HEIGHT` 自适应，地图来源标签、收批端点标签和脚注均恢复横向可读。
- 由于 TopoJSON 多边形的导入边界远大于可视地图，`title-block` 在 Figma 层级中被提升到最上方，避免底图边界覆盖标题；没有改动数据坐标或关系边。
- 截图复核通过：来源卡不再叠字，完整圆点/残点的单位仍可读，P01 主地图在整页缩略图中不再出现乱码式标题。旧节点 `169:2` 隐藏保留以便人工比较。

## 37. 2026-10-14｜`review:` P02 SVG 统一字体与标题层级

- 走查发现 P02 Sankey、Office Reach、圆形弦图仍有 Inter 窄文本框造成的中文标题叠字；P02 节点 `121:2`、`110:2`、`124:2` 统一切换为 `Noto Sans SC`，文本节点设置 `WIDTH_AND_HEIGHT` 自适应。
- 三个图的 `chart-title` 分组提升到各自 SVG 根组最上层，保证标题不被底图或超大几何边界覆盖；Sankey 的节点标签、Office Reach 的批局名称和圆形弦图的阶段标签同步改善。
- P03 的 `113:2`、`115:2`、`117:2` 已做截图审查，当前没有同等级别的叠字缺陷，因此不做无必要的全面重排。

## 38. 2026-10-14｜`layout:` P03 时间区实际替换为 archival time-ribbon

- 上一轮只完成 P01/P02 的文字层修正，P03 的备选时间带并未进入画布；本轮补齐这一缺口：将 `charts/svg/panel-03-time-ribbon-v1.svg` 上传并放入 Figma `03_A0 Triptych` 的 `SLOT_P03_TIME`。
- 当前显示节点为 `P03_Time_Ribbon_EDITABLE_v1`（Figma `184:2`，`2850×760`）；旧 `P03_Annual_Confidence_EDITABLE_WIDE_v1`（`113:2`）已改名并隐藏归档，避免两种统计读法叠在一起。
- 纸带厚度只表达公开摘要中的年度记录量；灰蓝/灰褐只表达日期直读与推断/待核；下方细线使用独立 0–100% 坐标表达直读日期比例。缺失年份保持断开，1694 年孤立记录不压入主轴。
- 截图走查：P03 顶部时间区已从“两个并排小图”变为单条横向档案带，标题、单位、图例、来源与缺失值说明仍保留在可编辑 SVG 分组内。

## 39. 2026-10-14｜`chart:` P01 Origin Atlas v2，细化透明度与纸上渐变

- 用户指出 P01 地图仍有“线条透明度过于单一、视觉不够精致”的问题。本轮新增 `generate-panel-01-origin-atlas-v2-svg.mjs`，沿用同一公开摘要字段和 TopoJSON 底图，只升级绘制层。
- v2 的灰蓝全库流使用 `routeSlate` 渐变与连续透明度；Top-10 重点流使用 `routeFocus`；砖红叙事样本使用 `routeSample`。渐变只服务于纸张印刷中的轻微深浅变化，不增加任何数据维度。
- 来源节点增加纸色外环、虚线定位环和内层圆；收批端点增加纸色护圈，避免相邻点糊成一团。Figma 节点 `202:2` 已替换显示，`174:2` 隐藏归档。
- 89 个导入文本节点统一切换为 `Noto Sans SC` 并设为 `WIDTH_AND_HEIGHT`；`title-block` 提升到最上层，避免底图边界覆盖标题。

## 40. 2026-10-14｜`asset:` P01 档案拼贴层扩充

- 新增四项透明 PNG：`qiaopi-blue-gray-wash-v2.png`、`qiaopi-port-contact-sheet-v1.png`、`qiaopi-seal-postmark-cluster-v2.png`、`qiaopi-archive-registration-tabs-v1.png`。
- 这些图像只表达纸张、照片、印泥和登记物件的质感，不生成地图、标题、数字、县名或统计图；已复制到 `charts/png/` 并上传到 Figma `04_PNG Assets`。
- P01 新增低透明度 collage strip（Figma `218:2`–`218:5`），置于地图与矩阵/熵图之间，形成“SVG 数据层 → 档案物件层 → 证据图层”的过渡；不会遮挡轴、图例或来源脚注。
- 同一张 v2 地图已归档到 `02_SVG Chart Library`（Figma `219:2`），作为 `2400×1540` 编辑母版；P01 画布使用 `202:2` 槽位实例。

## 41. 2026-10-14｜`asset:` P03 纹样—纸片—人物创意拼贴

- 参考用户提供的创意海报，将 P03 的装饰拆成四类透明 PNG：`qiaopi-p03-geometric-pattern-overlay-v1.png`、`qiaopi-p03-floating-letter-slips-v1.png`、`qiaopi-p03-camellia-branch-cutout-v1.png`、`qiaopi-p03-figures-on-letter-sheets-v1.png`。这些素材均带真实 alpha 通道，且没有中文标题、数字、地图、邮戳文字或可识别人物身份。
- 四项已上传 `04_PNG Assets`，源节点分别为 `222:2`–`222:5`；在 `A0_03_彼岸_抵达` 中以独立拼贴层落地为 `223:2`–`223:5`，保持可移动、可缩放、可隐藏。
- 视觉语法：几何纹样只作右缘暗纹；漂浮信纸把“具体家书”从空白卡片变成有深度的纸面；红色花枝把统计证据带引向写信人；人物—纸片组合提供一个微型的“等待/阅读”叙事尺度。PNG 只负责气氛和叙事，不编码任何统计字段。
- 首次截图检查发现花枝过度侵入证据带，已收缩到 `660×540`、不透明度 58%，移动至 `x=2320,y=2820`；漂浮信纸降至 56%，保证左侧字段和右侧写信人物仍可读。
- Figma 仍需人工完成：最终裁切与 A0 出血、花枝和人物的局部遮罩、字体/行距微调，以及在打印尺寸下复核透明 PNG 的纸色叠加。

## 42. 2026-10-14｜`layout:` P03 版式层级与证据—家书节奏优化

- 修复 `P03_SECTION_DIVIDER`（`140:35`）与 `P03_SECTION_NOTE`（`140:36`）原先垂直距离过近造成的叠压：分隔标题移至 `y=1490`、34 px 砖红；说明移至 `y=1540`、15 px 灰蓝；规则线落在 `y=1578`。
- 新增 `P03_SECTION_MARKER`（Figma `229:2`），8×112 px 的砖红档案标记，与章节标题左边缘对齐，给“时间—日期—关系证据”建立一个明确的入口。
- 日历与关系图整体下移至 `y=1610`，证据带下移至 `y=2690`，过渡提示至 `y=2844`，家书区至 `y=2870`；四个 PNG 拼贴层同步平移，保留原有视觉关系。
- P03 现在形成更清楚的纵向阅读节奏：`时间带 → 证据分隔 → 年月热力/关系覆盖 → 三张证据卡 → 一封具体家书`。截图复核通过，未遮挡 SVG 标题、坐标轴、脚注或写信人物。

## 43. 2026-10-14｜`review:` 三张 A0 可见文字层统一与乱码清理

- 用户走查指出多处中文出现窄框截断、字形堆叠或类似乱码。本轮对 `A0_01_此岸_起信`（`84:10`）、`A0_02_中途_经批局`（`84:11`）、`A0_03_彼岸_抵达`（`84:12`）逐层检查可见 TEXT 节点。
- 三张海报共 647 个可见文字节点全部统一为 `Noto Sans SC`（Bold/Regular），并设置 `textAutoResize = WIDTH_AND_HEIGHT`；不改标题内容、数据数值、字段口径或 SVG 几何。
- 重点修复 P03 日历热力、寄批人—收批县关系图和时间带中的标题/注释窄框；P01 的来源矩阵、熵图与来源结构栏同步清理；P02 的 Sankey、Office Reach 和圆形弦图同步清理。
- Figma 截图复核结果：三个 A0 frame 的可见 TEXT 节点字体族均为 `Noto Sans SC`，残留 Inter 数量为 0。仍需人工在 100% 实寸下检查最小刻度和脚注的印刷可读度。


