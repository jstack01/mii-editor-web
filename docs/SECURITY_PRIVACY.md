# Security and privacy scope

Mii editing, rendering, randomization, compatibility checks, imports, repairs and image encoding run locally in the browser. No account, analytics, application API, database or cloud service is needed. Browser tests monitor application requests and fail on unexpected external/historical-service traffic. This is a practical review, not a formal security audit or a guarantee against all browser/server vulnerabilities.

## Share URLs and browser storage

**Opening a shared URL sends its `?mii=` character data to the web server serving that URL as part of the normal page request.** Ordinary editing does not upload records; updating the address uses browser history without a request. Share URLs contain the complete character, so treat them as shared data. A third-party host, reverse proxy, browser history or access log may retain the URL. The bundled local server suppresses request logs; Docker disables access/query logging. Conventional hosting must configure its own logs. Do not claim query-based sharing is invisible to the hosting server.

Current characters, identity-allocation state and image preferences use origin-specific localStorage. Reviewed pre-repair bytes can also be retained locally. The same scheme/hostname/port and browser profile are needed for persistence. Private browsing, clearing site data, browser policy or origin changes can remove/hide that state. Export important `.mii` files. Browser storage is not encrypted by this application and is not a backup service.

## Imported files

Binary `.mii` input must be exactly 74 bytes. XML files are limited to 1 MiB, decoded strictly as UTF-8, and checked before applying a separate candidate. Import failures/cancellation preserve the current character; incompatible data requires explicit review. Unknown binary bits are preserved by binary loads/individual edits, not guaranteed by XML.

Remote XML stylesheet/DTD declarations are removed before browser parsing. Entity declarations/internal subsets are rejected. Saved XML downloads omit historical remote declarations. No external entities, XSL transformation or remote XML fetching is needed. The original XML metadata may appear as text in the historical XML view; that is not a request to the old website. Imported names/filenames and repair descriptions are rendered as text, not executable HTML. Vector markup comes from committed, hash-checked resources, not imported Mii XML.

Downloads use browser Blob/object URLs, with cleanup. Files are not executed, uploaded or written into an arbitrary filesystem path. Export filenames filter path/control characters and reserved device names while retaining supported Unicode. Browser/OS file-picker and download behavior still varies.

## Server boundaries

The standalone server serves only `website/`, binds to `127.0.0.1`, validates Host/path/encoding, rejects traversal, symlinks/reparse points, hidden paths and unsupported file types/methods, and has no upload or file-management endpoint. Configuration supports only an integer port; unknown keys cannot expose it on the network. It uses Python's HTTP parser, not a custom TCP implementation. It is a local convenience server, not an internet-facing production server.

Docker uses pinned build/base inputs, non-root Nginx, static assets only, no application backend or host mounts. Compose adds read-only root storage, bounded temporary storage, dropped capabilities, no-new-privileges, PID limit and localhost-only host mapping. Default examples do not expose it publicly. HTTP responses use `X-Content-Type-Options: nosniff` and `Referrer-Policy: no-referrer`; the latter is also set by the local server to avoid forwarding character-bearing URLs as referrers.

For public hosting, use HTTPS and a maintained conventional server/reverse proxy. Configure logging and security headers there; test your actual deployment. This project does not install certificates, change firewall/security settings or promise coverage of every hosting configuration. Restrict the document root to the prebuilt static website. Do not upload source, original Flash materials, private evidence, credentials or development diagnostics.

## Release and dependency review

Production archives use an explicit runtime-file allowlist, hashes and manifests. Docker build context/runtime exclusions are tested independently. No original SWF, decompiled ActionScript, NAND/title/key material, tests, node_modules, Git history or private recovery evidence belongs in runtime packages. Public Git history still contains historical material as previously disclosed; current release packaging does not rewrite that history or resolve historical asset rights.

The frontend has no production npm dependencies; development/build tooling and Nginx/OS components still need their own maintenance. The project is AI-generated/vibe-coded and unmaintained. A dependency audit is point-in-time software evidence, not hardware, browser or security certification. See [Phase 8A results](PHASE8A_QA.md), [notices](../NOTICES.md) and [licensing](../LICENSE.md).
