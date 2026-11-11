# Mii Editor Web v1.0.0

The existing browser editor, now packaged as a stable release for its documented software scope. Create/edit Miis, load/save 74-byte `.mii` and XML, share characters, and export PNG/JPEG images without Flash or an application backend. No new editing features or Mii-format changes are introduced.

- **Windows/macOS/Linux:** download your platform ZIP, extract it and run its Start Mii Editor script. An existing **Python 3.9+** installation is required. Edit `port` in config.json and restart to change port 8080.
- **Static hosting:** upload the static ZIP contents to an ordinary web host. No runtime development tools/backend are required.
- **Docker/Compose:** use `ghcr.io/jstack01/mii-editor-web:v1.0.0` (AMD64/ARM64), or extract the Docker starter ZIP and run `docker compose up -d`. Open http://127.0.0.1:8080/. The Nginx runtime remains non-root; the slim variant omits unused optional modules.

The checksum file covers all ZIPs and the companion runtime source-information archive. That archive retains exact upstream recipes, patches and sources for the container components; it is not the ready-to-run application. Browser saves are origin-specific; export important Miis before changing hostname/port.

**Licensing:** standard MIT applies only to eligible modern contributions listed in LICENSE-SCOPE.json. Historical artwork, extracted vectors/glyphs, inherited code and Nintendo/third-party interests are excluded. Their rights remain unresolved; owner risk acceptance is not permission or legal clearance. The complete mixed-rights distribution is not represented as wholly MIT. See the [license scope](https://github.com/jstack01/mii-editor-web/blob/v1.0.0/LICENSE.md), [rights and credits](https://github.com/jstack01/mii-editor-web/blob/v1.0.0/NOTICES.md) and [container source information](https://github.com/jstack01/mii-editor-web/blob/v1.0.0/CONTAINER_SOURCES.md).

Wii-format software validation and limited isolated Dolphin display/reload results are documented; no physical Wii or individual-game certification is claimed. Physical testing is indefinitely deferred. See [browser limitations](https://github.com/jstack01/mii-editor-web/blob/v1.0.0/docs/BROWSER_COMPATIBILITY.md) and [Wii/Dolphin findings](https://github.com/jstack01/mii-editor-web/blob/v1.0.0/web/PHASE7_VERIFICATION.md) for native/device gaps and WebKit forced-offline behavior.

**AI-generated / vibe-coded project — unmaintained.** Provided as-is without planned technical support, accepted pull requests or ongoing maintenance. Forks are encouraged subject to applicable component rights. Unofficial and not endorsed by Nintendo or the original developers. No future development commitment is made.

Original Mii Editor: **Trevor McCauley / senocular**. Historical materials were found at https://mii-editor.nekoweb.org/ and https://archive.org/details/mii-editor; thanks to the original creators and archivists.
