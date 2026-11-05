# Mii Editor migration assessment and plan

Status: Phase 0 recovery, Phase 1 name preview, Phase 2 data compatibility and Phase 3A default-head rendering proof are complete. Stop after Phase 3A. The full character renderer/editor remains unfinished; Phase 3B is next.
Reviewed: November 4, 2026. Updated after inspecting the reorganized project and original source package.

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

### Phase 3 — rendering proof and complete avatar (3A proof complete; 3B pending)

- Begin with one head shape plus eyes/nose/mouth and required tint regions using recovered pivots. Compare SVG output against source assets before expanding.
- Implement all part frames, palettes, head offsets, pairing/rotation, hair mirroring, multiply features and glasses exceptions.
- Implement body anchors, independent limb scales, gender torso, ID-dependent pants and footing-based zoom.
- Tests: every asset reference resolves; every declared selectable frame exists including blank states; geometric assertions for min/mid/max values; 8 heads × feature/beard families; all palettes; hair mirror; dynamic depth threshold crossings; gender/height/weight extremes; ID boundary values 31/32/63/64/95/96/191/192/223/224.
- Visual acceptance: compare on a stable browser/OS/font baseline at native dimensions and 2× scale. Review overlays/diffs; agree pixel tolerances after measuring Flash-versus-browser antialiasing. No invented universal pixel threshold.
- Exit requirement: representative reference characters match geometry/layering/color, with remaining rasterization differences recorded and accepted.

### Phase 4 — editor screens and persistence

- Implement the 13 editing screens with source order, pagination, palette choices, selections and adjustments. Reuse extracted icons/button art with correct bounds.
- Add General fields, randomize, height/weight drags, page-dependent close-up/full-body view and share-link display.
- Add accessible labels, keyboard focus and Pointer Events with pointer capture while preserving visible styling.
- Implement approved startup precedence, URL handling and local persistence. Avoid accidental hydration writes that overwrite a URL-imported character.
- Tests: every screen reachable; last/first page limits; selections track codec values; repeated navigation does not duplicate listeners; drag release outside control; clamping; gender/mingle; birthday blanks; name truncation; URL precedence; storage failures and corrupt saved data; reload after each mutation pathway; keyboard and touch interactions.
- Exit requirement: complete editing flows behave as agreed at native size; no stale preview or unintended state loss.

### Phase 5 — files, XML and image export

- Implement local `.mii`/XML import and Blob downloads only after approval of server replacement; show explicit parse errors without discarding a valid current character unless that behavior is agreed.
- Implement XML view/edit/save and image dialog with original bounds, defaults, background/body options, PNG alpha, JPEG quality target, zoom, drag and centering formula.
- Validate rendering-to-canvas filters, masks and fonts; use another approved export approach if browser SVG rasterization fails fidelity tests.
- Tests: valid/invalid/cancelled imports; byte-identical binary export; XML semantic round trips; 10/50/800 px square output; default zoom/background; body off/on; panning offsets; transparency enabled only for PNG; image dimensions/MIME/alpha and centering; filenames/Unicode; repeated exports release resources; import/export works offline if approved.
- Exit requirement: exported files reopen correctly and visual exports match reviewed references. Compare decoded image pixels/geometry, not JPEG file bytes.

### Phase 6 — remaining behavior and release

- Port the tutorial only if functional sequencing is recovered or separately specified and approved. Do not substitute an invented tutorial under a parity claim.
- Replace obsolete Flash/Wii compatibility messaging with approved modern load/error handling; document behavior changes.
- Run the agreed Chromium/Firefox/WebKit matrix, native/2× rendering, keyboard/pointer flows and offline tests. Verify there are no unintended calls to historical services.
- Produce final parity matrix, known limitations, asset provenance record and build/run instructions.
- Release gate: type check, unit and browser suites pass; asset manifest is complete for in-scope features; visual differences and behavior deviations are reviewed; no unknown functionality is presented as preserved.

## 6. Information to request next

The original executable SWFs, defaults XML, AIR descriptor and package icons are supplied and have been inspected. Architecture and Phase 1 scope are approved. For later visual/interchange parity validation, request any available browser HTML wrapper, clean runtime screenshots/video, and representative `.mii`/XML exports. Static original placements have now been recovered. Original AS3 runtime execution and clean reference capture remain outstanding; do not imply these were completed by metadata extraction.


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


## 9. Phase 3A completed — character rendering proof

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
