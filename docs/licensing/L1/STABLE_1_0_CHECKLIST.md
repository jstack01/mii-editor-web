# Proposed stable v1.0.0 release gates

**Plan only. Version remains preview.5. No tag, release, image or Pages deployment is created.** Stable means a supported, documented software scope, not guaranteed operation in every browser/device/console or a maintenance promise.

## A. Actual blockers / owner decisions

- [ ] Resolve the distribution basis for the complete retained artwork/GUI/font content and any inherited source expression: obtain suitable permission, demonstrate an applicable existing grant for exact components, replace the affected components, or explicitly choose a different code-only scope. A disclaimer does not complete this gate. Record rightsholders, versions/hashes, modification/redistribution/public-hosting/fork permissions and conditions.
- [ ] Confirm who can grant the eligible modern contributions, including applicable AI-service terms, human contributions/employer interests and any copied snippets. Approve the scope and copyright-holder wording; adopt the standard MIT text for those interests only. Purely AI-generated or third-party work is not newly claimed as owned.
- [ ] Resolve legacy ports separately. Do not silently relicense the older source by citing the later MAE project; document exact licensed component mapping/rebase with Trevor McCauley's notice or permission/independent implementation evidence.
- [ ] Review extracted font-label rights specifically or approve a licensed replacement. Update any affected screenshots and derivative outputs.
- [ ] Complete Docker per-package notice/corresponding-source fulfillment for the chosen exact runtime. Select a sustainable legal compliance method for an unmaintained project, including GPL/LGPL components and exceptions. Verify both architecture images.
- [ ] Decide separately whether any existing public exposure needs remediation. This audit authorizes no deletion, visibility change or history rewrite. New licensing must not imply that older third-party blobs were granted rights retroactively.
- [ ] Fix any newly discovered actual critical data-loss, unsafe import, export corruption or deployment defect before stable. None was established by this documentation audit. Existing Phase 8A evidence remains bound to its tested version, not automatically to changed 1.0 artifacts.

## B. Accurate notices and source preparation

- [ ] Adopt the reviewed modern-code LICENSE and separate file/portion scope. Keep the original project's notice and all applicable font/asset/upstream licenses, with exact author/copyright wording. Do not turn an attribution into a permission claim.
- [ ] Update active LICENSE.md/root LICENSE relationship deliberately, NOTICES/THIRD_PARTY_NOTICES, package metadata, image labels, guide language and scoped README statement consistently. Existing scripts copy LICENSE.md and two specific notices; update these allowlists and their assertions if new required files/paths are added. New texts must actually enter all packages/images.
- [ ] Keep README concise: description, existing reduced screenshot (if cleared), downloads, Docker/Compose, brief credits, AI-generated/unmaintained status, scoped license link and documentation links. No support, contribution or update promise. No new support channels.
- [ ] Record source provenance for replacements/permitted assets; refresh generated-resource hashes only after deliberate review. Do not weaken compatibility or integrity tests to accept unexplained changes.

## C. Versioned release-candidate build

- [ ] Update `web/package.json` to `1.0.0`, Dockerfile/defaults, Compose image, relevant workflow input version checks, release docs and packaging metadata to **v1.0.0**. Preserve preview.1–preview.5 tags/assets/images unchanged.
- [ ] Pin a reviewed clean final source commit. Build the public checkout without SOURCE/EXTRACTED-SWF/evidence; regenerate notices and production build from that commit. If any content/revision changes, rebuild affected outputs with matching provenance and reverify exact hashes.
- [ ] Produce Windows, macOS and Linux local ZIPs; preserve shared Python/config.json behavior, explicit Python requirement and security boundaries. Test actual extracted packages on available environments; qualify unavailable native execution honestly.
- [ ] Produce static-hosting ZIP, Docker Compose starter ZIP with pinned **ghcr.io/jstack01/mii-editor-web:v1.0.0**, and full applicable notices. Root/nested deployment and sharing must work. Retain default loopback port mapping and origin-specific persistence explanations.
- [ ] Build matching non-root runtime **linux/amd64 + linux/arm64**, exact version/source metadata, complete component/license/source record and manifest. Distinguish native versus emulated execution. No runtime backend/database.
- [ ] Generate package inventories and SHA-256 checksums; check archive exclusions, notices, source/version match, identical application assets and Docker artifact correspondence. Do not include private evidence, originals, dependencies, credentials or the L1 review packet accidentally through broad packaging.

