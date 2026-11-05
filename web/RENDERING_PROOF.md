# Phase 3B — complete original-vector character renderer

The browser renders every original head, hair, eyebrow, eye, nose, mouth, facial feature, mustache, beard, glasses, mole, hat, body part and clothing variation. The established Phase 2 data model and Phase 3A head API are retained. The original editor interface is a later milestone.

The main page now hosts the Phase 4A original interface. Run `./dev.sh` from `web/`, then open the retained development renderer test bench at http://127.0.0.1:5173/diagnostics.html. Full body is the default. **Character view** selects the unchanged source-coordinate head camera. **Reference character** offers eight independently packed comparison cases; **Original attribute / Value / Apply attribute** exercises all 45 fields using the existing clamping and serialization rules. Name editing affects only the current character's name bytes. Reset restores the original default.

Development diagnostics retain source origins, bounds and registration crosses for head and body. Use the checkbox or `?diagnostics=1`; production builds omit the checkbox and overlay. `?case=hat&view=head` opens a selected case directly.

## Evidence and composition

`evidence/manifests/assets.json`, original extracted vector SVGs, `MiiCharacterGraphics.as` and `controllers/MiiBody.as` are authoritative. The read-only generator verifies original SWF and SVG hashes and includes all **385 reachable symbols: 30 timelines and 355 vector shapes**. All timeline frames, including intentionally blank frames, are represented; missing/cyclic dependencies fail explicitly. The unrelated version text/font definitions are not character artwork and are excluded.

The pure scene graph preserves original nesting, local registration, slight source scale differences, signed/skewed transforms, exact permutations, head offsets and sequential layer moves. Source root order is headback → body → head. Body order is pants → shadow → shirt, including the original unusual shadow placement. No layer order was aesthetically corrected. Tints use affine RGB/alpha multipliers and offsets in sRGB, including negative multipliers, palette ownership, attenuated mouth color, shaded-glasses exceptions and multiply-mode facial features.

The body controller ports original scale ranges and all six anchor points. Torso/legs use width/height; arms use height/width; hands **and feet** use width/width. Neck remains at source Y=220; shadow Y comes from original pants bounds and global footing includes the preserved shadow X. Shirt tint includes hands, as in the original. Pants retain normal, special gold and foreign blue ID-byte classifications.

The full camera is source coordinates `(-20,0)–(320,640)`, providing room around the authored 300 × 600 stage for wide arms and shadow; the head camera remains `(0,0)–(300,280)`. This only changes the view, not individual origins or body placement. Source stage metadata is retained; no invented stage mask is applied. The app preview retains uniform scaling of its 640 × 500 surface. Controls below it are explicitly a renderer test bench.

## Filters and export discoveries

The complete character contains one source filter: shadow **25 × 15, one-pass blur**, with alpha multiplier **179/256**. SVG uses two centered separable box convolutions, preserving local units, filter bounds and alpha. It does not substitute a Gaussian. The [Adobe SWF 19 specification, printed page 44](https://open-flash.github.io/mirrors/swf-spec-19.pdf) describes the centered odd-sized box filter. Browser pixel checks verify the plateau/support of this kernel independently. Fractional/even filters and unsupported blend/filter kinds fail explicitly; none occur in the recovered character catalog.

FFDec SVGs 162 and 217 enlarge an original one-twip red stroke to one pixel for export and include custom namespace metadata. Generated markup restores the recorded 0.05-pixel source width, verifies it against the raw SWF line style, and removes the export-only attributes. Original paths, color and all protected source files remain unchanged. Flash/emulator minimum-width rasterization may still differ at this tiny stroke.

No clipDepth masks occur in the recovered character timelines. The generic filled-path mask foundation remains pixel-tested, including clip termination. All 355 shape definitions are parsed and instantiated by the native browser sweep, so failures in less common frames are not hidden by default-only tests.

## Verification and limits

- 216 unit tests: unchanged 189 data cases, ten original head cases broadened to full catalog coverage, and 17 complete-renderer cases. Every selectable source timeline frame is reached, including 8 heads × 12 facial-feature families and 8 heads × 4 beards. Tests independently check source placements, colors, body constants, min/mid/max joints, feet, neck, footing, IDs, layers and blank frames.
- Development browser checks instantiate 992 scenes reaching all 355 original shapes, retain 62 XML compatibility cases, verify native color/mask/box-blur pixels and name-edit pixel stability for head and full body, test actual feature controls, and capture eight complete characters. Production checks cover the same UI and eight fixtures with diagnostics excluded.
- TypeScript, production build and six original evidence checks pass. No dependency was added. Full vectors make the production JavaScript about 596 kB / 135 kB gzip; Vite reports its standard 500 kB chunk warning. No runtime Flash or Ruffle, remote services, PHP or backend is needed.

See `evidence/phase3b/` for the source map, screenshots, source-aligned comparison and Ruffle reference logs. The unmodified original SWFs run in a temporary Ruffle 0.7.1 canvas harness at native and 2× pixel density. The reference tool blocks external requests. Its warnings (font fallback, Security/Loader stubs) are retained. Ruffle is not shipped in the browser app.

Comparison uses the recovered General-page camera (scale .53, graphicsContainer X=116, loader X=−150, footing Y=405), not fitted image alignment. The original File button overlaps shoes/shadow; quantitative comparison therefore excludes that region, translucent edges and shadow. Inspect unmasked originals too. Original head-tab screenshots provide additional feature evidence. Rasterization, twip/float rounding, color quantization, extracted gradient precision and blur/subpixel behavior can differ. Neither all feature combinations nor other browser engines have been visually certified. No Adobe Flash runtime was run, and pixel-perfect Adobe Flash parity is not claimed.

## Reproduce

```sh
pnpm typecheck
pnpm test
pnpm build
pnpm test:browser
pnpm test:browser:production
```

From the project root (offline evidence tools use Python/Pillow):

```sh
python3 tools/generate-render-cases.py
node tools/capture-original-reference.mjs --runtime-dir /path/to/ruffle/package --cases web/src/generated/render-cases.json --output evidence/phase3b/reference
node tools/capture-original-reference.mjs --runtime-dir /path/to/ruffle/package --cases web/src/generated/render-cases.json --output evidence/phase3b/reference2x --device-scale 2 --skip-head
# Copy selected web/test-results outputs into evidence/phase3b/screenshots, then:
python3 tools/compare-character-reference.py evidence/phase3b
python3 -m unittest discover -s tools -p 'test_*.py' -v
```

Phase 3B is the historical renderer milestone. Phase 4A now reconstructs the original interface; see GUI_RECONSTRUCTION.md. The renderer test bench is retained separately in development. Browser persistence and the remaining category interactions are Phase 4B; file dialogs/export and tutorial remain deferred.
