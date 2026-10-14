# Figma 页面准备清单 v1

目标文件：<https://www.figma.com/design/zDhIdPTO2Z8KuVzX2Qpdmy/侨批数据可视化>

| 页面 | 本轮准备内容 |
| --- | --- |
| `00_Art Direction` | 项目 custom 色板、禁用项、灰蓝统计/砖红叙事规则 |
| `01_Data Contracts` | 三图字段、单位、缺失值、`flows` 合计差 2 条、坐标来源待补 |
| `02_SVG Chart Library` | 导入三个 `panel-01-*.svg`，组件名分别为 `P01_HeroMap`、`P01_SourceCountyMatrix`、`P01_EntropyProfile` |
| `03_A0 Triptych` | 三张 A0 竖版 frame；P01/P02/P03 已分别放入真实可编辑 SVG，标题仍由人工 Figma 处理 |
| `04_PNG Assets` | 仅保留信封、印章、照片、港口、木棉花等局部素材与来源信息 |
| `99_References` | GitHub commit、摘要版本、坐标来源、档案图像授权与参考资料 |

## 人工 Figma 处理

1. 替换/锁定最终中文字体，并逐项检查 SVG 文本没有转曲或丢字。
2. 将三个 SVG 作为可编辑对象导入 `02_SVG Chart Library`，不要 flatten；核对命名分组仍可选择。
3. 在 `03_A0 Triptych` 建立 841 × 1189 mm 的三张竖版 frame，统一外边距、12 栏网格和 8 px 基线节奏。
4. 为地图潮汕端点做一次光学避让；不得改变数据坐标，只移动标签和引线。
5. 在 A0 实寸与缩略总览两种尺度检查脚注、图例、最细灰蓝线和矩阵最小圆。
6. 手工补入坐标字典的来源/版本；在 2 条 `flows` 差额被核清前保留限制说明。

## 2026-10-12｜拼贴占位 v1

三张 A0 frame 均已完成第一轮“物件先行、图表留白”的构图占位。素材通过共享图像哈希重建为当前页面的独立图层，避免跨页面复制导致图片不可见；每一件都可以单独移动、缩放、隐藏或替换。

| 海报 | Frame ID | 图表预留 | 拼贴内容 |
| --- | --- | --- | --- |
| 此岸｜起信 | `84:10` | `SLOT_P01_HEADER`、`SLOT_P01_MAP`、`SLOT_P01_MATRIX`、`SLOT_P01_ENTROPY` | 灰蓝底纹、信封、印泥、木棉、撕纸边 |
| 中途｜经批局 | `84:11` | `SLOT_P02_HEADER`、`SLOT_P02_OFFICE`、`SLOT_P02_NETWORK`、`SLOT_P02_FLOW`、`SLOT_P02_NOTES` | 相片框、批局门面、邮袋木箱、账页、邮戳环 |
| 彼岸｜抵达 | `84:12` | `SLOT_P03_HEADER`、`SLOT_P03_TIME`、`SLOT_P03_CALENDAR`、`SLOT_P03_LINEAGE`、`SLOT_P03_LETTER` | 账页、窗格、写信人、桌面书信、信封、撕纸边 |

### 本轮处理边界

- `SLOT_*` 是构图辅助框，后续放入真实 SVG 后可以删除或隐藏，不是最终图表。
- `COLLAGE_*` 是生成式氛围素材，不承载地名、日期、数量、人物身份或路线事实。
- 目前保留较大留白，下一步先导入 SVG，再根据图表真实密度微调物件大小，不让装饰抢占数据阅读空间。

### 地图层补充

参考图中的大幅东南亚地图已用真实数据 SVG 导入 P01：

- 节点：`SVG_P01_map-route-v1_EDITABLE`（Figma node `98:2`）
- 来源：`charts/svg/panel-01-map-route-v1.svg`
- 放置：`A0_01_此岸_起信` 的 `SLOT_P01_MAP` 区域，当前尺寸约 `2050 × 1345`
- 处理：保留底图、经纬轴、灰蓝真实流向和砖红叙事样本线；后续可在 Figma 中继续缩放、隐藏图层或替换字体。

