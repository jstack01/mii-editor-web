# Original SWF evidence

`SOURCE/` and `EXTRACTED-SWF/` are read-only inputs. These outputs were recovered from the executable originals, not the derived one-frame graphics libraries.

- `raw/assets.xml`, `raw/classicGUI.xml`: full JPEXS FFDec 26.4.0 XML exports, schema 4.2; retain executable ABC records, gradients, edges, font/glyph information, text properties and all tags. These are machine-readable evidence, not browser runtime dependencies.
- `manifests/assets.json`, `manifests/classicGUI.json`: symbol registrations, original definition records, root/nested local timeline frames, depth-ordered display lists, place/move/remove operations, bounds, affine transforms, color transforms, filters, masks/clip depths, button/hit states, nine-slice grids and links to extracted exports.
- `default-character.json`: literal default hex and source hash recovered from `ClassicGUI.as`.
- `protected-inputs.sha256.json`: hashes of all 1,724 input files recorded before implementation; tested against the final input trees, including absence of added/deleted files.

## Regenerate

With Java and FFDec available, from the project root:

```sh
python3 tools/recover_evidence.py --ffdec /Applications/FFDec.app/Contents/Resources/ffdec-cli.jar
```

To rebuild JSON from the checked-in XML exports without Java:

```sh
python3 tools/recover_evidence.py --from-xml
python3 -m unittest discover -s tools -p 'test_*.py' -v
```

The reader explicitly checks FFDec XML schema 4.2. Different schema versions require an adapter, not silent best-effort parsing. Manifests are deterministic and contain no current timestamp or absolute project path. The original source SWF hashes and raw XML hashes are embedded in each manifest.

## Interpretation

IDs are scoped to a module. Registration is the symbol-local `(0,0)` origin, not the center of a rendered PNG or a guessed pivot. MATRIX values are `[a,b,c,d,tx,ty]` in SVG affine order; only translation is converted from twips to pixels. Normalized matrix components are recovered onto SWF's exact 16.16 grid to avoid FFDec decimal float formatting drift. Raw XML values and flags remain available. The tests independently decode every original placement matrix from the SWF bytes and compare it to the XML interpretation.

Raw shape/text bounds are preserved in twips and pixels. SVG export metadata records its top-level origin-compensation transforms; avoid applying those offsets twice when placing SVG geometry. Sprite bounds are not invented: they depend on child timelines and runtime state.

Each local frame snapshot resolves move-inherited properties, replacement, removal and empty frames at that timeline's own ShowFrame. Snapshots do not recursively evaluate nested playback or execute AS3 constructors/frame scripts. Draw order is ascending depth. `clipDepth` describes a mask's depth interval, not another character ID. Button records preserve up/over/down/hit states separately. Original text records/glyphs are retained; a full text renderer is not implemented.

Recovered totals: 387 character symbols + 426 GUI symbols; 31 + 50 timelines; 583 + 277 local frames; zero unresolved display-list/button placement references. The tests compare frame/placement/removal/label/class/ABC tag counts directly against a separate binary scanner.

The original General frame contains `nameText` (symbol 379) at `(243.05,146.85)` and the static warning overlay `updateFPMessage` (symbol 372). The runtime constructor hides that overlay, explaining the obscured exported screenshots. Those screenshots must not be treated as a finished UI background. Clean runtime reference capture and complete rendering support remain later work.
