# Mii Editor Web

Create and edit Miis in your browser using the original-style interface and recovered graphics. Open/save `.mii` and XML files, share characters, and export PNG/JPEG images—without Flash or an application backend.

<img src="docs/images/presets-desktop.png" alt="Mii Editor showing the default girl and character editing controls" width="540">

## Download & Start

Download the ZIP for [Windows](https://github.com/jstack01/mii-editor-web/releases/download/v0.1.0-preview.4/mii-editor-web-windows-v0.1.0-preview.4.zip), [macOS](https://github.com/jstack01/mii-editor-web/releases/download/v0.1.0-preview.4/mii-editor-web-macos-v0.1.0-preview.4.zip), or [Linux](https://github.com/jstack01/mii-editor-web/releases/download/v0.1.0-preview.4/mii-editor-web-linux-v0.1.0-preview.4.zip), extract it, and run its **Start Mii Editor** script. An existing **Python 3.9+** installation is required. Keep the launcher window open while using the editor.

To change the local server port, edit `port` in `config.json` and restart the launcher. The default is **8080**. This file applies to the script launchers, not Docker. [Launcher guide](docs/LOCAL_LAUNCHERS.md).

For an existing web server, download the [static website ZIP](https://github.com/jstack01/mii-editor-web/releases/download/v0.1.0-preview.4/mii-editor-web-static-v0.1.0-preview.4.zip). See [hosting instructions](docs/HOSTING.md) or [all release downloads](https://github.com/jstack01/mii-editor-web/releases/tag/v0.1.0-preview.4).

## Docker

```sh
docker pull ghcr.io/jstack01/mii-editor-web:v0.1.0-preview.4
docker run -d --name mii-editor -p 127.0.0.1:8080:8080 --restart unless-stopped ghcr.io/jstack01/mii-editor-web:v0.1.0-preview.4
```

Open **http://127.0.0.1:8080/**. No GitHub sign-in is required.

For Compose, extract the [Docker starter ZIP](https://github.com/jstack01/mii-editor-web/releases/download/v0.1.0-preview.4/mii-editor-web-docker-v0.1.0-preview.4.zip), then run `docker compose up -d`. Change the host port through Docker’s port mapping or `MII_EDITOR_PORT` in Compose’s `.env` file. [Docker/Compose guide](docs/DOCKER.md).

## Original Project and Credits

Original application materials were found at [mii-editor.nekoweb.org](https://mii-editor.nekoweb.org/) and the [Internet Archive](https://archive.org/details/mii-editor), which credit **senocular** as the original developer. Thanks to the original creators and archivists.

**AI-generated / vibe-coded project — unmaintained.** Unofficial and provided as-is, without planned support or contribution review. Forks are encouraged subject to applicable rights. Not affiliated with or endorsed by Nintendo or the original developers. New code is unlicensed; historical asset rights remain unresolved. Read the [license](LICENSE.md) and [notices](NOTICES.md).

[Build from source](docs/BUILDING.md) · [Browser compatibility](docs/BROWSER_COMPATIBILITY.md) · [Wii compatibility notice](web/WII_PROFILE.md) · [Wii/Dolphin verification](web/PHASE7_VERIFICATION.md) · [Roadmap](MIGRATION_PLAN.md) · [QA results](docs/PHASE8A_QA.md) · [Privacy](docs/SECURITY_PRIVACY.md)
