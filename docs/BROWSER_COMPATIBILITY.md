# Milestone 6.2 — verified coverage and remaining limits

Host: macOS 27.0.1 (26A434), ARM64. Tests exercise the actual production build and original vector assets. Engine tests are not native-device certification.

| Environment | Result / scope |
| --- | --- |
| Google Chrome 156.0.8078.80 | All eight existing development and production pipelines pass; desktop/phone portrait/phone landscape/tablet matrix passes. |
| Playwright Chromium 151.0.7922.34 | Installed runtime; new desktop/emulated-touch preset/navigation/edit/file/image/repair/persistence/share matrix passes. |
| Playwright WebKit 26.5 | Rendering/62 XML cases, GUI, full interactions, corpus compatibility, Wii profile and repair UX pass in development and production. New desktop/emulated-touch matrix passes, including HTTP-blocked file/image flows. Two existing forced-offline suites fail as detailed below. |
| Playwright Firefox 153.0 | Runtime installed, but both headless and headed startup fail on this host with sandbox-extension/helper/GPU errors. No application coverage claimed; no sandbox/security settings disabled. |
| Installed Safari | Official safaridriver session creation refused because Allow Remote Automation is disabled. Setting left unchanged. WebKit tests do not constitute Safari testing. |
| Microsoft Edge | Not installed / unavailable; no branded Edge coverage claimed. |
| Physical iOS Safari / Android Chrome | Devices unavailable. Viewport/touch emulation does not verify native keyboards, browser UI, OS file pickers or device-specific downloads. |
| Windows / Linux launchers | Shared config parser and packaged server tested on macOS, plus POSIX wrapper checks. Owner tested preview.2 startup on Windows/macOS, not preview.3 config changes. Native Windows/Linux preview.3 verification remains open. |

## Changes supported by evidence

The original 640×500 stage was scaled visually but retained unscaled layout overflow/minimum content height. Making the viewport a clipped positioned container and the stage absolute removes mobile horizontal overflow, excess blank space and interference with preset-link taps without changing any SVG geometry. Default links have readable text, 44px-high touch areas, visible keyboard focus and native Enter activation.

macOS WebKit skipped HTML repair buttons during native Tab navigation. The existing modal focus loop now explicitly visits all visible controls in the same order, retaining Cancel autofocus, Shift+Tab, Escape, focus restoration and transaction checks. No validation or repair logic is weakened.

WebKit floors native clientX/clientY to whole CSS pixels. A 100-unit source-space mouse request at scale .5375 delivered x=171 to x=225 rather than 171.7875 to 225.5375; the correct source slider result is 56 rather than 55. The browser tests now assert exact Mii bytes from delivered input and bound the request/delivery error. Image tests additionally retain the original fractional 50.8/405 contracts through a constructed fractional move during genuine pointer capture, after checking native input. Original ActionScript math and historical unit oracles are unchanged; no tolerance replaces binary equality.

## Known failing forced-offline WebKit checks

The original files-browser suite fails while importing repeat.mii after context.setOffline(true). A focused probe found NotReadableError from both File.arrayBuffer and FileReader, including native disk-path inputs and synthetic buffer inputs. The original images-browser suite reaches its final forced-offline PNG/JPEG block but cannot obtain a download. These failures are retained, not skipped or reclassified as passes. They occur in both development and production forced-offline runs.

The new matrix blocks every HTTP/HTTPS request during import/export instead of toggling browser offline state; those binary/XML/PNG/JPEG flows pass on WebKit, Chrome and Chromium. This separately proves those tested operations require no HTTP service, but does not erase the forced-offline failures or establish physical Safari offline behavior. Failed imports keep current bytes unchanged. No speculative alternate reader or online-forcing workaround is introduced. Test actual Safari offline file/image behavior manually before promising full offline support across engines.

## Tests and evidence

- 199 public tests / five files; 446 full public+historical tests / 14 files; TypeScript/build; 40 Python config/launcher/packaging checks; seven protected-source integrity tests.
- Independent pinned MiiJS accepts 10,000/10,000 final generated records and both preset appearance records with normal test IDs. Profile calendar/ID rules remain separate from scalar decoder acceptance and physical hardware certification.
- Chrome: all eight development and eight production browser pipelines pass. WebKit: six pipelines per mode pass after fixes; files/images retain the forced-offline failures. Normal image pixel/alpha/size/slider/pan/snapshot checks pass before that failure.
- Four viewport profiles (1024×900 desktop, 390×844 phone, 844×390 landscape, 768×1024 tablet) per new-matrix engine cover all 13 categories, feature/palette taps, keyboard preset loads, real original-vector previews, binary/XML/PNG/JPEG operations, repair cancellation, storage/reload, sharing, viewport changes, layout overflow and HTTP-blocked operations. Chrome’s existing CDP test covers native emulated touch dragging/cancel/capture; WebKit taps are emulated and existing pointer dragging uses mouse input. Do not call these physical touch or virtual-keyboard tests.
- Screenshots: docs/images/presets-desktop.png and presets-mobile.png; the full local captures and reports live under web/test-results/milestone62/. Selected logs/probes are retained locally under release/milestone62/ (ignored and not shipped); temporary working logs are under /private/tmp/mii62/; generated test artifacts are not shipped. Extracted distribution tests cover four editions at root/nested local and isolated Apache deployments, with preset loads, config-selected ports and server-restart persistence. The user's preview.2 server occupies 8080 and is left untouched; macOS package verification explicitly selects 8090 in its copied config.json.

## Remaining acceptance work

Milestone 6.2 has implemented its features and available-environment fixes; full browser/device coverage remains open. Run Firefox on a working supported runtime, native Safari/Edge, Windows/Linux preview.3 config startup and physical iOS/Android tests (including keyboards, orientation, scroll, file pickers/downloads and offline use). Resolve/classify the WebKit forced-offline failures with native evidence. For phone testing, deploy the static ZIP to a trusted HTTPS site; local launchers intentionally cannot be reached from other devices over Wi-Fi.

Remaining 6.3 hosting/TLS verification, Phase 7 destination/hardware acceptance and Phase 8 final checks remain open. No hardware/game certification or broad browser certification is claimed. Preview.3 stays local until explicit publication approval.
