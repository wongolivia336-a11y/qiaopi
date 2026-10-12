# 侨批可视化模型交接模板 v1

这份文档用于把侨批项目拆成四种可复用的工作角色：Astra、Luna、ImageGen、人工 Figma。每次交接都必须复制对应的 Brief，填写路径、commit 和验收结果，再把产物与评审记录提交到 GitHub。任何角色都不能用“看起来合理”替代数据来源或验收条件。

## 0. 统一交接包

每个任务建立一个独立的任务目录或 GitHub issue，推荐编号：

```text
handoff/2026-10-12-P01-hero-map/
├── brief.md
├── input-manifest.json
├── output-manifest.json
└── review.md
```

每次交接先复制并填写以下元数据：

```yaml
task_id: "2026-10-12-P01-hero-map"
project: "qiaopi"
role: "ASTRA | LUNA | IMAGEGEN | FIGMA"
upstream_commit: "<commit sha>"
source_of_truth:
  logical_name: "<workbook or approved summary>"
  local_path: "<local-only path if the raw file must not be published>"
  published_path: "<repository path, if approved>"
  fields: ["<field names only; no private row values>"]
privacy: "public | approved-summary-only | local-only"
requested_output: ["<file paths>"]
reviewer: "<name or role>"
status: "draft | review | approved | blocked"
```

通用交接规则：

- 上游没有 commit、数据源、字段、口径或许可说明时，下一角色必须退回，不得自行猜测。
- 原始 Excel 与包含身份信息的摘要默认 `local-only`；公开上传必须有明确授权记录。
- 任何 derived 指标必须写公式、分母、过滤条件和缺失值处理。
- 任何 illustrative / generated 素材不得进入 quantitative 图层。
- 每个产物都要有相对仓库路径，不能只发聊天窗口中的附件。

---

## 1. Astra：叙事与数据事实审校

### 适用任务

在生成图表前，锁定三张海报的核心问题、数据事实、证据层级和删减清单；在最终提交前，检查作品有没有把显性历史知识误写成数据发现。

### 输入

```text
必须提供：
- 数据字典或 data contract；
- 当前三张海报草图/HTML 截图；
- 已生成图表清单和每张图的 claim；
- 原始数据的逻辑来源、记录粒度、缺失值规则；
- 当前项目目标：A0 三张横向连续海报，叙事为“此岸｜起信 → 中途｜经批局 → 彼岸｜抵达”。

可选提供：
- 代表性家书的 record ID 或经授权的文本片段；
- Figma 页面截图；
- 前一轮评审意见。
```

### 可复制 Prompt

```text
你是侨批数据可视化项目的研究与叙事审校人。请只根据我提供的 data contract、字段口径和图表草案工作，不补写未提供的历史事实。

项目目标：三张 A0 横向连续海报，顺序是：
01 此岸｜起信：来源地与收批县的空间关系；
02 中途｜经批局：来源地—批局—收批县的中介网络；
03 彼岸｜抵达：时间、季节、日期可信度、关系延续和一个有 record ID 的微观证据。

请输出：
1. 每张海报一个核心问题和一句可证据化的 claim；
2. 每个 claim 对应的字段、聚合方法、图表类型和编码；
3. 哪些图表保留、合并或删除，并解释删除理由；
4. 观察到的事实、派生推论、不能推出的结论三栏；
5. “砖红色代表性路线”与“灰蓝色全量路线”的叙事边界；
6. 需要 Luna 补算的数据表和需要人工核验的字段；
7. 风险清单：伪相关、口径混用、档案空窗误读、敏感数据暴露、图表不可读。

禁止：制造数量、地点、人名、日期、引用或因果关系；把单个故事推广为总体结论；用审美偏好替代统计依据。
```

### 输出契约

```text
handoff/<task_id>/astra-decision.md
handoff/<task_id>/astra-chart-inventory.yml
handoff/<task_id>/astra-risk-log.md
```

每个 chart inventory 条目至少包含：`chart_id`、`panel`、`claim`、`source_fields`、`aggregation`、`encodings`、`unit`、`uncertainty`、`keep_or_drop`。

### 验收条件

- 三张海报各自只有一个主问题，且问题可以由数据回答。
- 每张主图至少揭示一个非显性关系，而不是把历史常识画成装饰图。
- 每个结论都能追溯到字段和聚合方法；“不能推出的结论”明确写出。
- 叙事路线被标注为代表性样本，不冒充总流量。
- 已列出所有需 Luna 计算的中间表，以及所有需人工查档的内容。

