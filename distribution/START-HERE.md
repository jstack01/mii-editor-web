# Start Mii Editor

1. Extract the whole ZIP into a normal folder. Do not run scripts from inside the ZIP.
2. Run **{{START_SCRIPT}}**. It finds the website next to itself, starts a local server and opens your default browser after the website answers.
3. Keep that terminal window open. Press Ctrl+C or close the window to stop the server.

Open: **http://127.0.0.1:8080/**

{{PLATFORM_NOTE}}

Nothing is installed or downloaded by the launcher. If no suitable Python is found, it explains optional installation from https://www.python.org/downloads/. Do not run as administrator. No execution policy, URL reservation or security setting is changed. macOS deliberately skips Apple's /usr/bin/python3 developer-tools stub. Windows skips Microsoft Store Python aliases and does not invoke Python install managers.

If a system blocks a downloaded script, respect that restriction; do not disable system security. For a terminal launch, on macOS use `bash "Start Mii Editor.command"`; on Linux use `bash ./start-mii-editor.sh`. Linux file managers may open .sh files in an editor instead of running them. On Windows run `"Start Mii Editor.cmd"` in Command Prompt; a real Python 3.9+ must be on PATH. Actual Windows and Linux desktop behavior is not yet certified.

If port 8080 is occupied, close the other launcher/app and try again. The script never quietly switches ports. The printed URL is clickable where the terminal supports links; otherwise copy it into the browser. If the browser does not open, the server stays available at that address.

## Your saved Miis

Saved browser data belongs to the exact origin (protocol, host and port). D2 uses **127.0.0.1:8080** consistently. D1 preview.1 used **127.0.0.1:8765**: export important Miis with the old launcher first, then import them into D2. Data is not automatically moved between origins. Use the same browser/profile between launches. Private browsing or cleared site data can remove local saves; also save .mii files.

A localhost share link refers to the computer opening it, not your computer. It is not a publicly hosted link. Send a .mii file or use a public static deployment when sharing with others. The link itself contains the complete character data.

## Hosting instead

Use the separate **static ZIP** for Apache, Nginx or conventional static hosting. No launcher, Python, Node.js, Vite, PHP, Go or database is needed on that web server. HOSTING.md explains root and /mii-editor/ deployment.

**AI-generated / vibe-coded project — unmaintained.** Unofficial, provided as-is, without planned support or accepted pull requests. New code is unlicensed; historical vector/glyph rights remain unresolved. See LICENSE.md and NOTICES.md. This preview is not full mobile/cross-browser or physical Wii/game certification. Original materials were found at https://mii-editor.nekoweb.org/ and https://archive.org/details/mii-editor; their FAQ/metadata credit senocular. Forks are encouraged subject to applicable rights.
