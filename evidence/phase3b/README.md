# Phase 3B renderer evidence

- `screenshots/default-preview.png`: actual working browser application, full character and test controls.
- `screenshots/{default,feminine,compact,maximum,accessories,foreign,spacing,hat}-character.png`: eight rendered full characters.
- `screenshots/diagnostic-character.png`: development part bounds, original registration points and origins.
- `screenshots/production-default-character.png`: production renderer without diagnostics.
- `character-comparison-ruffle.png` and `character-comparison-ruffle@2x.png`: browser vs original executable SWFs, source-aligned, with amplified interior differences.
- `screenshots/*-aligned.png` / `*-aligned@2x.png`: browser-generated transparent images in the original General-page camera.
- `reference/*-ruffle.png`, `*-ruffle-head.png`, `reference2x/*-ruffle.png`: unmodified original SWFs running locally in Ruffle 0.7.1 canvas, native and twice pixel density. Logs retain emulator warnings and source hashes.
- `coordinate-comparison*.json`: precise ROI, masks and descriptive RGB measurements. Mask excludes File-button overlap, edges, shadow and translucent pixels. No fitted alignment or parity threshold.
- `source-map.json`: complete character provenance, shape origins, timelines/blank frames, source rules/body constants.
- `screenshots/{dev,production}*.json`: actual browser checks, including 992-scene native sweep / 355 shapes, full fixtures, box-blur/color/mask pixels, XML regression checks and no external requests.

The original File button obscures part of shoes/shadow. That region is visible in the SVG preview but is not independently visually certified against an unobscured original runtime image. Ruffle is an emulator, not Adobe Flash; no pixel-perfect claim is made. See `../../web/RENDERING_PROOF.md` and the migration plan for reproduction and remaining limits.