不满足时：状态设为 `blocked`，退回数据契约或删减图表，不进入生产阶段。

---

## 2. Luna：数据整理与 SVG 生产

### 适用任务

把批准的 chart inventory 变成可复算的派生表、可编辑 SVG、图例、坐标轴、来源注释和产物清单。

### 输入

```text
必须提供：
- Astra 已批准的 chart inventory；
- 数据字典和数据 contract；
- 原始 workbook 或用户批准的摘要脚本；
- 坐标/地图来源说明；
- 统一视觉 token：纸色、墨色、灰蓝、砖红、线宽和字体策略。
```

### 可复制 Prompt

```text
你是数据生产与 SVG 制图工程师。请将批准的 chart inventory 实现为可复算的数据层，不自行改变 claim。

对每一张图执行：
1. 读取已批准字段，记录行粒度、过滤、去重、Top-N 和缺失值处理；
2. 输出派生表（CSV/JSON）和一份 data dictionary；
3. 输出可编辑 SVG：title、subtitle、plot、axes、legend、source-note 分组命名；
4. 为所有尺度、线宽、面积、颜色和位置写出明确单位或语义；
5. 在 SVG 旁生成 chart manifest，记录输入 commit、字段、公式和导出时间；
6. 对照原始/摘要数据做总数、分组数和极值核对。

本项目的三个主图口径：
- P01 map：真实来源地→收批县路径；线宽与记录量单调相关，推荐 sqrt(record_count)；
- P02 threads：来源地→批局→收批县，不能用虚构的物流线路；
- P03 time：年度数量、月份热力、直接/推断日期区分、关系时间线；档案空窗不等于通信中断。

禁止：在 SVG 中硬编码示例数字；让 AI 生成地图、坐标轴、中文标签或图例；删除无法解释的异常值而不留记录；把 illustrative 资产混进数据层。
```

### 输出契约

```text
charts/<chart_id>/<chart_id>.svg
charts/<chart_id>/<chart_id>.csv
charts/<chart_id>/<chart_id>.json
charts/<chart_id>/<chart_id>.contract.yml
charts/<chart_id>/<chart_id>.qa.md
```

`qa.md` 至少写：输入记录数、输出记录数、关键分组总和、缺失值计数、最大/最小值、抽样核验记录和已知限制。

### 验收条件

- 在空白 Figma 文件中导入 SVG 后，文字、轴、图例和图形仍可编辑。
- 数字与派生表一致；合计、分组和比例在声明的舍入误差内一致。
- 每张图有标题、单位、图例、尺度/坐标和来源说明。
- 用相对路径即可重新找到 SVG、派生表和 contract。
- 任何推断日期、未知坐标和空档都没有被渲染成确定事实。

不满足时：不得进入 Figma 组装；先修正 contract、数据表或 SVG 层。

---

## 3. ImageGen：透明 PNG 素材生产

### 适用任务

生成非定量、可拆分、带透明背景的信封、印泥、纸张、木棉花、港口/骑楼氛围和物件素材，用于 Figma 的证据层或叙事层。

### 输入

```text
必须提供：
- asset brief：subject、构图、裁切、透明背景、色调、尺寸和用途；
- 是否为真实档案转绘、公开素材处理还是纯氛围生成；
- 不得改变的真实内容（若有）；
- 参考图的来源/版权说明；
- 禁止出现的文字、数字、印章、路线和人物身份。
```

### 可复制 Prompt

```text
你是侨批视觉资产制作人。请生成一个单独、可复用的透明 PNG 资产，不要生成整张海报，不要生成数据图表。

资产 brief：
- subject: <一个物件或一个局部场景>
- intended_use: <地图角落/信封证据/中途批局/抵达微观故事>
- palette: paper #E9E1D2, ink #27231F, slate #718083, vermilion #9E4435, dust #B9A58F
- material: restrained archival paper, imperfect hand-cut edge, subtle print grain
- composition: one main object, transparent background, enough negative space for cropping
- output: PNG with alpha, no border unless specified, no baked-in title or legend

绝对禁止：可读中文、邮票号码、日期、真实人名、虚构批局名称、坐标、图表轴、路线、伪造档案印章、发光渐变、3D glossy、过度对称。
```

