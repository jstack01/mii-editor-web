# Mii Editor Web migration and distribution plan

**Final status (2026-11-11): v1.0.0 is published and verified for the approved browser-editor scope.** No ongoing maintenance or additional development is promised. Physical Wii/game testing is indefinitely deferred; Pages remains disabled and unapproved. Historical phase/prepublication entries below remain a dated record; the L3 completion entry supersedes their pending-publication statements.


This is the concise public edition. The detailed pre-publication assessment and evidence remain locally in `.local-reference/MIGRATION_PLAN.before-publication.md`, the ignored recovery folders, and earlier Git commits. They are not needed to build the public checkout. Original materials are retained locally; Git history is not rewritten.

## Product direction

An unofficial, faithful-looking browser editor using TypeScript, Vite, HTML/CSS and original-derived SVG data. The original Flash application supplied the interface/format reference; correct Wii software-profile behavior is the default, with no permanent legacy mode. Imported incompatible records are preserved and require explicit reviewed fixes. Software validation is not physical console/game certification.

Historical graphics/glyphs and generated vectors have unresolved redistribution rights. New code is unlicensed by the owner's choice. See LICENSE.md and NOTICES.md. This project is AI-generated / vibe-coded, unmaintained and not endorsed by Nintendo or the original developers; forks are encouraged subject to applicable rights. No support, issues, pull-request review or maintenance is promised.

## Completed functional milestones

| Milestone | Result and evidence boundary |
| --- | --- |
| Phase 0 | Recovered original symbol placement, registration, matrices, frames, shapes and source metadata. Private original/extraction/recovery files remain local, not normal build dependencies. |
| Phase 1 | 37-word/74-byte record, default/name codec, lossless name editing and initial browser view. |
| Phase 2 | 45 numeric attributes, five original permutation tables, both names and IDs, binary/hex/XML codecs and characterized legacy behavior. |
| Phases 3A/3B | SVG foundation and full character using recovered vectors, source transforms, palettes, nesting, masks, layering and body proportions; diagnostics remain development-only. Independent Flash pixel parity/hardware certification was not claimed. |
| Phases 4A/4B | All 13 editor categories, original controls, pagination, sliders, touch/keyboard handling, browser persistence and current-origin/path share URLs. |
| Phases 5A/5B | Local .mii/XML import/save and original image-export interface with PNG/JPEG. Tested reproduction baseline committed as ebc0373. |
| Phase 6 | Default Wii software profile: mole 0–8, valid birthday pairs, confirmed ID relationships, bounded editing, non-destructive review/repair, export blocking and separate fidelity/compatibility tests. Committed as d24e320. |
| Milestone 6.1 | Compact responsive repair dialog, larger actual before/after previews, friendly wording, optional advanced/read-only inspection, fixed actions, keyboard/focus support and source-boundary footer-brand removal. Committed as 24107fc; original protected assets remain unchanged. |

Known rendering limits include original device-font substitutions, some nine-slice/stroke/antialiasing differences and unverified engine-specific behavior. Tutorial sequencing remains deferred. Ownership, global/destination ID uniqueness and transfer/container requirements remain unresolved; do not invent console identifiers or pad/checksum the 74-byte record.

## Distribution milestone D1 — GitHub preview preparation and manual publication

Scope authorized after 6.1, separate from completion of 6.2/6.3:

- Use the existing history; stop tracking SOURCE/ and EXTRACTED-SWF/ without deleting local files. Older public commits may still expose original materials, explicitly accepted by the owner. The owner also explicitly approved untracking current recovery evidence/tools/sample folders and nine original-source-only tests; all remain locally available.
- Make public builds independent of originals by using committed generated resources and a verified hash inventory. Keep source-comparison tests locally available as `pnpm test:legacy`; the public tests use factual fixtures and the permanent record corpus. Do not publish a checkout that needs private SWFs to build.
- Prepare a public mii-editor-web repository, AI-generated/unmaintained README/screenshot, original-project credits, unlicensed-new-code statement and separate unresolved asset-rights notices. Disable Issues, pull requests (supported `has_pull_requests=false` control), Discussions and Wiki; encourage forking subject to rights. No automatic contribution or maintenance expectation.
- Package v0.1.0-preview.1 as a prebuilt website plus START-HERE, Python static-server launchers, Apache root/subdirectory instructions and notices. Exclude original Flash/decompiled files, evidence, tests, diagnostics, node_modules and caches from the ZIP. Generate its SHA-256 checksum and verify the actual extracted package.
- GitHub CLI was installed through Homebrew and official browser authentication completed. Account/name availability can be checked read-only. No repository creation, remote push or release publication occurs until the owner approves the reviewed source, ZIP, exclusions, version and licensing concerns. Actual GitHub feature settings must be read back and confirmed after approved repository creation; a local configuration file is not proof.
- Publishing is explicit and manual through documented scripts, not a workflow on every commit. Future versions: build/test, review source/exclusions, commit, package/checksum, verify extracted ZIP, obtain approval, then push/tag/prerelease. Distinguish the named ready-to-run asset from GitHub's automatic developer-source archives.

### D1 verification status

Preparation checks passed: TypeScript, 196 source-independent tests, 443 local historical-plus-public tests, production build, and a temporary source-only copy with a fresh offline dependency install/build and no private original/evidence folders. Both complete Chrome development/production editor/rendering/XML/file/image/repair browser suites passed against the relative-path build. Seven Python packaging/publication-guard tests passed. The review ZIP has passed real browser root/nested-path tests with the included Python server and an isolated local Apache 2.4.67 instance, including exact .mii files, XML, PNG/JPEG, sharing, persistence and no historical-service calls. These are basic local deployment checks, not broad production-host certification.

Windows launcher execution, a real Linux host, browser/device breadth, HTTPS/hosting variations and physical/game compatibility remain unverified. No new application dependency was added. Original file hashes remain intact. Publication remains gated on explicit owner approval and a clean final source snapshot; no preview is represented as a final release.

## Remaining roadmap — not completed by making the repository public

### Milestone 6.2 — desktop browser and mobile compatibility (implemented features; available-engine verification delivered; coverage gaps open)

