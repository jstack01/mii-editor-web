# Start Mii Editor

1. Extract the whole ZIP into a normal folder. Do not run scripts from inside the ZIP.
2. Run **{{START_SCRIPT}}**. It finds the website next to itself, starts a local server and opens your default browser after the website answers.
3. Keep that terminal window open. Press Ctrl+C or close the window to stop the server.

Open: **http://127.0.0.1:8080/**

{{PLATFORM_NOTE}}

Nothing is installed or downloaded by the launcher. If no suitable Python is found, it explains optional installation from https://www.python.org/downloads/. Do not run as administrator. No execution policy, URL reservation or security setting is changed. macOS deliberately skips Apple's /usr/bin/python3 developer-tools stub. Windows skips Microsoft Store Python aliases and does not invoke Python install managers.

If a system blocks a downloaded script, respect that restriction; do not disable system security. For a terminal launch, on macOS use `bash "Start Mii Editor.command"`; on Linux use `bash ./start-mii-editor.sh`. Linux file managers may open .sh files in an editor instead of running them. On Windows run `"Start Mii Editor.cmd"` in Command Prompt; a real Python 3.9+ must be on PATH. The owner reported successful preview.2 Windows and macOS startup tests; preview.3 configuration changes have automated macOS coverage. Actual Linux desktop behavior remains unverified; broader OS/version coverage is not certified.

If the configured port is occupied, close the other launcher/app and try again. The script never quietly switches ports. The printed URL is clickable where the terminal supports links; otherwise copy it into the browser. If the browser does not open, the server stays available at that address.

## Change the local port

To change the local server port, open config.json in a text editor, change the number next to port, save the file, and restart Mii Editor.

```json
{
  "port": 8090
}
```

This opens **http://127.0.0.1:8090/**. The normal default is 8080. Keep config.json beside the startup script and serve.py, outside website/. All three platform launchers use the same Python JSON parser. No parser installation is needed. If the file or port key is missing, the default is 8080. The file must be a JSON object; port must be a JSON integer from 1024 to 65535. Quoted numbers, true/false, decimals, invalid JSON and invalid ports produce a helpful error. Unknown keys are ignored; they cannot change the loopback binding or server security. Only port is currently supported. Never select another port silently when one is occupied.

Changing the port changes the browser storage origin. Characters previously saved at port 8080 may not appear at port 8090. **Export important .mii files before changing ports.** Keep the same browser/profile and chosen port between launches. Keep a backup of your config.json when updating to a new release and copy your chosen port into the new package. No automatic migration between ports is performed. The static-hosting ZIP does not contain or need config.json; Apache/Nginx supplies its own HTTP configuration.

## Your saved Miis

Saved browser data belongs to the exact origin (protocol, host and port). The default is **127.0.0.1:8080**; keep your chosen config.json port stable. Data is not automatically moved between origins. Use the same browser/profile between launches. Private browsing or cleared site data can remove local saves; also save .mii files.

A localhost share link refers to the computer opening it, not your computer. It is not a publicly hosted link. Send a .mii file or use a public static deployment when sharing with others. The link itself contains the complete character data.

## Hosting instead

Use the separate **static ZIP** for Apache, Nginx or conventional static hosting. No launcher, Python, Node.js, Vite, PHP, Go or database is needed on that web server. HOSTING.md explains root and /mii-editor/ deployment.

**AI-generated / vibe-coded project — unmaintained.** Unofficial, provided as-is, without planned support or accepted pull requests. Eligible modern code has a scoped MIT grant; historical vector/glyph rights remain unresolved. See LICENSE.md and NOTICES.md. This preview is not full mobile/cross-browser or physical Wii/game certification. Original materials were found at https://mii-editor.nekoweb.org/ and https://archive.org/details/mii-editor; their FAQ/metadata credit senocular. Forks are encouraged subject to applicable rights.
