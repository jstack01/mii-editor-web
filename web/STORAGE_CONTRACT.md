**Milestone 6.1 presentation update:** original-download buttons are removed from the normal interface. Exact pending input and pre-repair bytes remain retained internally; cancellation, explicit repair approval and export blocking are unchanged. Optional read-only loading and diagnostics live under Advanced details. See [REPAIR_UX.md](REPAIR_UX.md); the older button descriptions below are historical Phase 6 behavior.

# Browser storage and shared URLs — version 1

**Phase 6 update:** the original 148-hex current-character contract remains. Source-render-safe transport validation is not Wii certification; see [WII_PROFILE.md](WII_PROFILE.md). Unresolved records from saved data/URLs remain byte-exact and read-only, with explicit repair. Complete source-unsafe 74-byte records are quarantined for review while a safe fallback renders; they are not silently clamped or automatically written over. Highest-priority valid URL input still wins.

The application stores one current character, entirely locally. No account, backend, Flash storage, remote service participates. File imports use this same contract.

## Exact contract

- Key: **`mii-editor.character.v1`**, scoped by the browser's origin.
- Value: exactly **148 lowercase hexadecimal characters**, representing the existing **74 bytes / 37 big-endian words**. No JSON wrapper, extra metadata, timestamp, checksum or binary-format change.
- Input validation accepts uppercase or lowercase hex of exactly that length, then checks every one of the 45 numeric fields against its original declared range. Unknown/reserved bits, names' UTF-16 units, Mii ID and Wii ID bytes are preserved. Hex is canonicalized to lowercase; numeric values are never silently repaired.
- This strict transport validator is distinct from the unchanged original permissive `setHexData()` API. Wrong length, separators, whitespace, nonhex input and out-of-range known fields are invalid here.

Startup chooses a new default with the original appearance and a fresh normal/unknown-owner ID, then a valid saved character, then a valid **single `?mii=` parameter** at highest priority. Empty, malformed, duplicated or out-of-range URL values are ignored, with a visible status message; saved/default data remains usable. Storage access failures never prevent a valid URL or default from opening.

Initialization resolves precedence before it renders or writes anything. A valid URL import is saved as the final chosen character; it cannot be overwritten by an intermediate old local value. A saved/default startup does not write merely because the page opened. Invalid saved data is left untouched until a real valid edit or successful explicit import replaces it.

A successful explicit file/XML import also saves, even when its bytes equal the current character. Failed imports, cancelled selections and unchanged XML viewing do not write. Imports update the displayed share URL and an existing address-bar mii parameter using the same policy.

Every actual binary edit saves synchronously through localStorage: text, IDs, toggles, randomization, every tile/palette/option, and each changed integer slider value. No-op clamping, navigation and page browsing do not write. A failed read/write/getter is caught; the editor remains usable in memory and reports storage unavailability. A failure to read on startup keeps the status conservative until reload. The two additional Phase 6 keys are documented below; unrelated application keys are never read or deleted. No storage-event listener replaces an actively edited character; multiple tabs follow last successful writer wins. Private-browser cleanup and browser settings remain browser policy.

## Sharing and refresh

The original footer's read-only **Mii URL** field now displays a working URL generated from the current application's origin/path, preserving other query parameters and its fragment, with exactly one canonical `mii` parameter. Focus selects the complete URL for copying. It uses no historical miieditor.com service.

Opening that URL restores the exact binary, ahead of saved browser data. Editing an opened share updates both saved data and the address bar with `history.replaceState`, so a normal refresh restores the latest edit rather than the stale original parameter. A plain URL remains plain while editing; reload uses saved data. The displayed share field always contains the current data. If the browser blocks History API updates, the field still supplies the latest link; copy that link rather than relying on an unchanged address bar. There is no Clipboard API dependency, automatic external navigation or upload.

## Characterized original behavior and intentional changes

`ClassicGUI.as` starts from its default, then uses a truthy `LocalSharedStorage.getLocal()[0]`, then a truthy loader `mii` parameter. Those values go through the permissive original hex decoder. The new strict saved/URL validation is intentional and user-approved; legacy codec APIs remain unchanged.

`LocalSharedStorage.as` uses SharedObject `localMiis.data.miiArray`, wrapping a single value in an array and flushing it. Errors return false/null. The Flash editor ignores save failure results. `ClassicGUI.updateURLText()` both updates the URL field and saves; category entry and most edit handlers call it. **Size's `updateDataFromSliders()` does not**, so the avatar/data changes immediately while the old URL/save can remain stale until another action. The browser deliberately saves all valid edits consistently and reports actual storage failure.

Original Size updates **both** attributes from each thumb's floating-point position using `int(127 * getPercent())`. Reconstructing `x = 301 + 227 * value/127`, then computing `(x-301)/227 * 127`, can truncate some untouched values one unit lower. The browser preserves the original drag formula for the edited dimension and keeps the other dimension's bytes intact. Category entry and navigation never re-quantize either value. Evidence includes an exhaustive 0–127 characterization in `evidence/phase4b/legacy-slider-rounding.json`.

There is no automatic SharedObject/LSO migration, multi-character library, schema conversion, cross-device sync in this contract. File operations are documented in FILE_OPERATIONS.md. Those features are not represented as complete.


## Phase 6 auxiliary keys and recovery

- `mii-editor.id-sequence.v1`: decimal highest allocated 29-bit four-second logical slot. Used best-effort to avoid sequential reload duplicates. No console credential or system ID is stored. Unavailable storage leaves session deduplication working; concurrent-tab/global uniqueness is not guaranteed.
- `mii-editor.original.v1`: JSON `{hex, label}` containing the latest exact pre-repair 74-byte decoded record and a bounded label, not a multi-character library. Review may update this backup even when cancelled; it never changes the active character key. It survives reload and is available through **Download last pre-repair record (archival)**. A subsequent reviewed original replaces this one; retain source files for long-term archives.

If backup storage is unavailable, the record remains in memory and the review warns to download before closing. An original XML file/edited text is available in-memory for exact archival download during review; the persisted decoded record is not a lossless XML archive. Existing original files on disk are never modified.

No storage-event listener overwrites an active edit. Current character saves still follow last writer wins across tabs. ID high-water allocation is not atomic across tabs. A malformed/nonrecord stored value is ignored; a complete unsupported record is retained/quarantined with a visible review rather than rendered. Valid URL-imported records are not replaced by older local data during startup.
