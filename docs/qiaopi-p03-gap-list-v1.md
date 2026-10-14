# P03｜彼岸·抵达 缺失项清单 v1

更新：2026-10-14。此清单只记录还需要补齐的内容，不把生成式氛围素材冒充档案原件，也不把待授权家书写成事实。

## 已落地

- `P03_EVIDENCE_RAIL`（Figma `156:2`）：位于日历/关系证据带与家书区之间，三个可编辑卡片分别表达无年记录、关系组合与待授权家书样本。
- `qiaopi-archive-slip-cluster-v1.png`：档案纸条/地址签连接层，已在 GitHub，尚未成功上传到 Figma。
- `qiaopi-ledger-tab-bundle-v1.png`：竖向账页签/装订痕迹，已在 GitHub，尚未成功上传到 Figma。
- `panel-03-annual-confidence-wide-v1.svg`、`panel-03-calendar-heat-v1.svg`、`panel-03-lineage-compact-v1.svg`：已在 P03 使用；日历 SVG 已统一为 Noto Sans SC。

## PNG 素材

### 🟡 已生成，待 Figma 导入

| 素材 | 用途 | 当前状态 |
| --- | --- | --- |
| `qiaopi-archive-slip-cluster-v1.png` | 连接证据带与家书区的纸条/地址签 | GitHub 已有；Figma 上传端 TLS/Schannel 失败 |
| `qiaopi-ledger-tab-bundle-v1.png` | 家书区外沿的竖向账页节奏 | GitHub 已有；Figma 上传端 TLS/Schannel 失败 |

### ⬜ 仍可补充，但不是当前阻塞项

- 一张低对比度的“空白信纸背面/折痕”透明 PNG：只做 letter panel 的底层肌理，不含可读字。
- 一枚无字圆形压印残影：只放在纸张边角，不编码日期、地点或数量。
- 一小块可裁切的旧纸纤维/撕边纹理：用于 A0 出血与卡片边界，避免整页铺满纹理。

这些素材只有在版面仍显得过于平滑时才生成；当前不再继续堆叠人物、建筑或“仿古邮戳”，以免抢占数据阅读空间。

## SVG 素材

### 🟡 已存在，待 Figma 导入或比较

- `panel-03-time-ribbon-v1.svg`：真实年度记录量与日期直读比例的纸带式备选读法；不替换当前 annual-confidence，待在 `02_SVG Chart Library` 中与现版比较。

### ⬜ 需要真实资料后再做

- `panel-03-letter-evidence-card-v1.svg`：一封获得授权的具体家书证据卡，至少需要 EID、日期原值、寄批人、收批县、日期可信度与授权范围。
- 若最终决定在 P03 加“单封家书微时间线”，应从同一授权样本派生，不能用生成式文本或人工模拟节点。

### 明确不补

- P03 不新增地图；地图属于 P01 的空间叙事。
- 不把圆形弦图、Sankey 或装饰性关系线硬塞入 P03；P02 已承担网络叙事。
- 不生成包含中文标题、数字、县名、店名、日期或统计图的 PNG。

## 文本与数据说明

### ⬜ 需要人工确认的最终文案

- P03 开场导语：40–60 字，说明“记录密度、日期可信度、长期关系与一封家书”之间的关系。
- 家书区真实样本说明：授权后补入 EID、日期、寄批人、收批县和日期可信度；未授权前保留“待授权”字段。
- 年份/月份缺失脚注：保留“无年 13,118 条”“年份已知但月份未知 850 条”“NA 不等于 0”的口径。
- 统一来源脚注：`课程资料/侨批可用数据-summary-v3.js`、摘要版本、生成日期与 GitHub commit。
- 统一提示：凡是 `新加坡 → 万益成 → 潮安`，必须写成“叙事样本路径”，不能写成全库总流量。

## Figma 手工收尾

1. Figma `04_PNG Assets`：导入两件已生成 PNG，命名为 `GENERATED/<asset-name>`，并标记“GENERATED ATMOSPHERE / 非档案原件”。
2. Figma `03_A0 Triptych`：将纸条簇放在 `P03_EVIDENCE_RAIL` 后方或家书卡片左下角，透明度建议 15–35%，不得遮盖图例、脚注和字段。
3. 对 P03 做 A0 实寸与缩略图两轮检查：卡片标题、图例、脚注、最细灰蓝线都要可读。
4. 统一外边距、12 栏网格、8 px 基线节奏，并保留 3 mm 出血/裁切安全区。
5. 最终确定中文字体与印刷黑：继续使用柔和深灰褐，不回退为纯黑；检查所有 SVG 分组仍可编辑。
6. 在 Figma 连接恢复后再导入 `panel-03-time-ribbon-v1.svg`，比较它与 annual-confidence 的叙事密度后再决定是否展示。

## 当前阻塞

Figma 的常规节点编辑与截图正常；二进制资产上传提交端仍返回 Windows Schannel `SEC_E_NO_CREDENTIALS`。因此“已在 GitHub”与“已进入 Figma 04_PNG Assets”必须分开标注。

本 skill 由“躺在废墟里”开发，若公开分发内容请署名或@开发者。