- Verify current Chrome, Firefox, Safari/WebKit and Edge. Install and run Playwright Chromium, Firefox and WebKit runtimes where available and permitted; distinguish branded Safari/Edge testing from engine testing.
- Verify mobile Safari and Android Chrome on physical devices or suitable environments where available. Add mobile emulation and touch-input tests. Do not claim real-device coverage from desktop emulation alone; record device/OS/browser versions and unavailable targets.
- Cover navigation, every editing category, sliders, scrolling, file import, .mii/XML downloads, PNG/JPEG exports, compatibility repairs, persistence and shared URL restoration, including unavailable storage/cancel/error paths.
- Check original SVG gradients, masks, filters, nested transforms and color transforms across engines. Compare representative characters and UI states and document engine/font/antialiasing differences.
- Fix mobile layout, touch targets, virtual keyboards, orientation/viewport changes, focus, modal overflow and browser download/file-picker limitations. Preserve the original 640×500 editor layout and uniform scaling where practical, allowing modern responsive behavior where necessary for usability.
- Retain the Phase 6 software profile and 6.1 non-destructive repair UX. Run all historical-fidelity, independent decoder, data/graphics/editor/file/image/storage suites. Record actual coverage, capture references and commit the completed milestone before distribution work.

### Milestone 6.3 — remaining local/static deployment verification (open; basic packaging checks delivered under D1)

- Deliver a clean production build containing only runtime application files. It must run on a conventional HTTP/static server, including Apache, with **no Node.js/Vite process on the production server**, PHP, database, runtime backend or cloud service.
- Offer an easy prebuilt-release local startup method for nontechnical Windows/macOS/Linux users. Prefer a simple static-file server without development dependencies; explain any installed runtime requirements honestly. Keep developer source-build instructions separate.
- Document downloading, extracting, starting, opening the browser, stopping, updating, preserving browser data/origin, and self-hosting. Explain browser/file-protocol limits and HTTPS requirements where applicable; do not promise unsupported download/storage capabilities.
- Provide Apache root-directory and subdirectory deployment examples. Test assets, URLs and sharing at `/` and `/mii-editor/`; verify Vite base-path configuration and all asset references. Test actual production files with a simple static server and Apache where available, recording unavailable environments.
- Exclude original SWF packages, protected extraction folders, development diagnostics, test artifacts, source evidence and unnecessary development/source files from public distribution. Retain required licenses/provenance notices. Verify no calls to obsolete MiiEditor.com services.
- Provide a ready-to-upload static distribution ZIP if appropriate, with a file manifest/version and clear launch/hosting instructions. Test the ZIP's extracted contents, offline/local behavior and updating rather than only the developer checkout. Do not publish or upload without explicit authorization.
- Re-run desktop/mobile and independent Wii software compatibility checks against the actual release package. Commit locally; retain destination certification for Phase 7.

### Milestone D3 — Docker distribution and GitHub Container Registry (complete; preview.4 published)

Add before Phase 7: digest-pinned multi-stage static build, small unprivileged Nginx runtime, non-root UID 101/internal 8080, bounded static serving and no application backend. Provide .dockerignore, hardened single-service Compose, environment-example host-port selection, OCI source/version/revision/provenance and preserved legal notices. Retain all standalone/static ZIPs and launcher config.json independently.

Build linux/amd64 and linux/arm64 under one OCI index, and execute where possible with native versus emulated results recorded. Test the actual image/Compose and clean public checkout, not just Vite. Retain source/codec/graphics/Wii/browser regressions and protected-original integrity. D3 adds no Mii compatibility claims.

Prepare a manual-only GITHUB_TOKEN workflow with contents:read and publishing-job packages:write. No ordinary commit publishes. First source/image/tag/release uploads require explicit approval. Verify repository association, Public package visibility and empty-credential anonymous pulls before advertising availability or publishing the GitHub prerelease. Source-repo public visibility is not proof of package visibility. Existing releases/settings and history remain unchanged.

Prepare preview.4 as four existing ZIPs plus a small Docker starter ZIP and checksums. Keep remaining browser/device coverage, static-hosting verification, Phase 7 destinations/hardware and Phase 8 final checks open. See docs/DOCKER.md, docs/DOCKER_VERIFICATION.md and docs/CONTAINER_PUBLISHING.md.

### Phase 7A — Completed: Wii/Dolphin integration and transfer compatibility investigation

- Review primary transfer/container source and distinguish raw 74-byte RCD, 76-byte RSD, RFL_DB.dat and game-save archives. Keep full identity/owner/flag checks separate from scalar decoder acceptance.
- Execute only isolated copied Dolphin environments with user-supplied legal channel resources, backups, exact before/after bytes and captures. No live database writes, guessed identity conversion or new production export format.
- Delivered: Dolphin 2609a Mii Channel displayed 13 positive editor records across two launches unchanged; separate special, temporary, zero-ID, duplicate-ID and historical-invalid cases characterized. Independent reference container CRC and 10,000-record decoder checks retained. See web/PHASE7_VERIFICATION.md, optional-tools/phase7a/ and docs/WII_DOLPHIN_TESTING.md.
- Record the tested zero-owner default boy’s explicit channel edit refusal; keep ownership conversion, actual per-Mii importer execution, remote transfer and game association unverified. Further production transfer/identity features require a separately reviewed milestone.

### Phase 7B — Deferred indefinitely by owner decision

- No physical Wii hardware is available. The owner does not own a Wii and does not intend to obtain hardware or perform physical Wii/game testing.
- Real-Wii and individual-game certification remain **unverified**, not passed. No requests for a Wii, game discs, NAND images or other console equipment are required.
- This deferral **does not block browser-editor QA or release** when the scope and unverified compatibility claims are clearly documented. Do not invent owner conversions or broaden the Phase 7A findings.

### Phase 8A — Completed: Final QA and Release Readiness (preview.5 prepared locally; known limits retained)

