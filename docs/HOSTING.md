# Local and Apache hosting

## Deployment choices

1. Windows/macOS/Linux local launcher ZIPs: existing Python, config.json port.
2. Static hosting ZIP: Apache/Nginx serves prebuilt files without application runtime tools.
3. GHCR Docker image: non-root Nginx serves those same static files.
4. Docker Compose: the same pinned GHCR image, with localhost-only mapping and hardening.

Docker/Compose preview.5 is published; v1.0.0 is prepared locally and requires separate publication approval. See DOCKER.md for exact commands and CONTAINER_PUBLISHING.md for public/anonymous verification gates. Docker uses host port mapping/MII_EDITOR_PORT, never launcher config.json; there is no second application configuration system. These choices share the same Mii codec, renderer and software profile, not additional hardware certification.

## Local editions and static hosting

D2 local ZIPs contain platform-specific scripts and the same compiled `website/`. Extract the complete package, then run `Start Mii Editor.command` (macOS), `start-mii-editor.sh` (Linux), or `Start Mii Editor.cmd` (Windows). An existing real Python 3.9+ is required. Nothing is installed automatically. macOS avoids the Apple developer-tools stub; Windows skips Store aliases and install managers. See LOCAL_LAUNCHERS.md in the source repository for the documented PowerShell/HTTP.sys limitations. The owner reported successful Windows and macOS startup tests; real Linux desktop testing remains pending.

The server serves only website/ at **http://127.0.0.1:8080/**, waits for readiness, opens the default browser and prints a copyable/clickable URL. Stop with Ctrl+C or close its terminal. If 8080 is busy it reports the conflict and never silently changes port. Change the local port through config.json as described below; do not edit the launcher scripts. A failed browser-opening request leaves the site available for manual opening. No administrator or security-policy change is required.

D1 used 8765: export old characters there before switching to 8080, then reimport. Localhost links point to the recipient's own computer; use a public deployment for public share links. Downloaded scripts can be restricted by the OS/file manager. Do not disable security settings; follow the guide or use an already trusted interpreter explicitly. Linux file managers may open .sh files as text; a terminal invocation is available. Direct file:// opening can fail because JavaScript modules need an HTTP origin.

For an existing server, use the **separate static ZIP** and upload its contents, including legal notices. No launcher, Python, Node.js, Vite, PHP, Go or database is needed on Apache/Nginx/conventional static hosting. The local and static editions use identical compiled website files.

## Change the local port

To change the local server port, open config.json in a text editor, change the number next to port, save the file, and restart Mii Editor.

```json
{
  "port": 8090
}
```

This opens **http://127.0.0.1:8090/**. The normal default is 8080. Keep config.json beside the startup script and serve.py, outside website/. All three platform launchers use the same Python JSON parser. No parser installation is needed. If the file or port key is missing, the default is 8080. The file must be a JSON object; port must be a JSON integer from 1024 to 65535. Quoted numbers, true/false, decimals, invalid JSON and invalid ports produce a helpful error. Unknown keys are ignored; they cannot change the loopback binding or server security. Only port is currently supported. Never select another port silently when one is occupied.

Changing the port changes the browser storage origin. Characters previously saved at port 8080 may not appear at port 8090. **Export important .mii files before changing ports.** Keep the same browser/profile and chosen port between launches. Keep a backup of your config.json when updating to a new release and copy your chosen port into the new package. No automatic migration between ports is performed. The static-hosting ZIP does not contain or need config.json; Apache/Nginx supplies its own HTTP configuration.

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

Basic extracted-ZIP root/nested-path and isolated local Apache checks are recorded with this distribution milestone. Native Windows/desktop Linux launcher interaction, additional production hosting/TLS configurations and physical-device coverage remain unfinished; see MIGRATION_PLAN.md. No calls to historical MiiEditor.com services are needed.

## Privacy headers and URL logging

Editing/import/export happens in the browser, but opening a `?mii=` share URL necessarily sends that query to the chosen HTTP host. Configure your server/proxy logs accordingly. The bundled local server and Docker disable normal request/query logging and send `Referrer-Policy: no-referrer` plus `X-Content-Type-Options: nosniff`.

For an existing Apache configuration with mod_headers enabled, apply these in the application's Directory/VirtualHost (or .htaccess only if your host permits it):

```apache
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "no-referrer"
```

If managing your own VirtualHost logs, a format using `%U` rather than `%r`/`%q` omits the query, for example:

```apache
LogFormat "%h %l %u %t \"%m %U %H\" %>s %b" mii_no_query
CustomLog logs/mii-access.log mii_no_query
```

Check upstream proxy logs too. These are configuration examples, not changes automatically applied to your server. Full hosted TLS/logging variations remain unverified. See [security/privacy scope](SECURITY_PRIVACY.md) and [Phase 8A QA](PHASE8A_QA.md).
