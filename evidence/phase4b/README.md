# Phase 4B evidence

- `screenshots/basic.png`, `size.png`: current editor, including working share URL and Size controls.
- `screenshots/*-edited.png` / `*-edited@2x.png`: actual edited configurations on all 11 feature screens.
- `edited-cases.json`: exact full binary fixtures captured through real editor controls. Same bytes are supplied to the original application for comparisons.
- `reference/`, `reference2x/`: unmodified original SWFs in local Ruffle 0.7.1 canvas, corresponding edited screen/character at native and 2× density. Logs retain source hashes/warnings; transition settling avoids prematurely captured submenus.
- `edited-comparison.png`, `edited-comparison@2x.png`, `coordinate-comparison.json`: source-aligned visual comparisons, no image fitting or parity threshold. Footer origins differ and are excluded from the quantitative ROI.
- `reports/`: complete dev/production GUI, data/XML, renderer and interaction/storage results. New suites cover 219 tiles, 59 category palette choices, 584 option actions, byte isolation, page boundaries, real pointer hits, mouse/keyboard/touch capture/cancellation, category reloads, share precedence and unavailable storage. General's 12 favorite colors remain covered by the existing GUI suite.
- `legacy-slider-rounding.json`: original floating-point readback can decrement untouched values; modern editor intentionally updates only the edited dimension.
- `visual-evidence-review.json`: reviewed panel line flags are scaling, not non-scaling; original device font has zero glyphs. No unsupported appearance correction was introduced.
- `browser-availability.json`: Firefox/WebKit Playwright binaries absent; neither engine verified here.
- `protected-input-integrity.json`: complete protected input set/hash check.

No Adobe Flash runtime was executed. Remaining source-grid/device-font/stroke/gradient/antialiasing differences are documented in `../../web/EDITOR_INTERACTIONS.md`. The exact save/startup/share contract and intentional differences from Flash are in `../../web/STORAGE_CONTRACT.md`. File dialogs and image export remain Phase 5; tutorial remains deferred.
