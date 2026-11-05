# Phase 4A — original editor interface reconstruction

The main page reconstructs the original **640 × 500** `classicGUI.swf` editor from its display lists, extracted vectors and embedded static-text glyph outlines. It uses the existing Mii data model and complete character renderer. No whole-screen PNG, Flash runtime, PHP, backend or new dependency is used by the application.

## Launch and scope

From `web/`, run `./dev.sh`, then open http://127.0.0.1:5173/.

- **General:** name, creator, gender, birthday day/month, mingle, Mii/Wii IDs, all 12 favorite colors and the original randomize button work. The existing codecs, clamping and randomization algorithm remain authoritative. Changes stay in memory.
- **Head:** all eight head shapes and six skin colors work. Both update the character and source selection highlights immediately.
- All nine original top-level tabs work. Head/Facial Features and the four accessory sub-tabs provide all **13 original editing screens**.
- Size, Facial Features, Hair, Eyebrows, Eyes, Nose, Mouth, Glasses, Mustache, Mole and Beard show their original layouts, current icon page, palettes and selections. Editing, paging, sliders and option buttons on these screens are disabled in Phase 4A. The status text below the stage, unavailable cursor/tooltips and `aria-disabled` distinguish them from functional controls. Their graphics are not invented placeholders.
- File remains an explicitly unavailable original button. No file dialog, import/export or persistence was added. The original footer legend is retained; its read-only field shows the actual 148-character data instead of presenting a nonworking share URL. Sharing is deferred.
- The renderer test bench is available at **http://127.0.0.1:5173/diagnostics.html** in development, with the existing presets, all-attribute controls, name/hex preview and alignment diagnostics. It is excluded from the normal production build. A link appears below the editor only in development.

## Source evidence and composition

`ClassicGUI.as`, `AbstractGUIPage.as`, General/Head and related controllers, Tab/NavigationButton/AbstractHoverHilite, the executable GUI SWF and `evidence/manifests/classicGUI.json` supply the original navigation and display behavior.

`generate-gui-assets.mjs` reads protected inputs without changing them, verifies original SWF/SVG hashes and generates **348 symbols: 305 shape definitions and 43 timelines**. The shapes include **288 extracted vector shapes and 17 static text definitions converted directly from original font glyph curves**. The catalog retains 13 frame display lists, symbol names/IDs, all nested timelines, source matrices, depths, registration points, bounds and six scale grids. No dialog/startup-warning/version/invisible-homepage overlays are presented as functional editor content.

`guiScene.ts` builds the original screen graph and injects the original icon timelines and selection symbols in controller order: item background → selection → icon. Palette tints apply to color wells using the existing original color transforms. Gender/mingle status frames and current feature pages use the existing model/frame mappings. `screens.ts` describes the 13 source frame labels; tests compare its item/page counts to the original controllers.

The character is inserted at the original graphics-container depth, before foreground controls. Its loader remains X=−150. General/Size use scale .53 and dynamic container Y so the original global footing is at GUI Y=405; other pages restore scale 1 and container `(116,130)`. The whole interface scales uniformly for narrow browsers.

`nineSlice.ts` applies the recovered scale grids to source graphics. Fixed corner regions remain fixed while edge/center regions stretch. Narrow birthday fields collapse the center and reduce opposing caps when necessary; this interpretation remains a precision question without Adobe Flash execution. Half a target pixel of overlap at internal patch clips prevents browser antialiasing seams; original paths and outer silhouettes are retained. Rotated/reflected scale-grid instances fail explicitly; no such instance occurs in these layouts.

Original NavigationButton/LargeButton/ControlButton hover and press classes use **+20 / −20 RGB offsets** with alpha preserved. SVG filters reproduce these values; pointer release outside a button resets it. Tabs, item tiles and color wells have no invented hover state where their original classes did not define one. Selected tabs/sub-tabs and item/color highlights use the actual original graphics. Disabled editing is a milestone state; no unsupported original disabled artwork is invented.