- Run available Chrome/Chromium, Firefox and WebKit/Safari/Edge checks, using an isolated supported Linux environment where useful; document unavailable branded browsers/devices and retain failing tests.
- Investigate WebKit forced-offline File/Blob failures independently from HTTP-blocked checks. Verify emulated phone/tablet portrait/landscape, touch/keyboard/scroll/modal behavior and fix measured usability defects without redesigning the editor.
- Run full data/graphics/editor/repair/file/image/storage/URL/10,000-record independent-decoder regression checks, retained Phase 7A evidence safeguards and protected-original integrity. Do not repeat database writes for routine QA.
- Verify actual local launcher/static ZIPs, config.json, startup/shutdown/browser links, root/nested hosting and Docker/Compose/architecture/security behavior. Review privacy, XML safety, package exclusions, documentation, credits and unresolved rights.
- Prepare preview.5 platform/static ZIPs, Docker starter assets, manifests/checksums and a matching local Docker image when source changes. Commit locally. Physical certification is not a release gate; honest compatibility disclosures remain mandatory.

### Phase 8B — Completed: Final Publication (v0.1.0-preview.5)

- Publish an owner-approved release based on Phase 8A evidence and remaining limitations. No automatic push, tag, GitHub release or GHCR publication.
- Preserve prior releases, source history, legal/provenance notices, AI-generated/unmaintained disclaimer and origin-specific browser storage.
- Keep deferred tutorial sequencing, outstanding browser/device/hosting coverage and unverified physical Wii/game compatibility disclosed. Deferral is not certification; neither software validation nor Dolphin display guarantees hardware/game behavior.

## Publishing and inspection references

- README.md: end-user overview, screenshot, download/start instructions and prominent project disclaimer.
- docs/BUILDING.md: standalone public build, generated resources and private legacy tests.
- docs/HOSTING.md: local launcher, Apache root/subdirectory examples, updates and browser limitations.
- docs/PUBLISHING.md: explicit review/approval, source checks, packaging and manual GitHub publication.
- web/WII_PROFILE.md and web/PHASE7_VERIFICATION.md: software rules and unverified ownership/ID/hardware/destination requirements. Older references to recovery evidence describe local historical inputs, not public build requirements.

The detailed original fidelity and compatibility evidence is preserved locally and in existing Git history. No original Flash files are deleted and no existing commit is rewritten. Remaining milestones keep their own acceptance gates even after a preview repository/release is approved.

## D1 publication record — November 5, 2026

The owner explicitly approved public publication after reviewing the clean source, ZIP, exclusions and unresolved licensing concerns. Public repository: https://github.com/jstack01/mii-editor-web . Prerelease: https://github.com/jstack01/mii-editor-web/releases/tag/v0.1.0-preview.1 . The release tag pins reviewed commit `84eda761e8681d8e04d10c5ba78f616d6c3109b5`; the approved ZIP SHA-256 is `bab08dc69b96b8b95bc6d59f27ab4cc94d8eea3a9307f18a4a91fbf2aca12f6d`.

GitHub API read-back confirms public visibility, forking enabled, and Issues, pull requests, Discussions, Wiki and Projects disabled. GitHub rejected mutating the inherent public-forking field; it was omitted from the supported PATCH while still verified true. A targeted publishing-helper regression fix is recorded on main; the reviewed release tag and application ZIP were not rewritten. Eight packaging/publication utility tests now cover this behavior. All originals remain locally ignored/untracked, and existing history was preserved.

Public availability does not complete Milestone 6.2, remaining 6.3 platform/hosting verification, Phase 7 destination/hardware tests or Phase 8 final release. New code remains unlicensed and historical graphic rights unresolved as disclosed; publishing approval is not third-party license permission. Future updates stay explicit/manual through docs/PUBLISHING.md.


## Milestone D2 — simple script-based local server launchers (implemented; publication pending approval)

The owner requested script-based launchers only: no Go/PyInstaller executable, bundled interpreter or standalone HTML edition. Prepared version **v0.1.0-preview.2** uses separate macOS, Linux, Windows and static-hosting ZIPs. The published preview.1 tag, Git history and ZIP remain unchanged. No D2 remote push, tag or release publication is authorized yet.

### Implementation

- `Start Mii Editor.command`, `start-mii-editor.sh` and `Start Mii Editor.cmd` locate their own directory and run an existing Python 3.9+ standard-library static server in the foreground. Nothing installs/downloads software or changes OS security settings. macOS skips Apple’s developer-tools stub, including symlinks to it; Windows skips Store aliases/install managers. Missing tools produce optional instructions. Windows requires an existing real Python installation; zero-install support is not claimed.
- The PowerShell HttpListener/HTTP.sys option was investigated against Microsoft documentation: non-admin URL reservations cannot be assumed and an IP URL prefix is not sufficient proof of loopback-only binding. Changing global HTTP.sys settings/elevating or inventing a TCP HTTP parser was rejected. See docs/LOCAL_LAUNCHERS.md. No actual Windows environment was available to test a native HTTP.sys implementation.
- Fixed **http://127.0.0.1:8080/**, no silent fallback. A real HEAD readiness check precedes the default-browser request. A normal copyable URL is always shown; supporting terminals receive an OSC 8 link. Browser-launch failure gives manual-opening instructions. Port conflicts explain how to resolve them. POSIX TIME_WAIT restart uses SO_REUSEADDR without SO_REUSEPORT; Windows uses exclusive binding instead.
- GET/HEAD only, explicit MIME types, no uploads/listing, no launcher-directory serving, Host validation, path/encoding/dot-file/traversal checks and symlink/reparse rejection keep the root bounded to website/. Ctrl+C/SIGTERM/hangup stop the in-process server and release its listener; no detached server child is created. Actual Windows console-close behavior remains unverified.
- All editions carry identical production index/assets/notices. The separate static ZIP has no Python or launcher and runs on ordinary hosting without a runtime application backend. Relative assets and share URLs retain root/nested paths. No codec, Wii rule, artwork, rendering or editor behavior changes were made.
- Port 8080 differs from D1’s 8765. Browser data is origin-specific: users must export/import important D1 characters deliberately. No silent migration is attempted. Localhost URLs point to the recipient’s own machine and are not public hosted share links.
- Packaging allowlists production files, preserves executable bits/Windows CRLF, includes START-HERE/HOSTING and legal notices, pins clean commit metadata and produces four SHA-256 checksums plus a combined checksum file. A new version must match package.json; the older preview cannot be overwritten. The manual publishing helper validates all four exact extracted-archive verification reports before an explicitly approved upload.

### Verification and limits

