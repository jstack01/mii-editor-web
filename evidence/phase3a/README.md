# Phase 3A rendering evidence

The default head is reconstructed from original vectors and recovered placements. No warning-overlay GUI PNG, substituted drawing or raster character is used in the application.

## Inspect these screenshots

- `screenshots/default-head-preview.png`: the working 640 × 500 browser application (shown in a 900 × 650 browser viewport).
- `screenshots/default-head.png`: the visible SVG head viewport, at its normal application size.
- `screenshots/diagnostic-head-preview.png` / `diagnostic-head.png`: development-only source bounds, registration crosses and coordinate origins.
- `screenshots/production-head-preview.png` / `production-head.png`: production output, with no diagnostic checkbox or overlays.
- `screenshots/default-head-native.png`: a 300 × 280 browser screenshot viewport for source-coordinate comparison; original part coordinates remain unchanged.
- `head-comparison-ruffle.png`: coordinate-aligned SVG/original-runtime head crops and an amplified interior RGB difference image. White in the difference panel means excluded pixels, not a failed match.
- `reference/original-ruffle.png`: the unmodified original application on its General screen.
- `reference/original-ruffle-head.png`: the unmodified original application on the head-editing screen.

## Meaning of the comparison

The original executable SWFs and defaults XML ran locally in **Ruffle 0.7.1, canvas renderer**. This is independent execution of the supplied original code in an emulator, not Adobe Flash. Ruffle is a temporary reference tool and is not a migrated-app dependency. Font fallbacks, Security.allowDomain and Loader timing stubs are recorded in `reference/reference-log.json`. No Adobe Flash runtime was executed; pixel-perfect Adobe Flash parity is not certified.

Alignment uses recovered original GUI coordinates: graphicsContainer `(116,130)`, characterLoader X=−150, and scale=1 after selecting the original head tab. Source ROI `(70,30)–(231,230)` maps to reference `(36,160)–(197,360)`. No pixel-image best-fit or silhouette recentering was used.

`coordinate-comparison.json` records descriptive mean absolute RGB differences within an SVG foreground mask (luminance <249, eroded 5 × 5 to omit background and edge antialiasing). This excludes bright/background/edge pixels and is not a whole-image parity score. The background differs, and a small part of the original body's collar can appear below the head. Remaining color/edge differences can involve browser/emulator antialiasing, pixel-grid placement, dynamic float/twip precision, original color-transform quantization and precision in the extracted SVG gradients.

## Machine-readable records

- `source-map.json`: original source hashes, selected roots, nine vector provenance records, sprite coverage and extracted rendering rules.
- `dev-rendering.json` / `production-rendering.json`: actual selected symbol/frame/matrix/layer records, blank-frame checks and rendering test results.
- `dev.json` / `production.json`: browser UI/data/XML/rendering smoke results.
- `comparison.json`: emulator version/archive provenance, original coordinate alignment and image hashes.
- `protected-inputs.sha256.json`: all 1,725 protected input-file hashes at this milestone's start. The final integrity check verifies SOURCE/ and EXTRACTED-SWF/ remain unchanged.

## Reproduce

From `web/`, run `pnpm test:browser` and `pnpm test:browser:production` after `pnpm build`. These save browser output under `web/test-results/`. Copy the selected output into this evidence folder only when recording a milestone.

The optional original-runtime capture tool is separate:

```sh
node tools/capture-original-reference.mjs --runtime-dir /path/to/unpacked/ruffle/package
python3 tools/compare-head-reference.py evidence/phase3a
```

Ruffle package provenance is pinned in `comparison.json`; the runtime is not checked into the project. The comparison tool requires Pillow for offline evidence analysis, not for building/running the web application. The capture tool serves the original files read-only, blocks external browser requests and writes only new reference output.

The default proof catalog includes original frame 1 and intentionally blank frames; other nonblank frames are marked unsupported until Phase 3B. No editor feature-selection controls or full body renderer are claimed complete.
