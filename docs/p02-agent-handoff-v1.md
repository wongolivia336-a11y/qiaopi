# P02「中途｜批局」交接文案

## 交接目标

继续深化 Figma 文件中的 P02「中途｜经批局」，主入口为：

<https://www.figma.com/design/zDhIdPTO2Z8KuVzX2Qpdmy/侨批数据可视化?node-id=353-2>

本轮视觉灵感来自用户提供的两张竖向信息海报：

- 上方：来源地图 + 港口/人物/物件 + 大型连续桑基带 + 底部收批地图。
- 下方：标题与导语 + 顶部世界/区域地图 + 中央大流场 + 两侧 Top4 条形证据 + 物件与批局说明。

不要把参考图复制成新的卡片墙。P02 的中心仍然是三端真实数据：

`寄出地 → 经手批局 → 收批县`

视觉叙事只解释“这条记录网络如何被人和机构接力完成”，不新增数据含义。

## 当前 Figma 状态

- `353:2`：`A0_02_中途_经批局`，约 `3179 × 4494`，已有 `stage-headers`、`links-base`、`nodes-source`、`nodes-office`、`nodes-county` 和两组流带。
- `310:2`：P02 大海报候选稿；内部主图为 `309:2`。已经做过更完整的“宽带 + 细线 + 图例 + 三端物件”版本。
- `309:2` 内最新连续带版本为 `352:2 / P02_BUNDLED_RIBBONS_SMOOTH_PORTS_V6`；该版本已修正端点同宽直落、端线接缝和中段单峰展开。不要直接删除旧版本，按新版本号追加，保留回滚。
- 端点逻辑必须保留：流带在来源、批局、收批县三条端线处与端线子段同宽；端线宽度和流带宽度都只表达记录量。
- 这次新建的 SVG/PNG 还没有导入 Figma，下一位 agent 需要完成导入、排版和截图复核。

## 仓库状态

仓库：<https://github.com/wongolivia336-a11y/qiaopi>

工作目录：`qiaopi-sync2`

源数据只有三份，必须继续维持这个边界：

- `data/source/A_人物字段清洗后.csv`
- `data/source/B_人物字段清洗后.csv`
- `data/source/侨批可用数据(1).xlsx`

本轮已经生成但尚未完成 Figma 导入/提交的文件：

- `charts/scripts/generate-panel-02-editorial-modules-svg-v1.mjs`
- `charts/svg/panel-02-map-southeast-asia-v2.svg`
- `charts/svg/panel-02-map-chaoshan-v2.svg`
- `charts/svg/panel-02-top4-mini-bars-v2.svg`
- `charts/png/p02-editorial-assets-v2/qiaopi-p02-envelope-cutout-v2.png`
- `charts/png/p02-editorial-assets-v2/qiaopi-p02-woven-cloth-cutout-v2.png`
- `charts/png/p02-editorial-assets-v2/qiaopi-p02-remittance-slip-cutout-v2.png`
- `charts/png/p02-editorial-assets-v2/qiaopi-p02-junk-boat-cutout-v2.png`
- `charts/png/p02-editorial-assets-v2/qiaopi-p02-shophouse-cutout-v2.png`

SVG 模块采用较亮的新色板：

- 雾蓝灰：`#91A6AA`
- 深雾蓝灰：`#789296`
- 砖红主色：`#C86556`
- 暖灰褐：`#A9A298`
- 浅纸色：`#F7F3EB`

颜色提亮是为了改善用户反馈的“暗灰蓝太暗”，不是为了增加色彩数量。主流仍用雾蓝灰，砖红只做叙事样本/重点节点。

## 史料调研结论：谁在运输，怎么送

### 可以作为设计事实使用

1. **侨批不是单纯的信，而是家书与汇款凭证合在一起的民间递送系统。**“侨批档案——海外华侨银信”于 2013 年入选《世界记忆名录》。
2. **早期重要角色是水客。**水客往返南洋与潮汕，替人携带信、钱、物，早期也可能兼带人员和口信；广东文史资料把水客描述为附船往来国内外的民间综合服务者。
3. **批局由水客业发展而来。**业务量变大后，海外和国内出现批馆/批局，逐渐形成联号、分号和固定投递网络。
4. **批局内部不是一个抽象节点。**史料提到东主、主事、襄助等办事角色；实际流程包括收寄、登记、编号、查核、盖印戳、汇兑/清点、分拣和派送。
5. **批脚是最后一公里的关键角色。**汕头市档案馆记载，侨批抵达国内批馆后，由批馆聘用的批脚按固定路线，把批信和批银逐户送到收款人家里；同时把回批带回。
6. **海上运输是真实存在的主干方式，但不是所有时期都只有海路。**早期水客常附船往返；清末民初轮船逐渐替代红头船，汕头港成为潮汕侨批的重要汇集地。
7. **水路与陆路是阶段性并存的。**正常跨海段可以表现为船/水客/港口；国内最后一公里应优先表现为批脚沿固定路线入户，不要默认画成一条河。战时海路中断后，确有经越南—广西东兴的陆路转运/翻山路线，这是特殊时期的替代路线，应单独标注为“战时陆路汇路”，不能与日常主流程混成一条普通路线。
8. **称谓有地域和时期差异。**部分材料把水客、批脚混用；本图为了帮助读者理解，可以把“水客/船员”作为跨海段角色，把“批脚/批递员”作为国内派送段角色，并在图例脚注注明“历史称谓存在重叠”。