参考图里其他小型国别/县域剪影暂不做成 PNG；应从真实地理数据生成独立 SVG，避免产生无法核对的假地图。

### 2026-10-13｜真实 SVG 槽位更新

| 海报 / 槽位 | 当前节点 | 文件 | 处理 |
| --- | --- | --- | --- |
| P01 / `SLOT_P01_MAP` | `109:2` | `panel-01-map-route-v1.svg` | 旧版本隐藏；聚焦南洋—潮汕主航域并保留县域局部展开 |
| P01 / 右侧来源结构栏 | `141:2` | `panel-01-source-profile-v1.svg` | 7 个已知来源地的真实记录量排序；泰国/新加坡为主，未知来源另列 |
| P01 / `SLOT_P01_MATRIX` | `112:2` | `panel-01-source-county-matrix-v1.svg` | 已放入槽位，隐藏占位标签 |
| P01 / `SLOT_P01_ENTROPY` | `114:2` | `panel-01-entropy-profile-compact-v1.svg` | 820×1050 窄槽专用版，替换原拥挤熵图 |
| P01 / `SLOT_P01_MAP` 当前主图 | `202:2` | `panel-01-origin-atlas-v2.svg` | 细腻灰蓝/砖红渐变、纸色节点外环、透明度分层；旧 `174:2` 归档 |
| P02 / `SLOT_P02_NETWORK` | `121:2` | `panel-02-threads-sankey-v2.svg` | 分层 Sankey：真实细流 + Top-16 主流 + 叙事样本局部放大 |
| P02 / `SLOT_P02_FLOW` | `110:2` + `125:2` | `panel-02-office-reach-v1.svg` + `panel-02-circular-chord-v1.svg` | 右侧双指标图；左侧紧凑圆形弦图替代视图 |
| P03 / `SLOT_P03_TIME` | `184:2` | `panel-03-time-ribbon-v1.svg` | 纸带厚度＝年度记录量；细线＝直读日期比例；保留摘要空段与无年记录说明 |
| P03 / `SLOT_P03_TIME` 旧版归档 | `113:2` | `panel-03-annual-confidence-wide-v1.svg` | 已隐藏保留；用于回滚，不与当前纸带叙事同时展示 |
| `02_SVG Chart Library` / P03 时间带 | `192:2` | `panel-03-time-ribbon-v1.svg` | 原尺寸 `2100×1200` 编辑母版；与 P03 槽位实例分开保留 |
| P03 / `SLOT_P03_CALENDAR` | `115:2` | `panel-03-calendar-heat-v1.svg` | 年×月热力矩阵；缺失组合保留 NA；本轮统一 `Noto Sans SC` 并修复中文窄框换行 |
| P03 / `SLOT_P03_LINEAGE` | `117:2` | `panel-03-lineage-compact-v1.svg` | 窄栏版寄批人—收批县覆盖区间 |

Figma 仍保留旧 SVG 节点并隐藏，便于回溯；所有新节点均为导入 SVG 的可编辑向量树，不是整页截图。

`panel-03-time-ribbon-v1.svg` 已导入 Figma P03 `SLOT_P03_TIME`，节点为 `184:2`；旧版 `annual-confidence-wide` 节点 `113:2` 已隐藏归档。两种读法不再同屏，避免把纸带叙事与双面板统计误读为同一图。

### 2026-10-14｜P03 时间叙事替换

- 将 P03 顶部时间区从横向双面板替换为 `P03_Time_Ribbon_EDITABLE_v1`（Figma `184:2`，`2850×760`）。纸带高度表达年度记录量，灰蓝/灰褐分层表达日期直读与推断/待核，底部细线表达直读比例。
- 旧节点 `113:2` 改名为 `P03_Annual_Confidence_EDITABLE_WIDE_v1_ARCHIVED` 并隐藏，保留可回滚性。
- 该替换让 P03 由“两个并排小图”转为一条横向档案时间带，减少 demo 感，并与日历热力矩阵、关系覆盖区间形成“年度—月份—关系”的连续阅读路径。

### 2026-10-14｜P03 中段排版收紧与连接性素材补充

