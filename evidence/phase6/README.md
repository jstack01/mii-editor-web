# Phase 6 verification evidence

Scope: `Wii-RCD-persistent-v1`, software validation only. See ../../web/WII_PROFILE.md for all rules, provenance, intentional source deviations and limitations; ../../web/PHASE7_VERIFICATION.md for unverified real Wii/emulator/game destinations.

- baseline-verification.json and baseline-*.txt: committed reproduction gate ebc0373, verified before compatibility edits.
- reference-rules.json: independently extracted pinned RFL masks, maxima and calendar (including the conditional revision and body maximum discrepancy).
- randomized-summary.json: seed, observed field ranges and full ordered-corpus digest for 10,000 new characters. Reproduce from web/: `MII_WII_REPORT=/tmp/wii-randomized.json pnpm test -- src/compatibility/wiiProfile.test.mjs`.
- independent-miijs.json: pinned unmodified MiiJS RCD checks, original corpus evidence, 10,000/10,000 generated acceptance and all seven reviewed outputs accepted. This decoder does not enforce all profile calendar/ID rules.
- reviewed-corpus-records.json: original and explicitly repaired hex, original filenames retained. Input files are not modified.
- wii-development.json / wii-production.json: fresh-origin defaults, 32 actual Random downloads, repair/cancel/archival, XML review, quarantine, persistence and sharing.
- files/images/compatibility/gui/interactions/browser reports: full existing development and production regressions, preserving original input fixtures and separate raw-codec expectations.
- repair-review.png: inspected actual browser review of FAIL-3, showing original/proposed vectors and precise changes. No new artwork.
- integrity.json / input-hashes.json: protected content file-set/hash and corpus checks; Finder metadata excluded.
- unit/typecheck/build/python transcripts: current verification; firefox/webkit-unavailable.txt: missing runtime evidence, not passes.
- phase5b-compatibility-browser.mjs.txt: original browser harness preserved to make the deliberate transition from warn-only export/source randomization auditable.

Independent decoder reproduction (no production dependency): obtain the pinned MiiJS checkout/browser modules matching ../randomization-compatibility/references.json in a temporary directory, then from the project root run `node tools/validate-miijs.mjs --miijs-dir /path/to/pinned/miijs --randomized /tmp/wii-randomized.json --candidate-records evidence/phase6/reviewed-corpus-records.json --output /tmp/independent-wii.json`. Inspect accepted/rejected counts; original failed samples intentionally remain rejected until repairs. All validation is local; nothing is uploaded.

No physical Wii/game certification, verified console ownership, global/destination uniqueness, or database/container/checksum guarantee is claimed. Separate browsers/concurrent tabs may collide because owner bytes remain explicitly unknown, not invented.
