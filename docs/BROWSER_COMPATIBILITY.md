# Browser compatibility — Phase 8A

Test date: 2026-11-06. Host macOS 27.0.1 (26A434), ARM64; isolated Linux environment Ubuntu 24.04.4 ARM64 in Docker's Linux VM. Browser engine coverage is not branded-browser or physical-device certification. No operating-system security settings or Firefox sandbox preferences were disabled.

| Environment | Actual coverage |
| --- | --- |
| Google Chrome 156.0.8078.80 / macOS | Full 21-script candidate QA matrix passed: development/production suites, presets, mobile, lost-button drags and offline primitives. |
| Playwright Firefox 153.0 / Ubuntu ARM64 | Full 21-script candidate QA matrix passed as non-root `pwuser`, with external networking disabled. Native to the ARM64 Linux VM, not Windows/macOS Firefox certification. |
| Playwright Chromium 151.0.7922.34 / Ubuntu ARM64 | Available in the pinned official Playwright image; exercised through the same matrix. Exact final execution report is retained under `release/phase8a/`. |
| Playwright WebKit 26.5 / macOS and Ubuntu ARM64 | Normal rendering/GUI/XML/interactions/repair/profile/mobile flows pass. Existing forced-offline file and image suites fail in development and production, plus the independent primitive probe; these remain failures, not skipped tests. |
| Firefox 153.0 / macOS | Still cannot launch: sandbox-extension/helper and SWGL framebuffer errors, followed by launch timeout. Linux provides actual application coverage without weakening host security. |
| Installed Safari | Remote Automation is disabled; not enabled by this work. WebKit is not a branded Safari test. |
| Microsoft Edge | Not installed/available. Chromium coverage is not branded Edge coverage. |
| Physical iOS Safari / Android Chrome | Not available/tested. No device purchase or owner-supplied device is required. Desktop emulation does not verify OS file pickers, native keyboards or device downloads. |

## Confirmed fixes and test evidence

Firefox exposed a lost-button drag issue. When automation leaves the browser viewport, Firefox may omit pointer-up or deliver an unpressed mouse move. Body/XML/image-slider/pan drags now release capture before applying such coordinates; hover state clears on lost capture. Native capture plus a controlled missing-release event proves no value/camera/record mutation and no lingering capture. The ordinary outside-control/window and exact fractional source-coordinate assertions remain. Outside-browser coordinates alone cannot be assumed to be delivered identically by every automation protocol; a no-editor primitive probe records that boundary.

An intermittent Linux Chromium import check exposed a cancellation-notification race: a delayed "No changes applied" message could overwrite the next invalid-file error. Cancellation now reports synchronously; delayed callbacks restore focus only. A controlled regression fails on the old behavior and passes without changing current bytes.

Linux Chromium touch dragging also triggered browser history-back overscroll. Horizontal containment prevents leaving the app during a feature drag; the same seven-viewport native-emulated drag matrix then passed. Vertical scrolling and pinch zoom remain enabled (physical pinch feel is unverified).

The Firefox diagnostic test bench also exceeded its fixed surface's bottom padding with Linux font metrics. Slightly smaller vertical padding and accurate, shorter explanatory text fix the layout without clipping content or changing the character renderer/original editor geometry. Existing fit/scroll assertions remain unchanged.

Firefox drops the constructor-supplied clipboard payload on a synthetic ClipboardEvent ([Mozilla issue](https://bugzilla.mozilla.org/show_bug.cgi?id=2027025)). The paste-handler test now explicitly supplies **and verifies** its controlled payload before dispatch, retaining the original filtering/output assertions. This is not a claim of native OS clipboard automation. No application paste workaround was introduced.

Modern HTML status/repair buttons have at least 44px targets. Birth-date inputs request numeric keyboards, image numeric fields request decimal keyboards, and technical fields disable automatic capitalization. The original uniformly scaled SVG interface is preserved; some historical palette controls remain small on narrow phones and browser zoom may help. There is no new Mii editing feature or codec change.

## WebKit forced-offline investigation

The independent `offline-browser-probe.mjs` loads **no editor code**. On macOS and Linux, native/synthetic File reads, FileReader, Blob reads/fetches and minimal SVG-Blob image decoding work before forced-offline mode, fail after `context.setOffline(true)`, and recover after restoring it. Minimal image decoding reports EncodingError; a direct canvas Blob download can still succeed. This isolates a broader browser/emulation primitive failure, rather than demonstrating malformed editor graphics or a broken Mii decoder.

Linux WebKit was run with **no external network interface**. Its primitive `navigator.onLine` was already false before Playwright's offline toggle, yet local File/Blob operations worked; toggling the protocol state broke them. HTTP-blocked application flows and no-external-network execution are valuable separate evidence. They do **not** turn forced-offline failures into passes or certify physical Safari's offline behavior. The app is not forced online and no alternate reader hides the failure. Playwright documents [offline emulation](https://playwright.dev/docs/api/class-browsercontext#browser-context-set-offline); related upstream WebKit reports are context, not proof of this project's exact cause/fix.

## Mobile scope

Emulated 320×568, 360×640, 390×844, 568×320, 844×390, 768×1024 and 1024×768 viewports cover all 13 category paths with representative feature/palette/adjustment taps, keyboard slider limits, presets, viewport/orientation changes, long filenames, bounded/scrolling repair UI and cancellation without byte changes. Chromium's native emulated touch path verifies drag capture/release; other engines test taps and keyboard/mouse separately. Existing image/file/XML/storage/sharing suites retain their exact binary, signature, dimension and rollback checks.

Viewport shrinking checks layout/data stability only; it does not simulate a physical virtual keyboard. Actual touch feel, pinch-zoom, browser chrome, OS download/share sheets, regional fonts and device-specific behavior remain unverified. See [Phase 8A results](PHASE8A_QA.md), [screenshots](images/phase8a-phone.png), [security/privacy](SECURITY_PRIVACY.md) and the [optional Linux QA recipe](../optional-tools/qa/README.md).

## Other limits

Native Windows launcher execution and desktop Linux double-click/browser associations are not implied by Linux container tests. Existing rendering/font/nine-slice/antialiasing differences and deferred tutorial work remain. Phase 7A's bounded Dolphin results are retained; physical Wii and individual-game certification are deferred indefinitely and do not block an honestly scoped browser release. See [the roadmap](../MIGRATION_PLAN.md) and [Wii profile](../web/WII_PROFILE.md).
