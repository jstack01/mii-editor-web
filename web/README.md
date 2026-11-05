# Mii Editor — Phase 5A

The original-style **640 × 500** Mii Editor now has all **13 editing screens**, automatic browser saving and working Mii share URLs. It uses the original recovered graphics, existing binary data model and complete SVG renderer, entirely in the browser.

From `web/`:

```sh
./dev.sh
```

Open http://127.0.0.1:5173/. Stop with Ctrl+C. The script uses Node on PATH or the existing local Codex runtime. For a fresh checkout, install Node 24 (minimum 22.12) and pnpm, then `pnpm install --frozen-lockfile` and `pnpm dev`.

Use the original tabs/sub-tabs to edit every feature, color, position, size and rotation. Size supports dragging, touch and keyboard input. Hair includes all six pages and mirroring. Copy the original footer's **Mii URL** field to share the complete character. Valid edits save locally; a valid URL import overrides saved data. See [EDITOR_INTERACTIONS.md](EDITOR_INTERACTIONS.md) and [STORAGE_CONTRACT.md](STORAGE_CONTRACT.md) for controls, exact precedence, validation and intentional Flash-behavior changes.

File opens the original Files/XML interface. Load accepts local .mii and UTF-8 XML; Save Mii downloads the exact 74 bytes. XML opens an editable view: Back validates/applies edits, Escape discards them, and Save downloads the current character (apply edits with Back first). XML does not preserve unknown binary bits. See [FILE_OPERATIONS.md](FILE_OPERATIONS.md). PNG/JPEG export remains Phase 5B. Tutorial stays deferred. No backend, Flash, PHP, remote service, upload or Git remote is used.

Development diagnostics remain at http://127.0.0.1:5173/diagnostics.html, including all renderer presets, attribute controls and alignment overlays. Normal production output excludes that page.

```sh
pnpm typecheck
pnpm test                    # 265 data/rendering/GUI/persistence/file/compatibility tests
pnpm build                   # standalone production output in dist/
pnpm test:browser            # all prior checks + file/XML operations
pnpm test:browser:production # production fixture regressions + real editor
pnpm preview
```

Tests use installed Chrome and write ignored `test-results/` artifacts. Firefox/WebKit runtimes were unavailable here; `pnpm test:browser:firefox` / `pnpm test:browser:webkit` are provided for installed environments. The full original vector/glyph bundle is about 1.18 MB / 245 kB gzip, with Vite's standard large-chunk warning. Dependencies and lockfile versions are unchanged.

From the project root, run `python3 -m unittest discover -s tools -p 'test_*.py' -v` for original evidence/integrity checks. `SOURCE/` and `EXTRACTED-SWF/` remain unchanged. See `../evidence/phase5a/` for edited browser/Ruffle comparisons and remaining visual limits; [DATA_COMPATIBILITY.md](DATA_COMPATIBILITY.md) documents the unchanged codecs.

Randomized-file investigation: [WII_COMPATIBILITY.md](WII_COMPATIBILITY.md). The original Flash randomizer supports mole sizes 0–15; Wii RCD permits 0–8. File saving warns without changing bytes. DS detection errors must be distinguished from Wii values. Image export remains Phase 5B.
