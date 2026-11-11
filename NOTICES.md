# Original Project and Credits

Original application and related materials were obtained from:

- https://mii-editor.nekoweb.org/
- https://archive.org/details/mii-editor

Both are credited as preservation/download sources, **not assumed to be the original developers**. The Nekoweb FAQ (https://mii-editor.nekoweb.org/faq.html) attributes the original editor to **senocular**, and the Internet Archive item's creator metadata independently lists senocular. Thank you to senocular for the historical application and to the preservation-site maintainer, uploader and archivists for keeping the materials accessible. Individual archivist identities have not been reliably established here; no identity is inferred from an uploader email address.

Nintendo's Mii characters, names and related properties belong to their respective rights holders. The historical Flash application, artwork, icons and embedded glyphs belong to their respective rights holders. This project claims no ownership of those materials and is not affiliated with or endorsed by Nintendo or the original developers.

## Unresolved redistribution rights

No explicit redistribution license or rightsholder permission was located in the supplied package, retrieved Nekoweb FAQ, or Internet Archive item metadata as reviewed on November 5, 2026. An archive's collection label or availability for download is not a license. The Nekoweb FAQ reports historical legal issues; that report has not been independently verified and is not presented as a legal finding.

**Removing SWFs and decompiled ActionScript does not remove the asset-rights concern.** The checked-in generated catalogs and prebuilt JavaScript still contain SVG/vector shapes, embedded glyph outlines and display data derived from the historical assets. Screenshots also depict those assets. Their redistribution, modification and commercial-use rights remain unresolved. The repository owner's publication approval is not a substitute for third-party permission. Confirm applicable rights before redistributing or building on those materials; no blanket MIT or other permission is asserted for them.

Eligible modern contributions now have a narrowly scoped MIT grant; see LICENSE.md and LICENSE-SCOPE.json. Files/portions outside that list have not been newly licensed. Forks and independent development are encouraged subject to applicable rights, licenses and platform terms. Public availability alone must not be described as an open-source license grant.

## Build tools and reference implementations

Vite produces the build's module-loading helper; its upstream license and bundled notices are retained in LICENSES/Vite-LICENSE.md. TypeScript, Vitest, Playwright and other development dependencies retain their own licenses in their installed packages; they are not distributed as runtime dependencies in the ready-to-run website.

Independent compatibility research used MiiJS 3.1.1 (https://github.com/Stewared/MiiJS, commit de10c3c5237fbf18da88ac860f5c0ac7ad1a3b4b) and RFL reference/decompilation evidence (https://github.com/doldecomp/ogws, commit e5a4d369011062fe243aa63f6c2e2853854c395d). Neither library nor its original source is included in the production website. Software acceptance is not physical Wii or game certification.

Older Git commits may include original materials. The current source tree and new release archives intentionally exclude the private original folders and recovery evidence. No Git history was rewritten.


## Docker runtime components

Only the Docker edition adds the upstream Nginx Unprivileged/Alpine runtime. Nginx retains its upstream COPYRIGHT in /usr/share/licenses/nginx/COPYRIGHT. The upstream unprivileged image project is Apache-2.0; its license, taken from the pinned base image source revision 679834d1aa245a42e680d380c6b57785cfaa2115, is preserved in LICENSES/Nginx-Unprivileged-LICENSE.txt in this source tree and /usr/share/licenses/nginx-unprivileged/LICENSE in the image. Other base OS components keep their upstream licensing. These component licenses do not license the new application code or historical graphics; the disclosures above remain unchanged. See docs/DOCKER.md for the selected base/version and source links.

## Scoped modern-code license and owner direction (L2)

The standard MIT license applies only to eligible contributions in LICENSE-SCOPE.json, to the extent rights are held. It does not cover historical art/glyphs, inherited source expression or third-party/Nintendo interests. The owner has elected to accept the existing historical-material risk without pursuing permission or replacing the artwork. Neither that choice nor responding to legitimate requests establishes rights or removes liability. Existing unresolved disclosures remain in effect. See ASSET_RIGHTS.md, THIRD_PARTY_NOTICES.md and CONTAINER_SOURCES.md.