- Actual host: macOS 27 ARM64, non-administrator UID 501. Existing Homebrew Python 3.15 was selected by the launcher; Python 3.9.6 also ran automated server tests. Native ditto extraction preserved the .command executable permission. LaunchServices opened the extracted .command from a space/Unicode folder and HTTP 200 plus a 127.0.0.1-only :8080 listener were observed. Browser-opening readiness/failure and OSC 8 output were checked automatically. A physical Finder double-click, visual browser foregrounding and terminal hyperlink click still warrant the owner’s manual check; LaunchServices success is not every download/quarantine scenario.
- **17 launcher/packaging tests passed**, covering MIME/Host/method/path/symlink boundaries, occupied port, browser failure, readiness, Unicode/space paths and foreign working directory, missing interpreter, Apple stub avoidance, SIGINT/SIGTERM/SIGHUP, immediate same-port restart and simulated terminal close via a real PTY. Active-port conflict and immediate restart are separate checks. Windows script syntax/packaging is not a Windows execution test.
- **196 public tests, 443 full historical/public tests and 7 source-integrity checks passed**. TypeScript and production build passed. All eight existing Chrome development and eight production browser pipelines passed, retaining 13-screen editing, graphics, XML, file/image downloads, independent software-profile checks, repair/cancel, sharing and storage behavior. A fresh 10,000-record run was accepted 10,000/10,000 by the pinned independent MiiJS decoder, as were all seven repaired samples; no external decoder requests occurred. The existing large-bundle advisory remains.
- Actual extracted packages are checked with Chrome and isolated Apache 2.4.67 at root and /mii-editor/: all 13 screens, randomization, exact 74-byte import/export, XML, PNG/JPEG, repair/cancel, sharing, reload and persistence after stopping/restarting the server. macOS uses the real fixed port 8080. Asset/error/external-request monitoring must remain clean. All four inventories and identical production bytes are verified; reports are retained locally under release/ and bound to each final ZIP hash.
- Actual Linux and Windows OS environments were unavailable. A Linux shell wrapper test on macOS is only a shell portability smoke test; the Windows archive’s Python server is exercised on macOS, not its CMD launcher on Windows. Installed VM access was unavailable/denied and no permission/security settings were bypassed. Those desktop double-click, console close, tool discovery, Unicode and browser behaviors remain unverified. Real mobile/cross-engine/hardware claims remain explicitly deferred.

### Approval and remaining roadmap

D2 changes are committed locally and final clean packages/checksums prepared for owner inspection. **Do not push or publish v0.1.0-preview.2 until explicitly approved.** Retain the AI-generated/unmaintained disclaimer, unlicensed new code and unresolved historical graphic rights; D2 does not clear redistribution rights.

Milestone 6.2 (real cross-browser/mobile), remaining 6.3 (real Windows/Linux launch, broader hosting/TLS/deployment verification), Phase 7 (Wii hardware/emulator/game destinations) and Phase 8 (final release) stay open. Preparing scripts/static ZIPs does not certify those milestones. See docs/LOCAL_LAUNCHERS.md, docs/HOSTING.md and docs/PUBLISHING.md for operation, limitations and future manual releases.


## D2 publication approval and owner testing

The owner reported successful manual Windows and macOS testing and approved pushing/publishing D2. These are owner-reported results; OS versions and detailed test coverage were not supplied. Earlier unavailable-Windows statements describe the automated development environment, not this later manual result. Real Linux desktop behavior, broader platform/device coverage and hardware compatibility remain unverified. The approved preview.2 is published through the guarded manual process; preview.1 remains unchanged.


## Milestone 6.2 / preview.3 implementation record

Implemented the approved local Default Boy / Default Girl links and structured config.json together with desktop/mobile checks. The reference page’s exact named records are bundled in characterPresets.ts; boy matches the recovered ClassicGUI default. Appearance/nonidentity bytes remain unchanged, while explicit loads allocate fresh normal IDs with unknown system ownership using the existing allocator, then reuse commit, persistence, preview/control and share updates. See docs/PRESETS.md. No historical branding is restored and no runtime historical-site request is made.

All local launchers read config.json through shared Python stdlib code, relative to serve.py. Only port is supported, defaulting to 8080 when file/key is missing. JSON objects and strict integer ports 1024–65535 are required; strings, booleans, floats, malformed JSON and bad ranges fail visibly. Unknown keys are ignored and cannot change 127.0.0.1 binding or other safeguards. Local ZIPs include config.json; static hosting excludes it. Users edit that file and restart, never launcher code. Changing ports changes storage origin; export important characters first. The user's existing preview.2 server at 8080 is preserved; package tests use configured 8090 and dynamic isolated ports.

Fixed mobile stage layout overflow/blank space/tap interference without changing source graphics. Fixed WebKit repair-dialog Tab traversal while preserving autofocus, Shift+Tab/Escape, cancellation, original bytes and stale-review checks. Broadened test-only engine selection and measured pointer-coordinate quantization without changing original slider math or weakening byte equality. See docs/BROWSER_COMPATIBILITY.md for evidence and test changes.

Verification: 199 public / 446 full historical tests, TypeScript/build, 40 Python configuration/launcher/packaging checks, seven source-integrity checks, independent 10,000/10,000 MiiJS acceptance plus both presets. Chrome’s eight development/eight production suites pass. WebKit rendering/XML/GUI/full interactions/compatibility/Wii/repair checks pass in both modes; its two forced-offline files/images suites still fail because local File/Blob reads/downloads fail under the runtime offline switch. Both APIs and real-path/synthetic file probes were investigated; tests are retained unchanged for this failure, and no speculative production workaround is introduced. Separate HTTP-blocked file/image flows pass in Chrome, Chromium and WebKit. This is a disclosed limitation, not a full green WebKit/offline certification.

Playwright Chromium, Firefox and WebKit were installed. Actual host: macOS 27.0.1 ARM64. Chrome 156, bundled Chromium 151 and WebKit 26.5 passed the new four-viewport desktop/emulated touch matrix with screenshots. Firefox 153 could not launch (helper/sandbox/GPU failures); headed mode also failed and security settings were not bypassed. Installed Safari WebDriver is disabled, Edge is unavailable, physical iOS/Android devices/keyboards and native preview.3 Windows/Linux testing remain unavailable. Earlier owner Windows/macOS results apply to preview.2. These gaps stay open under 6.2; do not certify unavailable targets or mark physical emulation as hardware coverage.

