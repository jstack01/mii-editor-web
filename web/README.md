# Mii Editor — Phase 4B

The original-style **640 × 500** Mii Editor now has all **13 editing screens**, automatic browser saving and working Mii share URLs. It uses the original recovered graphics, existing binary data model and complete SVG renderer, entirely in the browser.

From `web/`:

```sh
./dev.sh
```

Open http://127.0.0.1:5173/. Stop with Ctrl+C. The script uses Node on PATH or the existing local Codex runtime. For a fresh checkout, install Node 24 (minimum 22.12) and pnpm, then `pnpm install --frozen-lockfile` and `pnpm dev`.

Use the original tabs/sub-tabs to edit every feature, color, position, size and rotation. Size supports dragging, touch and keyboard input. Hair includes all six pages and mirroring. Copy the original footer's **Mii URL** field to share the complete character. Valid edits save locally; a valid URL import overrides saved data. See [EDITOR_INTERACTIONS.md](EDITOR_INTERACTIONS.md) and [STORAGE_CONTRACT.md](STORAGE_CONTRACT.md) for controls, exact precedence, validation and intentional Flash-behavior changes.

File dialogs and image export remain Phase 5; File is explicitly unavailable. Tutorial stays deferred. No backend, Flash, PHP, remote service, upload or Git remote is used.

Development diagnostics remain at http://127.0.0.1:5173/diagnostics.html, including all renderer presets, attribute controls and alignment overlays. Normal production output excludes that page.

```sh
pnpm typecheck
pnpm test                    # 242 data/rendering/GUI/persistence tests
pnpm build                   # standalone production output in dist/
pnpm test:browser            # prior checks + full interactions/storage/sharing
pnpm test:browser:production # production fixture regressions + real editor
pnpm preview
```

Tests use installed Chrome and write ignored `test-results/` artifacts. Firefox/WebKit runtimes were unavailable here; `pnpm test:browser:firefox` / `pnpm test:browser:webkit` are provided for installed environments. The full original vector/glyph bundle is about 1.14 MB / 238 kB gzip, with Vite's standard large-chunk warning. Dependencies and lockfile versions are unchanged.

From the project root, run `python3 -m unittest discover -s tools -p 'test_*.py' -v` for original evidence/integrity checks. `SOURCE/` and `EXTRACTED-SWF/` remain unchanged. See `../evidence/phase4b/` for edited browser/Ruffle comparisons and remaining visual limits; [DATA_COMPATIBILITY.md](DATA_COMPATIBILITY.md) documents the unchanged codecs.
