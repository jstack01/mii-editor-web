# L1 — Licensing Audit and Stable 1.0 Readiness

**Historical audit snapshot:** the later owner-approved L2 decision adopts a limited MIT grant and accepts unresolved historical-material risk. References below to the then-active unlicensed policy describe the audit date; current policy is in the root LICENSE.md / LICENSE-SCOPE.json and ../L2_READINESS.md. The original findings are retained, not presented as current clearance.

**Local review draft, November 10, 2026. No new license is applied. No publication, hosting, rights-holder contact or availability change is authorized by this audit.** The active LICENSE.md, package metadata, release assets/tags, Docker images and disabled Pages setting remain unchanged.

## Decision summary

Recommend **MIT for eligible modern contributions**, after ownership/scope approval. MIT permits forks, modification, redistribution and independent maintenance with preserved notices; it does not obligate the original author to maintain a project. Keep the unmaintained/no-support statement in README/CONTRIBUTING, not as extra restrictions inserted into MIT. Copyright and other rights can only be granted to the extent actually held. An MIT heading cannot clear the complete current graphical application.

**Stable 1.0 licensing clearance is not complete.** The exact 2007 Mii Editor graphics/source lack an established reusable grant; extracted font paths need review; source-guided ports are mixed provenance; Docker's complete third-party compliance has not been established. Attribution, free access, nonprofit intent, a disclaimer, AI translation or the preview releases' existence do not cure those gaps. The later My Avatar Editor MIT release is important positive evidence for that later package, not proof that everything in the earlier package is MIT.

This is a technical provenance investigation and proposed release gate, not a legal opinion or noninfringement certification. Where a legal conclusion or license-scope interpretation is needed, obtain qualified advice for the relevant jurisdictions. No physical Wii testing is required or requested.

## Audit scope and reproducibility

Reviewed local HEAD **c374ef2** (prepared Pages commit, not pushed) and public main **33c7679**, released preview.5 source **27da544cb9b8e1feac14001e4de65529d440b549**. All **183 tracked files** at audit start have category, hash, size and authority assessment in [file-inventory.json](file-inventory.json). This covers modern code/scripts/configs/docs, all generated runtime resources, five documentation screenshots, fixtures and external notices. A Git author label is not proof of a human's creative authorship or a chain of title; all 29 local historical commits use jstack01, but no contributor assignments or line-by-line human/AI records were supplied.

Also inspected the protected original package/manifests **read-only**, reachable historical trees, all 19 locally retained preview ZIPs against GitHub release digests, the public build/staged Pages copy, installed dependency manifests/license files, all 84 frozen-lockfile packages, both preview.5 runtime architectures' package databases and notice paths. Full raw upstream material and exported container snapshots were kept in temporary local research storage, not added here. Machine inventories contain hashes/paths/metadata, not original Flash/decompiled source or downloaded font outlines.

New L1 files are draft analysis/proposals, not additions to the released app. `file-inventory.json` pins the pre-L1 tree; these new files are listed through the documents below. Package/file hashes establish identity, not ownership. Dependency metadata and APK license fields are declarations, not a substitute for all upstream license texts and obligations.

## Documents for review

- [Rights findings and category inventory](RIGHTS_INVENTORY.md)
- [Original project and source evidence](ORIGINAL_PROJECT_RESEARCH.md), with [retrieval hashes](source-evidence.json)
- [Fonts and generated-vector scope](FONTS_AND_VECTORS.md)
- [Existing public exposure and remediation options](PUBLIC_EXPOSURE.md)
- [Third-party software and Docker review](THIRD_PARTY_REVIEW.md)
- [Precise proposed v1.0.0 gates](STABLE_1_0_CHECKLIST.md)
- [Unsent permission-request drafts](PERMISSION_REQUESTS.md)
- Proposed [MIT text](proposals/LICENSE-MIT.txt.draft), [license scope](proposals/LICENSE-SCOPE.md.draft), [notices](proposals/THIRD_PARTY_NOTICES.md.draft), [asset notice](proposals/ASSET_RIGHTS.md.draft) and [short README statement](proposals/README-LICENSE.md.draft).

No file is newly declared legally cleared by its category. Modern-infrastructure candidates, e.g. `distribution/serve.py`, launcher wrappers, container verifiers and new repair/persistence adapters, are distinguishable from recovered asset catalogs and acknowledged direct ports. Exact candidate lists and conservative holds are in file-inventory.json. The project owner can propose MIT for eligible interests in those candidates; this audit cannot certify exclusive rights in every AI-generated line. No blanket MIT grant or copyright claim over purely machine-generated material is proposed.

## Current outcome

Keep Pages **disabled and unpublished** and stable v1.0.0 **uncreated**. The completed preview.5 functionality/QA remains valid for its documented scope; physical Wii/game certification stays indefinitely deferred. Licensing resolution, not new feature development or acquiring hardware, is the substantive stable-release gate. Decide permission/asset replacement/code-only distribution and Docker compliance steps explicitly after reviewing this packet. No choice has been made on the owner's behalf.