Static text is drawn from `DefineTextTag` glyph indices, original advances, baselines, text matrices and `DefineFont3` curve records (20480-unit em), preserving its appearance without loading a substitute font. Editable fields and page counters were original **device text** with no embedded glyphs for that face. They currently use browser **Arial / Helvetica / sans-serif**, regular weight, with original field bounds, font heights and colors. Ruffle reports unknown Arial/Noto Sans bold device-font fallbacks. Exact editable-field face/weight/metrics are therefore **not verified**; this is a documented substitution, not a claim to have recovered missing device glyphs.

## Verification

Run:

```sh
pnpm typecheck
pnpm test
pnpm build
pnpm test:browser
pnpm test:browser:production
```

- **223 unit tests** pass: all previous 216 plus seven GUI evidence/scene/scale-grid tests.
- The unchanged renderer test bench retains its **992-scene / 355-shape** browser sweep, tint/mask/blur pixel checks and **62 XML compatibility cases**. Production regression checks compile a separate test-only diagnostic fixture into ignored `test-results/diagnostics-dist/`; it is never part of `dist/`.
- GUI browser tests cover every screen in dev and production at native and 2× pixel density; real controls, keyboard navigation, hover/press/release, selections, immediate renderer updates, state retention and uniform scaling are checked. Exact whole-byte expectations verify name/creator, gender, mingle, birthday, IDs, favorite color, head and skin changes preserve all unrelated bits. No page errors or external requests are observed.
- TypeScript/build and six original SWF evidence checks pass. Protected input hashes remain unchanged. The production JS is about **1.13 MB / 236 kB gzip** because it includes the original GUI and character vectors/glyphs. Vite's standard 500 kB chunk warning remains visible; no dependency was added.

## Visual evidence and remaining differences

`evidence/phase4a/screenshots/` contains all 13 actual browser screens at native and 2× density, selected production snapshots and machine-readable regression reports. `reference/` and `reference2x/` contain the corresponding unmodified originals running in local **Ruffle 0.7.1 canvas**. `gui-comparison.png` / `gui-comparison@2x.png` show exact source-coordinate comparisons and amplified differences; no fitted alignment or parity threshold is used. Only the legacy footer is excluded from quantitative measurements because its behavior is intentionally deferred.

Two extra `reference-webgl/` images/logs verify that the following panel difference also appears with Ruffle's wgpu-webgl renderer. The source scale grids produce different panel curvature, borders and some gradients from the Ruffle captures, especially the tall Head selection panel and narrow fields. The implementation retains source grid semantics; it does not reshape the artwork to hide this discrepancy. Ruffle and the reconstructed grid edge/cap behavior require an Adobe Flash reference before either can be considered definitive.

Other differences include editable device fonts/page counters, minimum-width/non-scaling strokes, gradients, fractional placement, color quantization and browser/emulator antialiasing. Static labels, source placements and navigation are recovered, but **pixel-perfect Adobe Flash parity is not claimed**. Ruffle warnings and source hashes are retained; no Adobe Flash runtime was executed. Firefox/WebKit have not been certified.

To reproduce references, provide a separately unpacked Ruffle runtime (not an app dependency):

```sh
node tools/capture-original-reference.mjs --runtime-dir /path/to/ruffle/package --gui --output evidence/phase4a/reference
node tools/capture-original-reference.mjs --runtime-dir /path/to/ruffle/package --gui --device-scale 2 --output evidence/phase4a/reference2x
# Copy selected web/test-results/gui/ snapshots into evidence/phase4a/screenshots/:
python3 tools/compare-gui-reference.py evidence/phase4a
```

Phase 4A stops here. Phase 4B should implement the remaining category selectors/paging, source option adjustments, sliders and browser persistence, and resolve the recorded font/scale-grid/stroke differences. File dialogs/import/export and tutorial remain separately deferred.
