# Mii Editor — Phase 4A original interface

The main page reconstructs the original 640 × 500 Mii Editor interface using actual recovered vectors, static-text glyphs and source placements. It runs entirely in the browser, using the existing binary data model and complete SVG character renderer. See [GUI_RECONSTRUCTION.md](GUI_RECONSTRUCTION.md) for source evidence, supported behavior, tests and visual limits.

From `web/`:

```sh
./dev.sh
```

Open http://127.0.0.1:5173/. Stop with Ctrl+C. The script uses Node on PATH or the existing local Codex runtime. For a fresh checkout, install Node 24 (minimum 22.12) and pnpm, then run `pnpm install --frozen-lockfile` and `pnpm dev`.

General supports name/creator, gender, birthday, mingle, IDs, favorite colors and randomization. Head supports all eight shapes and six skin colors. All 13 original screens can be reached through the original tabs/sub-tabs. The other screens show source artwork with editing explicitly disabled until Phase 4B. File dialogs, sharing and browser persistence remain deferred. The read-only footer displays actual character data; it is not a working share link.

Development renderer diagnostics and the previous regression test bench are at http://127.0.0.1:5173/diagnostics.html. The normal production build excludes this page. Its existing preset/query controls remain available there, for example `/diagnostics.html?case=hat&diagnostics=1`.

```sh
pnpm typecheck
pnpm test                    # 223 data/rendering/GUI tests
pnpm build                   # standalone production site in dist/
pnpm test:browser            # prior regressions + XML + all GUI screens
pnpm test:browser:production # separate regression fixture + real production GUI
pnpm preview                 # serve dist/ locally
```

Browser tests use installed Chrome, start their own local servers and write ignored `test-results/` artifacts. Production renderer regressions compile a separate test fixture outside `dist/`. No Ruffle, original SWF, PHP or backend is needed by the built site. No dependency was added. The full vector/glyph catalog produces Vite's standard large-chunk warning (about 1.13 MB / 236 kB gzip).

Original recovery/integrity checks, from the project root:

```sh
python3 -m unittest discover -s tools -p 'test_*.py' -v
```

See [DATA_COMPATIBILITY.md](DATA_COMPATIBILITY.md) for binary/XML APIs, [RENDERING_PROOF.md](RENDERING_PROOF.md) for the established renderer, and `../evidence/phase4a/` for actual screenshots and original Ruffle comparisons. `SOURCE/` and `EXTRACTED-SWF/` remain read-only evidence. No Git remote, deployment or upload is configured.