Prepared four preview.3 ZIPs (Windows/macOS/Linux launchers plus conventional static hosting), notices/guides/configuration instructions and SHA-256 checksums. Actual extracted packages are verified at root and nested paths with Chrome and Apache, preset links, config-selected ports, import/export/repair and restart persistence. Public clean-source build does not require protected inputs. Selected desktop/mobile screenshots are in docs/images/; detailed runtime reports remain ignored/local. No originals/extracted ActionScript are modified or added to public snapshots. Existing preview.1/preview.2 releases and Git history are preserved.

Commit locally and stop here. **Do not push, tag or publish preview.3 until the owner explicitly approves.** Remaining 6.2 coverage, remaining 6.3 deployment/TLS/platform verification, Phase 7 real Wii/emulator/game destinations and Phase 8 final release stay open. No Phase 7 implementation begins in this milestone.


## Preview.3 publication approval

The owner reviewed the live preview and explicitly approved pushing and publishing v0.1.0-preview.3. The release includes the four platform/static ZIPs and checksums. Previously documented Firefox/Safari/Edge/device coverage gaps and WebKit forced-offline failures remain open; publication does not certify them or begin Phase 7. Earlier prereleases remain unchanged.


## D3 implementation and local verification record

Selected upstream Nginx Unprivileged 1.30.6 Alpine, pinned by multi-platform digest, with Node 24/pnpm 11.25.0 only in a native builder stage. Dockerfile frontend/base inputs and the frozen lockfile are pinned; generated graphics are verified and require no private originals. Final runtime contains only the compiled site/notices plus the standard runtime OS/Nginx files, with no Node/Python/Vite, tests, original SWFs/ActionScript, recovery evidence, credentials or Git metadata. The base project Apache-2.0 license and Nginx COPYRIGHT are preserved separately; this does not license application code or graphics.

UID/GID 101 serves internal 8080 with GET/HEAD only, no listing/hidden/development/backend routes, correct MIME types, root-based health checking and graceful SIGQUIT. Compose is one pinned-image service with localhost-only host mapping, restart:unless-stopped, read-only root, ephemeral noexec /tmp, dropped capabilities, no-new-privileges and PID limit. No database, data volume, host path or privileged app container is used. Browser storage, shares and export formats are unchanged. config.json remains exclusive to standalone launchers; Docker uses normal mapping/MII_EDITOR_PORT.

Local Docker Desktop 4.89.0 / Engine 29.7.2 / Buildx 0.36.1 / Compose 5.5.0 on macOS 27.0.1 ARM64 built and ran both target architectures. ARM64 executed natively relative to the Linux Docker VM; AMD64 executed under emulation. Local OCI index validation confirms both architecture descriptors. Runtime size is approximately 23.5 MB ARM64 / 23.4 MB AMD64 as reported by Docker; final exact image sizes/digests are retained with reports. A successful multi-platform build is not claimed as native AMD64 execution.

Actual-image and actual-Compose Chrome checks pass for all 13 categories, vector rendering, presets, randomization, exact 74-byte import/export, XML, PNG/JPEG, repair/cancel, sharing, no external app requests, and byte-exact browser persistence across docker restart at unchanged origin. Read-only/non-root/no-capability runs, MIME/HTTP/traversal/hidden-file boundaries, health, rootfs exclusions, custom host ports and graceful exit 0 pass. Compose up/down/recreate was exercised using a local-only image tag and --pull never: this is not a GHCR upload or anonymous pull.

Retained checks: 199 public tests / 446 full historical+public tests, TypeScript/production build, 49 Python launcher/config/packaging/container guards, seven protected-source checks and independent 10,000/10,000 generated-record MiiJS acceptance. Existing Chrome development/production and preset/mobile-emulation suites pass. Known WebKit forced-offline failures and unavailable native browser/device targets remain unchanged; this milestone does not certify them.

Manual workflow YAML parses; Dockerfile lint passes. Read-only GitHub checks confirm Actions enabled/official actions permitted, default token read-only, and current gh CLI repo/workflow scope available. Explicit packages:write is limited to the conditional publish job; actual repository GITHUB_TOKEN package-write execution remains unverified until the approved workflow is pushed/run. OCI source labels associate the image with the existing repo. Package visibility must be explicitly checked/set Public after the first approved upload through supported settings; no undocumented visibility REST call is invented. Anonymous manifest/pull/source-label verification uses an empty Docker credential config, and the GitHub release helper refuses the Docker release until its matching report passes.

Prepared preview.4 local/static packages plus a versioned Docker starter ZIP containing Compose, .env.example, guide/build metadata and notices, with combined checksums. Extracted packages and a clean public checkout are verified locally; private evidence/recovery folders remain ignored and protected originals unchanged. No source push, GHCR image, GitHub tag, release or Docker Hub upload is performed. Stop here pending explicit owner approval; do not begin Phase 7.


## D3 publication approval

The owner explicitly approved pushing and publishing D3 / preview.4. The manual GHCR workflow and public-visibility/anonymous-pull gates remain mandatory before the GitHub prerelease is created. This approval does not close browser/device gaps or begin Phase 7. Previous releases remain unchanged.


D3 publication runner correction: the GitHub runner built/started the image but its older Docker CLI rejected image inspect --platform. The verification helper now inspects the immutable image ID selected by docker run --platform and still requires exact OS/architecture equality. Anonymous verification pulls the public tag and selected leaf digest before inspecting the leaf without that newer flag. A regression test covers the older-CLI path; no editor/runtime behavior or validation is weakened. The first failed run skipped publishing and created no container tag.


## D3 publication completed

Published preview.4 with all five ZIPs/checksums and public ghcr.io/jstack01/mii-editor-web:v0.1.0-preview.4. Immutable image index sha256:8dfc8c4b82fb7dd8c96923908ab1b6c1f744976a96cb19bdf426bb37d8c2af6c and release tag both identify source 141e525a7a11521bf18043179260ccd191871db8. Public package visibility, linked repository, both architecture anonymous tag/leaf pulls and source labels were verified without adding account permissions. The initial anonymous REST-metadata check failed because that API requires read:packages; the public registry itself worked. Main now uses GitHub’s anonymous Public package badge/details as the metadata proof, retaining fail-closed validation and fresh Docker credential isolation. This targeted helper follow-up does not overwrite the immutable image, Git tag or ZIPs. Remaining browser/device/static-hosting/hardware/final-release requirements remain open; Phase 7 is not begun.

