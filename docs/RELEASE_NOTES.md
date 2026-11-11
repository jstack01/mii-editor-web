# Mii Editor Web v0.1.0-preview.5

Create and edit Miis in the original-style browser interface. Open/save `.mii` and XML files, share characters, and download PNG/JPEG images without Flash or an application backend. This preview is the final planned publication for the current project scope; no future maintenance is promised.

## Download and run

- **Windows / macOS / Linux:** download your platform ZIP, extract it, and run its **Start Mii Editor** script. An existing **Python 3.9+** installation is required. Keep the launcher open. To change port 8080, edit `port` in `config.json` and restart.
- **Static hosting:** upload the static ZIP contents to Apache, Nginx or another static web host. No development tools or application backend are needed on the server.
- **Docker / Compose:** use `ghcr.io/jstack01/mii-editor-web:v0.1.0-preview.5` (AMD64 and ARM64). Extract the Docker starter ZIP and run `docker compose up -d`, then open http://127.0.0.1:8080/. See the [Docker guide](https://github.com/jstack01/mii-editor-web/blob/v0.1.0-preview.5/docs/DOCKER.md).

The attached `SHA256SUMS-v0.1.0-preview.5.txt` covers all five ZIPs. Export important Miis before changing hostname or port; browser saves belong to their original browser origin.

## Compatibility and notices

Wii-format exports pass the documented software validation, including 10,000 independently checked randomized records. Isolated Dolphin Mii Channel display/reload tests passed for the documented positive scenarios; this does not establish general import, editability or transfer support. **Physical Wii and individual-game testing is deferred indefinitely**, not certified. Native Safari/Edge, physical mobile coverage and WebKit forced-offline behavior remain limited: see [QA results](https://github.com/jstack01/mii-editor-web/blob/v0.1.0-preview.5/docs/PHASE8A_QA.md) and [Wii/Dolphin findings](https://github.com/jstack01/mii-editor-web/blob/v0.1.0-preview.5/web/PHASE7_VERIFICATION.md).

**AI-generated / vibe-coded project — unmaintained.** Unofficial and provided as-is without planned support or contribution review. Forks are encouraged subject to applicable rights. New code is unlicensed; historical artwork and derived asset rights remain unresolved. See the [license](https://github.com/jstack01/mii-editor-web/blob/v0.1.0-preview.5/LICENSE.md) and [notices](https://github.com/jstack01/mii-editor-web/blob/v0.1.0-preview.5/NOTICES.md). Not affiliated with or endorsed by Nintendo or the original developers.

## Original Project and Credits

Historical materials were found at [mii-editor.nekoweb.org](https://mii-editor.nekoweb.org/) and the [Internet Archive](https://archive.org/details/mii-editor), whose credits identify senocular as the original developer. Thanks to the original creators and archivists; the hosting sites are not claimed to have created all historical materials.
