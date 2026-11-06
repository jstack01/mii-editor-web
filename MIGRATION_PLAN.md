# Mii Editor Web migration and distribution plan

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

### Milestone D3 — Docker distribution and GitHub Container Registry (implemented locally; publication approval pending)

Add before Phase 7: digest-pinned multi-stage static build, small unprivileged Nginx runtime, non-root UID 101/internal 8080, bounded static serving and no application backend. Provide .dockerignore, hardened single-service Compose, environment-example host-port selection, OCI source/version/revision/provenance and preserved legal notices. Retain all standalone/static ZIPs and launcher config.json independently.

Build linux/amd64 and linux/arm64 under one OCI index, and execute where possible with native versus emulated results recorded. Test the actual image/Compose and clean public checkout, not just Vite. Retain source/codec/graphics/Wii/browser regressions and protected-original integrity. D3 adds no Mii compatibility claims.

Prepare a manual-only GITHUB_TOKEN workflow with contents:read and publishing-job packages:write. No ordinary commit publishes. First source/image/tag/release uploads require explicit approval. Verify repository association, Public package visibility and empty-credential anonymous pulls before advertising availability or publishing the GitHub prerelease. Source-repo public visibility is not proof of package visibility. Existing releases/settings and history remain unchanged.

Prepare preview.4 as four existing ZIPs plus a small Docker starter ZIP and checksums. Keep remaining browser/device coverage, static-hosting verification, Phase 7 destinations/hardware and Phase 8 final checks open. See docs/DOCKER.md, docs/DOCKER_VERIFICATION.md and docs/CONTAINER_PUBLISHING.md.

### Phase 7 — Wii hardware, emulator and game verification

- The approved targets are real Wii consoles, emulators (including Dolphin), and Wii games. Define an evidence-based matrix for transfer/import routes, Mii Channel, relevant games, normal/special/temporary IDs, duplicate IDs, console ownership and local-only/mingling behavior. Confirm required RCD/RSD/database/remote wrappers and checksums in each route. See web/PHASE7_VERIFICATION.md. Unknown-owner browser records do not prove destination uniqueness; separate origins/concurrent tabs can collide. Establish a verified importer/owner/identity policy before extending compatibility claims.
- Document hardware, firmware, game versions, destination tools, test fixtures and outcomes. Identify any requirements that cannot be checked without physical equipment; do not mark these verified based on MiiJS, Ruffle or a decompilation.
- **Certification gate: no claim of real-Wii or individual-game compatibility until the relevant physical tests pass.** Keep scope-specific limitations visible even after other targets pass.

### Phase 8 — final release and remaining approved behavior

- Port the tutorial only if its sequencing is recovered or separately specified/approved; otherwise disclose its deferral.
- Run the available Chromium/Firefox/WebKit, native/2×, keyboard/pointer and offline matrix. Verify no unintended historical service calls.
- Publish a final fidelity/deviation matrix, compatibility and hardware-verification matrix, known limitations, asset provenance and build/run instructions. “Faithful original reproduction” and “Wii-compatible product behavior” must have separate supporting evidence.
- Release only after required checks pass, intended features/assets are complete, differences are reviewed and unresolved behavior is not represented as certified. Include Milestone 6.2 actual browser/device coverage, Milestone 6.3 verified static ZIP/Apache root and nested-path instructions, release checksums/file inventory, licensing/provenance, accessibility/offline verification, update/rollback instructions and destination-scoped Phase 7 results. Keep developer evidence separate from the public package. Any unavailable target stays explicitly unverified; publishing still requires explicit authorization.


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
