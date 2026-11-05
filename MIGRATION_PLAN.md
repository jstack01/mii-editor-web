# Mii Editor migration assessment and plan

Status: Phases 0–5B and Phase 6 are complete against the documented Wii software profile. The tested original reproduction baseline is committed as `ebc0373`. New/default/randomized characters and normal editing now enforce the default Wii software constraints; incompatible imports require explicit review/repair and unresolved Save Mii is blocked. There is no permanent compatibility toggle. Physical Wii, emulator transfer and individual-game certification remain Phase 7 and are unverified. Historical milestone records below retain their original policies/results; section 17 and web/WII_PROFILE.md supersede earlier warn-only/optional-mode behavior.
Reviewed: November 4, 2026. Updated November 5, 2026 after Phase 5B and the approved final product direction.

## 1. Scope and evidence

### Current project layout

```text
Mii-editor/
  MIGRATION_PLAN.md
  web/                 # Vite/TypeScript Phase 1 application and tests
  tools/               # Read-only SWF recovery and independent evidence tests
  evidence/            # Raw XML, JSON manifests, input hashes and recovery notes
  SOURCE/
    assets.swf
    classicGUI.swf
    MiiEditor_defaults.xml
    mimetype
    META-INF/
      signatures.xml
      AIR/application.xml
      AIR/hash
    icons/MiiEditor_{16,32,48,128}.png
  EXTRACTED-SWF/
    assets.swf/
    classicGUI.swf/
```

The extracted directory is named `EXTRACTED-SWF` on disk. `SOURCE` is the authoritative original package; `EXTRACTED-SWF` contains decompiled code and derived resources. Preserve both unchanged during implementation. All paths below are relative to this project root unless a code namespace is being discussed.

### Original source package findings

Both original SWFs are SWF version 9, contain executable AS3 (`DoABC` tag 82), and retain their original SymbolClass mappings and display-list placement tags. This resolves the previous absence of executable originals and makes original timeline/layout recovery possible. They have not yet been executed in a reference runtime.

| Original | Compressed bytes | Stage | Rate | Root frames | Nested sprites |
| --- | ---: | --- | ---: | ---: | ---: |
| `SOURCE/assets.swf` | 60,962 | 300 × 600 | 24 fps | 1 | 30 |
| `SOURCE/classicGUI.swf` | 89,836 | 640 × 500 | 24 fps | 14 | 49 |

Original SHA-256 hashes:

- `SOURCE/assets.swf`: `ab8b3dd8f588b79001b6a8ed6cf12cc4cea0e9d1ac9460a37f607ec3f2461d92`.
- `SOURCE/classicGUI.swf`: `d53f6c65b351f2b22d5a89a3937ffbbc4e1f54a75784746d690e1e1d02acca4b`.

`SOURCE/META-INF/AIR/application.xml` identifies an AIR 1.0.M4 desktop package, application ID `com.miieditor.MiiEditor`, version `0.7.57b`, title Mii Editor, and root content `classicGUI.swf`. It declares standard window chrome, four icon sizes, and `.mii` file association with content type `binary/x-mii`. This confirms desktop distribution was an intended original use case. The extracted GUI text separately contains `1.0.0.57b`; do not conflate displayed editor and AIR package versions.

`SOURCE/mimetype` identifies an Adobe AIR installer package. Signature XML and AIR hash metadata are present; XML well-formedness was checked, but signature authenticity was not verified. All four package icon PNGs decoded successfully. No audio tags were found even when recursively scanning nested timelines in the original SWFs.


These folders are two cooperating ActionScript 3 (AS3/AVM2) modules of a Mii Editor, rather than two unrelated applications. Evidence: AS3 packages, typed classes, `flash.*` imports, `ApplicationDomain`, and document-class mappings in both extracted `symbolClass/symbols.csv` files. No AS2 implementation was found.

- `SOURCE/assets.swf` (extracted under `EXTRACTED-SWF/assets.swf/`): document class `mii.display.MiiCharacterGraphics`; a character renderer and reusable graphics library, authored at 300 × 600 and 24 fps.
- `SOURCE/classicGUI.swf` (extracted under `EXTRACTED-SWF/classicGUI.swf/`): document class `mii.authoring.ClassicGUI`; the editor, authored at 640 × 500 and 24 fps. It loads `assets.swf` and assigns the shared character model to that renderer.
- The supplied original package had no JavaScript project, browser HTML wrapper, FLA, or backend source. A new `web/` Vite/TypeScript project and supporting tests/documentation now implement only Phase 1. The original browser host wrapper, FLA and PHP implementations remain absent.

The audit inventoried every file, traced application/model/rendering/control/I/O code, compared duplicated classes, inspected symbol mappings and embedded SWF tag inventories, validated every extracted PNG/JPEG and SVG, and visually inspected a contact sheet of every root frame and the standalone JPEG. Sprite variants were counted and mapped structurally; individual visual fidelity of every variant has not been certified. The reorganized extracted-code and shape/sprite counts were rechecked; original SWF headers, frame labels, class mappings, nested sprite counts, and recursive audio tags were inspected, and supplied XML/icons validated. No original Flash runtime was executed, so runtime behavior below is source-derived unless explicitly described as observed in exported imagery.

### Extracted resource inventory (`EXTRACTED-SWF/`)

Counts exclude `.DS_Store` metadata.

| Resource | assets.swf | classicGUI.swf |
| --- | ---: | ---: |
| ActionScript files | 28 | 78 |
| Embedded graphics SWFs | 1 | 1 |
| SVG shapes | 355 | 309 |
| Sprite PNGs | 582 in 30 symbol folders | 263 in 49 symbol folders |
| Root frame PNGs | 1 | 14 |
| Button PNGs | 0 | 8 |
| Standalone images | 0 | 1 JPEG (`images/366.jpg`, Wii console) |
| Fonts | 0 | 3 TTF subsets |
| Extracted text files | 1 | 60 |
| Symbol maps | 1 CSV | 1 CSV |

No sound files were found. Neither embedded SWF contains sound-definition or streaming-audio tags; no sound playback logic was found. `EXTRACTED-SWF/classicGUI.swf/movies` and `morphshapes` are empty. All extracted raster files decoded successfully and all 664 SVGs parsed successfully. One GUI SVG embeds a PNG data URI; no external SVG image URLs were found.

### Important distinction: bundled SWFs are not runnable originals

Both `EXTRACTED-SWF/*/scripts/_assets/assets.swf` files are distinct SWF v9 graphics exports with one root frame at 24 fps, AS3 FileAttributes, and no DoABC tag (82). They contain shapes, nested sprites, and ExportAssets records, but no executable AS3 or SymbolClass tag. The newly supplied `SOURCE/*.swf` originals do contain executable AS3 and original class/placement records; use those for authoritative timeline recovery. The CSVs supply the original document/symbol class associations separately. Treat these files as recoverable graphics/timeline sources, not complete copies of the original application.

SHA-256:

- Character graphics SWF: `d1feeb3cb2b15456e03415a57d1823637f5dbf05a2013637b6a40bc9ec1adc40`.
- GUI graphics SWF: `611825a7ca564f376fb896d0598a002e09da79a3b6c64145c8c30f963452f8f3`.

The data model, range implementation, bit-field implementation, and body controller are byte-identical between folders. The renderer differs only by its `[SWF(...)]` metadata declaration in the character module. Port these shared classes once.

## 2. How the application works

### Startup and state

`EXTRACTED-SWF/classicGUI.swf/scripts/mii/authoring/ClassicGUI.as` supplies a fixed default character hex string. Startup precedence is default character → first saved character from Flash SharedObject `localMiis` → host FlashVar `mii`. Host FlashVar `miibaseurl` can override the share-link base.

The GUI loads character graphics and `MiiEditor_defaults.xml` asynchronously (both now supplied in `SOURCE/`) and waits for both completion flags before advancing out of its loading frame. Defaults loading errors retain hardcoded defaults and still signal completion. Graphics errors construct a bare renderer, but it expects timeline children such as `body`; this is not evidence of a working visual fallback.

The UI uses timeline frames as screens and named display instances as controls. `Event.RENDER`/`stage.invalidate()` initialize the current page. Navigation deconstructs the old page before switching frames. State consists of:

- One shared `MiiCharacterData` instance (37 raw 16-bit blocks).
- Current category, selected feature, palette, and item-page index.
- Renderer transforms, layer order, and zoom position.
- File dialog page and image export settings, including drag offset.
- Last saved character and share-link text.
- Graphics/defaults readiness and network file-operation availability.

There is no undo/redo history or server account system in the supplied code.

### Character data and calculations

Primary sources: `mii/MiiCharacterData.as`, `mii/values/MiiDataValue.as`, and `Range.as` in either folder.

- Binary format: exactly 74 bytes, 37 big-endian unsigned 16-bit words. Hex serialization is 148 lowercase characters.
- Character and creator names occupy ten 16-bit code units each, zero padded. Preserve UTF-16 code-unit behavior rather than assuming ten Unicode code points.
- Mii ID and Wii ID are each four bytes. Do not reinterpret the UI's Wii ID as a complete six-byte MAC address.
- 45 numeric attributes cover gender, birthday, favorite color, height/weight, face, hair, eyebrows, eyes, nose, mouth, glasses, facial hair, and mole.
- Each numeric field has its own block, shift, width, and bounds. Writes clamp to bounds and preserve neighboring bits. Reads extract stored bits; initialization does not universally clamp invalid encoded values.
- Height and weight range from 0 to 127. Sliders calculate `int(127 * percent)`, truncating rather than rounding.
- Feature values and display order differ. Explicit permutations exist for hair (72), eyes (48), eyebrows (24), noses (12), and mouths (24). The source lookup arrays are zero-based; MovieClip frame selection is one-based.
- XML exports use `mii-collection`/`mii` elements, name/creator elements and typed `data` elements. Vertical feature positions are inverted for XML; eyebrow Y additionally accounts for its minimum of 3. `mingles` is inverted. XML feature order is mapped through the same lookup arrays.
- XML import resets the blocks and applies named children; it does not simply restore the `mii/@value` hex attribute. Preserve this distinction pending compatibility tests.
- Randomization chooses uniform inclusive integers within each declared field range, randomizes all four ID bytes, sets name to `Random` and creator to `Mii Editor`, and leaves Wii ID outside that randomization list. It is not a plausibility-aware face generator.

Examples of declared limits: head 0–7; skin 0–5; facial features 0–11; hair 0–71; eyebrow type 0–23, size 0–8, Y 3–18, X 0–12; eye type 0–47, size/rotation 0–7, Y 0–18, X 0–12; nose size 0–8/Y 0–18; mouth size 0–8/Y 0–18; glasses size 0–7/Y 0–20; mustache size 0–8/Y 0–16; mole size 0–15/X 0–16/Y 0–30. Extract the complete schema directly from `defineValues()` when implementing.

### User interactions and screens

The source maps root frames as follows. The original GUI confirms 13 labels for frames 2–14: `frame_basic`, `frame_size`, `frame_face`, `frame_face2`, `frame_hair`, `frame_eyebrows`, `frame_eyes`, `frame_nose`, `frame_lips`, and `frame_accessories` through `frame_accessories4`. Precise placement still needs extraction from the original display lists:

| Frame | Screen | Choices and interactions |
| --- | --- | --- |
| 1 | Loading/setup | Loads defaults and renderer |
| 2 | General | Name, creator, birthday, IDs, gender, mingle, 12 favorite colors, randomize |
| 3 | Size | Height/weight sliders; whole-body view |
| 4 | Head | 8 shapes, 6 skin colors |
| 5 | Facial features | 12 choices, skin colors |
| 6 | Hair | 72 choices, 6 pages × 12; 8 colors; mirror/part toggle |
| 7 | Eyebrows | 24 choices, 2 × 12; 8 colors; X/Y/size/rotation ±1 |
| 8 | Eyes | 48 choices, 4 × 12; 6 colors; X/Y/size/rotation ±1 |
| 9 | Nose | 12 choices; Y/size ±1 |
| 10 | Mouth | 24 choices, 2 × 12; 3 colors; Y/size ±1 |
| 11 | Glasses | 9 choices, 6 colors; Y/size ±1 |
| 12 | Mustache | 4 choices, 8 shared facial-hair colors; Y/size ±1 |
| 13 | Mole | 2 choices; X/Y/size ±1 |
| 14 | Beard | 4 choices, same facial-hair palette |

