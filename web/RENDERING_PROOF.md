# Phase 3A — original-vector head proof

The existing browser application now displays the original default head. This is a rendering proof, not the full editor interface or a finished character renderer. The body, other nonblank feature frames and the complete editor remain Phase 3B/later work. Name editing, exact binary data display and all Phase 2 APIs remain functional.

## Open it

```sh
cd web
./dev.sh
```

Open <http://127.0.0.1:5173/>. For development alignment markers, check **Alignment diagnostics (development)** or open <http://127.0.0.1:5173/?diagnostics=1>. The checkbox/overlay are excluded from production builds, even when the query parameter is supplied.

The application still uses a 640 × 500 surface with uniform scaling. Its head viewport displays source coordinates `(0,0)–(300,280)`, the head portion of the original 300 × 600 character stage. The viewport scales the picture; it does not recenter individual parts. This proof layout is not presented as a recreation of the original editor UI.

## Original evidence and asset scope

- `evidence/manifests/assets.json` supplies root/nested depth lists, symbol IDs, names, matrices, local origins, bounds, frame counts, color transforms and clip depths.
- `EXTRACTED-SWF/assets.swf/scripts/mii/display/MiiCharacterGraphics.as` supplies geometric ranges, palettes, head offsets, frame selection, mirrored feature operations and runtime layer reorder rules.
- Asset wrapper classes stop their feature timelines at frame 1; the controller then chooses explicit frames with `gotoAndStop`. `MiiBody.as` was examined; body deformation/footing is deliberately outside this proof.
- `scripts/generate-character-assets.mjs` reads those inputs without modifying them, checks original SWF/SVG provenance hashes, and produces `src/generated/character-assets.ts`.
- The compact proof catalog has 28 original symbols: 19 sprite timelines and **nine original SVG shapes**, instantiated 12 times for the default head. It includes frame 1 and every originally blank frame in those timelines. Other nonblank frames are explicitly marked outside Phase 3A rather than misrepresented as blank or substituted.
- Original shapes: **1** (back hair component), **57** (head), **139** (mouth outline), **158/170** (eye/eyeball components), **244** (brows), **268** (front hair), **349/360** (nose skin/outline). Source SVGs are copied as geometry, not redrawn or approximated.

The default packed values are not all zero: hair=33, eyebrows=6, eyes=2, nose=1 and mouth=23 map to frame 1 through Phase 2's original permutations. Lip tint, facial features, beard, mole, hats, mustache and glasses are intentionally blank for the default. Their original layer slots remain present.

## Module boundaries

- `render/headScene.ts`: pure data → source scene graph, frame selection, controller equations and original sequential `setChildIndex` operations. Reads the existing data model and never modifies it.
- `render/geometry.ts`: affine composition, source bounds, and DisplayObject-style scale/rotation updates that preserve skew/reflection. It retains the tiny independent root X/Y scales and the face/nose nested scales.
- `render/color.ts`: Flash affine color multipliers/offsets, concatenation and the exact mouth `reduceColor` arithmetic.
- `render/svgRenderer.ts`: SVG definitions/uses, unique paint-server IDs, manifest-driven filled-path depth masks, sRGB color filters, and development-only source bounds/origin overlays.

The exported SVG outer group translates source geometry into an image bounding box. The generated markup wraps it in the exact inverse translation; original path data, gradients and nested placements remain intact. Using image-center pivots or keeping that export translation twice would misalign the face.

A reflected left feature has positive scale magnitudes, rotation 180° and skew −180°. The original scale/rotation setters retain that skew. Simple uniform rotation/scale from identity would invert the left eye incorrectly. The proof reproduces the reflected matrix and retains original offsets such as mouth X=−0.15 and nose X=0.05.

Tint filters use `feColorMatrix` with RGB offsets divided by 255 and explicit `color-interpolation-filters="sRGB"`. This preserves shading and negative multipliers. Color transforms concatenate before channel clamping. Native-browser tests verify a known original black shape becomes `[235,205,187,255]` under skin palette 0.

No stencil masks are used in the recovered head timelines. The authored 300 × 600 stage is retained as metadata; it is not invented as an extra clipping mask around a loaded character. The generic depth-mask foundation is nevertheless tested with original filled paths, including inside/outside pixels and clipDepth termination. Stroke-only masks and unsupported source filters/blend modes fail explicitly; they require separate support if later assets need them. No blurred body shadow has been approximated.

## Visual evidence

See `../evidence/phase3a/README.md` for screenshot paths, the emulator reference and coordinate-aligned comparison. Default, diagnostic and production screenshots come from the actual browser renderer.

The unmodified original executable SWFs were successfully run in a temporary **Ruffle 0.7.1 canvas** harness. Both the General screen and original head-editing screen were captured. Ruffle is an emulator, not Adobe Flash; it is not an application dependency. Its recorded warnings include font fallback and stubbed Security/Loader details. No Adobe Flash runtime was used, so Adobe Flash pixel-perfect parity remains unverified.

Comparison uses the recovered original GUI transform, not an image best-fit: graphicsContainer `(116,130)`, loader X=−150, scale=1 on the head-editing page. SVG source ROI `(70,30)–(231,230)` aligns to original screenshot ROI `(36,160)–(197,360)`. Backgrounds differ and the original body can appear below the head; quantitative comparison therefore uses an eroded SVG foreground mask and is descriptive only.

Remaining differences to investigate include browser/emulator antialiasing, dynamic float versus twip precision, original color-transform quantization, and the precision of the extracted SVG gradients. Matching an emulator does not independently certify Adobe Flash output.

## Verify

```sh
pnpm test
pnpm typecheck
pnpm build
pnpm test:browser
pnpm test:browser:production
```

The original 189 data tests remain. Ten added rendering tests cover source rule extraction, source placements/origins, default asset/frame selection, geometry, reflection, layering, field mappings, blank/missing/out-of-proof frames, palettes and bounds. Browser checks additionally cover the actual 12 vector instances, pixel-invariant name editing, sRGB tint pixels, stencil masks, unique SVG IDs and development/production diagnostic behavior. The 62 native XML cases still run.

## Next: Phase 3B

Expand the proof catalog to validated nonblank variants, then add original body/limb/shadow composition and size/footing behavior. Add the remaining filters/masks/accessory-specific behavior as evidence requires. Validate each newly included frame/palette combination against original geometry and runtime references before exposing it through editor controls. Keep the existing data layer and original vectors; do not replace the proof with raster approximations.
