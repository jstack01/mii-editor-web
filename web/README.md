# Developer application directory

See [the project README](../README.md) for download/use instructions, credits, AI-generated/unmaintained disclaimer and licensing status. See [BUILDING.md](../docs/BUILDING.md) for source-independent builds and test separation, [HOSTING.md](../docs/HOSTING.md) for static deployment and [PUBLISHING.md](../docs/PUBLISHING.md) for explicit manual releases.

From this directory: `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm test`, `pnpm build`. Public builds verify the committed generated resources; SOURCE/, EXTRACTED-SWF/ and recovery evidence are not required. `pnpm dev` runs the developer app; `pnpm test:legacy` is an optional local original-source suite and fails clearly without private materials. Diagnostics at /diagnostics.html are development-only and excluded from production ZIPs.

Current production behavior: all 13 screens, original-derived SVG graphics, Wii software-profile creation/editing/randomization, explicit import repair, .mii/XML files, PNG/JPEG export, browser persistence and path-correct share URLs. No permanent legacy mode exists. Compatibility and legacy fidelity tests remain distinct. See WII_PROFILE.md and PHASE7_VERIFICATION.md for hardware/ownership/ID limitations; no physical certification is claimed.

The technical documents in this directory retain historical source/evidence references. Those private folders are kept locally for research; links to them do not imply they are required or included in the public checkout. Generated graphics still have unresolved asset rights; see ../NOTICES.md. New code remains unlicensed.