Clicking an item converts its page/grid index through the inverse permutation, writes the model, redraws the character, updates selection and URL text, and persists the hex. Pagination stops at its ends. Color selection follows the same update path. Options increment/decrement a field and rely on clamping.

General and size pages scale the character container to 0.53 and align the footing to GUI Y=405; other pages restore the close-up. Name/creator edits serialize immediately. Birthday input permits digits and uses zero for blank. IDs accept hex-style text. Gender and mingle use two-frame status sprites.

Buttons brighten RGB offsets by +20 on hover, darken by −20 on press, and restore on release/out. Sliders and export repositioning use stage-level move/up listeners so dragging can end away from the handle. XML scrolling has arrows and a draggable thumb.

### Rendering and visual appearance

Primary sources: `mii/display/MiiCharacterGraphics.as`, `controllers/MiiBody.as`, `EXTRACTED-SWF/assets.swf/scripts/assets_fla/*.as`, both shape/sprite folders and embedded SWFs.

The avatar is assembled from nested vector parts, not a single sprite animation. Front hair, back hair and hats share 72 selected frames. Eyes and eyeballs have separate 48-frame parts; mouths/lips have separate 24-frame parts; noses/skin have separate 12-frame parts; glasses/lenses have separate nine-frame parts. Beard has 4 × 8 = 32 frames and facial features 12 × 8 = 96, accounting for head shape. Some blank frames are valid “none” choices and must not be discarded.

The renderer converts a field's normalized percentage to a geometric range using linear interpolation. Examples: eye X 0–54, eye Y −69–35, eye scale 0.26–1, eye rotation −81.5–0 degrees; mole X −71–71 and Y −60–100. It mirrors paired feature positions about X=0, applies asymmetric rotations (`right=-r`, `left=180+r`), and flips hair/back hair/hats with `scaleX=-1` for hair part.

Head shape offsets are `[0,-3,14,6,3,-3,13,16]`; head Y is `140-offset`. Features from index 3 upward use multiply blending. Eye/brow/hair/hat depth is reordered dynamically when features extend past X=37 or the eye Y is below −67 in source coordinates. The eyebrow condition also references eye Y: retain or change only after verification.

Palettes are affine per-channel Flash ColorTransforms (`out = clamp(in * multiplier + offset)`) including negative multipliers. Replacing these with flat CSS fills will lose gradients and shading. Mouth color is attenuated by `reduceColor(...,0.4)`; reproduce its actual arithmetic. Glasses frames 1–6 tint both frame and lenses, while frames 7–9 preserve the outer frame's original color.

Body height scale is `0.4 + 0.6 * height/127`; width scale is `(0.45 + 0.55 * weight/127) * (0.6 + 0.4 * height/127)`. Limbs are independently scaled and attached using transformed anchor points. Gender selects one of two torso frames. Shadow position follows pants bounds and the neck is aligned to Y=220. Pants color depends on first ID byte: blue/foreign for 192–223; gold/special for 0–31 or 64–95; normal otherwise.

### Files, sharing and export

`FileOptions` has four timeline frames: hidden/default, Files, XML, and image export. It provides load/save `.mii`, editable/exportable XML, and square JPEG/PNG export with preview.

Image settings: default size 50 px, permitted 10–800 px; default zoom 25; scale `0.15 + zoom/100`; default background `E3F3EF`; body visible; JPEG selected; transparent PNG optional. Export scales the preview offset by output-size/preview-width and centers on current display bounds. Dragging pans the preview. JPEG disables transparency. Image encoding defaults to JPEG quality 90 in legacy adapters.

The browser implementation uploads files to PHP, follows the returned URL, then parses binary or XML. Downloads POST bytes/text/encoded images to PHP with type, name and character hex query parameters. A connectivity probe expecting the literal `true` can disable Load, Save and Export. The AIR branch instead supports direct file access, drag/drop of the first file, and open-with invocation. AIR bitmap save always encodes JPEG even when the dialog requested PNG: this is a compatibility discrepancy to resolve, not behavior to copy silently.

Share text is a base URL plus `?mii=` or `&mii=` and serialized hex. Many edits also persist the character via SharedObject. Not every pathway updates both: size dragging redraws without calling `updateURLText()`, XML read redraws without explicitly persisting, and general toggles refresh via their page. Test original timing before “fixing” inconsistent persistence.

### Animation and dependencies

Most sprite timelines are alternative states selected using `gotoAndStop`; named asset classes install a first-frame `stop()`. Root timeline frames represent screens. Do not play feature frames as animations. The only explicit tutorial animation uses ENTER_FRAME with a 30-step eased virtual-cursor movement at the authored 24 fps (about 1.25 s per cycle); the supplied step sequencing is incomplete.

Dependencies are Flash display/events/geometry/text/network/storage, AIR filesystem/desktop APIs for desktop mode, bundled Adobe PNG/JPEG encoders, and Senocular VirtualMouse plus synthetic event wrappers for tutorial playback. There are no supplied remote data feeds or audio dependencies. Legacy Flash/AIR security behavior does not translate directly to the browser.

## 3. Missing material and conversion risks

| Finding | Consequence / required follow-up |
| --- | --- |
| Original executable SWFs now present; FLA and browser HTML wrapper remain absent | Recover layouts from `SOURCE/*.swf` and verify in a suitable reference runtime. Browser-host parameters remain unknown; AIR configuration is supplied. |
| All 14 GUI root PNGs show the Flash update/Wii warning overlay | These are not clean editor screenshots. The constructor hides `updateFPMessage`, but static export does not execute it. Recover unobscured display lists from `SOURCE/classicGUI.swf` or capture the supplied original in a reference runtime; do not use these PNGs as whole-screen backgrounds. |
| GUI embedded graphics SWF has only one root frame vs 14 extracted GUI frames | This limitation applies only to the derived library. `SOURCE/classicGUI.swf` retains all 14 root frames, 13 labels and original placement/removal records. Extract these before manually rebuilding screens. |
| Defaults XML now supplied in `SOURCE/MiiEditor_defaults.xml` | Base URL is `http://www.miieditor.com/`; connectivity/upload/download scripts are `scripts/connected.php`, `scripts/uploadfile.php`, and `scripts/downloadfile.php`. Actual configured download target is `_blank`, overriding the code fallback `_self`. PHP implementations remain absent. |
| Missing PHP `connected.php`, `uploadfile.php`, `downloadfile.php` | Original server validation, filename generation, response contract and file handling cannot be reproduced exactly from this checkout. Do not call historical endpoints. |
| XML refers to remote `mii.dtd` and `mii.xsl`, neither supplied | Offline XML interpretation can follow the source, but original styling/schema validation cannot be confirmed. Do not fetch DTDs/entities during import. |
| Three exported font subsets: 44, 13 and 32 mapped characters | Insufficient for arbitrary name/creator/XML input; obtain intended full fonts or agree on measured system fallbacks. Embedded subset labels can be reused only after coverage verification. |
| SVGs are isolated shapes and PNGs are rendered symbol bounds | Neither alone supplies all original registration points, transform chains, hit areas, clipping, text placement or depth. Extract nested placement metadata from SWFs, retain origin offsets, and flag unrecoverable root data. |
| Tutorial `compare()` is unfinished; no step sequence is supplied | Do not invent guided steps. `playbackHandler` is typed MouseEvent but attached to ENTER_FRAME, and `slider_width` differs from the real weight control. Confirm whether tutorial was ever usable. |
| No sample `.mii`/XML files or reference export images | The default hex is a starting fixture, not a complete compatibility oracle. Obtain representative valid/invalid files and screenshots before parity sign-off. |
| No license/provenance documents | Redistribution terms for character art, fonts and bundled third-party code remain unrecorded; document supplied provenance before release. |

Legacy edge cases to characterize: permissive `[0-9a-zA-Z]{1,2}` hex parsing rather than strict hex validation; short hex padded/long hex truncated to 74 bytes; malformed inputs often swallowed; ID display pads values under decimal 10 rather than hexadecimal 16; XML import can reset unspecified bits; out-of-range loaded fields can exceed palette/frame tables. Preserve known valid behavior and seek a decision on malformed-input and legacy-bug behavior.

## 4. Approved modern architecture

Prefer a static client-side editor with TypeScript modules compiled to JavaScript, Vite, native HTML controls styled to match the original, and an SVG character scene graph. Keep the initial logical viewport at 640 × 500 and scale uniformly; confirm mobile/responsive expectations before redesigning layout.

Separate modules:

- `model/`: canonical raw 37-word state, field schema, clamped mutation, codecs, XML mapping, permutations, injectable random source. Preserve unknown bits on binary edits.
- `assets/`: immutable originals and generated manifests mapping symbol/frame → paths, bounds, pivots, matrices, depth, masks and tint regions. Namespace GUI and character symbol IDs; the two `_assets/assets.swf` files are different.
- `render/`: pure model-to-scene transform calculation and SVG composition; nested affine tint filters with explicit sRGB treatment, multiply blending, correct transform order and depth rules.
- `ui/`: explicit category/file-dialog state and commands replacing Flash frame navigation; HTML inputs/buttons layered with recovered art as practical.
- `services/`: URL import/share links, browser persistence, local file import/download, image export. Keep I/O independent of rendering/model code.
- `tests/`: binary/XML fixtures, expected computed scene transforms, browser interactions and visual baselines.

Use one authoritative model and an explicit update flow: input command → model mutation → scene render → UI refresh → persistence/share update according to the agreed compatibility policy. UI selection must be derived from the model rather than maintained as conflicting state. Do not add undo, accounts, cloud save, or new character features without scope approval.

Suggested libraries and alternatives:

| Concern | Recommendation | Why / alternative |
| --- | --- | --- |
| Build and types | Vite + TypeScript | Small modular app; add a separate `tsc --noEmit` check because transpilation is not type checking. Plain JavaScript remains possible if preferred. |
| UI | Native DOM + CSS initially | Existing app has modest state; avoids a framework before requirements warrant it. React is an option if this will become part of a larger React product. |
| Character | SVG first | Retains vectors and nested transforms; supports affine color filters and blending. Validate gradients, clipping, color space and export before committing. |
| Rendering fallback | Canvas 2D, or PixiJS if measured need warrants it | Canvas can use pre-tinted layers; PixiJS would require accurate tint/filter and asset conversion work. Neither is needed merely to replace Flash. |
| Import/save/storage | File/Blob APIs, DOMParser/XMLSerializer, localStorage | Removes obsolete server round trips if approved; retain the 74-byte and XML interchange formats. |
| Image output | Canvas `toBlob()` from the approved render path | Native PNG/JPEG avoids porting legacy encoders; compare quality and cropping. JPEG byte identity is not expected. |
| Unit tests | Vitest | Deterministic model, codec and geometry tests. |
| Browser tests | Playwright | Interaction flows and image comparisons across Chromium, Firefox and WebKit. |
| Animation | CSS for button effects; requestAnimationFrame only if needed | No general animation engine required; tutorial timing remains conditional on recovered behavior. |

