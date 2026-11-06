# Milestone 6.1 — repair review and footer branding

The Phase 6 baseline is local Git commit `d24e320`. This milestone changes presentation and roadmap only; it does not introduce a compatibility mode or alter the confirmed generation, calendar, ID, field, permutation, validation, repair or serialization rules. Original input bytes and the bounded pre-repair backup remain intact. No production dependency was added.

## Dialog

The native HTML dialog is outside the uniformly scaled 640×500 editor. It has a 640px maximum width, viewport-limited height, rounded panels, readable typography, a scrollable middle and a fixed footer. It adapts at narrow sizes and short heights; actions remain accessible while many repairs or advanced details scroll.

**Fix this Mii?** explains why adjustments are needed. A count and friendly Setting / Original / After fixes comparison replace raw identifiers and repeated warnings. Original and After fixes previews use the actual recovered SVG character scenes, fitted by their shared source bounds/camera into equal surfaces. Unsupported original features display “Preview unavailable”; no replacement artwork is invented. Preview-only geometry does not change character data or the existing file/image cameras.

**Apply fixes & load** remains an explicit transaction: guard against a changed active record, revalidate the proposed bytes, reserve the ID and commit. **Cancel** or Escape leaves the active model and character storage unchanged. Initial focus goes to Cancel; native modal inertness and a keyboard Tab loop keep focus inside, visible keyboard focus is styled, and close restores the invoking element or the recreated File dialog. Title/description associations, table headers, preview labels, live errors and a keyboard-focusable scrolling region support assistive technology.

The one main disclaimer reads: “This does not guarantee compatibility with every Wii console or game.” Relevant ownership, raw validation reasons, exact original/proposed hex and ordered changes remain under **Advanced details**. Optional **Load without fixing** is less prominent there, disabled for unsupported original graphics. Loaded unresolved records stay read-only and normal Save Mii stays blocked.

There are **no original-download buttons** in the dialog or normal footer. The selected original File/edited XML Blob remains retained internally during review; exact decoded original bytes remain in the existing bounded backup (`mii-editor.original.v1`). Cancellation does not replace the current character key. Source files on disk are never modified. XML decoded-byte backups are not a lossless original XML archive. Keep source files for archival use. Phase 6's historical archival-button tests/evidence remain in Git; current tests instead verify the requested button absence and exact internal preservation after cancellation/reload. Validation and export-blocking assertions remain.

## Branding boundaries

Recovered `classicGUI` evidence identifies:

- Root depth **229**, sprite **360** containing shape **359**, matrix `[0.11798095703125, 0, 0, 0.118072509765625, 515.95, 474.9]`: the small footer icon. Excluded from all 13 generated editor frames and dependencies.
- Root depth **231**, named **homepage**, button **362** (hit-test shape **361**): invisible website link. It was already excluded; remains absent, with no browser event/link/accessibility target. Original `ClassicGUI.as` binds it to `goToHomePage()` / historical website navigation.
- Root depth **228**, border shape **358**, third extracted path, fill **#666666**, source bounds approximately **(529.4, 478.9, 92.35, 10.4)**: entire website lettering. Only this path is omitted from the generated browser markup. The first path (border) and second path (URL gradient well) are retained exactly. The generator checks its expected unique path, and still verifies original SVG provenance hashes.
- URL text **363** and static URL label **364** remain at their original positions. No overlay rectangle is added.

Protected originals and machine-readable manifests remain unchanged; generated browser assets deliberately differ at those documented boundaries. Static vector lettering is verified by path identity rather than searching DOM text or relying on OCR. Browser checks additionally verify no icon/link definitions/instances, no historical link/accessibility target, and intact URL fields across all screens and production builds. Historical provenance remains in documentation.

## Coverage and scope

New unit checks cover labels, preview camera/data isolation, unsupported originals and exact branding exclusions. New Chrome browser tests cover 1100×900, 390×844 and 320×480 viewports; long Unicode filenames; many repairs; scrolling/pinned actions; keyboard focus/Tab/Escape; cancellation, explicit fixes, unresolved loading/export blocking and internal backups. Actual desktop/narrow screenshots are retained in `../evidence/milestone-6.1/`.

These are **desktop Chrome viewport tests**, not real-device/mobile-browser certification. Milestone 6.2 will install/test the additional engines and devices; 6.3 will package and verify static/Apache distribution. Neither is implemented here. Existing original font/nine-slice/antialiasing differences and Phase 7 ownership/global-ID/destination limitations remain documented in WII_PROFILE.md and PHASE7_VERIFICATION.md.
