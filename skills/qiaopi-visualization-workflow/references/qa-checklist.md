# Qiaopi poster QA checklist

Use this checklist before asking for a final visual review or pushing a public commit. Record pass/fail and a short note in the project log.

## Data truth

- [ ] The workbook/summary used for each chart is named and credited.
- [ ] Row grain, deduplication, filters, Top-N rules, and missing-value treatment are documented.
- [ ] No value, route, date, person, or quote was invented.
- [ ] Observed, derived, inferred, missing, and illustrative layers are visibly distinguished.
- [ ] Sensitive row-level information is not public unless the user explicitly authorized it.

## Chart readability

- [ ] Every quantitative chart has a title that states the measure and scope.
- [ ] Axes, units, scale bars, legends, and category labels are visible at A0 print size.
- [ ] Line width, node size, opacity, color, and position each have one declared meaning.
- [ ] The same color means the same thing across all three panels.
- [ ] No chart is retained solely as decoration or because it “looks data-like.”
- [ ] SVG text and marks are editable and not a single flattened bitmap.

## Story and composition

- [ ] The left-to-right sequence reads as 起信 → 经批局 → 抵达.
- [ ] The red sample route is labeled as a representative narrative path, not total volume.
- [ ] Each panel has one visual hero, supporting evidence, and a human-scale micro-story.
- [ ] Macro, meso, and micro levels are visibly related but not conflated.
- [ ] PNG assets have provenance or are clearly marked as generated atmosphere.
- [ ] Generated images contain no fake readable historical text or data labels.

## Technical handoff

- [ ] HTML, SVG, JS, and local assets load without network-only dependencies when a local preview is promised.
- [ ] Filenames are stable and paths are relative to the repository.
- [ ] A fresh checkout can reproduce chart exports from the documented source/summary.
- [ ] Preview PNG/PDF was inspected at both full-page and close-up scales.
- [ ] README includes the preview link, data credit, build notes, and limitations.
- [ ] Commit message describes the deliverable; generated outputs and decision notes are included.

## Final review questions

1. What new relation does each hero chart reveal?
2. Can a viewer tell what one line, dot, or cell represents without oral explanation?
3. Does the emotional letter story come from the evidence rather than replace it?
4. Could another collaborator continue from the GitHub files and data contracts?

