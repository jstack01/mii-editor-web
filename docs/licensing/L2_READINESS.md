# L2 — Practical licensing and v1.0.0 candidate

Local preparation only. The owner accepts existing historical-material distribution risk, keeps the appearance and public previews, declines permission outreach/replacement research, and understands this is not a rights grant or liability waiver. Nothing in L2 authorizes publishing, a Git tag, image upload or Pages. Physical Wii/game testing remains indefinitely deferred and is not a software release gate.

## Adopted scope

`LICENSE` is the standard MIT text, copyright jstack01, applicable only to eligible contributions/right interests held in the **65 exact files** listed in `LICENSE-SCOPE.json`. It makes no exclusive claim over purely AI-generated output, facts or third-party inputs. The list covers modern launcher/server/build/deployment/test infrastructure and selected modern repair/storage/file adapters. It excludes the model, renderer, original-guided GUI/editor logic, generated catalogs/data, historical artwork/fonts/screenshots and other third-party material. New license/source-preparation helpers and their tests are explicitly listed. It is not `web/src/**` or an MIT license for the whole application. Files not listed have no new owner grant; existing upstream terms still apply.

`LICENSE.md` and web/LICENSE.md describe that scope; package metadata is `SEE LICENSE IN LICENSE.md`. Root notices retain Trevor McCauley/senocular and both historical preservation sites. ASSET_RIGHTS.md keeps the unresolved vector/glyph/inherited-code/Nintendo questions explicit. THIRD_PARTY_NOTICES.md distinguishes the Vite runtime helper, build tools, OS runtime and external analysis references. The README keeps a short scope statement and current public download links, without adding long legal text or a support promise. No MIT metadata replaces third-party licenses.

No permission has been obtained by accepting risk, retaining credit or responding to legitimate requests. No rightsholder is contacted. Earlier L1 documents remain a dated research record; their unlicensed-code status is superseded only for the new explicit grant, not their unresolved-rights findings.

## Third-party work completed

- Required notice list is centralized in release-notices.json and copied to the actual production site, platform/static ZIPs and starter. Canonical MIT, scope, inherited-asset and third-party/source notices are included, with existing Vite notices retained.
- Nginx stays **1.30.6**, but the runtime uses the digest-pinned upstream **Alpine slim** variant to omit unused image/GeoIP/njs/XSLT modules: **21 packages / 14 source origins**, instead of 70. Non-root UID 101, port 8080, read-only/capability/security restrictions and stateless static serving remain. This is an infrastructure compliance reduction, not an editor/codec/rendering change.
- LICENSES/container contains exact component/source metadata, upstream copyright/license files and canonical relevant MIT/Apache/BSD/Zlib/GPL/LGPL/MPL texts. Actual image location: `/usr/share/licenses/mii-editor-runtime/`. Nginx and unprivileged-image notices remain separately present.
- The companion source-information archive contains **138 SHA-512-verified source inputs**, exact Alpine recipes and installation/build/configuration files, plus the pinned upstream image Dockerfile, Nginx source and checksum-verified pkg-oss. The source metapackage is recipe-generated, not a missing external tarball. Source input index has zero unresolved entries. All fetched sources stay in a separate release companion, not in the runtime or private Flash folders.
- Applicable component obligations continue to apply. This is not a legal noninfringement certification or an assertion of a byte-reproducible upstream binary build. At publication, recipients must actually receive suitable matching-source access; deliver the companion and notices in coordination with GHCR availability. Do not substitute a generic upstream link, someone else's promise or a false perpetual source-offer statement. The project remains unmaintained; source distribution is prepared rather than promising future support.

## Verification scope

The editor's model/codec/renderer/randomization/repair logic and the six original-derived generated resources are unchanged. New tests check exact MIT scope, mixed-license package metadata, required notices, source input completeness and protected resource hashes. Existing data/UI acceptance criteria are retained. Fresh results are recorded in the local release candidate reports; after final clean commit, packages/images are rebuilt with that exact revision and the extracted outputs rechecked.

Known browser/device/forced-offline and hardware limits remain those of Phase 8A: normal Chrome/Firefox coverage and WebKit flows do not certify native Safari/Edge, physical mobile, virtual keyboards or physical Wii/game behavior. No failing WebKit test is removed to obtain a green summary. No destructive Dolphin/NAND operation is repeated.

## Publication review

v1.0.0 is a proposed normal stable GitHub release for the documented software scope, not complete rights clearance, a universally certified platform or a maintenance commitment. Existing preview tags/assets/images remain unchanged. The prepared publisher uses normal release flags for a stable version and includes the source companion; package verifications and public-image checks remain mandatory.

Approval is still needed for any source push/tag, publication of the five ZIPs + source-information archive/checksum, and new GHCR AMD64/ARM64 image. Review corresponding-source delivery timing before any public image distribution; older image-first instructions alone do not satisfy that coordination. Pages stays disabled with no live-site README link and is a separate future decision. No further permissions/art replacement milestone is proposed.

## Release verification results (2026-11-11)

- 200 public tests, 447 historical-inclusive tests, 75 Python checks and seven protected-original checks passed. TypeScript/production build passed. Independent pinned MiiJS accepted all 10,000 records generated from the current model, with zero external requests; 28 Phase7 fixture records were also evaluated with expected negative cases retained.
- Chrome 157/macOS and Firefox 153/isolated Ubuntu ARM64 passed all 21 acceptance jobs. The initial WebKit 26.5/macOS matrix had 15/21 passing: the five documented protocol-offline File/Blob failures plus an additional production Wii test click/scroll timeout. The unchanged Wii acceptance test passed two isolated production reruns; the initial timeout and both reruns are retained in local reports. No assertion is removed, and the five established protocol-offline failures remain unresolved. Device/native Safari/Edge limitations remain.
- Ubuntu launcher/config unit checks passed (31 tests, three platform-specific skips); macOS Python process checks are included in the 75-check suite. Windows native execution, physical mobile and Finder/quarantine are not newly certified.
- A local ARM64 slim-runtime preflight passed static/files/MIME/security/health/restart checks (about 6.5 MB). Final clean-revision ARM64 and AMD64 images, real Compose and all five actual extracted archives are the remaining artifact handoff checks; their exact manifests/reports live under ignored release/. No publication is performed.
