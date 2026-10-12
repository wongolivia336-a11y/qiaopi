# Figma production workflow

This is the assembly plan for three connected A0 panels. It is intentionally separate from the visual style so the data layer can be regenerated without redrawing the composition.

## Pages and naming

Create these pages in the Figma file:

```text
00_Art Direction
01_Data Contracts
02_SVG Chart Library
03_A0 Triptych
04_PNG Archive Assets
99_References
```

Use stable component names such as:

```text
P01_HeroMap
P01_SourceCountyMatrix
P02_ThreadsNetwork
P02_OfficeReach
P03_AnnualConfidence
P03_MonthHeatmap
P03_RelationshipTimeline
NarrativeRoute_01to03
SourceNote
Legend_Quantitative
```

## Panel frame and grid

Make three distinct A0 frames and arrange them left-to-right in story order. Honor the required physical orientation; if the brief says horizontal triptych, keep the panels in a horizontal sequence rather than rotating content to fit a screen. Use the same outer margin, 12-column grid, 8 px baseline rhythm, title zone, source zone, and route anchor across all three frames.

Each panel should have one hero chart, two or three evidence charts, and one human-scale evidence block. Do not fill empty space with extra charts. Let the hero chart occupy roughly half the panel's visual weight; this is a hierarchy guide, not a hard percentage.

## SVG import rules

1. Generate SVG from the verified data, with text and paths as separate editable elements.
2. Keep chart title, subtitle, axes, legend, source note, and plot marks in named groups.
3. Import the SVG as an editable object; do not flatten before the human pass.
4. Convert only final display text to outlines when a print handoff requires font safety, and keep an editable text version in the library.
5. Use one tokenized palette and line-weight system across all chart components.
6. Add a small “data contract ID” metadata label in the library, not in the hero composition.

## PNG asset rules

Store transparent cutouts with a stable name and a short metadata note:

```text
asset_id | subject | source_or_model | rights | intended_use | color_treatment
```

Separate factual archival scans from generated atmosphere. Never place generated text, seals, dates, people, or route labels into an evidence chart. Crop, mask, and scale by hand so objects feel collected rather than pasted.

## Human finish pass

After importing the data layer:

- rewrite every heading and legend in the chosen type system;
- align labels to the grid and protect a clear reading path;
- check that the vermilion narrative line continues across panels without implying aggregate volume;
- use photo/envelope/ink assets as evidence or punctuation, not as an all-over background;
- remove any visual whose meaning cannot be explained in one sentence;
- add a source and uncertainty note close to each chart.

## Handoff

Export panel previews and a PDF proof for review. Keep the original SVGs, contracts, derived tables, asset manifest, and Figma page map in the repository. Record the Figma file URL and page/node identifiers in a short project note, but do not rely on the Figma file alone for reproducibility.

