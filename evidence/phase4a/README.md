# Phase 4A GUI evidence

Inspect `screenshots/basic.png` (General), `screenshots/face.png` (Head), and `gui-comparison.png` (all 13 screens versus Ruffle). `@2x` counterparts preserve twice pixel density. The browser PNGs are actual stage screenshots, without whole-screen source-image backgrounds.

- `screenshots/`: all 13 source screen layouts at native and 2× density; selected production General/Head snapshots; GUI reports; retained data/renderer/XML regression reports.
- `reference/`, `reference2x/`: original unmodified executable SWFs, Ruffle 0.7.1 canvas, all 13 screens. Logs retain original hashes and emulator warnings.
- `reference-webgl/`: two additional General/Head screenshots and log from the second Ruffle backend used to investigate the scale-grid difference.
- `gui-comparison*.png`, `coordinate-comparison.json`: exact 640 × 500 alignment, no fitting. Descriptive RGB differences include fonts and scale-grid discrepancies; legacy footer excluded from the numerical ROI.
- `source-map.json`: GUI provenance, source symbol origins, timelines, original screen frames and scale grids.
- `protected-input-integrity.json`: whole protected-tree integrity check.

General and Head editing work. Other category controls, File and sharing remain explicitly unavailable. Static text uses recovered glyph curves; editable device text uses browser Arial/sans-serif. Panel curvature/border differences remain between source-grid reconstruction and both Ruffle backends. No Adobe Flash pixel-parity claim is made. See `../../web/GUI_RECONSTRUCTION.md` for details and reproduction.
