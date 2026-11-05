# Phase 5B image-export/reproduction baseline evidence

See web/IMAGE_EXPORT.md and MIGRATION_PLAN.md for behavior, limitations and future gates. screenshots/ contains native/2× image-default, image-head and image-transparent page captures plus real browser default JPEG and transparent head/body PNG downloads. reference/ and reference2x/ contain unmodified SWF Ruffle 0.7.1 wgpu-webgl captures/logs. Source offline alerts were dismissed through UI; no server was stubbed. No original encoded-image download or Adobe Flash reference was obtained.

image-comparison.png and image-comparison@2x.png use exact 640×500 coordinates; coordinate-comparison.json contains descriptive ROI differences, not parity thresholds. Device-font metrics, CSS text-shadow, browser/bitmap antialiasing and the previously documented body-shadow discrepancy remain. Footer origins are excluded. Original shadow/filter parameters are not tuned to fit Ruffle.

source-map.json records all 25 added original symbols, frame-4 placements, matrices, source hashes and text-shadow metadata. input-hashes.json is the immutable milestone-start snapshot. integrity.json distinguishes protected application content (1,718 files) from seven mutable OS metadata files; four .DS_Store changes were observed and preserved, not repaired. Historical manifests were not rewritten. reports/ contains final automated results.

Reproduce references: `node tools/capture-original-reference.mjs --runtime-dir /path/to/ruffle/package --renderer wgpu-webgl --image-page --device-scale 1 --output /tmp/image-reference` (repeat density 2). Reproduce galleries: `python3 tools/compare-image-export.py evidence/phase5b`. Run checks from web/README.md. No third-party runtime was added to production.

The functional reproduction baseline must be committed before default Wii-compatibility corrections. Legacy randomization and binary compatibility tests remain unchanged; Phase 6 will keep their evidence distinct from intended corrected behavior. Phase 5B introduces no Wii generation changes or permanent compatibility toggle.
