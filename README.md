# Mii Editor Web

An unofficial browser-based recreation of the historical Mii Editor, using TypeScript and the recovered original vector graphics. Edit characters, save Wii-format records, share links and export images without Flash or a runtime backend.

![The Mii Editor Web application](docs/images/editor.png)

## AI-generated / vibe-coded project — unmaintained

This is an unofficial browser-based recreation of the historical Mii Editor, developed with substantial assistance from AI coding tools.

This project is provided as-is. I do not intend to actively maintain it, provide technical support, review issues, or accept pull requests.

Bugs and compatibility issues may exist. Software validation does not guarantee compatibility with every Wii console or Wii game.

Forks and independent development are encouraged, subject to applicable licenses and asset rights.

This project is not affiliated with or endorsed by Nintendo or the original Mii Editor developers.

**Licensing is unresolved:** newly written code is currently unlicensed. Historical graphics and generated vector data have separate, unconfirmed redistribution rights. Public access is not a permissive license grant. Read [LICENSE.md](LICENSE.md) and [NOTICES.md](NOTICES.md) before reuse or redistribution.

## Features

- All 13 original editing categories, original-style layout and recovered SVG character graphics.
- Wii software-compatible creation/randomization by default, with bounded attributes and valid birthdays; no legacy-mode toggle.
- Local 74-byte `.mii` import/export, compatible XML, and PNG/JPEG image exports.
- Explicit before/after repair review for incompatible records; cancellation preserves the current character.
- Automatic browser saving and share links containing the complete character data.
- Standalone static website: no Flash, AIR, PHP, database, Node.js server, Vite server, account or cloud service at runtime.

## Download and start

Open [GitHub Releases](https://github.com/jstack01/mii-editor-web/releases) and download **`mii-editor-web-v0.1.0-preview.1.zip`** from the preview release's Assets section. This is the prebuilt, ready-to-run package. GitHub's automatic **Source code (zip)** and **Source code (tar.gz)** downloads are developer sources and require a build.

1. Extract the entire ZIP; do not run it from inside the archive.
2. Read `START-HERE.md`.
3. Install Python 3 (3.9 or newer) if it is not already installed. The release does not bundle Python. Use a supported release from https://www.python.org/downloads/.
4. Windows: double-click `start-windows.bat`. macOS: open `start-macos.command`, or run it in Terminal. Linux: run `bash start-linux.sh` in the extracted folder.
5. The launcher serves only the `website/` folder on your own computer and opens http://127.0.0.1:8765/. Keep its terminal window open; press Ctrl+C to stop.

Do not open `website/index.html` directly with `file://`; browsers can block JavaScript modules that way. A different port or hostname is a different browser-storage origin. Export important Miis before changing origins. The ZIP includes a SHA-256 checksum file alongside it on the release page.

## Host it on a website

Upload **the contents of `website/`**, including notices, to your static web directory. The same build uses relative asset URLs and works at the domain root or a folder such as `/mii-editor/`. Keep the trailing slash when sharing a directory URL.

Apache needs only normal static-file serving and JavaScript/CSS MIME types. No Node.js/Vite process, Python, PHP or database is needed on the production server. See [the hosting guide](docs/HOSTING.md) for root/subdirectory examples and HTTPS/browser limitations.

## Build from source

Install Node.js 22.12+ (Node 24 was used for verification) and pnpm, then:

```sh
cd web
pnpm install --frozen-lockfile
pnpm test
pnpm build
```

Deploy `web/dist/`. The public checkout builds independently from committed generated resources; it does not need the original SWFs, ActionScript, extraction folders or private recovery evidence. See [BUILDING.md](docs/BUILDING.md) for public tests, optional local legacy tests and asset recovery.

## Original Project and Credits

The original application and related materials were obtained from [the Nekoweb preservation site](https://mii-editor.nekoweb.org/) and [this Internet Archive item](https://archive.org/details/mii-editor). They are credited as sources where the materials were found, not assumed to have created the original editor.

Both the Nekoweb FAQ and the archive's creator metadata credit **senocular** as the original developer. Thank you to the original developer and the preservation-site maintainer, uploader and archivists. See [NOTICES.md](NOTICES.md) for attribution, third-party notices and unresolved asset rights. No ownership of Nintendo characters, the historical Flash application or its artwork is claimed.

## Preview limitations

Testing is primarily in desktop Chrome, with narrow viewport and emulated-touch checks. Full Firefox, Safari/WebKit, Edge, iOS and Android coverage is not complete. Standalone Wii-record software validation is tested; console ownership, destination ID uniqueness, actual transfers, game-specific containers/checksums and physical Wii/game acceptance remain unverified. This preview is not hardware-certified.

[The migration plan](MIGRATION_PLAN.md) retains browser/mobile work (6.2), remaining distribution verification (6.3), hardware/emulator/game checks (7) and final release checks (8). Making this repository public does not complete those milestones. Future releases are manual and explicit; see [PUBLISHING.md](docs/PUBLISHING.md).