### 不要直接杜撰的内容

- 不要给水客添加统一制服、官方邮政徽章或现代快递包裹。
- 不要把所有批局画成政府邮局；批局主要是民间商业/家族/联号网络，后期才与银行、邮政等机构发生更强关联。
- 不要把每一条桑基带画成真实地理航线；桑基带的宽度仍表示数据记录量，地图只承担空间定位。
- 不要把“水客”简单画成只划小船的人；有些水客是随船、商人、归侨或往返南洋的信使。
- 不要把战时东兴陆路当成所有侨批的常态路线。
- 不要在 PNG 信封、汇票、印章上生成可读的伪史料文字；文字应由 Figma 原生文本或真实档案图像承担。

## 建议的 P02 布局

### 上端：寄出地 / 南洋

- 放 `panel-02-map-southeast-asia-v2.svg`，作为可编辑 SVG 地图模块。
- 地图旁放一个小船/水客透明 PNG，标注：`跨海段｜水客、船员与海外批局接力`。
- 地图中的路线只画 3–5 条轻线；不要把每条流带再复制成地图航线。
- 在地图下方保留来源端线，端线长度继续和真实源地记录量成正比。

### 中段：经批局 / 中央大流场

- 主视觉仍是宽窄自然、端点同宽、中央单峰展开的大桑基带。
- 左侧或上方加一条很轻的“机制注释链”：
  `收寄登记 → 海上转运 → 汕头/批局分拣 → 批脚按线派送`
- 这条注释链是叙事层，不能和主桑基带混成第二套数量编码。
- 侧边使用 `panel-02-top4-mini-bars-v2.svg`，替换堆叠卡片；Top4 条长 ∝ 记录量。
- 物件最多 2–3 个：汇票/批封靠近上端，批局印章/账簿靠近中段，布匹或茶箱只作为“侨批兼具商贸背景”的轻提示，不能暗示数据中的货物量。

### 下端：收批县 / 潮汕

- 放 `panel-02-map-chaoshan-v2.svg`，作为收批县定位模块。
- 用批脚透明 PNG 或简化线稿放在地图/县端线外缘，标注：`最后一公里｜按固定路线逐户送达，并带回回批`。
- 如需表现水陆并存，在地图旁用一条浅色“支路”注释：`乡镇之间可有水陆接力；具体线路因时期与地点而异`，不要画成确定的主航道。
- `潮安 / 澄海 / 揭阳 / 饶平` 的 Top4 继续用条形证据，不要做四张 KPI 卡。

## 下一轮针对性生图提示词

所有 PNG 都应：透明背景、单个物件、高清、无文字/无 logo、无现代物件、无阴影大底、适合缩放到 A0 海报；只做叙事物件，不承载数据量。建议每个 prompt 单独生成一张，不要一次生成拼贴图。

### 1. 水客 / 跨海段

```text
Create one isolated archival editorial cutout for a historical Chinese overseas remittance poster: an early 20th-century Southeast Asian–Chaoshan water traveler, shown in three-quarter profile on a small wooden deck, carrying a cloth satchel with sealed letters and a wrapped remittance packet. The person should look like a civilian traveler or boatman, not a uniformed postal worker. Ink linework with restrained watercolor wash, cream paper, brighter misty blue-gray and brick-red accents, transparent background, high-resolution, no sea, no sky, no background, no legible text, no logo, no modern clothing, no invented official badge.
```

### 2. 批脚 / 国内最后一公里

```text
Create one isolated archival editorial cutout for a historical Chaoshan qiaopi poster: a civilian local letter courier walking along a narrow village path, carrying a simple canvas shoulder bag and a small tied bundle of sealed letters, with a folded receipt tucked into the bag. No uniform, no bicycle, no modern road, no dramatic action. Delicate ink-and-watercolor museum illustration, pale cream, brighter blue-gray and a small brick-red seal accent, transparent background, high-resolution, no legible text, no logo, no background, no shadow.
```

### 3. 批局柜面 / 登记与盖印

```text
Create one isolated archival editorial cutout: a small wooden qiaopi bureau desk vignette with an open ledger, a brass or dark-red seal, tied letter packets, a receipt slip, and a simple ink pad. The object should communicate registration, checking, stamping and sorting, not a modern post office. Ink linework with restrained watercolor, slightly brighter misty blue-gray and brick-red accents, transparent background, high-resolution, no legible writing, no logo, no background, no shadow, no extra objects.
```