## README cleanup and Phase 7A delivery (2026-11-06)

README cleanup was committed separately before integration work: concise current preview.4 download/start/Docker/Compose homepage, same responsive 540 px screenshot (324 px measured on a 390 px viewport), brief credits/disclaimer and links to existing detailed documents. GitHub Markdown API rendering, relative links, actual release filenames, public image metadata and clean public-checkout install/typecheck/test/build verified. Historical release notes/settings/tags/images were not edited. Detailed build, browser gaps, launcher/hosting, licensing and Wii limits remain in their dedicated documents; safe testing guidance is now docs/WII_DOLPHIN_TESTING.md.

Phase 7A adds separate labelled integration fixtures and optional analysis helpers, not browser functionality. A hash-pinned independent Java implementation generated fresh lab databases; Python independently checked header CRCs, exact records and duplicate full IDs. Only copied user-supplied Dolphin/Mii Channel resources were executed. The positive case preserved 13 records and the entire database across two launches. Temporary and original FAIL-1 entries were removed by the channel, zero-ID bytes were retained but not displayed, special/local-only displayed gold pants, and duplicate IDs displayed without deduplication. The channel explicitly refused editing the zero-owner default boy; no owner workaround was applied. See the detailed verification report and machine-readable results for the evidence boundaries.

No Mii codec, default creation, randomization, repair, controls, owner/ID policy or renderer correction was justified. A regression exposed a containerd-specific architecture inspection bug in the Docker test helper; it now uses the selected platform manifest descriptor when available and preserves the old-engine fallback, with fail-closed tests. Published image/release bytes are unchanged.

Final regression results: 200 public unit/integration tests; 447 public plus historical-fidelity tests; 66 Python launcher/config/distribution/integration guards; seven protected-source checks; TypeScript and production build; full Chrome development/production and mobile-viewport/preset browser suites. Independent pinned MiiJS accepted 10,000/10,000 new random records with zero external requests. Both published container architectures, real Compose/browser restart/persistence and the extracted static ZIP at root/nested Python and Apache paths passed. The exact staged public snapshot independently installed/tested/built without private originals. All 342 primary Dolphin Wii files remained unchanged. No disposable Dolphin process or test container remains running. Full results are in optional-tools/phase7a/fixtures/results.json; local screenshots/logs are under ignored release/phase7a/.

Remaining browser/device/forced-offline coverage in 6.2, broader deployment/TLS/platform verification in 6.3, physical Wii/game/importer/ownership verification in 7B and Phase 8 final checks remain open. All work is committed locally only; no automatic publishing or new release/container/tag is introduced.

## Phase 8A owner direction (2026-11-06)

Phase 7B is deferred indefinitely by explicit owner decision. The owner will not obtain physical Wii hardware or perform physical tests; the browser project can be released with accurate limitations. Phase 8A is authorized for software QA and preview.5 preparation only. Phase 8B publication requires a separate explicit approval. Historical milestone records below/above describe their original scope; this decision supersedes any earlier statement making physical tests a release gate.

## Phase 8A implementation and software QA (2026-11-06)

Phase 7B is deferred indefinitely by owner decision and is not a software-release blocker. Phase 8A fixes lost-button drag cleanup, delayed cancellation messages overwriting new import errors, horizontal touch/history overscroll, and Firefox diagnostic padding. Modern HTML targets and keyboard hints improve usability without changing SVG artwork, Mii attributes, IDs/owners, codecs or randomization. Packaged guide links and local referrer protection are corrected.

Chrome 156/macOS, Firefox 153/isolated Ubuntu ARM64 and Chromium 151/isolated Ubuntu ARM64 each pass the final 21-script matrix. Linux browsers run non-root with no external network or host security changes. Seven emulated phone/tablet portrait/landscape sizes cover all category paths, representative controls, native Chromium touch capture, viewport shrink, presets and repair cancellation; physical keyboards/devices remain unverified. WebKit 26.5 retains forced-offline File/Blob/image failures, independently reproduced with no editor code on macOS and Linux; they are not suppressed or treated as ordinary HTTP-blocked passes.

200 public tests, 447 including historical tests, 68 Python guards, seven protected-source tests, TypeScript/build and independent 10,000/10,000 MiiJS checks pass. Source-independent Phase 7A fixtures/checksum/ID safeguards are retained; no Dolphin/database write experiment is repeated. The lockfile audit reports zero advisories at this date, not formal security certification. Native Safari/Edge, macOS Firefox startup, Windows desktop and physical-device gaps remain documented. Headless Linux launcher tests ran 31 cases: 28 pass, three macOS-specific cases skip explicitly.

Preview.5 source/version/Compose/manual workflow/release notes are prepared locally. Final clean-commit package/image checks and their exact metadata remain the completion gate before Phase 8A handoff. No push, Git tag, GitHub release, GHCR upload or Phase 8B action is authorized yet. README continues to point at the actually published preview.4 until approved publication.

## Phase 8A completion and release-candidate verification

The four preview.5 platform/static ZIPs and Docker starter were extracted and verified: exact checksums/internal file inventories, identical application assets across editions, all application flows, origin-stable restart persistence, root/nested Python and isolated Apache 2.4.67 serving, and security headers. No protected originals, source/tests, credentials, development dependencies/diagnostics or private evidence are included. A fresh public snapshot installs/tests/builds without originals.

Both new production images execute (ARM64 native to the Docker Linux VM; AMD64 emulated), pass static/filesystem/health/UID/restart/security checks and browser workflows. Real Compose uses the pinned candidate image with a custom localhost port and passes browser restart/persistence. A local OCI index contains both architectures with matching version/source labels. Existing public preview.4 was independently pulled anonymously on both architectures and remains unchanged; preview.5 has not been uploaded. A verifier-only fallback now supports Buildx-loaded local indexes whose leaf is not directly addressable, retains classic Docker support and fails closed if platform verification is unavailable. Total Python guards: 70.

