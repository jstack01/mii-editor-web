# Mii Editor — Milestone 6.1

The original-style **640 × 500** Mii Editor now has all **13 editing screens**, automatic browser saving and working Mii share URLs. It uses the original recovered graphics, existing binary data model and complete SVG renderer, entirely in the browser.

From `web/`:

```sh
./dev.sh
```

Open http://127.0.0.1:5173/. Stop with Ctrl+C. The script uses Node on PATH or the existing local Codex runtime. For a fresh checkout, install Node 24 (minimum 22.12) and pnpm, then `pnpm install --frozen-lockfile` and `pnpm dev`.

Use the original tabs/sub-tabs to edit every feature, color, position, size and rotation. Size supports dragging, touch and keyboard input. Hair includes all six pages and mirroring. Copy the original footer's **Mii URL** field to share the complete character. Valid edits save locally; a valid URL import overrides saved data. See [EDITOR_INTERACTIONS.md](EDITOR_INTERACTIONS.md) and [STORAGE_CONTRACT.md](STORAGE_CONTRACT.md) for controls, exact precedence, validation and intentional Flash-behavior changes.

New and randomized characters now follow the default [Wii software profile](WII_PROFILE.md): bounded features, valid birthday pairs and normal persistent ID flags. No mode toggle exists. Console ownership, destination uniqueness and real Wii/game acceptance remain unverified.

File opens the original Files/XML interface. Load accepts local .mii and UTF-8 XML; Save Mii validates and downloads the exact 74 bytes. Incompatible imports open an explicit before/after repair review; Cancel preserves the current character, Apply fixes & load commits the listed corrections, and the original input is retained internally. Unresolved inspection is read-only. XML opens an editable view: Back validates/applies edits, Escape discards them, and Save downloads the current character (apply edits with Back first). XML does not preserve unknown binary bits. See [FILE_OPERATIONS.md](FILE_OPERATIONS.md). File → Export now saves PNG/JPEG with original size, zoom, RGB, body, background and pan controls. See [IMAGE_EXPORT.md](IMAGE_EXPORT.md). Tutorial stays deferred. No backend, Flash, PHP, remote service, upload or Git remote is used.

Development diagnostics remain at http://127.0.0.1:5173/diagnostics.html, including all renderer presets, attribute controls and alignment overlays. Normal production output excludes that page.

```sh
pnpm typecheck
pnpm test                    # 343 data/rendering/GUI/persistence/file/compatibility/image/UX tests
pnpm build                   # standalone production output in dist/
pnpm test:browser            # all prior checks + file/XML/image operations
pnpm test:browser:production # production fixture regressions + real editor
pnpm preview
```

Tests use installed Chrome and write ignored `test-results/` artifacts. Firefox/WebKit runtimes were unavailable here; `pnpm test:browser:firefox` / `pnpm test:browser:webkit` are provided for installed environments. The full original vector/glyph bundle is about 1.24 MB / 262 kB gzip, with Vite's standard large-chunk warning. Dependencies and lockfile versions are unchanged.

From the project root, run `python3 -m unittest discover -s tools -p 'test_*.py' -v` for original evidence/integrity checks. Application source/assets in `SOURCE/` and `EXTRACTED-SWF/` remain unchanged; observed Finder metadata changes are recorded separately. See `../evidence/phase5b/` for edited browser/Ruffle comparisons and remaining visual limits; [DATA_COMPATIBILITY.md](DATA_COMPATIBILITY.md) documents the unchanged codecs.

Historical randomized-file investigation: [WII_COMPATIBILITY.md](WII_COMPATIBILITY.md). The completed reproduction baseline is committed; Phase 6 corrections are documented separately in [WII_PROFILE.md](WII_PROFILE.md). Review known failing samples through File → Load, inspect the proposed repairs, cancel or explicitly apply, then Save Mii. [PHASE7_VERIFICATION.md](PHASE7_VERIFICATION.md) lists the remaining real Wii, emulator and game transfer/ownership tests.

The modern repair dialog now uses larger original/after-fixes previews, friendly labels, one short disclaimer, fixed actions and Advanced details. Historical footer website branding is removed without changing protected assets or the URL field. See [REPAIR_UX.md](REPAIR_UX.md). Milestones 6.2 (desktop/mobile coverage) and 6.3 (local/static/Apache distribution) are planned next; they have not begun.
