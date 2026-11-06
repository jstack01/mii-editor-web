# D3 Docker verification — local preparation, no public upload

Host: macOS 27.0.1 ARM64. Docker Desktop 4.89.0, Engine 29.7.2, Buildx 0.36.1 and Compose 5.5.0. The existing engine was started; no Go/PyInstaller launcher or new application backend was introduced.

## Runtime / build inputs

- Nginx Unprivileged **1.30.6 Alpine**, multi-platform index sha256:44e74ca483234093081138b6d7b6f561d55557756a2deefc3a5056148defeb99. Upstream base source revision 679834d1aa245a42e680d380c6b57785cfaa2115; Apache-2.0 notice retained alongside the base's Nginx COPYRIGHT. Source: https://github.com/nginx/docker-nginx-unprivileged .
- Node 24 Alpine builder index sha256:a34ab6d7f6f4813f4d0c5469d74685604b962fbdbf5793a7bc7b4998ecb867c8, pnpm 11.25.0 and frozen lockfile. The Dockerfile frontend is digest-pinned too. Static build runs on BUILDPLATFORM and is reused for target runtimes.
- Final runtime has no Node/Python/Vite, app TypeScript/tests/diagnostics, original Flash/ActionScript, evidence, Git metadata, credentials or development dependencies. Docker rootfs export and website allowlist/hash checks verify actual files. Original data/artwork licensing remains unresolved independently of base licenses.
- OCI labels include the application repository/version/revision, base identity, source-derived date, unmaintained status and application licensing/provenance references. They do not inherit misleading claims that upstream Nginx maintainers maintain this application.

## Architecture execution and size

| Target | Build | Actual execution | Approximate image size reported by Docker |
| --- | --- | --- | --- |
| linux/arm64 | Passed | Native relative to ARM64 Linux Docker VM on this Mac | 23.5 MB |
| linux/amd64 | Passed | AMD64 emulation on the ARM64 Docker engine | 23.4 MB |

A local OCI archive was exported without push and its index/layer descriptors inspected. It contains both target platforms plus normal attestation descriptors. This proves multi-platform construction locally, not a public registry manifest or native physical AMD64 execution. Final exact sizes/digests/source revisions are stored locally with the clean-commit reports. Application index/JS/CSS/notices hashes match between target runtimes; normalized build metadata/mtimes use the supplied source commit. Pins and the lockfile make inputs repeatable; no promise of identical time-bearing provenance attestations across independent builds is made.

## Actual-image checks

scripts/verify-container.py starts each local image with user 101, read-only root, dropped capabilities, no-new-privileges, PID limit and a small ephemeral /tmp. It verifies localhost-only publishing, no host binds, UID, nginx -t, the real health command, root/HEAD/assets/MIME, GET/HEAD-only behavior, no hidden/development/traversal routes/listing, notices, query preservation, runtime binary/rootfs exclusions, restart and graceful exit code 0.

Chrome tests against the running ARM64 image, AMD64 image and real Compose service passed: all 13 screens, original-vector preview, Default Boy/Girl, software-valid randomization, editing, actual exact 74-byte Mii download/reimport, XML, PNG/JPEG, non-destructive repair/cancel, share URL restore and persistence after docker restart at unchanged URL. No external/obsolete-service application requests or browser errors occurred. These are image-served tests, not Vite server substitutes.

Compose was rendered with default/custom ports and actually run/up/down/recreated under an isolated project name and loopback test port. It used a local-only tag matching the future GHCR name and --pull never; this does **not** count as an authenticated/anonymous registry pull or upload. Only one service/network, no persistent volumes/host paths/databases/privileged app mode. The ordinary user launchers on 8080/8090 were not stopped or reconfigured for these tests.

The committed public Git snapshot is rebuilt without SOURCE/, EXTRACTED-SWF/, private evidence/tools or local dependencies, confirming it is a standalone Docker build. Final image/browser and extracted ZIP/starter checks are rerun against the clean commit before handoff. Images and OCI tarballs remain local; the release starter contains instructions/configuration/notices, not a bundled image tar.

## Retained regressions

199 public tests / 446 public+historical tests, TypeScript/build, 49 Python launcher/config/packaging/container guards, seven protected-source checks, full existing Chrome development/production pipelines and preset/mobile viewport checks passed. The independent pinned MiiJS decoder accepted 10,000/10,000 generated records and all seven reviewed corpus outputs. No codec, Wii policy, renderer or artwork changes were made.

Existing browser gaps and WebKit forced-offline test failures remain disclosed in BROWSER_COMPATIBILITY.md. No native Windows Docker host, native physical AMD64 host, native Safari/Edge/Firefox or physical iOS/Android certification is added by D3. No real Wii/game certification or Phase 7 work is performed.

## Publishing checks and outstanding gate

Dockerfile lint and workflow YAML parsing passed. Read-only GitHub API checks confirmed Actions enabled, official actions allowed, default workflow token read-only and current owner CLI repo/workflow scope. The manual workflow limits contents:read to verification and adds packages:write only to the conditional publish job. It is not pushed/dispatched in this milestone, so actual GITHUB_TOKEN write permission remains unverified until approved execution.

GHCR visibility is independent from repository visibility; no package-public/anonymous-access claim is made yet. The documented settings UI may require a one-time owner Public selection. After approval/upload, scripts/verify-ghcr-anonymous.py must verify both manifest architectures, empty-credential pulls and approved source labels. The GitHub release helper refuses the Docker release without its matching report. See CONTAINER_PUBLISHING.md for the exact safe sequence.

All final local reports/checksums are retained under ignored release/; selected working logs are under /private/tmp/mii-d3/. No original protected files or previous public release assets/tags are modified. Public image/tag/release publication is a separate owner approval step.


## D3 publication result

Preview.4 is published at https://github.com/jstack01/mii-editor-web/releases/tag/v0.1.0-preview.4 and ghcr.io/jstack01/mii-editor-web:v0.1.0-preview.4. Registry index digest: sha256:8dfc8c4b82fb7dd8c96923908ab1b6c1f744976a96cb19bdf426bb37d8c2af6c. Released source/image revision: 141e525a7a11521bf18043179260ccd191871db8. GitHub’s package page confirms Public visibility and the connected repository; both architecture tag/leaf pulls passed with empty credentials. No owner sign-in is needed for public pulls, and no manual visibility change was necessary.

The GitHub runner additionally executed AMD64 natively and ARM64 under emulation after fixing the older CLI inspection path. Its publish step succeeded; the final metadata check failed solely because the package REST API requires read:packages authentication even when registry access is public. Independent clean anonymous pulls and public-page metadata checks passed. The follow-up verifier correction preserves those checks without adding account scopes or changing the published image/source tag. Published release ZIPs/checksums were redownloaded and verified. Earlier releases remain unchanged.