Final Chrome 156/macOS, Firefox 153/Ubuntu ARM64 and Chromium 151/Ubuntu ARM64 matrices are 21/21. macOS WebKit 26.5 is 16/21: the four existing forced-offline file/image runs plus the no-editor primitive probe still fail. Linux independently reproduces that primitive limitation and passes normal/mobile flows. These are retained failures, not weakened acceptance criteria. The deterministic cancellation-race test fails before and passes after the fix; native drag capture and overscroll regressions pass. Physical phones/tablets and native Safari/Edge remain unverified; macOS Firefox startup still fails safely without OS changes.

The actual extracted Linux script runs on Ubuntu with space/Unicode paths, default 8080/custom 8094, localhost-only binding, readiness/browser-open requests, OSC8 terminal output, occupied-port rejection and clean interrupt/restart. This is headless Linux coverage, not desktop association/double-click coverage. The extracted macOS command launches from another working directory with a custom port, answers HTTP, requests the default browser without a reported failure and shuts down cleanly. Native Finder/quarantine behavior and Windows CMD/console-close behavior remain unverified in automated QA.

Phase 7B remains deferred indefinitely by owner decision and does not block release. Phase 8B is not started: no source push, Git tag, GitHub release or GHCR publication. Final candidate revision and hashes are in the release artifacts, with detailed local reports under ignored release/phase8a/. Approval is required before final homepage-link/candidate-wording updates and publication; prior releases remain intact.

## Phase 8B publication reconciliation (2026-11-10)

Preview.5 was already published on 2026-11-06 following the owner's prior explicit approval. Its immutable release/tag and matching public GHCR image use source revision `27da544cb9b8e1feac14001e4de65529d440b549`; all five ZIPs and the combined checksum file remain unchanged. Earlier "not started", "not uploaded" and preview.4-only statements above describe the historical Phase 8A handoff and are superseded by this publication record.

On 2026-11-10, the local/public ZIP hashes, embedded clean source revisions, internal inventories and exclusions were rechecked. GitHub remains public/forkable with Issues, pull requests, Discussions and Wiki disabled, and preview.1 through preview.5 remain available. The concise README already references preview.5 and retains its 540-pixel screenshot and disclosures. No application source, launcher, codec, artwork, runtime security configuration or published artifact is changed by this documentation reconciliation.

The owner explicitly approved the final documentation reconciliation on 2026-11-10: a documentation-only main-branch commit and a concise update to the existing preview.5 release description. The version tag, ZIP assets, checksum file, image tag and digest are preserved. The release's source revision remains distinct from this subsequent documentation-only main-branch commit. Fresh anonymous pulls of both architectures passed, with the expected version, source labels and unchanged image digest `sha256:7332e088ad3ab3f5ba5ebea5c92fc07a5b189efe27b0601931624578200dbad9`.

Phase 8B is complete and the project is complete for its approved browser-editor scope. Preview.5 remains a preview and the final planned publication for this scope, without a maintenance commitment or additional required development milestones. Phase 7B stays deferred indefinitely by owner decision; physical Wii/game certification, native/device coverage gaps, WebKit offline limitations and unresolved historical asset rights remain disclosed limitations, not passed tests or release blockers.

## Optional post-release GitHub Pages deployment preparation (2026-11-10)

The completed preview.5 release can also serve as a live demo at `https://jstack01.github.io/mii-editor-web/`. No new development milestone is introduced. A manual-only Pages workflow and checksum-pinned static-release staging helper are prepared locally; Pages remains disabled and nothing is uploaded without owner approval. Application assets are reused unchanged; only the demo HTML adds a disclosure footer and no-referrer meta policy. README stays unchanged until an actual successful deployment, then receives only a prominent Try Online link.

The production build and 200 public tests pass. Chrome 157/macOS and Playwright WebKit 26.5/macOS pass the nested-path production deployment checks, all 13 screens, both presets, files/XML/images, repair/cancel, persistence across server restart and query sharing. Actual GitHub HTTPS deployment/Actions settings, native/device/offline limits and unresolved historical-asset hosting rights remain explicit. See docs/GITHUB_PAGES.md. Existing releases/tags/GHCR versions and Issues/PR settings are untouched; Phase 7B remains indefinitely deferred.

## Milestone L1 — Licensing Audit and Stable 1.0 Readiness (2026-11-10; local review only)

Owner direction supersedes the optional Pages proposal: **no Pages approval**, new public push/deployment/release/image, visibility change, deletion/history rewrite, applied license or rights-holder contact. Preview.5 remains published unchanged. MIT is the preferred proposal for eligible modern contributions, not a new grant covering existing assets or code automatically.

The local audit packet is docs/licensing/L1/README.md: all 183 tracked files categorized/hashed, historical exposure paths, all 19 retained preview ZIPs and release identities, 84 locked software packages and both architectures' 70-package Docker runtime inventories. Findings distinguish direct older-AS ports and inherited metadata from newly written browser/infrastructure contributions. The later My Avatar Editor archive provides a real 2009 Trevor McCauley MIT grant, but no general applicability to the exact older SWFs/artwork has been established. Arial-derived fixed-label paths and Docker notice/corresponding-source obligations require separate review. Complete-app redistribution clearance remains unresolved; disclaimers/attribution do not supply missing permission.

Draft MIT text/scope, README wording, notices/asset policy and unsent permission requests are stored in that packet, separate from active licensing. Proposed v1.0.0 gates cover rights resolution, accurate scope/notices, final clean source/version/packages, multiarchitecture GHCR, regression/checksums, explicit owner approval and a normal release. No v1.0.0 tag/package is created. Existing software/device limits remain disclosed; physical Wii/game certification stays indefinitely deferred and is not a stable-release gate. Pages is optional, disabled and on hold pending rights review and its own later explicit approval. Stop after L1 audit; no resolution is chosen on the owner's behalf.

## Milestone L2 — Practical Licensing Documentation and v1.0.0 Release Preparation (2026-11-11)

