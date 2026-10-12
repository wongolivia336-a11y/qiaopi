# Figma 页面准备清单 v1

目标文件：<https://www.figma.com/design/zDhIdPTO2Z8KuVzX2Qpdmy/侨批数据可视化>

| 页面 | 本轮准备内容 |
| --- | --- |
| `00_Art Direction` | 项目 custom 色板、禁用项、灰蓝统计/砖红叙事规则 |
| `01_Data Contracts` | 三图字段、单位、缺失值、`flows` 合计差 2 条、坐标来源待补 |
| `02_SVG Chart Library` | 导入三个 `panel-01-*.svg`，组件名分别为 `P01_HeroMap`、`P01_SourceCountyMatrix`、`P01_EntropyProfile` |
| `03_A0 Triptych` | 三张 A0 竖版 frame；已加入可隐藏的 `SLOT_*` 图表预留区与 `COLLAGE_*` PNG 拼贴层，尚未导入真实 SVG/中文标题 |
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

