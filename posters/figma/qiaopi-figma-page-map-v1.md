# Figma 页面准备清单 v1

目标文件：<https://www.figma.com/design/zDhIdPTO2Z8KuVzX2Qpdmy/侨批数据可视化>

| 页面 | 本轮准备内容 |
| --- | --- |
| `00_Art Direction` | 项目 custom 色板、禁用项、灰蓝统计/砖红叙事规则 |
| `01_Data Contracts` | 三图字段、单位、缺失值、`flows` 合计差 2 条、坐标来源待补 |
| `02_SVG Chart Library` | 导入三个 `panel-01-*.svg`，组件名分别为 `P01_HeroMap`、`P01_SourceCountyMatrix`、`P01_EntropyProfile` |
| `03_A0 Triptych` | 建立三张 A0 竖版 frame；本轮只放置第一张的图表占位，不做整页 AI 拼贴 |
| `04_PNG Assets` | 仅保留信封、印章、照片、港口、木棉花等局部素材与来源信息 |
| `99_References` | GitHub commit、摘要版本、坐标来源、档案图像授权与参考资料 |

## 人工 Figma 处理

1. 替换/锁定最终中文字体，并逐项检查 SVG 文本没有转曲或丢字。
2. 将三个 SVG 作为可编辑对象导入 `02_SVG Chart Library`，不要 flatten；核对命名分组仍可选择。
3. 在 `03_A0 Triptych` 建立 841 × 1189 mm 的三张竖版 frame，统一外边距、12 栏网格和 8 px 基线节奏。
4. 为地图潮汕端点做一次光学避让；不得改变数据坐标，只移动标签和引线。
5. 在 A0 实寸与缩略总览两种尺度检查脚注、图例、最细灰蓝线和矩阵最小圆。
6. 手工补入坐标字典的来源/版本；在 2 条 `flows` 差额被核清前保留限制说明。

