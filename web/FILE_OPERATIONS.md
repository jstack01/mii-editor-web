# Local Mii and XML files — Phase 5A

Run `./dev.sh` from web/ and open http://127.0.0.1:5173/. File opens the recovered Files page. Load selects a local .mii/.xml; Save Mii requests a download. Done returns to the editor. Image export stays disabled until Phase 5B. No PHP, backend, historical service or upload is used.

XML opens the original editable page. Back validates and applies changed XML. Failed validation leaves the character and draft intact. Escape discards edits. **Save XML exports the current character, not unapplied text**, matching FileOptions.as: use Back, reopen XML, then Save to export edits. Viewing unchanged XML and returning preserves the binary; avoiding the original lossy reapplication is intentional. Source scroll arrows/dragging and native caret, wheel and horizontal scrolling work, with keyboard support.

## Data contract and deliberate differences

Binary files must be exactly 74 bytes and pass the existing original numeric-range validator. All bytes, reserved bits, IDs and UTF-16 name units survive. Length alone is insufficient: eyebrowY must be at least 3. Cancelled/rejected imports never replace the model. Pending reads are discarded after closing/navigating the dialog. Repeated selection works. Successful imports refresh the preview, selected controls, sharing/address parameter and browser persistence, even when the bytes are identical. Storage failures are nonfatal.

XML reuses miiXml.ts, retaining original field names/order, coercions, clamping and permutations. The boundary parses a fresh candidate and validates before committing. Original low-level reset/partial-mutation behavior is unchanged but deliberately not exposed to user imports. Missing numeric fields retain source reset behavior and may fail postvalidation, notably eyebrowY; missing name/creator and invalid roots fail. Embedded hex is ignored by the original codec. Applying edited/imported XML clears unknown/reserved bits: **use .mii for lossless binary backups**.

XML files are UTF-8 with fatal encoding errors and a 1 MiB limit; extensions are case-insensitive. These are explicit browser policies. Forbidden XML 1.0 characters/lone surrogates fail rather than silently changing data; binary export remains available. Unicode filenames are retained with path/control/OS-reserved characters sanitized, safe fallback and length limit. This does not alter payload names.

The textarea retains literal legacy DTD/stylesheet header text without activating it. Before DOMParser receives input, a quote-aware prolog filter removes external DTD/stylesheet metadata and rejects entity declarations/internal DTD subsets. XML downloads use a standalone UTF-8 declaration and omit remote header metadata, retaining the existing codec body/order. This deliberate difference avoids historical requests when opening saved XML elsewhere. External resources/entity expansion are not supported.

## Source graphics and verification

FileOptions.as, ScrollBar.as and recovered sprite 352 frames 2/3 drive the interface. The catalog adds 18 original symbols. Depth 156, backgrounds, source button states, label glyphs, coordinates, nesting, nine-slice grids and text placements remain. A glyph whose first edge has implicit origin (0,0) now starts there correctly, restoring the original X in XML. The preview uses the original 120 × 260 dimensions, scale 0.3 and BitmapUtils bounds centering with the complete SVG renderer. Scroll Y=40..304, parent-coordinate drag without grab offset and integer line mapping match source.

Source _typewriter font 335 embeds no glyphs. XML uses Courier New/monospace 10px/12px; Ruffle chooses different device-font/line metrics. These remain a visible discrepancy. Original bitmap versus SVG preview rasterization, prior nine-slice/gradient/hairline precision and antialiasing remain limits. Version text truthfully identifies Web at the source placement. Browser pickers/downloads, status outside the stage, Escape, focus and keyboard behavior are intentional adaptations.

Unmodified SWFs were captured in Ruffle 0.7.1 wgpu-webgl at native/2× density. Canvas fails BitmapData.draw for this preview; its failed capture is separately recorded. The original offline PHP alert was dismissed through its own UI without source changes or service stubs. Comparisons use source coordinates without fitted alignment. No Adobe Flash runtime or pixel-perfect parity is claimed. Firefox/WebKit executables remain unavailable; file checks ran in installed Chrome.

251 unit tests, existing XML/rendering/GUI/interaction suites, new development/production file suites, TypeScript/build and six Python recovery checks pass. Cases cover exact binary/reserved bits, invalid files, cancellation/stale reads, repeated operations, Unicode downloads, XML edit/apply/cancel/errors, unsafe declarations, current-character preservation, save-current behavior, persistence/share/refresh and offline operation without external requests. Evidence is in evidence/phase5a/. Diagnostics remain /diagnostics.html. Stop after Phase 5A; PNG/JPEG export is Phase 5B and tutorial remains deferred.

## Wii range warnings

Save Mii now adds a read-only warning in the existing status area for nonstandard Wii RCD ranges and applicable ID/calendar/padding cautions. It does not modify or block the downloaded bytes. Flash-compatible is distinct from Wii-compatible, and MiiJS acceptance is not hardware certification. See WII_COMPATIBILITY.md.
