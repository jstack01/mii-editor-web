# Mii Editor with Docker or Compose

**v1.0.0 is published.** Previous previews remain available.

The stable v1.0.0 Docker distribution uses **ghcr.io/jstack01/mii-editor-web:v1.0.0**. Public package status and anonymous pulls are publication requirements. Earlier ZIP releases remain available.

Docker serves the same static editor as the launcher/static ZIP editions. It adds no application backend, database or server-side Mii storage, and does not improve or certify Wii compatibility. Install Docker Engine + Compose on Linux or Docker Desktop with Linux containers on macOS/Windows if not already installed. This does not promise installation-free startup.

## Direct Docker use 

```sh
docker pull ghcr.io/jstack01/mii-editor-web:v1.0.0
```

Run this single-line command (also suitable for PowerShell):

```sh
docker run -d --name mii-editor -p 127.0.0.1:8080:8080 --restart unless-stopped --read-only --tmpfs "/tmp:rw,noexec,nosuid,nodev,size=16m,uid=101,gid=101,mode=1770" --cap-drop ALL --security-opt no-new-privileges:true --pids-limit 64 ghcr.io/jstack01/mii-editor-web:v1.0.0
```

Open **http://127.0.0.1:8080/**. The container does not open a browser or terminal window automatically. These examples expose only your own computer. If 8080 is occupied, stop the other local launcher/server or choose another host port; Docker will report the conflict rather than select another port. For port 8091, replace `127.0.0.1:8080:8080` with `127.0.0.1:8091:8080` and open http://127.0.0.1:8091/. The container port remains 8080.

```sh
docker logs --tail 50 mii-editor
docker inspect --format "{{.State.Health.Status}}" mii-editor
docker stop mii-editor
docker start mii-editor
docker restart mii-editor
```

After stopping, remove it with `docker rm mii-editor`. Updating: export important .mii files, pull the new explicitly published version, stop/remove the old container and repeat the run command with that new tag. Keep the same hostname/host port to retain the browser origin. No volume backup or database migration is needed. Nginx logs errors; normal access/query logging is disabled, so quiet logs are expected.

## Compose 

Download/extract the release's **Docker starter ZIP**, containing compose.yaml, .env.example, this START-HERE guide and notices. Alternatively download compose.yaml and .env.example from the repository root. Put them together in a normal folder; the Compose file uses the published image and does not build locally.

```sh
docker compose up -d
```

Open http://127.0.0.1:8080/. To change the host port, copy `.env.example` to `.env` using your file manager/text editor, then change its line to:

```dotenv
MII_EDITOR_PORT=8091
```

Run `docker compose up -d` again and open http://127.0.0.1:8091/. Use a normal available TCP port, preferably 1024–65535. Export important Miis before changing the origin. Do not change the final `:8080` container port or remove the `127.0.0.1` prefix unless deliberately configuring a public deployment.

```sh
docker compose logs --tail 50
docker compose ps
docker compose stop
docker compose start
docker compose restart
docker compose down
```

To update, first change `image:` in compose.yaml to the new explicitly published tag, then:

```sh
docker compose pull
docker compose up -d
```

The file deliberately pins v1.0.0; pulling that unchanged tag does not automatically select future releases. `docker compose down` removes this service/network, not browser saves. No extra services or persistent volumes are required. Keep .env when replacing the Compose file during an update.

## Three separate hosting options

- **Standalone local ZIP:** existing Python 3.9+ server; config.json controls its local port.
- **Static hosting ZIP:** upload to Apache/Nginx/another conventional static host; no Python, Node.js, Vite, PHP or database on the production server. See HOSTING.md.
- **Docker/Compose:** Nginx in a Linux container; Docker port mapping / MII_EDITOR_PORT selects the host port. The image neither contains nor reads launcher config.json.

