# Local and Apache hosting

## Prebuilt download

Download the named prebuilt ZIP from Releases, not GitHub's automatic source archive. Extract it completely. The package contains `website/`, START-HERE, this guide, notices and Python-based startup scripts. Only local startup needs Python 3.9+; an Apache production server needs none of the development tools or Python.

Windows: install Python 3 if needed, then double-click `start-windows.bat`. macOS: open `start-macos.command`; if opening a downloaded script is restricted, open Terminal in the extracted folder and run `bash start-macos.command`. Linux: run `bash start-linux.sh`. A browser opens http://127.0.0.1:8765/. Keep the terminal open; Ctrl+C stops it. If the default port is occupied, stop the other local instance or run `python3 serve.py --port 8766`; on Windows use `py -3 serve.py --port 8766`. The chosen port affects browser storage. The local server binds only to 127.0.0.1 and serves static files from website/, not the rest of your checkout.

Python is not bundled. Obtain it from https://www.python.org/downloads/ if necessary. Windows/macOS/Linux launchers are supplied; actual Windows/Linux operating-system execution remains unverified where unavailable. Desktop browser emulation is not real-device testing. Direct file:// opening can fail because ES modules require an HTTP origin.

## Apache at the domain root

Upload the contents of website/ (including LICENSE.md, NOTICES.md and LICENSES/) into a dedicated static DocumentRoot, for example `/var/www/mii-editor`. With Apache 2.4's normal static modules enabled:

```apache
DocumentRoot "/var/www/mii-editor"
<Directory "/var/www/mii-editor">
    Require all granted
    Options -Indexes
    AllowOverride None
    DirectoryIndex index.html
    AddType application/javascript .js .mjs
    AddType text/css .css
</Directory>
```

Open `https://example.com/`. Configure your domain and TLS through your normal hosting provider; this example does not install certificates or change a live server. Do not replace an existing multi-site configuration blindly.

## Apache in a subdirectory

If the existing DocumentRoot is `/var/www/html`, copy website/'s contents into `/var/www/html/mii-editor/`, and apply the same Directory settings to that path. Alternatively, add a static Alias:

```apache
Alias "/mii-editor/" "/var/www/mii-editor/"
<Directory "/var/www/mii-editor">
    Require all granted
    Options -Indexes
    AllowOverride None
    DirectoryIndex index.html
    AddType application/javascript .js .mjs
    AddType text/css .css
</Directory>
```

Open `https://example.com/mii-editor/` with the trailing slash, or `/mii-editor/index.html`. The prebuilt assets use `./assets/...`; do not edit the build or require a rewrite rule. Share URLs retain the current path and `?mii=` parameter. No SPA fallback, PHP, database or runtime backend is required. Preserve query strings through any proxy. Standard modules include mod_dir, mod_mime and authorization support.

## Browser, HTTPS and updates

Use HTTPS on a public website to protect content and shared URLs in transit. The current editor's input/download/canvas operations do not require a runtime backend; local HTTP loopback is supported. Browser security settings can block downloads or storage; private browsing may clear saved data. No HTTP/HTTPS/browser policy is overridden by the application. Share URLs contain the full character data and should not be treated as private files.

Browser storage is scoped by scheme/host/port, not folder: root and subdirectory installations on the same origin share the current-character storage key. Export important characters before changing origin, clearing site data or replacing a deployment. To update: stop the local launcher or stage an upload, back up the old website folder and personal Mii files, replace website files with the new complete build (including hashed assets and notices), restart/reload, and keep the origin unchanged. Remove obsolete hashed assets after a successful complete upload. Roll back by restoring the prior complete folder. Application updates do not promise a browser-data migration.

Basic extracted-ZIP root/nested-path and isolated local Apache checks are recorded with this distribution milestone. Real Windows/Linux startup, additional production hosting/TLS configurations and broader browser/device coverage remain unfinished; see MIGRATION_PLAN.md. No calls to historical MiiEditor.com services are needed.