Documentation checked for these recommendations: [Vite](https://vite.dev/guide/), [Vite features](https://vite.dev/guide/features), [Vitest](https://main.vitest.dev/guide/), [Playwright visual comparisons](https://playwright.dev/docs/test-snapshots), [Canvas toBlob](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob). Pin supported package versions when implementation is approved, not in this analysis.

### Approved scope and remaining fidelity questions

1. Approved: standalone browser-only TypeScript/Vite, HTML/CSS and SVG-first rendering; no Flash, AIR, PHP or backend dependency. Desktop/AIR launch integration is out of scope.
2. Approved: local browser import/export and persistence replace PHP services. These features are scheduled for later phases, not presented as complete in Phase 1.
3. Approved: preserve correct legacy binary behavior and document bugs/questionable behavior before changing them. Invalid hex user-import semantics, persistence inconsistencies and other compatibility discrepancies still need characterization before their feature phases.
4. Approved: start at 640 × 500 with uniform scaling and reuse original extracted graphics wherever possible. Tutorial is deferred. Font fallback and any unrecoverable rendering details remain evidence-led fidelity decisions.

The isolated Phase 1 screen is explicitly an implementation preview, not a fabricated reconstruction of the original General screen. It does not use invented artwork, fake avatar rendering, disabled mock controls or a full-editor parity claim.

## 5. Implementation sequence and acceptance requirements

### Phase 0 — recover evidence and confirm decisions (essential static recovery complete)

- Use the supplied `SOURCE/*.swf` originals and defaults XML as reference inputs; hashes are recorded above. Retain `SOURCE` and `EXTRACTED-SWF` unchanged. Request the browser HTML wrapper and sample files if available. Do not request originals/defaults already supplied.
- Recover clean GUI screenshots by hiding the warning overlay in a reference runtime or by extracting underlying display-list data. Use the confirmed root labels and recover instance names, layouts and button states from original placement records.
- Export nested sprite placements, matrices, registration origins, masks, blend modes, text properties, hit areas and frame contents from the original `SOURCE/*.swf` files into a machine-readable manifest. Compare against derived graphics exports and record any unsupported metadata explicitly.
- Build an evidence ledger: source-derived, runtime-confirmed, reconstructed, or unknown. Associate each UI action with its model and visual effects.
- Architecture, browser-only scope, local I/O/storage replacement and tutorial deferral were approved before scaffolding. Resolve remaining behavior questions when their later feature phases begin.
- Exit requirement: enough evidence for the first slice; unresolved items remain visible and cannot be silently implemented from guesses.

### Phase 1 — smallest port: a name-field codec slice (complete)

- After approval, create the minimal build and test harness.
- Port only raw word storage and the ten-code-unit `name` field read/write operation, plus binary/hex serialization needed for that field.
- Load the exact default hex from `ClassicGUI.as`; show its decoded name in one input and its resulting hex. Editing the input updates only name words (bytes 2–21). This is a deliberately isolated tool, not a claim to reproduce the whole General screen.
- Reuse recovered label/control appearance when evidence permits. Do not add avatar rendering or fake a working GUI around unknown layouts.
- Tests: unchanged default round trip; empty and ten-unit names; longer input truncation; non-ASCII UTF-16 units; zero padding; exact 74-byte length and 148-character hex; all bytes outside 2–21 unchanged. Compare expected bytes independently with known fixtures.
- Exit requirement: demonstrated name edit with exact byte preservation and all slice tests passing.

Smallest purely internal unit: `Range.clamp`. The name-field slice is the smallest useful user-visible port with strong independent correctness checks and minimal asset uncertainty. The smallest visual graphics experiment after it is a two-state mole symbol viewer, explicitly separate from full avatar rendering.

### Phase 2 — complete data compatibility (complete)

- Extract the full field schema and all five permutation tables from source; consolidate duplicated classes.
- Port binary, hex, IDs, name/creator, XML import/export and randomization with an injectable RNG.
- Decide invalid-input semantics explicitly and preserve unknown bits where the original format permits.
- Tests: every field at min/max and out-of-range writes; neighboring/reserved-bit preservation; all frame/value mappings round trip; names/creator/IDs; short/long/malformed hex; wrong binary lengths; XML Y/mingle inversions and missing fields; first-Mii collection handling; deterministic random bounds and unchanged Wii ID.
- Exit requirement: default plus supplied fixtures round trip and legacy deviations are approved and documented. XML semantic comparison rather than incidental whitespace comparison.

### Phase 3 — rendering proof and complete avatar (3A and 3B complete)

- Begin with one head shape plus eyes/nose/mouth and required tint regions using recovered pivots. Compare SVG output against source assets before expanding.
- Implement all part frames, palettes, head offsets, pairing/rotation, hair mirroring, multiply features and glasses exceptions.
- Implement body anchors, independent limb scales, gender torso, ID-dependent pants and footing-based zoom.
- Tests: every asset reference resolves; every declared selectable frame exists including blank states; geometric assertions for min/mid/max values; 8 heads × feature/beard families; all palettes; hair mirror; dynamic depth threshold crossings; gender/height/weight extremes; ID boundary values 31/32/63/64/95/96/191/192/223/224.
- Visual acceptance: compare on a stable browser/OS/font baseline at native dimensions and 2× scale. Review overlays/diffs; agree pixel tolerances after measuring Flash-versus-browser antialiasing. No invented universal pixel threshold.
- Exit requirement: representative reference characters match geometry/layering/color, with remaining rasterization differences recorded and accepted.

### Phase 4 — editor screens and persistence (4A and 4B complete)

- Implement the 13 editing screens with source order, pagination, palette choices, selections and adjustments. Reuse extracted icons/button art with correct bounds.
- Add General fields, randomize, height/weight drags, page-dependent close-up/full-body view and share-link display.
- Add accessible labels, keyboard focus and Pointer Events with pointer capture while preserving visible styling.
- Implement approved startup precedence, URL handling and local persistence. Avoid accidental hydration writes that overwrite a URL-imported character.
- Tests: every screen reachable; last/first page limits; selections track codec values; repeated navigation does not duplicate listeners; drag release outside control; clamping; gender/mingle; birthday blanks; name truncation; URL precedence; storage failures and corrupt saved data; reload after each mutation pathway; keyboard and touch interactions.
- Exit requirement: complete editing flows behave as agreed at native size; no stale preview or unintended state loss.

### Phase 5 — finish original application reproduction (5A and 5B complete)

- Phase 5A local binary/XML files and original Files/XML interface are complete. Preserve the current legacy fidelity regression suite and permanent seven-file corpus.
- Phase 5B reconstructs the original PNG/JPEG image-export page, source bounds/defaults, background/body options, PNG alpha, JPEG quality target, zoom, drag and BitmapUtils centering formula. Use recovered artwork and existing renderer; no new artwork or backend.
- Validate SVG-to-canvas filters/masks; document font, antialiasing and native JPEG encoder differences. Test valid/invalid/cancelled file flows plus 10/50/800 px images, default zoom/background, body off/on, panning, PNG transparency/JPEG opacity, MIME/dimensions/geometry, Unicode names, repeated exports/resource cleanup and offline operation.
- Establish a thoroughly tested functional reproduction baseline: all prior data/XML/rendering/editor/file/persistence suites, image-export checks, TypeScript/build and source-integrity checks pass; diagnostics remain available. Record the parity matrix and unresolved/deferred features, including incomplete tutorial and unverified browser engines.
- **Gate: complete and locally commit this reproduction milestone before implementing Wii-compatibility corrections.** The original Flash application is the reference for UI, graphics, functionality and record reconstruction, not a permanent requirement to preserve its bugs. Phase 5B must not change generation, editing ranges, import correction or binary-export validation policies.

### Phase 6 — Wii-compatible creation and editing as standard behavior (complete for documented software profile)

- New/default and randomized characters must conform to the intended Wii format by default. **No permanent legacy/Wii compatibility toggle.** Do not replace the faithful reproduction baseline until its commit exists.
- Review every editable attribute against independent Wii RCD/RFL evidence; constrain controls and generation to supported ranges, including mole size. Keep preview, controls and serialized character data consistent after corrections.
- Generate valid month/day combinations and supported feature combinations. Investigate normal, special and temporary CreateID semantics, ID uniqueness/collisions, console ownership/system identity and destination-specific requirements before choosing a generation policy. Do not fabricate real-console ownership or certify a random ID as safe.
- Validate full .mii data before export, including cross-field constraints and relevant flags/reserved bits; scalar MiiJS acceptance alone is insufficient. Distinguish raw lossless preservation from an export claimed to be Wii-compatible.
- Imported legacy data must remain intact until explicit user action. Retain its original bytes, identify incompatible values/relationships, explain proposed corrections and obtain explicit acceptance before replacing data. Do not export unresolved data as Wii-compatible. Any future byte-preserving archival download must be clearly identified as unresolved original data, separate from compatible-export claims; its UX must not become a permanent generation-mode toggle.
- Implement correction transactions so failed/cancelled repairs leave the original character intact. Show corrected preview/control values and identify every deliberate difference from the Flash source.
- Keep **original-fidelity tests** and **Wii-compatibility tests** separate. Retain the legacy arithmetic oracle and failing corpus as historical evidence; do not silently rewrite legacy expectations to make corrected behavior appear identical. Test corrected generation at scale, edit boundaries, dates, feature relationships, ID flags, collisions, imports/repair/cancel, reserved bits and pre-export validation using independent decoders.
- Exit: default generation/editing and corrected imports satisfy documented software profiles; all intentional deviations are recorded. This is software validation, not real-hardware certification.

### Phase 7 — physical Wii and game/destination verification

- The approved targets are real Wii consoles, emulators (including Dolphin), and Wii games. Define an evidence-based matrix for transfer/import routes, Mii Channel, relevant games, normal/special/temporary IDs, duplicate IDs, console ownership and local-only/mingling behavior. Confirm required RCD/RSD/database/remote wrappers and checksums in each route. See web/PHASE7_VERIFICATION.md. Unknown-owner browser records do not prove destination uniqueness; separate origins/concurrent tabs can collide. Establish a verified importer/owner/identity policy before extending compatibility claims.
- Document hardware, firmware, game versions, destination tools, test fixtures and outcomes. Identify any requirements that cannot be checked without physical equipment; do not mark these verified based on MiiJS, Ruffle or a decompilation.
- **Certification gate: no claim of real-Wii or individual-game compatibility until the relevant physical tests pass.** Keep scope-specific limitations visible even after other targets pass.

### Phase 8 — release and remaining approved behavior

- Port the tutorial only if its sequencing is recovered or separately specified/approved; otherwise disclose its deferral.
- Run the available Chromium/Firefox/WebKit, native/2×, keyboard/pointer and offline matrix. Verify no unintended historical service calls.
- Publish a final fidelity/deviation matrix, compatibility and hardware-verification matrix, known limitations, asset provenance and build/run instructions. “Faithful original reproduction” and “Wii-compatible product behavior” must have separate supporting evidence.
- Release only after required checks pass, intended features/assets are complete, differences are reviewed and unresolved behavior is not represented as certified.

## 6. Information needed for later verification

Source SWFs, defaults and vector/placement evidence are recovered; unmodified Ruffle captures now cover the editor and export pages. Adobe Flash pixel parity and physical Wii/game/destination compatibility remain uncertified. Before implementing ID/ownership policies, establish intended transfer routes, destination consoles/games, available physical hardware and representative owned Mii records. These are future compatibility/certification inputs, not blockers to the completed browser reproduction scope. Tutorial remains deferred unless its missing sequencing is separately recovered/approved.

## 7. Phase 1 implementation record — November 4, 2026 (historical)

### Phase 0 deliverables

- `tools/recover_evidence.py` invokes FFDec 26.4.0, enforces XML schema 4.2, and normalizes evidence reproducibly. It can also regenerate manifests from existing XML without Java (`--from-xml`).
- `evidence/raw/assets.xml` and `classicGUI.xml` retain full original tag/ABC records. `evidence/manifests/assets.json` and `classicGUI.json` retain symbol registrations, raw definition records, bounds, SVG origin-compensation metadata, root and nested local frame snapshots, placement/move/removal operations, transform inheritance, color transforms, filters, clipping depths, button/hit states and scaling grids.
- Recovered 387 character symbols and 426 GUI symbols; 31 and 50 timelines; 583 and 277 local frames respectively. No unresolved display-list/button placement references.
- Independent tests decode all original placement matrices directly from SWF bytes and compare them with the XML interpretation. MATRIX normalization restores exact 16.16 values rather than propagating FFDec float-formatting drift.
- The original General frame places `nameText` (symbol 379) at `(243.05,146.85)` and includes warning-overlay symbol 372. The static snapshots deliberately retain the overlay: hiding it is AS3 runtime behavior, not a static placement fact.
- `evidence/protected-inputs.sha256.json` records all 1,724 files from `SOURCE/` and `EXTRACTED-SWF/`; the final hash/tree comparison confirms no input files were changed, added or removed.

These manifests are implementation evidence, not a renderer. Local snapshots do not execute AS3, recursively advance child timelines, infer runtime bounds or establish pixel-perfect parity. Original-runtime capture remains future fidelity work. See `evidence/README.md` for schema and regeneration details.

### Phase 1 deliverables

- `web/`: modular Vite 8.3.5 / TypeScript 7.0.2 project, Vitest 5.1.0 and Playwright 1.62.1, with exact versions and a pnpm lockfile.
- `web/src/model/MiiCharacterData.ts`: private 37-word storage, exact 74-byte big-endian serialization, defensive copies and ten-code-unit name codec. No other feature fields are interpreted or normalized.
- `web/scripts/generate-default.mjs`: reads the default literal directly from the untouched `ClassicGUI.as`, generates a provenance-marked fixture, and detects drift during tests. Default decoded name is `defaultBoy`.
- Working 640 × 500 uniformly scaled browser preview: name input, decoded name, read-only 148-character hex, a byte-preservation status and reset to the exact original default. No unavailable editor functionality is represented as working.
- `web/dev.sh` launches with system Node or the existing Codex Node runtime. No global Node/npm was on this shell's PATH; bundled Node 24.22.1 was used for verification. A fresh machine needs Node 22.12+ (24 recommended) and dependencies installed; this checkout includes installed dependencies.
- Production `web/dist/` builds as a static client-only site. Evidence and original source packages are excluded from the browser bundle. No runtime external requests were observed in smoke checks.

### Verified results

- 25 Vitest compatibility cases pass: original default round trip, byte order, exact lengths, empty/full/truncated names, non-ASCII code units, complete and truncated surrogate pairs, internal NUL skipping, shorter-name zero padding, arbitrary reserved-byte preservation, offset byte views, defensive copies and internal fixture validation.
- Six Python evidence tests pass: independent binary tag/matrix cross-checks, known original layout/blank frames, frame-state inheritance/removal/replacement, affine order/precision, malformed recovery rejection and protected input integrity.
- TypeScript type check and Vite production build pass.
- Headless installed Chrome checks pass for dev and production preview: initial default, live ASCII/Unicode/empty name edits, unrelated-byte preservation, ten-unit input limit, reset, keyboard input, uniform desktop/narrow scaling, and absence of runtime errors or external requests. Browser screenshots and JSON reports are reproducible under `web/test-results/`.
- Browser coverage in this phase is Chrome only. Firefox/WebKit and visual comparison against an executed original are later release requirements.

### Discovered/confirmed compatibility issues

- Original `getString()` skips every zero code unit, rather than stopping at the first zero; Phase 1 preserves this exactly.
- Ten-unit truncation can split a UTF-16 surrogate pair; Phase 1 preserves that raw code-unit behavior rather than silently applying Unicode normalization.
- Phase 1 `fromHex()` is explicitly a strict internal fixture decoder, not a replacement for legacy permissive `setHexData()`. No user-facing hex import is exposed. Characterize/implement user-import behavior in Phase 2; no malformed-input bug fix is silently claimed.
- Nested local timelines include intentionally empty frames; these are retained. Raw shape bounds/origin and exported SVG compensation must not be replaced with centered PNG pivots.
- The initial browser smoke check found a missing favicon request, and visual inspection found preview explanatory text overflowing the 500px surface. Both were fixed; the browser regression check now also requires all content to fit the surface.

### Stop point and next milestone

At the Phase 1 handoff, work stopped as requested. The user subsequently approved Phase 2; its completion and current stop point are recorded in section 8. Launch remains `web/dev.sh`; see `web/README.md`.

Historical Phase 1 recommendation (now completed): Phase 2, full data compatibility — extract the remaining field schema and frame permutations, implement binary/hex/ID/name/creator/XML codecs with independent fixtures, and characterize questionable legacy parsing behavior before changing it. The first visual-rendering proof follows that milestone using the recovered placements and original vector shapes. Character rendering, the original editor interface, file import/export, share links and persistence remain unimplemented; tutorial remains deferred.


## 8. Phase 2 completed — full data compatibility (historical handoff)

The user approved Phase 2 with the original ActionScript as the authoritative reference. Existing Vite/TypeScript/HTML/SVG architecture is retained. No dependencies were added or upgraded. The visible screen remains the working Phase 1 name preview; no renderer, fake controls, file dialogs, storage UI or substitute artwork was added.

### Implementation

- `web/scripts/generate-source-data.mjs` extracts all 45 numeric word/shift/width/min/max definitions, the exact `valueNames` order and all five feature permutations from `MiiCharacterData.as`, generates a source-hashed TypeScript module, and detects stale output during tests. `--manifest` also writes `evidence/phase2/schema.json` with source hashes for the model/range/bit-field classes.
- `web/src/model/Range.ts` ports normalization, clamping, interpolation, inclusive integer selection, percentage and stepping arithmetic. `MiiDataValue.ts` ports numeric views, AS3 signed 32-bit conversion, declared clamping and isolated word-mask updates. Raw loads do not normalize packed out-of-range values.
- `MiiCharacterData.ts` now supports all 45 numeric fields, ten-unit character and creator strings, four-byte Mii/Wii IDs, 37-word big-endian binary serialization, strict fixture decoding and separate permissive legacy hex/generic input methods. Phase 1 APIs and tests are retained.
- `featureOrder.ts` supplies packed-value/one-based-frame conversions matching the original renderer's tables, identity fallback and missing-frame behavior. The renderer can now read field ranges/percentages and correct frame mappings.
- `miiXml.ts` implements original document/header structure, source field order, XML Y/mingle inversions, feature permutations, ID formatting, first-direct-Mii selection, ordered duplicate fields, name/creator overrides and the original reset/partial-write semantics. Native browser DOMParser is used for import; XML string export requires no DOM. There is no parser dependency, document insertion, external DTD/style fetch or backend call.
- `randomize(rng = Math.random)` consumes exactly 49 draws in source order, selects inclusive field ranges, randomizes ID bytes high-to-low, sets Random/Mii Editor names and retains Wii ID and unused bits. RNG injection changes no default generation rule.
- API usage and limits are documented in `web/DATA_COMPATIBILITY.md`; `web/README.md` reflects Phase 2 completion and the unchanged preview UI.

### Characterized legacy behavior (preserved)

`evidence/phase2/COMPATIBILITY_NOTES.md` records the source characterization and browser boundaries. Numeric writes convert to signed 32-bit integers before clamping. Binary input preserves all raw bits; invalid-size legacy binary import leaves the existing model intact. Legacy hex tokenizes alphanumeric pairs, accepts partial/non-hex tokens through parseInt/int conversion, ignores separators, zero pads/truncates and treats empty input as a no-op. AS3 global String.match returns an empty array for no matches, explicitly adapted from JavaScript's null result.

Both names preserve UTF-16 code units, zero skipping/padding and truncation within surrogate pairs. ID formatting pads decimal values below 10 only; bytes 10–15 therefore display as a–f. This display quirk is retained; hyphen-delimited IDs still round trip correctly.

XML import ignores its embedded hex value and clears unspecified/reserved bits. It does not promise arbitrary binary-to-XML-to-binary identity. Valid fully defined characters, including the supplied original default, round trip correctly. Missing name/creator can fail after reset or partial mutation; string wrappers swallow errors without rollback. Syntactically invalid XML fails before reset. XML default whitespace trimming and original source field ordering/inversions are preserved.

### Automated verification

- **189 Vitest tests pass**, including the unchanged 25 Phase 1 cases. Every field is checked against independently read ActionScript declarations for word/shift/width/range, raw out-of-range reads, every allowed numeric value, both clamping boundaries, signed integer coercion, percentage bounds and preservation of all unrelated bits. Tests use arithmetic expected-byte calculations independent of the production bit masks.
- Every entry of all five source permutations is checked for exact equality, invertibility, one-based frame conversion and invalid-frame handling.
- Creator/ID tests cover byte order, isolation, defensive copies, incomplete/permissive tokens, formatting and UTF-16 cases. Randomization tests verify deterministic draw order, counts, bounds, names, Wii-ID retention and complete expected bytes.
- **62 native-browser XML cases pass in Chrome**, covering every numeric field's min/max/coercion, every permutation slot, default/random round trips, coordinates, ordering, names/entities/CDATA/whitespace, IDs, duplicate/unknown fields, embedded-hex ignoring, reserved-bit clearing and malformed/partial import behavior.
- Existing browser smoke checks pass for both dev and production preview, including name edits, exact hex, preserved bytes, reset, keyboard interaction, uniform scaling and content fit. No page errors or external requests were observed. Production smoke covers the UI; the native XML suite runs against the dev module in the same installed Chrome.
- TypeScript checks and Vite production build pass. Browser output is under ignored `web/test-results/` and the milestone's report snapshots under `evidence/phase2/`.
- All six SWF evidence checks pass. Every original Phase 1 input hash is retained and verified. Finder added `EXTRACTED-SWF/.DS_Store` between phases, before this implementation; a separate Phase 2 baseline protects the full current tree of **1,725 files** without rewriting the Phase 1 baseline. No files in SOURCE or EXTRACTED-SWF were changed, added or removed during Phase 2.

### Outstanding issues and scope limits

- Original Flash/AIR execution was not used as a differential oracle. Behavior is source/language-derived, with native Chrome verification. Firefox/WebKit and original-runtime reference capture remain later release checks.
- General E4X syntax, custom XML parser settings and exotic namespaces are not certified. Internal DTD subsets and complex element-valued name/creator content are explicitly rejected as outside verified Mii XML instead of silently approximated. Original exported DTD/style declarations remain inert metadata. XML pretty-print/self-closing syntax is semantically compatible, not a byte-for-byte E4X claim.
- No broad permissive-import cleanup, ID-padding correction, reserved-bit restoration from XML or transactional rollback was introduced. Such changes require a separately documented decision.
- The project is **not a Git repository** (including parent directories); no repository was initialized, restructured or committed.

### Stop point and next milestone

At the Phase 2 handoff, work stopped here as requested. The user subsequently approved Phase 3A (section 9). The data layer was ready to support Phase 3 with decoded values, exact feature-frame mapping, normalized field percentages, names/IDs, codecs and deterministic test fixtures.

Next priority is Phase 3: render an actual Mii in the browser from the recovered original vector graphics and display-list origins. Begin with the renderer proof, then validate palettes/color transforms, nested part alignment, layer order, head offsets, hair mirroring and body geometry against original evidence. No Phase 3 rendering work has been started in this milestone.


## 9. Phase 3A completed — character rendering proof (historical handoff)

The user approved the default-head proof only. The browser now displays the original default Mii head using the actual extracted vectors, with original data and placement evidence. Phase 1 name editing/hex display and the Phase 2 data layer remain intact. No model implementation, dependency versions, source assets or original SWFs were replaced.

### Rendering foundation and scope

- Examined `MiiCharacterGraphics.as`, `MiiBody.as`, the head/feature asset classes and the recovered root/nested display lists. The feature timelines are state/frame selections, not animation loops.
- `web/scripts/generate-character-assets.mjs` verifies original SWF/SVG hashes, extracts 19 geometric ranges, six source palettes, head offsets and stage metadata, and produces a compact typed catalog. Build/dev regenerate; tests detect stale output.
- The proof catalog contains **28 original symbols** (19 sprite timelines and **nine original vector shapes**) and draws **12 shape instances** for the default head. Those shapes are 1, 57, 139, 158, 170, 244, 268, 349 and 360. Front/back hair and brows are included so the original default is recognizable.
- The catalog includes frame 1 and every originally blank frame of its included timelines. Other nonblank frames are explicitly outside Phase 3A. Missing/unsupported/cyclic dependencies fail with explicit errors; no generic face, image fallback or fake blank is substituted.
- `web/src/render/headScene.ts` constructs a pure scene graph from the existing Phase 2 model, selecting frames through the exact original permutations. It retains source depth slots, names, offsets, nesting, bounds, default blank layers and original sequential layer reordering.
- `render/geometry.ts` implements affine/world transforms and DisplayObject-like scale/rotation updates preserving original skew/reflection. It retains the slightly different head X/Y root scales, nose-skin scale, face scale, nose X=0.05, mouth X=−0.15 and original source origins. A naive rotate/scale from identity would invert the left eye incorrectly.
- `render/svgRenderer.ts` imports original paths/gradients with source-local registration: it inverts the FFDec export-box translation exactly and namespaces paint-server IDs. It does not center images approximately or alter the underlying paths. Root stage dimensions are retained as metadata; no extra stage-rectangle mask is invented around the loaded character.
- Source clipping is driven by recovered clipDepth metadata. The default head has no such masks. The foundation's filled-path stencil handling is pixel-tested, including clipDepth termination. Stroke-only masks and unsupported filters/blend modes fail explicitly for future implementation.
- `render/color.ts` preserves affine RGB/alpha multiplier/offset arithmetic, color concatenation and source mouth-color attenuation. SVG filters explicitly use sRGB with offsets divided by 255, preserving gradients and negative multipliers instead of flattening them to CSS fills.
- The existing 640 × 500 preview now contains the head and the original name/hex controls. The head viewport shows source `(0,0)–(300,280)` from the original 300 × 600 character coordinates. Whole-application uniform scaling is retained. This proof layout is not presented as the original editor UI.

### Development diagnostics and screenshots

Open `web/dev.sh` then `http://127.0.0.1:5173/`. The development-only **Alignment diagnostics (development)** checkbox, or `?diagnostics=1`, overlays source part bounds, registration crosses and coordinate origins. Production builds omit the checkbox and overlay, including when the query parameter is present.

Recorded actual browser screenshots under `evidence/phase3a/screenshots/`:

- `default-head-preview.png` and `default-head.png`: working application and head viewport.
- `diagnostic-head-preview.png` and `diagnostic-head.png`: source-alignment diagnostics.
- `production-head-preview.png` and `production-head.png`: production rendering without diagnostics.
- `default-head-native.png`: native-coordinate viewport used for comparison.

`evidence/phase3a/source-map.json` records provenance, selected timelines/blank frames, shape origins and the extracted rules. `web/RENDERING_PROOF.md` explains implementation boundaries, reproduction commands and the Phase 3B handoff.

### Original-runtime reference and visual comparison

The unmodified original application successfully executed in a temporary **Ruffle 0.7.1 canvas** harness. Its General and head-editing screens were captured as `evidence/phase3a/reference/original-ruffle.png` and `original-ruffle-head.png`. Original files were served read-only and external requests blocked. Ruffle is not included as an application dependency.

This is an emulator reference, **not Adobe Flash pixel-parity certification**. No Adobe Flash runtime was executed. Font fallback and Security/Loader stub warnings are retained in the reference log; do not treat the emulator as an infallible original-renderer oracle.

`head-comparison-ruffle.png` compares source-coordinate-aligned head crops and amplified interior RGB differences. Alignment is derived from the recovered GUI transform `(116,130)`, loader X=−150 and head-page scale=1; no best-fit registration or silhouette centering was used. The masked comparison is descriptive and excludes bright/background/edge pixels, so it is not a whole-head parity score. See `coordinate-comparison.json` for current measurements and the exact ROI/mask.

Unresolved visual precision differences include browser/emulator antialiasing and pixel-grid placement, dynamic float/twip precision, original color-transform quantization and rounded extracted SVG gradient matrices. The SVG image agrees closely with the runtime reference, but pixel-perfect compatibility is not claimed.

`tools/capture-original-reference.mjs` reproduces reference capture with a separately unpacked Ruffle runtime. `tools/compare-head-reference.py` reproduces the coordinate-aligned comparison (Pillow is only an offline evidence-tool requirement).

### Verification results

- **199 unit tests pass**: the original 189 data tests plus ten rendering tests for source-rule extraction, source placements/origins, default asset/frame selection, exact transform equations, reflection, field mappings, source layer order, blank/missing/out-of-proof/cyclic cases, palettes and affine bounds.
- **62 native-browser XML cases still pass**. Existing name edits, byte preservation, exact hex, reset, keyboard interaction and uniform-scaling checks pass.
- Chrome dev and production rendering checks pass: twelve original shape instances, default blank layers, no body represented as complete, byte-identical head screenshot before/after a name edit, and production diagnostic exclusion.
- Native SVG pixel checks verify skin palette 0 produces `[235,205,187,255]` on an original black shape; stencil pixels are opaque inside and transparent outside, clipDepth ends correctly, and multiple SVG instances have unique IDs.
- TypeScript checks and production build pass. The compact production JavaScript is approximately 42.5 kB (13.1 kB gzip); the Ruffle harness and original SWFs are not application dependencies/bundle contents.
- All six original SWF evidence/integrity checks pass. All **1,725 files in SOURCE/ and EXTRACTED-SWF/** match the milestone-start hashes. No dependency was added. The project remains outside Git; no repository was initialized.

### Stop point and recommendations for Phase 3B

Phase 3A is complete; stop here. The actual default head is visible using original geometry, colors, frame mappings and recovered registration information.

Next, expand and verify nonblank head variants, then add the original body/limbs/shadow and height/weight/footing logic. Implement original blur/filter/accessory cases as their assets require, maintain source layer order and mirrored transformations, and validate each newly supported frame/palette against original geometry and runtime references. Keep diagnostics and broaden browser/runtime comparison coverage before exposing the full editor controls. Full editor UI, local file dialogs, share links/persistence and tutorial remain outside this proof; tutorial stays deferred.


## 10. Local Git baseline and Phase 3B completed — November 5, 2026 (historical handoff)

### Git setup

Git 2.54.0 was available; the project had no repository. Initialized local branch `main` in the existing project directory and used the user's existing Git identity unchanged. Reviewed the staged 1,795 files (about 28.4 MB), checked for credential filenames and secret patterns, and retained protected originals, source, lockfile, recovery manifests/raw XML and selected reproducibility evidence. Dependencies, build output, caches, temporary files, OS metadata and unselected browser artifacts are ignored. Initial commit **`b9b362e` — `chore: establish completed Phase 3A baseline`** represents the completed prior milestone. No remote, GitHub repository, push or upload was created.

### Complete renderer

- Continued the existing TypeScript/Vite/SVG architecture and unchanged Phase 2 model. Expanded the read-only asset generator from 28 to **385 reachable original symbols**, including **30 timelines / 355 original vector shapes**, with all frames and intentional blanks. It verifies original SWF/SVG hashes and extracts body ranges, anchors and colors directly from `MiiBody.as`.
- Supports all eight head shapes, 72 hairstyles (front/back/hat selection), 24 brows, 48 eyes, 12 noses, 24 mouths, nine glasses, four mustache states, four beard states, twelve facial-feature families per head, moles, hair parting, original palettes, shaded-glasses exceptions and multiply features. Frame selection uses the original Phase 2 permutations. No artwork was invented or replaced with raster approximations.
- Ports body, arms, hands, pants, legs, feet, torso gender frames, height/weight ratios, six original joint anchors, neck Y=220 and global footing. Arms use height/width scaling; hands and feet use width/width. Root/nested matrices, mirroring, small registration offsets and original depth order are retained. Pants → shadow → shirt is preserved even though the shadow layering is unusual. Shirt tint includes hands as authored; pants preserve normal/special-gold/foreign-blue ID behavior.
- Implements source shadow alpha 179/256 and 25 × 15 single-pass centered box blur via SVG separable convolution. This follows the original filter metadata and SWF specification, without substituting a Gaussian. No clipDepth masks occur in the complete recovered character; the generic filled-path clipping support remains tested.
- Found two FFDec export issues during exhaustive browser parsing: shapes 162 and 217 include FFDec attributes and promote a one-twip stroke to one pixel. Generated markup restores source width 0.05 after checking the original SWF line style, removes only export metadata, and preserves the original red color/path. Protected extracted files are untouched. This is an evidence-backed export correction, not a change to original behavior.
- Keeps `buildHeadScene()` and adds `buildCharacterScene()` on the same pure scene graph. Full view shows source camera `(-20,0,340,640)` to leave room around the authored 300 × 600 coordinates; head view remains `(0,0,300,280)`. Camera changes do not recenter individual parts or invent clipping.
- Existing name, exact hex and reset functionality remains. Full/head selector, eight reference presets and all 45 numeric attribute controls form a clearly labeled **renderer test bench**, below the uniformly scaled 640 × 500 preview. They are working test tools, not the finished original editor UI. Name edits preserve every unrelated byte of the current selected character. Development-only source bounds/origins/registration diagnostics cover the complete body and remain excluded from production.

### Tests and actual browser evidence

- **216 unit tests pass**, including the original 189 data cases and ten broadened Phase 3A rendering cases. Seventeen additional tests check original body constants, min/mid/max height/weight joint equations and neck/footing, width-scaled feet, gender, exact ID boundaries, all favorite/tint palettes, layers, source shadow metadata, blur kernels and independently packed representative fixtures.
- Every legal numeric value can construct a finite scene. Additional 8 × 12 facial-feature and 8 × 4 beard combinations reach **every frame of all 30 original sprite timelines**, including blank states.
- Native Chrome development checks instantiate **992 scenes covering all 355 shapes**, parse every original SVG definition, exercise actual preset/attribute controls and verify full-body/head pixel invariance after name edits. Native SVG pixels verify sRGB tint, filled masks/clip termination, unique instance IDs and the centered box filter's support/plateau. **62 browser XML compatibility cases still pass**.
- Development and production browser checks pass for all eight complete fixtures, original name/hex/reset/keyboard behavior, layout fit at desktop/narrow widths, uniform 640 × 500 scaling, and diagnostic exclusion in production. Both report no page errors or external requests.
- TypeScript and production build pass. The full original-vector bundle is approximately **596 kB / 135 kB gzip**. Vite emits its standard chunk-size warning above 500 kB; this is documented rather than hidden. No dependency was added. Original vectors remain inline/static and no Flash/AIR/PHP/backend/Ruffle is required by the app.
- All six original SWF evidence checks pass. All **1,725 protected files in SOURCE/ and EXTRACTED-SWF/** match the milestone-start hashes; no protected file was added, modified or removed.

### Ruffle comparison and remaining visual differences

The unmodified original executable SWFs ran successfully in **Ruffle 0.7.1, canvas renderer**, for eight independently packed reference fixtures. Cases cover all eight heads, masculine/feminine torsos, min/max height and weight, normal/gold/blue pants, tinted/shaded glasses, facial hair, mole, hair mirroring, hat color and layer-threshold extremes. Both native and **2× pixel-density** screenshots were captured; head-tab images provide additional original feature evidence. External requests were blocked; font fallback and Security/Loader warnings remain in logs. Ruffle is a temporary reference tool only.

Source-aligned comparisons use the recovered General-page camera: scale .53, graphicsContainer X=116, loader X=−150 and footing Y=405. No image best-fit registration was used. Opaque-interior mean absolute differences per RGB channel range about **0.62–1.66 / 255 at native density** and **0.39–1.18 / 255 at 2×**, across these cases. These are descriptive measurements, not a parity threshold: the mask excludes edges, translucent lenses, shadow and the original File button's overlap with shoes. Full screenshots and amplified difference galleries must also be inspected.

Remaining precision limits are browser/emulator antialiasing, twip/float and pixel-grid rounding, color-transform quantization, extracted gradient precision, minimum-width stroke rasterization and shadow/subpixel filtering. The original GUI obscures part of the shoes/shadow, so that region lacks an independent unobscured original-app visual comparison; its source placement/alpha/kernel are tested. All source frames are covered structurally and in native SVG parsing, but every combined appearance has not been visually certified. Firefox/WebKit and an Adobe Flash runtime have not been tested. **Pixel-perfect Adobe Flash compatibility is not claimed.** No artistic compensation or silent source-behavior correction was introduced.

### Review artifacts and reproduction

See `evidence/phase3b/README.md`, `source-map.json`, screenshot/report snapshots, `character-comparison-ruffle.png` / `character-comparison-ruffle@2x.png`, corresponding coordinate-comparison JSON, and `reference/` / `reference2x/` original screenshots/logs. `web/RENDERING_PROOF.md` documents rendering behavior, source/export issues, limitations and reproduction. `tools/generate-render-cases.py` generates fixtures from independent recovered schema arithmetic; reference/comparison tools accept explicit local input/output paths.

Launch from `web/` with `./dev.sh`, open `http://127.0.0.1:5173/`, and use Reference character, Character view and the renderer test controls. Try `?case=hat`, `?case=accessories`, `?case=maximum`, or `?case=compact&diagnostics=1` in development. Phase 3B is complete and work stops here. The next recommended milestone is Phase 4: faithfully reconstruct the original editor screens and browser persistence using this renderer. Local file dialogs/export remain later work and tutorial stays deferred. No full editor-interface or persistence implementation is claimed by this renderer milestone.


## 11. Phase 4A completed — original editor interface reconstruction (historical handoff)

### Baseline and scope

Confirmed the existing local Git history and clean working tree before implementation. Phase 3B was already committed as **`46ce78a`**; no duplicate baseline commit, remote or upload was created. Continued the established TypeScript/Vite/SVG architecture and unchanged data/character-rendering layers. No dependency was added.

The main application now shows the original-style **640 × 500** interface, replacing the temporary test layout. All **nine top-level tabs and 13 original editing screens** are reconstructed from source frame labels and display lists: General, Size, Head, Facial Features, Hair, Eyebrows, Eyes, Nose, Mouth, Glasses, Mustache, Mole and Beard. Head/Facial Features and accessory sub-tabs preserve the original navigation structure. Navigation changes the screen without changing character bytes.

### Evidence recovery and graphics

- Examined `ClassicGUI.as`, `AbstractGUIPage.as`, General/Head and all category declarations, Tab/NavigationButton/AbstractHoverHilite/SliderHandle classes, the executable `classicGUI.swf`, and recovered root/nested manifests.
- New read-only `generate-gui-assets.mjs` verifies GUI SWF/SVG hashes and records source-class hashes. It generates **348 symbols: 305 shapes (288 extracted vector shapes plus 17 original static-text definitions) and 43 timelines**, 13 screen display lists and six original scale grids. All layout graphics, category icons, panels, fields, selection indicators and foreground elements use original source geometry. No warning-obscured frame PNG or invented background/button artwork is used.
- Static labels use **original DefineFont3 glyph curves**, explicit glyph indices/advances, baselines and text matrices, rather than approximate HTML text. Editable fields and page counters use browser Arial/Helvetica/sans-serif at original bounds/heights/colors. Their original device face lacks embedded glyphs; exact face/weight/metrics remain unverified and are documented substitutions. Ruffle logs contain unknown Arial/Noto Sans bold font warnings.
- `guiScene.ts` constructs pure screen graphs, original icon pages and selection symbols in controller child order. The existing model supplies frame permutations, values, palette transforms and serialized data. Character placement retains source graphics-container depth, loader X=−150, head-page `(116,130)` / scale=1 and General/Size scale=.53 with dynamic footing at GUI Y=405.
- Original nine-slice grids preserve fixed corner/edge behavior; an internal half-pixel clip overlap avoids browser stitching seams without replacing paths or outer silhouettes. Narrow fields use center collapse/cap reduction when opposing caps exceed the destination size. This edge case and general grid fidelity remain subject to an Adobe Flash reference.
- Source LargeButton/ControlButton/NavigationButton hover/press use exact **+20/−20 RGB offsets**, alpha retained, including release outside a button. No invented hover artwork is added to source classes that did not define it. Selected tabs/items/colors use original vectors.

### Working interactions and explicit deferrals

- **General:** name and creator (10 UTF-16 units), gender, mingle, birthday day/month, Mii ID, Wii ID, all 12 favorite colors and the original randomizer are functional. Existing permissive ID handling, field clamping, source codec behavior and randomization are reused. Supported controls update the character immediately where they affect appearance; unrelated binary data is preserved.
- **Head:** all eight original shapes and six skin colors are functional, using the existing field/frame mapping and original tile/well highlights. Changes update actual source head frames and SVG skin transforms immediately.
- Other category screens reproduce current original icons, palettes, selections, option graphics, paging text and Size handle positions. Their selectors, sliders, paging and option adjustments are **disabled**, with visible scope/status text below the stage, unavailable cursors/tooltips and `aria-disabled`. They are appearance previews, not falsely completed editing controls. File remains an explicitly unavailable original button.
- No file import/export dialog or browser persistence was added. Changes are in memory. The original footer legend is retained, but its read-only field displays actual character hex rather than a fake working share URL; URL sharing is deferred and this difference is stated in the UI/docs.
- The previous renderer application is retained at **`/diagnostics.html` in development**, with its full feature test bench, name/hex preview and alignment overlays. It is excluded from the shipped production `dist/`. Production regression tests compile a separate ignored test-only fixture; this does not expose the test bench in the production application.

### Verification results

- **223 unit tests pass:** all previous 216 plus seven GUI tests covering source frame/placement equality, reachable symbols/origins/static glyph paths, icon/selection order, palettes/status frames, camera/footing, nine-slice grids and controller-derived item/page declarations.
- Existing browser regressions remain: **992 source scenes / all 355 character shapes**, original color/mask/box-blur pixel tests, head/full-body name pixel invariance, preset/attribute interactions and **62 XML compatibility cases**. Existing development and separate production-mode renderer checks pass.
- New native Chrome GUI checks pass in development and production: navigation among all 13 screens at **native and 2× density**, exact byte/bit isolation for supported fields and selections, current head/torso frame and tint updates, state retained across screens, keyboard activation, hover/press/release, disabled controls, uniform scaling and production diagnostic exclusion. No page errors or external requests were observed.
- TypeScript and production build pass. The full GUI/character/glyph JavaScript is approximately **1.13 MB / 236 kB gzip**; Vite's standard 500 kB chunk-size warning is documented rather than hidden. No dependency/lockfile versions were changed.
- All six SWF evidence checks pass. All **1,725 protected files in SOURCE/ and EXTRACTED-SWF/** match milestone-start hashes, including ignored OS metadata. No protected file was added, changed or removed.

### Visual comparison and unresolved differences

Captured all **13 unmodified original GUI screens in Ruffle 0.7.1 canvas at native and 2× pixel density**. Actual browser stage screenshots use the same source coordinates without fitted image registration. Comparison galleries and descriptive RGB measurements include panel/device-font/rasterization differences; only the legacy footer is excluded from the numerical ROI because its behavior is intentionally deferred. These measurements are not a parity threshold.

The reconstructed nine-slice panels differ in curvature/border treatment from Ruffle, particularly tall selection panels and narrow fields. A second capture with Ruffle's **wgpu-webgl** backend confirms this difference is not confined to canvas. The implementation retains recovered grid metadata and its documented interpretation; it does not reshape artwork to hide the discrepancy. Exact Flash grid/cap behavior and source non-scaling strokes need an Adobe Flash reference before either result can be certified. Editable device-font/page-counter metrics, gradient precision, hairline strokes, fractional placement, color quantization and browser/emulator antialiasing also remain visual precision limits. **Pixel-perfect Adobe Flash parity is not claimed**, and other browser engines remain unverified.

See `web/GUI_RECONSTRUCTION.md` and `evidence/phase4a/README.md` for implementation boundaries and reproduction. Selected review artifacts include `screenshots/basic.png`, `screenshots/face.png`, all 13 `@2x` counterparts, `gui-comparison.png`, `gui-comparison@2x.png`, coordinate-comparison JSON, source map, original runtime logs and protected-input verification.

### Stop point and Phase 4B tasks

Phase 4A is complete and work stops here. Open `web/dev.sh` then `http://127.0.0.1:5173/` for the original-style editor; use top tabs and sub-tabs, with General and Head editing enabled. The development-only renderer test bench is `http://127.0.0.1:5173/diagnostics.html`.

Phase 4B should implement the remaining category selectors and page navigation, original feature option adjustments and limits, hair parting, Size sliders/dragging, and browser-based persistence with a separately characterized storage contract. Resolve the documented scale-grid/non-scaling-stroke/device-font questions, extend edited-state reference comparisons, and verify Firefox/WebKit. Keep existing binary behavior and source graphics. File dialogs/import/export remain later work; tutorial remains deferred. Do not treat disabled Phase 4A category controls, saving or sharing as completed features.


## 12. Phase 4B completed — all editor interactions and browser persistence

### Baseline and architecture

Confirmed a clean local working tree and existing Phase 4A commit **`2fa7104`** before implementation; no duplicate milestone, remote, push or upload was created. Retained the established TypeScript/Vite/SVG architecture, original graphics/manifests, Phase 2 binary/hex/XML model and complete character renderer. No dependency or lockfile version was changed.

New `gui/editorSession.ts` owns category/page state and routes original item, palette, toggle and option actions to the existing model. The visible page is independent of the selected feature: browsing changes no binary data, highlights appear only on the selected feature's page, page boundaries do not wrap, and category entry returns to the selected feature's original permutation page. `guiScene.ts` now accepts that page explicitly while retaining its prior default API.

### Complete interactions

All 13 screens now work. General retains name, creator, gender, birthday, mingle, IDs, favorite colors and randomization. Size implements height/weight dragging. Head and Facial Features supply 8/12 choices and skin colors. Hair has all 72 styles across six pages, eight colors and mirroring. Eyebrows have 24 styles/two pages, eight colors and X/Y/size/rotation. Eyes have 48 styles/four pages, six colors and X/Y/size/rotation. Nose has 12 styles and Y/size. Mouth has 24 styles/two pages, three colors and Y/size. Glasses have nine styles, six colors and Y/size. Mustache has four states, eight shared facial-hair colors and Y/size. Mole has both states and X/Y/size. Beard has four states and the same facial-hair color field as mustache. All 45 numeric attributes are represented by their original controls, alongside names/IDs.

All field names, palette ownership, item/page counts and option declarations were checked against the original category controllers, `ClassicGUI.as` and `AbstractGUIPage.as`. Selections reuse original one-based frame/permutation mapping; options apply +/-1 and existing source clamping. Existing graphics, green highlights, zoom, registration, nesting and layer order remain. Original page/option buttons retain their artwork and bounded/no-op behavior; no invented disabled state is added at a numeric/page boundary. File is the sole still-unavailable interface button, clearly deferred to Phase 5.

`gui/slider.ts` retains source X=301–528, span 227, noncentral grab offset, continuous thumb position and `int(127 * percent)`. It converts browser coordinates through the inverse SVG screen matrix under uniform scaling, uses native pointer capture, and cleans up on release, cancel, lost capture or category teardown. The captured thumb stays in the DOM while the character/share/storage update. Button keyboard activation uses Enter/Space; sliders add accessible arrows (+/-1), Home/End and Page Up/Down (+/-10). These keyboard/touch protections are intentional browser accessibility extensions, without new artwork.

### Saving, startup and sharing

`storage/browserPersistence.ts` defines **`mii-editor.character.v1`**: one canonical 148-character lowercase hex string / 74 original bytes, without a JSON envelope or format changes. Validation checks exact hex length/syntax and all original numeric ranges; unknown/reserved bits and complex fields remain intact. Strict transport validation is separate from unchanged permissive legacy codec APIs.

Startup is **original default → valid saved browser Mii → valid single `?mii=` parameter**. Resolution completes before any hydration write; only the final valid URL import is saved at initialization, so old local data cannot overwrite it. Saved/default startup does not write solely because the page opened. Malformed, empty, duplicated or out-of-range URL values and invalid saved data fall back gracefully with visible status. Invalid stored content is left untouched until a real valid edit replaces it. Storage getter/read/write errors do not prevent editing or valid URL import; the UI reports actual storage unavailability.

Every real valid mutation, including Size, immediately saves through localStorage. Navigation, browsing and no-op clamping do not save. The original footer now supplies a working current-application share URL, preserving other query parameters/fragment and containing exactly one current Mii payload. Opening it restores the binary ahead of local data. Editing an opened share also replaces its address-bar parameter, preserving latest edits on normal refresh. The current footer URL remains available even if storage fails. No backend, historical server, Clipboard API, automatic upload or external navigation is required.

The detailed contract is `web/STORAGE_CONTRACT.md`, including origin scope, validation, cross-tab last-writer policy and History API fallback. No multi-character library or automatic SharedObject migration is claimed.

### Characterized legacy inconsistencies and intentional changes

Original `LocalSharedStorage.as` stores `localMiis.data.miiArray`, wrapping a single value in an array and flushing. It catches errors but the GUI ignores its return value. Original startup accepts truthy saved/URL data through permissive decoding. Strict validation and user-visible storage status are intentional modern transport behavior; the underlying codecs were not changed.

`ClassicGUI.updateURLText()` also saves, and most handlers/category entries call it. **Original Size changes update the character without calling it**, so URL/storage can lag until a later action. The browser intentionally saves all valid edits consistently. It does not reproduce stale Size saves.

Original Size reads both floating-point thumb positions on every drag. The source expression `int(127 * ((301 + 227 * value/127 - 301)/227))` can decrement some untouched integer values through truncation. The browser preserves the formula for the actively edited dimension while keeping the other dimension's bytes intact; navigation never re-quantizes either field. The exhaustive 0–127 characterization is `evidence/phase4b/legacy-slider-rounding.json`. This is an explicitly documented correction required by unrelated-field preservation, not a silent compatibility change.

### Automated verification

- **242 unit tests pass**, including all previous 223, source declarations/permutations, every tile/page/palette, source option families and limits, off-page highlights, shared colors, mirroring, reserved-bit sentinels, slider math, keyboard behavior and strict storage/URL contract cases.
- Existing **62 native-browser XML cases**, **992 rendering scenes / all 355 original character shapes**, tint/mask/box-blur pixels and previous dev/production renderer regressions still pass. The development-only diagnostic application remains separate; normal production output excludes it.
- Native Chrome development and production GUI checks cover all 13 screens at native/2× density. New suites verify **219 original feature selections**, **59 category palette choices** (plus General's 12 in prior GUI checks), **584 adjustment actions** across declared limits, exact whole-binary isolation, page boundaries and selections. Physical pointer hits verify each distinct option family and representative tiles/wells/pages; exhaustive actions also exercise real DOM listeners directly.
- Both Size sliders pass keyboard, real mouse dragging, noncentral grab, narrow-screen coordinate scaling, pointer capture, outside release, cancel and untouched-dimension preservation checks. Native Chromium touch emulation verifies captured dragging, outside release and cancellation. This is not physical-device certification.
- Saved data is checked and reloaded after each edited category. Shared URLs override older data, save only the final import, preserve the full binary and follow subsequent edits on refresh. Missing/corrupt/out-of-range saved values, malformed/duplicate URL input, and storage getter/read/write failures remain usable. No page errors or external application requests were observed.
- TypeScript, production build and all six original SWF recovery/integrity checks pass. The complete bundle remains about **1.14 MB / 238 kB gzip** with Vite's existing large-chunk warning. All **1,725 protected SOURCE/ and EXTRACTED-SWF/ files** match the milestone-start file set and hashes.
- Firefox and WebKit Playwright runtime executables are **not installed** here. Their paths/availability are recorded; neither engine is certified. Runnable new-suite commands are provided for installed environments. No speculative cross-engine success is claimed.

### Visual review and remaining precision limits

Captured the exact edited binary from all **11 feature screens**, including last pages, palette extremes, mirroring and adjustment extremes. The same bytes were loaded into unmodified original SWFs running in Ruffle 0.7.1 canvas and captured at native and **2× density**. Source-aligned browser/reference galleries and descriptive RGB measurements use no fitted registration or invented parity threshold. Reference transition settling was lengthened to avoid capturing a submenu before its listeners/timeline were ready. Existing Phase 3B/4A evidence retains representative body-size and original General/Size references.

The requested stroke review confirms `noHScaleFlag=false` and `noVScaleFlag=false` on examined panel LINESTYLE2 records. Forcing non-scaling strokes would contradict this evidence, so it was not introduced. The original device face still has zero embedded glyphs; browser Arial/sans-serif remains a documented substitute for editable fields/page counters, while static labels retain recovered glyph paths. Source nine-slice grids remain unchanged. Panel curvature/border/gradient, font metrics, hairlines, rounding and browser/emulator antialiasing remain visual precision limits. No speculative visual changes were made solely to fit Ruffle. No Adobe Flash runtime was executed and **pixel-perfect compatibility is not claimed**.

### Artifacts, launch and stop point

See `web/EDITOR_INTERACTIONS.md`, `web/STORAGE_CONTRACT.md` and `evidence/phase4b/README.md`. The evidence includes matching edited cases, native/2× screenshots, original runtime logs, comparison galleries/ROIs, full dev/production reports, source stroke/font review, slider-rounding characterization and browser availability.

From `web/`, run `./dev.sh` and open `http://127.0.0.1:5173/`. All original editing tabs/sub-tabs now work; copy the Mii URL field to share. Development renderer diagnostics remain `/diagnostics.html`. Work stops after Phase 4B. **Phase 5** remains file/binary/XML dialogs and PNG/JPEG export; tutorial stays deferred. Firefox/WebKit/physical-device and exact Adobe Flash visual parity checks remain release work. No file/image export UI, remote repository or upload was implemented in this milestone.

## 13. Phase 5A completed — original File interface and local Mii/XML operations

Verified clean Phase 4B baseline **6ef4784**. Existing architecture, codecs, renderer and dependency versions are retained. FileOptions.as/ScrollBar.as and recovered sprite 352 frames 2/3 drive the Files/XML overlay at source depth 156. Eighteen original symbols, placements and source hashes were recovered. The glyph generator now respects the original X glyph's implicit initial origin. Source preview dimensions/centering, scroll coordinates and Save-current-model versus Back-applies-draft behavior are retained. Image export stays disabled for Phase 5B.

Local .mii import validates exactly 74 bytes and original ranges; export retains all reserved bits and Unicode names. XML reuses the existing codec with a fresh candidate and transactional commit. Failed/cancelled imports preserve the active character. Successful explicit imports update selected controls, preview, persistence and sharing, including identical-byte imports. Late asynchronous reads cannot overwrite the character after closing/navigating away.

Documented intentional differences: unchanged XML viewing avoids lossy reapplication; edited/imported XML validates before committing instead of partially mutating active data. XML remains lossy for unused bits and ignores embedded hex. The user boundary requires UTF-8 files, 1 MiB XML limit, case-insensitive extensions, valid XML characters and strict postdecode ranges. External header metadata is inert in the view and stripped before parsing; entities/internal DTDs are rejected. Downloads omit remote DTD/stylesheet headers while retaining original codec body/order. Browser focus/keyboard/cancel/download mechanisms replace Flash/PHP services.

Verification: **251 unit tests**, all prior XML/rendering/GUI/interaction/browser persistence suites, development and production file tests, TypeScript, production build and six Python recovery tests pass. New checks cover binary exactness/unknown bits, malformed files, cancellation/stale reads, Unicode/repeated downloads, XML edit/apply/cancel, unsafe declarations, current-character preservation, save-current behavior, persistence/share/refresh and offline operation. Existing large-chunk warning remains; no dependency was added. All **1,725 protected SOURCE/ and EXTRACTED-SWF/ files** retain their hashes. Firefox/WebKit executables are unavailable and not certified.

Matching-default native/2× captures compare against unmodified SWFs in Ruffle 0.7.1 wgpu-webgl; canvas fails this File preview and its failed attempt is recorded separately. Original PHP alert dismissal required no source modification or service stub. Comparisons use source coordinates without fitted registration or parity threshold. XML device-font/line metrics (no embedded _typewriter glyphs), bitmap versus SVG rasterization, existing nine-slice/stroke/gradient precision and antialiasing remain differences. Version labeling/current share origin are intentional. No Adobe Flash or pixel-perfect certification is claimed.

See web/FILE_OPERATIONS.md, web/STORAGE_CONTRACT.md and evidence/phase5a/README.md. Launch web/dev.sh and open http://127.0.0.1:5173/; File exposes Load/Save Mii/XML. Work stops after Phase 5A. Phase 5B remains original PNG/JPEG page reconstruction and sizing/rendering/download behavior, with image-specific tests. Tutorial and cross-engine/Adobe visual certification remain deferred. No remote or upload was created.

## 14. Post-Phase-5A randomized .mii compatibility investigation

Baseline 44fe472 was clean apart from the user's new random-mii-testing/ folder. All seven provided files are authentic 74-byte records and remain unchanged. An independent MSB-first decoder, all-field comparison table and isolated unmodified MiiJS 3.1.1 run reproduce four successes and three failures. **The RCD failures are solely moleSize 9/11/14, beyond Wii's 0–8 limit.** The additional reported eyebrow/month errors come from separate DS NCD detection attempts: the actual Wii values are eyebrowSize 5/0/2, eyebrowY 9/7/3 and birthMonth 10/1/11. Larger-format length diagnostics are unrelated.

No TypeScript randomization, bit-packing or export defect was found. Original ActionScript defines moleSize with four bits and no explicit maximum, so MiiDataValue uses 15. Eyebrow size, eyebrow Y and month have explicit correct Wii bounds. The prior 0–15 assessment correctly described Flash behavior, but did not establish Nintendo compatibility. Source omission versus design intent is unknown. Both SWF extractions have identical relevant source. In 10,000 deterministic cases every output matches an independently source-parsed arithmetic oracle byte-for-byte; MiiJS rejects 4,386 solely for mole size. The unmodified SWF in Ruffle generates the same nonstandard range (24 recovered records, 13 above 8, including 15). Source evidence and emulator evidence are recorded separately.

The least intrusive remedy is a **nonblocking read-only export warning** in the existing status area. The faithful randomizer, model, UI artwork, file bytes, storage and XML behavior remain unchanged. No clamp, normalization, alternate mode, output format or production dependency was added. Actual downloads of all samples and randomized models exactly match their current in-memory 74 bytes. All three temporary mole-only edited copies pass MiiJS, while the originals are preserved as regression failures. Source-compatible imports continue to allow them.

Hardware checks remain distinct. Inspected RFL VERSION_RSPE01_01 rejects temporary IDs on NAND, requires special IDs to be local-only, checks nonzero eight-byte CreateID and calendar consistency. Deterministic results include 5,014 temporary IDs, 1,222 special/mingling conflicts and 1,196 calendar failures (overlapping). FAIL-3 has November 31 even though its month value is valid. The audit reports these cautions plus padding/wider-field concerns without changing bits. MiiJS scalar acceptance does not validate ownership, destination console/database, names/glyphs, uniqueness or container CRCs; no hardware certification is claimed. Open-source decoder/decompilation references are pinned, not described as an official published Nintendo specification.

Verification: **265 unit tests**, all prior development/production XML/rendering/GUI/interaction/file suites, new seven-sample/24-random-download browser checks per mode, TypeScript, build and six Python evidence tests pass. SOURCE/ and EXTRACTED-SWF/ and all supplied binary samples retain hashes. Firefox/WebKit runtimes remain unavailable. Permanent corpus, every-field tables, source hashes, exact independent diagnostics, Ruffle captures and reproduction tools are in random-mii-testing/, web/WII_COMPATIBILITY.md and evidence/randomization-compatibility/. Work stops after this investigation; **Phase 5B has not begun**. A future optional compatible randomizer requires an explicit ID/calendar/reserved-bit policy rather than silently replacing the original behavior.

## 15. Approved final product direction (supersedes earlier optional-mode recommendation)

The user clarified that the ultimate product must create Wii-compatible Miis by default, without a permanent compatibility-mode toggle. Finish Phase 5B and commit the thoroughly tested original-application reproduction baseline first. Preserve legacy fidelity tests and source evidence so subsequent corrections remain auditable. Only then implement Phase 6 standard Wii-compatible creation/editing/randomization, explicit non-destructive handling of incompatible imports and pre-export validation. Phase 7 requires physical hardware/game/destination evidence before certification. The earlier investigation's optional-mode suggestion is historical and is not the approved product direction. No compatibility corrections are authorized within Phase 5B itself.

## 16. Phase 5B completed — PNG/JPEG export and functional reproduction baseline

Verified local baseline 12ef560, then committed the user's revised roadmap as **652705a** before image work. Recovered original FileOptions frame 4, SizeSlider/ColorSlider logic, BitmapUtils centering and encoder quality 90. Added 25 original GUI symbols (391 total), all image placements and source text-shadow metadata. The original Export page now supports size/zoom text/sliders, RGB background text/sliders, body/background checkboxes, JPEG/PNG selection, preview panning and browser Blob downloads. Original artwork, registration, transforms and one-based frames remain; no whole-screen PNG or new artwork was introduced.

Defaults remain JPEG, 50 pixels, zoom 25, E3F3EF and body/background enabled. Size 10–800, zoom 0–100, vertical Y -171..0, RGB X -115.5..115.5 and original integer coercions/rounding are preserved. A 250-pixel local preview has parent width 250.01907348632812; output scale/pan use that actual source width. Hidden body bounds still contribute to centering, confirmed against Ruffle: Body off does not center the head anew. Fractional size values still scale with the fraction while BitmapData dimensions truncate and displayed text rounds. Background empty/partial text and PNG/JPEG background-enable semantics are characterized in web/IMAGE_EXPORT.md. These behaviors are deliberately retained in the reproduction baseline.

The complete existing SVG character scene rasterizes into local Canvas with source masks, color transforms, multiply and body blur. Native PNG/JPEG encoding uses the original quality-90 target (0.9), without claiming Adobe JPGEncoder byte equivalence. Save snapshots image options/model, rejects unsupported/failed encoding, cancels late exports after leaving the page, and releases Blob URLs/canvas storage. Filenames reuse Unicode sanitization. Character bytes, source-compatible validation, randomization, storage and sharing are unchanged. No Wii generation corrections, backend, dependencies, remote or upload were added.

**Verification:** 272 unit tests, all previous XML/rendering/GUI/interaction/persistence/file/legacy-vs-RCD compatibility checks, new image-export suites in development and production, TypeScript/build and seven Python recovery/integrity tests pass. Real downloaded files are decoded to verify 10/50/800 sizes, MIME signatures, alpha/background pixels, body visibility and geometry; text bounds/coercion, all slider families, keyboard, source/native/scaled Pointer Events, release/cancel, panning, page state, snapshot/cancellation, Unicode/repeated offline downloads and resource cleanup are covered. Existing phase tests now recognize the implemented image page instead of asserting it is deferred; their data/fidelity expectations remain intact. Firefox/WebKit runtimes are unavailable and not certified; the existing bundle warning remains.

**Integrity exception recorded, not repaired:** all 1,718 actual application source/asset files match their initial hashes and exact file set. Four of seven ignored .DS_Store files changed during the session; implementation did not write or restore them. Before/after metadata is recorded in evidence/phase5b/integrity.json. The original integrity guard incorrectly treated mutable Finder metadata as immutable application content. It now excludes only exact .DS_Store basenames, with a specific regression test; no original manifest or protected content was changed.

Native/2× default, head-only and transparent-page captures compare exact source coordinates against unmodified SWFs in Ruffle 0.7.1 wgpu-webgl. The original connectivity alert was dismissed; no service was stubbed and no original encoded-image download was obtained. Source body blur is preserved despite Ruffle's different shadow rasterization. Device-font metrics, CSS approximation of the source text drop shadow, SVG versus bitmap antialiasing and browser versus Adobe JPEG encoding remain limits. No Adobe Flash pixel-perfect or physical Wii/game certification is claimed.

See web/IMAGE_EXPORT.md and evidence/phase5b/ for source maps, reference captures, decoded browser images, comparisons, integrity records and reports. Launch web/dev.sh, open http://127.0.0.1:5173/, then File → Export. This completes the approved functional reproduction scope, with incomplete tutorial and documented visual/engine limits still disclosed. Commit this baseline and stop. **Next is Phase 6: Wii-compatible generation/editing as the standard, no permanent mode toggle, explicit non-destructive correction of imported legacy data and pre-export validation.** Keep original fidelity and corrected compatibility tests separate; physical certification remains Phase 7. No Phase 6 changes were started here.


## 17. Phase 6 completed — default Wii software compatibility (November 5, 2026)

### Baseline gate and architecture

The existing Phase 5B reproduction commit `ebc0373` was already present and clean. Before compatibility implementation, the complete baseline passed 272 unit tests, seven Python recovery/integrity tests, TypeScript, production build, development and production browser suites. Evidence is in `evidence/phase6/baseline-verification.json` and baseline transcripts. Git remains local with no remote; no history was restructured.

The existing model/renderer, source vectors, mappings and file/image interface are retained. `web/src/compatibility/wiiProfile.ts` supplies shared creation/edit/repair/export validation; no new dependency or permanent legacy-mode toggle was added. The unchanged raw 37-word codec remains lossless/permissive. Original randomizer/controller behavior survives only in test-support modules, separate from production policy and the corrected tests.

### Rules and intentional corrections

`web/WII_PROFILE.md` lists all 45 numeric attributes, physical offsets/widths, the wider RFL fields, source classifications and every intentional deviation. Mole is now 0–8. Body bytes and high bits of known RFL fields are checked, rather than relying only on masked Flash getters. Birthday pairs are valid or unset; February 29 is supported because the format stores no year. The inspected RFL body maximum 128 differs from the conservative decoder/editor maximum 127; this is documented rather than invented as a universal Nintendo rule. Unknown padding/source flags are preserved with advisory warnings, not silently zeroed.

New defaults keep the recovered appearance but receive a new normal non-temporary ID and unknown/zero owner bytes. Random creates a fresh bounded record with valid dates, no inherited console identity and separate ID allocation. The new logical four-second ID sequence avoids in-session and sequential-origin reuse, but **does not guarantee cross-tab/global/destination uniqueness**. Separate browsers/origins can collide. No fake console owner is generated; imported owner halves survive corrections. The policy is software-valid, not a claim of real-console ownership or transferability. Existing valid specials remain special/local-only; temporary records require an explicitly reviewed conversion for the persistent profile.

Normal controls cannot create out-of-range data. Invalid calendar/ID/name drafts do not commit; full physical fields are edited without touching unrelated bits. Existing art transforms remain source-based, including the mole's original interpolation; control/preview use the same stored value. Two-digit ID display fixes the prior cosmetic byte-padding bug without rewriting the raw legacy codec.

### Imported data and export safety

Incompatible imports are staged with original/proposed previews, exact hex, problems and ordered before/after corrections. Cancel leaves the active character and its persistence unchanged. Explicit approval applies/revalidates the proposal. Unsupported original feature values are never approximately rendered; supported unresolved originals may be explicitly inspected read-only. Normal editing and Save Mii remain blocked until repair. Archival originals are clearly separate downloads with no compatibility claim; the original files and latest pre-repair bytes are preserved. `STORAGE_CONTRACT.md` documents the bounded backup and ID high-water keys, unavailable storage behavior, saved/shared quarantine and URL precedence.

XML still uses the original codec. User-facing import detects/discloses clamping/coercion/truncation/ignored data before acceptance; source-fidelity XML tests remain intact. Original XML is downloadable during review, while the decoded-record backup is not claimed lossless XML. User-facing mole maximum metadata is 8. No external DTD/entities, new record padding, invented CRC or format change was introduced. PNG/JPEG export and development renderer diagnostics remain working.

### Verification

- **338 unit tests / 11 files** pass, including original data/XML/graphics/GUI/storage/file/image suites and distinct corrected-policy tests. Original legacy randomization assertions remain test-only and continue characterizing its 10,000-record incompatibility rate.
- **10,000 deterministic new randomized records** (seed `0x6a74`) satisfy profile rules; the independent pinned, unmodified MiiJS 3.1.1 RCD validator accepts **10,000/10,000**, with no external requests. MiiJS does not prove calendar/ID semantics; independent RFL-derived fixtures cover those separately.
- All scalar min/max boundaries, all 512 encoded month/day pairs, flags/contradictions, sequential reload/rollback/exhaustion and known collision limits, reserved-bit isolation, and transactional repairs pass. All seven original corpus files remain unchanged. Their reviewed outputs all pass independent RCD validation; the two originally fully valid samples remain byte-identical.
- Full development **and production** Chrome 156 browser suites pass: 62 native XML cases, 992 rendering sweeps, 13 screens at native/2×, 219 selections/59 palette selections/570 adjustment checks, sliders/pointers/keyboard, prior file/XML/image operations, and new repair/cancel/archival/export/persistence/share checks. Each new suite also checks 32 actual Random-button binary downloads and all seven reviewed sample exports, with no browser errors or external requests.
- TypeScript, production build and all seven Python recovery/integrity tests pass. All **1,718 protected content files** retain the exact file set and hashes; original corpus hashes are unchanged. Finder metadata is excluded as previously documented. No SOURCE/ or EXTRACTED-SWF/ content was modified.
- Firefox and WebKit checks were attempted but their installed runtimes are missing. They remain unverified. The existing Vite bundle-size advisory and documented original-renderer/font/antialiasing discrepancies remain; no speculative artwork changes were made.

Selected reports, independent decoder results, repaired corpus hex, baseline/current transcripts and an inspected actual browser repair screenshot are retained in `evidence/phase6/`. Large deterministic hex corpora remain reproducible temporary artifacts rather than unnecessary committed outputs. Existing visual regressions use the historical default as an explicit saved input fixture; a separate fresh-origin browser suite verifies the actual new-default factory, so fixture fidelity does not conceal creation behavior.

### Manual review, remaining limits and stop point

Launch `web/dev.sh`, open the reported local URL (normally http://127.0.0.1:5173/), and use Random/edit/File as before. Load FAIL-1/2/3 through File → Load: review listed changes and previews, cancel to verify no replacement, then reload and Apply reviewed repairs → Save Mii. The bytes stay 74 long. Inspect `evidence/phase6/repair-review.png`. Try impossible birthday drafts, mole increase at 8, share/reload and the explicit archival backup. Do not describe acceptance in a software dashboard as physical certification.

Phase 6 stops here. **Next is Phase 7 destination verification**, targeting real Wii consoles, emulators and Wii games, with a verified transfer/container/checksum/owner/duplicate-ID policy and actual hardware evidence. `web/PHASE7_VERIFICATION.md` records the matrix and known limits. No physical test, game certification, database insertion or speculative console-identity modification was performed. Unknown ownership and cross-browser/concurrent ID collision risk remain explicit; no unsafe guessed identity solution is represented as complete.
