# Mii Editor Web v0.1.0-preview.5

A software-QA preview with expanded Firefox/Linux coverage, safer drag cleanup and small-screen usability improvements. All editions run the same static editor; the 74-byte Mii format, original graphics and Wii software profile are unchanged.

## Download and start

Choose the **Windows**, **macOS** or **Linux** ZIP, extract it and run its Start Mii Editor script. An already-installed **Python 3.9+** is required. Keep the terminal open; the launcher opens your browser and prints its localhost link. Edit `port` in `config.json` and restart to change the default 8080. Changing the browser origin changes where saved Miis appear; export important files first.

For ordinary Apache/Nginx/static hosting, choose the **static ZIP**. It needs no development tools, PHP or application backend at runtime. The **Docker starter ZIP** contains Compose, environment example, guides and notices; it uses `ghcr.io/jstack01/mii-editor-web:v0.1.0-preview.5` after approved image publication. See the included START-HERE and checksum file. GitHub's automatic source archives are for development, not the ready-to-run website.

## QA changes and limits

- Firefox 153 was exercised on isolated Ubuntu ARM64 with external networking disabled. The macOS runtime still fails to launch on the development host.
- Mouse drags now stop safely when the browser reports a released button without the usual pointer-up event. Diagnostic layout and modern button targets were improved; mobile numeric fields advertise suitable keyboard hints.
- Chrome/Chromium and WebKit, emulated phone/tablet viewports, file/image/XML/repair/storage/sharing and actual distributions were tested within the scopes recorded in docs/PHASE8A_QA.md.
- WebKit forced-offline File/Blob failures remain visible. Independent primitive probes reproduce them without editor code; normal HTTP-blocked/no-external-network flows are separate evidence, not physical Safari offline certification.
- Native Safari/Edge, Windows desktop and physical iOS/Android coverage remain limited/unverified. No physical-device claim follows from viewport emulation.
- Phase 7A Dolphin display/reload findings are retained. Zero-owner Miis can display but Mii Channel may refuse editing them. Physical Wii and individual-game testing is **deferred indefinitely by owner decision** and does not block this software release. No Wii/game certification or guessed owner conversion is provided.

Mii editing and imports stay in the browser. Opening a shared URL sends its encoded Mii query to the chosen web host; logs/history may retain it. See the included privacy/hosting guides. This project is provided as-is, not a formal security audit.

## Original Project and Credits

Original application materials were found at https://mii-editor.nekoweb.org/ and https://archive.org/details/mii-editor; their credits identify senocular as the original developer. Thanks to the original creators and archivists. These hosting sources are not claimed to have created all historical materials.

**AI-generated / vibe-coded project — unmaintained.** Unofficial, provided as-is without planned support or contribution review. Forks are encouraged subject to applicable rights. New code remains unlicensed and historical artwork/vector rights unresolved. See LICENSE.md and NOTICES.md. Not affiliated with or endorsed by Nintendo or the original developers. Software validation does not guarantee compatibility with every Wii console or game.