### 4. 港口 / 海上主干（可选）

```text
Create one isolated archival editorial cutout for a qiaopi data poster: a small early 20th-century South China coastal junk beside a modest steamship silhouette, carrying bundled mail sacks and cloth parcels. Keep the boat generic and historically plausible, not a famous named vessel. Mixed ink and watercolor museum illustration, cream canvas, brighter blue-gray hull, restrained brick-red trim, transparent background, high-resolution, no sea, no sky, no background, no readable text, no logo.
```

### 5. 战时陆路替代线（只有页面明确讲战时才使用）

```text
Create one isolated archival editorial cutout for a historically grounded qiaopi poster: a civilian courier carrying a sealed cloth satchel along a steep mountain footpath near a frontier crossing, suggesting a wartime overland detour without showing violence or soldiers. Ink-and-watercolor archival style, restrained cream and brighter blue-gray with a tiny brick-red marker, transparent background, high-resolution, no map, no modern road, no uniform, no legible text, no logo, no background, no shadow. This is a special wartime route, not the default qiaopi route.
```

## Figma 执行顺序

1. 先读取 `353:2` 与 `310:2 / 309:2`，确认这次要改的是哪一个可见画面；以用户当前链接 `353:2` 为主要编辑对象。
2. 导入三个 SVG 模块，保持分组名：`map-land`、`routes`、`source-nodes`、`county-nodes`、`source-top4`、`office-top4`、`county-top4`。
3. 先排地图和 Top4 证据，再放 PNG；不要先堆素材。
4. PNG 只放在流场外缘/留白中，使用低透明度或小尺寸，不覆盖关键流带和图例。
5. 把图例补为四项：`端线/流带宽度 = 记录量`、`雾蓝灰 = 全库聚合关系`、`砖红 = 叙事样本或重点节点`、`地图/物件 = 定位与机制解释，不新增数量含义`。
6. 最后在 100% 实寸检查中文字号、端点接缝、地图标签和 Top4 数值；截图复核后再提交。

## 研究来源

- 国家档案局世界记忆名录：<https://www.saac.gov.cn/mowcn/cn/c100393/gjjyml.shtml>
- 汕头市档案馆《兰台拾萃｜批局之最》：<https://daj.shantou.gov.cn/daj/zdlyxx/202304/423a497d14ab4cb28809f80af2da6a30.shtml>
- 广东省政协文史资料《论侨批的起源》：<https://www.gdwsw.gov.cn/wsgdlnfw/content/post_22100.html>
- 中国侨博《华侨华人与中国的关系：侨批业之视角》：<https://www.ochmc.com/m/view.php?aid=325>
- 中国网信网《“侨批档案”记录侨胞百年爱国情》：<https://www.cac.gov.cn/2018-01/17/c_1122273698.htm>
- 人民网《烽火侨批写就“中国心”》（战时东兴陆路汇路）：<https://dangshi.people.com.cn/n/2015/0808/c85037-27431030.html>

## 交接时可直接复制的总提示词

```text
请继续深化 Figma 文件中的 P02「中途｜经批局」，主链接为 https://www.figma.com/design/zDhIdPTO2Z8KuVzX2Qpdmy/侨批数据可视化?node-id=353-2。以用户提供的两张竖向信息海报为视觉参考：顶部地图与来源、中央连续大桑基流场、两侧少量证据条、底部收批县地图；减少 AI 卡片感，保留大面积留白、细注释线和可编辑 SVG 分组。

主图仍然是三端真实数据：寄出地 → 经手批局 → 收批县。端点流带宽度必须和端线子段宽度一致，宽度只表达记录量；中段只做平滑单峰展开，不要把装饰宽窄当成第二个统计量。地图只做空间定位，PNG 只做叙事物件，不编码数据。

请先阅读 docs/p02-agent-handoff-v1.md、charts/scripts/generate-panel-02-bundled-ribbons-svg-v2.mjs 和本轮新增的三个 SVG 模块。先导入地图与 Top4 SVG，再根据调研事实生成并导入水客、批脚、批局柜面、港口等透明 PNG。不要杜撰制服、官方徽章或确定的水路；默认解释为“跨海水路 + 港口/批局分拣 + 国内批脚固定路线入户”，只有在明确讲战时段落时才加入越南—广西东兴陆路替代线。

调研依据：汕头市档案馆、广东省政协文史资料、国家档案局世界记忆名录、中国侨博与人民网。最终图例标清：端线/流带宽度=记录量；地图/物件=定位与机制解释；历史称谓水客与批脚存在时期和地域重叠。完成后截图复核、更新 docs/qiaopi-worklog-v1.md，并同步 GitHub。
```
