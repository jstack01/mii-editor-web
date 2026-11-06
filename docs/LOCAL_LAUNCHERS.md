# D2 — simple script-based local launchers

## Design

Local editions use an existing **Python 3.9+ standard library** HTTP server. No Go, PyInstaller, compiled launcher executable, standalone-HTML edition, package download, administrator action or runtime application backend is introduced. The same compiled index/assets/notices are in every edition and the separate static-hosting ZIP.

- macOS: `Start Mii Editor.command` → a small POSIX interpreter locator → foreground Python.
- Linux: `start-mii-editor.sh` → the same locator → foreground Python.
- Windows: `Start Mii Editor.cmd` finds a real existing Python on PATH and runs it in the same console. It skips Store execution aliases and does not invoke `py` install managers. Python may need to be installed by the user. This launcher is not yet verified on Windows.

The locator checks existing interpreters only. On macOS it skips `/usr/bin/python3` and symlinks to that developer-tools stub. It may locate an actual already-installed Xcode Python framework after a read-only xcode-select query, but never starts xcode-select --install or xcrun. Missing tools produce a friendly explanation and optional python.org instructions. Nothing is silently installed. Terminal launchers cannot guarantee zero installations on every machine.

## Why not a built-in Windows PowerShell HTTP server?

A common built-in Windows PowerShell server approach uses .NET HttpListener, which is built on HTTP.sys. Microsoft's [URL reservation documentation](https://learn.microsoft.com/en-us/windows/win32/http/add-urlacl) describes reservations that permit non-administrator access. We cannot assume the required reservation exists. Its [URL-prefix documentation](https://learn.microsoft.com/en-us/windows/win32/http/urlprefix-strings) warns against treating an IP-bound prefix as a security boundary. [Microsoft's HTTP Server API explanation](https://techcommunity.microsoft.com/blog/iis-support-blog/hunting-down-a-classic-error-page-cannot-be-displayed/287853) describes default all-interface binding, while the [IP listen list](https://learn.microsoft.com/en-us/windows/win32/http/add-iplisten) scopes system HTTP bindings. We will not alter that global configuration or request elevation. [PowerShell execution policies](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies?view=powershell-5.1) can also block unsigned downloaded scripts; no Bypass or policy change is used.

A hand-built TCP HTTP parser would increase risk and contradict the requested minimal reliable approach. No such implementation is shipped. Existing Python is the supported script-server dependency; its real Windows behavior still needs a non-administrator Windows test. PowerShell 7 installed on macOS does not provide that evidence. This is a documented limitation, not installation-free Windows support.

## Origin, readiness and lifecycle

The config.json default is **http://127.0.0.1:8080/**, with an exclusive IPv4 loopback bind. An occupied port returns a readable error; it never selects another origin. Change normal startup through config.json, not launcher script edits. A developer CLI override remains for isolated automated tests; a malformed existing configuration is still rejected. D1 used port 8765, so its saved data must be exported/imported deliberately; no storage migration is invented.

The server binds, starts an in-process serving thread and completes a real local HEAD request (without proxies) before it prints readiness or requests the browser. A browser-opening failure leaves the site running and prints the copyable address. A plain URL is always printed. OSC 8 links are emitted for recognized supporting TTY environments; other terminals can auto-detect the normal URL or users can copy it. Physical terminal hyperlink behavior is not universally verified.

The POSIX wrapper execs the interpreter; there is no detached server subprocess. Ctrl+C, SIGTERM and terminal hangup are handled; listener/thread cleanup runs in finally. Windows executes Python in the same console, with no background Start-Process/Start-Job. Actual Windows console-close semantics remain a required platform test. Browser processes are intentionally not terminated when the server stops.

## Static-file boundaries

Python's mature HTTP parser is used. The small handler restricts requests to GET/HEAD, a known website asset-type list and the real website directory. Hidden/traversal/invalid-encoding paths, outside-root links, junction/reparse targets and mismatched Host values are rejected. Directory listings and upload/file-management methods are unavailable. No query strings are logged. Root/index, JavaScript, CSS, SVG, JSON, notices, fonts and images have explicit MIME types. The launcher directory, source code and user files are not served.

The ordinary hosting edition needs none of this server code: its static assets and path-correct share links work on Apache/Nginx with normal static configuration.

## Testing boundaries

Automated tests must distinguish actual macOS terminal/process tests, LaunchServices opening, simulated terminal hangup, browser-open requests, headless browser workflows and genuine desktop interactions. Windows is not verified just by inspecting .cmd syntax; Linux shell execution on macOS is not a Linux OS test. Missing VM access or automation permission is recorded, not bypassed. Detailed D2 results are recorded in MIGRATION_PLAN.md before release approval.


## D2 publication approval and owner testing

The owner reported successful manual Windows and macOS testing and approved pushing/publishing D2. These are owner-reported results; OS versions and detailed test coverage were not supplied. Earlier unavailable-Windows statements describe the automated development environment, not this later manual result. Real Linux desktop behavior, broader platform/device coverage and hardware compatibility remain unverified. The approved preview.2 is published through the guarded manual process; preview.1 remains unchanged.


## Change the local port

To change the local server port, open config.json in a text editor, change the number next to port, save the file, and restart Mii Editor.

```json
{
  "port": 8090
}
```

This opens **http://127.0.0.1:8090/**. The normal default is 8080. Keep config.json beside the startup script and serve.py, outside website/. All three platform launchers use the same Python JSON parser. No parser installation is needed. If the file or port key is missing, the default is 8080. The file must be a JSON object; port must be a JSON integer from 1024 to 65535. Quoted numbers, true/false, decimals, invalid JSON and invalid ports produce a helpful error. Unknown keys are ignored; they cannot change the loopback binding or server security. Only port is currently supported. Never select another port silently when one is occupied.

Changing the port changes the browser storage origin. Characters previously saved at port 8080 may not appear at port 8090. **Export important .mii files before changing ports.** Keep the same browser/profile and chosen port between launches. Keep a backup of your config.json when updating to a new release and copy your chosen port into the new package. No automatic migration between ports is performed. The static-hosting ZIP does not contain or need config.json; Apache/Nginx supplies its own HTTP configuration.


## Docker is a separate distribution

D3 prepares a GHCR Nginx image and Compose file, without changing these launchers. Docker does not read config.json; its published host port is selected through -p or Compose MII_EDITOR_PORT. Conventional Apache hosting needs neither helper. All choices use the same editor; browser storage is shared only when the exact scheme/host/port matches. Export important .mii files before changing origins. See DOCKER.md.
