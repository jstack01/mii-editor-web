# Third-party software notices

The project MIT grant is limited by LICENSE-SCOPE.json. Third-party code, licenses and historical material keep their own status. Existing detailed provenance remains in NOTICES.md; unresolved graphics/fonts/source rights are in ASSET_RIGHTS.md.

## Static website and launcher ZIPs

Vite 8.3.5 adds a small module-loading helper under its upstream MIT license; LICENSES/Vite-LICENSE.md retains its copyright/permission and bundled permissive notices. No production node_modules tree is included. The Python server and OS launcher wrappers use already-installed system tools; no Python/Windows/macOS/Linux interpreter or OS is bundled into the ZIPs.

TypeScript, Vitest, Playwright, Lightning CSS and remaining locked dependencies are development/build/test tools under their respective upstream MIT/Apache-2.0/ISC/BSD/MPL terms. Using Lightning CSS at build time does not by itself relicense application output as MPL. Copies of tools, their binaries or modified covered files must retain their own required terms if separately redistributed. No such tool package is included in this static website. The exact L1 lock inventory is retained in docs/licensing/L1/dependency-inventory.json, not as a substitute for upstream notices.

## Docker runtime

The image uses pinned upstream Nginx Unprivileged/Alpine. The standard project notices do not license that runtime as MIT. Component metadata, preserved upstream notices, license texts and exact source/recipe references are installed at `/usr/share/licenses/mii-editor-runtime/`; see CONTAINER_SOURCES.md for the prepared source-information archive and remaining limits. Nginx and the image project retain their original copyright/permissive/Apache notices. Alpine binary packages can include GPL/LGPL/MPL and other licensed parts, which retain their own terms and any corresponding-source obligations. Merely identifying source URLs or inheriting an upstream image is not proof of complete compliance.

## Reference tools

MiiJS and Dolphin/RFL/Java analysis references are not bundled into the editor or runtime ZIPs. Own wrappers do not claim their code or Nintendo resource rights. Do not redistribute external unlicensed reference source merely because optional analysis can fetch it. No NAND/game images, keys, SWFs or decompiled ActionScript are shipped.

## Attribution and status

Original Mii Editor: Trevor McCauley / senocular. Preservation sources: https://mii-editor.nekoweb.org/ and https://archive.org/details/mii-editor, not assumed owners of the underlying material. Unofficial; not affiliated with Nintendo. AI-generated/vibe-coded and unmaintained; no planned support, PR review or ongoing maintenance. Software format validation and limited Dolphin results do not certify physical Wii/game compatibility. Physical testing remains indefinitely deferred by owner decision.