- `SLOT_P03_CALENDAR` 仍保留原数据图节点 `115:2`，但放大为 `1840×1040`；`SLOT_P03_LINEAGE` 调整为 `840×1040`，关系图放大为 `820×1040`，两者共享 `y=1600` 的证据带。
- 日历 SVG 导入后的中文字体由 Inter 改为 `Noto Sans SC`；标题、注释和月份汇总不再使用固定窄文本框，避免“空白”换行压到 A/B 标题上。
- 家书证据槽位 `95:31` 上移至 `y=2860`；右下窗格、写信人和桌面书信仍为独立素材层，不与图表合并。
- 新增候选 PNG：`qiaopi-archive-slip-cluster-v1.png`、`qiaopi-ledger-tab-bundle-v1.png`。它们先进入仓库和资产清单，待 Figma 上传端 TLS 恢复后放入 `04_PNG Assets`，再以低不透明度连接日历/关系图与家书区。

### 2026-10-14｜P03 证据带与家书区之间的编辑化连接层

- 新增 `P03_EVIDENCE_RAIL`（Figma `156:2`），位置 `x=160,y=2680`，尺寸 `2860×140`。
- 证据带内含三个独立卡片：`P03_EVIDENCE_CARD_01`（无年记录 13,118 条）、`P03_EVIDENCE_CARD_02`（关系组合 30 组）、`P03_EVIDENCE_CARD_03`（家书样本待授权）。
- 卡片只承载真实口径和待授权字段，不放生成式家书内容；它们用于填补中段留白并把“统计证据”过渡到“单封家书”，不替代任何图表。

### 2026-10-14｜P03 底部档案目录条

- 新增 `P03_CATALOG_FOOTER`（Figma `158:2`），位置 `x=160,y=4270`，尺寸 `2860×96`。
- 目录条包含 `summary-v3.js`、50,064 条记录、缺失日期不压入时间轴、家书字段待授权和 `A0 / 2026.10` 版本标记。
- 该层是可编辑文本和轻量纸色卡片，不是新增图表；底部撕纸 PNG 仍保持在其后方，便于人工调整透明度和出血。

### 2026-10-14｜P03 证据到家书的阅读提示

- 新增 `P03_SAMPLE_TRANSITION_CUE`（Figma `159:2`），位置 `x=160,y=2834`，尺寸 `1600×26`。
- 该层只覆盖家书左栏上方，用细线、砖红圆点和两段可编辑文字提示“统计证据 → 授权家书样本”；不延伸到右侧写信人拼贴。

### 2026-10-14｜P01 地图读法卡

- 新增 `P01_MAP_READING_CARD`（Figma `160:2`），位置 `x=160,y=2140`，尺寸 `2050×360`。
- 卡片位于 `P01_Map_Route_EDITABLE_v3_LIGHT` 下方，不缩放或重绘地图；以三栏结构重新说明来源统计、叙事样本线和潮汕端点局部展开。
- 使用纸色半透明底与灰蓝/砖红/灰褐三种小面积标记，避免地图下方空白变成无意义装饰，同时保留原始 SVG 可编辑性。

### 2026-10-14｜P01 Hero Map SVG 替换

- 新增并上传 `charts/svg/panel-01-map-route-hero-v1.svg`，Figma 节点 `163:2`，已嵌入 `A0_01_此岸_起信`。
- 新节点尺寸 `2050×1360`，放置于 `x=160,y=680`；旧地图 `109:2` 与旧地图槽位 `95:5` 隐藏保留，便于回溯。
- Hero SVG 内含 `hero-map`、`all-routes`、`focus-routes`、`sample-route`、`source-nodes`、`chaoshan-inset`、`audit-cards`、`source-and-notes` 等独立可编辑分组。
- 视觉重点从“局部地图截图”升级为“档案制图板”：来源节点外环、主流/细流层、潮汕局部展开、叙事样本卡和缺失值审计共同构成密度，不用虚构红线或装饰性网络。

### 2026-10-14｜P01 Origin Atlas 主地图候选

