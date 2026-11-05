# Phase 5A evidence

Inspect screenshots/files.png and screenshots/xml.png and their @2x versions. file-comparison.png and file-comparison@2x.png place browser/original Ruffle captures beside absolute RGB differences. coordinate-comparison.json records source-coordinate ROIs: descriptive measurements, no fitted alignment or parity threshold. XML font/line metrics remain different; footer origin and truthful version labels are excluded where documented.

reference/ and reference2x/ contain original SWF Ruffle 0.7.1 wgpu-webgl captures/logs. reference-canvas-unavailable/ records the offline-service alert and failed BitmapData.draw attempt, not a valid parity reference. The source alert was dismissed through its UI without modifications. No Adobe Flash reference exists.

source-map.json records original added symbols, placements, hashes and the implicit-origin glyph correction. reports/ contains file and prior regression results. protected-input-integrity.json verifies all 1,725 protected inputs.

Reproduce references using tools/capture-original-reference.mjs --file-pages with its runtime/backend/output options. Generate galleries with `python3 tools/compare-file-dialog.py evidence/phase5a`. Commands are in web/README.md. PNG evidence is verification only; application image export remains Phase 5B.