The owner elects to accept existing historical-material copyright/redistribution risk while keeping the application and prior public exposure, without permission outreach, replacement artwork or a claim of legal clearance. Standard MIT is adopted only for eligible rights in 65 exact modern files in LICENSE-SCOPE.json. Inherited model/renderer/GUI code, generated vectors/data, fonts/glyphs, screenshots, Nintendo interests and other third-party material are excluded. Existing L1 findings remain a dated record; active notices explain the owner's decision does not establish permission. Physical testing is indefinitely deferred and not a gate; Pages remains disabled/unapproved.

v1.0.0 preparation preserves application behavior and artwork, adds consistent root/package/distribution scope notices, and changes the runtime to the pinned upstream Nginx 1.30.6 Alpine slim variant (21 packages, 14 origins). Runtime licenses/copyright texts, component metadata and a companion archive of all 138 checksummed source inputs plus exact recipes/hooks and upstream Nginx build inputs are prepared. Required source access must be coordinated with eventual binary/image publication; no legal-compliance certification or ongoing source-offer support is asserted.

The release candidate comprises Windows/macOS/Linux launcher ZIPs, static hosting ZIP, Docker Compose starter, source-information companion, checksums and matching local AMD64/ARM64 images. Actual clean-source packaging/image verification results are recorded below at completion and in docs/licensing/L2_READINESS.md / ignored release reports. The manual helper supports a normal stable release; preview releases/tags/digests are not overwritten. No new app features, original-source changes or public actions are authorized. Stop after local candidate preparation and commits; owner approval remains necessary to push/tag/release/upload.

### L2 completion — local candidate, not published

Scoped MIT and component notices are implemented; the historical-material risks remain unresolved and explicitly accepted, not represented as cleared. Public/historical-inclusive tests (200/447), Python checks (75), protected-source checks (7), independent current-model MiiJS validation (10,000/10,000), Chrome and isolated Linux Firefox matrices (21/21 each), all extracted packages, root/nested hosting and both Docker architectures/Compose pass within recorded scope. WebKit retains its five offline failures; an additional initial production click/scroll timeout passed two unchanged reruns. A clean public-checkout unit deadline hit under concurrent build load also passed unchanged rerun; no assertions/timeouts were weakened.

The stable candidate has five platform/static/starter ZIPs, a separately checksummed complete runtime-source-input companion, and matching local ARM64/AMD64 images. All application asset bytes equal preview.5. Final metadata/provenance checks follow the documentation-only completion commit and are stored in ignored release/L2 reports. docs/licensing/L2_READINESS.md records actual tests, native/emulated/platform limits and the publication source-delivery condition. Normal stable release behavior is prepared in the existing manual helper; no publication occurs now. Physical Wii certification is indefinitely deferred; Pages stays disabled. Stop after local completion commits and candidate verification.

## Milestone L3 — Completed: Final Stable Review and Publication (2026-11-11)

Following the owner's explicit final approval, stable **v1.0.0** was published from immutable source **842f2558ac3a5a61c6c479cf7b3a6a075d4a4f87**. GitHub Release: https://github.com/jstack01/mii-editor-web/releases/tag/v1.0.0. It is normal/stable (`prerelease=false`) and Latest. All five application/deployment ZIPs, the matching source-information archive and combined SHA-256 file are public, with exact approved hashes/inventories/notices verified. No previous release/tag/image was overwritten.

Source-first delivery was enforced: publish the release assets with an explicit Docker-pending notice, verify anonymous source-companion and checksum downloads, and only then dispatch the existing manual container workflow from the immutable v1.0.0 tag. A private draft was not treated as source availability. After both builds/runtime checks and public anonymous verification passed, the pending note was replaced with final concise notes and the release marked Latest. The companion's SHA-256 is `a4ea2d3d9f77aeb673223f50c464c97e77ec51bd4d5da9d965fb6cf51d580218`; actual public availability preceded image upload.

Public image **ghcr.io/jstack01/mii-editor-web:v1.0.0**, index digest **sha256:663b7989cfca5ed9d84da82c1c84b29c7d7d3d5ec3e14826defebce38ff6fc1e**, contains linux/amd64 and linux/arm64 and identifies the exact released source. Anonymous tag/leaf pulls with empty Docker credentials, public package/repository association, website-byte equality to the tested candidate, and actual runtime security/health/restart checks passed for both architectures. AMD64 was emulated locally; the GitHub runner executed AMD64 and emulated ARM64. The manual workflow run is https://github.com/jstack01/mii-editor-web/actions/runs/43077257529.

The README retains its reduced screenshot and brief scoped-license/unmaintained/credits statement, with download and Docker/Compose commands updated to v1.0.0. Public forking remains permitted; Issues, pull requests, Discussions and Wiki remain disabled. Pages remains disabled: no live deployment or live-demo README link was added. This documentation-only main-branch follow-up does not move the released tag or alter any artifact/image.

MIT still covers only eligible interests in the 65 listed modern files. Historical graphics/glyphs, inherited code, Nintendo and other third-party rights are excluded and unresolved; owner risk acceptance is not clearance. Runtime notices/source inputs are supplied without formal legal-compliance certification. L2 software results and WebKit/timing/native-device limitations remain documented. Physical Wii and individual-game certification is indefinitely deferred, not a release blocker or a passed test. The project is complete for the approved scope with no support/contribution-review/maintenance commitment.

## Optional stable GitHub Pages hosting — authorized deployment (2026-11-12)

The owner explicitly approved publishing the unchanged stable v1.0.0 static application at the repository Pages path, without another routine approval. Existing Pages preparation is adapted from preview.5 to the exact v1.0.0 static ZIP/source/hash. Only hosting HTML notices/referrer metadata and `.nojekyll` are added; all app assets remain unchanged, all eight stable legal/source notices are served, and no backend/account/analytics is introduced. MIT scope stays at 65 exact files, historical-material risks remain disclosed and accepted, and no rights outreach or new development roadmap is introduced.

The Pages workflow remains manual-only with official pinned actions, least-privilege built-in token use and a main-only github-pages deployment environment. Predeployment Chrome/WebKit nested-path browser checks, 200 public tests, TypeScript and 79 Python guard tests passed. Actual live deployment/HTTPS/functional results will be appended after verification; README will receive a Try Online link only once the site genuinely works. No release/tag/GHCR changes are authorized or needed. Origin-specific storage keys/behavior are preserved without automatic migration; root-domain requests and unrelated-key preservation are checked. See docs/GITHUB_PAGES.md.