### 输出契约

```text
assets/png/<asset_id>.png
assets/png/<asset_id>.brief.md
assets/png/<asset_id>.manifest.yml
```

manifest 至少包含：`asset_id`、`subject`、`source_or_model`、`prompt_version`、`rights_or_status`、`intended_use`、`alpha_checked`、`color_treatment`。

### 验收条件

- 文件有透明通道，主体边缘可用于抠图和缩放。
- 一个文件只承担一个物件或一个局部叙事，不是信息拼贴整页。
- 没有可读的虚构文字、数据、印章或史实暗示。
- 色调与统一 palette 一致，但不会把图表染成装饰素材。
- 已标明 generated / archival / edited 三种来源状态。

不满足时：返工资产，不允许用 Figma 的遮罩把错误文字“藏起来”。

---

## 4. 人工 Figma：版式组装与最后判断

### 适用任务

把批准的 SVG、PNG、文字和来源注释组装为三张可读、可编辑、可打印的 A0 连续海报；人工负责审美判断、取舍和最终事实确认。

### 输入

```text
必须提供：
- Astra 的 panel decision 和 chart inventory；
- Luna 的 SVG、派生表、contract、QA；
- ImageGen 的 PNG、manifest 和版权/来源说明；
- 统一 palette、字体、网格和 A0 尺寸；
- 已确认的标题、图例、微观家书片段与 record ID。
```

### 可复制 Brief

```text
请在 Figma 中完成 qiaopi 三张 A0 横向连续海报的人工组装，不重算数据，不改变已批准 claim。

页面：
00_Art Direction / 01_Data Contracts / 02_SVG Chart Library /
03_A0 Triptych / 04_PNG Archive Assets / 99_References

顺序：
P01 此岸｜起信：地图为主；
P02 中途｜经批局：来源地—批局—收批县网络为主；
P03 彼岸｜抵达：时间与微观证据为主。

执行要求：
1. 先放网格、标题、主图和证据图，再放 PNG；
2. 保留 SVG 的坐标、图例、单位和 source note；
3. 让砖红色代表性路线贯穿三张，但标注它不是全量；
4. 用 PNG 做档案证据/叙事标点，不能遮盖图表结构；
5. 删除无法解释的装饰图和重复图；
6. 手工重写所有标题、标签、图例和注释，避免 AI 生成文字；
7. 检查 A0 打印距离下的最小字号、线宽、对比度和裁切安全区。
```

### 输出契约

```text
figma/page-map.md
exports/qiaopi-triptych-preview.png
exports/qiaopi-triptych-proof.pdf
figma/change-log.md
```

`page-map.md` 记录页面、frame、组件名和来源 chart_id；`change-log.md` 记录删除、改写、裁切、颜色和人工核验事项。

### 验收条件

- 三张海报可从左至右独立理解，也能组成一封信的完整轨迹。
- 每张只有一个视觉主角；宏观、批局中观、家书微观层级清楚。
- SVG 图表可编辑，PNG 与图表分层，文字不是生图烘焙进去的。
- 纸色/墨色/灰蓝/砖红系统一致，颜色不承担唯一分类信息。
- 全页与局部预览均可读；来源、单位、不确定性和代表性路线说明都存在。

不满足时：先在 Figma 修正层级和文字，不让模型重新生成整张海报。

---

## 5. 评审回传模板

每个角色完成后，用下面格式回传给上游和主负责人：

```markdown
# Review: <task_id>

role: <ASTRA | LUNA | IMAGEGEN | FIGMA>
upstream_commit: <sha>
output_commit: <sha>
status: approved | revise | blocked

## Completed
- <具体产物路径>

## Verified
- <哪一条验收条件已通过>

## Open risks
- <未解决问题；没有就写 none>

## Next handoff
- recipient: <角色>
- required_inputs: <文件或字段>
- acceptance: <下一步唯一最关键验收条件>
```

推荐 commit 信息：

```text
feat(qiaopi): add P01 hero map svg and contract
feat(qiaopi): add transparent archive asset manifest
docs(qiaopi): record Astra review and Figma page map
fix(qiaopi): correct axis unit and date-confidence legend
```

公开仓库只提交获授权的摘要、派生表、图表、素材 manifest 和决策文档；原始 Excel、未脱敏文本和未经授权的身份字段留在本地。

