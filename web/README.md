# Mii Editor — Phase 3A rendering proof

The Phase 2 data model is retained and the page now displays an SVG rendering of the original default head, alongside the existing name/hex preview. See [RENDERING_PROOF.md](RENDERING_PROOF.md) for graphics provenance, diagnostic mode and visual verification. This is not the reconstructed editor interface. See [DATA_COMPATIBILITY.md](DATA_COMPATIBILITY.md) for the new field, ID, XML, ordering and randomization APIs. It runs entirely in the browser. Vite is development tooling; no Flash, AIR, PHP, remote service, or backend is used by the built page.

## Launch

From this project’s `web/` directory:

```sh
./dev.sh
```

Open <http://127.0.0.1:5173/>. Stop with Ctrl+C. The script uses Node on your PATH or the existing local Codex Node runtime if Node is not installed globally. Dependencies are already installed for this checkout.

For a fresh checkout, install Node 24 (minimum 22.12), install pnpm, then:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Exact versions are recorded in `package.json` and `pnpm-lock.yaml`. `npm install` / `npm run dev` also work, but pnpm is the lockfile-authoritative installation path.

## What works

- Loads the exact 74-byte `ClassicGUI.as` default and displays `defaultBoy`.
- Stores 37 unsigned 16-bit words, reads/writes bytes in big-endian order, and shows 148 lowercase hex characters.
- Edits only name words 1–10 (zero-based bytes 2–21), zero pads shorter names, truncates longer names to ten UTF-16 code units, and preserves every other byte.
- Reads names as the original does: zero code units are skipped throughout, and surrogate code units are preserved rather than normalized.
- Resets to the original default. Scales the 640 × 500 implementation-preview surface uniformly to narrower browser widths.

The default fixture is generated directly from the read-only ActionScript input with its source SHA-256 recorded in `src/generated/default-character.ts`. Dev/build regenerates it and the head-asset catalog; tests verify both are current. The browser does not need to fetch or execute the original sources.

## Verify

```sh
pnpm test                 # 199 data/rendering cases, including original 189
pnpm build                # TypeScript check + production build
pnpm test:browser         # head/diagnostic/pixel checks + UI smoke + 62 XML cases
pnpm test:browser:production # built site + headless Chrome smoke check
pnpm preview              # serve dist/ locally for manual inspection
```

The browser tests use an installed Chrome by default; set `PLAYWRIGHT_CHANNEL=chromium` after `pnpm exec playwright install chromium` if Chrome is unavailable. Browser checks start/stop their own servers on ports 5174/5175 and save screenshots/JSON under ignored `test-results/`. Run `build` before production browser checks.

For the recovered SWF metadata tests, run from the project root:

```sh
python3 -m unittest discover -s tools -p 'test_*.py' -v
```

`dist/` contains the standalone production site and can be served on any static web host. Deployment, source modification and feature expansion are outside this phase.

## Modules and scope

- `src/model/MiiCharacterData.ts`: full binary/field/string/ID/hex model and source API; XML delegates to the native browser adapter in `miiXml.ts`. Rendering and storage stay separate.
- `src/generated/default-character.ts` and `mii-schema.ts`: generated default, all 45 fields and five permutations, with source provenance.
- `src/main.ts`: small DOM controller and uniform scaling.
- `src/style.css`: explicitly labeled rendering-proof layout; no invented character artwork or finished-editor claim.
- `scripts/generate-character-assets.mjs`: read-only original vector/placement/rule extraction; includes `generate-source-data.mjs` and the existing default generator.
- `scripts/browser-smoke.mjs`, `rendering-browser-checks.mjs` and `xml-browser-checks.mjs`: repeatable UI, head-rendering, diagnostic, pixel and native XML checks.
- `../tools/`, `../evidence/`: original SWF recovery and machine-readable manifests, kept out of browser bundles.

`fromHex()` is a strict internal fixture decoder, not a port of legacy permissive user-facing hex import. Legacy-compatible import is exposed separately as `setHexData()`/`setData()`. Questionable behaviors are recorded in `../evidence/phase2/COMPATIBILITY_NOTES.md`; they have not been silently corrected.

The default head proof and data codecs are implemented. Body rendering, nonblank feature variants, the original editor UI, local file dialogs/downloads, share URLs and persistence remain deferred. Tutorial remains deferred. The next milestone is Phase 3B: expand the original character renderer beyond this validated default-head proof.
