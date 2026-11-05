# Phase 4B — complete editor interactions

All **13 original editing screens** are functional. Open http://127.0.0.1:5173/ after running `./dev.sh` in `web/`. The original nine top tabs, Head/Facial Features sub-tabs and four accessory sub-tabs retain their recovered graphics and layout.

| Screen | Supported original controls |
| --- | --- |
| General | Name, creator, gender, birthday, mingle, Mii/Wii IDs, 12 favorite colors, randomization |
| Size | Height/weight 0–127, original 301–528 thumb span and drag offset |
| Head | 8 shapes, 6 skin colors |
| Facial Features | 12 states, 6 skin colors |
| Hair | 72 styles across 6 pages, 8 colors, mirroring |
| Eyebrows | 24 styles across 2 pages, 8 colors, X/Y/size/rotation |
| Eyes | 48 styles across 4 pages, 6 colors, X/Y/size/rotation |
| Nose | 12 styles, Y/size |
| Mouth | 24 styles across 2 pages, 3 colors, Y/size |
| Glasses | 9 styles, 6 colors, Y/size |
| Mustache | 4 states, 8 shared facial-hair colors, Y/size |
| Mole | 2 states, X/Y/size |
| Beard | 4 states, same facial-hair color field as mustache |

`EditorSession` owns the visible page separately from the binary selection. Browsing pages changes no character bytes. Tiles use the original one-based frames and permutation tables; selection highlights appear only on the page containing the selected item. Entering a category opens that selected page, as in `AbstractGUIPage.init()`. Page buttons stop at original boundaries without wrapping or changing selection. Option buttons apply exactly +/-1 to the source `currProp + option` field and rely on the existing model for clamping. They retain the original active artwork at limits; no new disabled artwork is invented.

The original source classes/controllers are authoritative. `screens.ts`/`colorField()` distinguish eyebrow, hair and the shared facial-hair data fields even though some palettes contain the same source colors. `guiScene.ts` accepts the independently browsed page; original nesting, vectors, registration, palettes, zoom and layering remain intact. The complete renderer and data implementations were not rebuilt.

Size dragging uses Pointer Events, a noncentral grab offset, inverse screen coordinates under uniform CSS scaling, native pointer capture, and release/cancel/lost-capture cleanup. The captured thumb remains in the DOM; only its transform, existing avatar, share field and saved data update during dragging. The original continuous thumb position and `int(127 * percent)` are retained. Returning to the category restores the thumb from its integer data, as the original does. Only the edited dimension changes; documented legacy cross-dimension truncation drift is intentionally avoided.

Accessibility extensions retain the artwork: buttons activate with Enter/Space; focused sliders support arrows (+/-1), Home/End (0/127) and Page Up/Down (+/-10). Native touch emulation verifies capture, outside release and cancellation. Keyboard increments operate directly on integer fields rather than re-quantizing an unrelated thumb.

Automatic saving, startup precedence and copyable share URLs are specified in [STORAGE_CONTRACT.md](STORAGE_CONTRACT.md). File remains the sole unavailable editing-interface button, explicitly deferred to Phase 5. No file dialogs or PNG/JPEG export were added. The development-only [renderer test bench](http://127.0.0.1:5173/diagnostics.html) remains separate and excluded from normal production output.

## Verification and visuals

- **242 unit tests**, including all previous 223, source-controller mappings, every tile/palette/page, limits and unrelated-bit preservation, slider math, startup/validation/storage/URL behavior.
- Existing **62 XML checks**, **992-scene / 355-shape** native rendering sweep, color/mask/blur pixel checks, and prior GUI checks all pass.
- Chrome dev and production tests cover all 13 screens, all **219 feature selections**, **59 category palette choices** (plus General's 12 in prior GUI checks), **584 adjustment actions**, actual pointer hits on every distinct option family, page limits/highlights, shared colors, mirroring, byte isolation, native slider dragging/keyboard/cancellation/touch, reloads after each category, URL precedence/refresh and corrupt/blocked storage.
- TypeScript, production build and six original recovery/integrity checks pass. No dependency was added. The complete vector/glyph bundle remains about 1.14 MB / 238 kB gzip; Vite's existing chunk warning remains visible.
- `evidence/phase4b/` contains **11 edited feature configurations** captured in both the browser and unmodified originals running in Ruffle 0.7.1 canvas, at native and 2× density. Matching complete binary fixtures, source logs, comparison galleries and quantitative ROIs are retained. Longer reference transition waits avoid capturing a still-loading submenu.

The source review confirms `noHScaleFlag=false` / `noVScaleFlag=false` on the examined panel line styles; forcing non-scaling strokes would contradict that evidence. The original device font has no embedded glyphs. Existing recovered grids and browser device-font substitution are retained; no speculative fix was added solely to match Ruffle. Panel curvature/borders, font/page-counter metrics, gradients, hairlines and rasterization remain precision limits. No Adobe Flash runtime was executed and no pixel-perfect claim is made.

Firefox and WebKit Playwright binaries are **not installed** in this environment, so those engines are not certified. `pnpm test:browser:firefox` / `pnpm test:browser:webkit` run the new suite when their environments are available; optional installation is `pnpm exec playwright install firefox webkit`. Chrome native touch emulation is not certification on physical touch devices.

Phase 4B stops here. Phase 5 remains file/binary/XML dialogs and image export; tutorial stays deferred. Browser-engine and exact Flash visual parity checks remain release work.
