# Data contract for qiaopi poster charts

Read this reference before calculating or styling any chart. A chart is accepted only when its claim and encodings are explicit.

## Minimum contract

Each chart gets a small YAML or JSON record with these keys:

```yaml
id: source-county-flow
panel: 01
status: observed              # observed | derived | illustrative
claim: "Overseas origins connect to receiving counties unevenly."
source:
  file: "侨批可用数据.xlsx"   # use a repository-safe logical name
  sheet: "..."
  fields: ["source_place", "receiving_county", "record_id"]
  license_or_credit: "..."
population: "one row per archival record after documented deduplication"
encodings:
  x: "longitude / mapped position"
  y: "latitude / mapped position"
  line_width: "sqrt(record_count)"
  node_area: "record_count"
  color: "route role, not magnitude"
filters: "document exclusions and Top-N rules"
uncertainty: "unknown coordinates and inferred dates remain marked"
units: "records"
legend: true
axes_or_scale: "map scale bar plus labeled locations"
source_note: "Derived from the cited source; see data dictionary."
```

Use the actual field names in the current workbook or summary. Do not copy this example's placeholder names into code without mapping them.

## Required claim families

### Panel 01: spatial flow

- Map positions must come from a stated geography source or a documented lookup.
- A route line represents a real origin–destination combination.
- Width uses a monotonic scale; square-root scaling is preferred when counts vary widely.
- A selected vermilion route is narrative only and must be labeled as a sample.
- A source × receiving-county matrix may reveal non-uniform links; cell area/opacity must be labeled as record count.

### Panel 02: intermediary network

- Threads are source place → 批局 → receiving county, not an invented logistics path.
- The network must state whether parallel records are aggregated, deduplicated, or left as events.
- “Reach” means a declared metric, such as distinct connected counties or records; never use an unlabeled visual radius.
- Keep Top-N choices and dropped categories in the data notes.

### Panel 03: time and micro-story

- Count bars by the declared time field; show direct, inferred, and missing dates separately when relevant.
- A year × month heatmap uses a stated aggregation and preserves zero versus missing.
- A relationship timeline shows archival observations; blank intervals are not proof of no contact.
- A micro-story must carry a record identifier or archival citation and must not be embellished beyond the evidence.

## Validation rules

Before export, check:

1. Every axis and scale has a unit or an explicit categorical label.
2. Every legend maps a visible mark to one meaning.
3. Color is not the sole carrier of a critical distinction.
4. Counts in the SVG agree with the derived table within rounding tolerance.
5. Derived metrics include their formula, denominator, and missing-value treatment.
6. “Illustrative” assets never appear in a quantitative layer.

Store contracts beside the chart library, for example `charts/contracts/source-county-flow.yml`. Keep sensitive row-level data out of the contract; use field names, aggregations, and provenance instead.

