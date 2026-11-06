# Optional isolated Linux browser QA

This image is a **local developer test environment**, never the production image or a release asset. It uses the digest-pinned official Playwright 1.62.1 Ubuntu Noble image, matching the project lockfile, and runs browsers as its non-root `pwuser`. No host security setting, browser sandbox preference or privileged mode is changed. Use a clean public checkout, or a `git archive` snapshot, as the source context. The Dockerfile-specific allowlist excludes dependencies, test output and local historical tests/tools.

```sh
docker build -f optional-tools/qa/Dockerfile -t mii-editor-qa:local .
docker run --name mii-editor-qa-run --init --network none --shm-size=1g --cap-drop ALL --security-opt no-new-privileges:true -e MII_BROWSER_ENGINE=firefox mii-editor-qa:local node scripts/qa-browser-suite.mjs
docker cp mii-editor-qa-run:/work/web/test-results ./qa-results
docker rm mii-editor-qa-run
```

Use `webkit` or `chromium` for other engines; for Chromium add `-e PLAYWRIGHT_CHANNEL=chromium` because branded Chrome is not in the official test image. The runtime has no external network; the test Vite/HTTP server is reachable only within the container's loopback. Dependencies are installed at build time. No production server/port is published and no Mii data leaves the test environment. Remove the stopped container after collecting evidence. Do not point QA restart scripts at unrelated containers.

`qa-browser-suite.mjs` runs every development/production acceptance script, mobile/preset checks, drag-release regression and independent offline primitives. It records each failure and returns a nonzero status if any fail; a failure does not prevent collecting the remaining coverage. The existing forced-offline WebKit failures are **not skipped**. Primitive probes load no editor code; online/offline/restored comparisons distinguish their scope. HTTP-blocked tests and `--network none` are useful separate evidence, not proof of physical Safari's offline behavior.

Diagnostics are available separately:

```sh
MII_BROWSER_ENGINE=webkit node scripts/offline-browser-probe.mjs
MII_BROWSER_ENGINE=firefox node scripts/pointer-boundary-probe.mjs
```

Run these from `web/` with that engine installed. `MII_OFFLINE_PROBE_OUTPUT`, `MII_POINTER_PROBE_OUTPUT` and `MII_QA_REPORT_DIR` select local evidence destinations. Native Safari/Edge, Windows desktop and physical mobile devices are not implied by this Linux engine coverage. See [the QA report](../../docs/PHASE8A_QA.md).
