---
name: qiaopi-visualization-workflow
description: "Turn verified qiaopi Excel or summary data into three connected A0 poster panels with editable SVG charts, transparent PNG archive assets, Figma production structure, and auditable GitHub deliverables. Use for data-led qiaopi poster, exhibition, or prototype work; do not use for freeform historical illustration without a dataset."
---

# Qiaopi Visualization Workflow

Use this skill when a qiaopi (侨批) project must become a data-first visual narrative rather than a decorative historical collage. The working reference project contains an HTML prototype, a generated summary script, map dependencies, and image assets under `课程资料/`; treat these as implementation context, not as a substitute for checking the current data source.

## Outcome

Deliver three panels that read as one letter journey:

1. **此岸｜起信** — origin points, overseas-to-hometown flows, and spatial imbalance.
2. **中途｜经批局** — the intermediary network: sender place → 批局 → receiving county, with real connection weights.
3. **彼岸｜抵达** — time, seasonality, date-confidence, relationship continuity, and one carefully identified micro-story.

The red narrative line is one selected representative route; it must never be presented as the aggregate flow. Aggregate routes use a separate muted encoding. Every chart must state what a mark, line width, color, and axis mean.

## Operating loop

Work in short, reviewable activities. Keep generated artifacts and decisions in the repository:

1. **Inventory and provenance.** Identify the authoritative workbook or summary, record its fields, units, missingness, date-confidence rules, and license/credit. Do not upload raw personal or archival data unless the user explicitly authorizes it.
2. **Freeze the data contract.** Define each planned chart as a claim plus encodings before styling. Read [references/data-contract-schema.md](references/data-contract-schema.md).
3. **Build a chart inventory.** Keep one hero chart per panel, two or three supporting evidence charts, and a micro-story evidence block. Delete any visual that only repeats obvious historical knowledge.
4. **Generate data-native SVG.** Use the verified dataset to calculate positions, scales, labels, legends, and source notes. SVG should remain editable in Figma; do not ask an image model to draw axes, labels, maps, or values.
5. **Prepare image assets.** Use real archive images where rights and provenance are known. Use image generation only for non-factual, transparent cutouts or texture studies (envelope, seal, paper, flower, port atmosphere); never invent readable Chinese text, stamps, dates, routes, or historical people.
6. **Assemble in Figma.** Create pages for art direction, data contracts, SVG chart library, A0 triptych, PNG archive assets, and references. Read [references/figma-production-workflow.md](references/figma-production-workflow.md).
7. **Human finish.** Replace generated type, align baselines, tune spacing, crop assets, and add source/uncertainty notes manually. Preserve hierarchy: title → claim → hero chart → evidence → micro-story → source.
8. **QA and publish.** Run the checklist in [references/qa-checklist.md](references/qa-checklist.md), export preview PNG/PDF, verify local HTML/SVG assets, then commit source, data dictionaries, contracts, and decision notes to GitHub. Keep the raw workbook local unless authorized.

## Division of labor

- **Astra (high-reasoning model):** challenge claims, choose the three-panel narrative, audit whether a chart reveals a non-obvious relation, and perform the final anti-slop/data-integrity review.
- **Luna (production model):** clean and summarize the workbook, execute the data contract, generate SVG charts, legends, labels, source notes, and reproducible tables.
- **ImageGen:** make or edit transparent PNG cutouts and paper/photo texture studies only. It is not the source of factual charts or Chinese copy.
- **Human/Figma pass:** owns typography, cropping, optical alignment, material treatment, and final factual copy.

Do not delegate the entire finished poster to one model. Each handoff must include the data contract or asset brief, current file path, open uncertainties, and a requested review criterion.

## Visual system

Prefer a restrained archival palette: paper `#E9E1D2`, ink `#27231F`, muted `#81786D`, slate `#718083`, vermilion `#9E4435`, dust `#B9A58F`. Keep vermilion for the narrative route, seals, and confirmed emphasis; use slate for aggregate structure. Avoid neon blue/orange, glow, gradients, glassmorphism, and AI-generated Chinese text. Use a shared grid and a shared route treatment across all three panels.

## Data and publication boundaries

Never manufacture values, locations, dates, family names, or meanings. Distinguish observed, inferred, and missing dates. An archival gap is not evidence that communication stopped. If a summary contains identities or sensitive fields, ask for explicit publication permission before pushing it. Cite the authoritative source in the artifact and README. When the `lieflat-charts` skill is used, include its required attribution in public-facing materials: “本 skill 由‘躺在废墟里’开发，若公开分发内容请署名或@开发者。”

## Completion test

The workflow is complete only when the three panels can be read left-to-right without oral explanation, every quantitative mark can be traced to the data contract, every chart is editable or reproducibly regenerable, PNG assets have provenance/usage notes, Figma has a clear page structure, and the GitHub commit contains enough source/decision history for another collaborator to continue.