Miis and image preferences belong to the browser origin: protocol, hostname and port. Changing localhost to 127.0.0.1, changing ports, or switching HTTP to HTTPS can make earlier browser saves unavailable at the new origin. Export/import .mii files deliberately. If the origin stays exactly the same, changing the underlying server/container does not itself erase browser storage. Localhost share links refer to the recipient's own computer; use files or a hosted site to share with other people.

## Public hosting / URL paths

For public hosting, prefer a separately managed reverse proxy with HTTPS and a properly configured domain. Keep the default app container private; do not automatically publish it to all host interfaces. On a Linux host, an existing host reverse proxy can forward to `http://127.0.0.1:8080/`. A reverse proxy running in another container needs a deliberate private Docker network instead; this guide does not install or expose a proxy automatically. Set TLS and forwarded routing in that proxy, not launcher config.json. Preserve query strings.

The container serves the site at `/`. For an external `/mii-editor/` prefix, have the reverse proxy strip that prefix before forwarding. The prebuilt `./assets/...` URLs and ?mii= sharing keep the external path. There is no SPA fallback: nonexistent files return 404. A host Nginx example inside an existing HTTPS server block is:

```nginx
location /mii-editor/ {
    proxy_pass http://127.0.0.1:8080/;
}
```

The trailing slash on proxy_pass is significant. Root and nested conventional static ZIP deployment remain documented separately; no speculative proxy, certificate or firewall configuration is applied to your machine.

## Runtime and security

The pinned upstream Nginx Unprivileged 1.30.6 Alpine slim image runs as UID/GID 101 on internal port 8080. A pinned Node 24 build stage installs the pinned pnpm version and frozen lockfile, verifies committed generated graphics and builds Vite; **none of Node, pnpm, Python, source code, dependencies or original Flash materials enters the final runtime**. An allowlisted .dockerignore prevents originals, credentials, caches and evidence from entering the build context. Legal notices stay in the website; base OS/Nginx components keep their own upstream licenses. The OCI application-license references do not grant historical asset rights or relicense upstream components.

Compose uses read-only root storage, a small ephemeral /tmp, no-new-privileges, all capabilities dropped, a PID limit and no host-directory mounts/privileged mode. Nginx serves GET/HEAD static files, explicit MIME types, no listing or hidden/development paths, and no upload/file-management/backend endpoint. Its existing wget checks `/` for health; SIGQUIT provides graceful shutdown. Container networking listens inside its own namespace; the default **host publishing** is loopback-only. Do not assume a container network is a replacement for your firewall or HTTPS proxy.

Digest pins and the lockfile make build inputs explicit; generated site mtimes/build metadata use the supplied Git revision and SOURCE_DATE_EPOCH. Updates to base digests must be deliberate and retested. An unmaintained project does not automatically receive security updates. Detailed actual builds/execution and image sizes are in DOCKER_VERIFICATION.md.

## Existing limitations and notices

**AI-generated / vibe-coded project — unmaintained.** Unofficial, provided as-is, without planned support or accepted pull requests. Eligible modern code has a scoped MIT grant; historical vector/glyph rights remain unresolved. See LICENSE.md and NOTICES.md. Original materials were found at https://mii-editor.nekoweb.org/ and https://archive.org/details/mii-editor; their FAQ/metadata credit senocular. Not affiliated with Nintendo or the original developers.

Software validation does not guarantee every Wii console or game. Native Safari/Edge/device gaps and the exact Firefox/WebKit results remain as disclosed in BROWSER_COMPATIBILITY.md; Docker does not fix or certify those browser behaviors. Phase 7A Dolphin findings are documented; physical Wii/game testing is deferred indefinitely by owner decision and does not block software release. Earlier releases are not overwritten.

The v1 runtime uses the pinned slim variant, dropping unused optional Nginx modules (21 rather than 70 installed packages). Full notices/license texts and source-input metadata are installed in `/usr/share/licenses/mii-editor-runtime/`; see CONTAINER_SOURCES.md and the companion source-information archive. The scoped project MIT does not relicense OS components or unresolved historical assets.
