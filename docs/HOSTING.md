# Local and Apache hosting

## Local editions and static hosting

D2 local ZIPs contain platform-specific scripts and the same compiled `website/`. Extract the complete package, then run `Start Mii Editor.command` (macOS), `start-mii-editor.sh` (Linux), or `Start Mii Editor.cmd` (Windows). An existing real Python 3.9+ is required. Nothing is installed automatically. macOS avoids the Apple developer-tools stub; Windows skips Store aliases and install managers. See LOCAL_LAUNCHERS.md in the source repository for the documented PowerShell/HTTP.sys limitations. Windows and real Linux desktop testing remain pending.

The server serves only website/ at **http://127.0.0.1:8080/**, waits for readiness, opens the default browser and prints a copyable/clickable URL. Stop with Ctrl+C or close its terminal. If 8080 is busy it reports the conflict and never silently changes port. An explicit terminal override (`python3 serve.py --port 8081`) changes the browser-storage origin; use it only deliberately. A failed browser-opening request leaves the site available for manual opening. No administrator or security-policy change is required.

D1 used 8765: export old characters there before switching to 8080, then reimport. Localhost links point to the recipient's own computer; use a public deployment for public share links. Downloaded scripts can be restricted by the OS/file manager. Do not disable security settings; follow the guide or use an already trusted interpreter explicitly. Linux file managers may open .sh files as text; a terminal invocation is available. Direct file:// opening can fail because JavaScript modules need an HTTP origin.

For an existing server, use the **separate static ZIP** and upload its contents, including legal notices. No launcher, Python, Node.js, Vite, PHP, Go or database is needed on Apache/Nginx/conventional static hosting. The local and static editions use identical compiled website files.

## Apache at the domain root

Upload the contents of the static ZIP (including LICENSE.md, NOTICES.md and LICENSES/) into a dedicated static DocumentRoot, for example `/var/www/mii-editor`. With Apache 2.4's normal static modules enabled:

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

If the existing DocumentRoot is `/var/www/html`, copy the static ZIP's contents into `/var/www/html/mii-editor/`, and apply the same Directory settings to that path. Alternatively, add a static Alias:

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
