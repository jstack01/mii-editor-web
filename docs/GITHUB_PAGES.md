# GitHub Pages — stable browser edition

The owner approved this optional hosting deployment on **November 12, 2026**. It reuses the existing stable application; it is not a new software release or maintenance commitment. Deployment status and the actual live-site checks are recorded in MIGRATION_PLAN.md after verification.

Target: **https://jstack01.github.io/mii-editor-web/**

## Exact version and deployment

The manual `Stable website (manual)` workflow stages the published **v1.0.0 static ZIP**, SHA-256 `6a93a43a19b14c1a23785d63796dccceae9876cad02aa37de5cef2b4ef0a9ea5`, release source `842f2558ac3a5a61c6c479cf7b3a6a075d4a4f87`. The helper checks the complete archive hash, embedded clean build metadata and internal inventories before copying files. All application JS/CSS/vector bytes remain identical to stable v1.0.0.

Only the production index/assets, BUILD-INFO.json, eight required legal/source-notice files and `.nojekyll` are staged. The HTML gets a small visible disclaimer/credits/license footer and no-referrer metadata. No original Flash/ActionScript, development code, tests, audit packets, launcher files, caches or credentials are published as website files. No application base-path change is needed: existing `./assets/...` references work beneath `/mii-editor-web/`. No backend, account, analytics, external runtime library or new storage service is introduced.

GitHub Pages uses **GitHub Actions** as the source and the `github-pages` environment, restricted to main. The workflow is `workflow_dispatch` only, with no commit/release/pull-request trigger. Official checkout/upload/deploy actions remain pinned. The build/stage job has contents:read; only deploy receives pages:write and id-token:write, using the built-in token. No new PAT or secret is required. Repository Issues/PRs/Discussions/Wiki settings remain unchanged.

To deliberately deploy this same stable build again, manually run pages.yaml from main. A main-branch documentation commit does not redeploy anything. Neither container.yaml nor release publication is involved. Preserve the release/version pins unless a different application version is explicitly approved. A deployment can be disabled in Settings → Pages without deleting release assets; no automatic failover or ongoing maintenance is promised.

## Verification

`python3 scripts/prepare-pages.py` stages the exact published ZIP. `node web/scripts/pages-browser.mjs` tests that copy at the repository subdirectory on localhost. Add `--url https://jstack01.github.io/mii-editor-web/` to test the actual public HTTPS production site. The existing mobile/interaction suite also supports `--url` for the hosted site. MII_BROWSER_ENGINE selects the available Playwright engine; no native/device coverage is inferred from engine choice.

Checks cover all 13 categories, rendering, presets, randomization/name editing, binary/XML/image import/export, repair approval/cancel, reload and share restoration, no domain-root application asset requests, exact hosted-file hashes, required notices and preserved unrelated storage keys. Mobile tests reuse seven phone/tablet portrait/landscape viewports, taps, representative selection/color/adjustment controls, numeric keyboard hints, keyboard slider limits, Chromium native emulated touch dragging, modal bounds and cancel rollback. No physical phone or virtual keyboard is claimed. Reports and screenshots are local ignored files under release/pages-checks/ and release/pages-publication/; they are not site contents.

Local predeployment checks passed Chrome 157.0.8103.78 and Playwright WebKit 26.5; 200 public tests, TypeScript and 79 Python guards passed. Live-site/environment results are recorded after deployment. The site must return HTTPS successfully and match v1.0.0 before a Try Online link is added to README. Failures are investigated rather than silently skipped. This does not claim WebKit forced-offline behavior, native Safari/Edge or real mobile-device coverage is complete.

## Browser data and privacy

The stable storage contract is unchanged. LocalStorage is scoped to **scheme/host/port, not folder**. The character key is `mii-editor.character.v1`; the existing Mii ID/image preference keys retain their existing names and validation. Other project sites on `https://jstack01.github.io` share that browser origin and could share a key if they deliberately use the same one. This deployment does not add a migration, rename keys, copy data from localhost or clear unrelated keys. Valid existing records on this origin follow the existing startup precedence; incompatible input keeps the existing explicit review safeguards. Export important Miis before changing origins or clearing browser storage.

A record saved at localhost, a different port or hostname does not automatically appear here. Use an explicit `.mii` export/import if desired. Sharing preserves `/mii-editor-web/?mii=...`; shared URLs contain character data and are not private files. Edits and local file contents are not uploaded by application code. **Opening a shared URL sends its query to GitHub**, and GitHub Pages logs visitor IP addresses for security. No application tracking or analytics is added. See [GitHub's Pages privacy description](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages#data-collection).

HTML referrer metadata and noreferrer credit links avoid passing share queries on outbound navigation; they do not hide a query from the host or browser history. GitHub controls HTTPS, headers, caching and access logs; custom local/Nginx headers cannot simply be installed on Pages. There is no service worker or guaranteed offline edition. Browser download/storage/private-mode policies still apply.

## Platform and rights limitations

The [published Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) restrict commercial-transaction/SaaS-business hosting and sensitive transactions, with size/bandwidth/build limits. This small, free static project editor has no commerce, passwords or accounts and is far below the published size limit; no concrete technical/use-category blocker was identified. This is not GitHub approval of the content or a guarantee of future availability. GitHub's content/IP terms continue to apply.

MIT remains limited to the same **65 eligible modern files**. The live footer links to the complete stable license scope, historical credits and unresolved asset/font/inherited-code notices. Public web delivery distributes those assets; the owner's accepted risk is not permission or formal legal clearance. No license policy changes or rights-holder outreach is part of this deployment. Physical Wii/game testing remains indefinitely deferred; existing software-validation/Dolphin findings do not imply hardware certification. See [NOTICES.md](../NOTICES.md), [browser coverage](BROWSER_COMPATIBILITY.md) and [Wii/Dolphin evidence](../web/PHASE7_VERIFICATION.md).