- 新增并上传 `charts/svg/panel-01-origin-atlas-v1.svg`，Figma 最终验收节点 `174:2`，已嵌入 `A0_01_此岸_起信`（`84:10`）。节点尺寸 `2050×1314.17`，放置于 `x=160,y=680`。
- Origin Atlas 由左侧地理场、右侧七张来源记录卡、底部收批端点场组成；它解决原先海外出发点重叠且地图被压缩的问题，同时保留一个真实地图层作为空间锚点。
- 来源卡圆点完整单位约 `1,000 条`，残点表示不足 `1,000 条` 的余量；右侧文字显示真实来源总量和主收批地。底部 Top-10 收批地横向排列只承担标签避让，不表示新的经纬度。
- 导入后新增 `legend` 分组，图例明确灰蓝真实聚合流、砖红叙事样本、来源圆点单位和收批地圆面积；来源卡点阵已移至右侧，89 个文本节点统一为 `Noto Sans SC` 并设为自适应宽高；旧 Origin Atlas `166:2`、`169:2`、Hero Map `163:2` 与更早地图节点均隐藏保留。
- GitHub 对应文件：`charts/scripts/generate-panel-01-origin-atlas-svg.mjs`、`charts/svg/panel-01-origin-atlas-v1.svg`、`data/derived/panel-01-origin-atlas-derived-v1.json`。Figma 当前显示的是最终带图例与字体修正版 `174:2`。

### 2026-10-14｜P01 Origin Atlas v2 与 PNG 拼贴层

- 新增 `charts/scripts/generate-panel-01-origin-atlas-v2-svg.mjs`、`charts/svg/panel-01-origin-atlas-v2.svg` 与 `data/derived/panel-01-origin-atlas-derived-v2.json`。
- v2 只在地图视觉层引入克制的 `seaWash`、`landWash`、`routeSlate`、`routeFocus`、`routeSample` 渐变；真实字段、坐标、流量和缺失值口径不变。
- 全库细流改为更连续的灰蓝透明度层；Top-10 重点流加纸色外环和圆角线帽；叙事样本保持砖红但采用轻微深浅过渡，避免一整片死红/死灰。
- Figma 当前显示节点为 `202:2`，字体已统一为 `Noto Sans SC`，标题层提升至顶层；旧 `174:2` 和临时重复节点隐藏归档。
- P01 下方新增拼贴带：灰蓝水洗底纹、港口/批局照片接触片、印泥/邮戳簇、空白档案登记纸片（Figma `218:2`–`218:5`），位置在地图与证据图之间，不遮挡地图轴、图例或来源脚注。

### 2026-10-14｜P02 SVG 统一字体与标题层级

- P02 Sankey `121:2`、Office Reach `110:2`、圆形弦图 `124:2` 的导入文本统一改为 `Noto Sans SC`，并对文本节点设置 `WIDTH_AND_HEIGHT` 自适应。
- 三个图的 `chart-title` 分组均提升到各自 SVG 组的最上层，修复中文标题窄框换行、叠字和被底图边界遮挡的问题。
- P03 `113:2`、`115:2`、`117:2` 已截图走查；年度、日历、关系图的标题和脚注当前没有同等级别的叠字问题，保留现状以避免不必要的版式漂移。

### P02 圆形网络替代视图

- SVG Library：`124:2`，完整 `1900 × 1500` 版本。
- P02 lower flow slot：`125:2`，`680 × 537` 紧凑预览，与 `110:2` office-reach 并列。
- 圆周分段为来源国、批局、收批县；圆周位置不代表地图方向，弦线宽度和透明度才表达记录量层级。

### 三页字体与占位清理

- 三个 A0 header 已替换为 `Noto Sans SC` 可编辑文本：章节编号、主标题、副标题、数据口径微注记和横向规则线。
- 旧的 `TITLE / 章节信息`、`SVG FLOW DETAIL`、`CAPTION / SOURCE NOTES`、`LETTER / QUOTE` 仅作为构图占位，已隐藏或改写为中文读图/字段说明，不再作为最终版面文字。
- P03 的家书区现在是“待接入真实样本”的结构化卡片，保留 EID、日期、寄批人、收批县、日期可信度字段；没有授权前不填生成式家书文字。


