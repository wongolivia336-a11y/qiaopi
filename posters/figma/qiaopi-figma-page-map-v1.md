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
| P01 / `SLOT_P01_MATRIX` | `112:2` | `panel-01-source-county-matrix-v1.svg` | 已放入槽位，隐藏占位标签 |
| P01 / `SLOT_P01_ENTROPY` | `114:2` | `panel-01-entropy-profile-compact-v1.svg` | 820×1050 窄槽专用版，替换原拥挤熵图 |
| P02 / `SLOT_P02_NETWORK` | `109:522` | `panel-02-threads-sankey-v1.svg` | 轻色 Sankey，砖红只标叙事样本 |
| P02 / `SLOT_P02_FLOW` | `110:2` | `panel-02-office-reach-v1.svg` | 左记录量、右县域覆盖类别数的双指标图 |
| P03 / `SLOT_P03_TIME` | `113:2` | `panel-03-annual-confidence-wide-v1.svg` | 横向双面板：年度堆叠柱 + 日期可信度双线 |
| P03 / `SLOT_P03_CALENDAR` | `115:2` | `panel-03-calendar-heat-v1.svg` | 年×月热力矩阵；缺失组合保留 NA |
| P03 / `SLOT_P03_LINEAGE` | `117:2` | `panel-03-lineage-compact-v1.svg` | 窄栏版寄批人—收批县覆盖区间 |

Figma 仍保留旧 SVG 节点并隐藏，便于回溯；所有新节点均为导入 SVG 的可编辑向量树，不是整页截图。


