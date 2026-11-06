## Mii Editor Web v0.1.0-preview.2 — prerelease

D2 introduces simple foreground local launchers and a separate static-hosting ZIP. Download the edition for macOS, Linux or Windows, extract it and read START-HERE.md. Local launchers require an already-installed Python 3.9+; The owner manually tested the Windows and macOS launchers successfully. Python must already be installed; Windows is not promised installation-free. Real Linux desktop testing remains pending. No compiled Go/PyInstaller launcher or standalone-HTML edition is included. No software is silently installed or security policy bypassed.

The default local origin is http://127.0.0.1:8080/. Startup waits for an HTTP readiness check before requesting the default browser; the terminal shows a normal URL and an OSC 8 link where supported. Port conflicts never select another port. Ctrl+C/terminal hangup stops the foreground server. A browser-opening failure displays the manual URL.

**Migration:** preview.1 used 127.0.0.1:8765. Export important characters with the old launcher, then import into D2. Browser storage is not shared between those origins. Localhost links are not publicly hosted share links.

The static ZIP works at / or /mii-editor/ on normal Apache/Nginx hosting with no application backend or launcher. Local and static editions contain the same compiled editor. Original binary codec, software validation, renderer and artwork are unchanged. Preview.1 remains unchanged. Checksums accompany all packages. GitHub Source code archives are developer sources, not the ready-to-run local/static editions.

AI-generated / vibe-coded project — unmaintained, unofficial, as-is, no planned support or accepted pull requests. New code is unlicensed and original-derived vector/glyph rights remain unresolved. See LICENSE.md/NOTICES.md. Original materials were obtained from https://mii-editor.nekoweb.org/ and https://archive.org/details/mii-editor; their FAQ/metadata credit senocular. Not affiliated with Nintendo or the original developers.

Platform limits, real-device/cross-browser work (6.2), remaining deployment verification (6.3), physical Wii/emulator/game verification (7) and final release checks (8) remain open. Software validation is not hardware certification. The owner approved publication after successful manual Windows and macOS testing. OS versions and detailed manual test coverage were not supplied; broader platform certification is not claimed.

Choose **mii-editor-web-macos-v0.1.0-preview.2.zip**, **mii-editor-web-windows-v0.1.0-preview.2.zip**, or **mii-editor-web-linux-v0.1.0-preview.2.zip** for local use. Choose **mii-editor-web-static-v0.1.0-preview.2.zip** for an existing web server. Verify downloads with **SHA256SUMS-v0.1.0-preview.2.txt**. GitHub’s automatic Source code ZIP is not the prebuilt application.
