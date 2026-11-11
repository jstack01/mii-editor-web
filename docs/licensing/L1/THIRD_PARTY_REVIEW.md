# Third-party software, build inputs and containers

Local review draft. The inventory distinguishes tools used to build/test from code actually redistributed. No dependency versions or licenses have been changed.

## Browser/source dependencies

`web/package.json` has four direct **devDependencies**: Vite 8.3.5 (MIT), TypeScript 7.0.2 (Apache-2.0), Playwright 1.62.1 (Apache-2.0) and Vitest 5.1.0 (MIT). There are no declared npm production dependencies. All **84 frozen-lockfile entries**, including optional platform variants, are enumerated in [dependency-inventory.json](dependency-inventory.json). Installed entries were checked against local package manifests and license-file hashes; unavailable platform metadata was retrieved from the npm registry at its exact version. Metadata declarations should still be backed by actual license texts when redistributing those binaries; nested/vendored Rust/native components may have additional notices.

Declared license families: MIT, Apache-2.0, BSD-3-Clause, ISC and MPL-2.0. Lightning CSS 1.33.0 and its platform packages declare MPL-2.0; that is a build tool, not a bundled browser library. Mozilla's [MPL FAQ](https://www.mozilla.org/en-US/MPL/2.0/FAQ/) describes file-level source obligations upon distributing covered software. Using it to process our CSS does not, by itself, make its generated output MPL or require this entire app to adopt MPL. If tool source or binaries are later bundled, honor their own terms and source-notice obligations. Tests/browser engines/Node/pnpm are not in the ZIP website; the production container's build stage is not the final runtime image.

Vite's small module-loading helper **does** enter the JS output. `LICENSES/Vite-LICENSE.md` preserves Vite's MIT text and bundled dependency notices (including BSD-2-Clause, CC0, ISC and MIT contributions). `web/scripts/copy-notices.mjs` includes that notice in production; ZIP packaging and the Docker image retain it. No evidence was found that current JS needs a blanket GPL license because of build/test dependencies. Do not conflate this with clearance of embedded historical graphics or ports.

The owner may MIT eligible project code while leaving third-party code under its original compatible terms. Preserve copyright and license texts; don't replace upstream notices with a new owner copyright. SPDX/package metadata for a future mixed distribution needs accurate scopes rather than pretending the whole bundle is MIT.

## Analysis-only references

- **MiiJS:** pinned `de10c3c5237fbf18da88ac860f5c0ac7ad1a3b4b` package.json declares ISC, version 3.1.1. GitHub's automatic license endpoint returned 404; do not report that as no license or copy its full dependency/rendering stack under ISC without further review. Only the project's invocation harness and factual validation results are in this repo/runtime distribution; MiiJS is not bundled into the website.
- **RFL / ogws:** pinned `e5a4d369011062fe243aa63f6c2e2853854c395d` repository LICENSE declares CC0. This is a contributor declaration, not proof those contributors owned original Nintendo expression or could waive third-party rights. The production profile uses factual range/format checks, not a bundled RFL library. Preserve independent interoperability research distinction; don't use the CC0 heading to relicense Nintendo binaries/artwork.
- **Mii-Database-Editor Util.java:** pinned `ae6a5372b302f5036f82c21db6a050cff1c486b4`; no reusable license identified through the repository license endpoint. The optional helper fetches the exact file only with an explicit research option and doesn't ship Util.java. New `ReferenceDatabase.java` calls its APIs rather than copying the whole utility. Keep it out of packaged products; clarify upstream rights before any redistribution.
- **Dolphin/QA:** legal user-local emulator resources and external test browsers are not included in the public app/package. Do not publish NAND, Mii Channel binaries, game images, keys or local test environments. Existing synthetic fixtures and reports are not an assertion of rights to Nintendo resources. QA Docker images remain local development tools, separate from public app images.

## Actual Docker runtime finding

Inspected exported filesystems of the published **preview.5 ARM64 and AMD64 images** without starting the app or altering any existing container. The APK package/version/license sets match on both architectures: **70 packages**. Full details are in [docker-arm64-packages.json](docker-arm64-packages.json) and [docker-amd64-packages.json](docker-amd64-packages.json). The same pinned Nginx/Alpine base is used by preview.4; this audit did not rebuild or retag either.

Actual retained notices include:

- `/usr/share/licenses/nginx/COPYRIGHT` (Nginx permissive terms, Igor Sysoev/Nginx copyright).
- Separate module copyrights under nginx-module-geoip/image-filter/njs/xslt.
- `/usr/share/licenses/nginx-unprivileged/LICENSE` (Apache-2.0 project image notice), copied from the pinned upstream source.
- Website LICENSE.md, NOTICES.md and Vite notices.

**The runtime is not only Nginx plus MIT files.** Examples: BusyBox, apk-tools/libapk, alpine-baselayout and scanelf declare GPL-2.0-only; gettext-envsubst declares GPL-3.0/LGPL/MIT components; libintl, geoip, libidn2 and libunistring have LGPL/GPL expressions; musl-utils and compiler libraries contain mixed licensing; njs-related components have MPL/MIT; FreeType permits FTL or GPL and other image libraries have separate terms. Package metadata may simplify mixed components or exceptions (e.g. GCC runtime exceptions); inspect the actual corresponding source and license instead of using the simplified expression alone.

**Clearance gap:** the app currently retains two main upstream notices and module copyrights, but a complete per-component license/source-access fulfillment for everything in the public image is not recorded. The audit did not find a project-maintained matching-source bundle or explicit selected source-offer strategy. That is a compliance review item, not a definitive finding that any particular public distribution violates a license. A public upstream image and digest pin do not automatically discharge a downstream distributor's obligations.

Before a stable image:

1. Produce a full component/notice record for the exact selected base and architectures, including the binaries actually present after final layers and all applicable exceptions/license alternatives.
2. Choose and satisfy applicable GPL/LGPL/MPL source-access/distribution requirements using the actual license texts. Provide matching preferred-source/build/patch information or another legally sufficient route under each selected license, and retain proof it is accessible to recipients. Don't assume a generic upstream homepage, an unversioned link or someone else's offer suffices. Any written offer must be accurate and sustainable for an explicitly unmaintained project; bundling/hosting the corresponding materials may be more practical, subject to review.
3. Preserve required notices in the image and release docs. The reference texts are [GPLv2](https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html), [GPLv3](https://www.gnu.org/licenses/gpl-3.0.en.html) and [MPL 2.0](https://www.mozilla.org/en-US/MPL/2.0/). The GNU pages timed out in this audit's browser fetch; do not claim a fresh complete license-text comparison was performed merely because the package labels identify GPL.
4. Optionally evaluate a smaller base without unused Nginx modules to reduce the component burden, but only after approval, with exact-image checks and new notices. Do not silently replace runtime components or claim this audit already cleared such an alternative.

The separate static browser app does not automatically become GPL merely because an unrelated GPL utility shares its OCI filesystem. Conversely, that separation is not an exemption from distributing that utility correctly. No old image/license was changed here. Docker licensing is an independent stable-distribution gate even if historical artwork permission is obtained.
