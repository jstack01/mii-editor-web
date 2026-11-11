# Optional GitHub Pages live demo

**Prepared locally, not enabled or published. Owner approval is required before enabling Pages or running the deployment.** This is an optional deployment of the completed editor, not a new development phase or maintenance commitment.

Expected URL: **https://jstack01.github.io/mii-editor-web/**

## Proposed deployment

Use the manual `Live demo (manual, owner approval required)` workflow in `.github/workflows/pages.yaml`. It downloads the existing preview.5 static ZIP, verifies its hardcoded SHA-256 and embedded release revision/internal inventory, then stages only the production website and notices. The application JavaScript/CSS/vector data are unchanged. It adds a small disclosure footer, a no-referrer HTML meta tag, and `.nojekyll` to the demo copy. It does not alter the released ZIP.

The release input is `mii-editor-web-static-v0.1.0-preview.5.zip`, SHA-256 `f1ec763e6932537283c7cb6b009c8aa7e325192198048e368670283adaa2252e`, source `27da544cb9b8e1feac14001e4de65529d440b549`. The workflow uploads only `release/pages-site`, never the repository. No SWFs, ActionScript, tests, launcher/config files, evidence, dependencies or Git metadata are served. Application runtime needs no account, backend or build tools. The Pages build job uses Python only to verify/stage the existing static files; it is not a server.

Official upload/deploy actions are pinned to reviewed commits. There is only a `workflow_dispatch` trigger: no automatic deploy on commits, pull requests or releases. Deploy is restricted to main in this repository. Only the deploy job gets `pages: write` and `id-token: write`; content access is read-only. There are no personal tokens or new services. See [GitHub's custom workflow requirements](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

After explicit approval:

1. Push the prepared deployment files to the existing repository.
2. Set **Settings → Pages → Source → GitHub Actions**. Keep the default github.io domain; use HTTPS. If the GitHub Pages environment has branch restrictions, allow main only. Keep Issues/PRs/Discussions/Wiki disabled.
3. Manually run the live-demo workflow from main. Do not dispatch the unrelated container workflow.
4. Verify the actual HTTPS URL, subdirectory assets, notices, downloads, sharing and persistence. Only after success, add one prominent **Try Online** link below the README description. No release, tag, Docker image or release asset needs changing.

The repository Pages API returned 404 on November 10, 2026; Pages was not configured. No setting or hosted site has been changed during preparation. An actual Actions/deployment run and host-specific behavior remain unverified until approval. No custom domain, DNS or paid service is required. Rollback: disable Pages in Settings, or rerun this same pinned deployment to restore the exact demo; neither action changes existing downloads or Docker versions.

## Verification on November 10, 2026

`python3 scripts/prepare-pages.py` stages the exact release ZIP. `node web/scripts/pages-browser.mjs` serves it locally at `/mii-editor-web/`, runs the shared actual-distribution checks and records results under ignored `release/pages-checks/`. For WebKit, prefix the command with `MII_BROWSER_ENGINE=webkit`. These are developer checks, not instructions required by visitors.

- Fresh Vite/TypeScript production build passed; every application asset matches the pinned static release byte for byte.
- All 200 public unit/integration tests passed.
- Chrome 157.0.8103.40 and Playwright WebKit 26.5 on macOS passed all 13 screens, Default Boy/Girl, randomization, exact 74-byte binary save/reimport, XML save/import, PNG/JPEG downloads, repair approval/cancel, preview rendering, share pathname/query restoration and same-origin persistence through server restart/reload.
- No unexpected external application requests or browser errors occurred. Visible notices and legal links work. Development/original/private paths return 404. Internal inventories and the pin are checked before staging.
- Production `base: './'` keeps assets beneath the repository prefix. Shared URLs retain `/mii-editor-web/?mii=...`; no routing rewrite, SPA fallback, Vite base change or backend is required. The browser test screenshot is `release/pages-checks/chromium/github-pages-subdirectory.png`.
- This does **not** add native Safari/Edge, Firefox, physical mobile, forced-offline or hardware coverage. Prior Phase 8A limits and indefinitely deferred physical Wii/game testing remain in force. See [browser coverage](BROWSER_COMPATIBILITY.md) and [Wii/Dolphin evidence](../web/PHASE7_VERIFICATION.md).

## Licensing, privacy and hosting limits

Public web hosting distributes the historical-derived vectors and glyphs to visitors, even though no original SWF/ActionScript is uploaded. **No explicit historical-asset redistribution permission has been established.** Existing public releases do not resolve that concern. The owner's approval does not grant third-party rights; permission from applicable rightsholders remains unresolved. Newly written code stays unlicensed. No license position, attribution or ownership claim is changed. Review [LICENSE.md](../LICENSE.md) and [NOTICES.md](../NOTICES.md) before approving another public distribution. The on-page footer retains historical sources, senocular credit, no-affiliation, AI-generated/unmaintained and compatibility disclosures.

The app adds no tracking, analytics, account system or third-party runtime requests. **GitHub Pages itself logs visitor IP addresses for security**, as explained in [GitHub's documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages#data-collection). Opening a shared URL sends its full Mii query to GitHub and may retain it in history/logs. Files opened/edited in the app are not uploaded by application code. The meta referrer policy avoids leaking shared queries via outbound navigation; it does not hide them from the hosting provider. This is not a confidential file-hosting service.

Browser saves belong to the origin `https://jstack01.github.io`; they do not transfer from localhost. Other project sites on that same origin share browser storage scope, so do not treat the repository path as isolation. Export important `.mii` files. Private browsing, download policies, cleared storage and browser settings still apply. GitHub controls HTTP headers, caching, access logging and availability; this preparation cannot configure the local/Docker server headers on Pages. The demo has no service worker or promised installable/offline edition.