## D. Final technical checks (retain acceptance criteria)

- [ ] TypeScript/production build; source-independent unit/binary/hex/XML tests; historical fidelity tests where available; source integrity. Explicitly review known intentional Flash-to-Wii deviations.
- [ ] Independent deterministic **10,000-character** MiiJS validation and known good/failing/repaired corpus; existing Phase7A evidence guards, no routine destructive Dolphin/database reruns.
- [ ] All 13 categories/rendering, boy/girl, edit limits, palettes/sliders, mouse/keyboard/touch, name/date handling, non-destructive import/error/cancel/repair, exact 74-byte export, XML, PNG/JPEG, share URLs and stable-origin storage.
- [ ] Available Chrome/Chromium/Firefox/WebKit regression checks and representative mobile viewports/orientations; investigate actual regressions rather than skip failures. Keep the existing forced-offline primitive distinction and exact retained failures visible.
- [ ] Extracted launcher startup, config defaults/custom/invalid/occupied ports, readiness/browser request/link, 127.0.0.1 binding, shutdown/restart, root/nested HTTP/Apache checks; Docker health/files/MIME/security/Compose/port/restart checks on actual images.
- [ ] Review unexpected requests, XML safety, local file handling, package credentials/exclusions, security headers where controlled, library advisories and base-image state. Do not label this a formal security audit.

## E. Disclosure-only limits, not mandatory hardware gates

- Physical Wii, specific games, ownership conversion, live transfer/editability outside the documented Dolphin scenarios: **indefinitely deferred by owner decision**, not a blocker. No equipment/NAND/disc request.
- Native Safari/Edge, physical iOS/Android, virtual keyboard, some native Windows launcher/double-click conditions: incomplete coverage can be disclosed in a precise support matrix rather than universal compatibility claims. A reproducible blocking defect in a platform advertised as supported requires a fix or a narrowed support claim.
- WebKit forced-offline File/Blob failures reproduced without app code; ordinary HTTP tests do not certify real-device offline. Document this test-environment limitation and do not claim guaranteed offline Safari support.
- Existing typography/nine-slice/antialiasing differences and deferred tutorial behavior: accurately document; no new editing feature is required merely for the stable number.
- A stable tag does not certify physical Wii or every game. The tested software profile and isolated Dolphin display/reload findings remain narrowly stated.

## F. Explicitly approved publication only

- [ ] Show one final source/artifact/license/limitations summary and obtain owner publication approval.
- [ ] Use the manual versioned workflow to publish new **v1.0.0** GHCR tag without overwriting prior digests. Verify public package association/visibility, both manifests and fresh anonymous pulls/version/source metadata.
- [ ] Create annotated v1.0.0 Git tag on the reviewed release commit and a **normal GitHub Release (`prerelease=false`)**, with five ZIPs and checksum file. Preserve all previews. No automatic publishing on commits.
- [ ] Concise notes: what it does, choose your ZIP, existing Python requirement, static/Docker/Compose, scoped license/credits and known-limits links; no claims of complete hardware compatibility.
- [ ] Download public assets and compare exact checksums/inventories; verify source archive exclusions/notices, README links, Docker/Compose, previous releases and public/forkable repository with Issues/PRs/Discussions/Wiki disabled.
- [ ] Mark the approved stable scope complete without a maintenance commitment. **Pages remains separate and optional**, requiring rights review and its own explicit approval; stable 1.0 does not depend on deploying it.

## Present readiness

Functional reproduction and Phase 8A software QA are complete within their reported scope. The Pages preparation additionally passed the 200 public tests and Chrome/WebKit nested deployment checks with byte-identical application assets. This audit changes no runtime code, so it does not repeat that expensive suite. **The rights and Docker compliance gates above remain open; v1.0.0 is not presently cleared as a legitimately redistributable complete application.**
