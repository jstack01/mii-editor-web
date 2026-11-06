# Developer build and tests

Use Node.js 22.12+ (verified with Node 24), pnpm and a checkout of this repository. From `web/`, run `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm test`, and `pnpm build`. The production site is `web/dist/`; no original files or application backend are needed. `pnpm dev` starts the developer server; stop with Ctrl+C. `web/dev.sh` is a convenience for the existing local development environment.

## Generated resources are the public build inputs

`src/generated/` contains the complete recovered character and GUI vector catalogs, frame/placement data, schema/order tables, default record and renderer fixtures. `generated-resources.json` pins their hashes. Normal builds/tests verify those files; they **do not run extraction generators**. Keep these resources committed. `.gitattributes` keeps their line endings stable across systems.

These generated graphics are derived historical materials with unresolved rights, not newly licensed original artwork. See ../NOTICES.md. A hash inventory proves consistency, not ownership or accuracy by itself.

## Public versus private historical tests

`pnpm test` runs the source-independent tests, using small factual snapshots and the supplied seven-record compatibility corpus in `test-support/fixtures/`. Tests cover binary fields, byte preservation, permutation tables, default/name codecs, storage/URL precedence, the Wii profile, 10,000 deterministic random characters, reviewed repair transactions and renderer/GUI data. `pnpm test:browser` and `pnpm test:browser:production` run the existing Chrome-based editor/rendering/XML/file/image/repair suites, including the development diagnostics fixture. Install a compatible browser/Playwright runtime if necessary. Real-device and other-engine coverage remains Milestone 6.2.

The original source-comparison tests have **not been deleted locally or rewritten into tautologies**. They remain untracked on the original developer machine and available in earlier Git history. `scripts/legacy-tests.json` names them; normal public tests exclude them explicitly. `pnpm test:legacy` requires the private original folders and evidence, checks recovered resources against those sources and runs the full historical suite plus the public tests. It fails clearly when private materials are unavailable. This optional fidelity evidence is distinct from independent Wii software validation.

Optional original recovery uses `pnpm assets:recover` only when private SOURCE/, EXTRACTED-SWF/ and recovery manifests are available. It intentionally regenerates and updates the hash inventory; review the diff and rerun tests before committing. Private recovery tools stay local/ignored. Do not add ActionScript, SWF packages or large recovery manifests back to the current public tree. Preserve them locally for reference.

No public build step fetches historical assets or embeds decompiled ActionScript. Browser diagnostics are development-only and are excluded from production distributions. The large vector bundle currently triggers Vite's advisory chunk-size warning; it is not a failed build.
